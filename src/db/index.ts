import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema.ts';

let db: ReturnType<typeof drizzle<typeof schema>> | null = null;
let activePool: pg.Pool | null = null;
let poolWrapper: pg.Pool | null = null;

let isPGBroken = false;
let lastPgCheck = 0;
let disablePGPermanently = false;

export function isDatabaseHealthy(): boolean {
  if (!process.env.SQL_HOST) return false;
  if (disablePGPermanently) return false;
  if (isPGBroken) {
    const now = Date.now();
    if (now - lastPgCheck > 300000) { // 5 minutos de cooldown para resiliência de produção
      isPGBroken = false;
      return true;
    }
    return false;
  }
  return true;
}

export function getDatabaseDiagnostics() {
  return {
    configured: !!process.env.SQL_HOST,
    host: process.env.SQL_HOST || 'Nenhum',
    isPGBroken,
    disablePGPermanently,
    activeDriver: isDatabaseHealthy() ? 'PostgreSQL (Cloud SQL)' : 'JSON Local (Fallback Resiliente)',
    cooldownRemainingMs: isPGBroken ? Math.max(0, 300000 - (Date.now() - lastPgCheck)) : 0
  };
}

export function markDatabaseAsBroken(err?: any) {
  if (err) {
    const errMsg = String(err.message || '').toLowerCase();
    const errCode = String(err.code || '').toLowerCase();
    const errStack = String(err.stack || '').toLowerCase();
    const isConnErr = isConnectionError(err);
    if (errCode === 'enoent' || errMsg.includes('enoent') || errStack.includes('enoent') || isConnErr) {
      disablePGPermanently = true;
      console.warn('❌ Erro crítico ou de conexão de rede detectado no PostgreSQL. O banco de dados foi desativado PERMANENTEMENTE para esta sessão para evitar travamentos, latências e lentidão no servidor.', err);
      return;
    }
  }
  if (!isPGBroken) {
    isPGBroken = true;
    lastPgCheck = Date.now();
    console.warn('⚠️ PostgreSQL marcado temporariamente como inativo devido a erros consecutivos de conexão. Utilizando fallback local.');
  }
}

function createRealPool(): pg.Pool {
  const host = process.env.SQL_HOST;
  const user = process.env.SQL_USER;
  const password = process.env.SQL_PASSWORD;
  const database = process.env.SQL_DB_NAME;

  if (!host || !user || !password || !database) {
    console.warn('⚠️ Variáveis SQL_HOST, SQL_USER, SQL_PASSWORD ou SQL_DB_NAME incompletas. Operações do PostgreSQL falharão.');
    throw new Error('SQL_CREDENTIALS_MISSING');
  }

  const newPool = new pg.Pool({
    host,
    user,
    password,
    database,
    max: 5,
    idleTimeoutMillis: 5000,
    connectionTimeoutMillis: 5000,
    keepAlive: true,
  });

  newPool.on('error', (err) => {
    console.error('Erro inesperado no pool do PostgreSQL:', err);
  });

  return newPool;
}

function isConnectionError(err: any): boolean {
  if (!err) return false;
  
  let current = err;
  const visited = new Set<any>();
  
  while (current && !visited.has(current)) {
    visited.add(current);
    const msg = (current.message || '').toLowerCase();
    const code = String(current.code || '').toLowerCase();
    const stack = (current.stack || '').toLowerCase();
    
    const isConn = (
      msg.includes('connection terminated unexpectedly') ||
      msg.includes('terminated unexpectedly') ||
      msg.includes('broken pipe') ||
      msg.includes('econnreset') ||
      msg.includes('connection lost') ||
      msg.includes('enoent') ||
      msg.includes('econnrefused') ||
      msg.includes('connect enoent') ||
      msg.includes('etimedout') ||
      msg.includes('connection terminated') ||
      msg.includes('could not connect') ||
      stack.includes('connection terminated unexpectedly') ||
      stack.includes('terminated unexpectedly') ||
      stack.includes('econnrefused') ||
      stack.includes('econnreset') ||
      code === '57p01' || // admin_shutdown
      code === '57p02' || // crash_shutdown
      code === '57p03' || // cannot_connect_now
      code === 'enoent' ||
      code === 'econnrefused' ||
      code === 'econnreset' ||
      code === 'etimedout'
    );
    
    if (isConn) return true;
    
    if (current.cause) {
      current = current.cause;
    } else {
      break;
    }
  }
  return false;
}

function handleReconnection() {
  console.warn('🔄 Reiniciando pool do PostgreSQL devido a falha de conexão...');
  if (activePool) {
    const oldPool = activePool;
    activePool = null;
    oldPool.end().catch(() => {});
  }
  try {
    activePool = createRealPool();
    console.log('✅ Novo pool do PostgreSQL instanciado com sucesso.');
  } catch (err) {
    console.error('❌ Falha ao recriar o pool do PostgreSQL:', err);
    activePool = null;
  }
}

function wrapClient(client: pg.PoolClient): pg.PoolClient {
  return new Proxy(client, {
    get(target, prop, receiver) {
      if (prop === 'query') {
        return async function(this: any, ...args: any[]) {
          try {
            return await client.query.apply(client, args as any);
          } catch (err: any) {
            console.warn('⚠️ Erro detectado em query executada no cliente. Marcando DB como inativo.', err);
            markDatabaseAsBroken(err);
            throw err;
          }
        };
      }
      const value = Reflect.get(target, prop, receiver);
      return typeof value === 'function' ? value.bind(target) : value;
    }
  }) as any;
}

export function getDB() {
  if (!db) {
    // Inicializa o activePool real
    try {
      activePool = createRealPool();
    } catch (e) {
      // Se não conseguir criar o pool por falta de credenciais, repassa o erro
      throw e;
    }

    // Cria o wrapper do pool usando Proxy para interceptar as chamadas do Drizzle
    poolWrapper = new Proxy(activePool, {
      get(target, prop, receiver) {
        // Intercepta a chamada de query para o pool
        if (prop === 'query') {
          return async function(this: any, ...args: any[]) {
            let attempts = 0;
            while (attempts < 2) {
              try {
                if (!activePool) {
                  activePool = createRealPool();
                }
                return await activePool.query.apply(activePool, args as any);
              } catch (err: any) {
                attempts++;
                if (attempts < 2) {
                  console.warn(`⚠️ Erro de conexão ou execução na query (tentativa ${attempts}). Reconectando...`);
                  handleReconnection();
                  continue;
                }
                console.warn(`❌ Erro persistente na query. Marcando banco de dados como inativo.`, err);
                markDatabaseAsBroken(err);
                throw err;
              }
            }
          };
        }

        // Intercepta a chamada de connect para obter clientes
        if (prop === 'connect') {
          return async function(this: any, ...args: any[]) {
            let attempts = 0;
            while (attempts < 2) {
              try {
                if (!activePool) {
                  activePool = createRealPool();
                }
                const client = await activePool.connect.apply(activePool, args as any);
                return wrapClient(client);
              } catch (err: any) {
                attempts++;
                if (attempts < 2) {
                  console.warn(`⚠️ Erro de conexão ou execução no connect (tentativa ${attempts}). Reconectando...`);
                  handleReconnection();
                  continue;
                }
                console.warn(`❌ Erro persistente no connect. Marcando banco de dados como inativo.`, err);
                markDatabaseAsBroken(err);
                throw err;
              }
            }
          };
        }

        // Para os demais métodos (como end, on, etc), delega para o activePool se existir
        const currentPool = activePool || target;
        const value = Reflect.get(currentPool, prop);
        return typeof value === 'function' ? value.bind(currentPool) : value;
      }
    }) as any;

    db = drizzle(poolWrapper!, { schema });
  }
  return db;
}

export function closeDB() {
  if (activePool) {
    activePool.end().catch(() => {});
    activePool = null;
  }
  poolWrapper = null;
  db = null;
}
