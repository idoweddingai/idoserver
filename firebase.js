// firebase.js
const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');


const SERVICE_ACCOUNT_KEY_PATH = 'i-do-extension-firebase.json'


// Ensure the service account key file exists
if (!fs.existsSync(SERVICE_ACCOUNT_KEY_PATH)) {
  throw new Error(`Service account key file not found: ${SERVICE_ACCOUNT_KEY_PATH}`);
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(SERVICE_ACCOUNT_KEY_PATH)
  });
  console.log("Firebase Admin SDK initialized");
} catch (error) {
  console.error(`Error initializing Firebase Admin SDK: ${error}`);
  process.exit(1);
}

const db = admin.firestore();
console.log("Firestore DB initialized");

module.exports = db;
