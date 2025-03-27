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

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

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

  // Initialize socket connection and set up event listeners
  useEffect(() => {
    console.log("Connecting to backend:", BACKEND_URL);
    const newSocket = io(BACKEND_URL, {
      transports: ["websocket", "polling"],
      withCredentials: true,
      extraHeaders: {
        "Access-Control-Allow-Origin": "*",
      },
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      setConnected(true);
      addLog("Connected to server");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
      setConnected(false);
      addLog(`Disconnected from server: ${reason}`);
    });

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
    newSocket.on("smoke_sensor_reading", (data: any) => {
      handleSmokeReading(data);
    });
    newSocket.on("smoke_alert", (data: any) => {
      handleSmokeAlert(data);
    });
    newSocket.on("rain_sensor_reading", (data: any) => {
      handleRainReading(data);
    });
    newSocket.on("rain_alert", (data: any) => {
      handleRainAlert(data);
    });
    newSocket.on("water_level_reading", (data: any) => {
      handleWaterLevelReading(data);
    });
    newSocket.on("water_level_alert", (data: any) => {
      handleWaterLevelAlert(data);
    });

    // Set socket state
    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up socket connection");
      newSocket.off("smoke_sensor_reading", handleSmokeReading);
      newSocket.off("smoke_alert", handleSmokeAlert);
      newSocket.off("rain_sensor_reading", handleRainReading);
      newSocket.off("rain_alert", handleRainAlert);
      newSocket.off("water_level_reading", handleWaterLevelReading);
      newSocket.off("water_level_alert", handleWaterLevelAlert);
      newSocket.disconnect();
    };
  }, [addLog]);

  // Poll for latest state every second to ensure UI is up to date
  // useEffect(() => {
  //   if (!connected) return;

  //   const intervalId = setInterval(() => {
  //     // Force UI update with latest values if needed
  //     setSmokeDetected(latestSmokeRef.current);
  //     setRainfallDetected(latestRainRef.current);
  //     setWaterLevel(latestWaterLevelRef.current);
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, [connected]);

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
            socket={socket}
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
