"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import {
  AlertTriangle,
  Droplets,
  Flame,
  Camera,
  FireExtinguisherIcon,
} from "lucide-react";
import type { WaterLevel } from "../App";

interface WebCameraCardProps {
  smokeDetected: boolean;
  rainfallDetected: boolean;
  waterLevel: WaterLevel;
  socket: any; // Socket.io client instance
}

const WebCameraCard = ({
  smokeDetected,
  rainfallDetected,
  waterLevel,
  socket,
}: WebCameraCardProps) => {
  const [imageData, setImageData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fireDetected, setFireDetected] = useState<boolean>(false);

  useEffect(() => {
    if (!socket) {
      setError("Camera feed unavailable: No connection to server");
      return;
    }

    // Set up socket event listeners for camera data
    const handleCameraData = (data: any) => {
      console.log("Received camera data:", data);

      // Check if this is data from the ML server (processed frame)
      if (data && data.image) {
        // This is a processed frame from the ML server
        setImageData(data.image);
        setFireDetected(Boolean(data.fire_detected));
        setError(null);
      }
      // For backward compatibility with the old format
      else if (data && data.frame) {
        if (typeof data.frame === "string") {
          setImageData(data.frame);
        } else if (typeof data.frame === "object" && data.frame.image) {
          setImageData(data.frame.image);
        }

        setFireDetected(Boolean(data.fire_detected));
        setError(null);
      }
    };

    // Register event handlers
    socket.on("camera_data", handleCameraData);
    socket.on("camera_alert", (data: any) => {
      console.log("Camera alert:", data);
    });

    // Cleanup function
    return () => {
      socket.off("camera_data", handleCameraData);
      socket.off("camera_alert");
    };
  }, [socket]);

  // Get water level badge color
  const getWaterLevelColor = () => {
    switch (waterLevel) {
      case "Low":
        return "bg-green-500";
      case "Caution":
        return "bg-yellow-500";
      case "DANGER":
        return "bg-red-500";
      default:
        return "bg-green-500";
    }
  };

  return (
    <Card className="overflow-hidden backdrop-blur-md bg-white/70 border border-blue-100 shadow-lg">
      <CardHeader className="bg-blue-600/10 border-b border-blue-100">
        <CardTitle className="pt-5 text-blue-800">Live Camera Feed</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="relative aspect-video bg-black flex items-center justify-center">
          {error ? (
            <div className="text-red-500 p-4">{error}</div>
          ) : imageData ? (
            <img
              src={imageData}
              alt="Live camera feed"
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="text-white flex flex-col items-center justify-center">
              <Camera className="h-8 w-8 mb-2" />
              <p>Waiting for camera feed...</p>
            </div>
          )}
        </div>

        <div className="p-4 flex flex-wrap gap-2">
          {fireDetected && (
            <Badge
              variant="destructive"
              className="flex items-center gap-1 animate-pulse"
            >
              <FireExtinguisherIcon className="h-3 w-3" />
              Fire Detected
            </Badge>
          )}

          {smokeDetected && (
            <Badge variant="destructive" className="flex items-center gap-1">
              <Flame className="h-3 w-3" />
              Smoke Detected
            </Badge>
          )}

          {rainfallDetected && (
            <Badge
              variant="secondary"
              className="bg-blue-500 text-white flex items-center gap-1"
            >
              <Droplets className="h-3 w-3" />
              Rainfall Detected
            </Badge>
          )}

          <Badge
            className={`${getWaterLevelColor()} text-white flex items-center gap-1`}
          >
            <AlertTriangle className="h-3 w-3" />
            Water Level: {waterLevel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebCameraCard;
