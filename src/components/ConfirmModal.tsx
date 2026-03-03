import { AlertTriangle, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel
}: ConfirmModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/20 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white rounded-xl shadow-xl border border-ink/10 w-full max-w-md overflow-hidden"
          >
            <div className="flex items-center justify-between p-4 border-b border-ink/5 bg-stone/30">
              <div className="flex items-center space-x-2 text-burgundy">
                <AlertTriangle className="w-5 h-5" />
                <h2 className="font-medium">{title}</h2>
              </div>
              <button 
                onClick={onCancel}
                className="p-1 text-ink/50 hover:text-ink transition-colors rounded-md hover:bg-stone"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6">
              <p className="text-ink/80 text-sm leading-relaxed">
                {message}
              </p>
            </div>
            
            <div className="flex items-center justify-end space-x-3 p-4 border-t border-ink/5 bg-stone/10">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-ink/70 hover:text-ink transition-colors"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                }}
                className="px-4 py-2 bg-burgundy text-white rounded-md text-sm font-medium hover:bg-burgundy/90 transition-colors shadow-sm"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
