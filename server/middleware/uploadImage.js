const multer = require('multer');
const cloudinary = require("../config/ConnectCloudinary");
const ApiError = require("../utils/ApiError");
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, "public/images/"), // Thư mục lưu ảnh
//   filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
// });
// const upload = multer({ storage: storage });
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(file.mimetype)) {
      return cb(ApiError.ValidationError([{ msg: "Only .png, .jpg, .jpeg allowed" }]), false);
    }
    cb(null, true);
  },
});

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "image", resource_type: "auto" },(error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    }).end(buffer);
  });
}

const uploadImageCloudinary = [
  upload.single("image"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }
      const result = await uploadBufferToCloudinary(req.file.buffer);
      req.file.cloudinaryUrl = result.secure_url;
      req.file.publicId = result.public_id;
      next();
    } catch (err) {
      next(err);
    }
  }
];
module.exports = uploadImageCloudinary;