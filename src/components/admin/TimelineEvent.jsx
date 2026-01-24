
import React from 'react';
import { Eye, MessageCircle, ShoppingCart, MousePointer, Calendar } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const TimelineEvent = ({ event }) => {
  const getEventIcon = (type) => {
    switch(type) {
      case 'offer_view': return <Eye size={16} />;
      case 'whatsapp_click': return <MessageCircle size={16} />;
      case 'lead_submit': return <Calendar size={16} />;
      case 'click': return <MousePointer size={16} />;
      default: return <ShoppingCart size={16} />;
    }
  };

  const getEventColor = (type) => {
    switch(type) {
      case 'offer_view': return 'bg-blue-500/20 text-blue-500 border-blue-500/30';
      case 'whatsapp_click': return 'bg-green-500/20 text-green-500 border-green-500/30';
      case 'lead_submit': return 'bg-orange-500/20 text-orange-500 border-orange-500/30';
      default: return 'bg-gray-500/20 text-gray-500 border-gray-500/30';
    }
  };

  const translateType = (type) => {
    switch(type) {
      case 'offer_view': return 'Visualização de Oferta';
      case 'whatsapp_click': return 'Clique no WhatsApp';
      case 'lead_submit': return 'Lead Enviado';
      case 'click': return 'Clique';
      default: return type.replace('_', ' ');
    }
  };

  return (
    <div className="relative pl-8 pb-8 border-l border-white/10 last:pb-0 last:border-0">
      <div className={`absolute left-[-17px] top-0 flex items-center justify-center w-9 h-9 rounded-full border ${getEventColor(event.type)} bg-[#1a1a1a]`}>
        {getEventIcon(event.type)}
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-gray-400 mb-1">
          {formatDistanceToNow(new Date(event.created_at), { addSuffix: true, locale: ptBR })}
        </span>
        <h4 className="text-white font-medium capitalize mb-1">
          {translateType(event.type)}
        </h4>
        {event.details && (
          <p className="text-sm text-gray-500 bg-[#0a0a0a] p-2 rounded border border-white/5">
            {event.details}
          </p>
        )}
      </div>
    </div>
  );
};

export default TimelineEvent;
