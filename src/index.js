const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { extractTextFromImage } = require('./ocr');
const { connect, saveResult, getResults, getResultById } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|bmp|tiff/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'Image to Text API',
    version: '1.0.0',
    endpoints: {
      'POST /upload': 'Upload an image to extract text',
      'GET /results': 'Get all extracted text results',
      'GET /results/:id': 'Get a specific result by ID'
    }
  });
});

// Upload and process image
app.post('/upload', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imagePath = req.file.path;
    console.log('Processing image:', imagePath);

    // Extract text from image using OCR
    const ocrResult = await extractTextFromImage(imagePath);

    // Save result to MongoDB
    const dbResult = await saveResult({
      originalFilename: req.file.originalname,
      filename: req.file.filename,
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      size: req.file.size,
      mimetype: req.file.mimetype
    });

    // Clean up uploaded file
    fs.unlinkSync(imagePath);

    res.json({
      success: true,
      id: dbResult.insertedId,
      text: ocrResult.text,
      confidence: ocrResult.confidence,
      message: 'Image processed successfully'
    });
  } catch (error) {
    console.error('Error processing image:', error);
    
    // Clean up file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    res.status(500).json({
      error: 'Failed to process image',
      details: error.message
    });
  }
});

// Get all results
app.get('/results', async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const results = await getResults(limit);
    res.json({
      success: true,
      count: results.length,
      results: results
    });
  } catch (error) {
    console.error('Error fetching results:', error);
    res.status(500).json({
      error: 'Failed to fetch results',
      details: error.message
    });
  }
});

// Get specific result by ID
app.get('/results/:id', async (req, res) => {
  try {
    const result = await getResultById(req.params.id);
    
    if (!result) {
      return res.status(404).json({
        error: 'Result not found'
      });
    }
    
    res.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('Error fetching result:', error);
    res.status(500).json({
      error: 'Failed to fetch result',
      details: error.message
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Start server
async function startServer() {
  try {
    // Connect to MongoDB
    await connect();
    
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
      console.log(`API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
