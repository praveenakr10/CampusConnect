const cloudinary = require("../config/cloudinary");

// Uploads a file buffer (from multer memoryStorage) to Cloudinary using a stream. Returns the secure URL and public_id.

function uploadPosterBuffer(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "campusqna/event-posters", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    stream.end(buffer);
  });
}

async function deletePoster(publicId) {
  if (!publicId) return;
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-fatal: the DB record deletion should still succeed even if the
    // Cloudinary cleanup fails (e.g. transient network issue).
    console.error("Failed to delete Cloudinary poster:", err.message);
  }
}

module.exports = { uploadPosterBuffer, deletePoster };
