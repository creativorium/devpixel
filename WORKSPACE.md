# Team workspace (/teams)

A private workspace for up to five DevnPixel team members: projects with a kanban board (To do → In progress → Review → Done) and shared notes per project. Everyone on the team sees every project. It runs on the Supabase free tier; nothing here needs a paid plan.

The rest of the site is unaffected: `/teams` has its own layout with no site navigation or Analytics, is `noindex`, `no-store` and excluded from the sitemap. Until the two environment variables below are set, `/teams` shows a "not connected" message.

## How access works

1. **Sign-in** is Supabase Auth: Google, or an emailed magic link.
2. **The allowlist** is the `members` table. A signed-in account whose email is not in it sees "not on the team list" and cannot read anything.
3. **Row level security** in Postgres enforces the same allowlist on every table, so even a direct API call with the public key gets nothing without a member's session.

The browser never talks to Supabase directly: pages and Server Actions in `src/app/(workspace)` query it on the server with the visitor's session cookie. `src/proxy.ts` only refreshes that cookie and sends signed-out visitors to `/teams/login`.

## One-time setup (about 20 minutes)

### 1. Supabase project

1. Create a free project at supabase.com (region: Singapore is closest to Bali).
2. **SQL Editor** → paste all of `supabase/migrations/20261012000000_workspace.sql` → Run.
3. Still in the SQL editor, add the team (lowercase emails):
   ```sql
   insert into public.members (email, display_name) values
     ('you@devnpixel.com', 'Your Name'),
     ('teammate@gmail.com', 'Teammate')
   on conflict (email) do update set display_name = excluded.display_name;
   ```
   To remove someone: `delete from public.members where email = '...';` (their tasks become unassigned).

### 2. Auth settings (Supabase → Authentication)

1. **Sign In / Providers → User Signups:** turn **off** "Allow new users to sign up". Strangers then cannot even create an account.
2. **Users → Add user → Create new user** for each team member (same emails as the members table), with a random password and **Auto Confirm User** ticked. No email is sent; nobody uses that password. Google sign-in and magic links attach to this account because the email matches. (Avoid "Send invitation": it uses the rate-limited mailer and its link does not return to `/teams`.)
3. **URL Configuration:** Site URL `https://www.devnpixel.com`; add Redirect URLs `https://www.devnpixel.com/teams/auth/callback**` and `http://localhost:3000/teams/auth/callback**` (plus your Netlify preview domain if you use one, e.g. `https://*--devnpixel.netlify.app/teams/auth/callback**`). Keep the trailing `**`: the callback carries a `?next=` query, and without it Supabase falls back to the Site URL (the homepage).

### 3. Google sign-in (free)

1. Google Cloud Console → APIs & Services → **OAuth consent screen**: External, app name "DevnPixel Teams", your support email. Publishing status can stay "Testing" if you add the five Gmail/Workspace addresses as test users; otherwise publish it (only basic email/profile scopes, so no Google review is needed).
2. **Credentials → Create OAuth client ID → Web application.** Authorised redirect URI: the callback shown in Supabase → Authentication → Providers → Google (looks like `https://<project>.supabase.co/auth/v1/callback`).
3. Paste the Client ID and Secret into Supabase → Providers → Google and enable it.

### 4. Magic-link email

Supabase's built-in mailer is for testing only: it sends a handful of emails per hour. The site already uses Resend, so point Supabase at it (free tier: 3,000 emails/month):
Supabase → Authentication → **Emails → SMTP Settings** → enable custom SMTP: host `smtp.resend.com`, port `465`, user `resend`, password = a Resend API key with sending access to `notify.devnpixel.com`, sender e.g. `DevnPixel Teams <teams@notify.devnpixel.com>`.

If you skip this step, Google sign-in still works.

Magic links must be opened in the same browser that requested them. For links that work on any device, edit the **Magic Link** email template so its link is
`{{ .SiteURL }}/teams/auth/callback?token_hash={{ .TokenHash }}&type=magiclink`.

### 5. Environment variables

From Supabase → Project Settings → API keys: the **Project URL** and the **publishable** key (`sb_publishable_…`; the legacy `anon` key also works).

| Variable                   | Where                                                                        |
| -------------------------- | ---------------------------------------------------------------------------- |
| `SUPABASE_URL`             | `.env.local` for development, Netlify → Environment variables for production |
| `SUPABASE_PUBLISHABLE_KEY` | same                                                                         |

Never use the `service_role` / secret key here; the workspace does not need it.

## Free-tier notes

- Supabase pauses a free project after 7 days without any requests. Regular team use keeps it awake; if it pauses, restore it from the dashboard (data is kept).
- 500 MB database is far more than tasks and text notes need.
- Free projects have no automatic backups you can download. Export occasionally: Database → Backups is paid, so use **SQL Editor → `select * from tasks`** → Export CSV, or `supabase db dump` with the Supabase CLI.

## Using it

- `/teams` lists projects with a progress bar. Create a project, then add tasks on its board.
- Drag cards between columns, or open a card and change **Status** (works on phones and with the keyboard).
- Each task has details, priority, assignee and due date. Overdue tasks are marked red.
- **Notes** tab: shared documents per project. They autosave while editing. If two people edit the same note at once, the last save wins, so agree who is editing a big note.
- Never paste passwords or API keys into notes or tasks; note where they are kept instead.

## Code map

- `supabase/migrations/…_workspace.sql`: tables, allowlist function, RLS policies.
- `src/proxy.ts`: session refresh and signed-out redirect for `/teams`.
- `src/lib/workspace/`: `model.ts` (types, validation, card ordering), `session.ts` (`requireMember`, the access gate), `queries.ts`, `supabase.ts`.
- `src/app/(workspace)/teams/`: pages, `actions.ts` (all writes), `login/`, `auth/callback`, `auth/google`.
- `src/components/workspace/`: kanban board, note editor and other UI.
- Tests: `npm test` covers validation, safe redirects and ordering (`tests/workspace.test.ts`).

## Optional: show "devnpixel.com" on Google's account picker (free)

By default Google's picker says "continue to <project>.supabase.co", because Supabase hosts the Google step. To make Google return to devnpixel.com instead (no paid Supabase add-on needed):

1. Google Cloud → Google Auth Platform → **Clients** → your web client → **Authorized redirect URIs** → add
   `https://www.devnpixel.com/teams/auth/google/callback` and `http://localhost:3000/teams/auth/google/callback` (keep the Supabase one too) → **Save**. Changes can take a few minutes.
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` (same client as in Supabase) in `.env.local` and in Netlify.

The site then exchanges Google's code itself and hands the verified ID token to Supabase (`signInWithIdToken`), so the allowlist, sign-up lock and sessions are unchanged. Remove the two variables to fall back to the Supabase-hosted flow.

## Chat channels

Slack-style channels live under **Channels** in the sidebar (`#general` is created for you). Run `supabase/migrations/20261013000000_chat.sql` once in the SQL editor (after the workspace migration). Anyone on the team can create a channel; people can only post as themselves and delete their own messages (enforced by row level security). Open chats check for new messages every 3 seconds while the tab is visible, so the browser never connects to Supabase directly and the site's CSP is unchanged.

## Profiles, mentions, calendar and dashboard

Run `supabase/migrations/20261014000000_profiles_and_completion.sql` once (after the earlier two). It lets each member change **only their own display name** (Profile page, from the name at the bottom of the sidebar) and records when a task is completed for the dashboard. Type `@` in chat, task descriptions or pages to tag a teammate; tags are stored as `@[Name](email)` and always show the current name. Home lists recent mentions of you.

## Files, labels, subtasks, linked tasks, several assignees and roles

Run `supabase/migrations/20261015000000_files_labels_subtasks.sql` once (after the earlier three), **before** deploying the code that uses it. It adds:

- a **private** `workspace` storage bucket and `attachments` table: screenshots/files on tasks and in chat (paste, drop or attach; 4 MB each; images shown inline, everything else downloads; served only through `/teams/api/files/…` after the team check);
- task `labels` (Bug, Blocker, Feature, Improvement, Design, Content, Client request), `assignees` (up to 5, existing single assignees are copied over) and `parent_id` for nested subtasks;
- `task_dependencies`: "blocked by" links. A blocked task cannot leave To do until every task it waits for is Done, enforced by a database trigger; loops are refused;
- `members.role` (`admin` / `member`). Admins create, rename and delete channels; everyone else can do everything else. The script makes the workspace owner an admin. To change someone: `update public.members set role = 'admin' where email = '…';`

Notes also gained a formatting toolbar (Ctrl/Cmd+B, I, E, K), list continuation on Enter, kept blank lines, and **Import .txt / .md** (read in the browser; no storage).

## Comments, activity, notifications and live updates
Run `supabase/migrations/20261016000000_comments_activity_notifications.sql` once. It adds task comments, a change history written by database triggers (status, title, due date, priority, labels, assignees), and notifications for @mentions, assignments and comments on your tasks (the bell, top right). It also enables Supabase Realtime for chat messages and notifications; the site's CSP allows the browser to connect to the project in `SUPABASE_URL` only. Until the script runs, these features stay quiet and everything else works as before.
