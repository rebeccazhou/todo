# Todo

A minimal personal checklist app with category tabs, this-week and later sections, completion archive, local weather, Supabase login, and shared Supabase storage.

## Supabase setup

1. Open the Supabase SQL Editor.
2. Run `supabase/schema.sql`.
3. In Authentication > Users, create one user for this app and set its password.
4. Open the app and sign in with username `rz` and that password.

The Supabase publishable key is safe to ship in the browser. Row Level Security in `supabase/schema.sql` keeps each signed-in user's rows private.

## Run locally

```bash
python3 -m http.server 8000
```

Then open `http://127.0.0.1:8000`.

## Mac app

This repo includes a Tauri wrapper for building `Todo.app`.

```bash
npm install
npm run tauri dev
```

Build a local app bundle and DMG:

```bash
npm run tauri build
```

Build output:

- `src-tauri/target/release/bundle/macos/Todo.app`
- `src-tauri/target/release/bundle/dmg/Todo_0.1.0_aarch64.dmg`

## Mac app updates

The Mac app uses Tauri's updater plugin. Install the updater-enabled app once from the DMG, then future released versions can update in place.

The updater signing key lives outside the repo:

- Private key: `~/.tauri/todo-updater.key`
- Public key: `~/.tauri/todo-updater.key.pub`

Back up the private key. If it is lost, existing installed apps cannot trust future updates.

To build signed updater artifacts locally:

```bash
npm run tauri:build:signed
```

For GitHub releases, add this repository secret:

- `TAURI_SIGNING_PRIVATE_KEY`: contents of `~/.tauri/todo-updater.key`

Then bump `version` in `src-tauri/tauri.conf.json`, push the change, and run the `Release Mac App` workflow. The workflow publishes the DMG, updater `.tar.gz`, signature, and `latest.json`. The app checks:

```text
https://github.com/rebeccazhou/todo/releases/latest/download/latest.json
```
