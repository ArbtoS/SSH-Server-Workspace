import * as os from "os";
import * as path from "path";

export interface SshServerWorkspacePaths {
  directory: string;
  systemStatus: string;
  notes: string;
  data: string;
}

export function getSshServerWorkspacePaths(): SshServerWorkspacePaths {
  const directory = path.join(os.homedir(), ".ssh-server-workspace");

  return {
    directory,
    systemStatus: path.join(directory, "SYSTEMSTATUS.md"),
    notes: path.join(directory, "NOTIZEN.md"),
    data: path.join(directory, "workspace-data.json")
  };
}
