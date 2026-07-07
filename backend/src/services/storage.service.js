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

/*
 **Why mimetype instead of filename?**
Filename is just text — easy to fake (rename `virus.exe` to `song.mp3`). 
Mimetype comes from the browser itself when the file is picked, so it's a more trustworthy signal of what the file actually is.
 */
