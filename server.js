const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcrypt');
const session = require('express-session');
const path = require('path');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({ secret: 'secret-key', resave: false, saveUninitialized: true }));

const db = new sqlite3.Database('./cafe.db');

db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY, username TEXT UNIQUE, password TEXT)`);
  db.run(`CREATE TABLE IF NOT EXISTS branches (
    id INTEGER PRIMARY KEY,
    name TEXT,
    address TEXT,
    phone TEXT,
    lat REAL,
    lon REAL
  )`);

  const branches = [
    { name: 'Roma Norte', address: 'Córdoba 113, Roma Norte, CDMX', phone: '+52 55 1234 5678', lat: 19.418, lon: -99.16 },
    { name: 'Centro', address: 'Independencia 64, Centro, CDMX', phone: '+52 55 8765 4321', lat: 19.426, lon: -99.127 },
    { name: 'Florida', address: 'Insurgentes Sur 1942, Florida, Álvaro Obregón, CDMX', phone: '+52 55 5203 3426', lat: 19.36, lon: -99.183 },
    { name: 'Coyoacán', address: 'Miguel Ángel de Quevedo 486, Santa Catarina, Coyoacán, CDMX', phone: '+52 55 5554 2763', lat: 19.347, lon: -99.162 },
    { name: 'Narvarte', address: 'Esperanza 910, Narvarte Poniente, CDMX', phone: '+52 55 5578 8052', lat: 19.4, lon: -99.157 },
    { name: 'Polanco', address: 'Av. Presidente Masaryk 123, Polanco, CDMX', phone: '+52 55 9876 5432', lat: 19.431, lon: -99.199 },
    { name: 'Condesa', address: 'Amsterdam 240, Condesa, CDMX', phone: '+52 55 4321 8765', lat: 19.411, lon: -99.168 }
  ];
  const stmt = db.prepare('INSERT OR IGNORE INTO branches (name, address, phone, lat, lon) VALUES (?, ?, ?, ?, ?)');
  branches.forEach(b => stmt.run(b.name, b.address, b.phone, b.lat, b.lon));
  stmt.finalize();
});

// Middleware de autenticación (solo para checkout)
function isAuthenticated(req, res, next) {
  if (req.session.user) return next();
  res.redirect('/login');
}

// Rutas públicas
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public/index.html')));
app.get('/menu', (req, res) => res.sendFile(path.join(__dirname, 'public/menu.html')));
app.get('/snacks', (req, res) => res.sendFile(path.join(__dirname, 'public/snacks.html')));
app.get('/mezclas', (req, res) => res.sendFile(path.join(__dirname, 'public/mezclas.html')));
app.get('/tisanas', (req, res) => res.sendFile(path.join(__dirname, 'public/tisanas.html')));
app.get('/sucursales', (req, res) => res.sendFile(path.join(__dirname, 'public/sucursales.html')));

app.get('/branches', (req, res) => {
  db.all('SELECT * FROM branches', (err, rows) => res.json(rows));
});

app.get('/is-logged', (req, res) => res.json(!!req.session.user));

// Rutas de auth
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public/login.html')));
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.get('SELECT * FROM users WHERE username = ?', [username], (err, user) => {
    if (user && bcrypt.compareSync(password, user.password)) {
      req.session.user = username;
      res.redirect('/');
    } else {
      res.send('Credenciales inválidas. <a href="/login">Intenta de nuevo</a>');
    }
  });
});

app.get('/register', (req, res) => res.sendFile(path.join(__dirname, 'public/register.html')));
app.post('/register', (req, res) => {
  const { username, password } = req.body;
  const hashed = bcrypt.hashSync(password, 10);
  db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashed], (err) => {
    if (err) return res.send('Nombre de usuario en uso. <a href="/register">Intenta de nuevo</a>');
    res.redirect('/login');
  });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Ruta protegida para compra
app.get('/checkout', isAuthenticated, (req, res) => res.sendFile(path.join(__dirname, 'public/checkout.html')));

app.listen(3000, () => console.log('Servidor corriendo en http://localhost:3000'));