import * as fs from "fs/promises";
import * as path from "path";
import { execFile } from "child_process";
import { promisify } from "util";
import { sameSecond, toLocalIsoString } from "./dateUtils";
import { TrackedFile, WorkspaceData } from "./types";

const execFileAsync = promisify(execFile);

interface FileMetadata {
  path: string;
  name: string;
  owner: string;
  group: string;
  mode: string;
  lastModifiedAt: string;
  exists: boolean;
}

function modeFromStatMode(mode: number): string {
  return (mode & 0o7777).toString(8).padStart(4, "0");
}

async function readOwnerGroupMode(filePath: string, fallbackMode: string): Promise<Pick<FileMetadata, "owner" | "group" | "mode">> {
  try {
    const result = await execFileAsync("stat", ["-c", "%U|%G|%a", filePath], {
      timeout: 5000,
      windowsHide: true
    });
    const [owner, group, mode] = String(result.stdout).trim().split("|");

    return {
      owner: owner || "",
      group: group || "",
      mode: (mode || fallbackMode).padStart(4, "0")
    };
  } catch {
    return {
      owner: "",
      group: "",
      mode: fallbackMode
    };
  }
}

export async function readFileMetadata(filePath: string): Promise<FileMetadata> {
  const resolvedPath = path.resolve(filePath);
  const name = path.basename(resolvedPath);

  try {
    const stat = await fs.stat(resolvedPath);
    const fallbackMode = modeFromStatMode(stat.mode);
    const ownerGroupMode = await readOwnerGroupMode(resolvedPath, fallbackMode);

    return {
      path: resolvedPath,
      name,
      ...ownerGroupMode,
      lastModifiedAt: toLocalIsoString(stat.mtime),
      exists: true
    };
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";
    if (code !== "ENOENT") {
      throw error;
    }

    return {
      path: resolvedPath,
      name,
      owner: "",
      group: "",
      mode: "",
      lastModifiedAt: "",
      exists: false
    };
  }
}

function findTrackedFileIndex(data: WorkspaceData, filePath: string): number {
  const resolvedPath = path.resolve(filePath);
  return data.trackedFiles.findIndex((file) => path.resolve(file.path) === resolvedPath);
}

function appendChangeLog(data: WorkspaceData, filePath: string, timestamp: string): void {
  data.changeLog.push({
    path: path.resolve(filePath),
    timestamp
  });
}

export async function updateTrackedFileMetadata(data: WorkspaceData, filePath: string): Promise<TrackedFile> {
  const metadata = await readFileMetadata(filePath);
  const index = findTrackedFileIndex(data, metadata.path);
  const existing = index >= 0 ? data.trackedFiles[index] : undefined;
  const now = toLocalIsoString();
  const wasChanged =
    !existing ||
    existing.exists !== metadata.exists ||
    (metadata.exists && !sameSecond(existing.lastModifiedAt, metadata.lastModifiedAt));

  const next: TrackedFile = {
    path: metadata.path,
    name: metadata.name,
    owner: metadata.owner || existing?.owner || "",
    group: metadata.group || existing?.group || "",
    mode: metadata.mode || existing?.mode || "",
    lastModifiedAt: metadata.lastModifiedAt || existing?.lastModifiedAt || "",
    firstSeenAt: existing?.firstSeenAt || now,
    changeCount: existing?.changeCount ?? 0,
    comment: existing?.comment ?? "",
    exists: metadata.exists
  };

  if (wasChanged) {
    next.changeCount += 1;
    appendChangeLog(data, next.path, metadata.lastModifiedAt || now);
  }

  if (index >= 0) {
    data.trackedFiles[index] = next;
  } else {
    data.trackedFiles.push(next);
  }

  return next;
}

export async function refreshTrackedFiles(data: WorkspaceData): Promise<void> {
  const paths = data.trackedFiles.map((file) => file.path);

  for (const filePath of paths) {
    await updateTrackedFileMetadata(data, filePath);
  }
}

export function setTrackedFileComment(data: WorkspaceData, filePath: string, comment: string): boolean {
  const index = findTrackedFileIndex(data, filePath);
  if (index < 0) {
    return false;
  }

  data.trackedFiles[index] = {
    ...data.trackedFiles[index],
    comment
  };

  return true;
}
