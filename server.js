// server.js
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();

let lastData = null;

async function fetchLeaderboard() {
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.goto('https://leaderboard.popcat.click/', { waitUntil: 'networkidle0' });

  const data = await page.evaluate(() => {
    return window.__NUXT__.state.leaderboard; 
    // Ember/Vue/Nuxt framework: data je dostupná v global stavu
  });

  await browser.close();
  lastData = data;
  console.log('✔ Fetched', data.length, 'entries');
}

fetchLeaderboard();
setInterval(fetchLeaderboard, 10000); // refresh co 10 s

app.get('/data', (req, res) => {
  if (!lastData) return res.status(503).json({ error: 'No data yet' });
  res.json(lastData);
});

app.use(express.static('public')); // podání HTML + JS z public/

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server běží na http://localhost:${port}`);
});
