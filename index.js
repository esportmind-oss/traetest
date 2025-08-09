const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// Import semua route dari folder backend/src/routes
const userRoutes = require('./backend/src/routes/userRoutes');
const customerRoutes = require('./backend/src/routes/customerRoutes');
const meterRoutes = require('./backend/src/routes/meterRoutes');
const reportRoutes = require('./backend/src/routes/reportRoutes');

// Gunakan semua route
app.use('/users', userRoutes);
app.use('/customers', customerRoutes);
app.use('/meters', meterRoutes);
app.use('/reports', reportRoutes);

app.get('/', (req, res) => {
  res.send('Aplikasi berhasil dijalankan!');
});

app.listen(port, () => {
  console.log(`Server berjalan di http://localhost:${port}`);
});
