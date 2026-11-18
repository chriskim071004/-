# 온결 — 사주팔자 / 오늘의 운세 (Codex project)

A Korean-language saju web application built with Next.js App Router + TypeScript + Tailwind CSS. It uses lunar-javascript for deterministic four-pillar conversion and an optional server-side Google Gemini API for interpretation.

## Tutorial adaptation

The provided 10 lesson transcripts use **Claude Code** as the coding agent. In this repository, **OpenAI Codex** replaces Claude Code for the workflow (planning, implementing, fixing, testing, committing). This does not mean the site's Gemini API must be replaced: the lesson explicitly uses **Google Gemini** for fortune generation.

## Development

1. Install Node.js 22 or newer. Run npm install and npm run dev in the project root.
2. Visit http://localhost:3000.
3. For AI interpretation, copy .env.example to .env.local and set GEMINI_API_KEY yourself. Never paste secrets into chat or commit them. Restart the dev server.
4. Optional: set NEXT_PUBLIC_SPLINE_SCENE_URL to an authorized Spline community remix/embed URL. Without the exact model URL from the tutorial, a CSS pointer-reactive computer is shown.
5. Verify using npm run typecheck and npm run build.

## Vercel

Connect this GitHub repo to Vercel, set Framework Preset to Next.js and remove legacy Vite build/output overrides. Configure GEMINI_API_KEY in Project Settings → Environment Variables; redeploy after changes. A missing key displays a clear message and the browser-side basic chart still works.

## Features & accuracy

- Solar/lunar birth dates, leap lunar months, unknown birth hour, gender input.
- Four pillars and simplified five-element chart. An unknown hour never displays a made-up hour pillar.
- Two modes: 4-pillar overview and daily fortune; six themed Gemini reading categories.
- AI key is server-only; the server computes the chart and sends only derived stems/branches, day-master and requested category to Gemini. No user-name or full birthday is included in the Gemini prompt.
- Interpretations are traditional/entertainment content, not scientific predictions. Date boundaries, solar-term rules, location and true-solar-time corrections can change results: independent verification is required before asserting exact manse-ryeok parity.
- The rate limiter is best effort per serverless instance; configure a durable external rate limiter before accepting large public traffic.

## Test examples from lesson 8

- Gregorian 2000-10-20 19:30, Seoul: compare to reference pillars (hour/day/month/year) 丁酉 / 辛亥 / 丙戌 / 庚辰, subject to time correction conventions.
- Gregorian 2002-04-12 07:00: compare to independent reference with identical timezone and true-solar settings.
- Gregorian 2010-06-30 17:15: test time pillar carefully because reference true-solar-time changes this.
- Repeat with unknown birth time, invalid dates, lunar leap month, and just-before/after solar terms.

No API keys are committed. No full Spline scene link or screenshot was supplied in the transcripts.
