const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path'); 
const authRoutes = require('./routes/auth');
const homeRoutes = require('./routes/Home');
const quickNotesRoutes = require('./routes/quickNotes');
const myLibraryRoutes = require('./routes/myLibrary');
const shelveRoutes = require('./routes/shelve');
const quoteRoutes = require('./routes/quote');
const reportRoutes = require('./routes/report');
const noteRoutes = require('./routes/note');

require('dotenv').config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use(express.static(path.join(__dirname, '../client/build')));

// app.get('*', (req, res) => {
//   res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
// });

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use('/api/auth', authRoutes);
app.use('/api/home', homeRoutes);
app.use('/api/report-issue', reportRoutes);
app.use('/api/quick-notes', quickNotesRoutes);
app.use('/api/my-library', myLibraryRoutes);
app.use('/api/my-shelve', shelveRoutes);
app.use('/api/quote', quoteRoutes);
app.use('/api/note', noteRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
