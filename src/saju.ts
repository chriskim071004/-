import { Lunar, Solar } from "lunar-javascript";

export type Element = "목" | "화" | "토" | "금" | "수";
export type Calendar = "solar" | "lunar";
export type BirthInfo = {
  name: string;
  date: string;
  time: string;
  unknownTime: boolean;
  calendar: Calendar;
  leapMonth: boolean;
  gender?: "male" | "female" | "unspecified";
};
export type Pillar = {
  label: string;
  subtitle: string;
  stem: string;
  branch: string;
  element: Element;
  hidden: boolean;
};
export type Reading = {
  name: string;
  formattedSolarDate: string;
  formattedLunarDate: string;
  pillars: Pillar[];
  dayMaster: string;
  dayElement: Element;
  dayPolarity: string;
  distribution: Record<Element, number>;
  strongest: Element;
  weakest: Element;
  counted: number;
  interpretation: {
    title: string;
    lead: string;
    gift: string;
    relationship: string;
    tip: string;
  };
};

export const ELEMENTS: Element[] = ["목", "화", "토", "금", "수"];
export const ELEMENT_DATA: Record<Element, { hanja: string; english: string; color: string; summary: string }> = {
  목: { hanja: "木", english: "Wood", color: "#528978", summary: "성장과 확장" },
  화: { hanja: "火", english: "Fire", color: "#d4745f", summary: "표현과 열정" },
  토: { hanja: "土", english: "Earth", color: "#c19b5a", summary: "균형과 안정" },
  금: { hanja: "金", english: "Metal", color: "#8a90a5", summary: "원칙과 결단" },
  수: { hanja: "水", english: "Water", color: "#668bb2", summary: "사유와 유연함" },
};

const STEM_ELEMENT: Record<string, Element> = {
  "甲": "목", "乙": "목", "丙": "화", "丁": "화", "戊": "토", "己": "토", "庚": "금", "辛": "금", "壬": "수", "癸": "수",
};
const BRANCH_ELEMENT: Record<string, Element> = {
  "寅": "목", "卯": "목", "巳": "화", "午": "화", "辰": "토", "戌": "토", "丑": "토", "未": "토", "申": "금", "酉": "금", "亥": "수", "子": "수",
};
const POLARITY = new Set(["甲", "丙", "戊", "庚", "壬"]);
const ARCHETYPES: Record<Element, { title: string; lead: string; gift: string; relationship: string; tip: string }> = {
  목: {
    title: "자라나는 가능성을 보는 사람",
    lead: "목(木)은 뿌리를 내리고 가지를 뻗는 나무의 이미지와 닮아 있어요. 새로운 가능성에 시선을 두고, 조금씩 성장하는 과정에서 힘을 얻는 기질로 읽습니다.",
    gift: "시작하는 용기와 꾸준함을 장점으로 삼아보세요. 새로운 계획을 구체적인 작은 행동으로 옮길 때 자기다움이 또렷해질 수 있어요.",
    relationship: "함께 성장하는 관계에서 편안함을 느낄 수 있어요. 상대의 속도와 나의 속도가 다르다는 점을 인정하는 태도도 중요합니다.",
    tip: "이번 주에는 오래 미뤄두었던 일의 첫 단계를 작게 시작해 보세요.",
  },
  화: {
    title: "세상에 온기를 전하는 사람",
    lead: "화(火)는 빛과 열처럼 주변을 밝히는 이미지예요. 생각과 감정을 표현하고, 사람과 아이디어 사이에 활기를 불어넣는 기질로 읽습니다.",
    gift: "남다른 표현력과 추진력을 살려보세요. 다만 에너지가 빠르게 소진될 때는 속도를 조절하는 시간이 도움이 될 수 있어요.",
    relationship: "따뜻한 공감과 솔직한 표현은 장점이 될 수 있어요. 때로는 말하기보다 듣는 시간을 조금 더 가져보세요.",
    tip: "오늘 마음을 움직인 순간을 한 문장으로 기록해 보세요.",
  },
  토: {
    title: "흔들림 속에서 중심을 찾는 사람",
    lead: "토(土)는 모든 것이 머무르고 자라나는 대지의 이미지예요. 주변을 살피며 균형을 만들고, 신뢰를 차근차근 쌓는 기질로 읽습니다.",
    gift: "차분한 책임감과 안정감을 강점으로 삼아보세요. 모든 일을 혼자 떠안기보다 주변에 도움을 청하는 것도 균형의 일부입니다.",
    relationship: "오래 가는 관계와 일상의 약속을 소중히 여길 수 있어요. 익숙함 속에서도 새로움을 허용해보세요.",
    tip: "지금 나에게 꼭 필요한 일 하나, 내려놓아도 되는 일 하나를 적어보세요.",
  },
  금: {
    title: "자신만의 기준을 빚어가는 사람",
    lead: "금(金)은 단단하면서도 정교하게 다듬어지는 금속의 이미지예요. 분명한 기준과 판단력, 완성도를 추구하는 기질로 읽습니다.",
    gift: "복잡한 상황을 정리하고 결정하는 힘이 장점이 될 수 있어요. 완벽함보다 충분함을 선택할 때 더 자유로워질 수 있습니다.",
    relationship: "약속과 신뢰를 중요하게 여기기 쉬워요. 상대가 다른 방식으로 마음을 표현할 수도 있다는 점을 기억해보세요.",
    tip: "스스로 정한 높은 기준 중 하나를 조금 유연하게 조정해보세요.",
  },
  수: {
    title: "깊이 생각하고 흐름을 읽는 사람",
    lead: "수(水)는 멈춰 있기도 흐르기도 하는 물의 이미지예요. 관찰력과 상상력으로 상황을 이해하고, 변화에 맞춰 유연하게 움직이는 기질로 읽습니다.",
    gift: "섬세한 관찰과 깊은 사유를 강점으로 살려보세요. 생각이 길어질 때는 작은 실행으로 균형을 찾아보는 것도 좋아요.",
    relationship: "상대의 말 뒤에 있는 감정을 잘 살피는 편으로 해석할 수 있어요. 자신의 마음도 충분히 표현하는 연습을 해보세요.",
    tip: "머릿속 생각 하나를 밖으로 꺼내 글이나 대화로 나눠보세요.",
  },
};

function parseDate(value: string, calendar: Calendar): { year: number; month: number; day: number } {
  const matched = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!matched) throw new Error("생년월일을 올바르게 입력해 주세요.");
  const year = Number(matched[1]);
  const month = Number(matched[2]);
  const day = Number(matched[3]);
  if (year < 1900 || year > 2099 || month < 1 || month > 12 || day < 1 || day > 31) {
    throw new Error("1900년부터 2099년 사이의 날짜를 입력해 주세요.");
  }
  if (calendar === "lunar") {
    if (day > 30) throw new Error("음력 날짜는 1일부터 30일까지 입력해 주세요.");
  } else {
    const verify = new Date(Date.UTC(year, month - 1, day));
    if (verify.getUTCFullYear() !== year || verify.getUTCMonth() !== month - 1 || verify.getUTCDate() !== day) {
      throw new Error("존재하지 않는 날짜예요. 다시 확인해 주세요.");
    }
  }
  return { year, month, day };
}

function parseTime(time: string, unknownTime: boolean): { hour: number; minute: number } {
  if (unknownTime) return { hour: 12, minute: 0 };
  const matched = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);
  if (!matched) throw new Error("출생 시간을 확인해 주세요.");
  return { hour: Number(matched[1]), minute: Number(matched[2]) };
}

function makePillar(label: string, subtitle: string, glyphs: string, hidden = false): Pillar {
  const chars = Array.from(glyphs);
  const stem = chars[0] ?? "";
  const branch = chars[1] ?? "";
  if (!STEM_ELEMENT[stem] || !BRANCH_ELEMENT[branch]) throw new Error("사주 계산 결과를 불러오지 못했어요.");
  return { label, subtitle, stem, branch, element: STEM_ELEMENT[stem], hidden };
}

export function calculateSaju(info: BirthInfo): Reading {
  const { year, month, day } = parseDate(info.date, info.calendar);
  const { hour, minute } = parseTime(info.time, info.unknownTime);

  try {
    const lunar = info.calendar === "solar"
      ? Solar.fromYmdHms(year, month, day, hour, minute, 0).getLunar()
      : Lunar.fromYmdHms(year, info.leapMonth ? -month : month, day, hour, minute, 0);

    const converted = lunar.getSolar();
    const lunarMonth = lunar.getMonth();
    if (info.calendar === "lunar" && (lunar.getYear() !== year || lunarMonth !== (info.leapMonth ? -month : month) || lunar.getDay() !== day)) {
      throw new Error("입력하신 음력 날짜를 확인할 수 없어요. 윤달 여부도 확인해 주세요.");
    }
    if (converted.getYear() < 1900 || converted.getYear() > 2099) {
      throw new Error("변환된 날짜가 지원 범위를 벗어났어요.");
    }

    const eight = lunar.getEightChar();
    eight.setSect(2);
    const pillars: Pillar[] = [
      makePillar("시주", "태어난 시간", eight.getTime(), info.unknownTime),
      makePillar("일주", "나 자신", eight.getDay()),
      makePillar("월주", "성장과 환경", eight.getMonth()),
      makePillar("년주", "뿌리와 시작", eight.getYear()),
    ];
    const distribution = Object.fromEntries(ELEMENTS.map(element => [element, 0])) as Record<Element, number>;
    for (const p of pillars) {
      if (p.hidden) continue;
      distribution[STEM_ELEMENT[p.stem]] += 1;
      distribution[BRANCH_ELEMENT[p.branch]] += 1;
    }
    const dayMaster = pillars[1].stem;
    const dayElement = STEM_ELEMENT[dayMaster];
    const sorted = [...ELEMENTS].sort((a, b) => distribution[b] - distribution[a]);
    const weakest = [...ELEMENTS].sort((a, b) => distribution[a] - distribution[b])[0];
    return {
      name: info.name.trim() || "당신",
      formattedSolarDate: `${converted.getYear()}년 ${converted.getMonth()}월 ${converted.getDay()}일`,
      formattedLunarDate: `${lunar.getYear()}년 ${Math.abs(lunarMonth)}월 ${lunar.getDay()}일${lunarMonth < 0 ? " (윤달)" : ""}`,
      pillars,
      dayMaster,
      dayElement,
      dayPolarity: POLARITY.has(dayMaster) ? "양(陽)" : "음(陰)",
      distribution,
      strongest: sorted[0],
      weakest,
      counted: info.unknownTime ? 6 : 8,
      interpretation: ARCHETYPES[dayElement],
    };
  } catch (error) {
    if (error instanceof Error && /입력하신 음력|변환된 날짜|사주 계산/.test(error.message)) throw error;
    throw new Error(info.calendar === "lunar"
      ? "음력 날짜를 변환하지 못했어요. 날짜와 윤달 여부를 확인해 주세요."
      : "사주를 계산하지 못했어요. 날짜와 시간을 다시 확인해 주세요.");
  }
}
