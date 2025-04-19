import { useQuery, useMutation, UseQueryResult } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { AppSettings } from "@/hooks/use-settings";

export function useLabels(): UseQueryResult<AppSettings> & { 
  updateLabel: (key: string, value: string) => Promise<void> 
} {
  // Query to fetch labels
  const query = useQuery<AppSettings>({
    queryKey: ["/api/settings/labels"],
    queryFn: async () => {
      const res = await fetch("/api/settings/labels");
      if (!res.ok) {
        throw new Error("Failed to fetch label settings");
      }
      return res.json();
    },
  });

  // Mutation to update a label
  const mutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      return await apiRequest("PUT", "/api/settings/labels", {
        product: { [key]: value },
      });
    },
    onSuccess: () => {
      // Invalidate the query to refetch the latest data
      queryClient.invalidateQueries({ queryKey: ["/api/settings/labels"] });
    },
  });

  // Function to update a specific label
  const updateLabel = async (key: string, value: string) => {
    await mutation.mutateAsync({ key, value });
  };

  return {
    ...query,
    updateLabel,
  };
}