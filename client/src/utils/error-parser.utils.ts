export function parseError(error: any): string | null {
  const errorMessage = error.response?.data?.message;
  if (Array.isArray(errorMessage) && errorMessage.length > 0) {
    return errorMessage[0];
  }
  if (typeof errorMessage === 'string') {
    return errorMessage;
  }
  return null;
}
