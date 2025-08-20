const multer = require('multer');
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "public/images/"), // Thư mục lưu ảnh
  filename: (req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage: storage });

module.exports = upload;