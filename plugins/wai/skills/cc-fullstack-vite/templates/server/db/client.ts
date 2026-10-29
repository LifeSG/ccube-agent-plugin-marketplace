import postgres from 'postgres';

const databaseUrl = process.env['DATABASE_URL'];
if (!databaseUrl) {
  console.error('DATABASE_URL is not set');
  process.exit(1);
}

// In production, verify the server certificate and hostname. 'require' in
// postgres.js encrypts but skips verification (rejectUnauthorized: false).
// Set DATABASE_CA to a PEM bundle when the provider uses a private CA.
const databaseCa = process.env['DATABASE_CA'];
const ssl =
  process.env['NODE_ENV'] === 'production'
    ? databaseCa
      ? { ca: databaseCa, rejectUnauthorized: true }
      : 'verify-full'
    : false;
const sql = postgres(databaseUrl, { ssl });

export { sql };
