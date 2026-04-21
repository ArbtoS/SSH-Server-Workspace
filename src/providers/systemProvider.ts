import * as vscode from "vscode";
import { formatDisplayDate } from "../core/dateUtils";
import { ServerSystemInfo } from "../core/types";
import { WorkspaceStore } from "../core/workspaceStore";
import { MessageItem } from "./commonItems";

type SystemNode = InfoItem | MessageItem;

class InfoItem extends vscode.TreeItem {
  public constructor(label: string, value: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = value || "-";
    this.contextValue = "systemInfo";
    this.iconPath = new vscode.ThemeIcon("server-environment");
  }
}

function infoItems(server: ServerSystemInfo): InfoItem[] {
  return [
    new InfoItem("Hostname", server.hostname),
    new InfoItem("OS-Name", server.osName),
    new InfoItem("OS-Version", server.osVersion),
    new InfoItem("Kernel", server.kernel),
    new InfoItem("Architektur", server.architecture),
    new InfoItem("Haupt-IP", server.mainIp),
    new InfoItem("Letzter Refresh", formatDisplayDate(server.lastRefreshAt, true))
  ];
}

export class SystemProvider implements vscode.TreeDataProvider<SystemNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<SystemNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly store: WorkspaceStore) {}

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: SystemNode): vscode.TreeItem {
    return element;
  }

  public async getChildren(): Promise<SystemNode[]> {
    try {
      const data = await this.store.load();
      if (!data) {
        return [
          new MessageItem("Noch nicht initialisiert", "Aktionen > Initialisieren")
        ];
      }

      return infoItems(data.server);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [new MessageItem("Fehler beim Laden", message)];
    }
  }
}
