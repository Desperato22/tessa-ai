import { productionPlanSchema, type ProductionPlan } from "@/lib/production-schema";

const systemPrompt = `You are the production analyst for Tessa AI. Convert a screenplay, story treatment, or scene description into a compact production plan for an AI film workflow.

Rules:
- Extract reusable assets first: characters, locations, and recurring props.
- Give every asset a stable lowercase kebab-case id. Shots must reference those exact ids.
- Do not invent characters or plot events that are absent from the source.
- Use progress percentages from 0 to 100, not fixed seconds. The final shot must end at 100.
- Prefer 4-12 purposeful shots. Do not force a 16-shot template.
- Visual prompts describe appearance only. Continuity notes preserve identity, wardrobe, spatial layout, and screen direction.
- Keep camera, lighting, action, dialogue, and continuity separate.
- Empty dialogue is an empty string.
- Respond in the same language as the source when practical.`;

function isProductionPlan(value: unknown): value is ProductionPlan {
  if (!value || typeof value !== "object") return false;
  const plan = value as Partial<ProductionPlan>;
  return (
    typeof plan.title === "string" &&
    typeof plan.logline === "string" &&
    typeof plan.genre === "string" &&
    typeof plan.visualStyle === "string" &&
    Array.isArray(plan.assets) &&
    Array.isArray(plan.shots)
  );
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "Thiếu ANTHROPIC_API_KEY. Thêm key vào .env.local rồi khởi động lại." },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => null)) as { script?: unknown } | null;
  const script = typeof body?.script === "string" ? body.script.trim() : "";
  if (script.length < 40) {
    return Response.json({ error: "Kịch bản quá ngắn để bóc tách đáng tin cậy." }, { status: 400 });
  }
  if (script.length > 180_000) {
    return Response.json({ error: "Bản MVP nhận tối đa 180.000 ký tự mỗi lần." }, { status: 413 });
  }

  const upstream = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5",
      max_tokens: 12_000,
      system: systemPrompt,
      messages: [{ role: "user", content: script }],
      output_config: {
        format: {
          type: "json_schema",
          schema: productionPlanSchema,
        },
      },
    }),
  });

  const payload = (await upstream.json().catch(() => null)) as
    | { content?: Array<{ type?: string; text?: string }>; stop_reason?: string; error?: { message?: string } }
    | null;

  if (!upstream.ok) {
    return Response.json(
      { error: payload?.error?.message || `Claude API trả HTTP ${upstream.status}.` },
      { status: upstream.status },
    );
  }
  if (payload?.stop_reason === "refusal") {
    return Response.json({ error: "Claude từ chối xử lý nội dung này." }, { status: 422 });
  }
  if (payload?.stop_reason === "max_tokens") {
    return Response.json({ error: "Kết quả bị cắt do vượt giới hạn output. Hãy chia kịch bản thành chương nhỏ hơn." }, { status: 422 });
  }

  const text = payload?.content?.find((block) => block.type === "text")?.text;
  if (!text) return Response.json({ error: "Claude không trả về kế hoạch sản xuất." }, { status: 502 });

  const plan = JSON.parse(text) as unknown;
  if (!isProductionPlan(plan)) {
    return Response.json({ error: "Dữ liệu Claude trả về không đúng contract ProductionPlan." }, { status: 502 });
  }

  return Response.json({ plan });
}
