/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
const BACKEND_URL = "http://192.168.1.30:5000";

// Updated water level thresholds
const WATER_LEVEL_THRESHOLDS = {
  DANGER: 500,
  CAUTION: 250,
};

function App() {
  // Socket connection state
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState<boolean>(false);

  // Sensor states
  const [smokeDetected, setSmokeDetected] = useState<boolean>(false);
  const [rainfallDetected, setRainfallDetected] = useState<boolean>(false);
  const [waterLevel, setWaterLevel] = useState<WaterLevel>("Low");

  // Refs for tracking latest values without re-rendering
  const latestSmokeRef = useRef(smokeDetected);
  const latestRainRef = useRef(rainfallDetected);
  const latestWaterLevelRef = useRef(waterLevel);

  // Logs state
  const [logs, setLogs] = useState<SensorLog[]>([
    { timestamp: new Date(), message: "System initialized" },
  ]);

  // Add log entry
  const addLog = useCallback((message: string) => {
    setLogs((prevLogs) => [
      { timestamp: new Date(), message },
      ...prevLogs.slice(0, 99),
    ]);
  }, []);

  // Update refs when state changes
  useEffect(() => {
    latestSmokeRef.current = smokeDetected;
  }, [smokeDetected]);

  useEffect(() => {
    latestRainRef.current = rainfallDetected;
  }, [rainfallDetected]);

  useEffect(() => {
    latestWaterLevelRef.current = waterLevel;
  }, [waterLevel]);

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket"],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

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

  // Listen for sensor data with optimized handler registration
  useEffect(() => {
    if (!socket) return;

    // Smoke sensor events
    const handleSmokeReading = (data: any) => {
      console.log(data);
      if (data.smoke_detected !== latestSmokeRef.current) {
        setSmokeDetected(data.smoke_detected);
        addLog(`Smoke sensor reading: ${data.value}`);
      }
    };

    const handleSmokeAlert = (data: any) => {
      console.log(data);
      addLog(`ALERT: ${data.message}`);
    };

    // Rain sensor events
    const handleRainReading = (data: any) => {
      console.log(data);
      if (data.rain_detected !== latestRainRef.current) {
        setRainfallDetected(data.rain_detected);
        addLog(`Rain sensor reading: ${data.value}`);
      }
    };

    const handleRainAlert = (data: any) => {
      console.log(data);
      addLog(`ALERT: ${data.message}`);
    };

    // Water level events
    const handleWaterLevelReading = (data: any) => {
      // Map the sensor value to our water level type using updated thresholds
      let newWaterLevel: WaterLevel = "Low";

      if (data.value >= WATER_LEVEL_THRESHOLDS.DANGER) {
        newWaterLevel = "DANGER";
      } else if (data.value >= WATER_LEVEL_THRESHOLDS.CAUTION) {
        newWaterLevel = "Caution";
      }

      if (newWaterLevel !== latestWaterLevelRef.current) {
        setWaterLevel(newWaterLevel);
        addLog(`Water level reading: ${data.value} (${newWaterLevel})`);
      }
    };

    const handleWaterLevelAlert = (data: any) => {
      addLog(`ALERT: ${data.message}`);
    };

    // Register all event handlers
    socket.on("smoke_sensor_reading", handleSmokeReading);
    socket.on("smoke_alert", handleSmokeAlert);
    socket.on("rain_sensor_reading", handleRainReading);
    socket.on("rain_alert", handleRainAlert);
    socket.on("water_level_reading", handleWaterLevelReading);
    socket.on("water_level_alert", handleWaterLevelAlert);

    // Cleanup listeners on unmount or socket change
    return () => {
      socket.off("smoke_sensor_reading", handleSmokeReading);
      socket.off("smoke_alert", handleSmokeAlert);
      socket.off("rain_sensor_reading", handleRainReading);
      socket.off("rain_alert", handleRainAlert);
      socket.off("water_level_reading", handleWaterLevelReading);
      socket.off("water_level_alert", handleWaterLevelAlert);
    };
  }, [socket, addLog]);

  // Poll for latest state every second to ensure UI is up to date
  useEffect(() => {
    if (!connected) return;

    const intervalId = setInterval(() => {
      // Force UI update with latest values if needed
      setSmokeDetected(latestSmokeRef.current);
      setRainfallDetected(latestRainRef.current);
      setWaterLevel(latestWaterLevelRef.current);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [connected]);

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
