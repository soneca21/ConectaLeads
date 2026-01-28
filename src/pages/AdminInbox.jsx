
import React, { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { MessageSquare, Send, CheckCircle, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import ConversationItem from '@/components/admin/ConversationItem';
import MessageBubble from '@/components/admin/MessageBubble';
import { useLocation } from 'react-router-dom';

const AdminInbox = () => {
  const [conversations, setConversations] = useState([]);
  const [selectedConvId, setSelectedConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMessage, setNewMessage] = useState("");
  const [channel, setChannel] = useState('whatsapp');
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [channelFilter, setChannelFilter] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState('');
  const { toast } = useToast();
  const location = useLocation();
  const [unreadCounts, setUnreadCounts] = useState({});

  useEffect(() => {
    fetchConversations();
  }, []);

  // Realtime: any new message updates conversations list and unread badges
  useEffect(() => {
    const channel = supabase
      .channel('messages-all')
      .on('postgres_changes', { event: 'insert', schema: 'public', table: 'messages' }, (payload) => {
        const msg = payload.new;
        if (!msg) return;

        // If it's the open conversation, refresh messages
        if (msg.conversation_id === selectedConvId) {
          fetchMessages(selectedConvId);
        } else {
          setUnreadCounts((prev) => ({
            ...prev,
            [msg.conversation_id]: (prev[msg.conversation_id] || 0) + (msg.direction === 'in' ? 1 : 0)
          }));
        }
        // Refresh list ordering/updated_at
        fetchConversations();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedConvId]);

  useEffect(() => {
    if (location.state?.convId) {
      setSelectedConvId(location.state.convId);
    }
  }, [location.state]);

  useEffect(() => {
    fetchTemplates(channel);
  }, [channel]);

  useEffect(() => {
    if (selectedConvId) {
      fetchMessages(selectedConvId);
      setUnreadCounts(prev => ({ ...prev, [selectedConvId]: 0 }));
    }
  }, [selectedConvId]);

  // realtime messages (Supabase)
  useEffect(() => {
    if (!selectedConvId) return;
    const channel = supabase
      .channel(`messages-${selectedConvId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'messages', filter: `conversation_id=eq.${selectedConvId}` }, () => fetchMessages(selectedConvId))
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
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

  const fetchTemplates = async (ch) => {
    try {
      const { data } = await supabase
        .from('message_templates')
        .select('*')
        .eq('channel', ch)
        .eq('approved', true);
      setTemplates(data || []);
    } catch (err) {
      console.error('templates', err);
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

  const sendOutbound = async (to, text) => {
    if (channel === 'whatsapp') {
      await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, text, template: selectedTemplate || undefined })
      });
    }
    if (channel === 'email') {
      await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, subject: 'ConectaLeads', text })
      });
    }
    if (channel === 'sms') {
      await fetch('/api/send-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ to, text })
      });
    }
    return { success: true };
  };

  const handleSendMessage = async () => {
    if ((!newMessage.trim() && !attachmentFile) || !selectedConvId) return;

    try {
      let attachment_url = null;
      let attachment_type = null;

      if (attachmentFile) {
        const safeName = attachmentFile.name.replace(/\s+/g, '-').toLowerCase();
        const filePath = `messages/${selectedConvId}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage
          .from('attachments')
          .upload(filePath, attachmentFile, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('attachments').getPublicUrl(filePath);
        attachment_url = publicUrlData?.publicUrl;
        attachment_type = attachmentFile.type;
      }

      // 1. Insert message local
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: selectedConvId,
          direction: 'out',
          channel,
          template_name: selectedTemplate || null,
          content: newMessage || (attachmentFile ? 'Arquivo enviado' : ''),
          attachment_url,
          attachment_type,
          created_at: new Date().toISOString()
        });

      if (error) throw error;

      // 2. (Futuro) Enviar via API WhatsApp
      const conv = conversations.find(c => c.id === selectedConvId);
      if (conv?.lead?.phone) {
        await sendOutbound(conv.lead.phone, newMessage);
      }

      // 3. Update conversation timestamp
      await supabase
        .from('conversations')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', selectedConvId);

      setNewMessage("");
      setSelectedTemplate('');
      setAttachmentFile(null);
      setAttachmentPreview('');
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
        <div className="p-4 border-b border-white/5 space-y-3">
          <h2 className="text-xl font-bold text-white">Caixa de Entrada</h2>
          <div className="space-y-2">
            <label className="text-xs text-gray-400">Canal ativo</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm"
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs text-gray-400 flex items-center gap-1"><Filter size={12}/> Filtrar canal</label>
            <select
              value={channelFilter}
              onChange={(e) => setChannelFilter(e.target.value)}
              className="w-full bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm"
            >
              <option value="">Todos</option>
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="sms">SMS</option>
              <option value="telegram">Telegram</option>
            </select>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations
            .filter((c) => channelFilter ? c.channel === channelFilter : true)
            .map((conv) => (
              <ConversationItem 
                 key={conv.id} 
                 conversation={conv} 
                 isActive={selectedConvId === conv.id} 
                 unread={unreadCounts[conv.id] || 0}
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

            <div className="p-4 bg-[#1a1a1a] border-t border-white/5 space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                <select
                  value={selectedTemplate}
                  onChange={(e) => {
                    const tpl = templates.find(t => t.name === e.target.value);
                    setSelectedTemplate(e.target.value);
                    if (tpl) setNewMessage(tpl.body);
                  }}
                  className="bg-[#0a0a0a] border border-white/10 rounded-md p-2 text-white text-sm"
                >
                  <option value="">Mensagem livre</option>
                  {templates.map(t => <option key={t.id} value={t.name}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex gap-2">
                <Input 
                  placeholder="Digite uma mensagem..." 
                  className="bg-[#0f0f0f] border-gray-700 text-white focus:border-orange-500" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                />
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    setAttachmentFile(file || null);
                    setAttachmentPreview(file ? file.name : '');
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="text-gray-200 border-white/10"
                  onClick={() => fileInputRef.current?.click()}
                >
                  📎
                </Button>
                <Button className="bg-orange-600 hover:bg-orange-700" onClick={handleSendMessage}>
                  <Send size={18} />
                </Button>
              </div>
              {attachmentPreview && (
                <div className="text-xs text-gray-300 flex items-center gap-2">
                  <span>Pronto para enviar: {attachmentPreview}</span>
                  <button
                    className="text-red-400 underline"
                    onClick={() => {
                      setAttachmentFile(null);
                      setAttachmentPreview('');
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                  >
                    remover
                  </button>
                </div>
              )}
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
