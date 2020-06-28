const express = require("express");
const router = express.Router();
const multer  = require("multer");
const { v4: uuid } = require('uuid');

const storage = multer.diskStorage({
  destination: "movies/",
  filename: function (req, file, callback) {
    const sequence = req.body.sequence;
    const filename = `${sequence}_${uuid()}.mp4`;
    callback(null, filename);
  }
});

const upload = multer({ storage: storage })

router.post('/upload', upload.single("movie"), function(req, res, next) {
  res.json({status: "It is done"});
});

module.exports = router;
