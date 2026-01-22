const Tesseract = require('tesseract.js');

async function extractTextFromImage(imagePath) {
  try {
    console.log('Starting OCR processing for:', imagePath);
    
    const result = await Tesseract.recognize(
      imagePath,
      'eng',
      {
        logger: info => console.log('OCR Progress:', info)
      }
    );
    
    return {
      text: result.data.text,
      confidence: result.data.confidence
    };
  } catch (error) {
    console.error('OCR processing error:', error);
    throw error;
  }
}

module.exports = {
  extractTextFromImage
};
