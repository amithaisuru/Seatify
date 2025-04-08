import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle } from 'lucide-react';  

function Toast({ type = 'success', message, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();  // Auto close after 3 seconds
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 100 }}
        transition={{ duration: 0.4 }}
        className={`fixed top-6 right-6 z-50 flex items-center justify-between gap-4 px-6 py-4 rounded-lg shadow-lg text-white
          ${type === 'success' ? 'bg-green-500' : 'bg-red-500'}
          w-80
        `}
      >
        <div className="flex items-center gap-3">
          {/* Icon based on type */}
          {type === 'success' ? (
            <CheckCircle size={24} className="text-white" />
          ) : (
            <XCircle size={24} className="text-white" />
          )}
          <div className="flex flex-col">
            <div className="text-md font-semibold">
              {type === 'success' ? 'Success' : 'Error'}
            </div>
            <div className="text-sm font-medium">
              {message}
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="text-white text-xl leading-none hover:text-gray-200"
        >
          ×
        </button>
      </motion.div>
    </AnimatePresence>
  );
}

export default Toast;
