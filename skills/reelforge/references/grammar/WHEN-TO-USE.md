# WHEN-TO-USE — 그래머 결정 테이블

D3 라우팅에서 씬 하나에 `refId`를 배정할 때 쓰는 **룩업 전용** 문서다. 판정 절차는 3축이며, 산문 판단이 아니라 값 매칭이다:

1. **씬 의도 동사**를 7종 중 하나로 확정 → §A 행 선택
2. **intensity 밴드**를 3종 중 하나로 확정(아크 프리셋이 씬에 배정한 스칼라를 0-40/40-70/70-100으로 양자화) → §A 열 선택
3. 교차 셀의 후보 2~4개를 §B 무드 궁합·금지로 필터 → §C 예산으로 반복 상한 확인 → §D 조합 규칙으로 충돌 제거

셀 값이 남으면 그대로 배정. 남는 값이 0이면 밴드를 한 단계 낮춰 재룩업(피크 기법이 무드에서 전멸한 경우). ID 뒤 괄호는 도메인 번호.

---

## §A 의도 동사 × intensity 밴드 매트릭스

| 씬 의도 동사 | 0-40 (차분·저) | 40-70 (표준·중) | 70-100 (피크·고) |
|---|---|---|---|
| **선언** (히어로/타이틀/한 줄 명제) | `mask-line-slide-reveal`(05) · `tracking-kerning-tween`(05) · `blur-dissolve-in`(05) | `range-selector-stagger-map`(05) · `bg-clip-text-shape`(04) · `inset-wipe-reveal`(04) · `door-hinge-open`(01) | `netflix-title-converge`(05) · `camera-orbit-turntable`(03) · `glow-pulse-halo`(07)+`light-sweep-sheen`(07) |
| **열거** (리스트/칩/카드 그룹) | `null-parent-rig`(01) · `dual-layer-counter-move`(04) | `blinds-stripe-reveal`(04) · `mosaic-matte-collage`(04) · `axis-isolated-transform-stack`(01) | `blinds-stripe-reveal`(04)+`line-sweep-diagonal-stripes`(04) · `scale-jump-stairstep`(05) |
| **대비** (A vs B/전후) | `seesaw-fulcrum-tilt`(01) | `edge-flip-reveal`(01) · `seesaw-fulcrum-tilt`(01) · `silhouette-negative-space-match`(08) | `matte-invert-negative-space`(04) · `silhouette-negative-space-match`(08) |
| **데이터** (스탯/차트/카운터) | `divider-rule-expand`(06) · `progress-bar-linear-segmented`(06) | `progress-ring-radial`(06) · `animated-line-chart-trace`(06) · `easy-ease-linear-hold-usage`(02)+`hold-keyframe-stepped-values`(02) · `checkmark-success-tick`(06) | `anticipation-windup-chain`(02)+`vignette-impact-pulse`(07) · `glow-pulse-halo`(07) |
| **급전환** (씬 경계 컷) | `iris-portal-threshold`(08) · `light-flash-join`(08) · `match-cut-position-carry`(08) | `shape-wipe-color-block`(08) · `axis-of-action-pan-handoff`(08) · `match-cut-graphic-analogy`(08) · `object-scale-continuity`(08) | `whip-pan-directional`(08) · `speed-ramp-blur-flash`(08) · `zoom-through-portal`(08) · `dolly-zoom-vertigo`(03) |
| **여운** (홀드/리빙모션/숨) | `offset-origin-idle-breathe`(01) · `ambient-parallax-breathing`(03) · `mask-spotlight-drift`(04) · `depth-fog-atmospheric-falloff`(03) · `pendulum-decay-swing`(01) | `light-leak-film-burn`(07) · `light-sweep-sheen`(07) · `glow-pulse-halo`(07, 브리딩) | *(여운은 피크 밴드 없음 — 40-70에서 상한, 초과 배정 금지)* |
| **CTA** (행동 촉구/확정) | `underline-emphasis-sweep`(06) · `selective-emphasis-pop`(05) | `anticipation-windup-chain`(02) · `trace-then-fill`(06) · `checkmark-success-tick`(06) · `iris-circle-directional`(04) | `anticipation-windup-chain`(02)+`vignette-impact-pulse`(07) · `glow-pulse-halo`(07)+`light-sweep-sheen`(07) |

> 카운터 슬램은 데이터/CTA 70-100의 표준 조합: `anticipation-windup-chain`(윈드업)→값 카운트업(`easy-ease-linear-hold-usage`)→착지 순간 `glow-pulse-halo` 또는 `vignette-impact-pulse` 1펄스.

---

## §B 무드별 궁합·금지

배정 후보가 씬의 무드 태그와 맞는지 필터한다. **금지 열의 ID는 그 무드 씬에 배정 불가**(교차 셀에 있어도 제외).

| 무드 | 궁합 (우선 선택) | 금지 (배정 불가) |
|---|---|---|
| **차분** (프리미엄·웰니스·감성) | `mask-line-slide-reveal` · `tracking-kerning-tween` · `blur-dissolve-in` · `gradient-mask-soft-wipe` · `offset-origin-idle-breathe` · `ambient-parallax-breathing` · `depth-fog-atmospheric-falloff` · `light-leak-film-burn` · `iris-portal-threshold` | `whip-pan-*` · `speed-ramp-blur-flash` · `chromatic-aberration-glitch-cut` · `vhs-tracking-glitch` · `strobe-pulse-grid` · `flash-frame-subliminal` · `bounce-drop-physics` · `elastic-amplitude-period` · `dolly-zoom-vertigo` |
| **테크** (사이버·SaaS·시스템) | `chromatic-aberration-static` · `scanline-interlace` · `hold-keyframe-stepped-values` · `easy-ease-linear-hold-usage`(등속/스냅) · `flipboard-3d-rotateX` · `progress-ring-radial` · `line-connector-draw` · `typewriter-vs-fade-sequence`(타이프라이터) | `bounce-drop-physics` · `elastic-amplitude-period` · `light-leak-film-burn` · `scale-jump-stairstep`(playful ζ) |
| **하이프** (스포츠·트레일러·릴스) | `whip-pan-directional`/`whip-pan-cut-mask` · `speed-ramp-blur-flash`/`speed-ramp-density` · `polygon-diagonal-wipe` · `line-sweep-diagonal-stripes` · `chromatic-aberration-glitch-cut` · `strobe-pulse-grid` · `flash-frame-subliminal` · `vignette-impact-pulse` · `motion-smear-echo` · `dolly-zoom-vertigo` · `netflix-title-converge` · `scale-jump-stairstep` | `gradient-mask-soft-wipe`(너무 잔잔) · 지속 `ambient-*` idle 남용 |
| **럭셔리** (하이엔드 제품·주얼리) | `tracking-kerning-tween` · `mask-line-slide-reveal` · `bg-clip-text-shape`(쉬머) · `light-sweep-sheen` · `gradient-mask-soft-wipe` · `camera-orbit-turntable` · `glow-pulse-halo`(은은) · `weighted-deceleration-mass`(무게감) · `iris-portal-threshold` | 글리치 전체(`chromatic-aberration-glitch-cut`·`vhs-tracking-glitch`·`scanline-interlace`·`strobe-pulse-grid`·`flash-frame-subliminal`) · `bounce-drop-physics` · `elastic-amplitude-period` · `whip-pan-*` · `film-grain-seeded-flip` |

---

## §C 예산 규칙 (영상 단위 반복 상한)

| 밴드 | 영상당 반복 상한 | 비고 |
|---|---|---|
| 70-100 (피크) | **1~2회** | 남발 시 임팩트 소멸. 아래 "피크 전용" 목록은 특히 엄격 |
| 40-70 (표준) | **2~3회** | 같은 ID 3회 초과 시 유사 ID로 교체 |
| 0-40 (차분/idle) | 제한 없음 | 단 리빙모션 레이어는 **씬당 1개**만(중첩 시 transform 충돌) |

**피크 전용 — 남발 절대 금지 (영상당 1~2회, 명시 상한):**
- `dolly-zoom-vertigo`(03): **씬당 1회**, 0.6~1.0s 내 완결. 영상 전체 1~2회.
- `speed-ramp-blur-flash`(08) · `whip-pan-directional`(08): primary 전환의 **60~70%는 이보다 차분한 것**으로 채운다(급전환 전용 남발 시 인지 방해).
- `strobe-pulse-grid`(07) · `flash-frame-subliminal`(07): 버스트 3초 이내, **고빈도 반복 금지**(광과민).
- `chromatic-aberration-glitch-cut`(07) · `vhs-tracking-glitch`(07): 3초 이상 유지 금지(멀미).
- `zoom-through-portal`(08) · `netflix-title-converge`(05): 오프닝/클라이맥스 1회.
- `light-flash-join`(08): **챕터 경계에만** 예산 배정(accent 취급, 시퀀스 내 남발 시 광고처럼 가벼워짐).

**강조는 씬당 1회:** `selective-emphasis-pop`(05) · `underline-emphasis-sweep`(06)은 한 씬에 **1개 타겟만**(2개 이상이면 산만).

**전환 반복 원칙:** 한 시퀀스의 전환은 2~3종으로 수렴시키고 나머지는 그 변주로 처리(레지스트리 원칙).

---

## §D 조합 규칙 (씬 내 충돌 제거)

1. **카메라 무브는 씬당 1개.** `parallax-3plane-rule`(03) 위에 얹는 능동 카메라(`multiplane-dolly-push` · `camera-orbit-turntable` · `crane-pedestal-tilt` · `dolly-zoom-vertigo`) 중 **택1**. 둘 이상 겹치면 시점 혼란.
2. **transform 소유권 분리.** 같은 요소에 GSAP transform과 CSS keyframes(리빙모션)를 **동시에 걸지 마라.** 카메라 무브=바깥 래퍼(GSAP), 앰비언트 드리프트=안쪽 자식(CSS)으로 축을 겹치지 않게 분리(`parallax-3plane-rule` ↔ `ambient-parallax-breathing`).
3. **카메라 무브 중엔 앰비언트 끔.** 능동 오빗/돌리/크레인 진행 구간에 `ambient-parallax-breathing`(03)을 켜면 표류가 흔들림 노이즈로 읽힘 — 카메라가 쉬는 구간에만.
4. **등장 어휘 중복 금지.** 한 씬의 "열림"은 하나만: `inset-wipe-reveal`(04)와 `corner-swing-mask`(04) 병용 금지, 직전 씬이 fade 등장이면 다음 씬은 리빌 어휘를 바꿔라.
5. **stagger 어휘 충돌 금지.** 씬이 이미 `word-clip-stagger`(04)/`range-selector-stagger-map`(05)를 쓰면 `blinds-stripe-reveal`(04)를 겹치지 마라(리듬 충돌).
6. **오버슈트는 opacity에 금지.** `value-graph-overshoot-settle`·`elastic-amplitude-period`·`bounce-drop-physics`(02)의 back/elastic/bounce 이즈는 scale/x/y/rotation에만. opacity 페이드는 반드시 별도 단조 트윈으로 분리.
7. **전환은 exit/enter 앵커 페어.** 08 전환 기법은 `window.__anchors`에 정규화 좌표(0~1)를 **양쪽 프래그먼트에 손 합의**로 선언(`anchorGeometry` 공통 계약). 색 토큰은 `tl.set`으로만(트윈에 `var()` 금지).
8. **모션 벡터 승계는 상시 원칙.** `motion-vector-inheritance`(08)는 특정 셰이프가 아니라 모든 컷백 위의 체크리스트 — exit의 in계열 이즈와 enter의 out계열 이즈를 한 곡선으로 짝지어라(왼쪽으로 나갔으면 왼쪽에서 들어온다).
9. **preserve-3d 씬 안전.** 3D 중첩 씬은 perspective를 최상위 1개에만, 매 계층 preserve-3d, opacity/filter는 3D 자손을 가진 요소가 아니라 바깥 래퍼에(`preserve-3d-layer-safety` 4항).
10. **무한 루프는 CSS만.** 리빙모션(브리딩/드리프트/흐름)은 CSS keyframes `infinite alternate` + `--rf-scene-start` delay로. GSAP `repeat:-1` 금지(시크 클럭 불일치).
