
import React from 'react';
import Modal from './Modal';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText = "Confirmar", isDestructive = false }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`p-3 rounded-full ${isDestructive ? 'bg-red-500/10 text-red-500' : 'bg-orange-500/10 text-orange-500'}`}>
          <AlertTriangle size={32} />
        </div>
        <p className="text-gray-300">{message}</p>
        <div className="flex w-full gap-3 pt-4">
          <Button variant="outline" className="flex-1 border-white/10 text-white hover:bg-white/5" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            className={`flex-1 text-white ${isDestructive ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'}`}
            onClick={() => {
              onConfirm();
              onClose();
            }}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ConfirmDialog;
