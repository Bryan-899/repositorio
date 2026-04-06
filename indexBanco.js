const pool = require('./db');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Conectado:', res.rows);
  } catch (err) {
    console.error('Erro:', err);
  }
}

test();