# Image to Text

A Node.js application that extracts text from images using Optical Character Recognition (OCR) and stores the results in MongoDB.

## Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Tesseract.js** - OCR engine for text extraction
- **MongoDB** - Database for storing results
- **Docker & Docker Compose** - Containerization
- **express-rate-limit** - API rate limiting for security

## Features

- Upload images and extract text using OCR
- Store extracted text results in MongoDB
- RESTful API for uploading images and retrieving results
- Support for multiple image formats (JPEG, PNG, GIF, BMP, TIFF)
- Docker containerization for easy deployment
- Rate limiting for API protection (10 uploads per 15 minutes, 100 API requests per 15 minutes)
- Web interface for easy testing

## Prerequisites

- Docker and Docker Compose installed on your system
- (Optional) Node.js 18+ if running locally without Docker

## Installation & Setup

### Using Docker Compose (Recommended)

1. Clone the repository:
```bash
git clone https://github.com/andreaharris-go/image-to-text.git
cd image-to-text
```

2. Start the application with Docker Compose:
```bash
docker-compose up --build
```

The application will be available at `http://localhost:3000`

### Local Development (Without Docker)

1. Install dependencies:
```bash
npm install
```

2. Make sure MongoDB is running locally or update the `MONGO_URL` environment variable

3. Start the application:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

## API Endpoints

### 1. Home / API Info
```
GET /
```
Returns API information and available endpoints.

### 2. Upload Image
```
POST /upload
```
Upload an image file to extract text.

**Request:**
- Content-Type: `multipart/form-data`
- Body: `image` (file)

**Example using curl:**
```bash
curl -X POST -F "image=@/path/to/your/image.jpg" http://localhost:3000/upload
```

**Response:**
```json
{
  "success": true,
  "id": "65a1b2c3d4e5f6g7h8i9j0k1",
  "text": "Extracted text from the image...",
  "confidence": 89.5,
  "message": "Image processed successfully"
}
```

### 3. Get All Results
```
GET /results?limit=10
```
Retrieve all stored OCR results.

**Query Parameters:**
- `limit` (optional): Number of results to return (default: 10)

**Response:**
```json
{
  "success": true,
  "count": 10,
  "results": [
    {
      "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
      "originalFilename": "example.jpg",
      "text": "Extracted text...",
      "confidence": 89.5,
      "createdAt": "2024-01-15T10:30:00.000Z"
    }
  ]
}
```

### 4. Get Result by ID
```
GET /results/:id
```
Retrieve a specific OCR result by its ID.

**Response:**
```json
{
  "success": true,
  "result": {
    "_id": "65a1b2c3d4e5f6g7h8i9j0k1",
    "originalFilename": "example.jpg",
    "text": "Extracted text...",
    "confidence": 89.5,
    "createdAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 5. Health Check
```
GET /health
```
Check if the service is running.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Testing the Application

### Using curl

1. Upload an image:
```bash
curl -X POST -F "image=@test-image.jpg" http://localhost:3000/upload
```

2. Get all results:
```bash
curl http://localhost:3000/results
```

3. Get specific result:
```bash
curl http://localhost:3000/results/<result-id>
```

### Using Postman or similar tools

1. Create a POST request to `http://localhost:3000/upload`
2. Set Body type to `form-data`
3. Add a key named `image` with type `File`
4. Select an image file
5. Send the request

## Project Structure

```
image-to-text/
├── src/
│   ├── index.js      # Main application file
│   ├── ocr.js        # OCR processing logic
│   └── database.js   # MongoDB connection and operations
├── uploads/          # Temporary storage for uploaded images
├── docker-compose.yml
├── Dockerfile
├── package.json
├── .dockerignore
├── .gitignore
└── README.md
```

## Environment Variables

- `PORT` - Server port (default: 3000)
- `MONGO_URL` - MongoDB connection URL (default: mongodb://mongodb:27017)

## Security Features

- **Rate Limiting**: The API includes rate limiting to prevent abuse:
  - Upload endpoint: 10 requests per IP per 15 minutes
  - General API endpoints: 100 requests per IP per 15 minutes
- **Secure File Naming**: Uses crypto.randomUUID() for unpredictable filenames
- **Input Validation**: File type validation on upload
- **File Size Limits**: Maximum upload size of 10MB

## Stopping the Application

If using Docker Compose:
```bash
docker-compose down
```

To also remove volumes:
```bash
docker-compose down -v
```

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB container is running: `docker-compose ps`
- Check MongoDB logs: `docker-compose logs mongodb`

### OCR Processing Issues
- Ensure the image file is in a supported format
- Check that the image is not corrupted
- Review application logs: `docker-compose logs app`

### Port Already in Use
If port 3000 is already in use, modify the port mapping in `docker-compose.yml`:
```yaml
ports:
  - "3001:3000"  # Use 3001 on host, 3000 in container
```

## License

MIT