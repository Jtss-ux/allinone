'use client';

import React, { useState, useRef, useEffect } from 'react';

export default function ScreenRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordedVideo, setRecordedVideo] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [recordingTime, setRecordingTime] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      const chunks: Blob[] = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordedVideo(url);
        setRecordedChunks([]);
      };

      mediaRecorder.start();
      setIsRecording(true);
      
      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);

      // Stop when stream ends
      stream.getVideoTracks()[0].onended = () => {
        stopRecording();
      };
    } catch (err) {
      console.error('Error starting recording:', err);
      alert('Could not start screen recording. Please allow screen sharing permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
    }
    setIsRecording(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    setRecordingTime(0);
  };

  const downloadRecording = () => {
    if (!recordedVideo) return;
    const link = document.createElement('a');
    link.href = recordedVideo;
    link.download = `screen-recording-${Date.now()}.webm`;
    link.click();
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-gray-800 rounded-lg overflow-hidden">
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-4">
          <h3 className="text-2xl font-bold">🎥 Screen Recorder</h3>
          <p className="text-gray-200">Record your screen with audio</p>
        </div>

        <div className="p-6 space-y-6">
          {/* Recording Controls */}
          <div className="text-center">
            {!isRecording ? (
              <button
                onClick={startRecording}
                className="px-8 py-4 bg-red-600 hover:bg-red-700 rounded-full text-xl font-bold transition flex items-center gap-2 mx-auto"
              >
                <span className="w-4 h-4 bg-white rounded-full"></span>
                Start Recording
              </button>
            ) : (
              <div className="space-y-4">
                <div className="text-4xl font-mono text-red-500">● {formatTime(recordingTime)}</div>
                <button
                  onClick={stopRecording}
                  className="px-8 py-4 bg-gray-600 hover:bg-gray-700 rounded-full text-xl font-bold transition flex items-center gap-2 mx-auto"
                >
                  <span className="w-4 h-4 bg-white rounded-sm"></span>
                  Stop Recording
                </button>
              </div>
            )}
          </div>

          {/* Instructions */}
          <div className="bg-gray-700 p-4 rounded-lg">
            <h4 className="font-semibold mb-2">📋 How to use:</h4>
            <ol className="list-decimal list-inside space-y-1 text-gray-300 text-sm">
              <li>Click "Start Recording"</li>
              <li>Select the screen/window/tab you want to record</li>
              <li>Click "Share" to allow recording</li>
              <li>Do your screen activity</li>
              <li>Click "Stop Recording" when done</li>
              <li>Download your recording</li>
            </ol>
          </div>

          {/* Preview */}
          {recordedVideo && (
            <div className="space-y-4">
              <h4 className="font-semibold">Preview:</h4>
              <video
                src={recordedVideo}
                controls
                className="w-full rounded-lg"
              />
              <button
                onClick={downloadRecording}
                className="w-full py-3 bg-green-600 hover:bg-green-700 rounded-lg font-bold"
              >
                ⬇️ Download Recording
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
