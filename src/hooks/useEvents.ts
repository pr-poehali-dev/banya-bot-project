import { useQuery } from '@tanstack/react-query';

export interface Event {
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

export const useEvents = () => {
  return useQuery({
    queryKey: ['events'],
    queryFn: async (): Promise<Event[]> => {
      const response = await fetch('/api/sql', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: `
            SELECT 
              e.id,
              e.title,
              e.date,
              e.time,
              e.location,
              e.format,
              e.capacity,
              e.status,
              COUNT(er.id) as registered
            FROM events e
            LEFT JOIN event_registrations er ON e.id = er.event_id
            GROUP BY e.id
            ORDER BY e.date, e.time
          `
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch events');
      }
      
      const data = await response.json();
      return data.map((row: any) => {
        const registered = parseInt(row.registered) || 0;
        const capacity = row.capacity;
        const status = registered >= capacity ? 'full' : 'upcoming';
        
        return {
          id: row.id,
          title: row.title,
          date: row.date,
          time: row.time.substring(0, 5),
          location: row.location,
          registered,
          capacity,
          format: row.format,
          status
        };
      });
    }
  });
};
