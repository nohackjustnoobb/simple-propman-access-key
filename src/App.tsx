import { useState, useEffect, useRef } from "react";
import QRCode from "qrcode";
import "./App.css";
import { generateQRCodeData } from "./generateQRCodeData";

const STORAGE_KEY = "propman-access-key-config";

// Helper to get initial config from URL or localStorage
const getInitialConfig = () => {
  const urlParams = new URLSearchParams(window.location.search);
  const urlKey = urlParams.get("key");
  const urlChecol = urlParams.get("checol");
  const urlOffset = urlParams.get("offset");

  // If URL params exist, use them
  if (urlKey !== null || urlChecol !== null || urlOffset !== null) {
    const config = {
      key: urlKey || "",
      checol: urlChecol || "",
      offset: urlOffset || "",
    };
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
    return config;
  }

  // Otherwise, load from localStorage
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (err) {
    console.error("Error loading config from localStorage:", err);
  }

  return { key: "", checol: "", offset: "" };
};

function App() {
  const initialConfig = getInitialConfig();
  const [key, setKey] = useState(initialConfig.key);
  const [checol, setChecol] = useState(initialConfig.checol);
  const [offset, setOffset] = useState(initialConfig.offset);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [qrData, setQrData] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Save config to localStorage and sync with URL whenever it changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ key, checol, offset }));

    // Update URL parameters
    const params = new URLSearchParams();
    if (key) params.set("key", key);
    if (checol) params.set("checol", checol);
    if (offset) params.set("offset", offset);

    const newSearch = params.toString();
    const newUrl = newSearch ? `?${newSearch}` : window.location.pathname;
    window.history.replaceState({}, "", newUrl);
  }, [key, checol, offset]);

  useEffect(() => {
    const generateQRCode = async () => {
      if (canvasRef.current) {
        try {
          const data = generateQRCodeData(key, checol, offset);
          setQrData(data);
          await QRCode.toCanvas(canvasRef.current, data, {
            width: 300,
            margin: 2,
          });
        } catch (err) {
          console.error("Error generating QR code:", err);
        }
      }
    };

    // Generate immediately
    generateQRCode();

    // Set up interval to generate every second
    const interval = setInterval(generateQRCode, 1000);

    return () => clearInterval(interval);
  }, [key, checol, offset]);

  return (
    <div className="app-container">
      <h1 className="app-title">Access Key</h1>

      <div className="config-section">
        <button
          className="config-toggle"
          onClick={() => setIsConfigOpen(!isConfigOpen)}
        >
          {isConfigOpen ? "▼ " : "▶ "} Configuration
        </button>

        {isConfigOpen && (
          <div className="config-inputs">
            <div className="input-group">
              <label htmlFor="key" className="input-label">
                Key:
              </label>
              <input
                id="key"
                type="text"
                value={key}
                onChange={(e) => setKey(e.target.value)}
                placeholder="Enter key"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor="checol" className="input-label">
                Checol:
              </label>
              <input
                id="checol"
                type="text"
                value={checol}
                onChange={(e) => setChecol(e.target.value)}
                placeholder="Enter checol"
                className="input-field"
              />
            </div>

            <div className="input-group">
              <label htmlFor="offset" className="input-label">
                Offset:
              </label>
              <input
                id="offset"
                type="text"
                value={offset}
                onChange={(e) => setOffset(e.target.value)}
                placeholder="Enter offset"
                className="input-field"
              />
            </div>
          </div>
        )}
      </div>

      <div className="qr-container">
        <canvas ref={canvasRef} className="qr-canvas" />
      </div>

      {qrData && (
        <div className="qr-data">
          <code>{qrData}</code>
        </div>
      )}
    </div>
  );
}

export default App;
