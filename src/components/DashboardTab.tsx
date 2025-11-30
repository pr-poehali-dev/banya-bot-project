import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import Icon from '@/components/ui/icon';

interface Stat {
  label: string;
  value: string;
  icon: string;
  trend: string;
}

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

interface DashboardTabProps {
  stats: Stat[];
  events: Event[];
  formatBadge: (format: string) => string;
  isLoading?: boolean;
}

const DashboardTab = ({ stats, events, formatBadge, isLoading }: DashboardTabProps) => {
  return (
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
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : (
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
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardTab;