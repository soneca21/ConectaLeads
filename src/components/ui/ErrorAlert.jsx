import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

const ErrorAlert = ({ title = 'Erro', message = 'Algo deu errado.', className }) => (
  <div className={cn('flex items-start gap-3 p-3 rounded-lg border border-red-500/40 bg-red-500/10 text-red-100', className)}>
    <AlertTriangle size={18} className="mt-0.5" />
    <div>
      <p className="font-semibold">{title}</p>
      {message && <p className="text-sm text-red-100/80">{message}</p>}
    </div>
  </div>
);

export default ErrorAlert;
