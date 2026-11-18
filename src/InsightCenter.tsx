"use client";
import { useState } from "react";
import type { BirthInfo, Reading } from "./saju";

const CATEGORIES = [
  { id: "nature", label: "타고난 기질" },
  { id: "career", label: "취업 · 적성" },
  { id: "love", label: "연애운" },
  { id: "wealth", label: "재물운" },
  { id: "year", label: "신년 운세" },
  { id: "golden", label: "인생의 황금기" },
] as const;
type FortuneResult = {
  title: string;
  summary: string;
  sections: { label: string; text: string }[];
  takeaway: string;
};
export default function InsightCenter({ info, reading, mode }: {
  info: BirthInfo;
  reading: Reading;
  mode: "saju" | "today";
}) {
  const [category, setCategory] = useState(mode === "today" ? "daily" : "nature");
  const [result, setResult] = useState<FortuneResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  async function run() {
    setBusy(true);
    setError("");
    setResult(null);
    try {
      const response = await fetch("/api/fortune", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ info, category: mode === "today" ? "daily" : category }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "운세 해석을 불러오지 못했어요.");
      setResult(data.result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "문제가 발생했어요.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <section className="fortune-hub" aria-label="AI 운세 해석">
      <span className="mini-label">AI FORTUNE · GEMINI</span>
      <h2>{mode === "today" ? "오늘의 운세" : "여섯 가지 시선으로 보는 나"}</h2>
      <p className="fortune-explain">
        {mode === "today"
          ? "오늘의 날짜와 사주의 상징을 바탕으로 AI가 가볍게 읽어드려요."
          : "궁금한 주제를 고르면 계산된 사주를 바탕으로 AI가 해석을 들려드려요."}
      </p>
      {mode === "saju" && <div className="fortune-chip-row" role="group" aria-label="해석 주제">
        {CATEGORIES.map((item) =>
          <button key={item.id} type="button" className={"fortune-chip" + (category === item.id ? " active" : "")}
            aria-pressed={category === item.id}
            onClick={() => { setCategory(item.id); setResult(null); setError(""); }}>{item.label}</button>
        )}
      </div>}
      <button type="button" className="fortune-run" disabled={busy} onClick={run}>
        {busy ? "해석을 만들고 있어요…" : mode === "today" ? "오늘의 운세 해석하기 ↗" : "AI 해석 요청하기 ↗"}
      </button>
      {error && <p role="alert" className="fortune-message">{error}{error.includes("설정") ? " 현재는 위의 기본 사주 해석을 이용할 수 있어요." : ""}</p>}
      {result && <div aria-live="polite">
        <div className="fortune-box"><h3>{result.title}</h3><p>{result.summary}</p></div>
        <div className="fortune-sections">{result.sections?.map((s, i) =>
          <article key={i}><h4>{s.label}</h4><p>{s.text}</p></article>
        )}</div>
        {result.takeaway && <div className="fortune-box"><h3>오늘의 한마디</h3><p>{result.takeaway}</p></div>}
      </div>}
      <p className="fortune-disclaimer">* 사주는 전통적 상징을 활용한 오락·성찰 콘텐츠로, 미래 예측이나 건강·투자·진로 판단을 보장하지 않습니다.</p>
    </section>
  );
}
