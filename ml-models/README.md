# Python ML Models Setup

## Prerequisites
- Python 3.8+ installed
- pip (comes with Python)

## Installation

1. Navigate to ml-models folder:
```bash
cd ml-models
```

2. Create virtual environment:

### Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### Mac/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

**⚠️ Warning**: This will download ~10-15 GB of model files on first run. Be patient!

## Running the Server

```bash
python app.py
```

The server will start at `http://localhost:5001`

## API Endpoints

### Health Check
- **GET** `/api/health`
- Returns: Server status, device info, and torch version

### Image Generation
- **POST** `/api/image/generate`
- Body: `{ "prompt": "A beautiful sunset" }`
- Returns: Job ID, estimated time

### Video Generation
- **POST** `/api/video/generate`
- Body: `{ "prompt": "A cat running" }`
- Returns: Job ID, estimated time

### Audio Generation
- **POST** `/api/audio/generate`
- Body: `{ "text": "Hello world", "voice": "en-US" }`
- Returns: Job ID, estimated time

## Deactivating Virtual Environment

When done, run:
```bash
deactivate
```

## Models Included

- 🖼️ **Stable Diffusion** - Image generation
- 🎥 **Wan / HunyuanVideo** - Video generation (to be integrated)
- 🔊 **TTS Models** - Audio generation (to be integrated)

## GPU Support

If you have NVIDIA GPU:
```bash
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu118
```

## Next Steps

1. ✅ Backend API is set up
2. ✅ Python ML service is set up
3. Next: Create Frontend (React app)

Good luck! 🚀
