const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const ts = require("typescript");

const moduleFile = path.join(__dirname, "..", "src", "saju.ts");
// Execute the actual TypeScript calculation module via TypeScript's installed CJS transpiler.
const source = fs.readFileSync(moduleFile, "utf8");
const js = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = { exports: {} };
new Function("require", "module", "exports", js)(require, mod, mod.exports);
const { calculateSaju } = mod.exports;

function chart(date, time = "12:00", options = {}) {
  return calculateSaju({
    name: "회귀 테스트", date, time,
    calendar: "solar", unknownTime: false, leapMonth: false,
    ...options,
  });
}
function pillars(result) {
  return result.pillars.map(x => x.hidden ? "미상" : x.stem + x.branch);
}

test("2000-10-20 reference: 辛亥 day, 丙戌 month, 庚辰 year", () => {
  assert.deepEqual(pillars(chart("2000-10-20", "18:30")).slice(1),
    ["辛亥", "丙戌", "庚辰"]);
});
test("2002-04-12 reference: 庚戌 day, 甲辰 month, 壬午 year", () => {
  assert.deepEqual(pillars(chart("2002-04-12", "07:00")).slice(1),
    ["庚戌", "甲辰", "壬午"]);
});
test("2010-06-30 reference: 辛亥 day, 壬午 month, 庚寅 year", () => {
  assert.deepEqual(pillars(chart("2010-06-30", "17:15")).slice(1),
    ["辛亥", "壬午", "庚寅"]);
});
test("time pillars differ at local 19:00 without true-solar correction", () => {
  const before = pillars(chart("2000-10-20", "18:30"))[0];
  const after = pillars(chart("2000-10-20", "19:30"))[0];
  assert.equal(before, "丁酉");
  assert.equal(after, "戊戌");
});
test("unknown hour never invents a visible pillar", () => {
  const result = chart("2000-10-20", "99:99", { unknownTime: true });
  assert.equal(result.pillars[0].hidden, true);
  assert.equal(result.counted, 6);
  assert.equal(pillars(result)[0], "미상");
});
test("invalid Gregorian leap day rejected", () => {
  assert.throws(() => chart("2001-02-29"), /존재하지 않는 날짜/);
  assert.doesNotThrow(() => chart("2000-02-29"));
});
test("out of range dates rejected", () => {
  assert.throws(() => chart("1899-12-31"), /1900년부터/);
  assert.throws(() => chart("2100-01-01"), /1900년부터/);
});
test("lunar conversion round trip from 2000-10-20", () => {
  const solar = chart("2000-10-20", "11:00");
  const year = Number(solar.formattedLunarDate.match(/^\d+/)[0]);
  const matched = solar.formattedLunarDate.match(/(\d+)월 (\d+)일/);
  const lunarDate = [
    String(year).padStart(4, "0"),
    matched[1].padStart(2, "0"),
    matched[2].padStart(2, "0"),
  ].join("-");
  const converted = chart(lunarDate, "11:00", {
    calendar: "lunar", leapMonth: solar.formattedLunarDate.includes("윤달"),
  });
  assert.equal(converted.formattedSolarDate, solar.formattedSolarDate);
  assert.deepEqual(pillars(converted), pillars(solar));
});
