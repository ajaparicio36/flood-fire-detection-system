import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import type { SensorLog } from "../App";
import { useEffect, useState } from "react";

interface SensorLogsProps {
  logs: SensorLog[];
}

const SensorLogs = ({ logs }: SensorLogsProps) => {
  const [showDebug, setShowDebug] = useState(false);

  // Log data when logs change
  useEffect(() => {
    console.log("Sensor logs received:", logs);
  }, [logs]);

  // Format timestamp to a detailed format
  const formatTimestamp = (timestamp: Date) => {
    // Convert string to Date if it's not already a Date object
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);

    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    });
  };

  return (
    <Card className="backdrop-blur-md bg-white/70 border border-blue-100 shadow-lg">
      <CardHeader className="bg-blue-600/10 border-b border-blue-100">
        <CardTitle className="pt-5 text-blue-800">
          Sensor Logs
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="ml-2 text-xs bg-blue-100 hover:bg-blue-200 px-2 py-1 rounded text-blue-700"
          >
            {showDebug ? "Hide Debug" : "Show Debug"}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {showDebug && (
          <div className="p-3 bg-gray-100 border-b border-blue-100 text-xs font-mono">
            <div>Logs count: {logs.length}</div>
            <pre className="overflow-auto max-h-[100px]">
              {JSON.stringify(logs, null, 2)}
            </pre>
          </div>
        )}
        <ScrollArea className="h-[300px] p-4">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No logs available</p>
          ) : (
            <ul className="space-y-2">
              {logs.map((log, index) => (
                <li
                  key={index}
                  className="border-b border-blue-50 pb-2 last:border-0"
                >
                  <span className="text-xs font-mono text-blue-600 block">
                    {formatTimestamp(log.timestamp)}
                  </span>
                  <span className="text-sm text-gray-700">{log.message}</span>
                </li>
              ))}
            </ul>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default SensorLogs;
