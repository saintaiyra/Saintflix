export function getApiUrl(path: string) {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (typeof window === "undefined") {
    if (!baseUrl) {
      throw new Error("NEXT_PUBLIC_APP_URL não está configurada");
    }

    return `${baseUrl}${path}`;
  }

  return path;
}