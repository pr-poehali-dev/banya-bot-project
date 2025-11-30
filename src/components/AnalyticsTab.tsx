import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Icon from '@/components/ui/icon';

const AnalyticsTab = () => {
  return (
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
  );
};

export default AnalyticsTab;
