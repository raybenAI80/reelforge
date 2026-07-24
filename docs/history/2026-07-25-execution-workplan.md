# ReelForge 전체 실행 워크플랜 (C1~C7) — 워커 분담·전체 내역

> 근거 문서(전부 2026-07-25 확정): [skill-architecture-decision.md](2026-07-25-skill-architecture-decision.md)(커밋 로드맵 정본) · [cinematic-refactor-plan.md](2026-07-25-cinematic-refactor-plan.md)(Phase 세부) · [structure-audit.md](2026-07-25-structure-audit.md)(다이어트 실측·위반 목록)
> 원칙: 계획우선 · 워커분산(codex 아끼지 않음) · 렌더는 직렬 · 완료불신(모든 "완료"는 게이트 증거 필수)

## 0. 워커 분담 총괄

| 주체 | 역할 | 이번 플랜 투입량 |
|---|---|---|
| **fable(메인)** | 오케스트레이션 · SKILL.md v7 저작 · 렌더 실행(직렬 규칙 소유) · 커밋 | 상시 |
| **codex** (`codex exec` 병렬, PARALLEL≤15) | 문서 수술 분산 · lint/verify 스크립트 구현 · 씬 일반화 · 갤러리 양산 · grep 스윕 검증 | **총 ~50기** (C2:1 · C3:9 · C4:3 · C5:4 · C6:8 · C7:25±) |
| **opus** (서브에이전트) | 의미 판정 · 문서 정합 검수 · A/B 파일럿 심사(3표) | ~10회 |
| **sonnet** | 초안·요약 등 경량 생성 | 필요 시 |

**전 구간 공통 하드 규칙**: ①렌더 스위트 동시 2개 금지(7.7GB 가짜 FAIL) ②렌더에 timeout 금지 — `setsid`+워처 ③렌더 env: `PRODUCER_LOW_MEMORY_MODE=false PRODUCER_MAX_WORKERS=3 PRODUCER_BROWSER_GPU_MODE=hardware` ④삭제 전 D드라이브 백업 ⑤`intro-v6/scenes-src/*` · `showcase-darkhype/scenes-src/s09-free.html` · `showcase/stat-briefing/scene_specs.json` 은 전 커밋에서 불가침.

---

## C1 — 원본 박제 (반나절 · fable 단독 · codex 0)

**작업**
1. `git add`: docs/history 4건(plan·audit·decision·본 워크플랜) + `skills/reelforge/references/grammar/` 10파일 — **무편집 원형**.
2. SKILL.md description 1줄 수정(V4): `"영상 만들어"`→`"ReelForge로 영상 만들어"`, `"faceless video"` 삭제, 네거티브 스코프 1문장. (C4 전면개정 전까지 유일한 SKILL.md 터치)
3. 커밋 1개.

**완료 판정**: 커밋 직후 `git status` clean + `git diff HEAD` 없음(= 디스크 원본이 무편집으로 커밋됨). 회귀 기준 스냅샷 확보.

---

## C2 — 레포 다이어트 (반나절~1일 · fable 실행 + codex 1)

**선행**: `mkdir -p /mnt/d/reelforge-archive && cp -r research reports briefs demos/showcase-darkhype/renders /mnt/d/reelforge-archive/` (WSL C 디스크 규칙).

**작업 내역** (audit 실측 그대로)
| # | 명령 | 규모 |
|---|---|---|
| 1 | `git rm -r demos/showcase-darkhype/renders` | 45파일 11.7MB |
| 2 | `git rm assets/images/reelforge-demo-background-brand-preset-wall.png` | 1.65MB (참조 0 실측) |
| 3 | `git rm showcase/*/assets/audio/*.wav` | 45파일 6.2MB |
| 4 | research 삭제 — **배제 레시피 순서 고정**: `git rm -r research` → `git checkout HEAD -- research/06-plan/VERIFICATION-PLAN.md research/08-audit/RESOLUTION.md`(p5 게이트 inputSet 해시 리터럴: p5-l2-8-anchors.mjs:200-201 · p5-l3-12-long-video.mjs:367-368 · p5-l2-dense-visual.mjs:311-312) → p5 게이트 그린 확인 후 다음 단계 | 109파일 3.5MB |
| 4b | **design-presets.md 인바운드 링크 수술(같은 커밋 필수)**: `docs/design-presets.md:17~32`가 `research/12-video-design/` 6문서로 거는 Research Basis 링크 16개를 아카이브 각주 1줄("원문 리서치: /mnt/d/reelforge-archive/research/12-video-design/")로 대체 — 이거 없으면 #4가 C2 완료판정("잔존 참조 0")을 스스로 깨뜨림 | 16링크 |
| 5 | `git mv LOOP-STATE.md docs/history/loop-state-final.md` · `git mv briefs docs/history/briefs` · P1~P4-review → `docs/history/reviews/` | 12파일 |
| 6 | `git mv reports/l0-1-report.json fixtures/verify-report-sample.json` + `tests/vf-selftest.mjs` 90·102·103행 경로 수정 → `git rm -r reports/` | 35파일 |
| 7 | `.gitignore` 추가: `reports/` `demos/**/renders/` | — |
| 8 | `scripts/craft-contact-sheet.mjs:6` 죽은 ops/ 주석 포인터 제거 | 1줄 |

**codex 1기(사전+사후 2패스)**: ①**삭제 전** 인바운드 참조 전수 조사 — 유지 대상 전체에서 `rg -n 'research/|reports/|briefs/|LOOP-STATE'` 를 돌려 그 결과를 **예외 산정의 입력**으로 확정(위 #4b가 이 절차로 발견된 사례 — 추가 발견분은 같은 방식으로 예외 추가 또는 링크 수술) ②삭제 후 잔존 참조 0건 검증 리포트.

**완료 판정**: 추적 715→약 475파일 · **워킹트리** 57→33MB(팩 27.5MB는 filter-repo 미실행 시 그대로 — 클론 체감 회수는 사용자가 filter-repo를 결정할 때 실현, 본 커밋 판정 범위 아님). `npm test` 그린(특히 vf-selftest·p5 게이트). 데모 1종 `vf compile` 스모크 PASS.

---

## C3 — 문서 정본화 (1~2일 · codex 8기 병렬 + opus 검수 · SKILL.md 불터치)

파일 단위 격리라 충돌 없음 → codex-spawn 8기 동시. 각 워커는 결정문 §3 처분표를 계약으로 받는다.

| 워커 | 작업 | 산출 |
|---|---|---|
| cx-1 | `git mv grammar/WHEN-TO-USE.md references/gallery/ROUTING.md` 후 **§0 아크 문법 신설**(intensity 0~100 · 프리셋 4종 ramp/double-peak/cliff/steady-pulse · BPM 그리드 — 플랜 Phase 3 명세 이식) + **§해석 규칙 2줄**(셀=grammar ID, lint가 index로 해석) + 부록 3자 매핑(reveal12↔family↔animate-text24) | ROUTING.md ~110줄 |
| cx-2 | design-direction.md 감량 ~125줄: §2→ROUTING 포인터 1문단 · §3→intensity 대체 고지 · MDG §C 페이싱+§A-4 ×2.5 흡수 · Contents 추가 | ~125줄 |
| cx-3 | scene-authoring.md: mood→reveal→emphasis 페어링 표 삭제 · reveal/emphasis 고정값(fade_in/keyword) 봉인 명문 · Contents | ~250줄 |
| cx-4 | codex-runner.md: Appendix 중복→1줄 포인터 · 'approved sibling' 규정 삭제 · 워커 템플릿 주입물 갱신(배정 프래그먼트 전문 or grammar 배정 섹션+keep/mutate) · Contents | ~200줄 |
| cx-5 | `references/strip-qc.md` 신설: MDG §F 금지 13종 + 육안 체크리스트 + 신규 2항(핸드오프 연속성·refId 대조) | ~40줄 |
| cx-6 | MDG 해체: 잔여 섹션 포인터화 → 원문 `docs/history/motion-design-guide-v1.md` 아카이브. **삭제와 포인터는 같은 커밋** | — |
| cx-7 | grammar 언약: 00-INDEX에 owner(local\|hyperframes-animation)/입고상태 컬럼 + ID/헤딩 인용 규칙 1줄 + WHEN-TO-USE 참조를 ROUTING으로 갱신 · 04-masks-mattes.md:89 라인넘버 인용→헤딩 인용 정정 · 8도메인 중립 배너("스케치는 렌더 대상 아님 — 검증 실물은 gallery/, 통째 로딩 금지") | — |
| cx-8 | grammar/02-easing 순수 재설명 스팟트림 ~30줄 (대압축 금지 — 결정문 언약 3) | — |
| cx-9 | `docs/design-presets.md` Mood/Grammar 서술 컬럼 포인터화(design-* 스킬·hyperframes-creative 정본 참조) — **실측 대비표·video-safe 보정·`--rf-*` 키 표는 존치**. 결정문 §3 처분표 이행분 | ~90줄 유지 |

**opus 검수 1회(3관점)**: ①모든 포인터가 실존 파일·실존 헤딩을 가리킴(깨진 링크 0) ②소유권 공백 0(어떤 지식도 정본 1곳 보유) ③"적절히 판단" 류 재량 문장 0. FAIL 항목은 해당 codex 워커 재스폰.

**완료 판정**: opus 3관점 PASS + `rg "WHEN-TO-USE"` 잔존 참조 0 + 커밋 1개(C3).

---

## C4 — SKILL.md v7 + 게이트 실물 (1~2일 · fable 저작 + codex 3)

| 주체 | 작업 |
|---|---|
| **fable** | SKILL.md ~135줄 전면개정 — 결정문 Q4 목차 그대로(12섹션·Ecosystem Contracts 10줄·References 로딩시점 12줄·grammar 본문 등장 0). V1~V9 전량 해소 |
| cx-1 | `scripts/direction-lint.mjs` 구현: RF-DIR-001(미스탬프 셀 → **경고** "sketch-authored·QC강화", 차단 아님) + 002 동일 ref 3회+ · 003 family 3종+ · 004 페어 예산 · 005 intensity 밴드 밖 · 006 슬롯 글자수 초과 · 007 pairs 인접 미배정 · 008 아크 envelope 위반(hard). 셀 해석은 gallery-index.json `implementsGrammar` 조인 |
| cx-2 | lint 단위테스트 8종(위반 코드당 1케이스) + 통과 케이스 2종 |
| cx-3 | `schemas/gallery-index.schema.json` + 빈 `references/gallery/gallery-index.json` 초기화({entries:[]}, implementsGrammar·verified{} 필드 정의) |
| **opus** | SKILL.md v7 적대 검수 1회: 결정문 목차 대비 누락·재량 문장·중복 재유입 판정 |

**완료 판정**: lint 테스트 10종 그린 · 빈 index에서 전 셀 RF-DIR-001 경고 발화 확인(정직한 초기 상태) · `rg` 재량 문장 0 · 커밋 1개. **이후 SKILL.md 봉인** — 실패는 갤러리·ROUTING·index 데이터 커밋으로만 수리.

---

## C5 — 갤러리 Phase 0~1 (1~2일 · codex 4 + fable 렌더)

| 주체 | 작업 |
|---|---|
| cx-1 | Phase 0: 후보 3종(intro-v6 s01/s05 · darkhype s09) 현행 `vf compile`+render-lint PASS 재확인 리포트 |
| **fable** | d1-usage 현행 렌더 1fps 스트립 → `docs/baseline/` 보관 (렌더 직렬 규칙상 fable 소유) |
| cx-2 | `scripts/gallery-verify.mjs`: 하네스 마운트→compile→실렌더 호출→스트립 자동검사(blank/frozen/contrast)→index 스탬프({contractVersion,renderHash,checkedAt})·`--all` 재검증. **스탬프 형식은 C4 cx-3의 `gallery-index.schema.json` 적합 필수(의존 명시)**. **렌더 호출부는 fable 스모크로만 실행** |
| cx-3 | `fixtures/gallery-harness/`: 1씬 mock narration 최소 프로젝트 + 프리셋 3종(라이트/다크/고채도) 스위칭 |
| cx-4 | `fixtures/negative/gallery/` 위장 슬라이드 3종(중앙 헤드라인+fade-in만·등장 후 동결) — verify에서 **반려되어야 통과**하는 역방향 픽스처 |
| **fable** | fragments/{typo,camera,data,object,atmo,seal,pairs}/ 골격 + 더미 1개 verify 왕복(스탬프 찍힘→미스탬프 제외 확인) |

**완료 판정**: 더미 스탬프 왕복 성공 · negative 3종 정확히 반려 · RF-DIR-001이 스탬프 존재 셀에서 경고 해제되는 것 확인 · 커밋 1개.

---

## C6 — Phase 2 seed 수확 6~8개 (1~2일 · codex 6~8 병렬 저작 + fable 직렬 검증)

1. **codex 씬당 1기(6~8 스폰)**: intro-v6 s01→`typo/scale-slam-strike` · s05→`object/hero-overshoot-strobe` · darkhype s09→`data/count-up-punch` + intro-v6 s02~s08에서 2~4개 발굴. 일반화 규칙: 고유 카피→중립 샘플+`data-slot`(글자수 예산) · `--rf-*` 토큰 유지 · 헤더 기계판독 주석 `<!-- rf-gallery v1 | id | implementsGrammar | mutate | keep -->`.
2. **fable**: 엔트리당 3프리셋 gallery-verify **직렬** 실행 → 스탬프.
3. cx-추가 1기: GALLERY.md(스트립 썸네일+한 줄 의미+arcFit) 생성.
4. index `implementsGrammar` ↔ grammar ID 매핑 기입, 00-INDEX 입고상태 컬럼 갱신.

**완료 판정**: seed 6+ 스탬프 · 해당 셀 RF-DIR-001 경고→fragment-route 전환 실증(커버리지 게이지 상승) · 커밋 1개.

---

## C7 — Phase 4 양산 + Phase 6 A/B + Phase 7 플라이휠 (3~5일 · codex 최대 투입)

**7a. 양산 (codex-spawn PARALLEL=15, 총 24~30기)**
- **소스 = grammar 스케치**(결정문 Q2 — hyperframes 재번역 금지). 목표 구색(검증 통과분만 입고): typo≥8 · camera≥4(push-in·pull-out·whip·micro-drift 필수) · data≥3 · object≥3 · atmo≥2 · seal≥2 · **pairs≥4조**(anchorGeometry 좌표 선언).
- grammar 미커버분(animate-text 24 등)만 hyperframes 직이식 — 산문 재집필 없이 프래그먼트+index 역참조.
- 저작은 병렬, **verify(렌더 포함)는 fable 직렬 큐**. 탈락분은 사유(lint 코드·스트립 판정)와 함께 폐기 로그 → Phase 8 요구사항 소스.

**7b. A/B 파일럿 (판정 게이트)**
- d1-usage(또는 stat-briefing) 1편을 새 플로우 전체(D1 컨셉→D2 아크→D3 라우팅→D4 카피→direction-lint→pilot→갤러리 변형 스웜(codex)→조립→렌더(fable)→스트립 QC)로 재제작.
- **opus 3표 심사** — 합격 기준 5종(플랜 Phase 6): ①등장 후 정지 소멸 ②페어 전환 2회 스트립 판독 ③family≤2종 ④intensity 곡선 육안 식별 ⑤동일 진입 트윈 반복 소멸. Phase 0 베이스라인과 나란히 비교.
- 실패 시: 갤러리·ROUTING·index만 수리(SKILL.md 불변). 2회 실패 엔트리는 강등.

**7c. 플라이휠 + ops**
- 역수확 1건 실제 수행(파일럿 신작 안무→verify→입고).
- ops 체크리스트 반영: 계약 버전업 시 `--all` 재검증 · narration 재생성 시 pairs 재검수 · 재라우팅 비용 고지.
- **회귀 레버 상시 감시**: sketch-authored 씬이 QC 강화에도 슬라이드로 회귀하면 RF-DIR-001 warning→error 승격(결정문 소수의견 1).

**완료 판정**: 구색 충족+전 엔트리 스탬프 · A/B 5기준 전부 충족 · 역수확 1건 입고 · 커밋 2~3개(양산/파일럿/플라이휠).

---

## 일정·리스크 요약

| 구간 | 기간 | 병렬 축 |
|---|---|---|
| C1→C2 | 1일 | C2의 백업·grep 스윕만 codex |
| C3 ∥ C4 준비 | 1~2일 | C3 codex 8기 병렬, C4의 lint 스펙 확정은 C3의 ROUTING.md 완성에 의존하므로 커밋은 순차 |
| C4→C5 | 2~3일 | 스크립트 구현 codex 병렬, 렌더 검증 fable 직렬 |
| C6→C7 | 4~7일 | 저작 병렬 / verify 직렬의 파이프라인 |
| **합계** | **약 8~13일** (사용자 페이스 기준, 순수 작업일) | codex 총 ~50기 |

**리스크**: ①C2 p5 게이트 해시 — research 예외 2파일은 **삭제도 이동도 금지**(경로 리터럴 박제), 배제 레시피(#4)의 checkout 복원 순서 엄수, 이동하려면 게이트 3파일 재계산 동반 ②C3 cx-1(ROUTING §0 신설)이 유일한 "새 콘텐츠 저작" — opus 검수 필수 지점 ③C5~C7 렌더 병목 — verify 직렬 큐가 임계 경로, 스폰 수를 늘려도 렌더가 상한 ④push 시 gh 토큰 workflow scope 이슈 재발 가능(ci-pending 전례) ⑤"완료" 보고는 전부 게이트 증거 동봉([[suspicion-reaudit-protocol]] 적용).

**착수 트리거**: 사용자 "고" 한마디로 C1부터 순차 실행. C1~C2는 당일 완료 가능.
