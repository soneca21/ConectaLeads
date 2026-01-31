import React, { useEffect, useMemo, useState } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import KanbanCard from '@/components/admin/KanbanCard';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { fetchPipelines, fetchStages } from '@/lib/pipeline';
import { stageLabel } from '@/config/constants';

const FALLBACK_PIPELINE = { id: 'fallback', name: 'Pipeline Padrão' };
const FALLBACK_STAGES = [
  { id: 'stage-new', key: 'new', name: 'Novos' },
  { id: 'stage-qualifying', key: 'qualifying', name: 'Qualificando' },
  { id: 'stage-proposal', key: 'proposal', name: 'Proposta' },
  { id: 'stage-won', key: 'won', name: 'Ganho' },
  { id: 'stage-lost', key: 'lost', name: 'Perdido' }
];

const AdminPipeline = () => {
  const [leads, setLeads] = useState({});
  const [loading, setLoading] = useState(true);
  const [pipelines, setPipelines] = useState([]);
  const [currentPipeline, setCurrentPipeline] = useState(null);
  const [stages, setStages] = useState([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    loadPipelines();
  }, []);

  useEffect(() => {
    if (currentPipeline) {
      (async () => {
        const mappedStages = await loadStages(currentPipeline.id);
        await fetchLeads(currentPipeline.id, mappedStages);
      })();
    } else {
      setLoading(false);
    }
  }, [currentPipeline]);

  const loadPipelines = async () => {
    try {
      const data = await fetchPipelines();
      if (data.length) {
        setPipelines(data);
        setCurrentPipeline(data[0]);
      } else {
        // Fallback local para exibir o Kanban mesmo sem pipelines no banco
        setPipelines([FALLBACK_PIPELINE]);
        setCurrentPipeline(FALLBACK_PIPELINE);
      }
    } catch (err) {
      console.error(err);
      setPipelines([FALLBACK_PIPELINE]);
      setCurrentPipeline(FALLBACK_PIPELINE);
      setLoading(false);
    }
  };

  const loadStages = async (pipelineId) => {
    const data = pipelineId === FALLBACK_PIPELINE.id ? FALLBACK_STAGES : await fetchStages(pipelineId);
    const mapped = (data || []).map((s) => ({
      ...s,
      name: stageLabel(s.key || s.name || s.id)
    }));
    setStages(mapped);
    setLeads({});
    return mapped;
  };

  const fetchLeads = async (pipelineId, stageList = stages) => {
    try {
      setLoading(true);
      let data = [];
      if (pipelineId !== FALLBACK_PIPELINE.id) {
        const { data: leadsData, error } = await supabase
          .from('leads')
          .select('*')
          .eq('pipeline_id', pipelineId);
        if (error) throw error;
        data = leadsData || [];
      }

      const grouped = {};
      stageList.forEach(stage => { grouped[stage.id] = []; });
      (data || []).forEach(lead => {
        const bucket = lead.pipeline_stage_id || stageList[0]?.id;
        if (!grouped[bucket]) grouped[bucket] = [];
        grouped[bucket].push(lead);
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

    const sourceCol = [...(leads[source.droppableId] || [])];
    const destCol = [...(leads[destination.droppableId] || [])];
    const [movedLead] = sourceCol.splice(source.index, 1);
    destCol.splice(destination.index, 0, movedLead);

    setLeads({
      ...leads,
      [source.droppableId]: sourceCol,
      [destination.droppableId]: destCol
    });

    const newStage = stages.find(s => s.id === destination.droppableId);
    const { error } = await supabase
      .from('leads')
      .update({ pipeline_stage_id: destination.droppableId, stage: newStage?.key || 'new' })
      .eq('id', draggableId);

    if (error) {
      toast({ variant: "destructive", title: "Falha ao mover", description: "Não foi possível atualizar o estágio do lead" });
      fetchLeads(currentPipeline.id);
    }
  };

  const columns = useMemo(() => stages.map(s => ({ id: s.id, name: s.name })), [stages]);

  if (loading && !stages.length) return <div className="p-8 text-center text-gray-500">Carregando pipeline...</div>;

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col p-6 overflow-hidden">
      <div className="flex justify-between items-center mb-6 gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h1 className="text-3xl font-bold text-white">Pipelines</h1>
          <select
            value={currentPipeline?.id || ''}
            onChange={(e) => setCurrentPipeline(pipelines.find(p => p.id === e.target.value))}
            className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white"
          >
            {pipelines.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <Button variant="outline" className="border-gray-700 text-gray-300">
           <Filter size={16} className="mr-2" /> Filtros
        </Button>
      </div>

        <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex-1 flex justify-start gap-2 overflow-x-auto pb-4">
          {columns.map(col => (
            // Reduce column width from w-80 (20rem) to w-72 (18rem) for a more compact view
            <div key={col.id} className="w-[19rem] flex-shrink-0 flex flex-col bg-[#111] rounded-xl h-full">
              <div className="p-4 border-b border-white/5 flex justify-between items-center bg-[#1a1a1a] rounded-t-xl sticky top-0 z-10">
                <h3 className="font-semibold text-white">{col.name}</h3>
                <span className="text-xs bg-white/10 px-2 py-0.5 rounded text-gray-300">
                  {leads[col.id]?.length || 0}
                </span>
              </div>
              <Droppable droppableId={col.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 p-3 overflow-y-auto min-h-[100px] transition-colors ${
                      snapshot.isDraggingOver ? 'bg-white/5' : ''
                    }`}
                  >
                    {leads[col.id]?.map((lead, index) => (
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
