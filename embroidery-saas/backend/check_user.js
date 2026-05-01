const { Client } = require('pg');
require('dotenv').config();
const client = new Client({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});
client.connect().then(() => client.query("SELECT email, role FROM users WHERE email = 'demo@aa.com'")).then(res => {
  console.log(res.rows);
  client.end();
}).catch(err => {
  console.error(err);
  client.end();
});
