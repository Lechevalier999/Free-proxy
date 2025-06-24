const express = require('express');
const fetch = require('node-fetch');

const app = express();
const PORT = 8080;

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

app.get('/proxy', async (req, res) => {
  const targetUrl = req.query.url;
  if (!targetUrl) {
    return res.status(400).send('Missing url parameter');
  }

  try {
    const response = await fetch(targetUrl, { method: 'GET' });
    // Copy original headers
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
  console.log(`CORS proxy running on http://localhost:${PORT}`);
});
