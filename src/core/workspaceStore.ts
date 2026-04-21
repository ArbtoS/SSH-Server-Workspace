import { Uri } from "vscode";
import { exists, ensureDirectory, ensureFile, readJsonFile, writeJsonFile } from "./fileSystem";
import { getServerWorkspacePaths, ServerWorkspacePaths } from "./paths";
import { notesTemplate, systemStatusTemplate } from "./templates";
import {
  createDefaultWorkspaceData,
  createEmptySystemInfo,
  WorkspaceData
} from "./types";

function normalizeWorkspaceData(raw: Partial<WorkspaceData> | undefined): WorkspaceData {
  const fallback = createDefaultWorkspaceData();
  const server = raw?.server ?? createEmptySystemInfo();

  return {
    version: "0.1",
    server: {
      ...fallback.server,
      ...server
    },
    trackedFiles: Array.isArray(raw?.trackedFiles) ? raw.trackedFiles : [],
    changeLog: Array.isArray(raw?.changeLog) ? raw.changeLog : []
  };
}

export class WorkspaceStore {
  public readonly paths: ServerWorkspacePaths = getServerWorkspacePaths();

  public async isInitialized(): Promise<boolean> {
    return (
      (await exists(this.paths.directory)) &&
      (await exists(this.paths.systemStatus)) &&
      (await exists(this.paths.notes)) &&
      (await exists(this.paths.data))
    );
  }

  public async initialize(): Promise<void> {
    await ensureDirectory(this.paths.directory);
    await ensureFile(this.paths.systemStatus, systemStatusTemplate);
    await ensureFile(this.paths.notes, notesTemplate);
    await ensureFile(this.paths.data, `${JSON.stringify(createDefaultWorkspaceData(), null, 2)}\n`);
  }

  public async load(): Promise<WorkspaceData | undefined> {
    if (!(await exists(this.paths.data))) {
      return undefined;
    }

    const raw = await readJsonFile<Partial<WorkspaceData>>(this.paths.data);
    return normalizeWorkspaceData(raw);
  }

  public async save(data: WorkspaceData): Promise<void> {
    await writeJsonFile(this.paths.data, normalizeWorkspaceData(data));
  }

  public notesUri(): Uri {
    return Uri.file(this.paths.notes);
  }

  public systemStatusUri(): Uri {
    return Uri.file(this.paths.systemStatus);
  }
}
