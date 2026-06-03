export async function parseJsonBody(
  request: Request
): Promise<
  | { success: true; data: unknown }
  | { success: false; error: string }
> {
  try {
    const data: unknown = await request.json();
    return { success: true, data };
  } catch {
    return { success: false, error: "Request body must be valid JSON" };
  }
}
