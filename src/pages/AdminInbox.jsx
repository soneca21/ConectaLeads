
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ConversationItem from '@/components/admin/ConversationItem';
import MessageBubble from '@/components/admin/MessageBubble';

const AdminInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
    }
  }, [selectedConvId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('conversations')
        .select('*, lead:leads(name, phone)')
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (convId) => {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', convId)
      .order('created_at', { ascending: true });
    
    if (!error) {
      setMessages(data);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConvId) return;

    try {
      // 1. Insert message
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConvId,
          direction: 'out',
          content: newMessage,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // 2. Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConvId);

      setNewMessage("");
      fetchMessages(selectedConvId); // Refresh
    } catch (error) {
      toast({
         variant: "destructive",
         title: "Erro",
         description: "Falha ao enviar mensagem"
      });
    }
  };

  const handleResolve = async () => {
    if (!selectedConvId) return;
    
    await supabase.from('conversations').update({ status: 'closed' }).eq('id', selectedConvId);
    toast({ title: "Resolvido", description: "Conversa marcada como fechada" });
    fetchConversations();
  };

  const selectedConversation = conversations.find(c => c.id === selectedConvId);

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden bg-[#0f0f0f]">
      {/* Sidebar List */}
      <div className="w-80 border-r border-white/5 bg-[#1a1a1a] flex flex-col">
        <div className="p-4 border-b border-white/5">
          <h2 className="text-xl font-bold text-white">Caixa de Entrada</h2>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <ConversationItem 
               key={conv.id} 
               conversation={conv} 
               isActive={selectedConvId === conv.id} 
               onClick={(c) => setSelectedConvId(c.id)}
            />
          ))}
          {conversations.length === 0 && !loading && (
             <div className="p-4 text-center text-gray-500">Nenhuma conversa encontrada.</div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-[#0f0f0f]">
        {selectedConvId ? (
          <>
            <div className="h-16 border-b border-white/5 flex items-center px-6 bg-[#1a1a1a] justify-between">
               <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-full bg-orange-500/20 text-orange-500 flex items-center justify-center font-bold">
                   {selectedConversation?.lead?.name?.charAt(0) || '?'}
                 </div>
                 <div>
                   <h3 className="font-bold text-white">{selectedConversation?.lead?.name || 'Desconhecido'}</h3>
                   <p className="text-xs text-gray-400">{selectedConversation?.lead?.phone}</p>
                 </div>
               </div>
               <Button variant="outline" size="sm" onClick={handleResolve} className="border-green-500/20 text-green-500 hover:bg-green-500/10">
                  <CheckCircle size={16} className="mr-2" /> Marcar como Resolvido
               </Button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 bg-[#0f0f0f]">
              {messages.map((msg) => (
                <MessageBubble key={msg.id} message={msg} />
              ))}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#1a1a1a] border-t border-white/5">
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite uma mensagem..." 
                  className="bg-[#0f0f0f] border-gray-700 text-white focus:border-orange-500" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500">
            <MessageSquare size={48} className="mb-4 opacity-20" />
            <p>Selecione uma conversa para iniciar o chat</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminInbox;
