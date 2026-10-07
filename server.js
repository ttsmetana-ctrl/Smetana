const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DB_FILE = path.join(__dirname, 'ips.json');

// Хранилище IP в памяти
let visitedIps = new Set();

// Загружаем сохраненные IP при запуске сервера
if (fs.existsSync(DB_FILE)) {
  try {
    const data = fs.readFileSync(DB_FILE, 'utf8');
    visitedIps = new Set(JSON.parse(data));
  } catch (err) {
    console.error('Ошибка чтения db.json:', err);
  }
}

app.use(express.static('public'));

app.get('/api/visit', (req, res) => {
  // Определяем IP пользователя
  const userIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket.remoteAddress;

  // Если IP еще не заходил — добавляем его и сохраняем файл
  if (!visitedIps.has(userIp)) {
    visitedIps.add(userIp);
    fs.writeFile(DB_FILE, JSON.stringify([...visitedIps], null, 2), (err) => {
      if (err) console.error('Ошибка записи файла:', err);
    });
  }

  // Возвращаем общее количество уникальных визитов
  res.json({ count: visitedIps.size });
});

app.listen(PORT, () => {
  console.log(`Сервер запущен на http://localhost:${PORT}`);
});
