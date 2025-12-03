import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface Event {
  id: number;
  title: string;
  date: string;
  time: string;
  location: string;
  registered: number;
  capacity: number;
  format: string;
  status: string;
}

interface EventsTabProps {
  events: Event[];
  formatBadge: (format: string) => string;
  isLoading?: boolean;
  onEventCreated?: () => void;
}

const EventsTab = ({ events, formatBadge, isLoading, onEventCreated }: EventsTabProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    format: 'women',
    capacity: '15',
    description: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.date || !formData.time || !formData.location) {
      toast({
        title: 'Ошибка',
        description: 'Заполните все обязательные поля',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('https://functions.poehali.dev/9e4889bc-77cf-4bd8-87e2-4220702d651d/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          date: formData.date,
          time: formData.time,
          location: formData.location,
          format: formData.format,
          capacity: parseInt(formData.capacity) || 15,
          description: formData.description
        })
      });

      if (response.ok) {
        toast({
          title: 'Успешно',
          description: 'Мероприятие создано'
        });
        setOpen(false);
        setFormData({
          title: '',
          date: '',
          time: '',
          location: '',
          format: 'women',
          capacity: '15',
          description: ''
        });
        if (onEventCreated) onEventCreated();
      } else {
        throw new Error('Failed to create event');
      }
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось создать мероприятие',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Мероприятия</h2>
          <p className="text-sm text-muted-foreground">Управление событиями</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icon name="Plus" size={16} className="mr-2" />
              Создать мероприятие
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Новое мероприятие</DialogTitle>
              <DialogDescription>
                Заполните информацию о мероприятии
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="title">Название</Label>
                <Input 
                  id="title" 
                  placeholder="Женская баня с пармастером"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="date">Дата</Label>
                  <Input 
                    id="date" 
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="time">Время</Label>
                  <Input 
                    id="time" 
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="location">Место</Label>
                <Input 
                  id="location" 
                  placeholder="Баня на Сретенке"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="format">Формат</Label>
                  <Select value={formData.format} onValueChange={(value) => setFormData({...formData, format: value})}>
                    <SelectTrigger id="format">
                      <SelectValue placeholder="Выберите формат" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="women">Женская</SelectItem>
                      <SelectItem value="men">Мужская</SelectItem>
                      <SelectItem value="mixed">Совместная</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="capacity">Мест</Label>
                  <Input 
                    id="capacity" 
                    type="number" 
                    placeholder="15"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Описание</Label>
                <Textarea
                  id="description"
                  placeholder="Мягкий пар, купель, травяной чай..."
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setOpen(false)}>Отмена</Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? 'Создание...' : 'Создать'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{event.title}</h3>
                    <Badge className={formatBadge(event.format)} variant="outline">
                      {event.format === 'women' && 'Женская'}
                      {event.format === 'men' && 'Мужская'}
                      {event.format === 'mixed' && 'Совместная'}
                    </Badge>
                    {event.status === 'full' && (
                      <Badge variant="secondary">Мест нет</Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" size={16} />
                      {event.date}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="Clock" size={16} />
                      {event.time}
                    </div>
                    <div className="flex items-center gap-2">
                      <Icon name="MapPin" size={16} />
                      {event.location}
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className="bg-accent h-2 rounded-full transition-all"
                          style={{
                            width: `${(event.registered / event.capacity) * 100}%`,
                          }}
                        />
                      </div>
                      <span className="text-sm font-medium">
                        {event.registered}/{event.capacity}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Icon name="Users" size={16} className="mr-2" />
                    Участники
                  </Button>
                  <Button variant="outline" size="sm">
                    <Icon name="Edit" size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventsTab;