
import React from 'react';
import { cn } from '@/lib/utils';

const MessageBubble = ({ message }) => {
  const isOutbound = message.direction === 'out';

  return (
    <div className={cn("flex w-full mb-4", isOutbound ? "justify-end" : "justify-start")}>
      <div className={cn(
        "max-w-[70%] p-3 rounded-2xl text-sm leading-relaxed relative",
        isOutbound 
          ? "bg-orange-600 text-white rounded-tr-none" 
          : "bg-[#2a2a2a] text-gray-200 rounded-tl-none border border-white/5"
      )}>
        <p>{message.content}</p>
        <span className={cn(
          "text-[10px] block mt-1",
          isOutbound ? "text-orange-200/70 text-right" : "text-gray-500 text-left"
        )}>
          {new Date(message.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default MessageBubble;
