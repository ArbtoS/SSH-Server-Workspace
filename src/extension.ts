import * as vscode from "vscode";
import { ServerStorage } from "./core/serverStorage";
import { WorkspaceStore } from "./core/workspaceStore";
import { registerCommands } from "./commands/registerCommands";
import { NotesProvider } from "./providers/notesProvider";
import { ServerProvider } from "./providers/serverProvider";
import { SystemProvider } from "./providers/systemProvider";
import { WorkPageProvider } from "./providers/workPageProvider";

export function activate(context: vscode.ExtensionContext): void {
  const store = new WorkspaceStore();
  const serverStorage = new ServerStorage(context);

  const workProvider = new WorkPageProvider(store);
  const systemProvider = new SystemProvider(store);
  const notesProvider = new NotesProvider(store);
  const serverProvider = new ServerProvider(serverStorage);

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
    }),
    vscode.window.createTreeView("serverWorkspace.servers", {
      treeDataProvider: serverProvider
    })
  );

  registerCommands(context, store, serverStorage, {
    work: workProvider,
    system: systemProvider,
    notes: notesProvider,
    servers: serverProvider
  });
}

export function deactivate(): void {
  // No services or background resources in V1.
}
