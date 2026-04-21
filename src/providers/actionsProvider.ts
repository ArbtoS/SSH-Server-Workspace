import * as vscode from "vscode";
import { CommandItem } from "./commonItems";

type ActionNode = CommandItem;

export class ActionsProvider implements vscode.TreeDataProvider<ActionNode> {
  private readonly onDidChangeTreeDataEmitter = new vscode.EventEmitter<ActionNode | undefined | null | void>();
  public readonly onDidChangeTreeData = this.onDidChangeTreeDataEmitter.event;

  public refresh(): void {
    this.onDidChangeTreeDataEmitter.fire();
  }

  public getTreeItem(element: ActionNode): vscode.TreeItem {
    return element;
  }

  public getChildren(): ActionNode[] {
    return [
      new CommandItem(
        "Initialisieren",
        {
          command: "serverWorkspace.initialize",
          title: "Initialisieren"
        },
        "add"
      ),
      new CommandItem(
        "Aktualisieren",
        {
          command: "serverWorkspace.refresh",
          title: "Aktualisieren"
        },
        "refresh"
      ),
      new CommandItem(
        "Pfad tracken",
        {
          command: "serverWorkspace.trackPath",
          title: "Pfad tracken"
        },
        "file-add"
      ),
      new CommandItem(
        "Aktuelle Datei tracken",
        {
          command: "serverWorkspace.trackCurrentFile",
          title: "Aktuelle Datei tracken"
        },
        "eye"
      ),
      new CommandItem(
        "Notiz hinzufuegen",
        {
          command: "serverWorkspace.addNote",
          title: "Notiz hinzufuegen"
        },
        "note"
      ),
      new CommandItem(
        "Daten neu erstellen",
        {
          command: "serverWorkspace.recreateData",
          title: "Daten neu erstellen"
        },
        "trash"
      )
    ];
  }
}
