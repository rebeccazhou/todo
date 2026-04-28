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
