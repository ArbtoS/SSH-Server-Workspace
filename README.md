# SSH Workspace

SSH Workspace is a small Visual Studio Code extension for users who are already connected to a Linux server through VS Code Remote-SSH. It does not create SSH connections, manage SSH hosts, or edit SSH configuration files.

This project was developed with support from ChatGPT. The extension scope, behavior, and final code decisions remain project-owned and reviewable in this repository.

---

## Deutsch

SSH Workspace ist eine kleine VS-Code-Extension für Remote-SSH-Workspaces. Sie hilft dabei, wichtige Serverdateien bewusst zu tracken, einfache Systeminfos zu sehen, Notizen direkt auf dem verbundenen Server abzulegen und häufige Befehle zentral zu sammeln.

Die Extension läuft im bereits verbundenen Remote-Workspace. Remote-SSH bleibt für Verbindung, Authentifizierung und Host-Verwaltung zuständig.

### Funktionen

- Eigener Activity-Bar-Bereich `SSH Workspace`
- Views: `Aktionen`, `Arbeitsseite`, `System`, `Notizen`
- Initialisierung von `~/.ssh-workspace/` auf dem Remote-Host
- Datei-Tracking für bewusst ausgewählte Serverdateien
- Klarname und Kommentar pro getrackter Datei
- Optionaler Systemd-Service pro Datei für automatische Standardaktionen
- Zusätzliche frei benennbare Befehle pro Datei
- Drag-and-Drop-Sortierung in Arbeitsliste, Notizen und globaler Befehlsliste
- Rohlog für erkannte Änderungen an getrackten Dateien
- Systeminfos wie Hostname, OS, Kernel, Architektur und Haupt-IP
- Allgemeine Notiz in `NOTIZEN.md`
- Zusätzliche einzelne Notizdateien unter `~/.ssh-workspace/notes/`
- Globale gespeicherte Befehle mit Name, Command, Notiz und den letzten 10 Ausführungen samt Output
- Sprachumschaltung Deutsch/Englisch über `sshWorkspace.language`

### Nicht enthalten

- Keine eigene SSH-Verbindung
- Keine SSH-Config-Verwaltung
- Keine Server-/Host-Merkliste
- Keine Services oder Hintergrundkomponente
- Kein automatisches Tracking beliebiger Terminal-Edits
- Kein Parsing von `~/.bash_history` als Rohlog-Quelle

Dateien, die mit `nano`, `vim`, `cat > file` oder `sudo` im Terminal bearbeitet werden, werden nicht automatisch entdeckt. Sobald eine Datei einmal getrackt ist, kann `Aktualisieren` ihre Metadaten und Änderungen erfassen.

`~/.bash_history` ist bewusst nicht Teil des Rohlogs. Die Shell-History ist in Linux typischerweise benutzerbezogen statt repo-bezogen, oft zeitversetzt geschrieben und bei `sudo` oder `su` schnell unvollständig.

### Remote-Dateien

Beim Initialisieren legt die Extension auf dem verbundenen Remote-Host diesen Ordner an:

```text
~/.ssh-workspace/
```

Darin liegen:

```text
NOTIZEN.md
notes/
workspace-data.json
```

Vor dem Command `SSH Workspace: Initialisieren` wird nichts auf dem Server angelegt.

Hinweis zur Umbenennung: Ältere Versionen haben ihre Remote-Daten unter `~/.ssh-server-workspace/` gespeichert. Die aktuelle Version verwendet `~/.ssh-workspace/`. Falls du bestehende Daten übernehmen willst, musst du sie auf dem Remote-Host einmalig in den neuen Ordner kopieren oder verschieben.

### Aktionen

Bündelt die globalen Befehle:

- Initialisieren
- Aktualisieren
- Pfad tracken
- Aktuelle Datei tracken
- Neue Notiz
- Befehl hinzufügen
- Daten neu erstellen

### Arbeitsseite

Die Arbeitsseite besteht aus:

- `Arbeitsliste`: bewusst getrackte Dateien
- `Rohlog`: erkannte Änderungen im Format `Datum Uhrzeit | Pfad`

Eine Datei kann auf zwei Wegen aufgenommen werden:

- `Aktuelle Datei tracken`: trackt die Datei, die gerade im VS-Code-Editor aktiv ist
- `Pfad tracken`: nimmt einen absoluten Remote-Pfad auf, zum Beispiel `/etc/systemd/system/hostapd-healthcheck.timer`

Pro getrackter Datei können Klarname und Kommentar gepflegt werden. Die Arbeitsliste kann per Drag and Drop manuell sortiert werden. Interne SSH-Workspace-Dateien wie `NOTIZEN.md` und `workspace-data.json` werden nicht in der Arbeitsliste angezeigt.

Zusätzlich kann jede getrackte Datei einen optionalen Systemd-Service hinterlegen, zum Beispiel `nginx.service`. Daraus werden `Starten`, `Stoppen`, `Neustarten` und `Status` automatisch über `systemctl` im integrierten Remote-Terminal abgeleitet.

Für Sonderfälle lassen sich pro Datei zusätzliche frei benennbare Befehle anlegen und später wieder entfernen.

### System

Zeigt einfache Systeminfos:

- Hostname
- OS-Name
- OS-Version
- Kernel
- Architektur
- Haupt-IP
- letzter Refresh

### Notizen

Die Notizen-View bietet:

- `Neue Notiz`: erstellt eine eigene neue Markdown-Datei
- `NOTIZEN.md`: allgemeine dauerhafte Notizdatei
- zusätzliche Notizdateien mit Drag and Drop sortierbar und löschbar

### Installation zum Testen

Abhängigkeiten installieren und kompilieren:

```powershell
npm install
npm run compile
```

VSIX bauen:

```powershell
npm run package
```

Danach im Remote-SSH-Fenster:

1. `Extensions: Install from VSIX...` ausführen.
2. Die erzeugte Datei `ssh-workspace-*.vsix` auswählen.
3. `Developer: Reload Window` ausführen.
4. In der Activity Bar `SSH Workspace` öffnen.
5. In `Aktionen` den Command `Initialisieren` ausführen.

### Sprache umschalten

Die Extension bringt eine eigene Einstellung mit:

```json
"sshWorkspace.language": "de"
```

Mögliche Werte:

- `de`: Deutsch
- `en`: English

Die Einstellung wirkt auf Tree-View-Inhalte, Eingabedialoge und Benachrichtigungen der Extension. VS-Code-Manifest-Texte wie View-Namen und Command-Palette-Titel sind statisch und können von VS Code nicht vollständig zur Laufzeit über eine Extension-eigene Einstellung umgeschaltet werden.

### Entwicklung

```powershell
npm install
npm run compile
npm run package
```

Die Extension ist als Workspace-Extension konfiguriert:

```json
"extensionKind": ["workspace"]
```

Damit ist sie für den Einsatz im Remote-SSH-Workspace gedacht.

### KI-Unterstützung

ChatGPT war an Planung, Code-Erstellung und Iteration dieser Extension beteiligt. Der Einsatz von ChatGPT ist hier transparent dokumentiert; die Extension bleibt ein normales, prüfbares Open-Source-Projekt.

---

## English

SSH Workspace is a small VS Code extension for Remote-SSH workspaces. It helps users deliberately track important server files, view basic system information, keep notes directly on the connected server, and maintain a small list of frequently used commands.

The extension runs inside an already connected remote workspace. VS Code Remote-SSH remains responsible for connection handling, authentication, and host management.

### Features

- Dedicated `SSH Workspace` Activity Bar container
- Views: `Aktionen` (Actions), `Arbeitsseite` (Work Page), `System`, `Notizen` (Notes)
- Initializes `~/.ssh-workspace/` on the remote host
- File tracking for deliberately selected server files
- Display name and comment per tracked file
- Optional systemd service per file for automatic default actions
- Additional custom-named commands per file
- Drag-and-drop ordering in the work list, notes, and global command list
- Raw log for detected changes in tracked files
- System information such as hostname, OS, kernel, architecture, and main IP
- General notes in `NOTIZEN.md`
- Additional standalone note files under `~/.ssh-workspace/notes/`
- Global saved commands with name, command, note, and the last 10 runs with a limited output preview
- German/English language switch through `sshWorkspace.language`

### Not Included

- No SSH connection handling
- No SSH config management
- No saved SSH host list
- No service or background backend component
- No automatic tracking of arbitrary terminal edits
- No parsing of `~/.bash_history` as a raw-log source

Files edited through `nano`, `vim`, `cat > file`, or `sudo` in a terminal are not discovered automatically. Once a file is tracked, `Refresh` can update its metadata and detect changes.

`~/.bash_history` is intentionally not used for the raw log. On Linux, shell history is usually user-scoped rather than repo-scoped, often written late, and becomes unreliable quickly once `sudo` or `su` gets involved.

### Remote Files

Initialization creates this folder on the connected remote host:

```text
~/.ssh-workspace/
```

It contains:

```text
NOTIZEN.md
notes/
workspace-data.json
```

No server-side files are created before running `SSH Workspace: Initialisieren`.

### Actions

Collects the global commands:

- Initialize
- Refresh
- Track path
- Track current file
- New note
- Add command
- Recreate data

### Work Page

The work page contains:

- `Arbeitsliste`: deliberately tracked files
- `Rohlog`: detected changes in the format `date time | path`

A file can be added in two ways:

- `Aktuelle Datei tracken`: tracks the file currently active in the VS Code editor
- `Pfad tracken`: tracks an absolute remote path, for example `/etc/systemd/system/hostapd-healthcheck.timer`

Each tracked file can have a display name and a comment. The work list can be manually sorted with drag and drop. Internal SSH Workspace files such as `NOTIZEN.md` and `workspace-data.json` are hidden from the work list.

Each tracked file can also store an optional systemd service such as `nginx.service`. `Start`, `Stop`, `Restart`, and `Status` are derived automatically from that service and executed through `systemctl` in the integrated remote terminal.

For special cases, each tracked file can also store additional custom-named commands that can be added and removed later.

### System

Shows basic system information:

- Hostname
- OS name
- OS version
- Kernel
- Architecture
- Main IP
- Last refresh

### Notes

The notes view offers:

- `Neue Notiz`: creates a separate Markdown note file
- `NOTIZEN.md`: general long-lived notes file
- additional note files that can be reordered with drag and drop and deleted
- `Recent Output`: limited preview of the last 10 command runs, with a manual clear action
- `sudo` commands from the global command list can fall back to the integrated terminal so a password prompt is possible

### Test Installation

Install dependencies and compile:

```powershell
npm install
npm run compile
```

Build a VSIX:

```powershell
npm run package
```

Then, in the Remote-SSH window:

1. Run `Extensions: Install from VSIX...`.
2. Select the generated `ssh-workspace-*.vsix` file.
3. Run `Developer: Reload Window`.
4. Open `SSH Workspace` in the Activity Bar.
5. Run `Initialisieren` from the `Aktionen` view.

### Language Setting

The extension provides its own setting:

```json
"sshWorkspace.language": "en"
```

Supported values:

- `de`: German
- `en`: English

The setting affects tree view contents, input prompts, and notifications provided by the extension. VS Code manifest texts such as view names and command palette titles are static and cannot be fully switched at runtime through an extension-specific setting.

### Development

```powershell
npm install
npm run compile
npm run package
```

The extension is configured as a workspace extension:

```json
"extensionKind": ["workspace"]
```

It is intended to run inside the Remote-SSH workspace.

### AI Assistance

ChatGPT assisted with planning, code generation, and iteration for this extension. This involvement is documented transparently; the extension remains a normal, reviewable open-source project.
