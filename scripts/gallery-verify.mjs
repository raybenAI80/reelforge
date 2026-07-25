#!/usr/bin/env node
/**
 * Render-gate a ReelForge gallery fragment before it becomes routable.
 *
 * A successful run is deliberately transactional: all requested preset renders and
 * visual checks finish before gallery-index.json is changed. This keeps a failed
 * preset from accidentally creating a verified stamp.
 */

import { spawnSync } from "node:child_process";
import {
  copyFileSync,
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  readdirSync,
  renameSync,
  rmSync,
  statSync,
  writeFileSync
} from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "..");
const galleryRoot = path.join(repoRoot, "skills", "reelforge", "references", "gallery");
const galleryIndexPath = path.join(galleryRoot, "gallery-index.json");
const fragmentsRoot = path.join(galleryRoot, "fragments");
const harnessTemplate = path.join(repoRoot, "fixtures", "gallery-harness", "project");
const presetsRoot = path.join(repoRoot, "fixtures", "presets");
const defaultWorkRoot = path.join(repoRoot, "tmp", "gallery-verify");

const DEFAULT_PRESETS = ["linear", "dark-hype", "nebula-pop"];
const FAMILIES = new Set(["typo", "camera", "data", "object", "atmo", "seal", "pairs"]);
const INTENSITY_BANDS = new Set(["0-40", "40-70", "70-100"]);
const ARC_SEGMENTS = new Set(["hook", "build", "peak", "resolve"]);

// These are intentionally conservative. A gallery gate should catch an empty or
// genuinely static render without rejecting a dark skin whose first frame is a
// deliberate fade-in.
const BLANK_LUMA_LOW = 3;
const BLANK_LUMA_HIGH = 252;
const BLANK_FRAME_RATIO = 0.8;
const MIN_LUMA_RANGE = 20;
const MIN_CONTRAST_FRAME_RATIO = 0.4;
const MOTION_SAMPLE_WIDTH = 160;
const MOTION_SAMPLE_HEIGHT = 90;
const MIN_MOTION_MEAN_ABS = 0.35;
const MIN_MOTION_CHANGED_RATIO = 0.003;

class GalleryVerifyError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function fail(code, message) {
  throw new GalleryVerifyError(code, message);
}

function usage() {
  return `usage:
  node scripts/gallery-verify.mjs <fragmentFile> --id <entryId> --grammar <grammarTechniqueId> --family <family> [options]
  node scripts/gallery-verify.mjs --all [--presets linear,dark-hype,nebula-pop] [--project <tmpDir>]

required metadata for a new entry (supply with --meta or the matching options):
  intensityBand, arcFit, durationRange, slots, mutate, keep

options:
  --presets <comma-list>        preset ids (default: linear,dark-hype,nebula-pop)
  --project <tmpDir>            working-root override; projects go under <tmpDir>/<entryId>/<preset>/
  --meta <json-or-file>         JSON object merged over an existing entry
  --intensity-band <band>       0-40, 40-70, or 70-100
  --arc-fit <json-or-csv>       e.g. '["hook","peak"]' or hook,peak
  --duration-range <json-or-csv> e.g. '[3,6]' or 3,6 (seconds)
  --slots <json>                e.g. '[{"name":"headline","maxChars":18}]'
  --mutate <json-or-csv>        e.g. copy,stagger
  --keep <json-or-csv>          e.g. timeline-phases,easing
  --pair-with <entryId>
  --anchor-geometry <json>      e.g. '{"x":0.5,"y":0.5,"scale":1}'
  --help

--all reads source fragments from skills/reelforge/references/gallery/fragments/
(normally fragments/<family>/<entry id without family prefix>.html) and refreshes
verification stamps only after every indexed entry passes.`;
}

function parseArgs(args) {
  const valueOptions = new Set([
    "--id",
    "--grammar",
    "--family",
    "--presets",
    "--project",
    "--meta",
    "--intensity-band",
    "--arc-fit",
    "--duration-range",
    "--slots",
    "--mutate",
    "--keep",
    "--pair-with",
    "--anchor-geometry"
  ]);
  const values = new Map();
  const positionals = [];
  let all = false;
  let help = false;

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--help") {
      help = true;
      continue;
    }
    if (arg === "--all") {
      if (all) fail("RF-GV-001", "--all may be supplied only once");
      all = true;
      continue;
    }
    if (valueOptions.has(arg)) {
      const value = args[index + 1];
      if (!value || value.startsWith("--")) fail("RF-GV-001", `${arg} requires a value`);
      if (values.has(arg)) fail("RF-GV-001", `${arg} may be supplied only once`);
      values.set(arg, value);
      index += 1;
      continue;
    }
    if (arg.startsWith("--")) fail("RF-GV-001", `unknown option: ${arg}`);
    positionals.push(arg);
  }

  if (help) return { help: true };

  const presetNames = parsePresetList(values.get("--presets") ?? DEFAULT_PRESETS.join(","));
  const workRoot = path.resolve(values.get("--project") ?? defaultWorkRoot);
  if (all) {
    if (positionals.length > 0) fail("RF-GV-001", "--all does not accept a fragmentFile");
    for (const option of [
      "--id", "--grammar", "--family", "--meta", "--intensity-band", "--arc-fit",
      "--duration-range", "--slots", "--mutate", "--keep", "--pair-with", "--anchor-geometry"
    ]) {
      if (values.has(option)) fail("RF-GV-001", `${option} cannot be combined with --all`);
    }
    return { mode: "all", presetNames, workRoot };
  }

  if (positionals.length !== 1) {
    fail("RF-GV-001", "provide exactly one <fragmentFile>, or use --all");
  }
  for (const option of ["--id", "--grammar", "--family"]) {
    if (!values.has(option)) fail("RF-GV-001", `${option} is required for a fragment verification`);
  }

  return {
    mode: "single",
    fragmentFile: path.resolve(positionals[0]),
    id: values.get("--id"),
    grammar: values.get("--grammar"),
    family: values.get("--family"),
    presetNames,
    workRoot,
    meta: parseMetadata(values)
  };
}

function parsePresetList(value) {
  const presetNames = String(value).split(",").map((item) => item.trim()).filter(Boolean);
  if (presetNames.length === 0) fail("RF-GV-001", "--presets must name at least one preset");
  if (new Set(presetNames).size !== presetNames.length) fail("RF-GV-001", "--presets contains a duplicate preset");
  for (const preset of presetNames) {
    if (!/^[A-Za-z0-9][A-Za-z0-9._-]*$/.test(preset)) {
      fail("RF-GV-001", `invalid preset id: ${preset}`);
    }
  }
  return presetNames;
}

function readText(filePath, label, code = "RF-GV-002") {
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    fail(code, `${label}: ${error.message}`);
  }
}

function readJson(filePath, label, code = "RF-GV-002") {
  try {
    return JSON.parse(readText(filePath, label, code));
  } catch (error) {
    if (error instanceof GalleryVerifyError) throw error;
    fail(code, `${label}: invalid JSON (${error.message})`);
  }
}

function parseJsonValue(value, label) {
  const candidatePath = path.resolve(value);
  const jsonText = existsSync(candidatePath) ? readText(candidatePath, label, "RF-GV-003") : value;
  try {
    return JSON.parse(jsonText);
  } catch (error) {
    fail("RF-GV-003", `${label} must be JSON or a path to a JSON file (${error.message})`);
  }
}

function jsonOrCsv(value, label) {
  const trimmed = value.trim();
  if (trimmed.startsWith("[") || trimmed.startsWith("{")) return parseJsonValue(value, label);
  return trimmed.split(",").map((item) => item.trim()).filter(Boolean);
}

function parseMetadata(values) {
  const metaValue = values.get("--meta");
  const meta = metaValue === undefined ? {} : parseJsonValue(metaValue, "--meta");
  if (!meta || Array.isArray(meta) || typeof meta !== "object") {
    fail("RF-GV-003", "--meta must be a JSON object");
  }

  const optionMetadata = {};
  if (values.has("--intensity-band")) optionMetadata.intensityBand = values.get("--intensity-band");
  if (values.has("--arc-fit")) optionMetadata.arcFit = jsonOrCsv(values.get("--arc-fit"), "--arc-fit");
  if (values.has("--duration-range")) {
    const raw = jsonOrCsv(values.get("--duration-range"), "--duration-range");
    if (!Array.isArray(raw)) fail("RF-GV-003", "--duration-range must be a JSON array or comma-separated pair");
    optionMetadata.durationRange = raw.map((item) => Number(item));
  }
  if (values.has("--slots")) optionMetadata.slots = parseJsonValue(values.get("--slots"), "--slots");
  if (values.has("--mutate")) optionMetadata.mutate = jsonOrCsv(values.get("--mutate"), "--mutate");
  if (values.has("--keep")) optionMetadata.keep = jsonOrCsv(values.get("--keep"), "--keep");
  if (values.has("--pair-with")) optionMetadata.pairWith = values.get("--pair-with");
  if (values.has("--anchor-geometry")) {
    optionMetadata.anchorGeometry = parseJsonValue(values.get("--anchor-geometry"), "--anchor-geometry");
  }

  return { ...meta, ...optionMetadata };
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(value, keys) {
  return Object.keys(value).every((key) => keys.has(key));
}

function isFiniteNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function isIsoDateTime(value) {
  return typeof value === "string"
    && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function validateVerified(stamp, label) {
  const errors = [];
  if (!isPlainObject(stamp)) return [`${label} must be an object`];
  const allowed = new Set(["contractVersion", "renderHash", "checkedAt"]);
  if (!hasOnlyKeys(stamp, allowed)) errors.push(`${label} has an additional property`);
  for (const key of allowed) if (!(key in stamp)) errors.push(`${label}.${key} is required`);
  if (typeof stamp.contractVersion !== "string" || stamp.contractVersion.length === 0) {
    errors.push(`${label}.contractVersion must be a non-empty string`);
  }
  if (typeof stamp.renderHash !== "string" || !/^[a-f0-9]{64}$/.test(stamp.renderHash)) {
    errors.push(`${label}.renderHash must be a lowercase SHA-256 hash`);
  }
  if (!isIsoDateTime(stamp.checkedAt)) errors.push(`${label}.checkedAt must be an ISO 8601 date-time`);
  return errors;
}

function validateEntry(entry, label) {
  const errors = [];
  const required = ["id", "family", "implementsGrammar", "intensityBand", "arcFit", "durationRange", "slots", "mutate", "keep"];
  const allowed = new Set([...required, "pairWith", "anchorGeometry", "verified"]);
  if (!isPlainObject(entry)) return [`${label} must be an object`];
  if (!hasOnlyKeys(entry, allowed)) errors.push(`${label} has an additional property`);
  for (const key of required) if (!(key in entry)) errors.push(`${label}.${key} is required`);

  if (typeof entry.id !== "string" || entry.id.length === 0) errors.push(`${label}.id must be a non-empty string`);
  if (!FAMILIES.has(entry.family)) errors.push(`${label}.family must be one of ${[...FAMILIES].join(", ")}`);
  if (typeof entry.implementsGrammar !== "string" || entry.implementsGrammar.length === 0) {
    errors.push(`${label}.implementsGrammar must be a non-empty string`);
  }
  if (!INTENSITY_BANDS.has(entry.intensityBand)) errors.push(`${label}.intensityBand is invalid`);

  if (!Array.isArray(entry.arcFit) || entry.arcFit.length === 0 || new Set(entry.arcFit).size !== entry.arcFit.length
    || entry.arcFit.some((segment) => !ARC_SEGMENTS.has(segment))) {
    errors.push(`${label}.arcFit must be a non-empty, unique list of arc segments`);
  }
  if (!Array.isArray(entry.durationRange) || entry.durationRange.length !== 2
    || entry.durationRange.some((value) => !isFiniteNumber(value) || value < 0)) {
    errors.push(`${label}.durationRange must contain two non-negative numbers`);
  } else if (entry.durationRange[0] > entry.durationRange[1]) {
    errors.push(`${label}.durationRange minimum must not exceed maximum`);
  }

  if (!Array.isArray(entry.slots)) {
    errors.push(`${label}.slots must be an array`);
  } else {
    entry.slots.forEach((slot, index) => {
      const slotLabel = `${label}.slots[${index}]`;
      if (!isPlainObject(slot) || !hasOnlyKeys(slot, new Set(["name", "maxChars"]))) {
        errors.push(`${slotLabel} must contain only name and maxChars`);
        return;
      }
      if (typeof slot.name !== "string" || slot.name.length === 0) errors.push(`${slotLabel}.name must be a non-empty string`);
      if (!Number.isInteger(slot.maxChars) || slot.maxChars < 0) errors.push(`${slotLabel}.maxChars must be a non-negative integer`);
    });
  }

  for (const field of ["mutate", "keep"]) {
    if (!Array.isArray(entry[field]) || entry[field].some((value) => typeof value !== "string" || value.length === 0)) {
      errors.push(`${label}.${field} must be an array of non-empty strings`);
    }
  }
  if ("pairWith" in entry && (typeof entry.pairWith !== "string" || entry.pairWith.length === 0)) {
    errors.push(`${label}.pairWith must be a non-empty string`);
  }
  if ("anchorGeometry" in entry) {
    const geometry = entry.anchorGeometry;
    if (!isPlainObject(geometry) || !hasOnlyKeys(geometry, new Set(["x", "y", "scale"]))) {
      errors.push(`${label}.anchorGeometry must contain only x, y, and scale`);
    } else {
      for (const key of ["x", "y", "scale"]) if (!(key in geometry)) errors.push(`${label}.anchorGeometry.${key} is required`);
      if (!isFiniteNumber(geometry.x) || geometry.x < 0 || geometry.x > 1) errors.push(`${label}.anchorGeometry.x must be 0..1`);
      if (!isFiniteNumber(geometry.y) || geometry.y < 0 || geometry.y > 1) errors.push(`${label}.anchorGeometry.y must be 0..1`);
      if (!isFiniteNumber(geometry.scale) || geometry.scale < 0) errors.push(`${label}.anchorGeometry.scale must be non-negative`);
    }
  }
  if ("verified" in entry) errors.push(...validateVerified(entry.verified, `${label}.verified`));
  return errors;
}

function loadIndex() {
  const index = readJson(galleryIndexPath, "gallery-index.json", "RF-GV-004");
  const errors = [];
  if (!isPlainObject(index) || !hasOnlyKeys(index, new Set(["schemaVersion", "entries"]))) {
    errors.push("gallery-index.json must contain only schemaVersion and entries");
  }
  if (index?.schemaVersion !== 1) errors.push("gallery-index.json.schemaVersion must equal 1");
  if (!Array.isArray(index?.entries)) {
    errors.push("gallery-index.json.entries must be an array");
  } else {
    const ids = new Set();
    index.entries.forEach((entry, entryIndex) => {
      errors.push(...validateEntry(entry, `gallery-index.json.entries[${entryIndex}]`));
      if (typeof entry?.id === "string") {
        if (ids.has(entry.id)) errors.push(`gallery-index.json has duplicate id=${entry.id}`);
        ids.add(entry.id);
      }
    });
  }
  if (errors.length > 0) fail("RF-GV-004", errors.join("; "));
  return index;
}

function assertSafeEntryId(id) {
  if (typeof id !== "string" || id.length === 0 || !/^[A-Za-z0-9][A-Za-z0-9._/-]*$/.test(id)) {
    fail("RF-GV-003", `id must be a non-empty gallery path id: ${id}`);
  }
  const segments = id.split("/");
  if (segments.some((segment) => !segment || segment === "." || segment === "..")) {
    fail("RF-GV-003", `id must not contain empty, . or .. path segments: ${id}`);
  }
}

function createSingleJob(options, index) {
  assertSafeEntryId(options.id);
  if (!existsSync(options.fragmentFile) || !statSync(options.fragmentFile).isFile()) {
    fail("RF-GV-002", `fragmentFile does not exist or is not a file: ${options.fragmentFile}`);
  }
  const existing = index.entries.find((entry) => entry.id === options.id) ?? {};
  const entry = {
    ...existing,
    ...options.meta,
    id: options.id,
    family: options.family,
    implementsGrammar: options.grammar
  };
  // Stamps are verifier-owned. A stale stamp in --meta never bypasses rendering.
  delete entry.verified;
  const errors = validateEntry(entry, `entry id=${options.id}`);
  if (errors.length > 0) fail("RF-GV-003", errors.join("; "));
  return { entry, fragmentFile: options.fragmentFile };
}

function sourceFragmentForEntry(entry) {
  assertSafeEntryId(entry.id);
  const idWithoutFamily = entry.id.startsWith(`${entry.family}/`)
    ? entry.id.slice(entry.family.length + 1)
    : entry.id;
  const candidates = [
    path.join(fragmentsRoot, entry.family, `${idWithoutFamily}.html`),
    path.join(fragmentsRoot, `${entry.id}.html`),
    path.join(fragmentsRoot, entry.family, `${entry.id}.html`),
    path.join(fragmentsRoot, `${idWithoutFamily}.html`)
  ];
  const fragmentFile = candidates.find((candidate) => existsSync(candidate) && statSync(candidate).isFile());
  if (!fragmentFile) {
    fail("RF-GV-002", `id=${entry.id}: gallery source fragment not found (checked ${candidates.map((candidate) => path.relative(repoRoot, candidate)).join(", ")})`);
  }
  return fragmentFile;
}

function createAllJobs(index) {
  if (index.entries.length === 0) fail("RF-GV-001", "--all found no gallery entries");
  return index.entries.map((entry) => ({ entry: { ...entry, verified: undefined }, fragmentFile: sourceFragmentForEntry(entry) }))
    .map(({ entry, fragmentFile }) => {
      delete entry.verified;
      return { entry, fragmentFile };
    });
}

function resolvePresets(presetNames) {
  return presetNames.map((presetName) => {
    const presetPath = path.join(presetsRoot, `${presetName}.json`);
    if (!existsSync(presetPath) || !statSync(presetPath).isFile()) {
      fail("RF-GV-006", `preset=${presetName}: not found at ${path.relative(repoRoot, presetPath)}`);
    }
    return { name: presetName, presetPath };
  });
}

function inside(base, candidate) {
  const relative = path.relative(base, candidate);
  return relative === "" || (!relative.startsWith(`..${path.sep}`) && relative !== "..");
}

function workProjectDir(workRoot, entryId, presetName) {
  const directory = path.resolve(workRoot, ...entryId.split("/"), presetName);
  if (!inside(workRoot, directory)) fail("RF-GV-005", `unsafe working directory for id=${entryId}`);
  return directory;
}

function prepareProject({ workRoot, entryId, presetName, fragmentFile }) {
  if (!existsSync(harnessTemplate) || !statSync(harnessTemplate).isDirectory()) {
    fail("RF-GV-005", `gallery harness template is missing: ${path.relative(repoRoot, harnessTemplate)}`);
  }
  const projectDir = workProjectDir(workRoot, entryId, presetName);
  rmSync(projectDir, { recursive: true, force: true });
  mkdirSync(path.dirname(projectDir), { recursive: true });
  try {
    cpSync(harnessTemplate, projectDir, { recursive: true, force: true, errorOnExist: false });
    const targetFragment = path.join(projectDir, "scenes-src", "s01-free.html");
    mkdirSync(path.dirname(targetFragment), { recursive: true });
    copyFileSync(fragmentFile, targetFragment);
  } catch (error) {
    fail("RF-GV-005", `id=${entryId} preset=${presetName}: could not prepare harness (${error.message})`);
  }
  return projectDir;
}

function runCommand(command, args, { cwd = repoRoot, env, encoding = "utf8", maxBuffer = 32 * 1024 * 1024 } = {}) {
  const result = spawnSync(command, args, {
    cwd,
    env: { ...process.env, ...env },
    encoding,
    maxBuffer
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stdout = result.stdout?.toString?.().trim() ?? "";
    const stderr = result.stderr?.toString?.().trim() ?? "";
    const diagnostic = [stdout, stderr].filter(Boolean).join("\n").slice(-4000);
    throw new Error(`${command} ${args.join(" ")} exited ${result.status ?? result.signal}${diagnostic ? `: ${diagnostic}` : ""}`);
  }
  return result;
}

function compileProject(projectDir, presetPath, entryId, presetName) {
  try {
    const result = runCommand("node", [
      path.join(repoRoot, "bin", "vf"),
      "compile",
      projectDir,
      "--preset",
      presetPath,
      "--json"
    ]);
    let compileInfo;
    try {
      compileInfo = JSON.parse(result.stdout);
    } catch (error) {
      fail("RF-GV-007", `id=${entryId} preset=${presetName}: compile did not return JSON (${error.message})`);
    }
    const reportedBuildDir = compileInfo.buildDir ?? path.join(projectDir, "build");
    // vf compile runs with cwd=repoRoot and reports buildDir relative to it.
    const buildDir = path.isAbsolute(reportedBuildDir)
      ? reportedBuildDir
      : path.resolve(repoRoot, reportedBuildDir);
    if (!existsSync(buildDir) || !statSync(buildDir).isDirectory()) {
      fail("RF-GV-007", `id=${entryId} preset=${presetName}: compile returned no build directory`);
    }
    return buildDir;
  } catch (error) {
    if (error instanceof GalleryVerifyError) throw error;
    fail("RF-GV-007", `id=${entryId} preset=${presetName}: compile failed (${error.message})`);
  }
}

function renderDraft(buildDir, projectDir, entryId, presetName) {
  const draftPath = path.join(projectDir, "draft.mp4");
  try {
    // The caller invokes this synchronously in a for...of loop. Do not parallelize
    // this work: each HyperFrames worker owns a Chrome process.
    runCommand("npx", [
      "hyperframes",
      "render",
      buildDir,
      "--quality",
      "draft",
      "--output",
      draftPath,
      "--workers",
      "2",
      "--no-low-memory-mode"
    ], {
      cwd: projectDir,
      env: {
        PRODUCER_LOW_MEMORY_MODE: "false",
        PRODUCER_MAX_WORKERS: "2"
      },
      maxBuffer: 64 * 1024 * 1024
    });
  } catch (error) {
    fail("RF-GV-008", `id=${entryId} preset=${presetName}: render failed (${error.message})`);
  }
  if (!existsSync(draftPath) || !statSync(draftPath).isFile() || statSync(draftPath).size === 0) {
    fail("RF-GV-008", `id=${entryId} preset=${presetName}: renderer produced no draft.mp4`);
  }
  return draftPath;
}

function listStripFrames(stripDir) {
  return readdirSync(stripDir)
    .filter((name) => /^frame-\d+\.png$/.test(name))
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }))
    .map((name) => path.join(stripDir, name));
}

function extractStrip(draftPath, projectDir, entryId, presetName) {
  const stripDir = path.join(projectDir, "strip-1fps");
  rmSync(stripDir, { recursive: true, force: true });
  mkdirSync(stripDir, { recursive: true });
  try {
    runCommand("ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-y",
      "-i", draftPath,
      "-vf", "fps=1",
      path.join(stripDir, "frame-%04d.png")
    ]);
  } catch (error) {
    fail("RF-GV-009", `id=${entryId} preset=${presetName}: could not extract 1fps strip (${error.message})`);
  }
  const frames = listStripFrames(stripDir);
  if (frames.length < 2) {
    fail("RF-GV-009", `id=${entryId} preset=${presetName}: 1fps strip needs at least two frames`);
  }
  return frames;
}

function signalStats(draftPath, entryId, presetName) {
  let output;
  try {
    const result = runCommand("ffmpeg", [
      "-hide_banner",
      "-loglevel", "info",
      "-i", draftPath,
      "-vf", "fps=1,signalstats,metadata=print",
      "-an",
      "-f", "null",
      "-"
    ], { maxBuffer: 32 * 1024 * 1024 });
    output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;
  } catch (error) {
    fail("RF-GV-009", `id=${entryId} preset=${presetName}: ffmpeg signalstats failed (${error.message})`);
  }

  const samples = [];
  let current = null;
  for (const line of output.split(/\r?\n/)) {
    if (/\bframe:\s*\d+\b/.test(line)) {
      current = {};
      samples.push(current);
    }
    const metric = line.match(/lavfi\.signalstats\.(YAVG|YMIN|YMAX)=([0-9.]+)/);
    if (metric) {
      if (!current) {
        current = {};
        samples.push(current);
      }
      current[metric[1]] = Number(metric[2]);
    }
  }
  const complete = samples.filter((sample) => ["YAVG", "YMIN", "YMAX"].every((key) => isFiniteNumber(sample[key])));
  if (complete.length === 0) {
    fail("RF-GV-009", `id=${entryId} preset=${presetName}: ffmpeg signalstats returned no luma samples`);
  }
  return complete;
}

function rawRgb(imagePath, entryId, presetName) {
  try {
    const result = runCommand("ffmpeg", [
      "-hide_banner",
      "-loglevel", "error",
      "-i", imagePath,
      "-frames:v", "1",
      "-vf", `scale=${MOTION_SAMPLE_WIDTH}:${MOTION_SAMPLE_HEIGHT}:flags=area`,
      "-f", "rawvideo",
      "-pix_fmt", "rgb24",
      "-"
    ], { encoding: null, maxBuffer: MOTION_SAMPLE_WIDTH * MOTION_SAMPLE_HEIGHT * 3 + 4096 });
    const expectedLength = MOTION_SAMPLE_WIDTH * MOTION_SAMPLE_HEIGHT * 3;
    if (!Buffer.isBuffer(result.stdout) || result.stdout.length !== expectedLength) {
      fail("RF-GV-009", `id=${entryId} preset=${presetName}: unexpected RGB frame size`);
    }
    return result.stdout;
  } catch (error) {
    if (error instanceof GalleryVerifyError) throw error;
    fail("RF-GV-009", `id=${entryId} preset=${presetName}: could not read strip frame (${error.message})`);
  }
}

function frameDiff(left, right) {
  let total = 0;
  let changed = 0;
  const pixels = left.length / 3;
  for (let offset = 0; offset < left.length; offset += 3) {
    const diff = (
      Math.abs(left[offset] - right[offset])
      + Math.abs(left[offset + 1] - right[offset + 1])
      + Math.abs(left[offset + 2] - right[offset + 2])
    ) / 3;
    total += diff;
    if (diff >= 4) changed += 1;
  }
  return { meanAbs: total / pixels, changedRatio: changed / pixels };
}

function runVisualChecks({ draftPath, projectDir, entryId, presetName }) {
  const frames = extractStrip(draftPath, projectDir, entryId, presetName);
  const stats = signalStats(draftPath, entryId, presetName);
  const usableStats = stats.slice(0, frames.length);
  const extreme = usableStats.filter((sample) => sample.YAVG <= BLANK_LUMA_LOW || sample.YAVG >= BLANK_LUMA_HIGH);
  const nonExtreme = usableStats.filter((sample) => sample.YAVG > BLANK_LUMA_LOW && sample.YAVG < BLANK_LUMA_HIGH);
  if (nonExtreme.length === 0 || extreme.length / usableStats.length >= BLANK_FRAME_RATIO) {
    const averages = usableStats.map((sample) => sample.YAVG.toFixed(1)).join(", ");
    fail("RF-GV-010", `id=${entryId} preset=${presetName}: blank render (YAVG=${averages})`);
  }

  const contrastFrames = nonExtreme.filter((sample) => sample.YMAX - sample.YMIN >= MIN_LUMA_RANGE);
  if (contrastFrames.length / nonExtreme.length < MIN_CONTRAST_FRAME_RATIO) {
    const ranges = nonExtreme.map((sample) => (sample.YMAX - sample.YMIN).toFixed(1)).join(", ");
    fail("RF-GV-012", `id=${entryId} preset=${presetName}: low contrast (YMAX-YMIN=${ranges})`);
  }

  // Do not use the first visible frame as a motion pair: it is the entrance itself.
  // The remaining adjacent 1fps strip frames must contain at least one meaningful
  // change. This catches enter-then-freeze fragments while allowing a staged reveal.
  const appearanceIndex = Math.max(0, usableStats.findIndex((sample) => (
    sample.YAVG > BLANK_LUMA_LOW
    && sample.YAVG < BLANK_LUMA_HIGH
    && sample.YMAX - sample.YMIN >= MIN_LUMA_RANGE
  )));
  const startPair = Math.max(1, appearanceIndex + 1);
  const diffs = [];
  for (let index = startPair; index < frames.length; index += 1) {
    diffs.push(frameDiff(
      rawRgb(frames[index - 1], entryId, presetName),
      rawRgb(frames[index], entryId, presetName)
    ));
  }
  if (diffs.length === 0) {
    fail("RF-GV-011", `id=${entryId} preset=${presetName}: frozen-motion cannot be assessed after appearance`);
  }
  const hasMotion = diffs.some((diff) => (
    diff.meanAbs >= MIN_MOTION_MEAN_ABS && diff.changedRatio >= MIN_MOTION_CHANGED_RATIO
  ));
  if (!hasMotion) {
    const details = diffs.map((diff) => `${diff.meanAbs.toFixed(3)}/${diff.changedRatio.toFixed(4)}`).join(", ");
    fail("RF-GV-011", `id=${entryId} preset=${presetName}: frozen-motion (meanAbs/changedRatio=${details})`);
  }

  return {
    frameCount: frames.length,
    blankFrames: extreme.length,
    contrastFrames: contrastFrames.length,
    maxMotionMeanAbs: Math.max(...diffs.map((diff) => diff.meanAbs)),
    maxMotionChangedRatio: Math.max(...diffs.map((diff) => diff.changedRatio))
  };
}

function sha256File(filePath) {
  try {
    return createHash("sha256").update(readFileSync(filePath)).digest("hex");
  } catch (error) {
    fail("RF-GV-008", `could not hash ${filePath}: ${error.message}`);
  }
}

function combinedRenderHash(renderHashes) {
  return createHash("sha256").update(renderHashes.join(""), "utf8").digest("hex");
}

function stampEntry(entry, renderHashes) {
  return {
    ...entry,
    verified: {
      contractVersion: "1.0",
      renderHash: combinedRenderHash(renderHashes),
      checkedAt: new Date().toISOString()
    }
  };
}

function upsertEntries(index, verifiedEntries) {
  const replacements = new Map(verifiedEntries.map((entry) => [entry.id, entry]));
  const entries = index.entries.map((entry) => replacements.get(entry.id) ?? entry);
  for (const entry of verifiedEntries) {
    if (!index.entries.some((candidate) => candidate.id === entry.id)) entries.push(entry);
  }
  const nextIndex = { schemaVersion: 1, entries };
  const errors = [];
  nextIndex.entries.forEach((entry, entryIndex) => errors.push(...validateEntry(entry, `next index entries[${entryIndex}]`)));
  if (errors.length > 0) fail("RF-GV-014", `refusing to write invalid gallery index: ${errors.join("; ")}`);
  return nextIndex;
}

function atomicWriteIndex(index) {
  const parent = path.dirname(galleryIndexPath);
  const temporary = path.join(parent, `.gallery-index.${process.pid}.${Date.now()}.tmp`);
  try {
    writeFileSync(temporary, `${JSON.stringify(index, null, 2)}\n`);
    renameSync(temporary, galleryIndexPath);
  } catch (error) {
    try {
      rmSync(temporary, { force: true });
    } catch {
      // The original write error is the actionable one.
    }
    fail("RF-GV-014", `could not update gallery-index.json (${error.message})`);
  }
}

function verifyJob(job, presets, workRoot) {
  const renderHashes = [];
  for (const preset of presets) {
    console.log(`gallery-verify: id=${job.entry.id} preset=${preset.name} compile`);
    const projectDir = prepareProject({
      workRoot,
      entryId: job.entry.id,
      presetName: preset.name,
      fragmentFile: job.fragmentFile
    });
    const buildDir = compileProject(projectDir, preset.presetPath, job.entry.id, preset.name);
    console.log(`gallery-verify: id=${job.entry.id} preset=${preset.name} render`);
    const draftPath = renderDraft(buildDir, projectDir, job.entry.id, preset.name);
    const visual = runVisualChecks({ draftPath, projectDir, entryId: job.entry.id, presetName: preset.name });
    renderHashes.push(sha256File(draftPath));
    console.log(
      `gallery-verify: id=${job.entry.id} preset=${preset.name} PASS `
      + `frames=${visual.frameCount} blank=${visual.blankFrames} `
      + `motion=${visual.maxMotionMeanAbs.toFixed(3)}/${visual.maxMotionChangedRatio.toFixed(4)}`
    );
  }
  return stampEntry(job.entry, renderHashes);
}

function main() {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    console.log(usage());
    return;
  }

  const index = loadIndex();
  const jobs = options.mode === "all" ? createAllJobs(index) : [createSingleJob(options, index)];
  const presets = resolvePresets(options.presetNames);
  console.log(`gallery-verify: ${jobs.length} entr${jobs.length === 1 ? "y" : "ies"} x ${presets.length} preset(s), serial render`);

  // Do not write the index inside this loop. Any compile/render/QC error leaves
  // every prior stamp untouched, including a successful earlier --all entry.
  const verifiedEntries = [];
  for (const job of jobs) {
    verifiedEntries.push(verifyJob(job, presets, options.workRoot));
  }
  const nextIndex = upsertEntries(index, verifiedEntries);
  atomicWriteIndex(nextIndex);
  console.log(`gallery-verify: PASS; stamped ${verifiedEntries.map((entry) => entry.id).join(", ")}`);
}

try {
  main();
} catch (error) {
  const code = error instanceof GalleryVerifyError ? error.code : "RF-GV-000";
  console.error(`${code} gallery-verify: ${error.message}`);
  process.exitCode = 1;
}
