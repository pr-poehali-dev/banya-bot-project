import { useQuery } from '@tanstack/react-query';

export interface Member {
  id: number;
  name: string;
  joined: string;
  events: number;
  format: string[];
  status: string;
}

export const useMembers = () => {
  return useQuery({
    queryKey: ['members'],
    queryFn: async (): Promise<Member[]> => {
      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT 
              m.id,
              m.name,
              m.joined_at as joined,
              m.events_attended as events,
              m.status,
              ARRAY_AGG(mp.format) as format
            FROM members m
            LEFT JOIN member_preferences mp ON m.id = mp.member_id
            GROUP BY m.id, m.name, m.joined_at, m.events_attended, m.status
            ORDER BY m.id
          `
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const data = await response.json();
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        joined: row.joined,
        events: row.events,
        format: row.format && row.format[0] ? row.format : [],
        status: row.status
      }));
    }
  });
};
