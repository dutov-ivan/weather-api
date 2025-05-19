// Utility for e2e tests to fetch a subscription by email from the DB
const { Client } = require('pg');

async function getConfirmationTokenByEmail(email) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });
  await client.connect();
  const res = await client.query(
    'SELECT "confirmationCode" FROM subscription WHERE email = $1 ORDER BY id DESC LIMIT 1',
    [email],
  );
  await client.end();
  return res.rows[0]?.confirmationCode;
}

module.exports = { getConfirmationTokenByEmail };
