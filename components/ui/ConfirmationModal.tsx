import {AnimatePresence, motion} from 'framer-motion';

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  cancelText,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
}) => {
  return (
    <AnimatePresence>
      {isOpen ? <motion.div
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          exit={{opacity: 0}}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{y: 20}}
            animate={{y: 0}}
            className="bg-white rounded-lg p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold mb-2">{title}</h3>
            <p className="text-gray-600 mb-4">{message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
              >
                {cancelText}
              </button>
              <button
                onClick={() => void onConfirm()}
                className="px-4 py-2 bg-red-500 text-white hover:bg-red-600 rounded"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div> : null}
    </AnimatePresence>
  );
};
export default ConfirmationModal;
