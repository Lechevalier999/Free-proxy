const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.static(path.join(__dirname, '..')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, Cookie');
  res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD');
  res.header('Access-Control-Allow-Credentials', 'true');
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});

app.all('/proxy', async (req, res) => {
  const targetUrl = req.query.url || req.body.url;
  if (!targetUrl) return res.status(400).send('Missing url parameter');

  // Build fetch options
  const fetchOptions = {
    method: req.method,
    headers: Object.assign({}, req.headers),
    redirect: 'follow',
  };

  delete fetchOptions.headers['host'];

  if (req.method !== 'GET' && req.method !== 'HEAD' && req.body) {
    if (req.is('application/json')) {
      fetchOptions.body = JSON.stringify(req.body);
    } else if (req.is('application/x-www-form-urlencoded')) {
      fetchOptions.body = new URLSearchParams(req.body).toString();
    } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
      fetchOptions.body = req.body;
    }
  }

  try {
    const proxyRes = await fetch(targetUrl, fetchOptions);

    res.status(proxyRes.status);
    proxyRes.headers.forEach((value, name) => {
      if (name.toLowerCase() === 'set-cookie') {
        // Forward all Set-Cookie headers
        res.append('set-cookie', value);
      } else {
        res.setHeader(name, value);
      }
    });

    proxyRes.body.pipe(res);
  } catch (err) {
    res.status(500).send('Error fetching target: ' + err.message);
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../Search bar.html'));
});

app.listen(PORT, () => {
  console.log(`Proxy running on port ${PORT}`);
});
