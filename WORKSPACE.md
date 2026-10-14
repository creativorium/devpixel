# Team workspace (/teams)

A private workspace for up to five DevnPixel team members: projects with customizable kanban boards and shared notes per project. Projects are visible to everyone by default; admins can restrict projects and chat channels to selected members. It runs on the Supabase free tier; nothing here needs a paid plan.

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

Slack-style channels live under **Channels** in the sidebar (`#general` is created for you). Run `supabase/migrations/20261013000000_chat.sql` once in the SQL editor (after the workspace migration). With the roles migration, admins create and manage channels; people can only post as themselves and delete their own messages (enforced by row-level security). Chats use Supabase Realtime with polling every 5 seconds as a fallback while visible.

## Profiles, mentions, calendar and dashboard

Run `supabase/migrations/20261014000000_profiles_and_completion.sql` once (after the earlier two). It lets each member change **only their own display name** (Profile page, from the name at the bottom of the sidebar) and records when a task is completed for the dashboard. Type `@` in chat, task descriptions or pages to tag a teammate; tags are stored as `@[Name](email)` and always show the current name. Home lists recent mentions of you.

## Files, labels, subtasks, linked tasks, several assignees and roles

Run `supabase/migrations/20261015000000_files_labels_subtasks.sql` once (after the earlier three), **before** deploying the code that uses it. It adds:

- a **private** `workspace` storage bucket and `attachments` table: screenshots/files on tasks and in chat (paste, drop or attach; 4 MB each; images shown inline, everything else downloads; served only through `/teams/api/files/…` after the team check);
- task `labels` (Bug, Blocker, Feature, Improvement, Design, Content, Client request), `assignees` (up to 5, existing single assignees are copied over) and `parent_id` for nested subtasks;
- `task_dependencies`: "blocked by" links. A blocked task cannot leave To do until every task it waits for is Done, enforced by a database trigger; loops are refused;
- `members.role` (`admin` / `member`). Admins manage channels and, with the visibility migration, control resource access and project archiving. Members work on projects they can access. The script makes the workspace owner an admin. To change someone: `update public.members set role = 'admin' where email = '…';`

Notes also gained a formatting toolbar (Ctrl/Cmd+B, I, E, K), list continuation on Enter, kept blank lines, and **Import .txt / .md** (read in the browser; no storage).

## Custom project statuses

Before using **Manage statuses** above the Kanban board, run
`supabase/migrations/20261017000000_project_statuses.sql` in Supabase SQL Editor
after the existing migrations. The migration preserves all existing tasks and
adds per-project column names/colors. Team members can rename the four original
columns and add up to 16 extra open stages (20 columns total). Additional stages
appear before the completion column. Existing starting (`todo`) and completion
(`done`) IDs retain their behavior even after renaming, including dependency
checks, checkboxes and completion timestamps. No statuses are deleted by this UI.

Names and colors are shared through the board, list, task editor, calendar,
activity and project overview. The all-project dashboard uses standard names
for the four shared states and includes each project's additional stages.
Writes are member-only, validate status ownership in the database, and lock the
project row to avoid lost concurrent edits. Without the migration, current
boards retain their default statuses and editing reports a setup error.

## Admin-controlled visibility

### Personal sidebar ordering

Drag a project's grip in the left sidebar to place it above or below another
project, or use its menu's **Move up** / **Move down** actions (also available on
mobile). The order is stored per account in the current browser; it does not
reorder another member's sidebar or change access. New projects appear after
previously ordered projects. No database migration is needed.

**Blocked by** requires another saved task in the project. Open the task that
must wait and choose its prerequisite under **Blocked by**. Once the prerequisite
is completed, the waiting task can move out of the starting status. Use the remove
button beside a linked task to unlink it. Circular dependencies are rejected.

### Visibility setup

After the existing migrations (including `20261017000000_project_statuses.sql`),
run `supabase/migrations/20261018000000_resource_visibility.sql` in the Supabase
SQL editor. This migration has been tested locally; it is not automatically
applied by deploying the site.

Admins have a **Visibility** button beside the project heading and in each chat
channel header. Choose **Everyone** or **Selected members**; selecting nobody
means admins only. Admins always retain access. Project and channel access are
configured independently. Members can create projects, which are visible to
everyone by default, but cannot change visibility, archive, restore, or delete
projects. Channel creation and management remain admin-only.

Row-level security protects projects, tasks, notes, comments, activity, chat,
notifications, and private file storage, including direct API access. The same
filters apply to sidebar listings, search, dashboards, and realtime messages.
Open project/channel pages check access every 15 seconds and on focus, returning
to Teams if access is revoked. Previously downloaded content cannot be retracted.
The new controls report a setup error until the migration is applied; no existing
project or channel is restricted automatically.

The isolated Postgres integration test applies all migrations and tests admin,
allowed-member, excluded-member and outsider access without using a live database:

```powershell
npm install --prefix output/status-db-check --no-save --package-lock=false @electric-sql/pglite
node tests/resource-visibility.mjs ./output/status-db-check/node_modules/@electric-sql/pglite/dist/index.js
```

## Comments, activity, notifications and live updates

The bell receives assignments, task-description/comment/chat mentions (select a
person from the `@` suggestions), and comments on assigned tasks. Self-actions
do not notify the actor. Realtime updates have a 60-second polling fallback;
opening the bell or focusing the window also refreshes it. Loading failures show
a retry message. These are in-app notifications, not email or device push alerts.

## Direct messages and optional time logs (local preview)

### Admin team settings

Apply `20261025000000_admin_members.sql` after migration 24. Profile menu →
Profile & team settings lets admins add allowlisted Google sign-in emails and
edit display names and roles. Invite teammate grants membership immediately;
Copy invitation link produces the current site's Teams login URL to share
manually. The recipient must sign in with the authorized Google email. No email
is sent and no bearer invite token is used. Sign-in emails cannot be edited;
task and chat ownership stays intact. Members cannot call the management RPC,
and admins cannot demote themselves. The existing magic-link flow for accounts
already provisioned in Supabase Auth is unchanged.

Migration `20261024000000_chat_management.sql` supersedes the separate-conversation
behavior below: Add people now extends the current conversation, preserving its
ID and giving new participants access to existing messages and attachments. Any
current participant can add teammates up to five total or confirm Delete chat
for everyone. Unrelated admins cannot manage it. Header and sidebar controls use
the same dialogs. Old browser-hidden chats are shown again; removal is now chat
deletion rather than a sidebar preference. Time reports offer Date range with
Start date and End date calendar inputs.

Apply `20261023000000_private_groups.sql` after migration 22 to enable private
groups (up to five participants including you). Use + to select teammates, or a
conversation's options → Add people. A changed participant set opens a separate
conversation, preserving the previous private history. The same participant set
reopens its existing conversation. Options also provide Move up/down and Remove
from sidebar. Ordering and hidden chats are personal to this browser/account;
Removed chats restores them without deleting anyone's messages. Notifications
continue for hidden conversations.

After migration 19, run `20261020000000_direct_messages.sql`, then
`20261021000000_task_time_logs.sql` in the Supabase SQL editor. Both are safe to
rerun. Keep migration order when recreating the database.

**Direct messages** appears below Channels. Use + and choose a teammate; an
existing conversation between that pair reopens. Every new private message
notifies its recipient. The conversation, messages and uploaded files are
limited by database policies to the two participants, including against other
workspace admins. The normal chat UI supports replies and attachments. Private
conversations cannot be renamed, expanded into groups or deleted as channels.
The sidebar discovers new conversations on focus or within a minute; the bell
also links directly to new messages. Database/project owners retain operational
access; these messages are not end-to-end encrypted.

**Time logs** defaults to Off on every project. Admins toggle it in the project
header. Enabled tasks allow manual dated hours/minutes and a required work note;
logs save separately from task details. Members edit/delete their own entries;
admins can manage entries in accessible projects. Logs are limited to 24 hours
per entry. Disabling logging blocks writes without deleting history.

Apply `20261022000000_time_log_activity.sql` after migration 21 for card totals
and activity history. Existing logs are backfilled once. Tasks show a compact
total with **Log time** and **Manage logs** buttons opening a popup. Saving,
editing and deleting entries creates Activity events. Card totals count only
the task's own logs, not subtask logs. Both the main Dashboard and project
Overview show reports; Overview is restricted to that project.

Dashboard → Time logged supports day, Monday–Sunday week, month and custom date
ranges up to one year, plus teammate/project filters. Totals include all matching
entries; notes link back to their task. Historical entries remain in reports for
accessible projects even when logging is off. No automatic timer or invoice
charging is added. Test locally at `http://localhost:3000/teams` after applying
the migrations. These changes have not been deployed.

Supabase quota is shown at https://supabase.com/dashboard/org/_/usage. Select the
correct organization and review Database Size, Storage Size and Egress.

## Task-based invoice setup

Run `supabase/migrations/20261019000000_project_invoices.sql` after migration 18.
Use the latest complete file; it is safe to rerun. Admins can open a project and
choose **Create invoice**, select tasks and optionally group subtasks into line
descriptions, then edit the invoice. Rates begin at zero for review. Billing
defaults and the task/invoice register are admin-only. Removed invoice lines
are excluded from the saved task links; repeat billing requires acknowledgement.

Drafts stay in this browser, scoped by account and project. Resume a draft to
continue editing. Saving a short link writes to the configured Google Sheet and
records the linked tasks in Supabase. PDF exports and snapshot links do not mark
tasks invoiced. A timed-out save must be checked against the Sheet before retrying;
the reserved invoice ID prevents automatically appending a duplicate.

Test at `http://localhost:3000/teams` with `npm run dev -- --port 3000` and the
existing local authentication and Sheets environment configuration. Previewing
and editing drafts does not write to Sheets, but **saving a short link locally
writes to the configured Sheet**, just as production does. No new secret is
required. Project/channel headings now show Everyone, Selected members or
Admins only; wide boards also show project progress, upcoming tasks and tips.

Run `supabase/migrations/20261016000000_comments_activity_notifications.sql` once. It adds task comments, a change history written by database triggers (status, title, due date, priority, labels, assignees), and notifications for @mentions, assignments and comments on your tasks (the bell, top right). It also enables Supabase Realtime for chat messages and notifications; the site's CSP allows the browser to connect to the project in `SUPABASE_URL` only. Until the script runs, these features stay quiet and everything else works as before.
