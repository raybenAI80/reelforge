# d1-usage v6 baseline strip (Phase 0 · 2026-07-25)

Gallery-First 리팩토링 **이전** 파이프라인(d1-usage, 블록 기반)의 시각 기준선. 27프레임 ≈ 1fps,
파일명 `fNN-<sceneId>.png` (렌더 매니페스트의 씬 순서).

이 스트립이 곧 문제 정의다: 중앙 정렬 카피 + 패널 + 푸터 라벨 — 프레임이 슬라이드로 읽힌다.
C7 파일럿(A/B)에서 새 D1~D5+갤러리 플로우 산출물과 비교하는 "before" 증거로 쓴다.

## 캡처 방법 (렌더 파이프라인 우회)

실렌더가 아니라 **씬 페이지 직접 로드 + 블록 수동 주입 + 타임라인 seek + 스크린샷**이다
(스크립트: 세션 스크래치의 `baseline-strip-scenes.mjs`, 방법 요지: 각 `scenes/scene-sNN.html`을
정적 서버로 열고 `[data-composition-src]` 호스트에 블록 template를 주입·스크립트 재실행 후
`window.__timelines` 전체를 로컬 t로 seek). 오디오·크로스씬 트랜지션은 미반영.

## 왜 실렌더가 아닌가 — 엔진 결함 기록 (RF-KNOWN-001)

d1-usage는 이 박스(WSL2)에서 hyperframes 0.7.26 beginframe 캡처 세션 초기화가
`applyVideoMetadataHints` 직후의 media+fonts 대기에서 무한 정지, protocolTimeout(300s)로
0/880프레임 실패한다. 실측 매트릭스:

| 실험 | 결과 |
|---|---|
| gallery-harness(프리씬 1개) 렌더 | PASS (media+fonts 1.2s) |
| intro-v6(프리씬 8·오디오 9·volume 트윈 有) 렌더 | PASS (media+fonts 6~11s, 2026-07-25 재실측) |
| d1-usage workers 2/1, 오디오 10개 제거, 이미지 경로 교정 | 전부 동일 지점 HANG |

변별 변수는 **블록 서브컴포지션(`data-composition-src`)** — d1-usage만 블록 기반이다.
프리씬(free fragment) 파이프라인은 영향 없음(C6/C7 무관). 블록 기반 렌더가 다시 필요해지면
엔진 트랙(Phase 8)에서 다룬다.

부수 수정: 컴파일러가 상수(무덕킹) 볼륨 키프레임에도 no-op volume 트윈을 방출해 불필요한
composition probe(역시 같은 정지 경로)를 트리거하던 것을 `src/compiler/audio-duck.mjs`에서
차단했다(상수면 방출 0줄, data-volume 속성만 갱신).
