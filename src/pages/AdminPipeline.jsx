
import React, { useEffect, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import KanbanCard from '@/components/admin/KanbanCard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';

const COLUMNS = {
  new: 'Novo',
  qualifying: 'Qualificando',
  proposal: 'Proposta',
  won: 'Ganho',
  lost: 'Perdido'
};

const AdminPipeline = () => {
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase.from('leads').select('*');
      if (error) throw error;

      // Group by stage
      const grouped = {
        new: [],
        qualifying: [],
        proposal: [],
        won: [],
        lost: []
      };

      data.forEach(lead => {
        if (grouped[lead.stage]) {
          grouped[lead.stage].push(lead);
        } else {
          // Fallback for unknown stages
          grouped.new.push(lead);
        }
      });

      setLeads(grouped);
    } catch (error) {
      console.error('Error fetching pipeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = async (result) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic Update
    const sourceCol = [...leads[source.droppableId]];
    const destCol = [...leads[destination.droppableId]];
    const [movedLead] = sourceCol.splice(source.index, 1);
    
    // Update local state first
    destCol.splice(destination.index, 0, movedLead);
    
    setLeads({
      ...leads,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    // DB Update
    const { error } = await supabase
      .from('leads')
      .update({ stage: destination.droppableId })
      .eq('id', draggableId);

    if (error) {
      toast({ variant: "destructive", title: "Falha ao Mover", description: "Não foi possível atualizar o estágio do lead" });
      fetchLeads(); // Revert
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-500">Carregando pipeline...</div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Pipeline</h1>
        <Button variant="outline" className="border-gray-700 text-gray-300">
           <Filter size={16} className="mr-2" /> Filtros
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex gap-4 overflow-x-auto pb-4">
          {Object.entries(COLUMNS).map(([stageId, stageName]) => (
            <div key={stageId} className="w-80 flex-shrink-0 flex flex-col bg-[#111] rounded-xl border border-white/5 h-full">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a] rounded-t-xl sticky top-0 z-10">
                <h3 className="font-semibold text-white">{stageName}</h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">
                  {leads[stageId]?.length || 0}
                </span>
              </div>
              <Droppable droppableId={stageId}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto min-h-[100px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/5' : ''
                    }`}
                  >
                    {leads[stageId]?.map((lead, index) => (
                      <KanbanCard 
                        key={lead.id} 
                        lead={lead} 
                        index={index} 
                        onClick={(id) => navigate(`/admin/leads/${id}`)}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default AdminPipeline;
