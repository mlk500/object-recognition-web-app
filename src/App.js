import React, { useEffect, useState, useRef } from 'react';
import * as tf from '@tensorflow/tfjs';

const App = () => {
  const [model, setModel] = useState(null);
  const [modelLoadingError, setModelLoadingError] = useState('');
  const videoRef = useRef(null); // Reference to the video element for webcam

  useEffect(() => {
    // Load the TensorFlow.js model
    const loadModel = async () => {
      try {
        const model = await tf.loadLayersModel(process.env.PUBLIC_URL + '/tfjs_model/model.json');
        setModel(model);
      } catch (error) {
        console.error('Model loading failed:', error);
        setModelLoadingError('Failed to load the model');
      }
    };

    // Access the webcam
    const setupWebcam = async () => {
      if (navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
          .then(stream => {
            if (videoRef.current) videoRef.current.srcObject = stream;
          })
          .catch(error => {
            console.error('Error accessing the webcam:', error);
          });
      }
    };

    loadModel();
    setupWebcam();
  }, []);

// Function to capture image from webcam and make a prediction
const captureAndPredict = async () => {
  if (videoRef.current && model) {
    // Capture image from the webcam
    const video = videoRef.current;
    const tensor = tf.browser.fromPixels(video)
      .resizeBilinear([224, 224]) // Resize to match model's expected input
      .toFloat()
      .expandDims(0)
      .div(tf.scalar(255.0)); // Normalize pixel values

    // Predict
    const prediction = await model.predict(tensor).data();
    const predictedIndex = prediction.indexOf(Math.max(...prediction));

    // Assuming you have a state or a way to know which object was selected
    // Let's say selectedObjectIndex is the index of the selected object
    if(predictedIndex === selectedObjectIndex) {
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
      <video ref={videoRef} autoPlay playsInline style={{ width: '100%' }}></video>
      <button onClick={captureAndPredict}>Capture and Predict</button>
    </div>
  );
};

export default App;
