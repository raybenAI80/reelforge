# BGM Provenance

`assets/bgm/` holds no bundled tracks; this file is the provenance record for
every BGM asset committed anywhere in the repository.

Policy: every committed track must record title, composer, exact source URL,
license + license URL, file hash, and any processing applied. CC0 or CC-BY
only; CC-BY additionally requires the credit text.

## Demo BGM (demos/*/assets/audio/bgm.mp3)

All three tracks below were published on FreePD.com under CC0 1.0 Universal
(Public Domain Dedication). FreePD.com permanently closed in late 2025
("The Music Has Moved On", 2008–2025), so each file was retrieved from the
Internet Archive Wayback Machine capture of the official freepd.com site —
per-track, with title/composer/license verified against the archived official
track page. This is NOT the forbidden bulk `freepd` archive.org item (see
THIRD_PARTY_LICENSES.md); Wayback CDX digests for each file are identical
across 2023–2025 captures, confirming the payload never changed while the
official site was live.

License for all three: CC0 1.0 Universal — no attribution required.
License URL: <https://creativecommons.org/publicdomain/zero/1.0/>

Processing (identical pipeline for all three, ffmpeg): trimmed from the start
of the full track to the demo duration, 2-second fade-out ending at the trim
point, loudness matched to mean −27.0 dB (volumedetect), re-encoded MP3
192 kbps.

### d1-usage — "Inspiration" by Rafael Krux

- Also used by: `demos/pilot-usage-v7/assets/audio/bgm.mp3` (byte-identical copy, per its STORYBOARD "d1-usage 동일본")
- Original page: `https://freepd.com/upbeat.php` — archived: <https://web.archive.org/web/20240331123128/https://freepd.com/upbeat.php>
- File source: <https://web.archive.org/web/20240211063716id_/https://freepd.com/music/Inspiration.mp3>
- Original full track: 138.25 s, md5 `d14e64aac84a34cc317e533429fcbd32`, sha256 `a254227da398809c79a0c753073a3a92c7341672abc92bb0166b6326e126f0b4`
- Committed excerpt: 0.0–29.18 s, fade-out 27.18–29.18 s
- Committed file: md5 `1595c4d093883399f4c76d62eac9d71e`, sha256 `e95a6b236339fb4cf5c27cb1912bf85c02693876ea849280c0dbbd29ded042db`

### d2-engine — "Motions" by Rafael Krux

- Original page: `https://freepd.com/upbeat.php` — archived: <https://web.archive.org/web/20240331123128/https://freepd.com/upbeat.php>
- File source: <https://web.archive.org/web/20240211063658id_/https://freepd.com/music/Motions.mp3>
- Original full track: 116.93 s, md5 `eb162f1186aef7040b1dfc531695a3a7`, sha256 `af6380fde14f41dc4762a0a69c558bfd03a8a88c10cb5c8f578a6d0bcb4750be`
- Committed excerpt: 0.0–30.59 s, fade-out 28.59–30.59 s
- Committed file: md5 `3c6b071eae64bc142e78b053ad05cc10`, sha256 `e1488cd2aa9b6d7ee3c8d247b5a645b9e3cfc1dae4568f75109cdba769522d8b`

### d3-intro — "City Sunshine" by Kevin MacLeod

- Original page: `https://freepd.com/upbeat.php` — archived: <https://web.archive.org/web/20240331123128/https://freepd.com/upbeat.php>
- File source: <https://web.archive.org/web/20250107032552id_/https://freepd.com/music/City%20Sunshine.mp3>
- Original full track: 185.00 s, md5 `4f813c6c17191bb09eecb1173c80e367`, sha256 `e05c1bd683174cff77d492b7ac77262ff4617f99f69d82564b66831cf48352d6`
- Committed excerpt: 0.0–30.85 s, fade-out 28.85–30.85 s
- Committed file: md5 `1213bd0e3916c558dcaa76f6bc21b990`, sha256 `2bbdc8559954524e4e853744432652a32898f0ad4c1f34df43cd04d5eec0bd58`

## History

The previous bgm.mp3 files for d1/d2/d3 (md5 `9d6136ec…`, `20ba2e5d…`,
`22b4d57c…`, added in commit 8dbf4cf) were 30-second excerpts sourced from an
archive.org FreePD mirror with no track title, composer, or source URL —
below this file's own policy bar and in conflict with the
THIRD_PARTY_LICENSES.md prohibition on the archive.org `freepd` bulk item.
They were replaced by the fully attributed tracks above (2026-07-30).

Note: the rendered demo MP4s produced before 2026-07-30 still contain the old
audio; they will pick up the new tracks on the next re-render.

## TODO

- `demos/v7-showcase/assets/audio/bgm.mp3` (md5
  `adcc409906590cd7f251fa6dbca1a29d`, 22.7 s, trap-style track per its
  STORYBOARD) has no recorded provenance. Identify its source or replace it
  with a fully attributed track before it is treated as redistributable.
