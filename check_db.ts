import pg from 'pg';

async function testConfig(name: string, config: pg.ClientConfig) {
  console.log(`\nTesting: ${name}...`);
  const client = new pg.Client(config);
  try {
    await client.connect();
    console.log(`[${name}] Connected successfully!`);
    
    console.log(`[${name}] Running SELECT 1...`);
    const res = await client.query('SELECT 1 as val');
    console.log(`[${name}] Query succeeded! val =`, res.rows[0].val);
    
    await client.end();
  } catch (err: any) {
    console.error(`[${name}] Failed:`);
    console.error('Message:', err.message);
    console.error('Code:', err.code);
    try {
      await client.end();
    } catch {}
  }
}

async function main() {
  const host = process.env.SQL_HOST;
  const database = process.env.SQL_DB_NAME;

  await testConfig('App User', {
    host,
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    database,
  });

  await testConfig('Admin User', {
    host,
    user: process.env.SQL_ADMIN_USER,
    password: process.env.SQL_ADMIN_PASSWORD,
    database,
  });
}

main().catch(console.error);
