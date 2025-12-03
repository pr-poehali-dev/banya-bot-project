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
      const response = await fetch('https://functions.poehali.dev/9e4889bc-77cf-4bd8-87e2-4220702d651d/events');
      
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
          time: row.time,
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