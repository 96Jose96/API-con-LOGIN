const express = require('express');
const session = require('express-session');
const router = require('./routes/routes');
const hashedSecret = require('./crypto/config');

const app = express();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: hashedSecret,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false },
}));

app.use('/', router);

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en: http://localhost:${PORT}`);
});
