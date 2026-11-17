import { useRef, useState, type FormEvent } from "react";
import { calculateSaju, ELEMENT_DATA, ELEMENTS, type BirthInfo, type Element, type Reading } from "./saju";

const stepItems = [
  { number: "01", title: "나의 정보 입력", detail: "생년월일과 태어난 시간" },
  { number: "02", title: "사주팔자 살펴보기", detail: "네 기둥에 담긴 여덟 글자" },
  { number: "03", title: "나만의 결 발견", detail: "오행과 일간으로 읽는 기질" },
];
const faqs = [
  { q: "태어난 시간을 모르면 어떻게 하나요?", a: "‘태어난 시간을 모르겠어요’를 선택하면 시주를 제외하고 년주·월주·일주를 살펴볼 수 있어요. 시간에 따른 해석은 빠지므로 결과를 간략한 참고 자료로 봐주세요." },
  { q: "양력과 음력 모두 가능한가요?", a: "네. 양력과 음력을 지원하며, 음력은 윤달 여부도 선택할 수 있어요. 절기 기준으로 년주와 월주를 계산하기 때문에 일반 달력의 연도·월과 다르게 표시될 수 있어요." },
  { q: "사주 해석은 미래를 정확하게 예측하나요?", a: "아니요. 사주는 전통 명리학의 상징 체계이며 과학적으로 미래나 개인의 성격을 확정하는 방법은 아니에요. 결과는 자기 성찰과 재미를 위한 참고로 활용해 주세요." },
  { q: "입력한 생년월일이 저장되나요?", a: "현재 버전은 사주 계산이 브라우저 안에서 이루어집니다. 입력한 이름·생년월일·시간을 당사 서버로 전송하거나 계정을 만들어 저장하지 않아요." },
];

function ArrowIcon({ diagonal = false }: { diagonal?: boolean }) {
  return diagonal
    ? <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M5 19 19 5M7 5h12v12" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
    : <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path d="M4 12h16m-7-7 7 7-7 7" stroke="currentColor" strokeWidth="1.7" fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function BrandMark({ size = 32 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 44 44" fill="none" aria-hidden="true"><circle cx="22" cy="22" r="19" stroke="currentColor" strokeWidth="1.15" opacity=".75"/><path d="M22 4v36M4 22h36M9.3 9.3l25.4 25.4M34.7 9.3 9.3 34.7" stroke="currentColor" strokeWidth=".9" opacity=".6"/><circle cx="22" cy="22" r="7" fill="currentColor"/><circle cx="22" cy="22" r="3" fill="#f7f2eb"/></svg>;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <div className="eyebrow"><span className="eyebrow-line" />{children}</div>;
}

function HeroOrb() {
  return (
    <div className="orb-stage" aria-hidden="true">
      <div className="orb-halo orb-halo-outer" />
      <div className="orb-halo orb-halo-middle" />
      <div className="orb-halo orb-halo-inner" />
      <div className="orb-disk"><div className="orb-moon" /><div className="orb-star star-1">✧</div><div className="orb-star star-2">✦</div><div className="orb-star star-3">✧</div><div className="orb-core">命<span>나의 결</span></div></div>
      <span className="orbit-letter orb-letter-a">甲</span><span className="orbit-letter orb-letter-b">乙</span><span className="orbit-letter orb-letter-c">丙</span><span className="orbit-letter orb-letter-d">丁</span>
      <div className="orb-note orb-note-top"><span className="note-glyph">☀</span><div>사주팔자 <small>네 기둥, 여덟 글자</small></div></div>
      <div className="orb-note orb-note-bottom"><span className="note-glyph muted">✳</span><div>오행의 흐름 <small>목 · 화 · 토 · 금 · 수</small></div></div>
    </div>
  );
}

function PillarCard({ pillar, featured }: { pillar: Reading["pillars"][number]; featured?: boolean }) {
  return <div className={`pillar-card ${featured ? "pillar-featured" : ""} ${pillar.hidden ? "pillar-hidden" : ""}`}>
    <span className="pillar-label">{pillar.label}</span>
    <span className="pillar-sub">{pillar.subtitle}</span>
    <div className="pillar-hanja" aria-label={pillar.hidden ? "시간 정보 없음" : `${pillar.stem}${pillar.branch}`}>
      {pillar.hidden ? <><span>?</span><span>?</span></> : <><span>{pillar.stem}</span><span>{pillar.branch}</span></>}
    </div>
    <span className="pillar-element">{pillar.hidden ? "정보 없음" : `${pillar.element} · ${ELEMENT_DATA[pillar.element].hanja}`}</span>
  </div>;
}

function ResultSection({ reading, onReset }: { reading: Reading; onReset: () => void }) {
  const [copyState, setCopyState] = useState<"idle" | "copied" | "failed">("idle");
  const copy = async () => {
    const pillars = reading.pillars.filter(p => !p.hidden).map(p => `${p.label} ${p.stem}${p.branch}`).join(" · ");
    const summary = `온결 사주 결과\n${reading.name} · 양력 ${reading.formattedSolarDate}\n${pillars}\n일간 ${reading.dayMaster}(${reading.dayElement})\n${reading.interpretation.title}\n${reading.interpretation.lead}\n\n※ 전통 명리학에 기반한 재미와 성찰용 해석입니다.`;
    try { await navigator.clipboard.writeText(summary); setCopyState("copied"); }
    catch { setCopyState("failed"); }
  };
  const counts = reading.distribution;
  return <section className="result-section" id="result" aria-live="polite">
    <div className="result-topline"><span className="result-index">YOUR SAJU STORY / 01</span><button className="text-link" onClick={onReset}>다시 입력하기 <ArrowIcon /></button></div>
    <div className="result-intro"><SectionEyebrow>나의 사주 결과</SectionEyebrow><h2><em>{reading.name}</em>의 타고난 결을<br />천천히 펼쳐볼게요.</h2><p>양력 {reading.formattedSolarDate} · 음력 {reading.formattedLunarDate}</p></div>
    <div className="result-board">
      <div className="board-heading"><div><span className="mini-label">THE FOUR PILLARS</span><h3>나의 사주팔자</h3></div><span className="board-hint">오른쪽에서 왼쪽으로 년·월·일·시가 놓입니다</span></div>
      <div className="pillars-grid">{reading.pillars.map(p => <PillarCard key={p.label} pillar={p} featured={p.label === "일주"} />)}</div>
      <p className="board-footnote">* 년주와 월주는 절기 기준, 일주는 자시(23시) 경계의 한 관례를 적용합니다. 출생 지역에 따른 진태양시 보정과 과거 서머타임은 반영하지 않았어요.</p>
    </div>
    <div className="insights-grid">
      <div className="insight-panel element-panel"><span className="mini-label">FIVE ELEMENTS</span><h3>오행의 분포</h3><p className="panel-description">사주의 글자에 나타난 다섯 기운의 모습이에요.</p><div className="element-bars">{ELEMENTS.map((el: Element) => <div className="element-row" key={el}><div className="element-name"><b>{el}</b><small>{ELEMENT_DATA[el].english}</small></div><div className="element-track"><div className="element-fill" style={{ width: `${(counts[el] / reading.counted) * 100}%`, background: ELEMENT_DATA[el].color }} /></div><span className="element-count">{counts[el]}</span></div>)}</div><p className="chart-caption">* 천간·지지의 대표 오행을 단순 합산한 분포로, 지장간·계절 가중치는 포함하지 않습니다. 적거나 없는 오행이 곧 불운을 뜻하지는 않아요.</p></div>
      <div className="insight-panel master-panel"><span className="mini-label">DAY MASTER</span><h3>나를 상징하는 일간</h3><div className="master-character" style={{ color: ELEMENT_DATA[reading.dayElement].color }}>{reading.dayMaster}<span>{ELEMENT_DATA[reading.dayElement].hanja}</span></div><div className="master-bottom"><div><span className="master-tag">{reading.dayPolarity} · {reading.dayElement}({ELEMENT_DATA[reading.dayElement].hanja})</span><p>{ELEMENT_DATA[reading.dayElement].summary}의 이미지</p></div><span className="master-sparkle">✧</span></div></div>
    </div>
    <div className="interpretation-card"><div className="reading-ornament">✺</div><SectionEyebrow>사주로 읽는 나의 기질</SectionEyebrow><h3>{reading.interpretation.title}</h3><p className="interpretation-lead">{reading.interpretation.lead}</p><div className="reading-columns"><article><span>01 / 나의 강점</span><p>{reading.interpretation.gift}</p></article><article><span>02 / 관계의 결</span><p>{reading.interpretation.relationship}</p></article><article><span>03 / 오늘의 작은 제안</span><p>{reading.interpretation.tip}</p></article></div><div className="reading-actions"><button className="btn btn-dark" type="button" onClick={copy}>{copyState === "copied" ? "결과가 복사되었어요" : copyState === "failed" ? "복사할 수 없어요" : "나의 결과 복사하기"}<ArrowIcon /></button><span>나만의 속도로, 나의 이야기를 써 내려가세요.</span></div></div>
    <p className="result-disclaimer">이 서비스는 전통 명리학의 상징적 해석을 제공하며, 과학적으로 검증된 성격 검사나 미래 예측이 아닙니다. 중요한 건강·재정·진로 결정의 근거로 사용하지 마세요.</p>
  </section>;
}

export default function App() {
  const [info, setInfo] = useState<BirthInfo>({ name: "", date: "", time: "12:00", unknownTime: false, calendar: "solar", leapMonth: false });
  const [error, setError] = useState("");
  const [reading, setReading] = useState<Reading | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const formRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const update = <K extends keyof BirthInfo>(key: K, value: BirthInfo[K]) => {
    setInfo(old => ({ ...old, [key]: value }));
    if (error) setError("");
  };
  const goToForm = () => formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  const submit = (event: FormEvent) => {
    event.preventDefault();
    setError("");
    try {
      const next = calculateSaju(info);
      setReading(next);
      window.setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    } catch (cause) {
      setReading(null);
      setError(cause instanceof Error ? cause.message : "입력 내용을 확인해 주세요.");
    }
  };
  const reset = () => { setReading(null); goToForm(); };
  return <>
    <div className="site-shell">
      <header className="site-header"><div className="container header-inner"><a className="brand" href="#top" aria-label="온결 홈"><BrandMark size={32} /><span>온결<small>ONGYEOL</small></span></a><nav className="header-nav" aria-label="주 메뉴"><a href="#about">온결 이야기</a><a href="#how">이용 방법</a><a href="#faq">자주 묻는 질문</a></nav><button className="header-cta" onClick={goToForm}>나의 사주 보기 <ArrowIcon diagonal /></button></div></header>
      <main>
        <section className="hero" id="top"><div className="container hero-layout"><div className="hero-copy"><div className="hero-kicker"><span className="dot-sun">✳</span> 나를 이해하는 또 하나의 방법 <span className="kicker-rule" /></div><h1>나에게는<br /><em>나만의 결</em>이<br />있으니까.</h1><p className="hero-description">우리는 저마다 다른 계절과 빛을 품고 태어납니다.<br />네 기둥, 여덟 글자로 만나는 나의 이야기.<br />온결에서 천천히 시작해 보세요.</p><div className="hero-actions"><button className="btn btn-primary" onClick={goToForm}>무료로 내 사주 알아보기 <ArrowIcon /></button><span className="hero-fineprint">가입 없이 · 간편하게 · 지금 바로</span></div><div className="hero-side-label">YOUR OWN RHYTHM, YOUR OWN STORY.</div></div><div className="hero-art"><HeroOrb /></div></div><div className="hero-bottom container"><span>EXPLORE YOUR INNER UNIVERSE</span><span className="scroll-cue">아래로 내려 알아보기 <span>↓</span></span></div></section>
        <section className="intro-strip" id="about"><div className="container intro-strip-inner"><div className="intro-seal">四<br />柱</div><p>사주는 미래를 정해주는 답이 아니라,<br /><strong>나를 돌아보게 하는 하나의 언어</strong>일지도 모릅니다.</p><span>온결은 전통을 오늘의 언어로 풀어냅니다.</span></div></section>
        <section className="how-section section-pad" id="how"><div className="container"><div className="center-heading"><SectionEyebrow>HOW IT WORKS</SectionEyebrow><h2>세 걸음으로 만나는<br /><em>나의 이야기</em></h2><p>어려운 용어는 잠시 내려놓고, 가벼운 호기심으로 시작해요.</p></div><div className="steps-grid">{stepItems.map((s, i) => <article className="step-card" key={s.number}><div className="step-graphic"><span className="step-number">{s.number}</span><span className={`step-illustration step-illustration-${i}`}>{i === 0 ? "◷" : i === 1 ? "☷" : "✺"}</span></div><h3>{s.title}</h3><p>{s.detail}</p>{i < 2 && <span className="step-arrow" aria-hidden="true">→</span>}</article>)}</div></div></section>
        <section className="form-section section-pad" id="start" ref={formRef}><div className="container form-layout"><div className="form-intro"><SectionEyebrow>BEGIN YOUR STORY</SectionEyebrow><h2>어떤 날,<br />어떤 빛으로<br /><em>태어났나요?</em></h2><p>태어난 날과 시간을 알려주세요.<br />그날의 하늘이 품었던 네 가지 기둥을 찾아드릴게요.</p><div className="form-quote"><span>“</span><p>나를 알아가는 작은 질문에서<br />나만의 이야기가 시작됩니다.</p></div><div className="form-motif" aria-hidden="true">日 月 星</div></div><div className="birth-form-card"><div className="form-card-head"><div><span>MY BIRTH STORY</span><h3>나의 사주 알아보기</h3></div><span className="form-card-icon">✳</span></div><form onSubmit={submit} noValidate><div className="field"><label htmlFor="birth-name">이름 <span className="optional">선택</span></label><input id="birth-name" className="input-control" type="text" placeholder="어떻게 불러드릴까요?" autoComplete="off" maxLength={20} value={info.name} onChange={e => update("name", e.target.value)} /></div><div className="field"><span className="field-label" id="calendar-label">생년월일 기준</span><div className="segmented" role="group" aria-labelledby="calendar-label"><button type="button" className={info.calendar === "solar" ? "selected" : ""} aria-pressed={info.calendar === "solar"} onClick={() => { update("calendar", "solar"); update("leapMonth", false); }}>양력</button><button type="button" className={info.calendar === "lunar" ? "selected" : ""} aria-pressed={info.calendar === "lunar"} onClick={() => update("calendar", "lunar")}>음력</button></div></div><div className="field"><label htmlFor="birth-date">생년월일 <span className="required-dot">*</span></label><input className="input-control date-input" id="birth-date" type="date" min="1900-01-01" max="2099-12-31" required value={info.date} onChange={e => update("date", e.target.value)} /></div>{info.calendar === "lunar" && <label className="checkbox-label leap-label"><input type="checkbox" checked={info.leapMonth} onChange={e => update("leapMonth", e.target.checked)} /><span>윤달에 태어났어요</span></label>}<div className="field"><label htmlFor="birth-time">태어난 시간 <span className="required-dot">*</span></label><input className="input-control" id="birth-time" type="time" value={info.time} disabled={info.unknownTime} onChange={e => update("time", e.target.value)} required={!info.unknownTime} /><label className="checkbox-label"><input type="checkbox" checked={info.unknownTime} onChange={e => update("unknownTime", e.target.checked)} /><span>태어난 시간을 모르겠어요</span></label></div>{error && <p className="form-error" role="alert">{error}</p>}<button className="btn btn-submit" type="submit">나의 사주 펼쳐보기 <ArrowIcon /></button><div className="privacy-note"><span>♧</span> 입력한 정보는 저장하거나 서버로 전송하지 않습니다.</div></form></div></div></section>
        {reading && <div className="container" ref={resultRef}><ResultSection key={`${reading.formattedSolarDate}-${reading.dayMaster}`} reading={reading} onReset={reset} /></div>}
        <section className="values-section section-pad"><div className="container values-inner"><div className="value-deco" aria-hidden="true">✷</div><SectionEyebrow>A LITTLE REMINDER</SectionEyebrow><h2>사주가 말하는 가능성보다<br /><em>내가 만들어갈 가능성</em>이<br />더 크니까.</h2><p>좋은 날도, 흐린 날도 모두 나의 일부예요.<br />온결은 오늘의 나를 조금 더 다정하게 이해하는 시간을 응원합니다.</p><button className="btn btn-outline" onClick={goToForm}>나의 사주 다시 보기 <ArrowIcon /></button></div></section>
        <section className="faq-section section-pad" id="faq"><div className="container faq-layout"><div><SectionEyebrow>FAQ</SectionEyebrow><h2>궁금한 점이<br />있으신가요?</h2><p>처음 만나는 사주, 차근차근 알려드릴게요.</p></div><div className="faq-list">{faqs.map((f, index) => <div className={`faq-item ${openFaq === index ? "faq-open" : ""}`} key={f.q}><button className="faq-question" type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(old => old === index ? null : index)}><span>{f.q}</span><span className="faq-toggle">{openFaq === index ? "−" : "+"}</span></button>{openFaq === index && <div className="faq-answer">{f.a}</div>}</div>)}</div></div></section>
      </main>
      <footer className="footer"><div className="container footer-inner"><div className="footer-brand"><div className="brand"><BrandMark size={30} /><span>온결<small>ONGYEOL</small></span></div><p>나를 읽는 또 하나의 방법.<br />당신만의 결을 응원합니다.</p></div><div className="footer-meta"><p>전통 명리학을 참고한 자기 탐색 서비스입니다.<br />결과는 오락과 성찰을 목적으로 하며, 전문적 조언을 대신하지 않습니다.</p><span>© 2026 ONGYEOL. Made with intention.</span></div></div></footer>
    </div>
  </>;
}
