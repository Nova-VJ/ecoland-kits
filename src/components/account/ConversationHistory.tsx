import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { MessageSquare, Search, Loader2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import ReactMarkdown from 'react-markdown';

interface Conversation {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const ConversationHistory = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchDate, setSearchDate] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loadingMessages, setLoadingMessages] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('eco_coach_conversations' as any)
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (data) {
      setConversations(data.map((c: any) => ({
        id: c.id,
        title: c.title,
        created_at: c.created_at,
        updated_at: c.updated_at,
      })));
    }
    setLoading(false);
  };

  const loadMessages = async (conversationId: string) => {
    if (expandedId === conversationId) {
      setExpandedId(null);
      return;
    }

    if (messages[conversationId]) {
      setExpandedId(conversationId);
      return;
    }

    setLoadingMessages(conversationId);
    const { data } = await supabase
      .from('eco_coach_messages' as any)
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(prev => ({
        ...prev,
        [conversationId]: data.map((m: any) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          created_at: m.created_at,
        })),
      }));
    }
    setExpandedId(conversationId);
    setLoadingMessages(null);
  };

  const deleteConversation = async (id: string) => {
    await supabase.from('eco_coach_conversations' as any).delete().eq('id', id);
    setConversations(prev => prev.filter(c => c.id !== id));
    toast({ title: 'Conversación eliminada' });
  };

  const filtered = searchDate
    ? conversations.filter(c => c.created_at.startsWith(searchDate))
    : conversations;

  if (loading) return <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="pl-9 text-sm"
          placeholder="Buscar por fecha"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-8">
          <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {searchDate ? 'No hay conversaciones en esa fecha.' : 'No tienes conversaciones guardadas aún.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Inicia sesión y habla con el Eco-Coach para guardar tu historial.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(conv => (
            <div key={conv.id} className="border rounded-xl overflow-hidden">
              <div className="flex items-center justify-between p-3 hover:bg-muted/30 transition-colors">
                <button onClick={() => loadMessages(conv.id)} className="flex-1 text-left flex items-center gap-2">
                  {expandedId === conv.id ? <ChevronUp className="h-4 w-4 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">{conv.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conv.created_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </button>
                <Button size="icon" variant="ghost" onClick={() => deleteConversation(conv.id)} className="text-destructive h-8 w-8">
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>

              {expandedId === conv.id && (
                <div className="border-t bg-muted/10 p-3 space-y-3 max-h-80 overflow-y-auto">
                  {loadingMessages === conv.id ? (
                    <div className="flex justify-center py-4"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>
                  ) : (
                    messages[conv.id]?.map(msg => (
                      <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-xl px-3 py-2 text-xs ${
                          msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'
                        }`}>
                          {msg.role === 'assistant' ? (
                            <div className="prose prose-xs max-w-none prose-p:my-0.5">
                              <ReactMarkdown>{msg.content.replace(/\[\[(product|pack):[a-z0-9-]+\]\]/g, '')}</ReactMarkdown>
                            </div>
                          ) : (
                            <p>{msg.content}</p>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
