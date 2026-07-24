> 4자 토의(미니멀리스트·갤러리퍼스트·생태계·1인운영자) → 상호반박 → 의장 판정으로 도출된 최종 결정문.
> 선행 문서: 2026-07-25-cinematic-refactor-plan.md · 2026-07-25-structure-audit.md · references/grammar/(101기법)

# 결정문 — ReelForge 스킬 최종 구성 확정

## 1. 결정 요지

1. **라우팅은 단일 정본** `references/gallery/ROUTING.md` — 셀 값은 안정 어휘인 **grammar 기법 ID**, 검증 상태는 **`gallery-index.json`이 단독 소유**, 둘의 접합은 `implementsGrammar` 필드.
2. **direction-lint(RF-DIR-001)가 D5 동결 시 셀의 기법 ID를 index로 해석**한다 — 스탬프 실물이 있으면 프래그먼트로 라우팅(워커 mutate), 없으면 **"스케치 저작 · strip QC 강화" 경고를 시끄럽게 발화**하되 제작을 막지 않는다. 이 한 줄이 Q1·Q2·Q6의 모든 분기를 닫는다.
3. **grammar/는 계약 특화 번역으로 존치**(복제 아님) + 동결 + 언약 4종. 스케치는 프래그먼트의 소스 코드이므로 **축퇴·삭제 금지**.
4. **SKILL.md는 정확히 2회만 터치**(C1 트리거 1줄 + C4 전면개정 ~135줄), 이후 모든 실패는 갤러리·ROUTING·index 데이터 커밋으로만 수리.
5. **슬라이드 회귀 방지가 최상위 원칙** — 미스탬프 셀이 침묵으로 슬라이드 저작에 떨어지지 않도록, 검증 부재를 항상 게이트에서 가시화한다.

---

## 2. 쟁점별 판정

### Q1 — 라우팅 이원화 → **표 하나, 셀은 기법 ID, 해석은 lint가 index로**

**채택**: `references/gallery/ROUTING.md` 단일 권위. 구성 = §0 아크 문법(intensity 0~100·프리셋 4종·BPM 그리드) + §A~D(현 `WHEN-TO-USE.md`를 git mv 승격: 의도7×밴드3 매트릭스·무드 궁합/금지·예산·조합 10항) + §해석 규칙 2줄 + 부록(reveal12↔family↔animate-text24 3자 매핑). `gallery-index.json`이 `implementsGrammar`+`verified{}`로 검증 상태를 단독 소유. `WHEN-TO-USE.md`는 같은 커밋에 삭제.

**핵심 해석 규칙(결정문 고유 합성)**:
> 셀 값 = grammar 기법 ID(안정 어휘). `direction-lint`는 D5에서 각 refId를 `gallery-index.implementsGrammar`로 해석한다 — 스탬프 실물이 있으면 워커는 그 프래그먼트를 keep/mutate 변형, **없으면 RF-DIR-001이 "이 씬은 스케치 저작 · strip QC 강화 대상"을 경고로 출력**(차단 아님)하고 워커는 배정 기법 도메인 문서의 스케치를 변형한다.

**기각**:
- *Proposal 1 (셀을 grammar ID→refId로 교체)* — 입고마다 ROUTING.md 수작업 셀 치환 = churn + 표/index 이중 원장 드리프트(자기가 공격한 V1형). index 기계 스탬프와 마크다운 수작업 셀이 어긋난다는 Proposal 3·4의 grep-무관 논리적 반박이 타당.
- *Proposal 2 (미스탬프 refId 라우팅 절대 금지 · 스탬프만 셀 값)* — 갤러리가 차는 커밋 5~7(1~2주) 동안 D3 제작 불능. 감사 82행(refId (b)=어휘 ID 참조)·00-INDEX 8행(워커는 배정 스케치 변형)과 정면 충돌. Proposal 2가 근거로 든 문서보다 과격한 규칙.
- *Proposal 3 (WHEN-TO-USE 영구 존치 + ROUTING 해석기 = 2파일 2층)* — D3 룩업이 3파일 3홉, 예산이 §C(기법)와 ROUTING(실물)로 이원 정본화(V1형 드리프트). Proposal 3 스스로 "정본 이중화 기각"이라 했으면서 예산을 쪼갬.
- *Proposal 4 (셀=grammar ID, 스탬프 있으면 해석 / 위치 references/ 루트)* — 방향은 옳으나 **강등 침묵 결함**: 계약 버전업 후 프래그먼트가 --all 재검증 탈락 시 index만 사라지고 표는 불변 → 라우팅이 소리 없이 스케치 모드로 추락, 셀이 grammar ID인 한 영원히 "합법"이라 lint가 못 잡음(Proposal 2의 정확한 지적). **본 결정은 이 결함을 direction-lint의 index-해석으로 봉쇄** — 스탬프 부재/만료가 RF-DIR-001 경고로 가시화된다. 위치도 `references/gallery/`(index와 인접, 공진화 쌍 동일 디렉토리)로 확정(Proposal 4의 flat 위치 기각, Proposal 1·3 논거 채택).

**판정 사유**: 최상위 원칙(슬라이드 회귀 방지)은 검증 부재의 **가시성**을 요구한다. 침묵 폴백(4)도 무제한 폴백(1의 상시 셀 편집)도 아닌, "**경고는 하되 막지 않는다**"가 실물 두 진술(00-INDEX 8행 vs 13행)을 동시에 만족시키는 유일한 해다.

---

### Q2 — grammar 101기법 소유권 → **존치 · 계약 번역 · 동결 + 언약 4종**

**채택**: grammar/는 hyperframes-animation의 복제가 아니라 계약 특화 번역이다. 근거(실물): 00-INDEX 3·28행("`paused` timeline·seek-safe·코어 단일 번들·플러그인 0개·SplitText 부재 시 span 수동 분해"), 67행(외부 참조를 hyperframes ID로 명시 구분하는 규율). 벤더가 답할 수 없는 계약 위의 재구현이므로 감사의 '복제 0'과 양립.

**언약 4종(4인 수렴)**:
1. **인용 위생** — 라인넘버 인용 금지. `04-masks-mattes.md:89`의 `techniques.md(397행대)`를 ID/헤딩 인용으로 정정(C3). 00-INDEX에 규칙 1줄 명문.
2. **owner 컬럼** — 00-INDEX 기법 리스트에 `owner(local|hyperframes-animation)` + `입고상태` 컬럼.
3. **contract-delta-or-pointer** — 각 기법은 계약 델타 ≥1 또는 정본 포인터 의무, 순수 재설명 금지. **단 02-easing 446→280줄 대압축은 기각** — 실물 확인 결과 이미 포인터 규율 준수(63·165·440~442행), elastic/bounce도 계약 델타 보유("scale에만·opacity 결합 금지"). 순수 재설명 스팟 트림(~30줄)만 C3, 나머지 그루밍은 Phase 7 유예.
4. **동결** — 신규 기법 추가는 역수확 플라이휠 경유만.

**스케치 지위**: 축퇴·삭제 **금지**. 프래그먼트=검증 인스턴스 1개, 스케치=선택지 공간(선택지 표·쓸 때/피할 때·변형 카탈로그, 실물: 06-shapes 110·141행). 계약 버전업 재검증 탈락 시 재입고 원료다. 관계는 `index.implementsGrammar`가 기계 표면으로 고정. 도메인 문서 상단 배너는 **중립 문구**(Proposal 3안): "코드 스케치는 렌더 대상 아님 — 검증 실물은 gallery/, 통째 로딩 금지(배정 섹션만)".

**Phase 4 양산 소스(4인 합의)**: 플랜 63행의 'hyperframes rules 30·blueprints 15 직접 이식'을 **'grammar 스케치 경유'로 교체** — 계약 번역을 두 번 하지 않는다. grammar 미커버분(animate-text 24 등)만 hyperframes 직이식하되 산문 재집필 없이 프래그먼트+index 역참조로만(복제 0 유지).

**기각**: *Proposal 2의 '입고 백로그' 지위 강등 + '라우팅·워커 주입 금지' 배너 + 스케치 3줄 축퇴* — 00-INDEX 8행(워커는 배정 스케치 변형)과 충돌, 축퇴는 mutate 변형 여지·역수확 원료 파괴(Proposal 1·3·4 공동 반박). Proposal 2의 트리아지 컬럼·negative 픽스처·implementsGrammar 필드는 수용.

---

### Q3 — 최종 파일 트리 → **개명 0 · 이동 1(design-presets는 존치) · MDG 해체 · strip-qc.md 신설**

**4파일 처분 확정**:
- `design-direction.md`: **개명 안 함**(grep 8곳 참조·ops 동결 브리프 침범 실측 — Proposal 1·3·4 수렴, Proposal 4 개명 철회). ~125줄로 축소: §1 프리셋 선택트리·§4 읽기속도 하한·판정실패 실측표 존치 + **MDG §C 페이싱(훅 1.8s·컷 상한 12·한국어 CPS)·§A-4 duration×2.5 흡수**(D2/D4 읽기 시점 동일). §2 산문→ROUTING 포인터 1문단, §3 점수제→intensity 스칼라 대체 고지.
- `scene-authoring.md`: **유일 정본 승격**(~250줄). 프래그먼트 계약 v1.0·thin manifest·mock-audio sha256·한국어 TTS·blocks Appendix. mood→reveal→emphasis 페어링 표 **완전 삭제**·고정값(fade_in/keyword) 봉인. Contents 추가.
- `codex-runner.md`: 존치(~200줄). 배치 소유권·워커 템플릿(refId 실물/스케치 주입물로 갱신, 'approved sibling' 규정 삭제)·autopsy grep·image-runner v1 정본. Appendix 중복→1줄 포인터. Contents.
- `docs/motion-design-guide.md`: **해체·history 아카이브**. §C·§A-4→design-direction.md, **§F 금지 13종+육안 체크리스트→`references/strip-qc.md` 신설**, §A 이징→grammar/02+hyperframes 포인터, §B/§E→삭제/blueprint·grammar 05·06 포인터. 원문 `docs/history/motion-design-guide-v1.md`.

**strip-qc.md 신설 판정(로딩 시점 분리)**: §F는 Step 5 Strip QC에서 읽는 데이터이고 §C 페이싱은 D2에서 읽는다. Proposal 1의 "상주 비용 단위는 파일 수가 아니라 시점당 로딩 줄수" 원칙을 **그 원칙대로** 적용하면, QC 데이터는 QC 시점 전용 얇은 파일로 격리하는 것이 옳다(Proposal 4의 direction.md 일괄 흡수 기각, Proposal 3의 grammar/00-INDEX 이관 기각 — 둘 다 로딩 경로 오류). ~40줄, 스킬 자기완결 유지.

**`docs/design-presets.md`: docs/ 존치**(~90줄) — 참조 7~8곳(공개 README 3종 포함)·`--rf-*` 키·실측 대비표는 엔진 소유 데이터. Proposal 4의 references/ 이동 **기각**(참조 파괴 + 엔진↔스킬 역참조 결합). Mood/Grammar 서술만 포인터.

전체 트리:
```
skills/reelforge/
├─ SKILL.md                          (~135) 얇은 디렉터+추천 라우터
├─ references/
│  ├─ design-direction.md            (~125) 프리셋 선택트리·읽기속도·MDG §C/§A-4 흡수 [D2/D4]
│  ├─ scene-authoring.md             (~250) 프래그먼트 계약·manifest·mock-audio·TTS·blocks 유일 정본 [디스패치 전]
│  ├─ codex-runner.md                (~200) 배치·워커 템플릿·image-runner v1 정본 [배치·이미지 러너]
│  ├─ strip-qc.md                    (~40, 신설) §F 금지 13종+육안 체크리스트 [Step 5 QC]
│  ├─ gallery/
│  │  ├─ ROUTING.md                  (~110) §0 아크+§A~D(WHEN-TO-USE 승격)+§해석+3자 매핑 [D3 룩업]
│  │  ├─ GALLERY.md                  스트립 썸네일+arcFit (Phase 2~)
│  │  ├─ gallery-index.json          검증 상태 단독 소유 (implementsGrammar+verified{})
│  │  └─ fragments/{typo,camera,data,object,atmo,seal,pairs}/
│  └─ grammar/
│     ├─ 00-INDEX.md                 (~70) 어휘 인덱스+로딩 규율+owner/입고상태 컬럼+인용 규칙
│     └─ 01~08-*.md                  (101기법) 중립 배너·동결·부분 로딩·04-masks:89 정정·02 스팟트림
├─ scripts/  (레포 루트)
│  ├─ gallery-verify.mjs             (신설) compile→실렌더→스트립검사→renderHash 스탬프·--all
│  └─ direction-lint.mjs             (신설) RF-DIR-001~008, D5 동결 게이트
docs/
├─ design-presets.md                 (~90 존치) 실측 대비표·video-safe·--rf-* 키 [커스텀 색 요청 시]
└─ history/                          플랜·감사·grammar 원본·MDG 원문 아카이브
```
문서 총량: SKILL.md 1 + references 4문서 + gallery 3 + grammar 9 = 스킬 내 17개 + docs 1. `WHEN-TO-USE.md`만 파일 소멸.

---

### Q4 — SKILL.md 최종 목차 → **~135줄(상한 140), 본문엔 절차·게이트·포인터만**

| # | 섹션 | 줄 | 가리키는 reference · 로딩 시점 |
|---|---|---|---|
| 1 | frontmatter | 7 | description 한정("ReelForge로 영상", "faceless video" 삭제, 네거티브 스코프 1문장)·allowed-tools 4종·argument-hint [V4·V7] |
| 2 | 포지셔닝+생태계 선언 | 6 | "얇은 디렉터+추천 라우터. 어휘=grammar(계약번역)+hyperframes(정본), 검증실물=gallery. Data comes last; direction first." de-slide |
| 3 | Step 0 Brief | 8 | — |
| 4 | Step 1 Direction Freeze D1~D5 | 27 | D2 아크→`gallery/ROUTING.md §0`; D3 룩업→`ROUTING.md`; D5 direction-lint PASS 게이트(RF-DIR-001=미스탬프 셀은 sketch-authored 경고+QC강화, 차단 아님) |
| 5 | Step 2 Scene Swarm | 15 | 계약 전문→`scene-authoring.md`(디스패치 전) [V2]; 워커 주입물=자기행+앞뒤 refId·handoffAnchor+배정 프래그먼트 전문 or grammar 배정 섹션+keep/mutate |
| 6 | Step 3 Assemble | 8 | thin manifest·mock-audio→`scene-authoring.md` 포인터 [V3] |
| 7 | Step 4 Render | 6 | 배수 표현 [V8] |
| 8 | Step 5 Strip QC+역수확 | 12 | `strip-qc.md`(핸드오프 연속성·refId 대조); 역수확=미등재 안무→gallery-verify 입고 제안 |
| 9 | Studio Edit Loop | 6 | — |
| 10 | Ecosystem Contracts | 10 | `codex-runner.md §Image Runner`(Q5) |
| 11 | Hard prohibitions | 8 | 기존5 + 미스탬프=sketch-authored(무단 slide 금지)·grammar 로컬 복제 금지·동결 후 재라우팅=전 씬 재저작·실패는 갤러리·ROUTING·index 수리 |
| 12 | References(로딩 시점 명시) | 12 | 파일별 point-of-use [V5·V9] |

합계 ≈ 125줄. **grammar는 본문 등장 0** — References 2줄 + 하드 금지 1줄이 전부. 판단 데이터(계약 전문·토큰 13종·sha256·기법 표·수치 근거)는 전량 references.

---

### Q5 — 연계 계약 명문화 위치 → **SKILL.md 「Ecosystem Contracts」 단독 10줄**(References 직전)

4인이 사실상 동형으로 수렴 → 합의 확정. Proposal 3의 ④(hyperframes 정본 선언)를 고유분으로 편입.
1. **이미지 3줄** — image-prompt 컴파일(`check_prompt ok:true`만)→`prompts.jsonl`→codex-imagegen 병행 소비(resultPath 회수, finalPath 직접 쓰기 금지). 정본=`codex-runner.md §Image Runner Contract(reelforge.image-runner.v1)`, **새 계약 발명 금지**.
2. **media-use 경계 2줄** — 검색=`media-use resolve`, 프롬프트로 빚는 것=image-prompt→codex-imagegen. 완성 finalPath는 `media-use resolve --from` 원장 등록.
3. **card-shorts 위임 2줄** — 4:5 캐러셀·카드뉴스 쇼츠는 `/card-shorts` 디스패치 위임, 캐러셀 문법 로컬 복제 금지.
4. **hyperframes 정본 선언 2줄** — grammar 포인터가 가리키는 rule/blueprint/adapter는 벤더 정본, 로컬 복사 금지, 인용은 ID/헤딩만.
5. **music-to-video 1줄** — BGM 비트 그리드는 Step 1 audiomap interop 참조(중복 등재 안 함).

세부 절차는 codex-runner.md 정본 유지 — SKILL.md엔 시점과 경계만.

---

### Q6 — 실행 순서 → **SKILL.md 조기 전면개정(2회 봉인) · 다이어트/문서/SKILL 분리 커밋**

**판정 사유**: 본 결정의 Q1 해석 규칙(미스탬프 셀 = 시끄러운 경고, 차단 아님)이 **갤러리 0개인 오늘도 새 D1~D5 플로우를 안전하게 가동**시키므로, SKILL.md 전면개정을 Phase 5까지 미룰 실익이 없다.
- *Proposal 2(전면개정 커밋 8 유예)* 기각 — 갤러리 양산 1~2주 동안 V1~V3 구판 문서 상주·무정부 D3. Proposal 2의 "형식만 새것, 방어 공회전" 우려는 본 결정이 답한다: direction-lint는 공회전하지 않고 "전 씬 sketch-authored·QC강화" 경고를 발화하며(능동 방어 = 갤러리 커버리지 실시간 게이지), 씬 단위 compile+strip QC frozen-motion/de-slide는 첫날부터 작동한다(갤러리는 검증의 상각이지 유일 통로 아님).
- *Proposal 1의 C3 메가커밋* 기각 — 문서 정본화+ROUTING 신설+WHEN-TO-USE 삭제+SKILL.md 전면개정을 1커밋에 담으면 bisect 불능(Proposal 4 반박 채택). 문서(C3)와 SKILL.md(C4)를 분리한다.
- *Proposal 4의 git mv 승격* 채택 — WHEN-TO-USE.md를 재전사하지 않고 `git mv`로 gallery/ROUTING.md 승격, diff는 추가분(§0 아크·§해석)만.
- *direction-lint 시점* — 본 결정에서 lint는 라우팅 가시성의 핵심 기전이므로 **SKILL.md v7과 같은 커밋(C4)에 반드시 동봉**(Proposal 4의 "게이트 문구와 실물 동일 커밋" 채택, Proposal 1의 Phase 5 유예 기각). 빈 index에 대해 전 셀 경고를 내는 것이 정직한 초기 상태다.

**커밋 로드맵 (완료 판정 포함)**:

| 커밋 | 내용 | 완료 판정 |
|---|---|---|
| **C1** 미커밋 3건 원본 박제 | `docs/history` 플랜·감사 + grammar 10파일 무편집 입고. **V4 트리거 1줄 동승 허용**(실사용 라우팅 오발동 즉시 차단) | 3건 원형 커밋·회귀 기준 스냅샷 확보 |
| **C2** 레포 다이어트 | 240파일/24MB(renders 45·미참조 png·mock wav 45·research/·reports→fixtures+vf-selftest 경로수정·.gitignore). **수확 소스 intro-v6 s01/s05·darkhype s09 절대 유지 마킹**. filter-repo는 사용자 결정 대기 | 715→475파일, 코드 수정 최소, 테스트 그린 |
| **C3** 문서 정본화 (SKILL.md 불터치) | WHEN-TO-USE `git mv`→gallery/ROUTING.md+§0·§해석; design-direction 감량+MDG §C/§A-4 흡수; strip-qc.md 신설(§F); MDG 해체·history 아카이브; scene-authoring 페어링 삭제+Contents; codex-runner Contents+dup 포인터; grammar 언약(owner 컬럼·04-masks:89 정정·중립 배너·02 스팟트림). **삭제와 포인터는 같은 커밋** | 정본 1곳+포인터 구조 완성, 소유권 공백 0 |
| **C4** SKILL.md v7 + 게이트 | SKILL.md ~135줄 전면개정(D1~D5·Ecosystem·References·V1~V9 전량 해소) + `direction-lint.mjs`(RF-DIR-001~008)+단위테스트 8종 + `gallery-index.json` 스키마(빈, implementsGrammar) 확정. **이후 SKILL.md 봉인** | 위반 8케이스 lint PASS, 새 절차로 저작 가능(빈 갤러리=전 씬 경고), 재량 문장 0개 |
| **C5** 갤러리 Phase 0~1 | 베이스라인 스트립 보관+`gallery-verify.mjs`+harness+fragments/ 골격+negative 픽스처 3종+더미 1개 스탬프 왕복 | 더미 verify 통과·스탬프, negative 3종 정확히 반려, 미스탬프 제외 확인 |
| **C6** Phase 2 seed 6~8 | intro-v6 s01/s05·darkhype s09 일반화 입고+3프리셋 스탬프+GALLERY.md. RF-DIR-001 경고가 해당 셀에서 fragment-route로 전환됨 확인 | seed 6+ 스탬프, 커버리지 게이지 상승 실증 |
| **C7~** Phase 4 양산·Phase 6 A/B·Phase 7 플라이휠 | codex-spawn 양산(소스=grammar 스케치), A/B 파일럿 합격 기준 5종, 역수확 1건. Phase 8 엔진 트랙은 파일럿 3편 로그 전 착수 금지 | 플랜 각 Phase 완료 판정 준용 |

**SKILL.md 터치 = C1(1줄) + C4(전면개정) 총 2회로 봉인.** 이후 실패는 갤러리·ROUTING·index 데이터 커밋으로만 수리.

---

## 3. 기존 파일 처분 확정표

| 대상 | 처분 | 시점 |
|---|---|---|
| `references/design-direction.md` | 존치·감량 ~125줄(개명 안 함). §1 트리·§4 읽기속도·판정실패표+MDG §C·§A-4 흡수. §2→ROUTING 포인터·§3→intensity 대체. Contents | C3 |
| `references/scene-authoring.md` | 유일 정본 승격 ~250줄. 계약·manifest·mock-audio sha256·TTS·blocks. 페어링 표 삭제·고정값 봉인. Contents | C3 |
| `references/codex-runner.md` | 존치 ~200줄. 배치·워커 템플릿(주입물 갱신·sibling 규정 삭제)·image-runner v1. Appendix→포인터. Contents | C3 |
| `references/strip-qc.md` | **신설** ~40줄. MDG §F 금지 13종+육안 체크리스트(핸드오프·refId 대조). Step 5 전용 | C3 |
| `docs/motion-design-guide.md` | **해체**. §C·§A-4→design-direction, §F→strip-qc, §A→grammar/02+hyperframes 포인터, §B/§E→삭제/포인터. 원문 history 아카이브 | C3 |
| `docs/design-presets.md` | **docs/ 존치** ~90줄(참조 7~8곳·엔진 소유). Mood/Grammar 서술만 포인터 | C3 |
| `grammar/WHEN-TO-USE.md` | **git mv 승격**→gallery/ROUTING.md §A~D, 원위치 삭제 | C3 |
| `grammar/00-INDEX.md` | 존치. owner/입고상태 컬럼·ID/헤딩 인용 규칙·WHEN-TO-USE 참조 갱신. 3층 관계 서술 유지 | C3 |
| `grammar/01~08` 8도메인 | 존치·동결. 중립 상태 배너·부분 로딩·04-masks:89 정정·02 스팟트림. 스케치 축퇴 금지 | C3 + 상시 |
| `SKILL.md` 계약 전문·토큰 13종·sha256·pilot 스니펫·42s 실측치·범용 트리거 | 삭제/포인터/배수화/한정 (V1~V9) | C1(트리거)·C4(본문) |

---

## 4. 기각했지만 기록할 소수의견 (회귀 지점)

향후 판정이 틀렸다고 드러날 경우의 롤백 레버:

1. **[Proposal 2 — 스탬프가 곧 권위]** 파일럿·초기 5~10편에서 sketch-authored 씬이 strip QC 강화에도 슬라이드로 회귀하면(= 씬 단위 QC가 불충분하고 갤러리 상각이 실제로 회귀 방어의 부하를 짊어짐), **RF-DIR-001을 warning→error로 승격**한다. 그 순간 Proposal 2의 verified-only 체제(미스탬프=하드 차단+on-demand verify-then-route)가 활성화된다. **본 결정의 해석 규칙은 이 전환이 config 한 방으로 되도록 설계됐다.** 이것이 가장 중요한 회귀 지점.
2. **[Proposal 1 — 셀에 refId 직접]** direction-lint의 index-해석(2파일 조인)이 실구현에서 지나치게 간접적이라 유지보수가 어려우면, 셀을 refId 직접 보유로 전환하고 입고 시 셀 교체를 감수한다(loud-failure를 표 자체에 각인).
3. **[Proposal 4 — design-presets를 references/로]** 스킬을 레포에서 분리해 단독 배포하는 요구가 실제로 생기면, README 3종 참조 수정을 감수하고 references/로 이동해 완전 자기완결화.
4. **[Proposal 3 — 02-easing 대압축]** Phase 7 그루밍에서 벤더(gsap-easing-and-stagger)와의 재설명 중복이 실측으로 커지면 446→280줄 압축을 재개.
5. **[Phase 8 엔진 트랙]** 트윈 레코더·정합 린트는 파일럿 3편 로그에서 사람이 반복적으로 놓치는 결함 유형이 확인될 때만 착수(플랜 원안 준수). 조기 착수 금지.

— 의장 판정 종료. 사용자는 본 문서만으로 C1부터 착수 가능하다.