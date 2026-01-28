
import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { Phone, Calendar, Coins } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const KanbanCard = ({ lead, index, onClick }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return "bg-red-500";
    if (score >= 50) return "bg-orange-500";
    return "bg-blue-500";
  };

  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(lead.id)}
          className={`
            p-4 mb-3 rounded-lg border bg-[#1a1a1a] shadow-sm cursor-pointer group hover:border-orange-500/50 transition-all
            ${snapshot.isDragging ? 'border-orange-500 shadow-lg scale-105 z-50' : 'border-white/5'}
          `}
          style={provided.draggableProps.style}
        >
          <div className="flex justify-between items-start mb-2">
            <h4 className="font-semibold text-white group-hover:text-orange-500 transition-colors">{lead.name}</h4>
            <div className={`w-2 h-2 rounded-full ${getScoreColor(lead.score)}`} title={`Score: ${lead.score}`} />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center text-xs text-gray-400">
              <Phone size={12} className="mr-2" />
              {lead.phone}
            </div>
            <div className="flex items-center text-xs text-gray-500">
              <Calendar size={12} className="mr-2" />
              {lead.created_at ? formatDistanceToNow(new Date(lead.created_at), { locale: ptBR }) : 'N/A'}
            </div>
            {lead.potential_value && (
              <div className="flex items-center text-xs text-gray-300">
                <Coins size={12} className="mr-2 text-orange-400" />
                {lead.potential_value} {lead.currency || 'BRL'}
              </div>
            )}
          </div>
          
          <div className="mt-3 flex gap-1 flex-wrap">
            {lead.tags && lead.tags.map(tag => (
              <span key={tag} className="px-1.5 py-0.5 bg-white/5 rounded text-[10px] text-gray-300">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default KanbanCard;
