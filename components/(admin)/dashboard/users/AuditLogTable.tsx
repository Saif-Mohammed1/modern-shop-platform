"use client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface AuditLogTableProps {
  data: Array<{
    timestamp: Date;
    action: string;
    details: object;
  }>;
  translations: {
    timestamp: string;
    action: string;
    details: string;
  };
}

function AuditLogTable({ data, translations }: AuditLogTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>{translations.timestamp}</TableHead>
          <TableHead>{translations.action}</TableHead>
          <TableHead>{translations.details}</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((entry, index) => (
          <TableRow key={index}>
            <TableCell className="font-medium">
              {entry.timestamp.toLocaleString()}
            </TableCell>
            <TableCell>{entry.action}</TableCell>
            <TableCell className="text-muted-foreground">
              {JSON.stringify(entry.details)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
export default AuditLogTable;
