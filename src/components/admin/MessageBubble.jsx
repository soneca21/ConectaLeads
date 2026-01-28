
import React from 'react';
import { cn } from '@/lib/utils';
import { Check, CheckCheck, Clock } from 'lucide-react';

const MessageBubble = ({ message }) => {
  const isOutbound = message.direction === 'out';
  const status = message.status || 'sent';

  const renderStatus = () => {
    if (!isOutbound) return null;
    if (status === 'delivered') return <Check size={12} className="text-orange-200" />;
    if (status === 'read') return <CheckCheck size={12} className="text-orange-200" />;
    if (status === 'queued') return <Clock size={12} className="text-orange-200" />;
    return <Check size={12} className="text-orange-200/70" />;
  };

  return (
    <div className={cn("flex w-full mb-4", isOutbound ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed relative",
        isOutbound 
          ? "bg-orange-600 text-white rounded-tr-none" 
          : "bg-[#2a2a2a] text-gray-200 rounded-tl-none border border-white/5"
      )}>
        {message.attachment_url && (
          <div className="mb-2">
            {message.attachment_type?.startsWith('image/') ? (
              <a href={message.attachment_url} target="_blank" rel="noreferrer">
                <img src={message.attachment_url} alt="Anexo" className="max-h-40 rounded-lg border border-white/10" />
              </a>
            ) : (
              <a
                href={message.attachment_url}
                target="_blank"
                rel="noreferrer"
                className={cn(
                  "flex items-center gap-2 px-3 py-2 rounded-md",
                  isOutbound ? "bg-white/10 text-white" : "bg-white/5 text-gray-100"
                )}
              >
                📎 Abrir anexo
              </a>
            )}
          </div>
        )}
        {message.content && <p>{message.content}</p>}
        <div className={cn(
          "text-[10px] flex items-center gap-1 mt-1",
          isOutbound ? "text-orange-200/70 justify-end" : "text-gray-500"
        )}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {renderStatus()}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;
