# Frontend Setup Instructions

## Prerequisites
- Node.js 16+ installed
- npm (comes with Node.js)

## Installation

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

This will install React, Next.js, Tailwind CSS, and other required packages.

## Running the Development Server

```bash
npm run dev
```

The app will start at `http://localhost:3000`

## Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/
│   ├── page.tsx           # Main dashboard page
│   └── layout.tsx         # Root layout with metadata
├── components/
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── Dashboard.tsx      # Main dashboard component
│   └── tools/
│       ├── ImageGenerator.tsx
│       ├── VideoGenerator.tsx
│       ├── AudioGenerator.tsx
│       └── DefaultTool.tsx
└── styles/
    └── globals.css        # Global Tailwind styles
```

## Features Implemented

- ✅ Beautiful dark-themed UI
- ✅ Sidebar navigation with all tools
- ✅ Image Generator (basic UI)
- ✅ Video Generator (basic UI)
- ✅ Voice Generator (basic UI)
- ✅ Responsive design
- ✅ Integration with backend API

## Connecting to Backend

The frontend automatically connects to the backend at `http://localhost:5000`

Make sure your backend is running before testing API calls!

## Next Steps

1. Run `npm run dev` to start the frontend
2. Start the backend API in another terminal
3. Start the Python ML service in a third terminal
4. Open `http://localhost:3000` in your browser
5. Start creating content!

Good luck! 🚀
