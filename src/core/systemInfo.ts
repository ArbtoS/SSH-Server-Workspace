import * as fs from "fs/promises";
import { execFile } from "child_process";
import { promisify } from "util";
import { ServerSystemInfo } from "./types";
import { toLocalIsoString } from "./dateUtils";

const execFileAsync = promisify(execFile);

async function execText(command: string, args: string[]): Promise<string> {
  const result = await execFileAsync(command, args, {
    timeout: 5000,
    windowsHide: true
  });

  return String(result.stdout).trim();
}

async function safeExec(command: string, args: string[]): Promise<string> {
  try {
    return await execText(command, args);
  } catch {
    return "";
  }
}

function parseOsRelease(content: string): Record<string, string> {
  const values: Record<string, string> = {};

  for (const line of content.split(/\r?\n/)) {
    const match = /^([A-Z0-9_]+)=(.*)$/.exec(line);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    values[key] = rawValue.replace(/^"/, "").replace(/"$/, "").replace(/\\"/g, "\"");
  }

  return values;
}

async function readOsRelease(): Promise<Record<string, string>> {
  try {
    return parseOsRelease(await fs.readFile("/etc/os-release", "utf8"));
  } catch {
    return {};
  }
}

async function readMainIp(): Promise<string> {
  const hostnameIps = await safeExec("hostname", ["-I"]);
  const firstHostnameIp = hostnameIps
    .split(/\s+/)
    .map((value) => value.trim())
    .find((value) => value && !value.startsWith("127.") && value !== "::1");

  if (firstHostnameIp) {
    return firstHostnameIp;
  }

  const routeInfo = await safeExec("ip", ["route", "get", "1.1.1.1"]);
  return /(?:^|\s)src\s+(\S+)/.exec(routeInfo)?.[1] ?? "";
}

export async function readSystemInfo(): Promise<ServerSystemInfo> {
  const [hostname, kernel, architecture, osRelease, mainIp] = await Promise.all([
    safeExec("hostname", []),
    safeExec("uname", ["-r"]),
    safeExec("uname", ["-m"]),
    readOsRelease(),
    readMainIp()
  ]);

  return {
    hostname,
    osName: osRelease.NAME ?? osRelease.PRETTY_NAME ?? "",
    osVersion: osRelease.VERSION ?? osRelease.VERSION_ID ?? "",
    kernel,
    architecture,
    mainIp,
    lastRefreshAt: toLocalIsoString()
  };
}
