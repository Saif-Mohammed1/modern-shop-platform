import { Dialog, DialogTitle } from "@headlessui/react";
import { useState } from "react";

import Button from "./Button";

type ConfirmModalProps = {
  title: string;
  children: React.ReactNode;
  onConfirm: () => void;
};

const ConfirmModal = ({ title, children, onConfirm }: ConfirmModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => void setIsOpen(true)}
        className="focus:outline-none"
      >
        {children}
      </button>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className="fixed inset-0 z-10 overflow-y-auto"
      >
        <div className="flex items-center justify-center min-h-screen">
          {/* <Dialog.Overlay className="fixed inset-0 bg-black opacity-30" />  */}

          {/* Custom Overlay (since Dialog.Overlay was removed) */}
          {isOpen ? (
            <button
              type="button"
              aria-label="Close"
              className="fixed inset-0 bg-black opacity-30"
              onClick={() => setIsOpen(false)}
            />
          ) : null}
          <div className="relative bg-white rounded-lg p-6 mx-4 max-w-sm">
            <DialogTitle className="text-lg font-medium mb-4">
              {title}
            </DialogTitle>

            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                danger
                onClick={() => {
                  onConfirm();
                  setIsOpen(false);
                }}
              >
                Confirm
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};

export default ConfirmModal;
