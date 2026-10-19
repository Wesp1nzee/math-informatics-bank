#!/usr/bin/env node


import fs from "node:fs";
import path from "node:path";

const ENV_FILES = [".env.production.local", ".env.local", ".env.production", ".env"];
const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "0.0.0.0", "::1"]);
const LEAD_CHANNELS = [
  "NEXT_PUBLIC_API_BASE_URL",
  "NEXT_PUBLIC_TUTOR_TELEGRAM",
  "NEXT_PUBLIC_TUTOR_EMAIL",
];
const LOCAL_MODE = process.argv.includes("--local");

function loadEnv() {
  const values = { ...process.env };

  for (const file of ENV_FILES) {
    const fullPath = path.join(process.cwd(), file);
    if (!fs.existsSync(fullPath)) continue;

    for (const rawLine of fs.readFileSync(fullPath, "utf8").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line || line.startsWith("#")) continue;

      const separator = line.indexOf("=");
      if (separator <= 0) continue;

      const key = line.slice(0, separator).trim();
      let value = line.slice(separator + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      // Process environment wins over env files; earlier files win over later ones.
      if (values[key] === undefined) values[key] = value;
    }
  }

  return values;
}

function parseUrl(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const candidate = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    return new URL(candidate);
  } catch {
    return null;
  }
}

function isBareOrigin(url) {
  return url.pathname === "/" && !url.search && !url.hash;
}

const env = loadEnv();
const errors = [];
const warnings = [];

// --- public site URL -------------------------------------------------------
const siteUrlValue = (env.NEXT_PUBLIC_SITE_URL ?? "").trim();
if (!siteUrlValue) {
  if (LOCAL_MODE) {
    warnings.push(
      "NEXT_PUBLIC_SITE_URL is not set — the local build will use http://localhost:3000.",
    );
  } else {
    errors.push("NEXT_PUBLIC_SITE_URL is not set — set the public production domain.");
  }
} else {
  const url = parseUrl(siteUrlValue);
  if (!url) {
    errors.push(
      "NEXT_PUBLIC_SITE_URL is not a valid absolute URL — expected https://<domain>.",
    );
  } else if (!LOCAL_MODE) {
    if (url.protocol !== "https:") {
      errors.push("NEXT_PUBLIC_SITE_URL must use https in production.");
    }
    if (LOCAL_HOSTS.has(url.hostname.toLowerCase())) {
      errors.push(
        `NEXT_PUBLIC_SITE_URL points to a local host (${url.hostname}) — set the public production domain.`,
      );
    }
    if (url.username || url.password) {
      errors.push("NEXT_PUBLIC_SITE_URL must not contain credentials.");
    }
    if (!isBareOrigin(url)) {
      errors.push(
        "NEXT_PUBLIC_SITE_URL must be a bare origin without path, query or fragment.",
      );
    }
  }
}

// --- API origins -----------------------------------------------------------
// The browser-facing URL must be public HTTPS in production. The server-side
// API_BASE_URL may legitimately be an internal address, so only validate that it
// is an absolute URL.
function validateApiOrigin(key, { publicOrigin }) {
  const value = (env[key] ?? "").trim();
  if (!value) return;

  const url = parseUrl(value);
  if (!url) {
    errors.push(`${key} is not a valid absolute URL — expected https://<origin>.`);
    return;
  }
  if (!publicOrigin || LOCAL_MODE) return;

  if (url.protocol !== "https:") {
    errors.push(`${key} must use https in production.`);
  }
  if (LOCAL_HOSTS.has(url.hostname.toLowerCase())) {
    errors.push(`${key} points to a local host (${url.hostname}).`);
  }
  if (url.username || url.password) {
    errors.push(`${key} must not contain credentials.`);
  }
  if (!isBareOrigin(url)) {
    errors.push(`${key} must be a bare origin without path, query or fragment.`);
  }
}

validateApiOrigin("NEXT_PUBLIC_API_BASE_URL", { publicOrigin: true });
validateApiOrigin("API_BASE_URL", { publicOrigin: false });

// --- lead channels ---------------------------------------------------------
const configuredChannels = LEAD_CHANNELS.filter(
  (key) => (env[key] ?? "").trim().length > 0,
);
if (configuredChannels.length === 0) {
  if (LOCAL_MODE) {
    warnings.push(
      "No lead channel is configured — the form will stay hidden until one is set.",
    );
  } else {
    errors.push(
      "No lead channel is configured — set at least one of: " +
        LEAD_CHANNELS.join(", ") +
        ".",
    );
  }
}

if ((env.NEXT_PUBLIC_API_BASE_URL ?? "").trim() && !(env.API_BASE_URL ?? "").trim()) {
  warnings.push(
    "API_BASE_URL is not set — server-rendered pages will fall back to demo data. " +
      "Set it for both the frontend build and runtime.",
  );
}

if (warnings.length > 0) {
  console.warn("Environment warnings:");
  for (const warning of warnings) console.warn(` - ${warning}`);
}

if (errors.length > 0) {
  console.error("Environment check failed:");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log(LOCAL_MODE ? "Local environment check passed." : "Production environment check passed.");
