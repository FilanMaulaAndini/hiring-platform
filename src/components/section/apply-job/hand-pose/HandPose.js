"use client";
import React, { useRef, useState, useEffect } from "react";
import styles from "./HandPose.module.css";
import { HandLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import { FaChevronRight } from "react-icons/fa6";

export default function HandPose({ isOpen, closeModal, handleChange }) {
  const videoRef = useRef(null);
const canvasRef = useRef(null);

// Change these from let to useRef
const animationFrameIdRef = useRef(null);
const activeStreamRef = useRef(null);
const lastGestureRef = useRef(null);
const stageProgressRef = useRef(3);

const [currentPose, setCurrentPose] = useState(0);
const [handLandmarker, setHandLandmarker] = useState(null);
const [cameraStream, setCameraStream] = useState(null);
const [stage, setStage] = useState(3);
const [countdown, setCountdown] = useState(null);
const [photo, setPhoto] = useState(null);
const [isCounting, setIsCounting] = useState(false);
const [isDetecting, setIsDetecting] = useState(true);
const [retakePhoto, setRetakePhoto] = useState(false);

// ✅ Your poses array
const poses = [
  {
    id: 3,
    name: "3 fingers",
    icon: "/icons/three-fingers.svg",
  },
  {
    id: 2,
    name: "2 fingers",
    icon: "/icons/two-fingers.svg",
  },
  {
    id: 1,
    name: "1 finger",
    icon: "/icons/one-finger.svg",
  },
];

useEffect(() => {
  const initModel = async () => {
    try {
      const vision = await FilesetResolver.forVisionTasks(
        "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision/wasm"
      );

      const landmarker = await HandLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task",
        },
        runningMode: "VIDEO",
        numHands: 1,
      });

      setHandLandmarker(landmarker);
      console.log("✅ HandLandmarker loaded successfully");
    } catch (err) {
      console.error("❌ Failed to initialize model:", err);
    }
  };

  initModel();
}, [retakePhoto]);

// Camera + detection loop
useEffect(() => {
  if (!isOpen || !handLandmarker) return;

  startCamera();

  return () => {
    stopCamera();
  };
}, [isOpen, handLandmarker, retakePhoto]);

const startCamera = async () => {
  try {
    console.log("start again");
    
    // Stop existing camera first
    stopCamera();
    
    // Reset refs
    lastGestureRef.current = null;
    stageProgressRef.current = 3;
    
    setStage(3);
    setIsDetecting(true);
    setIsCounting(false);
    setCountdown(null);

    const mediaStream = await navigator.mediaDevices.getUserMedia({
      video: { width: 640, height: 480 },
    });
    
    activeStreamRef.current = mediaStream;
    setCameraStream(mediaStream);

    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      await videoRef.current.play();
    }

    detectHands();
  } catch (err) {
    console.error("❌ Error accessing camera:", err);
  }
};

const detectHands = () => {
  console.log("hands again");
  const video = videoRef.current;
  const canvas = canvasRef.current;
  if (!video || !canvas) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth || 640;
  canvas.height = video.videoHeight || 480;

  const renderFrame = async () => {
    console.log("render again");
    if (!handLandmarker || !video || video.readyState < 2) {
      animationFrameIdRef.current = requestAnimationFrame(renderFrame);
      return;
    }

    const startTimeMs = performance.now();
    const results = await handLandmarker.detectForVideo(video, startTimeMs);

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    if (!isCounting && results.landmarks?.length > 0 && isDetecting) {
      const landmarks = results.landmarks[0];
      drawLandmarks(ctx, landmarks, canvas);

      const raised = countRaisedFingers(landmarks);
      if (raised !== lastGestureRef.current) {
        lastGestureRef.current = raised;

        if (raised === stageProgressRef.current) {
          setCurrentPose(raised);
          console.log(`✋ Detected ${raised} fingers`);
          
          if (stageProgressRef.current > 1) {
            stageProgressRef.current -= 1;
            setStage(stageProgressRef.current);
          } else if (stageProgressRef.current === 1) {
            console.log("✅ Gesture sequence complete — start countdown");
            setIsDetecting(false);
            startCountdown();
          }
        }
      }
    }

    animationFrameIdRef.current = requestAnimationFrame(renderFrame);
  };

  renderFrame();
};

const drawLandmarks = (ctx, landmarks, canvas) => {
  console.log("landmark again");
  ctx.fillStyle = "rgba(0, 169, 173, 0.4)";
  landmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(lm.x * canvas.width, lm.y * canvas.height, 5, 0, 2 * Math.PI);
    ctx.fill();
  });
};

const countRaisedFingers = (landmarks) => {
  const fingers = [8, 12, 16, 20];
  return fingers.filter((f) => landmarks[f].y < landmarks[f - 2].y).length;
};

const startCountdown = () => {
  console.log("countdown again");
  setIsCounting(true);
  let counter = 3;
  setCountdown(counter);

  const interval = setInterval(() => {
    counter -= 1;
    if (counter > 0) {
      setCountdown(counter);
    } else {
      clearInterval(interval);
      setCountdown(null);
      capturePhoto();
      setIsCounting(false);
    }
  }, 1000);
};

const capturePhoto = () => {
  const canvas = canvasRef.current;
  canvas.toBlob((blob) => {
    if (!blob) return;

    const url = URL.createObjectURL(blob);
    setPhoto(url);

    console.log("📸 Captured final photo Blob:", blob);
    console.log("🌐 Object URL for preview:", url);
    
    // Stop camera after capturing photo
    stopCamera();
  }, "image/png");
};

const stopCamera = () => {
  console.log("🛑 Stopping camera...");
  
  // Cancel animation frame
  if (animationFrameIdRef.current) {
    cancelAnimationFrame(animationFrameIdRef.current);
    animationFrameIdRef.current = null;
  }
  
  // Stop all tracks
  if (activeStreamRef.current?.getTracks) {
    activeStreamRef.current.getTracks().forEach((track) => {
      track.stop();
      console.log("Track stopped:", track.kind);
    });
    activeStreamRef.current = null;
  }
  
  // Clear video element
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  
  setCameraStream(null);
};

const retake = () => {
  console.log("🔄 Retaking photo...");
  
  // Reset all states
  lastGestureRef.current = null;
  stageProgressRef.current = 3;
  
  setStage(3);
  setPhoto(null);
  setCountdown(null);
  setIsCounting(false);
  setIsDetecting(true);
  setCurrentPose(0);
  
  // Stop current camera
  stopCamera();
  
  // Wait a bit then restart
  setTimeout(() => {
    setRetakePhoto(!retakePhoto);
  }, 100);
};

const handleSubmit = () => {
  console.log("✅ Submitting photo...");
  
  // Pass photo to parent
  handleChange("profilePicture", photo);
  
  // Stop camera FIRST
  stopCamera();
  
  // Reset all states
  lastGestureRef.current = null;
  stageProgressRef.current = 3;
  
  setStage(3);
  setPhoto(null);
  setCountdown(null);
  setIsCounting(false);
  setIsDetecting(true);
  setCurrentPose(0);
  
  // Close modal
  closeModal();
};
  if (!isOpen) return null;

  return (
    <div className={`${styles.modalOverlay} ${isOpen ? styles.show : ""}`}>
      <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <div>
            <h2 className={styles.modalTitle}>Raise Your Hand to Capture </h2>
            <p>We’ll take the photo once your hand pose is detected.</p>
          </div>

          <button className={styles.closeBtn} onClick={closeModal}>
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          <div>
            <div className={styles.cameraBox}>
              <div className={styles.videoWrapper}>
                {/* <video ref={videoRef} className={styles.videoFeed} playsInline></video> */}

                {/* <canvas
                            ref={canvasRef}
                            width="640"
                            height="480"
                            className={styles.outputCanvas}
                          ></canvas> */}
                {photo ? (
                  <img
                    src={photo}
                    alt="Preview"
                    style={{
                      width: "100%",
                      height: "auto",
                      borderRadius: "8px",
                    }}
                  />
                ) : (
                  <>
                    <video
                      ref={videoRef}
                      width={640}
                      height={480}
                      autoPlay
                      playsInline
                      muted
                    />
                    <canvas
                      ref={canvasRef}
                      width={640}
                      height={480}
                      className={styles.hidden}
                    />
                  </>
                )}

                {countdown && (
                  <div className={styles.countdownWrapper}>
                    Capturing photo in
                    <div className={styles.countdownTitle}>{countdown}</div>
                  </div>
                )}
              </div>

              <div className={styles.instructions}>
                <p>
                  To take a picture, follow the hand poses in the order shown
                  below. The system will automatically capture the image once
                  the final pose is detected.
                </p>
                <div className={styles.poseList}>
                  {poses.map((pose, i) => (
                    <React.Fragment key={pose.id}>
                      <div
                        className={`${styles.poseCard} ${
                          currentPose === pose.id
                            ? styles.activePose
                            : currentPose > pose.id
                              ? styles.donePose
                              : ""
                        }`}
                      >
                        <img src={pose.icon} alt={pose.name}></img>
                      </div>
                      {i < poses.length - 1 && (
                        <div>
                          <FaChevronRight size={25} />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>
            </div>

            {photo && (
              <div className={styles.buttonWrapper}>
                <button onClick={retake} className="btn btn-secondary">
                  Retake Photo
                </button>
                <button className="btn btn-tertiary" onClick={handleSubmit}>
                  Submit
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
