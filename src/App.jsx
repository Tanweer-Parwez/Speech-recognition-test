import React, { useEffect } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';

const App = () => {
  const {
    transcript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition
  } = useSpeechRecognition();

  // Log whenever listening state changes
  useEffect(() => {
    console.log('Listening state changed:', listening);
  }, [listening]);

  // Log whenever transcript state changes
  useEffect(() => {
    console.log('Transcript state changed:', transcript);
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <span>Browser doesn't support speech recognition.</span>;
  }

  return (
    <div>
      <p>Microphone: {listening ? 'on' : 'off'}</p>
      <button onClick={() => {
        console.log('Attempting to start listening...');
        SpeechRecognition.startListening({ continuous: true, language: 'en-US' }); // Add language just in case
      }}>Start</button>
      <button onClick={() => {
        console.log('Attempting to stop listening...');
        SpeechRecognition.stopListening();
      }}>Stop</button>
      <button onClick={() => {
        console.log('Attempting to reset transcript...');
        resetTranscript();
      }}>Reset</button>
      <p>{transcript}</p>
    </div>
  );
};

export default App;