import axiosInstance from "@/utils/axios";
import {
  UseMutationResult,
  UseQueryResult,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

// Axios wrappers
export const get = (url: string) => {
  return axiosInstance.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`);
};

export const post = (url: string, data: unknown, serverUrl = false) => {
  console.log(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`);
  const fullUrl = serverUrl
    ? url
    : `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`;
  return axiosInstance.post(fullUrl, data);
};

export const postV2 = (url: string, data: unknown, serverUrl = false) => {
  const fullUrl = serverUrl
    ? url
    : `${process.env.NEXT_PUBLIC_API_FILE_SERVER_BASE_URL}${url}`;
  return axiosInstance.post(fullUrl, data);
};

export const patch = (url: string, data: unknown) => {
  return axiosInstance.patch(
    `${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`,
    data
  );
};

export function deleteById(url: string) {
  return axiosInstance.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}${url}`);
}

// Queries
export const useGet = <T>(
  url: string | null, // Allow null to skip fetching
  queryKey?: string[],
  filter = ""
): UseQueryResult<T, Error> => {
  const qk = queryKey ?? [url];

  return useQuery<T, Error>({
    queryKey: qk,
    queryFn: async () => {
      if (!url) {
        throw new Error("URL is not available");
      }
      const res = await get(`${url}${filter}`);
      return res.data;
    },
    enabled: !!url, // Only enable the query if URL exists
  });
};

export const useGetById = <T>(
  url: string,
  id: string | number | undefined,
  filter = "",
  configOptions?: {
    refetchOnWindowFocus?: boolean;
    refetchOnReconnect?: boolean;
  }
): UseQueryResult<T, Error> => {
  return useQuery<T, Error>({
    queryKey: [url, id],
    queryFn: async () => {
      if (id !== undefined) {
        const res = await get(`${url}/${id}${filter}`);
        return res.data;
      }
      return [] as unknown as T;
    },
    refetchOnWindowFocus: configOptions?.refetchOnWindowFocus ?? true,
    refetchOnReconnect: configOptions?.refetchOnReconnect ?? true,
  });
};

// Mutations
export const useCreate = <T, R = unknown>(
  url: string,
  queryKey?: string[]
): UseMutationResult<R, Error, T> => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const res = await post(url, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey ?? [url] });
    },
  });
};

export const useCreateV2 = <T, R = unknown>(
  url: string,
  queryKeys?: Array<string | Array<string | number>>
): UseMutationResult<R, Error, T> => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const res = await post(url, data);
      return res.data;
    },
    onSuccess: () => {
      if (queryKeys) {
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [url] });
      }
    },
  });
};

export const useCreateV3 = <T, R = unknown>(
  url: string,
  queryKeys?: Array<string | Array<string | number>>
): UseMutationResult<R, Error, T> => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const res = await postV2(url, data);
      return res.data;
    },
    onSuccess: () => {
      if (queryKeys) {
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [url] });
      }
    },
  });
};

export const usePatch = <T>(
  url: string,
  id: string | number | undefined,
  queryKey?: string[]
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: T) => {
      const res = await patch(`${url}/${id}`, data);
      return res;
    },
    onSuccess: () => {
      const qk = queryKey ?? [url];
      queryClient.invalidateQueries({ queryKey: qk });
      queryClient.invalidateQueries({ queryKey: [url, id] });
    },
  });
};

export const usePatchV2 = <T, R = unknown>(
  url: string,
  id: string | number | undefined,
  queryKeys?: Array<string | Array<string | number>>
): UseMutationResult<R, Error, T> => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, T>({
    mutationFn: async (data: T) => {
      const res = await patch(`${url}/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      if (queryKeys) {
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [url] });
        queryClient.invalidateQueries({ queryKey: [url, id] });
      }
    },
  });
};

export const useDelete = (url: string, queryKey?: string[]) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const res = await deleteById(`${url}/${id}`);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKey ?? [url] });
    },
  });
};

export const useDeleteV2 = <R = unknown>(
  url: string,
  queryKeys?: Array<string | Array<string | number>>
): UseMutationResult<R, Error, string | number> => {
  const queryClient = useQueryClient();

  return useMutation<R, Error, string | number>({
    mutationFn: async (id: string | number): Promise<R> => {
      const res = await deleteById(`${url}/${id}`);
      return res.data;
    },
    onSuccess: () => {
      if (queryKeys) {
        queryKeys.forEach((key) => {
          queryClient.invalidateQueries({
            queryKey: Array.isArray(key) ? key : [key],
          });
        });
      } else {
        queryClient.invalidateQueries({ queryKey: [url] });
      }
    },
  });
};
