"use client";

import { useState, useEffect, useCallback } from "react";
import WebCameraCard from "./components/WebCameraCard";
import SensorLogs from "./components/SensorLogs";
import { io, Socket } from "socket.io-client";

// Define sensor state types
export type WaterLevel = "Low" | "Caution" | "DANGER";
export type SensorLog = {
  timestamp: Date;
  message: string;
};

// Backend API URL
const BACKEND_URL = "http://localhost:5000";

function App() {
  // Socket connection state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  // Sensor states
  const [smokeDetected, setSmokeDetected] = useState<boolean>(false);
  const [rainfallDetected, setRainfallDetected] = useState<boolean>(false);
  const [waterLevel, setWaterLevel] = useState<WaterLevel>("Low");

  // Logs state
  const [logs, setLogs] = useState<SensorLog[]>([
    { timestamp: new Date(), message: "System initialized" },
  ]);

  // Add log entry
  const addLog = useCallback((message: string) => {
    setLogs((prevLogs) => [{ timestamp: new Date(), message }, ...prevLogs]);
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL);

    newSocket.on("connect", () => {
      setConnected(true);
      addLog("Connected to server");
    });

    newSocket.on("disconnect", () => {
      setConnected(false);
      addLog("Disconnected from server");
    });

    newSocket.on("connection_status", (data) => {
      addLog(`Server status: ${data.status}`);
    });

    // Set socket state
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      newSocket.disconnect();
    };
  }, [addLog]);

  // Listen for sensor data
  useEffect(() => {
    if (!socket) return;

    // Smoke sensor events
    socket.on("smoke_sensor_reading", (data) => {
      setSmokeDetected(data.smoke_detected);
      addLog(`Smoke sensor reading: ${data.value}`);
    });

    socket.on("smoke_alert", (data) => {
      addLog(`ALERT: ${data.message}`);
    });

    // Rain sensor events
    socket.on("rain_sensor_reading", (data) => {
      setRainfallDetected(data.rain_detected);
      addLog(`Rain sensor reading: ${data.value}`);
    });

    socket.on("rain_alert", (data) => {
      addLog(`ALERT: ${data.message}`);
    });

    // Water level events
    socket.on("water_level_reading", (data) => {
      // Map the sensor value to our water level type
      let newWaterLevel: WaterLevel = "Low";
      if (data.high_water_level) {
        newWaterLevel = "DANGER";
      } else if (data.value > 300) {
        // Arbitrary middle threshold
        newWaterLevel = "Caution";
      }

      setWaterLevel(newWaterLevel);
      addLog(`Water level reading: ${data.value}`);
    });

    socket.on("water_level_alert", (data) => {
      addLog(`ALERT: ${data.message}`);
    });

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off("smoke_sensor_reading");
      socket.off("smoke_alert");
      socket.off("rain_sensor_reading");
      socket.off("rain_alert");
      socket.off("water_level_reading");
      socket.off("water_level_alert");
    };
  }, [socket, addLog]);

  // Original state change logs (preserved for manual testing)
  useEffect(() => {
    if (!connected) return; // Skip logging state changes when not connected
    addLog(`Smoke detector: ${smokeDetected ? "Detected" : "Clear"}`);
  }, [smokeDetected, connected, addLog]);

  useEffect(() => {
    if (!connected) return; // Skip logging state changes when not connected
    addLog(`Rainfall detector: ${rainfallDetected ? "Detected" : "Clear"}`);
  }, [rainfallDetected, connected, addLog]);

  useEffect(() => {
    if (!connected) return; // Skip logging state changes when not connected
    addLog(`Water level changed to: ${waterLevel}`);
  }, [waterLevel, connected, addLog]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-blue-800">
          Fire and Flood Monitoring System
        </h1>

        {/* Connection status indicator */}
        <div
          className={`text-sm font-medium ${
            connected ? "text-green-600" : "text-red-600"
          }`}
        >
          Status: {connected ? "Connected to server" : "Disconnected"}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <WebCameraCard
            smokeDetected={smokeDetected}
            rainfallDetected={rainfallDetected}
            waterLevel={waterLevel}
          />

          <div className="space-y-6">
            <SensorLogs logs={logs} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
