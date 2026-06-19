const express = require('express');
const pool = require('./db');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.urlencoded({ extended: true }));

// 📸 multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// 🔥 IMPORTANTE: servir imagens
app.use('/uploads', express.static('uploads'));

// ==========================
// 📌 ROTAS
// ==========================

// criar item
app.post('/items', upload.single('imagem'), async (req, res) => {
  try {
    const {
      title,
      cor,
      data,
      marca,
      dataFab,
      categoria,
      description,
      type,
      location,
      user_id,
      contato,
      nome
    } = req.body;

    const imagem = req.file ? req.file.filename : null;

    const newItem = await pool.query(
      `INSERT INTO items 
      (title, cor, data, marca, dataFab, categoria, description, type, location, user_id, imagem, contato, nome)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
      RETURNING *`,
      [title, cor, data, marca, dataFab, categoria, description, type, location, user_id, imagem, contato, nome]
    );

    res.json(newItem.rows[0]);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao criar item');
  }
});

// buscar itens
app.get('/items', async (req, res) => {
  try {
    const { busca, local, categoria, marca } = req.query;

    let query = 'SELECT * FROM items WHERE 1=1';
    let valores = [];

    if (busca && busca !== '') {
      valores.push(`%${busca}%`);
      query += ` AND (
        title ILIKE $${valores.length}
        OR description ILIKE $${valores.length}
        OR marca ILIKE $${valores.length}
      )`;
    }

    if (local && local !== '') {
      valores.push(local);
      query += ` AND location = $${valores.length}`;
    }

    if (categoria && categoria !== '') {
      valores.push(categoria);
      query += ` AND categoria = $${valores.length}`;
    }

    if (marca && marca !== '') {
      valores.push(`%${marca}%`);
      query += ` AND marca ILIKE $${valores.length}`;
    }

    query += ' ORDER BY id DESC';

    const items = await pool.query(query, valores);
    res.json(items.rows);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro ao buscar itens');
  }
});

// 🚀 iniciar servidor (UMA VEZ SÓ)
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
