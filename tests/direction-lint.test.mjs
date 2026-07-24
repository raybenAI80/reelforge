#!/usr/bin/env node
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { cpSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const fixtureRoot = path.join(repoRoot, "fixtures", "direction-lint");
const tempRoot = mkdtempSync(path.join(os.tmpdir(), "reelforge-direction-lint-"));
const verified = {
  contractVersion: "direction-lint-fixture-v1",
  renderHash: "a".repeat(64),
  checkedAt: "2026-07-25T00:00:00Z"
};
let sandboxNumber = 0;

function stampedEntry(overrides = {}) {
  return {
    id: "fixture-fragment",
    family: "camera",
    implementsGrammar: "anchor-corner-swing",
    intensityBand: "40-70",
    arcFit: ["build"],
    durationRange: [1, 10],
    slots: [],
    mutate: ["copy"],
    keep: ["timeline-phases"],
    verified,
    ...overrides
  };
}

function makeLintSandbox(entries) {
  const sandboxRoot = path.join(tempRoot, `repo-${sandboxNumber += 1}`);
  const scriptPath = path.join(sandboxRoot, "scripts", "direction-lint.mjs");
  const grammarPath = path.join(sandboxRoot, "skills", "reelforge", "references", "grammar");
  const galleryPath = path.join(sandboxRoot, "skills", "reelforge", "references", "gallery");

  mkdirSync(path.dirname(scriptPath), { recursive: true });
  cpSync(path.join(repoRoot, "scripts", "direction-lint.mjs"), scriptPath);
  cpSync(path.join(repoRoot, "skills", "reelforge", "references", "grammar"), grammarPath, { recursive: true });
  mkdirSync(galleryPath, { recursive: true });
  writeFileSync(
    path.join(galleryPath, "gallery-index.json"),
    `${JSON.stringify({ schemaVersion: 1, entries }, null, 2)}\n`
  );
  return scriptPath;
}

function runLint(caseName, entries = []) {
  const result = spawnSync(
    process.execPath,
    [makeLintSandbox(entries), path.join(fixtureRoot, caseName)],
    {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 4 * 1024 * 1024
    }
  );
  assert.equal(result.error, undefined, `direction-lint ${caseName} did not start: ${result.error}`);
  return result;
}

function assertError(result, code) {
  assert.equal(result.status, 1, `${code} fixture should exit 1\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stderr, new RegExp(`${code} \\[error\\]`));
  assert.match(result.stderr, /direction-lint: FAIL with/);
}

const cases = [
  {
    name: "pass-sketch",
    verify(result) {
      assert.equal(result.status, 0, result.stderr);
      assert.match(result.stderr, /RF-DIR-001 \[warning\]/);
      assert.match(result.stdout, /direction-lint: PASS with 1 warnings/);
    }
  },
  {
    name: "pass-clean",
    entries: [stampedEntry()],
    verify(result) {
      assert.equal(result.status, 0, result.stderr);
      assert.doesNotMatch(result.stderr, /\[warning\]|RF-DIR-001/);
      assert.match(result.stdout, /^direction-lint: PASS\s*$/);
    }
  },
  {
    name: "err-unknown-vocab",
    verify(result) {
      assertError(result, "RF-DIR-001");
    }
  },
  {
    name: "err-repeat",
    verify(result) {
      assertError(result, "RF-DIR-002");
    }
  },
  {
    name: "err-typo-family",
    verify(result) {
      assertError(result, "RF-DIR-003");
    }
  },
  {
    name: "err-pairs-budget",
    entries: [
      "anchor-corner-swing",
      "door-hinge-open",
      "seesaw-fulcrum-tilt",
      "orbital-revolve"
    ].map((implementsGrammar, index) => stampedEntry({
      id: `pairs-${index + 1}`,
      family: "pairs",
      implementsGrammar
    })),
    verify(result) {
      assertError(result, "RF-DIR-004");
    }
  },
  {
    name: "err-band",
    entries: [stampedEntry({
      id: "low-band-fragment",
      implementsGrammar: "null-parent-rig",
      intensityBand: "0-40"
    })],
    verify(result) {
      assertError(result, "RF-DIR-005");
    }
  },
  {
    name: "err-slot-budget",
    entries: [stampedEntry({
      id: "small-slot-fragment",
      slots: [{ name: "headline", maxChars: 5 }]
    })],
    verify(result) {
      assertError(result, "RF-DIR-006");
    }
  },
  {
    name: "err-pair-orphan",
    entries: [stampedEntry({
      id: "orphan-pair-fragment",
      family: "pairs",
      pairWith: "door-hinge-open"
    })],
    verify(result) {
      assertError(result, "RF-DIR-007");
    }
  },
  {
    name: "err-arc",
    entries: [stampedEntry({
      id: "hook-fragment",
      intensityBand: "70-100",
      arcFit: ["hook"]
    })],
    verify(result) {
      assertError(result, "RF-DIR-008");
    }
  }
];

let passed = 0;
const failures = [];

try {
  for (const testCase of cases) {
    try {
      testCase.verify(runLint(testCase.name, testCase.entries));
      passed += 1;
      console.log(`direction-lint ${testCase.name}: PASS`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      failures.push({ name: testCase.name, message });
      console.error(`direction-lint ${testCase.name}: FAIL\n${message}`);
    }
  }

  console.log(`direction-lint: ${passed}/${cases.length} cases PASS`);
  if (failures.length > 0) {
    process.exitCode = 1;
  }
} finally {
  rmSync(tempRoot, { recursive: true, force: true });
}
