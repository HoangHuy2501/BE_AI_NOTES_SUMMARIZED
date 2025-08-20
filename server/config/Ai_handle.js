// AI_pfd.js
const axios = require("axios");
const ApiError = require("../utils/ApiError");
const Tesseract = require("tesseract.js");

/**
 * PDF -> preview jpg -> OCR -> hỏi Gemini (curl-style) -> trả JSON
 */
async function handlePdfSmart(pdfUrl) {
  const GEMINI_API_KEY=process.env.GEMINI_API_KEY;

  // 👉 Convert Cloudinary PDF -> JPG preview (page 1)
  const jpgUrl = pdfUrl.replace("/raw/upload/", "/image/upload/pg_1/").replace(".pdf", ".jpg");
  // console.log("Dynamic JPG URL:", jpgUrl);

  // 1. Download preview image
  const { data: imgBuffer } = await axios.get(jpgUrl, { responseType: "arraybuffer" });

  // 2. OCR extract text
  const {
    data: { text: ocrText },
  } = await Tesseract.recognize(imgBuffer, "eng", {
    logger: (m) => console.log(m.status),
  });

  // console.log("--- TEXT OCR ---\n", ocrText.slice(0, 200));

  // 3. Gửi Gemini bằng axios (curl style)
  const prompt = `
Nội dung PDF:
"""${ocrText.slice(100, 5000)}"""

Hãy tạo ra 15 câu hỏi trắc nghiệm kèm đáp án dạng JSON:
[ { "question": "...", "options": ["A","B","C","D"], "answer": "A. đáp án" } ]
  `;

  const body = {
    contents: [
      {
        parts: [
          { text: prompt }
        ]
      }
    ]
  };

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

  const response = await axios.post(url, body, {
    headers: {
      "Content-Type": "application/json",
      "X-goog-api-key": GEMINI_API_KEY,
    },
  });
  // Extract JSON only
let jsonText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
jsonText = jsonText.replace(/```json|```/g, "").trim();

let resultJson = [];
try {
  resultJson = JSON.parse(jsonText);
  const quiz=[];

if (Array.isArray(resultJson)) {
  resultJson.forEach(item => {
    quiz.push({ question: item.question, options: item.options, answer: item.answer });
  });
}
return quiz;
} catch (err) {
  console.error("Parse JSON Gemini fail:", err.message);
  return ApiError.BadConnection("Parse JSON Gemini fail");
}

}

module.exports = { handlePdfSmart };

