const multer = require("multer");
// Event posters are streamed directly to Cloudinary by the controller.
// memoryStorage supplies req.file.buffer; diskStorage only supplies a path.
const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) return cb(new Error("Only images allowed"));
    cb(null, true);
  },
});

module.exports = upload;
