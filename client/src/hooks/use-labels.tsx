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
      const response = await fetch("/api/settings/labels", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product: { [key]: value },
        }),
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to update label settings");
      }
      
      return response.json();
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