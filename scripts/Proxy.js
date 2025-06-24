const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Search bar.html'));
});

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) return res.status(400).send('Missing url parameter');
  try {
    const response = await fetch(targetUrl, { method: 'GET' });
    response.headers.forEach((value, name) => {
      res.setHeader(name, value);
    });
    const body = await response.buffer();
    res.send(body);
  } catch (err) {
    res.status(500).send('Error fetching target: ' + err.message);
  }
});

app.listen(PORT, () => {
  console.log(`CORS proxy running on port ${PORT}`);
});
