// backend/src/model/album.model.js
const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      default: "",
    },
    artist: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    musics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "music",
      },
    ],
    image: {
      type: String,
      default: null,
    },
    imageFileId: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

const albumModel = mongoose.model("album", albumSchema);
module.exports = albumModel;