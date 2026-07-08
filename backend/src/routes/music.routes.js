const express = require("express");
const router = express.Router();
const multer = require("multer");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
});

// TRACK ROUTES

// upload music
router.post(
  "/upload",
  authMiddleware.authGlobal,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  musicController.createMusic,
);

// Get single track by ID
router.get(
  "/track/:id",
  authMiddleware.authGlobal,
  musicController.getMusicById,
);

// update music
router.patch(
  "/:id",
  authMiddleware.authGlobal,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  musicController.updateMusic,
);

// delete music
router.delete("/:id", authMiddleware.authGlobal, musicController.deleteMusic);

// get all music (public feed)
router.get("/", authMiddleware.authGlobal, musicController.getAllMusics);

// get user tracks (profile page)
router.get(
  "/user/:userId",
  authMiddleware.authGlobal,
  musicController.getUserTracks,
);

// like / unlike a track
router.post("/:id/like", authMiddleware.authGlobal, musicController.toggleLike);

// get liked feed
router.get("/liked", authMiddleware.authGlobal, musicController.getLikedFeed);

// ALBUM ROUTES

// create album
router.post(
  "/album",
  authMiddleware.authGlobal,
  upload.fields([{ name: "image", maxCount: 1 }]),
  musicController.createAlbum,
);

// get all albums
router.get("/albums", authMiddleware.authGlobal, musicController.getAllAlbums);

// get specific album
router.get(
  "/albums/:id",
  authMiddleware.authGlobal,
  musicController.getAlbumById,
);

// update album
router.patch(
  "/albums/:id",
  authMiddleware.authGlobal,
  upload.fields([{ name: "image", maxCount: 1 }]),
  musicController.updateAlbum,
);

// delete album
router.delete(
  "/albums/:id",
  authMiddleware.authGlobal,
  musicController.deleteAlbum,
);

module.exports = router;
