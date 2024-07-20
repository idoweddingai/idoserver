const fs = require('fs');
const path = require('path');
const axios = require('axios');
const db = require('./firebase');

const getLinks = async (email) => {
  console.log(`Fetching links for email: ${email}`);
  const collectionName = `${email} Links`;
  try {
    const linksRef = db.collection(collectionName);
    const snapshot = await linksRef.get();

    if (snapshot.empty) {
      console.log('No links found.');
      return [];
    }

    const links = [];
    snapshot.forEach(doc => {
      links.push(doc.data());
    });
    return links;
  } catch (error) {
    console.error(`Error fetching links from Firestore: ${error}`);
    throw error;
  }
};

const downloadImage = async (url, savePath) => {
  try {
    const response = await axios({
      url,
      responseType: 'stream'
    });

    if (response.status === 200) {
      const writer = fs.createWriteStream(savePath);
      response.data.pipe(writer);
      return new Promise((resolve, reject) => {
        writer.on('finish', resolve);
        writer.on('error', reject);
      });
    } else {
      console.log(`Failed to retrieve the image. Status code: ${response.status}`);
    }
  } catch (error) {
    console.error(`An error occurred while downloading the image: ${error}`);
    throw error;
  }
};

// Create the directory in the same directory as the script
const imagesDir = path.resolve(__dirname, 'images');

if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir);
}

const main = async (email) => {
  try {
    const links = await getLinks(email);
    if (links.length > 0) {
      const firstLink = links[0];
      let url = firstLink.url || 'URL not found';
      console.log(`Downloading first image from: ${url}`);
      await downloadImage(url, path.resolve(imagesDir, 'downloadedImage1.png'));

      if (links.length > 1) {
        const secondLink = links[1];
        url = secondLink.url || 'URL not found';
        console.log(`Downloading second image from: ${url}`);
        await downloadImage(url, path.resolve(imagesDir, 'downloadedImage2.png'));
      }

      if (links.length > 2) {
        const thirdLink = links[2];
        url = thirdLink.url || 'URL not found';
        console.log(`Downloading third image from: ${url}`);
        await downloadImage(url, path.resolve(imagesDir, 'downloadedImage3.png'));
      }
    } else {
      console.log('No links found.');
    }
  } catch (error) {
    console.error(`Error in main execution: ${error}`);
    process.exit(1);
  }
};

if (require.main === module) {
  const email = process.argv[2];
  if (!email) {
    console.error('Please provide an email as an argument.');
    process.exit(1);
  }

  main(email).then(() => {
    console.log('Script executed successfully.');
    process.exit(0);
  }).catch((error) => {
    console.error('Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { main };
