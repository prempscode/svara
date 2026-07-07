const musicModel = require("../model/music.model");
const { uploadFile, deleteFile } = require("../services/storage.service");
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

async function updateMusic(req, res) {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    const music = await musicModel.findById(id);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    // ownership check — only the uploader can edit
    if (music.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't edit this track" });
    }

    if (title) music.title = title;
    if (description) music.description = description;

    const newImageFile = req.files?.image?.[0];
    const newAudioFile = req.files?.audio?.[0];

    if (newImageFile) {
      if (music.imageFileId) await deleteFile(music.imageFileId); // remove old one
      const imageResult = await uploadFile(newImageFile);
      music.image = imageResult.url;
      music.imageFileId = imageResult.fileId;
    }

    if (newAudioFile) {
      if (music.audioFileId) await deleteFile(music.audioFileId);
      const audioResult = await uploadFile(newAudioFile);
      music.uri = audioResult.url;
      music.audioFileId = audioResult.fileId;
    }

    await music.save();

    res.status(200).json({ message: "Music updated successfully", music });
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
    const musics = await musicModel.find().populate("artist", "username email");
    res.status(200).json({
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

async function createAlbum(req, res) {
  // const musicList = await musicModel.find().populate("artist", "name");

  try {
    const { title, musics } = req.body;

    const musicDocs = await musicModel.find({
      _id: { $in: musics },
      artist: req.user.id,
    });
    if (musicDocs.length !== musics.length) {
      return res.status(400).json({
        message: "One or more tracks don't exist or don't belong to you",
      });
    }
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
      .select("title artist image")
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
      .populate("artist", "username")
      .populate("musics");

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

async function deleteMusic(req, res) {
  try {
    const { id } = req.params;

    // find the track
    const music = await musicModel.findById(id);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    // check ownership
    if (music.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't delete this track" });
    }

    // delete files from ImageKit
    try {
      if (music.audioFileId) {
        await deleteFile(music.audioFileId);
      }
      if (music.imageFileId) {
        await deleteFile(music.imageFileId);
      }
    } catch (imagekitError) {
      console.error("ImageKit deletion error:", imagekitError.message);
    }

    // delete from database
    await musicModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Music deleted successfully",
      musicId: id,
    });
  } catch (e) {
    res.status(500).json({
      message: "Error occurred in music.controller",
      error: e.message,
    });
  }
}

async function getUserTracks(req, res) {
  try {
    const { userId } = req.params;

    const [musics, total] = await Promise.all([
      musicModel
        .find({ artist: userId })
        .populate("artist", "username")
        .sort({ createdAt: -1 }),
      musicModel.countDocuments({ artist: userId }),
    ]);

    res.status(200).json({
      message: "User tracks fetched successfully",
      musics: musics,
    });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function toggleLike(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const music = await musicModel.findById(id);
    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    const likeIndex = music.likes.indexOf(userId);
    const isLiked = likeIndex !== -1;

    if (isLiked) {
      music.likes.splice(likeIndex, 1);
    } else {
      music.likes.push(userId);
    }

    await music.save();

    res.status(200).json({
      message: isLiked ? "Track unliked" : "Track liked",
      likes: music.likes.length,
      isLiked: !isLiked,
    });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function getLikedFeed(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [musics, total] = await Promise.all([
      musicModel
        .find({ likes: userId })
        .populate("artist", "username email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      musicModel.countDocuments({ likes: userId }),
    ]);

    res.status(200).json({
      message: "Liked feed fetched successfully",
      musics: musics,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function updateAlbum(req, res) {
  try {
    const { id } = req.params;
    const { title, description, musics } = req.body;

    const album = await albumModel.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (album.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't edit this album" });
    }
    const musicDocs = await musicModel.find({
      _id: { $in: musics },
      artist: req.user.id,
    });
    if (musicDocs.length !== musics.length) {
      return res.status(400).json({
        message: "One or more tracks don't exist or don't belong to you",
      });
    }
    album.musics = musics;

    if (title) album.title = title;
    if (description) album.description = description;

    // Handle album cover update
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      if (album.imageFileId) await deleteFile(album.imageFileId);
      const imageResult = await uploadFile(imageFile);
      album.image = imageResult.url;
      album.imageFileId = imageResult.fileId;
    }

    await album.save();

    res.status(200).json({
      message: "Album updated successfully",
      album,
    });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

async function deleteAlbum(req, res) {
  try {
    const { id } = req.params;

    const album = await albumModel.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    if (album.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't delete this album" });
    }

    // Delete album cover from ImageKit
    if (album.imageFileId) {
      try {
        await deleteFile(album.imageFileId);
      } catch (error) {
        console.error("ImageKit deletion error:", error.message);
      }
    }

    await albumModel.findByIdAndDelete(id);

    res.status(200).json({
      message: "Album deleted successfully",
      albumId: id,
    });
  } catch (e) {
    res.status(500).json({
      message: "error occured in music.controller",
      error: e.message,
    });
  }
}

module.exports = {
  createMusic,
  updateMusic,
  deleteMusic,
  createAlbum,
  getAllMusics,
  getAllAlbums,
  getAlbumById,
  getUserTracks,
  toggleLike,
  getLikedFeed,
  updateAlbum,
  deleteAlbum,
};
