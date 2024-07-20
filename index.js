const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const { main: downloadImages } = require('./urltodownload');
const { main: generateImage } = require('./image_generation');

const app = express();
const port = 4400;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.post('/send-email', async (req, res) => {
  try {
    const email = req.body.email;
    console.log(`Received email: ${email}`);
    await downloadImages(email);
    res.status(200).send({ message: 'Email received and images downloaded', email });
  } catch (error) {
    res.status(500).send({ error: `Error downloading images: ${error.message}` });
  }
});

app.post('/moodboard', async (req, res) => {
  try {
    console.log('Generating image...');
    await generateImage();
    console.log('Image generation completed.');
    
    const imagePath = path.resolve(__dirname, 'images/generatedImage.png');
    console.log(`Looking for image at: ${imagePath}`);
    
    if (fs.existsSync(imagePath)) {
      console.log(`Image found: ${imagePath}`);
      res.sendFile(imagePath, err => {
        if (err) {
          console.error(`Error sending image: ${err.message}`);
          res.status(500).send({ error: `Error sending image: ${err.message}` });
        } else {
          console.log(`Image successfully sent: ${imagePath}`);
        }
      });
    } else {
      console.error('Image not found');
      res.status(404).send({ error: 'Image not found' });
    }
  } catch (error) {
    console.error(`Error generating image: ${error.message}`);
    res.status(500).send({ error: `Error generating image: ${error.message}` });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
