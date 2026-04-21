import * as vscode from "vscode";
import { WorkspaceStore } from "../core/workspaceStore";
import { CommandItem, MessageItem } from "./commonItems";

type NotesNode = CommandItem | MessageItem;

export class NotesProvider implements vscode.TreeDataProvider<NotesNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<NotesNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public constructor(private readonly store: WorkspaceStore) {}

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: NotesNode): vscode.TreeItem {
    return element;
  }

  public async getChildren(): Promise<NotesNode[]> {
    try {
      if (!(await this.store.isInitialized())) {
        return [
          new MessageItem("Noch nicht initialisiert", "~/.server-workspace/ fehlt"),
          new CommandItem("Initialisieren", {
            command: "serverWorkspace.initialize",
            title: "Initialisieren"
          })
        ];
      }

      return [
        new CommandItem(
          "NOTIZEN.md oeffnen",
          {
            command: "serverWorkspace.openNotes",
            title: "NOTIZEN.md oeffnen"
          },
          "notebook"
        )
      ];
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return [new MessageItem("Fehler beim Laden", message)];
    }
  }
}
