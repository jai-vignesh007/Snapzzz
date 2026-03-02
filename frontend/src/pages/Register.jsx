import { useState, useRef, useCallback } from "react";
import axios from "axios";

export default function Register({ onSuccess }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selfie, setSelfie] = useState(null);
  const [preview, setPreview] = useState(null);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    setSelfie(file);
    setPreview(URL.createObjectURL(file));
  };

  const openCamera = async () => {
    setShowCamera(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch {
      setStatus("❌ Camera access denied!");
      setShowCamera(false);
    }
  };

  const capturePhoto = useCallback(() => {
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);
    canvas.toBlob((blob) => {
      const file = new File([blob], "selfie.jpg", { type: "image/jpeg" });
      setSelfie(file);
      setPreview(URL.createObjectURL(blob));
      stopCamera();
    }, "image/jpeg");
  }, []);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    setShowCamera(false);
  };

  const handleSubmit = async () => {
    if (!name || !email || !selfie) {
      setStatus("❌ Please fill all fields and upload a selfie!");
      return;
    }
    const formData = new FormData();
    formData.append("name", name);
    formData.append("email", email);
    formData.append("selfie", selfie);
    try {
      setLoading(true);
      setStatus("");
      const res = await axios.post(
        "http://127.0.0.1:8000/api/register",
        formData,
      );
      setStatus(`✅ ${res.data.message}`);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setStatus(`❌ ${err.response?.data?.detail || "Something went wrong!"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-6">
      <div className="bg-gray-900 border border-gray-800 rounded-3xl shadow-2xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold text-cyan-400 mb-1">
          Guest Registration
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Register your face to find your photos instantly!
        </p>

        <input
          type="text"
          placeholder="Your Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-3 mb-4 focus:outline-none focus:border-cyan-500 placeholder-gray-600"
        />
        <input
          type="email"
          placeholder="Your Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-xl p-3 mb-4 focus:outline-none focus:border-cyan-500 placeholder-gray-600"
        />

        {/* Camera View */}
        {showCamera && (
          <div className="mb-4 flex flex-col items-center gap-3">
            <video
              ref={videoRef}
              autoPlay
              className="w-full rounded-2xl border border-cyan-800"
            />
            <div className="flex gap-3">
              <button
                onClick={capturePhoto}
                className="bg-cyan-500 hover:bg-cyan-400 text-black px-6 py-2 rounded-xl font-semibold transition"
              >
                📸 Capture
              </button>
              <button
                onClick={stopCamera}
                className="bg-gray-700 text-gray-300 px-6 py-2 rounded-xl font-semibold transition"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Preview */}
        {preview && !showCamera && (
          <div className="flex flex-col items-center mb-4">
            <img
              src={preview}
              alt="selfie"
              className="w-32 h-32 object-cover rounded-full border-4 border-cyan-500 shadow-lg shadow-cyan-500/20"
            />
            <button
              onClick={() => {
                setSelfie(null);
                setPreview(null);
              }}
              className="text-xs text-red-400 mt-2 hover:text-red-300"
            >
              Remove
            </button>
          </div>
        )}

        {/* Upload Options */}
        {!preview && !showCamera && (
          <div className="flex gap-3 mb-4">
            <button
              onClick={openCamera}
              className="flex-1 border-2 border-dashed border-gray-700 hover:border-cyan-500 rounded-xl p-4 text-center transition"
            >
              <div className="text-2xl mb-1">📷</div>
              <div className="text-gray-500 text-sm">Take Photo</div>
            </button>
            <label className="flex-1 border-2 border-dashed border-gray-700 hover:border-cyan-500 rounded-xl p-4 text-center cursor-pointer transition">
              <div className="text-2xl mb-1">🖼️</div>
              <div className="text-gray-500 text-sm">Upload Photo</div>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-cyan-500 hover:bg-cyan-400 text-black py-3 rounded-xl font-bold transition"
        >
          {loading ? "Registering..." : "Register 🎉"}
        </button>

        {status && (
          <p className="mt-4 text-center text-sm text-gray-400">{status}</p>
        )}
      </div>
    </div>
  );
}
