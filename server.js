// server.js
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { main: downloadImages } = require('./urltodownload');
const { main: generateImage } = require('./image_generation');

const app = express();
const port = 4100;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

let email = null;

app.post('/send-email', async (req, res) => {
  try {
    email = req.body.email;
    console.log(`Received email: ${email}`);
    await downloadImages(email);
    res.status(200).send({ message: 'Email received and images downloaded', email });
  } catch (error) {
    res.status(500).send({ error: `Error downloading images: ${error.message}` });
  }
});

app.post('/moodboard', async (req, res) => {
  try {
    await generateImage();
    const imagePath = path.resolve(__dirname, 'generatedImage.png');
    if (fs.existsSync(imagePath)) {
      res.sendFile(imagePath);
    } else {
      res.status(404).send({ error: 'Image not found' });
    }
  } catch (error) {
    res.status(500).send({ error: `Error generating image: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
