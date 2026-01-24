
import React from 'react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const ConversationItem = ({ conversation, isActive, onClick }) => {
  return (
    <div
      onClick={() => onClick(conversation)}
      className={cn(
        "p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors",
        isActive && "bg-orange-500/10 border-l-2 border-l-orange-500"
      )}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className={cn("font-medium", isActive ? "text-white" : "text-gray-200")}>
          {conversation.lead?.name || 'Usuário Desconhecido'}
        </h4>
        <span className="text-[10px] text-gray-500">
           {conversation.updated_at && formatDistanceToNow(new Date(conversation.updated_at), { addSuffix: true, locale: ptBR })}
        </span>
      </div>
      <p className="text-xs text-gray-400 line-clamp-1 mb-2">
        Prévia da última mensagem...
      </p>
      <div className="flex gap-2">
         <span className={cn(
           "text-[10px] px-1.5 py-0.5 rounded capitalize",
           conversation.status === 'open' ? "bg-green-500/20 text-green-500" : "bg-gray-500/20 text-gray-500"
         )}>
           {conversation.status === 'open' ? 'Aberto' : conversation.status === 'closed' ? 'Fechado' : conversation.status}
         </span>
         <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400">
           {conversation.channel}
         </span>
      </div>
    </div>
  );
};

export default ConversationItem;
