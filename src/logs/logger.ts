import { getDB } from '../db/index.ts';
import { systemLogs } from '../db/schema.ts';

export async function logInfo(message: string, agentId?: string) {
  const timestamp = new Date().toLocaleString('pt-BR');
  console.log(`[INFO] [${timestamp}]${agentId ? ` [Agente: ${agentId}]` : ''} ${message}`);
  
  try {
    const db = getDB();
    await db.insert(systemLogs).values({
      level: 'info',
      agentId: agentId || null,
      message,
    });
  } catch (err) {
    // Falha silenciosa caso o banco não esteja conectado
  }
}

export async function logWarn(message: string, agentId?: string) {
  const timestamp = new Date().toLocaleString('pt-BR');
  console.warn(`[WARN] [${timestamp}]${agentId ? ` [Agente: ${agentId}]` : ''} ${message}`);
  
  try {
    const db = getDB();
    await db.insert(systemLogs).values({
      level: 'warn',
      agentId: agentId || null,
      message,
    });
  } catch (err) {
    // Falha silenciosa
  }
}

export async function logError(message: string, agentId?: string, error?: any) {
  const timestamp = new Date().toLocaleString('pt-BR');
  const fullMessage = error ? `${message} | Detalhes: ${error?.message || error}` : message;
  console.error(`[ERROR] [${timestamp}]${agentId ? ` [Agente: ${agentId}]` : ''} ${fullMessage}`);
  
  try {
    const db = getDB();
    await db.insert(systemLogs).values({
      level: 'error',
      agentId: agentId || null,
      message: fullMessage,
    });
  } catch (err) {
    // Falha silenciosa
  }
}
