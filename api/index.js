const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

const app = express();
const port = 3000;
const cors = require('cors');
app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const jwt = require('jsonwebtoken');

mongoose.connect('mongodb+srv://10tabassum2:Tabassum@cluster0.35w7xti.mongodb.net/test', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((err) => {
  console.log('Error Connecting to MongoDB:', err);
});

app.listen(port, () => {
  console.log('Server is running on port 3000');
});