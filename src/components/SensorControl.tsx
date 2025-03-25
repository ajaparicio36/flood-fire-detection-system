"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Switch } from "../components/ui/switch";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Flame, Droplets, AlertTriangle } from "lucide-react";
import type { WaterLevel } from "../App";

interface SensorControlProps {
  smokeDetected: boolean;
  setSmokeDetected: (value: boolean) => void;
  rainfallDetected: boolean;
  setRainfallDetected: (value: boolean) => void;
  waterLevel: WaterLevel;
  setWaterLevel: (value: WaterLevel) => void;
}

const SensorControl = ({
  smokeDetected,
  setSmokeDetected,
  rainfallDetected,
  setRainfallDetected,
  waterLevel,
  setWaterLevel,
}: SensorControlProps) => {
  return (
    <Card className="backdrop-blur-md bg-white/70 border border-blue-100 shadow-lg">
      <CardHeader className="bg-blue-600/10 border-b border-blue-100">
        <CardTitle className="text-blue-800 pt-5">Sensor Control</CardTitle>
        <CardDescription>For UI demonstration only</CardDescription>
      </CardHeader>
      <CardContent className="p-4 space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Flame className="h-4 w-4 text-red-500" />
              <Label htmlFor="smoke-toggle" className="font-medium">
                Smoke Detector
              </Label>
            </div>
            <Switch
              id="smoke-toggle"
              checked={smokeDetected}
              onCheckedChange={setSmokeDetected}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <Label htmlFor="rainfall-toggle" className="font-medium">
                Rainfall Detector
              </Label>
            </div>
            <Switch
              id="rainfall-toggle"
              checked={rainfallDetected}
              onCheckedChange={setRainfallDetected}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            <Label className="font-medium">Water Level</Label>
          </div>

          <RadioGroup
            value={waterLevel}
            onValueChange={(value) => setWaterLevel(value as WaterLevel)}
            className="grid grid-cols-3 gap-2"
          >
            <div className="flex items-center space-x-2 border border-green-200 rounded-md p-2 bg-green-50">
              <RadioGroupItem value="Low" id="water-low" />
              <Label htmlFor="water-low" className="text-green-700">
                Low
              </Label>
            </div>

            <div className="flex items-center space-x-2 border border-yellow-200 rounded-md p-2 bg-yellow-50">
              <RadioGroupItem value="Caution" id="water-caution" />
              <Label htmlFor="water-caution" className="text-yellow-700">
                Caution
              </Label>
            </div>

            <div className="flex items-center space-x-2 border border-red-200 rounded-md p-2 bg-red-50">
              <RadioGroupItem value="DANGER" id="water-danger" />
              <Label htmlFor="water-danger" className="text-red-700">
                DANGER
              </Label>
            </div>
          </RadioGroup>
        </div>
      </CardContent>
    </Card>
  );
};

export default SensorControl;
