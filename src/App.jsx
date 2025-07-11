import React, { useState, useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

// Main App component
const App = () => {
  // Speech recognition hook
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
    // Capture the error object from the hook
    // The error object will have a 'message' and an 'error' property (e.g., 'no-speech', 'network', 'not-allowed')
    browserSupportsSpeechRecognition: { error: speechRecognitionErrorObject } // Renamed to avoid conflict
  } = useSpeechRecognition();

  // State to hold the specific speech recognition error message for display
  const [displaySpeechError, setDisplaySpeechError] = useState(null);

  // Effect to update the displaySpeechError state when the speech recognition error object changes
  useEffect(() => {
    if (speechRecognitionErrorObject) {
      // Log the full error object for detailed debugging in the console
      console.error("Speech Recognition Error Object:", speechRecognitionErrorObject);
      // Set a user-friendly message based on the error type
      let errorMessage = "An unknown speech recognition error occurred.";
      if (speechRecognitionErrorObject.error) {
        switch (speechRecognitionErrorObject.error) {
          case 'no-speech':
            errorMessage = "No speech detected. Please speak clearly.";
            break;
          case 'not-allowed':
            errorMessage = "Microphone access denied or blocked. Please allow permissions.";
            break;
          case 'network':
            errorMessage = "Network error. Please check your internet connection.";
            break;
          case 'aborted':
            errorMessage = "Speech recognition was aborted.";
            break;
          case 'audio-capture':
            errorMessage = "Audio capture failed. Check microphone or device drivers.";
            break;
          case 'language-not-supported':
            errorMessage = "The specified language is not supported.";
            break;
          case 'service-not-allowed':
            errorMessage = "Speech recognition service not allowed (often due to non-HTTPS).";
            break;
          default:
            errorMessage = `Speech Error: ${speechRecognitionErrorObject.error}`;
        }
      } else if (speechRecognitionErrorObject.message) {
        errorMessage = `Speech Error: ${speechRecognitionErrorObject.message}`;
      }
      setDisplaySpeechError(errorMessage);
    } else {
      // Clear the error message when listening starts or transcript is reset
      setDisplaySpeechError(null);
    }
  }, [speechRecognitionErrorObject]); // Dependency array includes the error object

  // Function to copy text to clipboard
  const copyToClipboard = () => {
    if (transcript) {
      // document.execCommand('copy') is used due to iFrame restrictions for navigator.clipboard.writeText()
      const textarea = document.createElement('textarea');
      textarea.value = transcript;
      document.body.appendChild(textarea);
      textarea.select();
      try {
        document.execCommand('copy');
        console.log('Text copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy text: ', err);
        // Fallback for older browsers or if execCommand fails
        // In a real app, you'd use a custom modal instead of alert
        // NOTE: Per instructions, avoiding alert(). If this were a user-facing message,
        // it would be a custom modal or inline message.
        // For clipboard, execCommand is usually reliable in Canvas.
      }
      document.body.removeChild(textarea);
    }
  };

  // Handle cases where browser does not support speech recognition
  if (!browserSupportsSpeechRecognition) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Browser Not Supported</h1>
          <p className="text-gray-700">
            Your browser does not support the Web Speech API. Please try using Google Chrome for speech recognition functionality.
          </p>
        </div>
      </div>
    );
  }

  // Handle cases where microphone is not available
  if (!isMicrophoneAvailable) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4 font-inter">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Microphone Not Available</h1>
          <p className="text-gray-700">
            Please check your microphone permissions and ensure it's connected.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100 p-4 font-inter">
      <div className="bg-white p-8 rounded-2xl shadow-2xl max-w-2xl w-full text-center border border-gray-200">
        <h1 className="text-4xl font-extrabold text-gray-800 mb-6 tracking-tight">
          Voice to Text Converter
        </h1>
        
        {/* Display Speech Recognition Errors */}
        {displaySpeechError && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {displaySpeechError}</span>
          </div>
        )}
        
        <div className="mb-6">
          <p className="text-lg text-gray-600">
            Microphone: {listening ? (
              <span className="font-semibold text-green-600 animate-pulse">listening...</span>
            ) : (
              <span className="font-semibold text-red-500">off</span>
            )}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <button
            onClick={() => {
              setDisplaySpeechError(null); // Clear previous errors on start
              SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
            }}
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-full shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={listening}
          >
            Start Listening
          </button>
          <button
            onClick={SpeechRecognition.stopListening}
            className="px-6 py-3 bg-red-600 text-white font-semibold rounded-full shadow-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={!listening}
          >
            Stop Listening
          </button>
          <button
            onClick={() => {
              resetTranscript();
              setDisplaySpeechError(null); // Clear errors and transcript on reset
            }}
            className="px-6 py-3 bg-yellow-500 text-white font-semibold rounded-full shadow-md hover:bg-yellow-600 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
          >
            Reset
          </button>
          <button
            onClick={copyToClipboard}
            className="px-6 py-3 bg-purple-600 text-white font-semibold rounded-full shadow-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-75 transition duration-300 ease-in-out transform hover:scale-105"
            disabled={!transcript}
          >
            Copy to Clipboard
          </button>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 min-h-[150px] text-left overflow-auto break-words relative">
          {transcript ? (
            <p className="text-gray-800 text-lg leading-relaxed">{transcript}</p>
          ) : (
            <p className="text-gray-400 text-lg italic">Speak into your microphone...</p>
          )}
        </div>
      </div>

      {/* Tailwind CSS CDN for styling */}
      <script src="https://cdn.tailwindcss.com"></script>
      {/* Google Fonts - Inter */}
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&display=swap" rel="stylesheet" />
      <style>
        {`
          body {
            font-family: 'Inter', sans-serif;
          }
        `}
      </style>
    </div>
  );
};

export default App;
