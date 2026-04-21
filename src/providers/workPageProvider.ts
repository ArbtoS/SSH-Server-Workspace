import * as vscode from "vscode";
import { compareIsoDesc, formatDisplayDate } from "../core/dateUtils";
import { ChangeLogEntry, TrackedFile } from "../core/types";
import { WorkspaceStore } from "../core/workspaceStore";
import { CommandItem, MessageItem } from "./commonItems";

type WorkNode = WorkSectionItem | TrackedFileItem | DetailItem | LogEntryItem | MessageItem | CommandItem;

class WorkSectionItem extends vscode.TreeItem {
  public constructor(public readonly section: "files" | "log", label: string) {
    super(label, vscode.TreeItemCollapsibleState.Expanded);
    this.contextValue = "workSection";
    this.iconPath = new vscode.ThemeIcon(section === "files" ? "files" : "list-flat");
  }
}

export class TrackedFileItem extends vscode.TreeItem {
  public constructor(public readonly file: TrackedFile) {
    super(file.name, vscode.TreeItemCollapsibleState.Expanded);
    this.description = file.path;
    this.contextValue = "trackedFile";
    this.iconPath = new vscode.ThemeIcon(file.exists ? "file" : "warning");
    this.command = {
      command: "serverWorkspace.openFile",
      title: "Oeffnen",
      arguments: [file.path]
    };
    this.tooltip = new vscode.MarkdownString(
      [
        `**${file.name}**`,
        "",
        `Pfad: \`${file.path}\``,
        `Letzte Aenderung: ${formatDisplayDate(file.lastModifiedAt)}`,
        `${file.owner || "-"}:${file.group || "-"} | ${file.mode || "-"} | ${file.changeCount} Aenderungen`,
        `Kommentar: ${file.comment || "-"}`
      ].join("\n")
    );
  }
}

class DetailItem extends vscode.TreeItem {
  public constructor(label: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "fileDetail";
    this.iconPath = new vscode.ThemeIcon("blank");
  }
}

export class LogEntryItem extends vscode.TreeItem {
  public constructor(public readonly entry: ChangeLogEntry) {
    super(`${formatDisplayDate(entry.timestamp, true)} | ${entry.path}`, vscode.TreeItemCollapsibleState.None);
    this.contextValue = "logEntry";
    this.iconPath = new vscode.ThemeIcon("history");
    this.command = {
      command: "serverWorkspace.openFile",
      title: "Oeffnen",
      arguments: [entry.path]
    };
    this.tooltip = entry.path;
  }
}

export class WorkPageProvider implements vscode.TreeDataProvider<WorkNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<WorkNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly store: WorkspaceStore) {}

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: WorkNode): vscode.TreeItem {
    return element;
  }

  public async getChildren(element?: WorkNode): Promise<WorkNode[]> {
    try {
      const data = await this.store.load();
      if (!data) {
        return [
          new MessageItem("Noch nicht initialisiert", "~/.server-workspace/ fehlt"),
          new CommandItem("Initialisieren", {
            command: "serverWorkspace.initialize",
            title: "Initialisieren"
          })
        ];
      }

      if (!element) {
        return [new WorkSectionItem("files", "Arbeitsliste"), new WorkSectionItem("log", "Rohlog")];
      }

      if (element instanceof WorkSectionItem && element.section === "files") {
        const files = [...data.trackedFiles].sort((left, right) =>
          compareIsoDesc(left.lastModifiedAt || left.firstSeenAt, right.lastModifiedAt || right.firstSeenAt)
        );

        return files.length > 0 ? files.map((file) => new TrackedFileItem(file)) : [new MessageItem("Keine Dateien getrackt")];
      }

      if (element instanceof WorkSectionItem && element.section === "log") {
        const entries = [...data.changeLog].sort((left, right) => compareIsoDesc(left.timestamp, right.timestamp));
        return entries.length > 0 ? entries.map((entry) => new LogEntryItem(entry)) : [new MessageItem("Kein Rohlog")];
      }

      if (element instanceof TrackedFileItem) {
        const file = element.file;
        const details = [
          new DetailItem(file.path),
          new DetailItem(`Letzte Aenderung: ${formatDisplayDate(file.lastModifiedAt)}`),
          new DetailItem(`${file.owner || "-"}:${file.group || "-"} | ${file.mode || "-"} | ${file.changeCount} Aenderungen`),
          new DetailItem(`Kommentar: ${file.comment || "-"}`)
        ];

        if (!file.exists) {
          details.unshift(new DetailItem("Status: Datei nicht gefunden"));
        }

        return details;
      }

      return [];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [new MessageItem("Fehler beim Laden", message)];
    }
  }
}
