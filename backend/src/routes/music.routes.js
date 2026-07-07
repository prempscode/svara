const express = require("express");
const router = express.Router();
const multer = require("multer");
const musicController = require("../controllers/music.controller");
const authMiddleware = require("../middlewares/auth.middleware");

const upload = multer({
  storage: multer.memoryStorage(),
});

// routes
router.post(
  "/upload",
  authMiddleware.authGlobal,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  musicController.createMusic,
);

router.patch(
  "/:id",
  authMiddleware.authGlobal,
  upload.fields([
    { name: "audio", maxCount: 1 },
    { name: "image", maxCount: 1 },
  ]),
  musicController.updateMusic,
);

router.delete("/:id", authMiddleware.authGlobal, musicController.deleteMusic);

router.get("/", authMiddleware.authGlobal, musicController.getAllMusics);

// album routes
router.post("/album", authMiddleware.authGlobal, musicController.createAlbum);

router.get(
  "/albums/:id",
  authMiddleware.authGlobal,
  musicController.getAlbumById,
);

router.get("/albums", authMiddleware.authGlobal, musicController.getAllAlbums);

module.exports = router;
