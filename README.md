# Server Workspace

Kleine VS-Code-Extension fuer Nutzer, die bereits per Remote-SSH mit einem Linux-Server verbunden sind. Die Extension baut keine SSH-Verbindung auf, bearbeitet keine SSH-Config und bringt keine Backend-Komponente mit.

## Ziel von V1

- Eigener Activity-Bar-Bereich `Server Workspace`
- Tree Views: `Arbeitsseite`, `System`, `Notizen`
- Remote-Dateien unter `~/.server-workspace/`
- Commands fuer Initialisierung, Refresh, Notizen und Kommentare

## Entwicklung

```bash
npm install
npm run compile
```

Zum Testen in VS Code:

1. Projektordner in VS Code oeffnen.
2. `F5` starten, um ein Extension Development Host Fenster zu oeffnen.
3. Die Extension ist fuer Remote-SSH-Workspaces gedacht und laeuft als Workspace-Extension.

## Nutzung

### Initialisieren

Command ausfuehren:

```text
Server Workspace: Initialisieren
```

Erst dieser Command legt auf dem verbundenen Host den Ordner an:

```text
~/.server-workspace/
```

Darin werden fehlende Dateien erstellt:

- `SYSTEMSTATUS.md`
- `NOTIZEN.md`
- `workspace-data.json`

Vor dem Initialisieren legt die Extension keine Server-Dateien an.

### Aktualisieren

Command:

```text
Server Workspace: Aktualisieren
```

Der Refresh liest Systeminfos, aktualisiert `workspace-data.json`, prueft bekannte getrackte Dateien und refreshed die Views.

### Arbeitsseite

Die View besteht aus:

- `Arbeitsliste`: getrackte Dateien, sortiert nach letzter Aenderung absteigend.
- `Rohlog`: einfache Logzeilen im Format `Datum Uhrzeit | Pfad`.

Eine Datei wird ueber `Server Workspace: Aktuelle Datei tracken` in die Arbeitsliste aufgenommen. Kontextmenues bieten Oeffnen, Kommentar bearbeiten/loeschen, Pfad kopieren und Metadaten aktualisieren.

### System

Zeigt Hostname, OS, Kernel, Architektur, Haupt-IP und letzten Refresh. `SYSTEMSTATUS.md` bleibt eine manuell pflegbare Markdown-Datei fuer Rolle, Zweck und Bemerkungen.

### Notizen

Oeffnet `NOTIZEN.md`.

## Nicht enthalten

Die Extension speichert keine SSH-Hosts. Dafuer bleibt der VS-Code Remote Explorer bzw. Remote-SSH zustaendig.
