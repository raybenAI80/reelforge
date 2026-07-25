# Gallery negative fixtures

이 3종은 `gallery-verify`에서 반려되어야 정상이다. 통과하면 verify 검사기가 고장난 것(역방향 회귀 픽스처)이다.

- `slide-center-fade.html` → `RF-GV-011 frozen-motion`
- `slide-static-panel.html` → `RF-GV-011 frozen-motion`
- `slide-low-contrast.html` → `RF-GV-012 low-contrast` (frozen-motion이 아니라 정확히 이 코드로 죽어야 한다)

## slide-low-contrast 설계 메모

- 저대비 그라디언트 패널이 전 구간 드리프트하므로 모션 검사(RF-GV-011)는 **통과**하고, 실행이 콘트라스트 검사까지 도달한 뒤 RF-GV-012로 죽는다.
- 색은 전부 하드코딩 + `!important`다. 프리셋이 `--rf-*` 토큰을 주입하면 `color-mix(var(...))` 기반 색은 프리셋에 따라 무효화·상속(밝은 텍스트색)으로 떨어져 대비가 생겨버리는 것을 실측으로 확인했다(2026-07-25, linear 프리셋에서 통과·스탬프까지 가는 오탐). 이 픽스처의 목적은 토큰 규율이 아니라 콘트라스트 측정이므로 하드코딩이 옳다.
- 판정 기준: 프레임 luma 범위(YMAX-YMIN) 20 미만인 프레임이 60% 초과면 실패. 현재 실측 12.0으로 여유 있게 걸린다.
