#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const grammarDir = path.join(repoRoot, "skills/reelforge/references/grammar");
const galleryIndexPath = path.join(repoRoot, "skills/reelforge/references/gallery/gallery-index.json");
const BAND_PATTERN = /^(0-40|40-70|70-100)$/;
const ARC_PRESETS = new Set(["ramp", "double-peak", "cliff", "steady-pulse"]);

function inputError(message) {
  throw new Error(message);
}

function readText(filePath, label) {
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    inputError(`${label}: ${error.message}`);
  }
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readText(filePath, label));
  } catch (error) {
    inputError(`${label}: invalid JSON (${error.message})`);
  }
}

function splitTableRow(line) {
  const trimmed = line.trim();
  const body = trimmed.replace(/^\|/, "").replace(/\|$/, "");
  return body.split("|").map((cell) => cell.trim());
}

function isTableSeparator(cells) {
  return cells.every((cell) => /^:?-{3,}:?$/.test(cell));
}

function parseDuration(value, sceneId) {
  const match = value.trim().match(/^(\d+(?:\.\d+)?)\s*(?:s|sec|secs|seconds|초)?$/i);
  if (!match || Number(match[1]) <= 0) {
    inputError(`STORYBOARD.md: scene=${sceneId} duration must be a positive number of seconds`);
  }
  return Number(match[1]);
}

function parseIntensity(value, sceneId) {
  if (!/^(?:0|[1-9]\d?|100)$/.test(value.trim())) {
    inputError(`STORYBOARD.md: scene=${sceneId} intensity must be an integer from 0 to 100`);
  }
  return Number(value.trim());
}

function parseRefIds(value, sceneId) {
  const refIds = value.split(",").map((item) => item.trim()).filter(Boolean);
  if (refIds.length < 1 || refIds.length > 2) {
    inputError(`STORYBOARD.md: scene=${sceneId} refId must contain one or two comma-separated IDs`);
  }
  return refIds;
}

function parseStoryboard(markdown) {
  const lines = markdown.split(/\r?\n/);
  const required = ["sceneid", "duration", "intent", "intensity", "refid"];

  for (let index = 0; index < lines.length; index += 1) {
    if (!lines[index].includes("|")) continue;
    const header = splitTableRow(lines[index]);
    const normalized = header.map((name) => name.toLowerCase().replace(/\s+/g, ""));
    if (!required.every((name) => normalized.includes(name))) continue;

    const columns = new Map(normalized.map((name, column) => [name, column]));
    const separator = splitTableRow(lines[index + 1] ?? "");
    if (separator.length !== header.length || !isTableSeparator(separator)) {
      inputError("STORYBOARD.md: storyboard header must be followed by a Markdown table separator");
    }

    const scenes = [];
    for (let rowIndex = index + 2; rowIndex < lines.length; rowIndex += 1) {
      const line = lines[rowIndex];
      if (!line.trim()) break;
      if (!line.includes("|")) break;
      const cells = splitTableRow(line);
      if (cells.length !== header.length) {
        inputError(`STORYBOARD.md: malformed table row ${rowIndex + 1}`);
      }
      const sceneId = cells[columns.get("sceneid")].trim();
      if (!sceneId) inputError(`STORYBOARD.md: row ${rowIndex + 1} has no sceneId`);
      scenes.push({
        id: sceneId,
        duration: parseDuration(cells[columns.get("duration")], sceneId),
        intent: cells[columns.get("intent")].trim(),
        intensity: parseIntensity(cells[columns.get("intensity")], sceneId),
        refIds: parseRefIds(cells[columns.get("refid")], sceneId),
        handoffAnchor: columns.has("handoffanchor") ? cells[columns.get("handoffanchor")].trim() : ""
      });
    }
    if (scenes.length === 0) inputError("STORYBOARD.md: storyboard table has no scene rows");

    const seenIds = new Set();
    for (const scene of scenes) {
      if (seenIds.has(scene.id)) inputError(`STORYBOARD.md: duplicate sceneId ${scene.id}`);
      seenIds.add(scene.id);
    }
    return scenes;
  }
  inputError("STORYBOARD.md: no table with sceneId, duration, intent, intensity, and refId columns found");
}

function parseCopy(markdown) {
  const sections = new Map();
  let current = null;
  for (const line of markdown.split(/\r?\n/)) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      current = heading[1].trim();
      if (sections.has(current)) inputError(`copy.md: duplicate ## ${current} heading`);
      sections.set(current, []);
      continue;
    }
    if (current && line.trim()) sections.get(current).push(line.trim());
  }
  return sections;
}

function copyLength(copySections, sceneId) {
  if (!copySections.has(sceneId)) {
    inputError(`copy.md: missing ## ${sceneId} section`);
  }
  return Array.from(copySections.get(sceneId).join("\n")).length;
}

function isIsoDateTime(value) {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function isVerified(entry) {
  const stamp = entry?.verified;
  return Boolean(
    stamp
    && typeof stamp.contractVersion === "string"
    && stamp.contractVersion.length > 0
    && typeof stamp.renderHash === "string"
    && /^[a-f0-9]{64}$/.test(stamp.renderHash)
    && isIsoDateTime(stamp.checkedAt)
  );
}

function loadIndex() {
  const index = readJson(galleryIndexPath, "gallery-index.json");
  if (!index || index.schemaVersion !== 1 || !Array.isArray(index.entries)) {
    inputError("gallery-index.json: expected {schemaVersion: 1, entries: []}");
  }
  return index.entries;
}

function loadGrammar() {
  const master = readText(path.join(grammarDir, "00-INDEX.md"), "grammar/00-INDEX.md");
  const grammarIds = new Set();
  const masterIdPattern = /`([a-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+)`/g;
  const idList = master.match(/## 기법 ID 전체 리스트([\s\S]*?)(?=\n## |$)/)?.[1] ?? master;
  for (const match of idList.matchAll(masterIdPattern)) grammarIds.add(match[1]);

  const intensityById = new Map();
  const domainById = new Map();
  const domainFiles = readdirSync(grammarDir)
    .filter((file) => /^0[1-8]-.*\.md$/.test(file))
    .sort();

  for (const file of domainFiles) {
    const domain = file.slice(0, 2);
    const content = readText(path.join(grammarDir, file), `grammar/${file}`);
    const headings = [...content.matchAll(/^##\s+([a-z][A-Za-z0-9]*(?:-[A-Za-z0-9]+)+)\s+—/gm)];
    for (let index = 0; index < headings.length; index += 1) {
      const id = headings[index][1];
      const start = headings[index].index + headings[index][0].length;
      const end = headings[index + 1]?.index ?? content.length;
      const section = content.slice(start, end);
      const band = section.match(/intensity:\s*(0-40|40-70|70-100)\b/);
      domainById.set(id, domain);
      if (band) intensityById.set(id, band[1]);
    }
  }
  return { grammarIds, intensityById, domainById };
}

function inBand(intensity, band) {
  if (band === "0-40") return intensity >= 0 && intensity <= 40;
  if (band === "40-70") return intensity >= 40 && intensity <= 70;
  if (band === "70-100") return intensity >= 70 && intensity <= 100;
  return false;
}

function maxSlotChars(entry) {
  if (!Array.isArray(entry.slots) || entry.slots.length === 0) return null;
  const values = entry.slots
    .map((slot) => slot?.maxChars)
    .filter((value) => Number.isInteger(value) && value >= 0);
  return values.length > 0 ? Math.max(...values) : null;
}

function loadArc(projectDir) {
  const arcPath = path.join(projectDir, "direction/arc.json");
  if (!existsSync(arcPath)) return null;
  const arc = readJson(arcPath, "direction/arc.json");
  if (!arc || !ARC_PRESETS.has(arc.preset)) {
    inputError("direction/arc.json: preset must be ramp, double-peak, cliff, or steady-pulse");
  }
  return arc;
}

function run(projectDir) {
  const scenes = parseStoryboard(readText(path.join(projectDir, "direction/STORYBOARD.md"), "direction/STORYBOARD.md"));
  const copySections = parseCopy(readText(path.join(projectDir, "direction/copy.md"), "direction/copy.md"));
  const arc = loadArc(projectDir);
  const entries = loadIndex();
  const { grammarIds, intensityById, domainById } = loadGrammar();
  const violations = [];
  const sketchScenes = [];

  function report(code, severity, sceneId, message) {
    violations.push({ code, severity, sceneId, message });
    if (severity === "warning" && code === "RF-DIR-001" && !sketchScenes.includes(sceneId)) {
      sketchScenes.push(sceneId);
    }
  }

  const resolvedScenes = scenes.map((scene) => ({
    ...scene,
    refs: scene.refIds.map((refId) => ({
      id: refId,
      indexedEntries: entries.filter((entry) => entry?.implementsGrammar === refId),
      verifiedEntries: entries.filter((entry) => entry?.implementsGrammar === refId && isVerified(entry)),
      grammarKnown: grammarIds.has(refId)
    }))
  }));

  // RF-DIR-001: resolve only through a valid verified stamp; grammar sketches remain usable but loud.
  for (const scene of resolvedScenes) {
    for (const ref of scene.refs) {
      if (ref.verifiedEntries.length > 0) continue;
      if (!ref.grammarKnown) {
        report("RF-DIR-001", "error", scene.id, `refId=${ref.id} 미등록 어휘`);
      } else {
        report("RF-DIR-001", "warning", scene.id, "sketch-authored — strip QC 강화 대상");
      }
    }
  }

  // RF-DIR-002: one stable grammar ID may appear at most twice in a video.
  const refUse = new Map();
  for (const scene of resolvedScenes) {
    for (const ref of scene.refs) {
      const use = refUse.get(ref.id) ?? { sceneIds: [] };
      use.sceneIds.push(scene.id);
      refUse.set(ref.id, use);
    }
  }
  for (const [refId, use] of refUse) {
    if (use.sceneIds.length >= 3) {
      report("RF-DIR-002", "error", use.sceneIds[2], `refId=${refId}가 ${use.sceneIds.length}회 배정됨 (상한 2회)`);
    }
  }

  // RF-DIR-003: limit distinct headline techniques, whether routed as typo/ or authored from grammar 05.
  const headlineRefs = new Map();
  for (const scene of resolvedScenes) {
    for (const ref of scene.refs) {
      const isTypo = ref.indexedEntries.some((entry) => entry.family === "typo");
      if (isTypo || domainById.get(ref.id) === "05") {
        if (!headlineRefs.has(ref.id)) headlineRefs.set(ref.id, scene.id);
      }
    }
  }
  if (headlineRefs.size >= 3) {
    const techniques = [...headlineRefs.keys()];
    report(
      "RF-DIR-003",
      "error",
      headlineRefs.get(techniques[2]),
      `typo/05-text-animator 기법 ${techniques.join(", ")} ${techniques.length}종 배정됨 (상한 2종)`
    );
  }

  // RF-DIR-004: pairs are a duration-scaled transition budget, in complete 30-second windows.
  const totalDuration = resolvedScenes.reduce((sum, scene) => sum + scene.duration, 0);
  const pairAssignments = resolvedScenes.flatMap((scene) => scene.refs
    .filter((ref) => ref.indexedEntries.some((entry) => entry.family === "pairs"))
    .map((ref) => ({ sceneId: scene.id, refId: ref.id })));
  const pairBudget = Math.ceil(totalDuration / 30) * 3;
  if (pairAssignments.length > pairBudget) {
    report(
      "RF-DIR-004",
      "error",
      pairAssignments[pairBudget].sceneId,
      `pairs 배정 ${pairAssignments.length}회가 ${totalDuration}s 예산 ${pairBudget}회를 초과함`
    );
  }

  // RF-DIR-005: stamped fragments use their index band; sketches consult the grammar source when available.
  for (const scene of resolvedScenes) {
    for (const ref of scene.refs) {
      const bands = ref.verifiedEntries.length > 0
        ? [...new Set(ref.verifiedEntries.map((entry) => entry.intensityBand).filter((band) => BAND_PATTERN.test(band)))]
        : [intensityById.get(ref.id)].filter(Boolean);
      if (bands.length > 0 && !bands.some((band) => inBand(scene.intensity, band))) {
        report(
          "RF-DIR-005",
          "error",
          scene.id,
          `refId=${ref.id} intensity=${scene.intensity}가 허용 밴드 ${bands.join("|")} 밖임`
        );
      }
    }
  }

  // RF-DIR-006: a stamped fragment must expose at least one slot large enough for the scene copy.
  for (const scene of resolvedScenes) {
    const chars = copyLength(copySections, scene.id);
    for (const ref of scene.refs) {
      if (ref.verifiedEntries.length === 0) continue;
      const limits = ref.verifiedEntries.map(maxSlotChars).filter((limit) => limit !== null);
      if (limits.length > 0 && limits.every((limit) => chars > limit)) {
        report(
          "RF-DIR-006",
          "error",
          scene.id,
          `refId=${ref.id} 카피 ${chars}자가 슬롯 상한 ${Math.max(...limits)}자를 초과함`
        );
      }
    }
  }

  // RF-DIR-007: a pair entry needs its declared counterpart in either adjacent scene.
  for (let index = 0; index < resolvedScenes.length; index += 1) {
    const scene = resolvedScenes[index];
    const neighbors = [resolvedScenes[index - 1], resolvedScenes[index + 1]].filter(Boolean);
    for (const ref of scene.refs) {
      for (const entry of ref.indexedEntries.filter((candidate) => candidate.pairWith)) {
        const counterpartPresent = neighbors.some((neighbor) => neighbor.refs.some((neighborRef) => (
          neighborRef.id === entry.pairWith
          || neighborRef.indexedEntries.some((candidate) => (
            candidate.id === entry.pairWith || candidate.implementsGrammar === entry.pairWith
          ))
        )));
        if (!counterpartPresent) {
          report(
            "RF-DIR-007",
            "error",
            scene.id,
            `refId=${ref.id}의 pairWith=${entry.pairWith}가 인접 씬에 배정되지 않음`
          );
        }
      }
    }
  }

  // RF-DIR-008: arcFit from stamped entries marks hook/peak/resolve sections when arc.json is present.
  if (arc) {
    let previousPeak = null;
    for (const scene of resolvedScenes) {
      const arcFits = new Set(scene.refs.flatMap((ref) => ref.indexedEntries.flatMap((entry) => (
        Array.isArray(entry.arcFit) ? entry.arcFit : []
      ))));
      if (arcFits.has("hook") && scene.intensity < 85) {
        report("RF-DIR-008", "error", scene.id, `hook 구간 intensity=${scene.intensity}는 85 이상이어야 함`);
      }
      if (arcFits.has("resolve") && previousPeak && scene.intensity > previousPeak.intensity) {
        report(
          "RF-DIR-008",
          "error",
          scene.id,
          `resolve intensity=${scene.intensity}가 직전 peak scene=${previousPeak.id} intensity=${previousPeak.intensity}보다 높음`
        );
      }
      if (arcFits.has("peak")) previousPeak = scene;
    }
  }

  for (const violation of violations) {
    console.error(`${violation.code} [${violation.severity}] scene=${violation.sceneId} ${violation.message}`);
  }
  const errors = violations.filter((violation) => violation.severity === "error");
  const warnings = violations.filter((violation) => violation.severity === "warning");
  if (errors.length > 0) {
    console.error(`direction-lint: FAIL with ${errors.length} errors and ${warnings.length} warnings`);
    process.exitCode = 1;
  } else if (warnings.length > 0) {
    console.log(`direction-lint: PASS with ${warnings.length} warnings (sketch-authored: ${sketchScenes.join(", ")})`);
  } else {
    console.log("direction-lint: PASS");
  }
}

const [projectDir, ...extraArgs] = process.argv.slice(2);
if (!projectDir || extraArgs.length > 0) {
  console.error("usage: node scripts/direction-lint.mjs <projectDir>");
  process.exitCode = 1;
} else {
  try {
    run(path.resolve(projectDir));
  } catch (error) {
    console.error(`direction-lint: ${error.message}`);
    process.exitCode = 1;
  }
}
