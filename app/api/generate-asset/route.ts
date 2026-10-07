type ImageProvider = "openai" | "bytedance";

type GenerateRequest = {
  prompt?: unknown;
  provider?: unknown;
  referenceImages?: unknown;
};

type ImageResponse = {
  data?: Array<{ b64_json?: string; url?: string }>;
  error?: { message?: string };
};

async function callImageProvider(
  provider: ImageProvider,
  prompt: string,
  referenceImages: string[],
) {
  const isOpenAI = provider === "openai";
  const apiKey = isOpenAI ? process.env.OPENAI_API_KEY : process.env.ARK_API_KEY;
  if (!apiKey) {
    throw new Error(isOpenAI ? "Thiếu OPENAI_API_KEY." : "Thiếu ARK_API_KEY.");
  }

  const endpoint = isOpenAI
    ? "https://api.openai.com/v1/images/generations"
    : "https://ark.cn-beijing.volces.com/api/v3/images/generations";
  const model = isOpenAI
    ? process.env.OPENAI_IMAGE_MODEL || "gpt-image-2"
    : process.env.ARK_IMAGE_MODEL || "doubao-seedream-5-0-260128";

  const body: Record<string, unknown> = {
    model,
    prompt,
    size: isOpenAI ? "1536x1024" : "2K",
    n: 1,
  };

  if (isOpenAI) {
    body.output_format = "png";
  } else {
    body.response_format = "url";
    body.watermark = false;
    if (referenceImages.length === 1) body.image = referenceImages[0];
    if (referenceImages.length > 1) body.image = referenceImages.slice(0, 10);
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const payload = (await response.json().catch(() => null)) as ImageResponse | null;
  if (!response.ok) throw new Error(payload?.error?.message || `${provider} trả HTTP ${response.status}.`);

  const image = payload?.data?.[0];
  if (image?.b64_json) return `data:image/png;base64,${image.b64_json}`;
  if (image?.url) return image.url;
  throw new Error(`${provider} không trả về ảnh.`);
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as GenerateRequest | null;
  const prompt = typeof body?.prompt === "string" ? body.prompt.trim() : "";
  const provider: ImageProvider = body?.provider === "bytedance" ? "bytedance" : "openai";
  const referenceImages = Array.isArray(body?.referenceImages)
    ? body.referenceImages.filter((item): item is string => typeof item === "string").slice(0, 10)
    : [];

  if (prompt.length < 12) return Response.json({ error: "Visual prompt quá ngắn." }, { status: 400 });
  if (prompt.length > 12_000) return Response.json({ error: "Visual prompt quá dài." }, { status: 413 });

  try {
    const imageUrl = await callImageProvider(provider, prompt, referenceImages);
    return Response.json({ imageUrl, provider });
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : "Không thể tạo ảnh." },
      { status: 502 },
    );
  }
}
