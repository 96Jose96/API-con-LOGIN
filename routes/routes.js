const express = require('express');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const hashedSecret = require('../crypto/config');
const verifyToken = require('../middlewares/authMiddleware');
const users = require('../data/users');

const router = express.Router();


const apiUrlBase = 'http://localhost:4000';


router.get('/', (req, res) => {
  const token = req.session.token;

  if (token) {
    const decoded = jwt.verify(token, hashedSecret);
    return res.send(`
      <h1>Bienvenido, Usuario ${decoded.id}</h1>
      <a href="/search">Ir a buscar personajes</a><br><br>
      <form action="/logout" method="post">
        <button type="submit">Cerrar sesión</button>
      </form>
    `);
  }

  res.send(`
    <h1>Iniciar Sesión</h1>
    <form action="/login" method="post">
      <label for="username">Usuario</label>
      <input type="text" id="username" name="username" required><br><br>
      <label for="password">Contraseña</label>
      <input type="password" id="password" name="password" required><br><br>
      <button type="submit">Iniciar sesión</button>
    </form>
  `);
});

router.post('/login', (req, res) => {
  const { username, password } = req.body;
  const user = users.find(user => user.username === username && user.password === password);

  if (!user) {
    return res.status(401).json({ mensaje: 'Credenciales incorrectas' });
  }

  const token = jwt.sign({ id: user.id }, hashedSecret, { expiresIn: '1h' });
  req.session.token = token;
  res.redirect('/');
});

router.get('/search', verifyToken, (req, res) => {
  res.send(`
    <h1>Buscar Personaje</h1>
    <form action="/characters" method="get">
      <input type="text" id="characterName" name="name" placeholder="Nombre del personaje" required>
      <button type="submit">Buscar</button>
    </form>
    <form action="/logout" method="post">
      <button type="submit">Cerrar sesión</button>
    </form>
  `);
});

router.get('/characters', verifyToken, async (req, res) => {
  try {
    const response = await axios.get(`${apiUrlBase}/characters`);
    const data = response.data;

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al obtener los personajes" });
  }
});


router.get("/characters/:name", async (req, res) => {
  const characterName = req.params.name;
  console.log(`Buscando personajes con nombre que contenga: ${characterName}`);

  try {
    const response = await axios.get(`${urlBase}/?name=${characterName}`);
    const data = response.data.results;

    const filteredCharacters = data.filter(character =>
      character.name.toLowerCase().includes(characterName.toLowerCase())
    );

    if (!filteredCharacters) {
      return res.status(404).json({ mensaje: 'No se encontraron personajes con ese nombre' });
    }

    const characterData = filteredCharacters.map(character => {
      const { name, status, species, gender, image, origin: { name: origin } } = character;
      return { name, status, species, gender, image, origin };
    });

    res.json(characterData);

  } catch (err) {
    console.error(err);
    res.status(500).json({ mensaje: "Error al buscar los personajes" });
  }
});


router.post('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

module.exports = router;
