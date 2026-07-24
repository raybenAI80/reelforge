# 구조·내용 감사 (2026-07-25) — 공식 베스트프랙티스 · 레포 다이어트 · 생태계 연계

> 동반 문서: [2026-07-25-cinematic-refactor-plan.md](2026-07-25-cinematic-refactor-plan.md) (갤러리 퍼스트 리팩토링 플랜).
> 이 감사는 그 플랜과 정합되게 수행됨. 병렬 감사 3기 결과 종합.

## A. 스킬 베스트프랙티스 감사 (Anthropic 공식 문서 3종 실측 대조)

기준 출처: code.claude.com/docs/en/skills · platform 베스트프랙티스 · engineering 블로그 "Equipping agents for the real world with Agent Skills".

### 위반 목록 (심각도순)

| # | 심각도 | 위반 | 근거 | 수정안 |
|---|---|---|---|---|
| V1 | 높음 | "선택형 data blocks" 서사 **4중 중복** | SKILL.md:178-186 / design-direction.md:160-167 / scene-authoring.md:232-239 / codex-runner.md:206-216 — 동일 문단 4회 반복(드리프트 폭탄) | 정본은 scene-authoring.md Appendix 1곳. SKILL.md는 2줄, 나머지 2파일은 1줄 포인터 |
| V2 | 높음 | 프래그먼트 계약 전문이 SKILL.md 본문 상주 + 3곳 중복 | SKILL.md:74-89 ≒ scene-authoring.md:19-79(정본) ≒ design-direction.md:63-77 ≒ codex-runner.md:71-78. `--rf-*` 토큰 13종 리스트 3곳 축자 반복 | SKILL.md Step 2는 파일럿 게이트+소유권+de-slide 1줄+포인터만. 계약 전문은 scene-authoring.md 단독 보유 |
| V3 | 높음 | 무음 씬 mock-audio 절차 완전 중복 (sha256 64자 상수 2곳) | SKILL.md:101-105 = scene-authoring.md:143-171 | SKILL.md 2줄 포인터로 축소 |
| V4 | 중간 | description 범용 트리거 라우팅 충돌 | "영상 만들어"·"faceless video"가 hyperframes/faceless-explainer 트리거와 충돌 | "ReelForge로 영상 만들어"로 한정, "faceless video" 삭제, 네거티브 스코프 1문장 추가 |
| V5 | 중간 | 2단계 깊이 참조 사슬 | SKILL.md → design-direction.md → docs/motion-design-guide.md (8회 인용, 실질 3-hop) | docs 2종을 References 절에 직접 등재(임시) → 리팩토링 Phase 5의 강등+ROUTING.md 포인터로 근본 해소 |
| V6 | 중간 | 100줄+ 참조 파일 3종 전부 목차 없음 | design-direction(184) · scene-authoring(278) · codex-runner(216) | 각 파일 상단 4~7줄 Contents 추가. 신설 gallery/ROUTING.md에도 동일 규칙 |
| V7 | 낮음 | `allowed-tools` 등 frontmatter 미활용 | SKILL.md:1-4 name/description만 | `allowed-tools: Bash(node bin/vf *), Bash(ffmpeg *), Bash(npx hyperframes *), Bash(rg *)` + `argument-hint` 추가 |
| V8 | 낮음 | 본문 잔여 비대·마법 상수 | pilot.json 스니펫(스키마 중복), "42s ≈ 6 min" 특정 머신 실측치 | 스키마 포인터 1줄 / 배수 표현으로 완화 |
| V9 | 낮음 | 참조 로딩 시점 미지정 | References 절이 파일명 나열만 | 각 Step에 point-of-use 포인터 ("워커 디스패치 전 scene-authoring.md 읽기" 등) |

### 권장 SKILL.md 목표 구조 (총 ~115줄, 리팩토링 D1~D5 증설 후에도 140줄 이내)

frontmatter 6 / 포지셔닝 5 / Step0 8 / Step1(D1~D5+direction-lint) 25 / Step2 14 / Step3 10 / Step4 7 / Step5 12 / Studio 루프 7 / 하드금지 7 / blocks 포인터 2 / References(로딩 시점 명시) 10.

준수 확인: 192줄(<500 상한), 3인칭 description, 워커 템플릿 codex-runner 격리, 명령형 문체, QC 루프, 단일 스코프. codex-runner의 grep 자검 블록은 validator→fix 루프 모범 사례.

## B. 레포 다이어트 실사 (추적 715파일 / 57MB / 팩 27.5MB)

즉시 실행분(코드 수정 1곳): **약 240파일 / 24MB 회수** → 715→475파일(-34%), 57→33MB(-42%).

### 즉시 삭제 (무참조 실증)
- `demos/showcase-darkhype/renders/` 45파일 11.7MB (렌더 산출물, 재생성 가능) — 단 `scenes-src/s09-free.html`은 갤러리 1호 수확 후보라 **절대 유지**
- `assets/images/reelforge-demo-background-brand-preset-wall.png` 1.65MB (레포 전체 grep 참조 0)
- `showcase/*/assets/audio/*.wav` 45파일 ~6.2MB (mock TTS, 재생성 가능. scene_specs·README는 유지)
- `research/` 109파일 ~3.5MB — 예외 2파일: `research/06-plan/VERIFICATION-PLAN.md`·`research/08-audit/RESOLUTION.md`는 `src/gates/p5-*.mjs` inputSet(해시 입력)에 박혀 있어 존치 또는 이동+경로수정 필요

### 아카이브 (docs/history/)
- `LOOP-STATE.md` → loop-state-final.md, `briefs/` 7파일, `reports/P1~P4-review.md`

### reports/ 소거 + gitignore
- `reports/l0-1-report.json` → fixtures/로 이동 + `tests/vf-selftest.mjs:90,102,103` 경로 수정 후 `git rm -r reports/`
- .gitignore 추가: `reports/` (파이프라인이 pipeline-gate-report.json 런타임 재작성), `demos/**/renders/`

### 유지 (참조 실증)
- `poc/` — 죽지 않음: `src/gates/registry.mjs:780~817` P0 게이트 등록, p3-gates·subtitles-sync·schema-lint·package.json 참조. Phase 8 전 동결
- `fixtures/` 159파일 — negative/golden/presets/anchors 전부 게이트 소비 (golden-specs 29회, presets 14회 실측)
- `demos/d1~d3` — tests/demo-visual-qc 참조 + Phase 0 베이스라인. 갤러리 파일럿 합격 후 은퇴 후보
- `demos/intro-v6` — 갤러리 1호 수확 소스 (s01·s05)
- `blocks/` — compiler STAMP_INPUTS 소비, Phase 8 전 동결

### 보류 (Phase 8 엔진 트랙)
poc 전체 해체, `poc/fixtures/p0c/fonts/PretendardVariable.woff2` 1.96MB 중복 통합, hero.gif 4.57MB 릴리스 자산 이전, d1~d3 은퇴. 히스토리 재작성(filter-repo)은 커밋 7개라 비용 0에 가까우나 강제 푸시 필요 — 사용자 결정 사항.

기타: `scripts/craft-contact-sheet.mjs:6`이 미추적 `ops/2607-craft/` 주석 참조 — 죽은 포인터 정리.

## C. 생태계 연계 재설계 — "reelforge는 얇은 디렉터+추천 라우터"

### 소유권 이관 (문법 백과 폐기)

| reelforge 문서 | 정본 이관처 | 처분 |
|---|---|---|
| MDG §A 이징 카탈로그 | hyperframes-animation/adapters/gsap-easing | 포인터화 (§A-4 duration ×2.5 변환은 고유 — 존치) |
| MDG §B R1~R5 | animation blueprints (dataviz-countup·comparison-split·titlecard-reveal) | 삭제 → blueprint ID 참조 |
| MDG §C-4 전환 | animation/transitions catalog + REGISTRY | 포인터화 (§C-1~3 쇼츠훅 1.8s·컷상한 12·한국어 읽기속도는 고유 — 존치) |
| MDG §D 색·글로우 | creative/palettes·house-style | 절반 포인터화 (영상압축 특화 행만 존치) |
| MDG §E T1~T8 | animation 텍스트 애니 24종의 부분집합 | 완전 삭제 → 24종 ID 매핑 표 1개 (플랜 Phase 3의 3자 매핑이 그 자리) |
| design-presets.md Mood/Grammar 서술 | design-* 스킬 + creative/palettes | 서술 포인터화. 실측 대비 표·video-safe 보정·--rf-* 키 표는 고유 — 존치 |

**존치(reelforge 고유)**: 프래그먼트 계약 v1.0, thin manifest, 한국어 TTS 전처리, audio sourceHash, codex-runner 배치 소유권·autopsy 그렙, image-runner v1, 판정 실패 실측 표.

### 이미지 스킬 연계 — 새 계약 만들지 말 것, 기존 `reelforge.image-runner.v1` 재사용
1. **D1~D3 시점**: image-prompt로 프롬프트 컴파일(룩 L1~L9 ↔ frame.md 프리셋 동기, check_prompt ok:true만) → `assets/images/runner/prompts.jsonl`
2. **씬 스웜과 병행**: codex-imagegen이 jsonl 소비 → PARALLEL 스폰 → resultPath 회수 (finalPath 직접 쓰기 금지 기존 규칙 유지)
3. **Assemble 직전**: accepted → finalPath + versions.json
4. **media-use 경계 한 줄**: "검색해서 찾는 것 = media-use, 프롬프트로 빚는 것 = image-prompt→codex-imagegen." 생성 완료 finalPath는 `media-use resolve --from`으로 원장 등록 → 크로스 프로젝트 재사용 공짜

### 추천 레이어 배치 결론
- **reelforge SKILL.md 자신이 얇은 추천 라우터** — 별도 스킬 신설 X (홉만 증가, 동결 규율이 스킬 경계를 넘음), hyperframes 진입 스킬 개조 X (벤더 소유물, 업데이트마다 유실)
- 추천 실체 = `references/gallery/ROUTING.md` (씬 의도 동사 7 × 아크 구간 4 → refId). refId는 (a) 갤러리 검증 프래그먼트 (b) hyperframes-animation blueprint/rule/텍스트애니-24 ID 참조
- **card-shorts 경계**: 캐러셀(4:5 PNG+쇼츠)은 라우팅 표에서 `/card-shorts` 디스패치로 위임만. 캐러셀 문법 복제 금지 (정본 이중화 방지)

### 최종 아키텍처
reelforge 소유 4종만: ① 디렉션 절차 D1~D5 ② 검증 갤러리+ROUTING ③ 기계 게이트(direction-lint·gallery-verify·strip QC) ④ 위임 계약(이미지/캐러셀/미디어). 모션·디자인 어휘 정본 = hyperframes-animation/-creative. 복제 0.
