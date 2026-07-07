const { ImageKit } = require("@imagekit/nodejs");

// Initialize ImageKit with your credentials
const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});
// Function to upload a file to ImageKit
async function uploadFile(file) {
  const result = await ImageKitClient.files.upload({
    file,
    fileName: "music_" + Date.now(),
    folder: "yt-complete-bbackend/music",
  });
  return result;
}

module.exports = { uploadFile };
