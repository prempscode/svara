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

    console.log("📝 Updating music:", id);
    console.log("📋 Body:", { title, description });
    console.log("📎 Files:", req.files);

    const music = await musicModel.findById(id);

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    // ownership check — only the uploader can edit
    if (music.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't edit this track" });
    }

    // Update text fields
    if (title) music.title = title;
    if (description) music.description = description;

    // ✅ Handle image upload - check if files exist properly
    const newImageFile = req.files?.image?.[0];
    const newAudioFile = req.files?.audio?.[0];

    if (newImageFile) {
      console.log("🖼️ Updating image...");
      try {
        // Delete old image if exists
        if (music.imageFileId) {
          await deleteFile(music.imageFileId);
          console.log("✅ Old image deleted");
        }
        // Upload new image
        const imageResult = await uploadFile(newImageFile);
        music.image = imageResult.url;
        music.imageFileId = imageResult.fileId;
        console.log("✅ New image uploaded:", imageResult.fileId);
      } catch (imgError) {
        console.error("❌ Image upload error:", imgError.message);
        // Continue with other updates
      }
    }

    if (newAudioFile) {
      console.log("🎵 Updating audio...");
      try {
        // Delete old audio if exists
        if (music.audioFileId) {
          await deleteFile(music.audioFileId);
          console.log("✅ Old audio deleted");
        }
        // Upload new audio
        const audioResult = await uploadFile(newAudioFile);
        music.uri = audioResult.url;
        music.audioFileId = audioResult.fileId;
        console.log("✅ New audio uploaded:", audioResult.fileId);
      } catch (audioError) {
        console.error("❌ Audio upload error:", audioError.message);
        // Continue with other updates
      }
    }

    await music.save();

    console.log("✅ Music updated:", music._id);

    res.status(200).json({
      message: "Music updated successfully",
      music,
    });
  } catch (e) {
    console.error("❌ Error in updateMusic:", e.message);
    console.error("❌ Full error:", e);
    res.status(500).json({
      message: "Error occurred in music.controller",
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
  try {
    const { title, description, musics } = req.body;
    console.log("📀 Creating album with:", { title, description, musics });

    // Validate required fields
    if (!title) {
      return res.status(400).json({ message: "Album title is required" });
    }

    // Parse musics if it's a string (sent as JSON string from FormData)
    let musicIds = [];
    if (musics) {
      try {
        musicIds = typeof musics === "string" ? JSON.parse(musics) : musics;
      } catch (e) {
        console.error("❌ Error parsing musics:", e);
        return res.status(400).json({ message: "Invalid tracks format" });
      }
    }

    // Handle album cover image (optional)
    const imageFile = req.files?.image?.[0];
    let imageResult = null;
    if (imageFile) {
      console.log("🖼️ Uploading album cover...");
      imageResult = await uploadFile(imageFile);
      console.log("✅ Album cover uploaded:", imageResult.fileId);
    }

    // Create album
    const album = await albumModel.create({
      title,
      description: description || "",
      artist: req.user.id,
      musics: musicIds || [],
      image: imageResult?.url,
      imageFileId: imageResult?.fileId,
    });

    console.log("✅ Album created:", album._id);

    res.status(201).json({
      message: "Album created successfully",
      album: album,
    });
  } catch (e) {
    console.error("❌ Error in createAlbum:", e.message);
    console.error("❌ Full error:", e);
    res.status(500).json({
      message: "Error occurred in music.controller",
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

// Get Album by ID
async function getAlbumById(req, res) {
  try {
    const { id } = req.params;
    console.log("🔍 Fetching album:", id);

    const album = await albumModel
      .findById(id)
      .populate("artist", "username email")
      .populate({
        path: "musics",
        populate: {
          path: "artist",
          select: "username email",
        },
      });

    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    console.log("✅ Album found:", album._id);

    res.status(200).json({
      message: "Album fetched successfully",
      album: album,
    });
  } catch (e) {
    console.error("❌ Error in getAlbumById:", e.message);
    res.status(500).json({
      message: "Error occurred in music.controller",
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
      // Unlike: Remove user ID
      music.likes.splice(likeIndex, 1);
    } else {
      // Like: Add user ID
      music.likes.push(userId);
    }

    // Update likesCount
    music.likesCount = music.likes.length;
    await music.save();

    // ✅ Return consistent response
    res.status(200).json({
      message: isLiked ? "Track unliked" : "Track liked",
      likes: music.likes.length,
      isLiked: !isLiked, // Send the new status
    });
  } catch (e) {
    res.status(500).json({
      message: "Error occurred in music.controller",
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

// Update Album
async function updateAlbum(req, res) {
  try {
    const { id } = req.params;
    const { title, description, musics } = req.body;

    console.log("📀 Updating album:", id);
    console.log("📋 Data:", { title, description, musics });

    // Find album
    const album = await albumModel.findById(id);
    if (!album) {
      return res.status(404).json({ message: "Album not found" });
    }

    // Check ownership
    if (album.artist.toString() !== req.user.id) {
      return res.status(403).json({ message: "You can't edit this album" });
    }

    // Parse musics if it's a string
    let musicIds = [];
    if (musics) {
      try {
        musicIds = typeof musics === "string" ? JSON.parse(musics) : musics;
      } catch (e) {
        console.error("❌ Error parsing musics:", e);
        return res.status(400).json({ message: "Invalid tracks format" });
      }
    }

    // Update fields
    if (title) album.title = title;
    if (description) album.description = description;
    if (musicIds.length > 0) album.musics = musicIds;

    // Handle album cover update
    const imageFile = req.files?.image?.[0];
    if (imageFile) {
      console.log("🖼️ Updating album cover...");
      // Delete old image
      if (album.imageFileId) {
        try {
          await deleteFile(album.imageFileId);
        } catch (error) {
          console.error("Error deleting old image:", error.message);
        }
      }
      // Upload new image
      const imageResult = await uploadFile(imageFile);
      album.image = imageResult.url;
      album.imageFileId = imageResult.fileId;
      console.log("✅ Album cover updated:", imageResult.fileId);
    }

    await album.save();

    console.log("✅ Album updated:", album._id);

    res.status(200).json({
      message: "Album updated successfully",
      album: album,
    });
  } catch (e) {
    console.error("❌ Error in updateAlbum:", e.message);
    console.error("❌ Full error:", e);
    res.status(500).json({
      message: "Error occurred in music.controller",
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

async function getMusicById(req, res) {
  try {
    const { id } = req.params;

    const music = await musicModel
      .findById(id)
      .populate("artist", "username email profileImage");

    if (!music) {
      return res.status(404).json({ message: "Music not found" });
    }

    res.status(200).json({
      message: "Music fetched successfully",
      music: music,
    });
  } catch (e) {
    res.status(500).json({
      message: "Error occurred in music.controller",
      error: e.message,
    });
  }
}

module.exports = {
  getMusicById,
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
