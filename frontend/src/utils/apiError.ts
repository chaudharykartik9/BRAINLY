interface ApiErrorShape {
  response?: {
    data?: {
      message?: string;
      errors?: { message?: string }[];
    };
  };
}

/**
 * Pulls the backend's actual `{ message }` (or first Zod field error) out of
 * an Axios error instead of Axios's own generic "Request failed with status
 * code 429"-style message, which `err instanceof Error ? err.message : ...`
 * would otherwise surface — hiding useful server text like rate-limit or
 * validation messages behind a meaningless HTTP status line.
 */
export const extractErrorMessage = (err: unknown, fallback: string): string => {
  const response = (err as ApiErrorShape)?.response;
  const data = response?.data;

  if (data?.message && data.message !== 'Validation failed') {
    return data.message;
  }

  const firstFieldError = data?.errors?.[0]?.message;
  if (firstFieldError) return firstFieldError;
  if (data?.message) return data.message;

  if (!response) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }

  return fallback;
};
