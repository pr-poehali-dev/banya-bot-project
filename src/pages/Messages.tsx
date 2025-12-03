import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icon from '@/components/ui/icon';

interface Message {
  id: number;
  telegramId: number;
  text: string;
  sender: 'member' | 'admin';
  timestamp: string;
  isRead: boolean;
  adminName?: string;
  memberName: string;
  username?: string;
}

const Messages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [selectedChat, setSelectedChat] = useState<number | null>(null);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchMessages = async () => {
    try {
      const response = await fetch('https://functions.poehali.dev/9e4889bc-77cf-4bd8-87e2-4220702d651d/messages');
      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить сообщения',
        variant: 'destructive',
      });
      setMessages([]);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, []);

  const groupedMessages = messages.reduce((acc, msg) => {
    const key = msg.telegramId;
    if (!acc[key]) {
      acc[key] = {
        telegramId: key,
        memberName: msg.memberName,
        username: msg.username,
        messages: [],
        lastMessage: msg.timestamp,
        unreadCount: 0,
      };
    }
    acc[key].messages.push(msg);
    if (msg.sender === 'member' && !msg.isRead) {
      acc[key].unreadCount++;
    }
    if (new Date(msg.timestamp) > new Date(acc[key].lastMessage)) {
      acc[key].lastMessage = msg.timestamp;
    }
    return acc;
  }, {} as Record<number, any>);

  const chatList = Object.values(groupedMessages).sort(
    (a: any, b: any) => new Date(b.lastMessage).getTime() - new Date(a.lastMessage).getTime()
  );

  const currentChat = selectedChat ? groupedMessages[selectedChat] : null;

  const sendReply = async () => {
    if (!replyText.trim() || !selectedChat) return;

    try {
      const response = await fetch('https://functions.poehali.dev/9e4889bc-77cf-4bd8-87e2-4220702d651d/send-message', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          telegramId: selectedChat,
          message: replyText,
          adminName: 'Администратор',
        }),
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Сообщение отправлено',
        });
        setReplyText('');
        fetchMessages();
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось отправить сообщение',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Icon name="Loader2" className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background">
      <div className="w-80 border-r border-border flex flex-col">
        <div className="p-4 border-b border-border">
          <h2 className="text-xl font-semibold">Диалоги</h2>
          <p className="text-sm text-muted-foreground">Сообщения от участников</p>
        </div>
        
        <ScrollArea className="flex-1">
          {chatList.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Icon name="MessageSquare" size={48} className="mx-auto mb-2 opacity-20" />
              <p>Нет сообщений</p>
            </div>
          ) : (
            chatList.map((chat: any) => (
              <button
                key={chat.telegramId}
                onClick={() => setSelectedChat(chat.telegramId)}
                className={`w-full p-4 text-left border-b border-border hover:bg-accent transition-colors ${
                  selectedChat === chat.telegramId ? 'bg-accent' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{chat.memberName || chat.username || `ID: ${chat.telegramId}`}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {chat.messages[chat.messages.length - 1].text.substring(0, 40)}...
                    </p>
                  </div>
                  {chat.unreadCount > 0 && (
                    <span className="ml-2 px-2 py-1 text-xs bg-primary text-primary-foreground rounded-full">
                      {chat.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      <div className="flex-1 flex flex-col">
        {currentChat ? (
          <>
            <div className="p-4 border-b border-border bg-background">
              <h3 className="font-semibold">
                {currentChat.memberName || currentChat.username || `ID: ${currentChat.telegramId}`}
              </h3>
              {currentChat.username && (
                <p className="text-sm text-muted-foreground">@{currentChat.username}</p>
              )}
            </div>

            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4 max-w-3xl mx-auto">
                {currentChat.messages
                  .sort((a: Message, b: Message) => 
                    new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
                  )
                  .map((msg: Message) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'admin' ? 'justify-end' : 'justify-start'}`}
                    >
                      <Card className={`max-w-[70%] ${
                        msg.sender === 'admin' 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <CardContent className="p-3">
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                          <p className={`text-xs mt-1 ${
                            msg.sender === 'admin' 
                              ? 'text-primary-foreground/70' 
                              : 'text-muted-foreground'
                          }`}>
                            {new Date(msg.timestamp).toLocaleString('ru-RU')}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-border bg-background">
              <div className="flex gap-2 max-w-3xl mx-auto">
                <Textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Напишите ответ..."
                  className="resize-none"
                  rows={2}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      sendReply();
                    }
                  }}
                />
                <Button onClick={sendReply} disabled={!replyText.trim()}>
                  <Icon name="Send" size={20} />
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <Icon name="MessageSquare" size={64} className="mx-auto mb-4 opacity-20" />
              <p>Выберите чат, чтобы начать переписку</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;