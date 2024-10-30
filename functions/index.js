require('dotenv').config();
const express = require('express');
const multer = require('multer');
const admin = require('firebase-admin');
const path = require('path');
const functions = require('firebase-functions'); 

const app = express();

// Firebase Admin SDK initialization
const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'capstonewebf.appspot.com', 
});

const bucket = admin.storage().bucket();


app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname, '../public')));
app.use(express.urlencoded({ extended: true }));


const storage = multer.memoryStorage();
const upload = multer({ storage });

// Routes
app.get('/', (req, res) => {
  res.render('index');
});
app.get('/test', (req, res) => {
  res.send('Test Route Working!');
});


app.post('/upload', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }

  const blob = bucket.file(req.file.originalname);
  const blobStream = blob.createWriteStream({
    resumable: false,
  });

  blobStream.on('error', (err) => {
    console.error(err);
    return res.status(500).send('Unable to upload file.');
  });

  blobStream.on('finish', () => {
    res.send('File uploaded successfully!');
  });

  blobStream.end(req.file.buffer);//test
});


exports.app = functions.https.onRequest(app);