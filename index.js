const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const morgan = require('morgan');
const cors = require('cors');
const cookieParser = require('cookie-parser');


dotenv.config();

const authRoutes = require('./routes/authRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(morgan('dev'));

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URL)
.then(() => {
    console.log('MongoDB connected.');

    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});

app.use('/api/auth', authRoutes);

app.get('/', (_req, res) => {
    res.send('This is the Authentication Service portal.');
});