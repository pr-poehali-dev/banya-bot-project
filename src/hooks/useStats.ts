import { useQuery } from '@tanstack/react-query';

export interface Stats {
  totalMembers: number;
  activeMembers: number;
  eventsThisMonth: number;
  attendance: number;
}

export const useStats = () => {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async (): Promise<Stats> => {
      const queries = [
        'SELECT COUNT(*) as total FROM members',
        "SELECT COUNT(*) as active FROM members WHERE status = 'active'",
        "SELECT COUNT(*) as events_count FROM events WHERE date >= CURRENT_DATE AND date < CURRENT_DATE + INTERVAL '30 days'",
        `SELECT COALESCE(ROUND((COUNT(CASE WHEN er.attended = true THEN 1 END)::numeric / NULLIF(COUNT(er.id), 0)) * 100, 0), 0) as attendance 
         FROM event_registrations er 
         JOIN events e ON er.event_id = e.id 
         WHERE e.date < CURRENT_DATE`
      ];
      
      const results = await Promise.all(
        queries.map(async (query) => {
          const response = await fetch('/api/sql', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query })
          });
          
          if (!response.ok) {
            throw new Error('Failed to fetch stats');
          }
          
          return response.json();
        })
      );
      
      return {
        totalMembers: parseInt(results[0][0].total) || 0,
        activeMembers: parseInt(results[1][0].active) || 0,
        eventsThisMonth: parseInt(results[2][0].events_count) || 0,
        attendance: parseInt(results[3][0].attendance) || 0
      };
    }
  });
};
