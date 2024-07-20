const fs = require('fs');
const path = require('path');
const axios = require('axios');
const Jimp = require('jimp');
const FormData = require('form-data');

const keyPath = path.resolve(__dirname, 'api_key.txt');
const key = fs.readFileSync(keyPath, 'utf-8').trim();

const sendGenerationRequest = async (host, params) => {
  const formData = new FormData();
  formData.append('image', fs.createReadStream(params.image));
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'image') {
      formData.append(key, value.toString());
    }
  }

  const response = await axios.post(host, formData, {
    headers: {
      ...formData.getHeaders(),
      'Accept': 'image/*',
      'Authorization': `Bearer ${key}`
    },
    responseType: 'arraybuffer'
  });

  if (response.status !== 200) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }

  return response;
};

const resizeAndCompositeImages = async () => {
  const img1 = await Jimp.read(path.resolve(__dirname, 'images/downloadedImage1.png'));
  const img2 = await Jimp.read(path.resolve(__dirname, 'images/downloadedImage2.png'));
  const img3 = await Jimp.read(path.resolve(__dirname, 'images/downloadedImage3.png'));

  img1.resize(512, 512);
  img2.resize(512, 512);
  img3.resize(512, 512);

  const width = img1.bitmap.width + img2.bitmap.width;
  const height = img1.bitmap.height + img3.bitmap.height;

  const compositeImg = new Jimp(width, height, 0xffffffff);
  compositeImg.composite(img1, 0, 0);
  compositeImg.composite(img2, img1.bitmap.width, 0);
  const thirdImageX = (width - img3.bitmap.width) / 2;
  compositeImg.composite(img3, thirdImageX, img1.bitmap.height);

  await compositeImg.writeAsync(path.resolve(__dirname, 'images/inputImage.png'));
  console.log('New image created with all three images pasted on it.');
};

const main = async () => {
  await resizeAndCompositeImages();

  const image = path.resolve(__dirname, 'images/inputImage.png');
  const prompt = "A beautiful bouquet of flowers inspired by the uploaded flower images and aesthetics";
  const seed = 0;
  const outputFormat = "png";
  const strength = 1;
  const host = "https://api.stability.ai/v2beta/stable-image/generate/sd3";

  const params = {
    image,
    prompt,
    strength,
    seed,
    output_format: outputFormat,
    mode: "image-to-image",
    model: "sd3-medium"
  };

  try {
    const response = await sendGenerationRequest(host, params);
    const outputImage = response.data;
    const generatedImageFilename = path.resolve(__dirname, 'images/generatedImage.png');
    fs.writeFileSync(generatedImageFilename, outputImage);
    console.log(`Saved image ${generatedImageFilename}`);
  } catch (error) {
    console.error('Error:', error);
  }
};

module.exports = { main };
