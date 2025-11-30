import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import Icon from '@/components/ui/icon';
import { Input } from '@/components/ui/input';

interface Member {
  id: number;
  name: string;
  joined: string;
  events: number;
  format: string[];
  status: string;
}

interface MembersTabProps {
  members: Member[];
  formatBadge: (format: string) => string;
  isLoading?: boolean;
}

const MembersTab = ({ members, formatBadge, isLoading }: MembersTabProps) => {
  return (
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
  );
};

export default MembersTab;