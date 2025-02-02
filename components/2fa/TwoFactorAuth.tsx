// "use client";
// import { useState, useEffect } from "react";
// import { useSession } from "next-auth/react";
// import QRCode from "react-qr-code";
// import { toast } from "sonner";
// import {
//   ShieldAlert,
//   ShieldCheck,
//   QrCode,
//   RotateCcw,
//   Download,
// } from "lucide-react";
// import { TwoFactorAuthService } from "@/services/2fa.service";
// import type { SecurityMetadata, AuditLog } from "@/types/security";

// export const TwoFactorAuthManager = () => {
//   const { data: session, update } = useSession();
//   const [state, setState] = useState<"loading" | "enabled" | "disabled">(
//     "loading"
//   );
//   const [view, setView] = useState<
//     "main" | "setup" | "verify" | "backup" | "recovery" | "audit"
//   >();
//   const [setupData, setSetupData] = useState<{
//     qrCode: string;
//     manualEntryCode: string;
//     backupCodes: string[];
//   }>();
//   const [securityMetadata, setSecurityMetadata] = useState<SecurityMetadata>();

//   // Initialize component state
//   useEffect(() => {
//     const initialize = async () => {
//       try {
//         const status = session?.user?.isTwoFactorAuthEnabled
//           ? "enabled"
//           : "disabled";
//         setState(status);
//         setView(status === "enabled" ? "main" : undefined);

//         // Collect security metadata
//         const metadata = {
//           ipAddress: window?.connection?.remoteAddress || "",
//           userAgent: navigator.userAgent,
//           deviceHash: crypto.randomUUID(),
//         };
//         setSecurityMetadata(metadata);
//       } catch (error) {
//         toast.error("Failed to initialize security settings");
//         setState("disabled");
//       }
//     };

//     initialize();
//   }, [session]);

//   const handleEnable2FA = async () => {
//     try {
//       const result = await TwoFactorAuthService.initialize2FA(
//         session?.user,
//         securityMetadata!
//       );
//       setSetupData(result);
//       setView("setup");
//       toast.info("Scan QR code to enable 2FA");
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : "2FA setup failed");
//     }
//   };

//   const verify2FAToken = async (token: string) => {
//     try {
//       if (!securityMetadata) throw new Error("Missing security context");

//       await TwoFactorAuthService.verify2FA(
//         session?.user,
//         token,
//         securityMetadata
//       );

//       await update({
//         ...session,
//         user: { ...session?.user, isTwoFactorAuthEnabled: true },
//       });

//       setView("backup");
//       toast.success("2FA enabled successfully");
//     } catch (error) {
//       toast.error(
//         error instanceof Error ? error.message : "Verification failed"
//       );
//     }
//   };

//   const handleDisable2FA = async () => {
//     try {
//       await SecurityVerificationModal({
//         action: "disable_2fa",
//         onSuccess: async () => {
//           await TwoFactorAuthService.disable2FA(
//             session?.user,
//             securityMetadata!
//           );
//           await update({
//             ...session,
//             user: { ...session?.user, isTwoFactorAuthEnabled: false },
//           });
//           setState("disabled");
//           toast.success("2FA disabled successfully");
//         },
//       });
//     } catch (error) {
//       toast.error("Failed to disable 2FA");
//     }
//   };

//   if (state === "loading") {
//     return (
//       <Card className="max-w-2xl mx-auto">
//         <CardHeader>
//           <Skeleton className="h-6 w-1/4" />
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <Skeleton className="h-4 w-full" />
//           <Skeleton className="h-4 w-3/4" />
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card className="max-w-2xl mx-auto">
//       <CardHeader>
//         <CardTitle className="flex items-center gap-2">
//           <ShieldCheck className="w-6 h-6 text-green-500" />
//           Two-Factor Authentication
//         </CardTitle>
//       </CardHeader>

//       <CardContent>
//         {state === "disabled" ? (
//           <div className="space-y-6">
//             <div className="text-muted-foreground">
//               Protect your account with an extra layer of security
//             </div>
//             <Button onClick={handleEnable2FA} className="gap-2">
//               <ShieldCheck className="w-4 h-4" />
//               Enable 2FA
//             </Button>
//           </div>
//         ) : (
//           <>
//             {view === "main" && (
//               <SecurityOverview
//                 onViewRecovery={() => setView("recovery")}
//                 onViewAudit={() => setView("audit")}
//                 onDisable={handleDisable2FA}
//               />
//             )}

//             {view === "setup" && setupData && (
//               <Setup2FAFlow
//                 setupData={setupData}
//                 onVerify={verify2FAToken}
//                 onBack={() => setView("main")}
//               />
//             )}

//             {view === "backup" && setupData?.backupCodes && (
//               <BackupCodeManager
//                 codes={setupData.backupCodes}
//                 onComplete={() => setView("main")}
//               />
//             )}

//             {view === "recovery" && (
//               <RecoveryCodeManagement
//                 onRegenerate={async () => {
//                   const result =
//                     await TwoFactorAuthService.regenerateBackupCodes(
//                       session?.user,
//                       securityMetadata!
//                     );
//                   setSetupData(result);
//                   setView("backup");
//                 }}
//               />
//             )}

//             {view === "audit" && (
//               <AuditLogViewer
//                 userId={session?.user.id}
//                 onClose={() => setView("main")}
//               />
//             )}
//           </>
//         )}
//       </CardContent>
//     </Card>
//   );
// };

// // Sub-components
// const SecurityOverview = ({
//   onViewRecovery,
//   onViewAudit,
//   onDisable,
// }: {
//   onViewRecovery: () => void;
//   onViewAudit: () => void;
//   onDisable: () => void;
// }) => (
//   <div className="space-y-6">
//     <div className="flex items-center gap-2 text-green-500">
//       <ShieldCheck className="w-5 h-5" />
//       <span>Two-factor authentication is active</span>
//     </div>

//     <div className="space-y-4">
//       <Button
//         variant="outline"
//         className="w-full gap-2"
//         onClick={onViewRecovery}
//       >
//         <RotateCcw className="w-4 h-4" />
//         Manage Recovery Codes
//       </Button>

//       <Button variant="outline" className="w-full gap-2" onClick={onViewAudit}>
//         <ShieldAlert className="w-4 h-4" />
//         View Security Logs
//       </Button>

//       <Button variant="destructive" className="w-full" onClick={onDisable}>
//         Disable 2FA
//       </Button>
//     </div>
//   </div>
// );

// const Setup2FAFlow = ({
//   setupData,
//   onVerify,
//   onBack,
// }: {
//   setupData: { qrCode: string; manualEntryCode: string };
//   onVerify: (token: string) => Promise<void>;
//   onBack: () => void;
// }) => {
//   const [token, setToken] = useState("");
//   const [isVerifying, setIsVerifying] = useState(false);

//   return (
//     <div className="space-y-6">
//       <div className="space-y-2">
//         <Label>Step 1: Scan QR Code</Label>
//         <div className="border rounded-lg p-4 flex justify-center bg-white">
//           <QRCode value={setupData.qrCode} size={256} className="w-64 h-64" />
//         </div>
//         <div className="text-sm text-muted-foreground">
//           Use your authenticator app (Google Authenticator, Authy, etc.) to scan
//           this code
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label>Step 2: Manual Entry Code</Label>
//         <Input
//           value={setupData.manualEntryCode}
//           readOnly
//           className="font-mono"
//           onFocus={(e) => e.target.select()}
//         />
//         <div className="text-sm text-muted-foreground">
//           Can't scan the QR code? Enter this code manually in your app
//         </div>
//       </div>

//       <div className="space-y-2">
//         <Label>Step 3: Verify Setup</Label>
//         <Input
//           placeholder="Enter 6-digit code"
//           value={token}
//           onChange={(e) =>
//             setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
//           }
//           className="max-w-[200px]"
//         />
//         <div className="flex gap-2">
//           <Button
//             onClick={async () => {
//               setIsVerifying(true);
//               await onVerify(token);
//               setIsVerifying(false);
//             }}
//             disabled={isVerifying || token.length !== 6}
//           >
//             {isVerifying ? "Verifying..." : "Confirm Activation"}
//           </Button>
//           <Button variant="outline" onClick={onBack}>
//             Cancel
//           </Button>
//         </div>
//       </div>
//     </div>
//   );
// };

// const BackupCodeManager = ({
//   codes,
//   onComplete,
// }: {
//   codes: string[];
//   onComplete: () => void;
// }) => (
//   <div className="space-y-6">
//     <div className="space-y-2">
//       <Label>Emergency Recovery Codes</Label>
//       <div className="border rounded-lg p-4 font-mono space-y-2 bg-muted/50">
//         {codes.map((code, i) => (
//           <div key={i} className="flex justify-between items-center">
//             <span>{code.match(/.{1,4}/g)?.join("-")}</span>
//             <span className="text-muted-foreground text-sm">#{i + 1}</span>
//           </div>
//         ))}
//       </div>
//       <div className="text-sm text-muted-foreground">
//         Save these codes in a secure location. Each code can be used only once.
//       </div>
//     </div>

//     <div className="flex gap-2">
//       <Button
//         variant="outline"
//         className="gap-2"
//         onClick={() => {
//           const blob = new Blob([codes.join("\n")], { type: "text/plain" });
//           const url = URL.createObjectURL(blob);
//           const a = document.createElement("a");
//           a.href = url;
//           a.download = "recovery-codes.txt";
//           a.click();
//         }}
//       >
//         <Download className="w-4 h-4" />
//         Download Codes
//       </Button>
//       <Button onClick={onComplete}>I've Saved My Codes</Button>
//     </div>
//   </div>
// );import { useState, useEffect } from "react";
"use client";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
// import {
//   ShieldAlert,
//   ShieldCheck,
//   QrCode,
//   RotateCcw,
//   Download,
// } from "lucide-react";

import { RiQrCodeLine, RiShieldUserLine } from "react-icons/ri";
import { useEffect, useState } from "react";
import api from "../util/api";
import Image from "next/image";

export const TwoFactorAuthManager = () => {
  const { data: session, update } = useSession();
  const [state, setState] = useState<"loading" | "enabled" | "disabled">(
    "loading"
  );
  const [view, setView] = useState<
    "main" | "setup" | "verify" | "backup" | "recovery" | "audit"
  >();
  const [setupData, setSetupData] = useState<{
    qrCode: string;
    manualEntryCode: string;
    backupCodes: string[];
  }>();
  //   const [securityMetadata, setSecurityMetadata] = useState<SecurityMetadata>();

  // Initialize component state
  // useEffect(() => {
  //   const initialize = async () => {
  //     try {
  //       const status = session?.user?.isTwoFactorAuthEnabled
  //         ? "enabled"
  //         : "disabled";
  //       setState(status);
  //       setView(status === "enabled" ? "main" : undefined);

  //       // Collect security metadata
  //       const metadata = {
  //         ipAddress: "",
  //         userAgent: navigator.userAgent,
  //         deviceHash: crypto.randomUUID(),
  //       };
  //     } catch (error) {
  //       toast.error("Failed to initialize security settings");
  //       setState("disabled");
  //     }
  //   };

  //   initialize();
  // }, [session]);

  useEffect(() => {
    // "main" | "setup" | "verify" | "backup" | "recovery" | "audit";
    setSetupData({
      qrCode:
        "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=HelloWorld",
      manualEntryCode: "123456",
      backupCodes: ["123456", "234567", "345678", "456789", "567890"],
    });
    setView("setup");
    setState("disabled");
  }, [view]);
  const handleEnable2FA = async () => {
    try {
      const { data } = await api.post("/auth/2fa");
      setSetupData(data);
      setView("setup");
      setState("enabled");
      toast.custom("Scan QR code to enable 2FA");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "2FA setup failed");
    }
  };

  const verify2FAToken = async (token: string) => {
    try {
      const result = await api.post("/auth/2fa/verify", { token });

      await update({
        ...session,
        user: { ...session?.user, isTwoFactorAuthEnabled: true },
      });

      setView("backup");
      toast.success("2FA enabled successfully");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Verification failed"
      );
    }
  };

  const handleDisable2FA = async () => {
    try {
      const result = await api.post("/auth/2fa/disable");
      await update({
        ...session,
        user: { ...session?.user, isTwoFactorAuthEnabled: false },
      });
      setState("disabled");
      toast.success("2FA disabled successfully");
    } catch (error) {
      toast.error("Failed to disable 2FA");
    }
  };

  if (state === "loading") {
    return (
      <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
        <div className="flex justify-center items-center h-64">
          <div
            className="spinner-border animate-spin inline-block w-8 h-8 border-4 rounded-full text-gray-500"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center gap-2 mb-4">
        <RiShieldUserLine size={24} className="text-gray-500" />
        <h2 className="text-lg font-bold">Two-Factor Authentication</h2>
      </div>

      {state === "disabled" ? (
        <div className="space-y-6">
          <p className="text-gray-600">
            Protect your account with an extra layer of security
          </p>
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={handleEnable2FA}
          >
            Enable 2FA
          </button>
        </div>
      ) : (
        <>
          {view === "main" && (
            <SecurityOverview
              onViewRecovery={() => setView("recovery")}
              onViewAudit={() => setView("audit")}
              onDisable={handleDisable2FA}
            />
          )}

          {view === "setup" && setupData && (
            <Setup2FAFlow
              setupData={setupData}
              onVerify={verify2FAToken}
              onBack={() => setView("main")}
            />
          )}

          {view === "backup" && setupData?.backupCodes && (
            <BackupCodeManager
              codes={setupData.backupCodes}
              onComplete={() => setView("main")}
            />
          )}

          {view === "recovery" && (
            <RecoveryCodeManagement
              onRegenerate={async () => {
                const result = await api.post("/auth/2fa/recovery");
                setSetupData(result as any);
                setView("backup");
              }}
            />
          )}

          {view === "audit" && (
            <AuditLogViewer
              userId={session?.user?._id.toString() ?? ""}
              onClose={() => setView("main")}
            />
          )}
        </>
      )}
    </div>
  );
};

// Sub-components
const SecurityOverview = ({
  onViewRecovery,
  onViewAudit,
  onDisable,
}: {
  onViewRecovery: () => void;
  onViewAudit: () => void;
  onDisable: () => void;
}) => (
  <div className="space-y-6">
    <div className="flex items-center gap-2 text-green-500">
      <RiShieldUserLine size={24} className="text-green-500" />
      <p>Two-factor authentication is active</p>
    </div>

    <div className="space-y-4">
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded"
        onClick={onViewRecovery}
      >
        Manage Recovery Codes
      </button>

      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded"
        onClick={onViewAudit}
      >
        View Security Logs
      </button>

      <button
        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={onDisable}
      >
        Disable 2FA
      </button>
    </div>
  </div>
);

const Setup2FAFlow = ({
  setupData,
  onVerify,
  onBack,
}: {
  setupData: { qrCode: string; manualEntryCode: string };
  onVerify: (token: string) => Promise<void>;
  onBack: () => void;
}) => {
  const [token, setToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <p>Step 1: Scan QR Code</p>
        <div className="border rounded-lg p-4 flex justify-center bg-white">
          <Image
            src={setupData.qrCode}
            width={256}
            height={256}
            className="w-64 h-64"
            alt="QR Code"
          />
          {/* <QRCode value={setupData.qrCode} size={256} className="w-64 h-64" /> */}
        </div>
        <p className="text-gray-600">
          Use your authenticator app (Google Authenticator, Authy, etc.) to scan
          this code
        </p>
      </div>

      <div className="space-y-2">
        <p>Step 2: Manual Entry Code</p>
        <input
          type="text"
          value={setupData.manualEntryCode}
          readOnly
          className="font-mono p-2 border rounded-lg w-full"
        />
        <p className="text-gray-600">
          Can't scan the QR code? Enter this code manually in your app
        </p>
      </div>

      <div className="space-y-2">
        <p>Step 3: Verify Setup</p>
        <input
          type="text"
          placeholder="Enter 6-digit code"
          value={token}
          onChange={(e) =>
            setToken(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="p-2 border rounded-lg w-full"
        />
        <div className="flex gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            onClick={async () => {
              setIsVerifying(true);
              await onVerify(token);
              setIsVerifying(false);
            }}
            disabled={isVerifying || token.length !== 6}
          >
            {isVerifying ? "Verifying..." : "Confirm Activation"}
          </button>
          <button
            className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded"
            onClick={onBack}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

const BackupCodeManager = ({
  codes,
  onComplete,
}: {
  codes: string[];
  onComplete: () => void;
}) => (
  <div className="space-y-6">
    <div className="space-y-2">
      <p>Emergency Recovery Codes</p>
      <div className="border rounded-lg p-4 font-mono space-y-2 bg-gray-100">
        {codes.map((code, i) => (
          <div key={i} className="flex justify-between items-center">
            <p>{code.match(/.{1,4}/g)?.join("-")}</p>
            <p className="text-gray-600 text-sm">#{i + 1}</p>
          </div>
        ))}
      </div>
      <p className="text-gray-600">
        Save these codes in a secure location. Each code can be used only once.
      </p>
    </div>

    <div className="flex gap-2">
      <button
        className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded"
        onClick={() => {
          const blob = new Blob([codes.join("\n")], { type: "text/plain" });
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "recovery-codes.txt";
          a.click();
        }}
      >
        Download Codes
      </button>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={onComplete}
      >
        I've Saved My Codes
      </button>
    </div>
  </div>
);

const RecoveryCodeManagement = ({
  onRegenerate,
}: {
  onRegenerate: () => Promise<void>;
}) => (
  <div className="space-y-6">
    <p>Recovery Code Management</p>
    <button
      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      onClick={onRegenerate}
    >
      Regenerate Recovery Codes
    </button>
  </div>
);

const AuditLogViewer = ({
  userId,
  onClose,
}: {
  userId: string;
  onClose: () => void;
}) => (
  <div className="space-y-6">
    <p>Audit Log Viewer</p>
    <button
      className="bg-gray-200 hover:bg-gray-300 text-gray-600 font-bold py-2 px-4 rounded"
      onClick={onClose}
    >
      Close
    </button>
  </div>
);
