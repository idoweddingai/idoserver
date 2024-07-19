// index.js
const { exec } = require('child_process');

const runScript = (scriptPath) => {
  return new Promise((resolve, reject) => {
    exec(`node ${scriptPath}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`Error executing ${scriptPath}: ${error}`);
        reject(error);
      } else {
        console.log(`Output of ${scriptPath}: ${stdout}`);
        if (stderr) {
          console.error(`Error output of ${scriptPath}: ${stderr}`);
        }
        resolve();
      }
    });
  });
};

const main = async () => {
  try {
    await runScript('urltodownload.js');
    await runScript('image_generation.js');
    console.log('Both scripts executed successfully.');
  } catch (error) {
    console.error('Error executing scripts:', error);
  }
};

main();
