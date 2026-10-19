import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

const SCRIPT = path.resolve(process.cwd(), "scripts/check-production-env.mjs");
const tempDirs: string[] = [];

function makeDir(files: Record<string, string> = {}) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "osnova-env-"));
  tempDirs.push(dir);
  for (const [name, content] of Object.entries(files)) {
    fs.writeFileSync(path.join(dir, name), content, "utf8");
  }
  return dir;
}

function run(env: Record<string, string>, args: string[] = [], cwd?: string) {
  const result = spawnSync(process.execPath, [SCRIPT, ...args], {
    cwd: cwd ?? makeDir(),
    env: {
      PATH: process.env.PATH,
      NODE_ENV: process.env.NODE_ENV ?? "production",
      ...env,
    },
    encoding: "utf8",
  });
  return {
    status: result.status,
    output: `${result.stdout ?? ""}${result.stderr ?? ""}`,
  };
}

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    fs.rmSync(dir, { recursive: true, force: true });
  }
});

describe("check-production-env", () => {
  it("fails without a site URL and without a lead channel", () => {
    const result = run({});
    expect(result.status).toBe(1);
    expect(result.output).toContain("NEXT_PUBLIC_SITE_URL is not set");
    expect(result.output).toContain("No lead channel");
  });

  it("treats a whitespace-only site URL as missing", () => {
    const result = run({
      NEXT_PUBLIC_SITE_URL: "   ",
      NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain("NEXT_PUBLIC_SITE_URL is not set");
  });

  it("rejects localhost and non-HTTPS production URLs", () => {
    const local = run({
      NEXT_PUBLIC_SITE_URL: "http://localhost:3000",
      NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
    });
    expect(local.status).toBe(1);
    expect(local.output).toContain("local host");

    const http = run({
      NEXT_PUBLIC_SITE_URL: "http://osnova-lab.ru",
      NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
    });
    expect(http.status).toBe(1);
    expect(http.output).toContain("https");
  });

  it("rejects a site URL with a path", () => {
    const result = run({
      NEXT_PUBLIC_SITE_URL: "https://osnova-lab.ru/app",
      NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain("bare origin");
  });

  it("accepts osnova-lab.ru with a lead channel", () => {
    const result = run({
      NEXT_PUBLIC_SITE_URL: "https://osnova-lab.ru",
      NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
    });
    expect(result.status).toBe(0);
    expect(result.output).toContain("Production environment check passed");
  });

  it("requires a lead channel in production", () => {
    const result = run({ NEXT_PUBLIC_SITE_URL: "https://osnova-lab.ru" });
    expect(result.status).toBe(1);
    expect(result.output).toContain("No lead channel");
  });

  it("rejects an invalid public API origin", () => {
    const result = run({
      NEXT_PUBLIC_SITE_URL: "https://osnova-lab.ru",
      NEXT_PUBLIC_API_BASE_URL: "not a url",
    });
    expect(result.status).toBe(1);
    expect(result.output).toContain("NEXT_PUBLIC_API_BASE_URL");
  });

  it("prefers .env.production.local over .env.production", () => {
    const dir = makeDir({
      ".env.production.local":
        "NEXT_PUBLIC_SITE_URL=http://localhost:3000\nNEXT_PUBLIC_TUTOR_TELEGRAM=@test\n",
      ".env.production": "NEXT_PUBLIC_SITE_URL=https://osnova-lab.ru\n",
    });
    const result = run({}, [], dir);
    expect(result.status).toBe(1);
    expect(result.output).toContain("local host");
  });

  it("lets process env override env files", () => {
    const dir = makeDir({
      ".env.production":
        "NEXT_PUBLIC_SITE_URL=http://localhost:3000\nNEXT_PUBLIC_TUTOR_TELEGRAM=@test\n",
    });
    const result = run(
      {
        NEXT_PUBLIC_SITE_URL: "https://osnova-lab.ru",
        NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
      },
      [],
      dir,
    );
    expect(result.status).toBe(0);
  });

  it("allows http://localhost in --local mode", () => {
    const result = run({ NEXT_PUBLIC_SITE_URL: "http://localhost:3000" }, ["--local"]);
    expect(result.status).toBe(0);
    expect(result.output).toContain("Local environment check passed");
  });

  it("never prints secret values", () => {
    const secret = "super-secret-token-value";
    const result = run({
      NEXT_PUBLIC_SITE_URL: "https://osnova-lab.ru",
      NEXT_PUBLIC_TUTOR_TELEGRAM: "@test",
      TELEGRAM_BOT_TOKEN: secret,
    });
    expect(result.status).toBe(0);
    expect(result.output).not.toContain(secret);
  });
});
