import * as vscode from "vscode";
import { WorkspaceStore } from "./core/workspaceStore";
import { registerCommands } from "./commands/registerCommands";
import { NotesProvider } from "./providers/notesProvider";
import { SystemProvider } from "./providers/systemProvider";
import { WorkPageProvider } from "./providers/workPageProvider";

export function activate(context: vscode.ExtensionContext): void {
  const store = new WorkspaceStore();

  const workProvider = new WorkPageProvider(store);
  const systemProvider = new SystemProvider(store);
  const notesProvider = new NotesProvider(store);

  context.subscriptions.push(
    vscode.window.createTreeView("serverWorkspace.work", {
      treeDataProvider: workProvider,
      showCollapseAll: true
    }),
    vscode.window.createTreeView("serverWorkspace.system", {
      treeDataProvider: systemProvider
    }),
    vscode.window.createTreeView("serverWorkspace.notes", {
      treeDataProvider: notesProvider
    })
  );

  registerCommands(context, store, {
    work: workProvider,
    system: systemProvider,
    notes: notesProvider
  });
}

export function deactivate(): void {
  // No services or background resources in V1.
}
