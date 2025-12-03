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
      const response = await fetch('https://functions.poehali.dev/9e4889bc-77cf-4bd8-87e2-4220702d651d/members');
      
      if (!response.ok) {
        throw new Error('Failed to fetch members');
      }
      
      const data = await response.json();
      return data.map((row: any) => ({
        id: row.id,
        name: row.name,
        joined: row.joined_date,
        events: row.events_count || 0,
        format: [],
        status: row.status
      }));
    }
  });
};