import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const App = () => {
  const [model, setModel] = useState(null);
  const [modelLoadingError, setModelLoadingError] = useState('');
  const [selectedObjectIndex, setSelectedObjectIndex] = useState(null); // State for selected object index
  const videoRef = useRef(null); // Reference to the video element for webcam

  useEffect(() => {
    const loadModel = async () => {
      try {
        const loadedModel = await tf.loadLayersModel(process.env.PUBLIC_URL + '/tfjs_model/model.json');
        setModel(loadedModel);
      } catch (error) {
        console.error('Model loading failed:', error);
        setModelLoadingError('Failed to load the model');
      }
    };

    const setupWebcam = async () => {
      if (navigator.mediaDevices.getUserMedia) {
        const constraints = {
          video: {
            facingMode: "environment" // Prefer the back camera
          }
        };
        try {
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        } catch (error) {
          console.error('Error accessing the webcam:', error);
        }
      }
    };

    loadModel();
    setupWebcam();
  }, []);

  const captureAndPredict = async () => {
    if (videoRef.current && model && selectedObjectIndex !== null) {
      const video = videoRef.current;
      const tensor = tf.browser.fromPixels(video)
        .resizeBilinear([224, 224]) // Resize to match model's expected input
        .toFloat()
        .expandDims(0)
        .div(tf.scalar(255.0)); // Normalize pixel values

      const prediction = await model.predict(tensor).data();
      const predictedIndex = (await prediction).indexOf(Math.max(...prediction));

      if (predictedIndex === selectedObjectIndex) {
        alert("That's it!");
      } else {
        alert("Try again!");
      }

      tensor.dispose(); // Remember to dispose the tensor to free memory
    }
  };

  if (modelLoadingError) {
    return <div>Error loading the model: {modelLoadingError}</div>;
  }

  if (!model) {
    return <div>Loading model...</div>;
  }

  return (
    <div>
      <h1>Model Loaded Successfully</h1>
      <select onChange={(e) => setSelectedObjectIndex(parseInt(e.target.value, 10))}>
        <option value="">Select an Object</option>
        <option value="0">Object 1</option>
        <option value="1">Object 2</option>
        <option value="2">Object 3</option>
      </select>
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }}></video>
      <button onClick={captureAndPredict}>Capture and Predict</button>
    </div>
  );
};

export default App;
