const multer = require("multer");
const CloudConvert = require("cloudconvert");
const cloudinary = require("../config/ConnectCloudinary");
const ApiError = require("../utils/ApiError");
const fetch = require("node-fetch");           // NHỚ import
const cloudConvert = new CloudConvert(process.env.CONVERT_API_KEY);

const storage = multer.memoryStorage();// lưu tạm vảo ram
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];
    if (!allowed.includes(file.mimetype)) {
      return cb(ApiError.ValidationError([{ msg: "Only .doc, .docx, .pdf allowed" }]), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 10 * 1024 * 1024 }
});

/* convert doc/docx -> pdf */
// async function convertToPdfCloudConvert(buffer, mimetype) {
// try {
//     if (mimetype === "application/pdf") return buffer;

//   const ext = mimetype === "application/msword" ? "doc" : "docx";

//   const job = await cloudConvert.jobs.create({
//     tasks: {
//       import_file: { operation: "import/upload" },
//       convert_file: {
//         operation: "convert",
//         input: "import_file",
//         output_format: "pdf"
//       },
//       export_file: {
//         operation: "export/url",
//         input: "convert_file"
//       }
//     }
//   });

//   const uploadTask = job.tasks.filter(t => t.name === "import_file")[0];
//   await cloudConvert.tasks.upload(uploadTask, buffer, `file.${ext}`);

//   const exportTask = await cloudConvert.tasks.wait(
//     job.tasks.filter(t => t.name === "export_file")[0].id
//   );

//   const fileUrl = exportTask.result.files[0].url;

//   // FIX ở đây: dùng arrayBuffer() → Buffer.from
//   const resDl     = await fetch(fileUrl);
//   const arrayBuff = await resDl.arrayBuffer();
//   const pdfBuffer = Buffer.from(arrayBuff);

//   return pdfBuffer;
// } catch (error){
//   throw ApiError.BadConnection(error.message);
// }
// }

function uploadBufferToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder: "file_url", resource_type: "auto" },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(buffer);
  });
}

// Tạo URL PDF trên Cloudinary nếu cần
// function cloudinaryConvertToPdf(url) {
//   // /raw/upload/...docx  -->  /image/upload/f_pdf/raw/upload/...pdf
//   return url
//     .replace('/raw/upload', '/image/upload/f_pdf/raw/upload')
//     .replace(/\.\w+$/, '.pdf'); 
// }

const uploadDocDocxCloud = [
  upload.single("file_url"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        return next();
      }
      if(req.file.mimetype !== "application/pdf"){
        return next(ApiError.ValidationError([{ msg: "Only .pdf allowed" }]));
      }
      // const pdfBuffer = await convertToPdfCloudConvert(req.file.buffer, req.file.mimetype);
      const result = await uploadBufferToCloudinary(req.file.buffer);
      req.file.cloudinaryUrl = result.secure_url;
      req.file.publicId = result.public_id;
      next();
    } catch (err) {
      next(err);
    }
  }
];

module.exports = uploadDocDocxCloud;
