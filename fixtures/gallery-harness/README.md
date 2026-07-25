# Gallery harness

`gallery-verify`는 이 템플릿을 `tmp/`에 복사한 뒤 후보 프래그먼트로 `scenes-src/s01-free.html`을 교체한다.
하네스는 무음 mock narration과 3.5초 mock 오디오를 가진 단일 `free` 씬 프로젝트다.
검증 프리셋은 `fixtures/presets/linear.json`, `fixtures/presets/dark-hype.json`, `fixtures/presets/nebula-pop.json`이다.
로컬 컴파일은 `node bin/vf compile fixtures/gallery-harness/project --preset fixtures/presets/linear.json`으로 실행한다.
렌더는 `gallery-verify`가 수행하며 이 하네스 자체의 컴파일 검증에서는 실행하지 않는다.
