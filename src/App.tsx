"use client";

import { useState, useEffect } from "react";
import WebCameraCard from "./components/WebCameraCard";
import SensorLogs from "./components/SensorLogs";
import SensorControl from "./components/SensorControl";

// Define sensor state types
export type WaterLevel = "Low" | "Caution" | "DANGER";
export type SensorLog = {
  timestamp: Date;
  message: string;
};

function App() {
  // Sensor states
  const [smokeDetected, setSmokeDetected] = useState<boolean>(false);
  const [rainfallDetected, setRainfallDetected] = useState<boolean>(false);
  const [waterLevel, setWaterLevel] = useState<WaterLevel>("Low");

  // Logs state
  const [logs, setLogs] = useState<SensorLog[]>([
    { timestamp: new Date(), message: "System initialized" },
  ]);

  // Add log entry when sensor states change
  const addLog = (message: string) => {
    setLogs((prevLogs) => [{ timestamp: new Date(), message }, ...prevLogs]);
  };

  // Monitor sensor state changes
  useEffect(() => {
    addLog(`Smoke detector: ${smokeDetected ? "Detected" : "Clear"}`);
  }, [smokeDetected]);

  useEffect(() => {
    addLog(`Rainfall detector: ${rainfallDetected ? "Detected" : "Clear"}`);
  }, [rainfallDetected]);

  useEffect(() => {
    addLog(`Water level changed to: ${waterLevel}`);
  }, [waterLevel]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-800">
          Flood Monitoring System
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WebCameraCard
            smokeDetected={smokeDetected}
            rainfallDetected={rainfallDetected}
            waterLevel={waterLevel}
          />

          <div className="space-y-6">
            <SensorLogs logs={logs} />
            <SensorControl
              smokeDetected={smokeDetected}
              setSmokeDetected={setSmokeDetected}
              rainfallDetected={rainfallDetected}
              setRainfallDetected={setRainfallDetected}
              waterLevel={waterLevel}
              setWaterLevel={setWaterLevel}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
