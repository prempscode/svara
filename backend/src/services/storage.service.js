const { ImageKit, toFile } = require("@imagekit/nodejs");

const ImageKitClient = new ImageKit({
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
});

async function uploadFile(file) {
  const isAudio = file.mimetype.startsWith("audio/");
  const folder = isAudio ? "svara/audio" : "svara/image";
  const prefix = isAudio ? "music" : "image";

  const result = await ImageKitClient.files.upload({
    file: await toFile(file.buffer, file.originalname, { type: file.mimetype }),
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
