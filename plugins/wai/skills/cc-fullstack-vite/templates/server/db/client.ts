import postgres from 'postgres';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

const ssl = process.env['NODE_ENV'] === 'production' ? 'require' : false;
const sql = postgres(databaseUrl, { ssl });

export { sql };
