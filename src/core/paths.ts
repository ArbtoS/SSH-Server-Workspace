import * as os from "os";
import * as path from "path";

export interface SshWorkspacePaths {
  directory: string;
  notes: string;
  notesDirectory: string;
  data: string;
}

export function getSshWorkspacePaths(): SshWorkspacePaths {
  const directory = path.join(os.homedir(), ".ssh-workspace");

  return {
    directory,    notes: path.join(directory, "NOTIZEN.md"),
    notesDirectory: path.join(directory, "notes"),
    data: path.join(directory, "workspace-data.json")
  };
}
