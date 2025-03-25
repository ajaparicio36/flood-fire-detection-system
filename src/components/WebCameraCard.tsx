"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { AlertTriangle, Droplets, Flame } from "lucide-react";
import type { WaterLevel } from "../App";

interface WebCameraCardProps {
  smokeDetected: boolean;
  rainfallDetected: boolean;
  waterLevel: WaterLevel;
}

const WebCameraCard = ({
  smokeDetected,
  rainfallDetected,
  waterLevel,
}: WebCameraCardProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Access the camera
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraActive(true);
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
        setError("Could not access camera. Please check permissions.");
      }
    };

    startCamera();

    // Store the ref value for cleanup
    const videoElement = videoRef.current;

    // Cleanup function to stop the camera when component unmounts
    return () => {
      if (videoElement && videoElement.srcObject) {
        const stream = videoElement.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

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
          ) : (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="max-h-full max-w-full object-contain"
              onCanPlay={() => setCameraActive(true)}
            />
          )}

          {!cameraActive && !error && (
            <div className="text-white">Initializing camera...</div>
          )}
        </div>

        <div className="p-4 flex flex-wrap gap-2">
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
