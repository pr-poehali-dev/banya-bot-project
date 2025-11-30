import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  const stats = [
    { label: 'Всего участников', value: '2 847', icon: 'Users', trend: '+12%' },
    { label: 'Активных сегодня', value: '834', icon: 'Activity', trend: '+5%' },
    { label: 'Мероприятий в месяц', value: '24', icon: 'Calendar', trend: '+8%' },
    { label: 'Средняя посещаемость', value: '87%', icon: 'TrendingUp', trend: '+3%' },
  ];

  const events = [
    {
      id: 1,
      title: 'Женская баня с пармастером',
      date: '2025-12-05',
      time: '18:00',
      location: 'Баня на Сретенке',
      registered: 8,
      capacity: 12,
      format: 'women',
      status: 'upcoming',
    },
    {
      id: 2,
      title: 'Мужская баня. Классический пар',
      date: '2025-12-07',
      time: '19:00',
      location: 'Сандуны',
      registered: 15,
      capacity: 15,
      format: 'men',
      status: 'full',
    },
    {
      id: 3,
      title: 'Совместная баня + купель',
      date: '2025-12-10',
      time: '20:00',
      location: 'Усадьба Банная',
      registered: 4,
      capacity: 20,
      format: 'mixed',
      status: 'upcoming',
    },
  ];

  const members = [
    {
      id: 1,
      name: 'Анна Смирнова',
      joined: '2024-03-15',
      events: 12,
      format: ['women', 'soft'],
      status: 'active',
    },
    {
      id: 2,
      name: 'Дмитрий Волков',
      joined: '2024-06-20',
      events: 8,
      format: ['men', 'hot'],
      status: 'active',
    },
    {
      id: 3,
      name: 'Екатерина Петрова',
      joined: '2024-09-01',
      events: 3,
      format: ['mixed', 'soft'],
      status: 'new',
    },
  ];

  const formatBadge = (format: string) => {
    const colors: Record<string, string> = {
      women: 'bg-pink-100 text-pink-700 border-pink-200',
      men: 'bg-blue-100 text-blue-700 border-blue-200',
      mixed: 'bg-purple-100 text-purple-700 border-purple-200',
      soft: 'bg-green-100 text-green-700 border-green-200',
      hot: 'bg-orange-100 text-orange-700 border-orange-200',
    };
    return colors[format] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="min-h-screen bg-muted/30">
      <div className="border-b bg-white">
        <div className="flex h-16 items-center px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              🧖
            </div>
            <div>
              <h1 className="text-lg font-semibold">Банный Клуб</h1>
              <p className="text-xs text-muted-foreground">Админ-панель бота</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Icon name="Bell" size={16} />
            </Button>
            <Avatar>
              <AvatarFallback>АД</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="flex">
        <aside className="w-64 border-r bg-sidebar h-[calc(100vh-4rem)] sticky top-16">
          <nav className="space-y-1 p-4">
            {[
              { id: 'dashboard', label: 'Дашборд', icon: 'LayoutDashboard' },
              { id: 'events', label: 'Мероприятия', icon: 'Calendar' },
              { id: 'members', label: 'Участники', icon: 'Users' },
              { id: 'analytics', label: 'Аналитика', icon: 'BarChart3' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  activeTab === item.id
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50'
                }`}
              >
                <Icon name={item.icon} size={18} />
                {item.label}
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          {activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold">Дашборд</h2>
                <p className="text-sm text-muted-foreground">Обзор ключевых метрик</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {stats.map((stat) => (
                  <Card key={stat.label}>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                      <Icon name={stat.icon} size={18} className="text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{stat.value}</div>
                      <p className="text-xs text-green-600 mt-1">
                        {stat.trend} за неделю
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Ближайшие мероприятия</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {events.slice(0, 3).map((event) => (
                      <div
                        key={event.id}
                        className="flex items-center justify-between border-b pb-3 last:border-0"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium">{event.title}</h4>
                            <Badge className={formatBadge(event.format)} variant="outline">
                              {event.format === 'women' && 'Женская'}
                              {event.format === 'men' && 'Мужская'}
                              {event.format === 'mixed' && 'Совместная'}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Icon name="Calendar" size={14} />
                              {event.date}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="Clock" size={14} />
                              {event.time}
                            </span>
                            <span className="flex items-center gap-1">
                              <Icon name="MapPin" size={14} />
                              {event.location}
                            </span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">
                            {event.registered}/{event.capacity}
                          </div>
                          <div className="text-xs text-muted-foreground">участников</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'events' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Мероприятия</h2>
                  <p className="text-sm text-muted-foreground">Управление событиями</p>
                </div>
                <Dialog>
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
                        <Input id="title" placeholder="Женская баня с пармастером" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="date">Дата</Label>
                          <Input id="date" type="date" />
                        </div>
                        <div className="grid gap-2">
                          <Label htmlFor="time">Время</Label>
                          <Input id="time" type="time" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="location">Место</Label>
                        <Input id="location" placeholder="Баня на Сретенке" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="grid gap-2">
                          <Label htmlFor="format">Формат</Label>
                          <Select>
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
                          <Input id="capacity" type="number" placeholder="15" />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="description">Описание</Label>
                        <Textarea
                          id="description"
                          placeholder="Мягкий пар, купель, травяной чай..."
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline">Отмена</Button>
                      <Button>Создать</Button>
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
          )}

          {activeTab === 'members' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-semibold">Участники</h2>
                  <p className="text-sm text-muted-foreground">
                    Управление профилями участников
                  </p>
                </div>
                <div className="flex gap-2">
                  <Input placeholder="Поиск..." className="w-64" />
                  <Button variant="outline">
                    <Icon name="Filter" size={16} />
                  </Button>
                </div>
              </div>

              <Card>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarFallback>
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h4 className="font-medium">{member.name}</h4>
                            <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Icon name="Calendar" size={14} />
                                Вступил {member.joined}
                              </span>
                              <span className="flex items-center gap-1">
                                <Icon name="Activity" size={14} />
                                {member.events} мероприятий
                              </span>
                            </div>
                            <div className="flex gap-2 mt-2">
                              {member.format.map((f) => (
                                <Badge
                                  key={f}
                                  className={formatBadge(f)}
                                  variant="outline"
                                >
                                  {f === 'women' && 'Женская'}
                                  {f === 'men' && 'Мужская'}
                                  {f === 'mixed' && 'Совместная'}
                                  {f === 'soft' && 'Мягкий пар'}
                                  {f === 'hot' && 'Горячий пар'}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={member.status === 'new' ? 'default' : 'secondary'}
                          >
                            {member.status === 'new' ? 'Новичок' : 'Активный'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Icon name="Eye" size={16} />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="space-y-6 animate-fade-in">
              <div>
                <h2 className="text-2xl font-semibold">Аналитика</h2>
                <p className="text-sm text-muted-foreground">
                  Статистика и отчёты
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Популярные форматы
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Женская баня</span>
                        <span className="text-sm font-medium">45%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Мужская баня</span>
                        <span className="text-sm font-medium">38%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Совместная</span>
                        <span className="text-sm font-medium">17%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Температурные предпочтения
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Мягкий пар</span>
                        <span className="text-sm font-medium">62%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Горячий пар</span>
                        <span className="text-sm font-medium">38%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-medium">
                      Средний возраст
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">32 года</div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Диапазон: 25-45 лет
                    </p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Активность участников</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Icon name="BarChart3" size={48} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm">График активности</p>
                      <p className="text-xs">Будет реализован в следующей версии</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;
