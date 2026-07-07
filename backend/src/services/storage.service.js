const { ImageKit } = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file) {
  // file.mimetype comes from Multer, e.g. "audio/mpeg" or "image/png"
  const isAudio = file.mimetype.startsWith("audio/");

  const folder = isAudio ? "svara/audio" : "svara/covers";
  const prefix = isAudio ? "music" : "cover";

  const result = await ImageKitClient.files.upload({
    file: file.buffer,
    fileName: `${prefix}_${Date.now()}`,
    folder,
  });

  return result;
}

async function deleteFile(fileId) {
  return await ImageKitClient.files.delete(fileId);
}

module.exports = { uploadFile, deleteFile };

/*
 **Why mimetype instead of filename?**
Filename is just text — easy to fake (rename `virus.exe` to `song.mp3`). 
Mimetype comes from the browser itself when the file is picked, so it's a more trustworthy signal of what the file actually is.
 */
