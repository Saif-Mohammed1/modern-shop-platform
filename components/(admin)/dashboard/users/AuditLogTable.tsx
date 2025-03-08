"use client";
import { lang } from "@/app/lib/utilities/lang";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { usersTranslate } from "@/public/locales/client/(auth)/(admin)/dashboard/usersTranslate";
import { FaFingerprint } from "react-icons/fa";
import { FiMonitor, FiGlobe, FiMapPin } from "react-icons/fi";
interface AuditLogTableProps {
  data: Array<{
    timestamp: Date;
    action: string;
    details: {
      device: {
        browser: string;
        os: string;
        device: string;
        ip: string;
        location: string;
        fingerprint: string;
      };
    };
  }>;
  translations: {
    timestamp: string;
    action: string;
    details: string;
  };
}

// function AuditLogTable({ data, translations }: AuditLogTableProps) {
//   return (
//     <Table>
//       <TableHeader>
//         <TableRow>
//           <TableHead>{translations.timestamp}</TableHead>
//           <TableHead>{translations.action}</TableHead>
//           <TableHead>{translations.details}</TableHead>
//         </TableRow>
//       </TableHeader>
//       <TableBody>
//         {data.map((entry, index) => (
//           <TableRow key={index}>
//             <TableCell className="font-medium">
//               {entry.timestamp.toLocaleString()}
//             </TableCell>
//             <TableCell>{entry.action}</TableCell>
//             <TableCell className="text-muted-foreground">
//               {JSON.stringify(entry.details)}
//             </TableCell>
//           </TableRow>
//         ))}
//       </TableBody>
//     </Table>
//   );
// }
// export default AuditLogTable;
function AuditLogTable({ data, translations }: AuditLogTableProps) {
  const formatDeviceInfo = (device: any) => (
    <div className="space-y-1.5 text-sm">
      <div className="flex items-center gap-2">
        <span className="font-medium">{device.browser}</span>
        <span className="text-muted-foreground">on {device.os}</span>
      </div>
      {/* <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div>
          <span className="text-muted-foreground">Type:</span> {device.device}
        </div>
        <div>
          <span className="text-muted-foreground">IP:</span>
          <span className="font-mono text-xs">{device.ip.slice(0, 6)}...</span>
        </div>
        <div>
          <span className="text-muted-foreground">Location:</span>
          {device.location.includes("Unknown") ? "-" : device.location}
        </div>
        <div>
          <span className="text-muted-foreground">Fingerprint:</span>
          <span className="font-mono text-xs">
            {device.fingerprint.slice(0, 6)}...
          </span>
        </div>
      </div> */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        <div className="flex items-center gap-1">
          <FiMonitor className="text-muted-foreground" size={14} />
          {device.device}
        </div>
        <div className="flex items-center gap-1">
          <FiGlobe className="text-muted-foreground" size={14} />
          <span className="font-mono text-xs">{device.ip.slice(0, 6)}...</span>
        </div>
        <div className="flex items-center gap-1">
          <FiMapPin className="text-muted-foreground" size={14} />
          {device.location.includes("Unknown") ? "-" : device.location}
        </div>
        <div className="flex items-center gap-1">
          <FaFingerprint className="text-muted-foreground" size={14} />
          <span className="font-mono text-xs">
            {device.fingerprint.slice(0, 6)}...
          </span>
        </div>
      </div>
    </div>
  );

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[180px]">{translations.timestamp}</TableHead>
          <TableHead>{translations.action}</TableHead>
          <TableHead>{translations.details}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {entry.timestamp.toLocaleString()}
              {/* {entry.timestamp.toLocaleDateString("en-US", {
                year: "numeric",
                month: "short",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })} */}
            </TableCell>
            <TableCell>
              <span className="capitalize">
                {entry.action.toLowerCase().replace(/_/g, " ")}
              </span>
            </TableCell>
            <TableCell className="overflow-y-auto max-h-[60vh]">
              {entry.details.device
                ? formatDeviceInfo(entry.details.device)
                : usersTranslate.users[lang].editUsers.form.NoDeviceInfo}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default AuditLogTable;
