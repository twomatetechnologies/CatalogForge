import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest<T = any>(options: {
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
}): Promise<T> {
  const { url, method, data, headers = {} } = options;
  
  try {
    console.log('API Request:', method, url, data);
    
    // Add content-type header if data is provided
    if (data && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    
    // Add authorization header if token exists in localStorage
    const token = localStorage.getItem('token');
    if (token && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, {
      method,
      headers,
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });

    console.log('API Response status:', res.status);
    
    // Check for non-OK status and throw error with message
    if (!res.ok) {
      const contentType = res.headers.get('content-type');
      let errorMessage = res.statusText || 'Unknown error';
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const errorData = await res.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          console.error('Error parsing JSON error response:', e);
        }
      } else {
        try {
          const textError = await res.text();
          if (textError) errorMessage = textError;
        } catch (e) {
          console.error('Error reading error response text:', e);
        }
      }
      
      const error = new Error(errorMessage);
      // @ts-ignore
      error.status = res.status;
      throw error;
    }
    
    // For 204 No Content, return empty object
    if (res.status === 204) {
      return {} as T;
    }
    
    // For all other success responses, parse JSON
    try {
      const jsonResponse = await res.json();
      console.log('API Response data:', jsonResponse);
      return jsonResponse;
    } catch (e) {
      console.error('Error parsing JSON response:', e);
      throw new Error('Failed to parse response from server');
    }
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      console.log('Query request:', queryKey[0]);
      
      // Add authorization header if token exists in localStorage
      const headers: Record<string, string> = {};
      const token = localStorage.getItem('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers
      });
      
      console.log('Query response status:', res.status);

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // Check for non-OK status and throw error with message
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        let errorMessage = res.statusText || 'Unknown error';
        
        if (contentType && contentType.includes('application/json')) {
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            console.error('Error parsing JSON error response:', e);
          }
        } else {
          try {
            const textError = await res.text();
            if (textError) errorMessage = textError;
          } catch (e) {
            console.error('Error reading error response text:', e);
          }
        }
        
        const error = new Error(errorMessage);
        // @ts-ignore
        error.status = res.status;
        throw error;
      }
      
      // Parse JSON response
      try {
        const jsonResponse = await res.json();
        console.log('Query response data:', jsonResponse);
        return jsonResponse;
      } catch (e) {
        console.error('Error parsing JSON response:', e);
        throw new Error('Failed to parse response from server');
      }
    } catch (error) {
      console.error('Query request failed:', error);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
