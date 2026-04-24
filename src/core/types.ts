export interface ServerSystemInfo {
  hostname: string;
  osName: string;
  osVersion: string;
  kernel: string;
  architecture: string;
  mainIp: string;
  lastRefreshAt: string;
}

export interface TrackedFileControlCommands {
  start?: string;
  stop?: string;
  restart?: string;
}

export interface TrackedFile {
  path: string;
  name: string;
  displayName?: string;
  sortOrder?: number;
  owner: string;
  group: string;
  mode: string;
  lastModifiedAt: string;
  firstSeenAt: string;
  changeCount: number;
  comment: string;
  controlCommands?: TrackedFileControlCommands;
  exists: boolean;
}

export interface ChangeLogEntry {
  path: string;
  timestamp: string;
}

export interface WorkspaceData {
  version: "0.1";
  server: ServerSystemInfo;
  trackedFiles: TrackedFile[];
  changeLog: ChangeLogEntry[];
}

export function createEmptySystemInfo(): ServerSystemInfo {
  return {
    hostname: "",
    osName: "",
    osVersion: "",
    kernel: "",
    architecture: "",
    mainIp: "",
    lastRefreshAt: ""
  };
}

export function createDefaultWorkspaceData(): WorkspaceData {
  return {
    version: "0.1",
    server: createEmptySystemInfo(),
    trackedFiles: [],
    changeLog: []
  };
}
