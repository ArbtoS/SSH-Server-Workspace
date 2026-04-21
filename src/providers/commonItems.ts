import * as vscode from "vscode";

export class MessageItem extends vscode.TreeItem {
  public constructor(label: string, description?: string) {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.description = description;
    this.iconPath = new vscode.ThemeIcon("info");
  }
}

export class CommandItem extends vscode.TreeItem {
  public constructor(label: string, command: vscode.Command, icon = "play") {
    super(label, vscode.TreeItemCollapsibleState.None);
    this.command = command;
    this.iconPath = new vscode.ThemeIcon(icon);
  }
}
