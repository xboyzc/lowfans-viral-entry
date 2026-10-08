import { NextResponse } from "next/server";
import { z } from "zod";
import { deepseekJSON } from "@/lib/deepseek";

export const maxDuration = 60;
const Input = z.object({ video: z.record(z.string(), z.unknown()), industry: z.string().max(80), creatorProfile: z.string().max(500) });

export async function POST(req: Request) {
  try {
    const input = Input.parse(await req.json());
    const result = await deepseekJSON(
      "你是顶级中文短视频编导。输出必须是合法 JSON，不要 Markdown，不要伪造未知信息。",
      `对候选视频做专业拆解，并生成一条45—60秒原创口播稿。\n行业：${input.industry}\n创作者画像：${input.creatorProfile}\n视频信息：${JSON.stringify(input.video)}\n\n区分可复用的需求/结构与不可照搬的原句/案例。脚本要真实、口语化、有判断，前3秒有钩子，中间有具体案例占位提示，结尾自然互动。格式：{"summary":"","audience":"","topic":"","hook":"","structure":[""],"emotions":[""],"reusable":[""],"avoid":[""],"titles":[""],"script":""}`
    );
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof Error && e.message === "MISSING_DEEPSEEK_API_KEY") return NextResponse.json({ error: "站点尚未配置 DEEPSEEK_API_KEY。" }, { status: 503 });
    if (typeof e === "object" && e !== null && "status" in e && e.status === 402) return NextResponse.json({ error: "DeepSeek API 余额不足，请检查充值或赠送余额。" }, { status: 402 });
    console.error(e);
    return NextResponse.json({ error: "AI 拆解失败，请稍后重试。" }, { status: 500 });
  }
}
