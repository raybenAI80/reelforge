# ReelForge 리팩토링 최종 플랜 — Gallery-First + Direction 절차 이식 + 후행 기계 게이트

**골격: 안3(갤러리 퍼스트) / 이식: 안1의 D-파이프라인(컨셉 선행·intensity 아크·핸드오프·동결 규율) + 안2의 기계 검증(경량 direction-lint, negative 픽스처, 후행 엔진 트랙의 트윈 레코더·전환 실구현)**

## 설계 원칙 (전 Phase 공통)

1. **워커는 창작하지 않는다. 변형한다.** 씬 저작 워커의 입력은 산문 규칙이 아니라 lint·렌더·스트립 검증을 통과한 실물 프래그먼트 전문 + mutate/keep 계약이다. "적절히 판단하라"는 문장은 어느 문서에도 남기지 않는다.
2. **검증 안 된 것은 어휘가 아니다.** 갤러리 입고는 반드시 gallery-verify(compile→실렌더→스트립 자동검사→renderHash 스탬프)를 통과해야 한다. 미스탬프 엔트리는 라우팅 대상에서 자동 제외.
3. **엔진·닫힌 스키마는 Phase 1~7에서 무변경.** scene_specs 스키마·compiler.mjs·render-lint·Pilot Gate·프리셋 16종·프래그먼트 계약 v1.0 전부 보존. 기계 강제 확장(안2 이식분)은 Phase 8 별도 엔진 릴리스 트랙 — '영상 저작 중 스키마 수정 금지' 하드룰과 별개 트랙임을 커밋·docs/contracts.md에 명시.
4. **실패는 항상 데이터 쪽.** 파일럿이 실패하면 갤러리 엔트리·ROUTING 테이블을 고치고 SKILL.md는 고치지 않는다.
5. **동결 규율(안1 이식).** refId 라우팅·아크 배정은 Pilot Gate 이전에 동결. 동결 후 변경 = 전 씬 재저작임을 체크포인트에서 아크 곡선·라우팅 요약표로 시각 고지.

---

## Phase 0 — 베이스라인 고정 (반나절)

**작업**
- `demos/intro-v6/scenes-src/s01-free.html`·`s05-free.html`, `demos/showcase-darkhype/s09-free.html`이 현행 `node bin/vf compile` + render-lint를 통과하는지 재확인(1호 입고 후보의 계약 적합성 실증).
- `demos/d1-usage` 현행 렌더의 1fps 스트립을 `docs/baseline/` 아래 보관 — Phase 6 A/B 비교의 구판 기준.

**완료 판정**: 후보 3종 compile PASS 기록, 구판 스트립 보관 완료.

---## Phase 1 — 갤러리 골격 + 검증 하네스 (1~2일)

**작업**
- 디렉토리 생성: `skills/reelforge/references/gallery/{GALLERY.md, gallery-index.json, ROUTING.md, fragments/{typo,camera,data,object,atmo,seal,pairs}/}`
- `fixtures/gallery-harness/` — 1씬 최소 프로젝트(mock narration, pilot 프리패스, 프리셋 3종 스모크: 라이트/다크/고채도).
- `scripts/gallery-verify.mjs` — 후보 프래그먼트를 하네스에 마운트→`vf compile`→실렌더→스트립 자동검사(blank/frozen-motion/contrast)→`gallery-index.json`에 `{contractVersion, renderHash, checkedAt}` 스탬프. `--all` 플래그로 전 엔트리 재검증 지원.
- `gallery-index.json` 엔트리 스키마 확정: `{id, family, intensityBand(0-40|40-70|70-100), arcFit[hook|build|peak|resolve], durationRange, slots[{name,maxChars}], mutate[copy|duration±20%|stagger|mirror|accent-usage], keep[timeline-phases|easing|anchor-exit], pairWith?, anchorGeometry?{x,y,scale}, verified{...}}`
  - *(안2 이식)* `intensityBand`·`arcFit`는 처음부터 필수 필드 — Phase 3의 아크 문법과 Phase 5 린트가 이 필드를 소비한다.

**완료 판정**: 더미 프래그먼트 1개가 verify 전 과정을 통과해 index에 스탬프가 찍히고, 미스탬프 엔트리가 라우팅 후보에서 제외되는 것 확인.

---

## Phase 2 — 1차 수확: seed 6~8개 (1~2일)

**작업**
- 레포 내 검증 실물 일반화 입고: `intro-v6/s01`→`typo/scale-slam-strike`(카메라 셰이크 포함), `intro-v6/s05`→`object/hero-overshoot-strobe`, `showcase-darkhype/s09`→`data/count-up-punch`, 그 외 intro-v6 s02~s08에서 2~4개 추가 발굴.
- 일반화 규칙: 프로젝트 고유 카피→중립 샘플 카피+`data-slot="headline"`(글자수 예산 명기), 색은 `--rf-*` 토큰 유지, 헤더에 `<!-- rf-gallery v1 | id:.. | mutate:.. | keep:.. -->` 기계 판독 주석.
- 각 엔트리 3프리셋 렌더 통과 → 스탬프.

**완료 판정**: seed 6개 이상 입고·스탬프 완료, `GALLERY.md`에 스트립 썸네일+한 줄 시네마틱 의미+아크 적합 구간 기재.

---

## Phase 3 — 아크·라우팅 결정 테이블 (안1 체계3 + 안3 ROUTING 통합, 1~2일)

**작업**
- `references/gallery/ROUTING.md` 작성 — 3층 구조:
  1. **아크 문법(안1 이식)**: intensity 0~100 스칼라, 아크 프리셋 4종(ramp/double-peak/cliff/steady-pulse)의 구간별 envelope, 무드 에스컬레이션 사다리(0~40/40~70/70~100 허용 리스트 — 갤러리 `intensityBand`와 1:1), BPM 그리드 계약(씬 경계=마디 정수배, Peak=드롭 온셋).
  2. **라우팅 테이블**: 씬 의도 동사 7종(선언/열거/대비/데이터/급전환/여운/CTA) × 아크 구간 4종 → 후보 refId 2~3개 룩업. 전환 시맨틱 5종(연속/인과/대비/챕터/봉인) → `pairs/` 페어 조 매핑.
  3. **예산 규칙**: 동일 ref 영상당 ≤2회, 헤드라인 계열 family ≤2종, 특수 페어 30초당 ≤3회, peak 전용 엔트리는 intensity 70+ 씬에만.
- reveal enum 12종 ↔ 갤러리 family ↔ hyperframes-animation animate-text 24 ID의 3자 매핑 표를 부록으로 첨부(구 enum 매장 선언 겸용).

**완료 판정**: (a) "적절히 골라라" 류 문장 0개 — 축 값 판정→룩업만으로 답이 나오는 형태, (b) 기존 showcase 1편의 스토리보드를 데스크 체크로 수동 라우팅해 전 씬에 후보 refId가 도출됨.

---

## Phase 4 — 2차 양산: 16~28개 + pairs 6조 (codex-spawn 병렬, 2~4일)

**작업**
- codex-spawn으로 워커 병렬 스폰. 소스: `~/.claude/skills/hyperframes-animation`의 rules 30종·blueprints 15종·animate-text 24종을 ReelForge 프래그먼트 계약(paused 타임라인·`--rf-*` 토큰·no-random·로컬 GSAP 코어만)으로 이식. 글자 분해는 SplitText 금지이므로 span 수동 분해로 재구현.
- 목표 구색(고정 개수 아님 — **검증 통과분만 입고**): `typo/` ≥8, `camera/` ≥4(push-in-world, pull-out-reveal, whip-pan, micro-drift-hold 필수), `data/` ≥3, `object/` ≥3, `atmo/` ≥2, `seal/` ≥2, **`pairs/` ≥4조**(zoom-through-exit↔enter, push-handoff, whip-exit↔enter, anchor-inherit — exit/enter 앵커 위치·스케일을 index `anchorGeometry`에 좌표 선언).
- 탈락분은 사유(어떤 lint 코드·어떤 스트립 판정)와 함께 폐기 로그 보관 — Phase 8 엔진 트랙의 요구사항 소스가 된다.
- *(안2 이식)* `fixtures/negative/gallery/`에 '위장 슬라이드' 3종(중앙 헤드라인+fade-in만, 등장 후 동결) — gallery-verify의 frozen-motion 검사에 걸려 **탈락해야 통과**하는 역방향 회귀 픽스처.

**완료 판정**: 구색 충족 + 전 엔트리 스탬프 + negative 3종이 verify에서 정확히 반려됨 + pairs 조별 anchorGeometry 좌표 기재.

---

## Phase 5 — SKILL.md 개정 + 경량 direction-lint (안1 D-파이프라인 이식, 2일)

**작업 — Step 1 개정(순서 역전이 핵심, 안1 이식)**
새 Direction Freeze 순서: **D1 컨셉**(`direction/concept.md` 신설 — 지배 오브젝트·월드 메타포·씬별 '시각 사건'을 **카피보다 먼저** 확정) → **D2 아크**(아크 프리셋 택1 + 씬별 intensity 배정 + BPM 스냅) → **D3 스토리보드+라우팅**(STORYBOARD.md 테이블에 `intensity`·`refId`(1~2개)·`handoffAnchor` 컬럼 추가, ROUTING.md 룩업으로 결정) → **D4 카피**(`copy.md` — **배정된 refId의 슬롯 글자수 예산을 준수**해 작성. 기존 '카피 선동결' 습관의 의도적 역전임을 명문화) → **D5 동결 체크포인트**(사용자에게 아크 곡선+라우팅 배정표를 시각 요약으로 제시, "동결 후 라우팅 변경 = 전 씬 재저작" 고지) → Pilot Gate.

**작업 — Step 2 개정(워커 컨텍스트 교체)**
워커 주입물 = [자기 STORYBOARD 행 + **앞뒤 씬의 refId·handoffAnchor 2행** + **배정 갤러리 프래그먼트 전문** + frame.md + copy.md 자기 씬분 + 프래그먼트 계약 + pilot 프래그먼트]. 워커 지시문: "레퍼런스의 keep 목록(타임라인 페이즈 구조·이징·anchor-exit)은 유지, mutate 목록(카피 슬롯·duration ±20%·stagger·미러링·액센트 사용처)만 변형. **빈 캔버스 창작 금지.**" 기존 'approved sibling 1개 = 유일 스타일 참조' 규정은 삭제(갤러리 배정으로 대체).

**작업 — `scripts/direction-lint.mjs` 신설(안1 L4 + 안2 게이트를 스킬 측 경량판으로 이식, 엔진 무수정)**
Direction Freeze 산출물만 검사: RF-DIR-001 refId가 index에 존재+스탬프 유효, 002 동일 ref 3회+ 사용, 003 헤드라인 family 3종+, 004 특수 페어 예산 초과, 005 intensity 밴드 밖 엔트리 배정(예: intensity 30 씬에 70+ 전용 슬램), 006 copy.md 글자수가 슬롯 예산 초과, 007 pairs 배정인데 인접 씬에 상대편 미배정, 008 아크 envelope 위반(hook<85, resolve 비하강). SKILL.md에 "D5 동결 전 direction-lint PASS 필수" 게이트로 명시.

**작업 — 유령 표면 봉인(3안 공통 합의사항)**
- `scene-authoring.md`: mood→reveal→emphasis 페어링 표 **삭제**, free 씬 reveal/emphasis는 고정값(fade_in/keyword) 기입으로 봉인("디렉션 운반체로 사용 금지" 명문화).
- `design-direction.md`: §1 프리셋 선택 트리·카피 원칙·block Appendix 존치, §2 자유씬 모션 산문→갤러리 포인터 한 문단으로 축소, §3 강도 5항목 점수제→intensity 스칼라(ROUTING.md)로 대체 고지, §4 '모션=카피 잔여물' 공식→읽기속도 하한(0.5s+글자수/12)만 유지.
- `docs/motion-design-guide.md`: §A 이징·§D 색·§F 금지 13종은 갤러리 하위 계층으로 존치, §E T1~T8→"갤러리 typo/ 계열 이론 부록" 강등, §B R1~R5→레거시 8블록 전용 부록 이동(free 씬 참조 금지). 삭제·이동분마다 `→ gallery/ROUTING.md 참조` 포인터를 **같은 커밋에** 삽입(안2의 소유권 공백 경고 반영).
- de-slide 금지문 옆에 긍정 체크리스트 추가(안1 이식): "이 씬의 시각 사건은 무엇인가 / 지배 오브젝트가 viewport 30%+인가 / 등장 후 동결 구간이 없는가".
- Step 5 Strip QC에 육안 항목 2종 추가: 핸드오프 연속성, 배정 refId 대비 실구현 대조.

**완료 판정**: direction-lint가 의도적 위반 케이스 8종(각 코드당 1개)을 전부 잡는 단위 테스트 PASS + SKILL.md D1~D5 절차에 '적절히' 류 재량 문장 0개.

---

## Phase 6 — A/B 파일럿 재제작 (판정 게이트, 2~3일)

**작업**: `demos/d1-usage`(또는 showcase/stat-briefing) 1편을 새 플로우(D1 컨셉→아크→라우팅→카피→direction-lint→pilot→갤러리 변형 스웜→Strip QC)로 **처음부터 재제작**, Phase 0 구판 스트립과 1fps 나란히 비교.

**합격 기준(전부 충족해야 스킬 '완성' 선언)**
1. 씬별 '등장 후 정지' 구간 소멸(전 씬 후반 40%에 모션 존재).
2. 페어 전환 최소 2회가 스트립에서 연속으로 읽힘.
3. 헤드라인 계열 family ≤2종 반복(디자인 시스템적 일관성).
4. intensity 곡선이 스트립에서 육안 식별됨(hook 최강→build 계단→peak→resolve 하강).
5. 구판의 '동일 진입 트윈 9씬 반복' 소멸.

**실패 시**: 갤러리 엔트리·ROUTING 테이블 수정 후 재시도(SKILL.md 불변 원칙). 2회 실패한 엔트리는 갤러리에서 강등.

---

## Phase 7 — 플라이휠 + 운영 계약 (반나절, 이후 상시)

**작업**
- SKILL.md Step 5에 역수확 절차: QC 통과작 중 갤러리에 없는 안무 발견 시 gallery-verify를 거쳐 신규 입고 제안(사용자 승인 후). 초기 5~10편의 유사도 수렴은 이 플라이휠이 해소함을 사용자에게 예고.
- ops 체크리스트: ① 프래그먼트 계약 버전 상승 시 `gallery-verify --all` 전 갤러리 재검증 의무(스탬프 만료 처리), ② narration 재생성으로 씬 길이 변경 시 pairs 배정 씬 재검수(안1의 E2 함정 반영), ③ 씬 단위 재라우팅 요청 시 비용(해당 씬+인접 pairs 재저작) 고지.

**완료 판정**: 체크리스트가 SKILL.md ops 절에 반영되고, 역수확 1건 실제 수행(파일럿에서 나온 신작 안무 1개 입고).

---

## Phase 8 — (선택·별도 엔진 릴리스 트랙) 기계 강제 증설 — 안2 이식

Phase 1~7 완결에 불필요. 착수 조건: 파일럿 3편+ 운영 후 Strip QC에서 사람이 반복적으로 놓치는 결함 유형이 로그로 확인될 때. 우선순위 순:

1. **트윈 레코더**(안2 Step 3): render-lint의 `createChainableTimeline()` 스텁을 to/fromTo/from 호출 기록기로 승격 → `measuredChoreography` 첨부. 기존 RF-FRAGMENT-001..015는 회귀 테스트로 동작 고정.
2. **정합 린트**(안2 Step 4): 측정치 × STORYBOARD 선언(refId·intensity) × 프래그먼트 `data-rf-*` 마커 3자 대조 — enter-then-freeze(하드), 카메라 선언 대비 world transform 부재(하드), intensity 등급 검사(**영구 warning** — 안2의 '창작 압살 방지 비대칭' 설계 채택). 전 규칙 warning 롤아웃→오탐 실측 후 선별 승격.
3. **전환 실구현**(안2 Step 5): transitions.mjs에 whip-pan·mask-wipe·zoom-through·light-flash 등록(P2-01 훅), pairs `anchorGeometry` 컴파일 타임 대조로 anchor-inherit의 기계 린트화. 침묵 crossfade 강등은 **삭제하지 않고** 1단계 warning(RF-TRANSITION-W01)→showcase 전량 마이그레이션 검증 후 error 승격(안2의 파괴적 변경 리스크 완화).
4. **강도곡선 QC**(안2 Step 6): craft-contact-sheet에 씬별 motionEnergy 산출 → STORYBOARD intensity와 단조성 대조. 골든 2종+showcase 5종 캘리브레이션 전 활성화 금지, 콘텐츠 영역 크롭 측정으로 그레인 노이즈 보정.
5. 죽은 표면 정리: `blocks/*/block.html` 8종의 emphasis 선언부 삭제, scene_specs 스키마의 reveal/emphasis optional 격하 — 전부 이 트랙에서만, 커밋 메시지에 "엔진 릴리스 트랙, 영상 저작 아님" 명시.

**완료 판정**: 각 항목 독립 — warning 기간 오탐률 로그 기반으로 error 승격 여부를 사용자가 결정.

---

## 버릴 것 총정리

| 대상 | 처분 | 시점 |
|---|---|---|
| scene-authoring.md mood→reveal→emphasis 페어링 표 | **완전 삭제** (프레젠테이션 이펙트 선택기 사고의 근원) | Phase 5 |
| 워커 컨텍스트 'approved sibling 1개=유일 참조' 규정 | 삭제 → 갤러리 배정으로 대체 | Phase 5 |
| free 씬 reveal/emphasis의 의미 | 고정값 봉인, 확장 투자 금지(죽은 표면) | Phase 5 |
| design-direction.md §2 산문 모션 문법·§3 점수제·§4 잔여물 공식 | 갤러리/ROUTING 포인터로 축소·대체(읽기속도 하한만 존치) | Phase 5 |
| MDG §E T1~T8 / §B R1~R5 | 이론 부록·레거시 블록 부록 강등(포인터 동일 커밋) | Phase 5 |
| blocks/*의 죽은 emphasis 선언부, blockRevealTween 단일 트윈 붕괴 | Phase 8 전까지 현상 동결(수리 금지 — 죽은 표면 투자 금지) | Phase 8 |
| transitions.mjs 침묵 crossfade 강등 | Phase 8에서 warning→error 2단 (즉시 삭제 금지) | Phase 8 |

## 잔여 리스크 (수용하고 감시)

- **갤러리 수렴**: 초기 5~10편 유사도 높음 — mutate 계약+프리셋 스킨+ref 예산+Phase 7 플라이휠로 완화, 사용자 사전 고지.
- **페어 전환 소프트 계약**: Phase 8 전까지 anchorGeometry는 선언+육안 QC로만 방어.
- **워커 과소 변형**: 레퍼런스 거의 복사도 계약상 합법 — Strip QC 뷰어 패스와 갤러리 확장으로만 완화되는 구조적 잔여 리스크.
- **슬롯-카피 충돌**: D3(라우팅)→D4(카피) 순서 역전이 이를 막는 핵심 장치이므로, 기존 '카피 선동결' 습관으로 회귀하지 않도록 SKILL.md에 역전 사유를 명기.