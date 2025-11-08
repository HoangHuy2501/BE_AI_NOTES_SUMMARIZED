// AI_pdf.js
const axios = require("axios");
const ApiError = require("../utils/ApiError");
const Tesseract = require("tesseract.js");

// === GLOBAL cooldown để tránh spam Gemini ===
let lastGeminiCall = 0;
const GEMINI_COOLDOWN_MS = 10_000; // 10 giây giữa mỗi lần gọi

// === Hàm tiện ích: delay ===
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}

// === Hàm gọi Gemini có retry (exponential backoff) ===
async function callGeminiWithRetry(url, body, headers, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.post(url, body, { headers });
      return response;
    } catch (error) {
      const status = error.response?.status;
      if (status === 429 && i < retries - 1) {
        const delay = Math.pow(2, i) * 2000; // 2s, 4s, 8s
        console.warn(`⚠️ Gemini rate limit hit (429). Retry in ${delay / 1000}s...`);
        await sleep(delay);
      } else {
        console.error("❌ Gemini API error:", status, error.message);
        throw error;
      }
    }
  }
}

/**
 * PDF -> JPG preview -> OCR -> hỏi Gemini -> trả JSON câu hỏi
 */
async function handlePdfSmart(pdfUrl, questionNumber) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) throw new Error("⚠️ Missing GEMINI_API_KEY in environment");

  // 1️⃣ Convert Cloudinary PDF -> JPG preview
  const jpgUrl = pdfUrl.replace("/raw/upload/", "/image/upload/pg_1/").replace(".pdf", ".jpg");
  console.log("📄 Generating JPG preview from:", jpgUrl);

  // 2️⃣ Download preview image
  const { data: imgBuffer } = await axios.get(jpgUrl, { responseType: "arraybuffer" });

  // 3️⃣ OCR extract text (page 1 only)
  console.log("🔍 Running OCR via Tesseract...");
  const { data: { text: ocrText } } = await Tesseract.recognize(imgBuffer, "eng", {
    logger: (m) => process.stdout.write(`\r🧠 OCR: ${m.status}...      `),
  });
  console.log("\n✅ OCR done!");

  if (!ocrText || ocrText.trim().length < 100) {
    throw new ApiError(400, "Không thể nhận diện được nội dung từ file PDF");
  }

  // 4️⃣ Chuẩn bị prompt ngắn gọn hơn để tránh token overflow
  const trimmedText = ocrText.slice(100, 2000);
  const prompt = `
Nội dung PDF:
"""${trimmedText}"""

Hãy tạo ra ${questionNumber} câu hỏi trắc nghiệm kèm đáp án đúng. 
Định dạng JSON:
[
  { "question": "Câu hỏi...", "options": ["A","B","C","D"], "answer": "A" }
]
  `;

  // 5️⃣ Rate limit thủ công giữa các lần gọi Gemini
  const now = Date.now();
  const elapsed = now - lastGeminiCall;
  if (elapsed < GEMINI_COOLDOWN_MS) {
    const waitTime = GEMINI_COOLDOWN_MS - elapsed;
    console.log(`⏳ Cooldown ${waitTime / 1000}s để tránh 429...`);
    await sleep(waitTime);
  }
  lastGeminiCall = Date.now();

  // 6️⃣ Gọi Gemini API với retry
  console.log("🤖 Calling Gemini API...");
  const url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
  const body = { contents: [{ parts: [{ text: prompt }] }] };
  const headers = {
    "Content-Type": "application/json",
    "X-goog-api-key": GEMINI_API_KEY,
  };

  const response = await callGeminiWithRetry(url, body, headers);

  // 7️⃣ Trích xuất JSON kết quả
  let jsonText = response.data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  jsonText = jsonText.replace(/```json|```/g, "").trim();

  let resultJson = [];
  try {
    resultJson = JSON.parse(jsonText);
    console.log("✅ Parsed Gemini JSON successfully:", resultJson.length, "questions");
    const quiz = [];

    if (Array.isArray(resultJson)) {
      resultJson.forEach((item) => {
        quiz.push({
          question: item.question || "",
          options: item.options || [],
          answer: item.answer || "",
        });
      });
    }
    return quiz;
  } catch (err) {
    console.error("❌ Parse JSON Gemini fail:", err.message);
    throw new ApiError(500, "Gemini trả về định dạng không hợp lệ");
  }
}

module.exports = { handlePdfSmart };
