import { NextResponse } from "next/server";
import { calculateSaju, type BirthInfo } from "../../../src/saju";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const CATEGORIES: Record<string, string> = {
  nature: "타고난 기질", career: "취업과 적성", love: "연애운",
  wealth: "재물운", year: "신년 운세", golden: "인생의 황금기", daily: "오늘의 운세",
};
const attempts = new Map<string, { at: number; count: number }>();
function reply(data: object, status = 200) {
  return NextResponse.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export async function POST(req: Request) {
  try {
    const length = Number(req.headers.get("content-length") || 0);
    if (length > 4000) return reply({ error: "입력 데이터가 너무 커요." }, 413);
    const ip = (req.headers.get("x-vercel-forwarded-for") || req.headers.get("x-forwarded-for") || "unknown").split(",")[0].trim();
    const now = Date.now();
    if (attempts.size > 1000) attempts.clear();
    const past = attempts.get(ip);
    const next = !past || now - past.at > 60000 ? { at: now, count: 1 } : { at: past.at, count: past.count + 1 };
    attempts.set(ip, next);
    if (next.count > 6) return reply({ error: "잠시 후 다시 시도해 주세요. 요청 횟수가 많아요." }, 429);

    const raw = await req.text();
    if (raw.length > 4000) return reply({ error: "입력 데이터가 너무 커요." }, 413);
    const body: unknown = JSON.parse(raw);
    if (!body || typeof body !== "object") return reply({ error: "요청 형식을 확인해 주세요." }, 400);
    const input = body as { category?: unknown; info?: Partial<BirthInfo> };
    const category = typeof input.category === "string" ? input.category : "";
    if (!Object.prototype.hasOwnProperty.call(CATEGORIES, category)) return reply({ error: "알 수 없는 운세 주제예요." }, 400);
    const i = input.info;
    if (!i || typeof i !== "object" || typeof i.date !== "string" || typeof i.time !== "string") {
      return reply({ error: "생년월일과 시간을 확인해 주세요." }, 400);
    }
    const info: BirthInfo = {
      name: typeof i.name === "string" ? i.name.slice(0, 20) : "",
      date: i.date, time: i.time, unknownTime: i.unknownTime === true,
      calendar: i.calendar === "lunar" ? "lunar" : "solar", leapMonth: i.leapMonth === true,
      gender: i.gender === "male" || i.gender === "female" ? i.gender : "unspecified",
    };
    const chart = calculateSaju(info);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reply({ error: "AI API 키가 아직 설정되지 않았어요. Vercel 환경변수 GEMINI_API_KEY를 설정해 주세요." }, 503);

    const model = process.env.GEMINI_MODEL || "gemini-3.8-flash";
    if (!/^[a-zA-Z0-9._-]+$/.test(model)) return reply({ error: "AI 모델 설정을 확인해 주세요." }, 503);
    const dateLabel = new Intl.DateTimeFormat("ko-KR", {
      timeZone: "Asia/Seoul", year: "numeric", month: "long", day: "numeric", weekday: "long"
    }).format(new Date());
    const pillars = chart.pillars.filter(p => !p.hidden).map(p => p.stem + p.branch).join(" / ");
    const prompt = [
      "한국어로 전통 명리학의 상징을 활용한 자기 성찰 콘텐츠를 생성하세요.",
      "절대 미래가 확정적이라고 단언하지 마세요. 의료, 금융, 법률상 조언을 하지 마세요.",
      "사주팔자(시주/일주/월주/년주 순서, 시각 미상일 때 시주 없음): " + pillars,
      "일간: " + chart.dayMaster + ", 오행: " + chart.dayElement + ", 음양: " + chart.dayPolarity,
      "기준 날짜(서울): " + dateLabel,
      "해석 주제: " + CATEGORIES[category],
      "간결하면서도 따뜻한 문체. 극단적인 예언과 공포 마케팅 금지.",
      "반드시 JSON 객체: {title: string, summary: string, sections: [{label: string, text: string}, {label: string, text: string}], takeaway: string}.",
      "summary는 2~3문장, 섹션별 2~3문장, takeaway는 1문장으로 제한하세요.",
    ].join("\n");
    const response = await fetch("https://generativelanguage.googleapis.com/v1beta/models/" + model + ":generateContent", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      cache: "no-store",
      signal: AbortSignal.timeout(25000),
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json", maxOutputTokens: 1600, temperature: 0.7, thinkingConfig: { thinkingLevel: "low" } },
      }),
    });
    if (response.status === 429) return reply({ error: "AI 무료 사용량 또는 요청 한도를 초과했어요. 잠시 후 다시 시도해 주세요." }, 429);
    if (response.status === 401 || response.status === 403) return reply({ error: "AI 서비스 인증 설정을 확인해 주세요. 관리자에게 문의해 주세요." }, 503);
    if (!response.ok) return reply({ error: response.status === 404 ? "설정한 AI 모델을 찾을 수 없어요. GEMINI_MODEL을 확인해 주세요." : "AI 응답이 원활하지 않아요. 잠시 후 다시 시도해 주세요." }, 502);
    const payload = await response.json() as {
      candidates?: { content?: { parts?: { text?: string }[] } }[];
    };
    const text = payload.candidates?.[0]?.content?.parts?.map(p => p.text || "").join("") || "";
    if (!text) return reply({ error: "AI가 빈 결과를 반환했어요. 다시 시도해 주세요." }, 502);
    let parsed: unknown;
    try { parsed = JSON.parse(text.replace(/^```(?:json)?\s*|```$/g, "")); }
    catch { return reply({ error: "AI 해석 형식이 맞지 않아요. 다시 시도해 주세요." }, 502); }
    if (!parsed || typeof parsed !== "object") return reply({ error: "AI 결과를 확인하지 못했어요." }, 502);
    const data = parsed as { title?: unknown; summary?: unknown; sections?: unknown; takeaway?: unknown };
    const safe = (v: unknown, limit: number) => typeof v === "string" ? v.slice(0, limit) : "";
    const sections = Array.isArray(data.sections) ? data.sections.slice(0, 3).map((s: unknown) => {
      const item = s && typeof s === "object" ? s as { label?: unknown; text?: unknown } : {};
      return { label: safe(item.label, 50), text: safe(item.text, 650) };
    }) : [];
    if (!data.title || !data.summary) return reply({ error: "AI 결과가 충분하지 않아요. 다시 시도해 주세요." }, 502);
    return reply({ result: {
      title: safe(data.title, 100), summary: safe(data.summary, 1000),
      sections, takeaway: safe(data.takeaway, 300),
    } });
  } catch (error) {
    if (error instanceof SyntaxError) return reply({ error: "요청 데이터를 확인해 주세요." }, 400);
    if (error instanceof Error && /음력 날짜|생년월일|사주를 계산|출생 시간|존재하지 않는|지원 범위/.test(error.message)) {
      return reply({ error: error.message }, 400);
    }
    return reply({ error: "요청을 처리하지 못했어요. 다시 시도해 주세요." }, 500);
  }
}
