import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { ScrollArea } from "../components/ui/scroll-area";
import type { SensorLog } from "../App";

interface SensorLogsProps {
  logs: SensorLog[];
}

const SensorLogs = ({ logs }: SensorLogsProps) => {
  // Format timestamp to a detailed format
  const formatTimestamp = (date: Date) => {
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
        <CardTitle className="text-blue-800">Sensor Logs</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
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
