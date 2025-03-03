// // components/admin/SecurityActionsModal.tsx
// "use client";
// import Button from "@/components/ui/Button";
// import { Dialog } from "@headlessui/react";

// export function SecurityActionsModal({ open, onClose, actions }) {
//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent>
//         <DialogHeader>
//           <DialogTitle>Security Actions</DialogTitle>
//         </DialogHeader>
//         <div className="space-y-2">
//           {actions.map((action, index) => (
//             <Button
//               key={index}
//               variant="outline"
//               className="w-full justify-start"
//               onClick={() => {
//                 action.handler();
//                 onClose();
//               }}
//             >
//               {action.icon}
//               {action.label}
//             </Button>
//           ))}
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
"use client";
import {
  Dialog,
  DialogPanel,
  DialogTitle,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import { Fragment } from "react";
import Button from "@/components/ui/Button";
import { FiX } from "react-icons/fi";

interface SecurityAction {
  label: string;
  icon: React.ReactNode;
  handler: () => void;
}

interface SecurityActionsModalProps {
  open: boolean;
  onClose: () => void;
  actions: SecurityAction[];
}

export function SecurityActionsModal({
  open,
  onClose,
  actions,
}: SecurityActionsModalProps) {
  return (
    <Transition appear show={open} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <TransitionChild
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </TransitionChild>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <TransitionChild
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <DialogPanel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex justify-between items-center mb-4">
                  <DialogTitle
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Security Actions
                  </DialogTitle>
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <FiX className="h-5 w-5 text-gray-500" />
                  </button>
                </div>

                <div className="space-y-2">
                  {actions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="w-full justify-start gap-2"
                      onClick={() => {
                        action.handler();
                        onClose();
                      }}
                    >
                      {action.icon}
                      {action.label}
                    </Button>
                  ))}
                </div>
              </DialogPanel>
            </TransitionChild>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
