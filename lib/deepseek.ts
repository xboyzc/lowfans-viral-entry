const baseURL = process.env.DEEPSEEK_BASE_URL || "https://api.deepseek.com";
export const model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash";

export async function deepseekJSON(system: string, user: string) {
  const apiKey = process.env.DEEPSEEK_API_KEY;
  if (!apiKey) throw new Error("MISSING_DEEPSEEK_API_KEY");
  const response = await fetch(`${baseURL}/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      messages: [{ role: "system", content: system }, { role: "user", content: user }],
      response_format: { type: "json_object" },
      thinking: { type: "disabled" },
      temperature: 0.2,
      max_tokens: 5000,
    }),
  });
  const payload = await response.json();
  if (!response.ok) {
    const error = new Error(payload?.error?.message || `DeepSeek API ${response.status}`) as Error & { status: number };
    error.status = response.status;
    throw error;
  }
  const content = payload?.choices?.[0]?.message?.content;
  if (!content) throw new Error("EMPTY_DEEPSEEK_RESPONSE");
  return JSON.parse(content.replace(/^```json\s*|\s*```$/g, ""));
}
