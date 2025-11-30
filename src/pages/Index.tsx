import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import DashboardTab from '@/components/DashboardTab';
import EventsTab from '@/components/EventsTab';
import MembersTab from '@/components/MembersTab';
import AnalyticsTab from '@/components/AnalyticsTab';

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
            <DashboardTab stats={stats} events={events} formatBadge={formatBadge} />
          )}

          {activeTab === 'events' && (
            <EventsTab events={events} formatBadge={formatBadge} />
          )}

          {activeTab === 'members' && (
            <MembersTab members={members} formatBadge={formatBadge} />
          )}

          {activeTab === 'analytics' && <AnalyticsTab />}
        </main>
      </div>
    </div>
  );
};

export default Index;
