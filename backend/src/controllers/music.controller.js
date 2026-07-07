const musicModel = require("../model/music.model");
const { uploadFile } = require("../services/storage.service");
const albumModel = require("../model/album.model");
const jwt = require("jsonwebtoken");

async function createMusic(req, res) {
  try {
    const { title, description } = req.body;

    const audioFile = req.files.audio?.[0];
    const imageFile = req.files.image?.[0];

    if (!audioFile) {
      return res.status(400).json({ message: "Audio file is required" });
    }

    const audioResult = await uploadFile(audioFile);
    const imageResult = imageFile ? await uploadFile(imageFile) : null;

    const music = await musicModel.create({
      uri: audioResult.url,
      audioFileId: audioResult.fileId,
      image: imageResult?.url,
      imageFileId: imageResult?.fileId,
      title,
      description,
      artist: req.user.id,
    });

    res.status(201).json({ message: "Music submitted successfully", music });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}





















async function createAlbum(req, res) {
  // const musicList = await musicModel.find().populate("artist", "name");

  try {
    const { title, musics } = req.body;

    const album = await albumModel.create({
      title,
      artist: req.user.id,
      musics: musics,
    });

    res.status(201).json({
      message: "Album created successfully",
      album: {
        id: album._id,
        title: album.title,
        artist: album.artist,
        musics: album.musics,
      },
    });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function getAllMusics(req, res) {
  // using populate will give use the user detail instead of the id of the user, and
  // since are providing "username email" with the artist ref , it will only give us
  // the username and email , it will not give us the password and role .

  try {
    // here we are using limit() as we are getting all the musics so if we get all the
    // musics at once it will be bulky and may server crash so we use it to limit
    // the output .

    /*
      we are also using the .skip() which help us in pagination :
      like if we have 10 data and we wrote : .skip(2) .limit(4), then
      what it does basically : it skip first 2 data and prints 4 data and 
      use this logic in pagination.
    */
    const musics = await musicModel
      .find()
      .limit(2)
      .populate("artist", "username email");
    res.status(201).json({
      message: "Musics fetched successfully",
      musics: musics,
    });
  } catch (e) {
    res.status(e.status || 500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function getAllAlbums(req, res) {
  try {
    /* here we are showing all the albums,
    problem : when it loads all the albums and its musics it is very bulky so 
    we will optimize it like we only show the title and the artist detail but the 
    musics array will load when in frontend some one clicks a specific album with
    the help of album id.
    */

    const albums = await albumModel
      .find()
      .select("title artist")
      .populate("artist", "username");

    res.status(201).json({
      message: "Albums fetched successfully",
      albums: albums,
    });
  } catch (e) {
    res.status(e.status || 500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function getAlbumById(req, res) {
  try {
    const album = await albumModel
      .findById(req.params.id)
      .populate("artist", "username");
    if (!album) {
      return res.status(404).json({
        message: "Album not found",
      });
    }

    res.status(201).json({
      message: "Album fetched successfully",
      album: album,
    });
  } catch (e) {
    res.status(e.status || 500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

module.exports = {
  createMusic,
  createAlbum,
  getAllMusics,
  getAllAlbums,
  getAlbumById,
};
