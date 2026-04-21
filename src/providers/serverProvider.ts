import * as vscode from "vscode";
import { formatDisplayDate } from "../core/dateUtils";
import { SavedServer } from "../core/types";
import { ServerStorage } from "../core/serverStorage";
import { CommandItem, MessageItem } from "./commonItems";

type ServerNode = SavedServerItem | MessageItem | CommandItem;

export class SavedServerItem extends vscode.TreeItem {
  public constructor(public readonly server: SavedServer) {
    super(server.displayName || server.host, vscode.TreeItemCollapsibleState.None);
    const userPrefix = server.user ? `${server.user}@` : "";
    const portSuffix = server.port ? `:${server.port}` : "";

    this.description = `${userPrefix}${server.host}${portSuffix}`;
    this.contextValue = "savedServer";
    this.iconPath = new vscode.ThemeIcon("remote");
    this.command = {
      command: "serverWorkspace.copyHost",
      title: "Host/IP kopieren",
      arguments: [server]
    };
    this.tooltip = new vscode.MarkdownString(
      [
        `**${server.displayName || server.host}**`,
        "",
        `Host/IP: \`${server.host}\``,
        `User: ${server.user || "-"}`,
        `Port: ${server.port ?? "-"}`,
        `Zuletzt genutzt: ${formatDisplayDate(server.lastUsedAt, true)}`
      ].join("\n")
    );
  }
}

export class ServerProvider implements vscode.TreeDataProvider<ServerNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<ServerNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly storage: ServerStorage) {}

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: ServerNode): vscode.TreeItem {
    return element;
  }

  public getChildren(): ServerNode[] {
    const servers = this.storage.getAll();

    if (servers.length === 0) {
      return [
        new MessageItem("Keine Server gespeichert"),
        new CommandItem("Server speichern", {
          command: "serverWorkspace.saveCurrentServer",
          title: "Server speichern"
        })
      ];
    }

    return servers.map((server) => new SavedServerItem(server));
  }
}
