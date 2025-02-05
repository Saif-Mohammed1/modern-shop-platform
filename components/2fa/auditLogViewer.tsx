import { RiCloseCircleLine } from "react-icons/ri";

interface LogEntry {
  timestamp: Date;
  action: string;
  metadata: {
    ipAddress: string;
    userAgent: string;
  };
}
const AuditLogViewer = ({
  logs,
  onClose,
}: {
  logs: LogEntry[];
  onClose: () => void;
}) => (
  <div className="space-y-6 ">
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-lg font-semibold">Security History</h2>
      <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
        <RiCloseCircleLine className="w-5 h-5" />
      </button>
    </div>

    <div className="divide-y divide-gray-200 max-h-screen overflow-y-auto">
      {logs.map((log, index) => (
        <div key={index} className="py-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-gray-800">
                {log.action.replace(/_/g, " ")}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(log.timestamp).toLocaleDateString()} •{" "}
                {log.metadata.ipAddress}
              </p>
            </div>
            <span className="text-sm text-gray-500">
              {new Date(log.timestamp).toLocaleTimeString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);
export default AuditLogViewer;
