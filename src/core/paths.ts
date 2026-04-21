import * as os from "os";
import * as path from "path";

export interface ServerWorkspacePaths {
  directory: string;
  systemStatus: string;
  notes: string;
  data: string;
}

export function getServerWorkspacePaths(): ServerWorkspacePaths {
  const directory = path.join(os.homedir(), ".server-workspace");

  return {
    directory,
    systemStatus: path.join(directory, "SYSTEMSTATUS.md"),
    notes: path.join(directory, "NOTIZEN.md"),
    data: path.join(directory, "workspace-data.json")
  };
}
