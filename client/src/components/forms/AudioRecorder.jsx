import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Trash2, AlertCircle } from 'lucide-react';

export const AudioRecorder = ({ onAudioReady, onClearAudio }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [micError, setMicError] = useState(null);

  const mediaRecorderRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setMicError(null);
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setMicError('Your browser does not support audio recording. Please use text description.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/ogg')
        ? 'audio/ogg'
        : 'audio/mp4';

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert blob to file for form submission
        const audioFile = new File([audioBlob], `voicenote-${Date.now()}.${mimeType.includes('webm') ? 'webm' : 'mp3'}`, {
          type: mimeType,
        });

        if (onAudioReady) {
          onAudioReady(audioFile, recordingDuration);
        }

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      timerRef.current = setInterval(() => {
        setRecordingDuration((prev) => {
          if (prev >= 120) {
            // Auto stop at 2 minutes
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Microphone error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setMicError('Microphone permission was denied. Please allow microphone access in browser settings.');
      } else {
        setMicError(`Unable to access microphone: ${err.message}`);
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const clearRecording = () => {
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordingDuration(0);
    if (onClearAudio) onClearAudio();
  };

  const formatTime = (secs) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-900/60">
      <div className="flex items-center justify-between mb-2">
        <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
          <Mic className="w-4 h-4 text-cyan-500" />
          Optional Voice Note Report
        </label>
        <span className="text-xs text-slate-500 dark:text-slate-400">Max 2 mins</span>
      </div>

      {micError && (
        <div className="p-3 mb-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-500" />
          <span>{micError}</span>
        </div>
      )}

      {!audioUrl ? (
        <div className="flex items-center gap-3">
          {!isRecording ? (
            <button
              type="button"
              onClick={startRecording}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-900 dark:bg-cyan-600 dark:hover:bg-cyan-500 text-white rounded-lg text-sm font-medium transition shadow-sm"
            >
              <Mic className="w-4 h-4" />
              Record Voice Note
            </button>
          ) : (
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={stopRecording}
                className="inline-flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-medium animate-pulse transition"
              >
                <Square className="w-4 h-4" />
                Stop Recording ({formatTime(recordingDuration)})
              </button>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-xs text-rose-600 dark:text-rose-400 font-semibold">Recording...</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
          <audio controls src={audioUrl} className="h-9 w-full max-w-sm rounded" />
          <button
            type="button"
            onClick={clearRecording}
            className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
            title="Delete Recording"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
