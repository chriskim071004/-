# 온결 (ONGYEOL) — 사주 웹사이트 MVP

생년월일시로 사주팔자(년주·월주·일주·시주)를 계산하고, 오행의 단순 분포와 일간 중심의 자기 탐색 문구를 보여주는 모바일 반응형 웹사이트입니다.

> **구현 기준:** 사용자 제공 유튜브 재생목록을 직접 열람/전사하지 못한 상태에서 작성한 **독립적인 초기 MVP**입니다. 영상별 기능과 화면을 동일하게 복제했다고 주장하지 않습니다. 향후 영상 자막·스크린샷 등이 확보되면 그 내용에 맞춰 조정합니다. 첫 편의 Claude Code 대신 Codex를 사용한다는 요구를 반영해, 별도의 Claude Code 의존성은 없습니다.

## 기능

- 양력 / 음력 생년월일, 음력 윤달, 태어난 시간 또는 시간 미상 입력
- `lunar-javascript`의 절기 기준 간지 계산으로 사주팔자 구성
- 5행(목·화·토·금·수) 대표 오행의 단순 개수 시각화
- 일간 기반 전통 상징 소개 (AI 해석이 아닌 **규칙 기반** 설명)
- 생년월일 입력 정보는 브라우저에서만 계산, 서버 전송·저장 없음
- 모바일/데스크톱 반응형, 사주 결과 텍스트 복사

## 실행

Node.js 20.19+ 또는 22.12+가 필요합니다.

```bash
npm install
npm run dev
npm run build
```

## GitHub → Vercel

1. GitHub 저장소 `chriskim071004/-`를 Vercel에 연결합니다.
2. Framework Preset: `Vite`, Root Directory: `./`, Build Command: `npm run build`, Output Directory: `dist`.
3. Production Branch: `main`. 빌드 성공 후 `.vercel.app` 주소로 접속합니다.
4. API 키나 환경변수는 필요하지 않습니다.

## 계산의 경계와 주의사항

- 년·월 간지는 **절기 기준**이며, 일간은 `lunar-javascript`의 23시 처리 관례(`sect=2`)를 사용합니다.
- 오행 그래프는 6~8개 표면 글자의 대표 오행을 단순 합산하며, 지장간·월령 가중치·용신 판정 등이 **포함되지 않습니다**.
- 출생 장소별 진태양시 보정, 한국 과거 시간대 변경/서머타임 등에 따른 보정은 **미지원**입니다.
- 시간 미상 시 시주를 표시하지 않고 6글자만으로 분포를 계산합니다.
- 전통 문화/오락/성찰 목적입니다. 과학적 성격 검사, 건강 상담, 투자·재정·진로 의사결정의 근거가 아닙니다.

## 튜토리얼 링크

재생목록: <https://www.youtube.com/playlist?list=PLXMf_KG5mCRFnV__p-4Z1WfLyWP6iceKs>

1. https://www.youtube.com/watch?v=jgmRt51fIis
2. https://www.youtube.com/watch?v=QFGKYztdcSE
3. https://www.youtube.com/watch?v=Depr4W2zIDw
4. https://www.youtube.com/watch?v=_eR86405CM4
5. https://www.youtube.com/watch?v=yh88oP6bpzo
6. https://www.youtube.com/watch?v=Jk70XqGX1P4
7. https://www.youtube.com/watch?v=AqHkF4u3BgM
8. https://www.youtube.com/watch?v=Sdg9tGv_TP0
9. https://www.youtube.com/watch?v=0fviZrPOYzA
10. https://www.youtube.com/watch?v=fP76VCQF__8
