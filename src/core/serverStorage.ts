import { ExtensionContext } from "vscode";
import { SavedServer } from "./types";

const storageKey = "serverWorkspace.savedServers";

function sameServer(left: SavedServer, right: SavedServer): boolean {
  return (
    left.host.trim().toLowerCase() === right.host.trim().toLowerCase() &&
    (left.user ?? "").trim().toLowerCase() === (right.user ?? "").trim().toLowerCase() &&
    (left.port ?? 0) === (right.port ?? 0)
  );
}

export class ServerStorage {
  public constructor(private readonly context: ExtensionContext) {}

  public getAll(): SavedServer[] {
    return this.context.globalState.get<SavedServer[]>(storageKey, []);
  }

  public async save(server: SavedServer, replaceServer?: SavedServer): Promise<void> {
    const servers = this.getAll();
    const index = servers.findIndex((existing) => sameServer(existing, replaceServer ?? server));

    if (index >= 0) {
      servers[index] = server;
    } else {
      servers.push(server);
    }

    servers.sort((left, right) => Date.parse(right.lastUsedAt) - Date.parse(left.lastUsedAt));
    await this.context.globalState.update(storageKey, servers);
  }

  public async rename(server: SavedServer, displayName: string): Promise<void> {
    const servers = this.getAll();
    const index = servers.findIndex((existing) => sameServer(existing, server));
    if (index < 0) {
      return;
    }

    servers[index] = {
      ...servers[index],
      displayName
    };

    await this.context.globalState.update(storageKey, servers);
  }
}
