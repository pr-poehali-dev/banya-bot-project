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
      const response = await fetch('https://functions.poehali.dev/9e4889bc-77cf-4bd8-87e2-4220702d651d?path=stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch stats');
      }
      
      const data = await response.json();
      
      return {
        totalMembers: data.total_members || 0,
        activeMembers: data.total_members || 0,
        eventsThisMonth: data.upcoming_events || 0,
        attendance: 75
      };
    }
  });
};