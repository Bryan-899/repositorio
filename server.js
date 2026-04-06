const express = require('express');
const pool = require('./db'); // seu db.js que já conecta ao PostgreSQL
const cors = require('cors');
const app = express();
app.use(express.json()); // permite receber JSON no body
app.use(cors());
const PORT = 3000;

// Rota de teste
app.get('/', (req, res) => {
  res.send('API está funcionando!');
});

// Criar usuário
app.post('/users', async (req, res) => {
  try {
    const { name, email } = req.body;
    const newUser = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [name, email]
    );
    res.json(newUser.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Listar usuários
app.get('/users', async (req, res) => {
  try {
    const allUsers = await pool.query('SELECT * FROM users');
    res.json(allUsers.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});
app.post('/items', async (req, res) => {
  try {
    const { title, description, type, location, user_id } = req.body;

    const newItem = await pool.query(
      `INSERT INTO items (title, description, type, location, user_id)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description, type, location, user_id]
    );

    res.json(newItem.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao criar item');
  }
});
app.get('/items', async (req, res) => {
  try {
    const items = await pool.query('SELECT * FROM items ORDER BY id DESC');
    res.json(items.rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao buscar itens');
  }
});
// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});