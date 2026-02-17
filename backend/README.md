# Backend Setup Instructions

## Prerequisites
- Node.js 16+ installed
- npm (comes with Node.js)

## Installation

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create .env file (optional):
```bash
echo PORT=5000 > .env
```

## Running the Server

### Development mode (with auto-reload):
```bash
npm run dev
```

### Production mode:
```bash
npm start
```

The server will start at `http://localhost:5000`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns: `{ status: "Backend is running!" }`

### Image Generation
- **POST** `/api/image/generate`
- Body: `{ prompt: "A beautiful sunset" }`
- Returns: Job status and estimated time

### Video Generation
- **POST** `/api/video/generate`
- Body: `{ prompt: "A cat running in the park" }`
- Returns: Job status and estimated time

### Audio Generation
- **POST** `/api/audio/generate`
- Body: `{ text: "Hello world", voice: "en-US" }`
- Returns: Job status and estimated time

### File Upload
- **POST** `/api/upload`
- Body: FormData with `file` field
- Returns: File details and path

## Testing

Test the API using curl or Postman:

```bash
# Health check
curl http://localhost:5000/api/health

# Generate image
curl -X POST http://localhost:5000/api/image/generate \
  -H "Content-Type: application/json" \
  -d '{"prompt":"A dog wearing sunglasses"}'
```

## Next Steps

1. ✅ Backend API is set up
2. Next: Set up the Frontend (React app)
3. Then: Connect to Python ML models

Good luck! 🚀
