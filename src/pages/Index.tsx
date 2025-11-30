import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import DashboardTab from '@/components/DashboardTab';
import EventsTab from '@/components/EventsTab';
import MembersTab from '@/components/MembersTab';
import AnalyticsTab from '@/components/AnalyticsTab';
import { useMembers } from '@/hooks/useMembers';
import { useEvents } from '@/hooks/useEvents';
import { useStats } from '@/hooks/useStats';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const { data: membersData = [], isLoading: membersLoading } = useMembers();
  const { data: eventsData = [], isLoading: eventsLoading } = useEvents();
  const { data: statsData } = useStats();

  const stats = [
    { 
      label: 'Всего участников', 
      value: statsData?.totalMembers.toString() || '0', 
      icon: 'Users', 
      trend: '+12%' 
    },
    { 
      label: 'Активных сегодня', 
      value: statsData?.activeMembers.toString() || '0', 
      icon: 'Activity', 
      trend: '+5%' 
    },
    { 
      label: 'Мероприятий в месяц', 
      value: statsData?.eventsThisMonth.toString() || '0', 
      icon: 'Calendar', 
      trend: '+8%' 
    },
    { 
      label: 'Средняя посещаемость', 
      value: `${statsData?.attendance || 0}%`, 
      icon: 'TrendingUp', 
      trend: '+3%' 
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
            <DashboardTab 
              stats={stats} 
              events={eventsData} 
              formatBadge={formatBadge}
              isLoading={eventsLoading}
            />
          )}

          {activeTab === 'events' && (
            <EventsTab 
              events={eventsData} 
              formatBadge={formatBadge}
              isLoading={eventsLoading}
            />
          )}

          {activeTab === 'members' && (
            <MembersTab 
              members={membersData} 
              formatBadge={formatBadge}
              isLoading={membersLoading}
            />
          )}

          {activeTab === 'analytics' && <AnalyticsTab />}
        </main>
      </div>
    </div>
  );
};

export default Index;