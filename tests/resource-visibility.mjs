// Isolated Postgres integration test. Pass an installed @electric-sql/pglite module path.
// node tests/resource-visibility.mjs ./output/status-db-check/node_modules/@electric-sql/pglite/dist/index.js
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
const { PGlite } = await import(
  process.argv[2]
    ? pathToFileURL(resolve(process.argv[2])).href
    : "@electric-sql/pglite"
);
const db = new PGlite();
await db.exec(`
  create role anon; create role authenticated;
  create schema auth; create schema storage;
  create function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims', true), ''), '{}')::jsonb $$;
  grant usage on schema public, auth, storage to authenticated, anon;
  alter default privileges in schema public grant select,insert,update,delete on tables to authenticated;
  alter default privileges in schema public grant usage on sequences to authenticated;
  create table storage.buckets (id text primary key, name text, public boolean, file_size_limit bigint);
  create table storage.objects (id uuid primary key default gen_random_uuid(), bucket_id text, name text);
  alter table storage.objects enable row level security;
  grant select,insert,update,delete on storage.objects to authenticated;
  create publication supabase_realtime;
`);
const migrations = (await fs.readdir("supabase/migrations"))
  .filter((name) => name.endsWith(".sql"))
  .sort();
for (const migration of migrations)
  await db.exec(await fs.readFile(`supabase/migrations/${migration}`, "utf8"));
await db.exec(
  await fs.readFile(
    "supabase/migrations/20261018000000_resource_visibility.sql",
    "utf8",
  ),
);
await db.exec(await fs.readFile("supabase/migrations/20261020000000_direct_messages.sql", "utf8"));
await db.exec(await fs.readFile("supabase/migrations/20261024000000_chat_management.sql", "utf8"));
const admin = "admin@example.test",
  allowed = "allowed@example.test",
  excluded = "excluded@example.test";
await db.query(
  "insert into members(email,display_name,role) values ($1,'Admin','admin'),($2,'Allowed','member'),($3,'Excluded','member')",
  [admin, allowed, excluded],
);
const login = async (email) => {
  await db.exec("reset role");
  await db.query("select set_config('request.jwt.claims', $1, false)", [
    JSON.stringify({ email }),
  ]);
  await db.exec("set role authenticated");
};
const first = async (sql, args = []) => (await db.query(sql, args)).rows[0];
const count = async (table, clause = "", args = []) =>
  Number((await first(`select count(*) as n from ${table} ${clause}`, args)).n);
await login(excluded);
const p = (
  await first(
    "insert into projects(name) values ('Member project') returning id",
  )
).id;
const p2 = (
  await first(
    "insert into projects(name) values ('Public project') returning id",
  )
).id;
assert.equal(
  (await first("select visible_to from projects where id=$1", [p])).visible_to,
  null,
);
await assert.rejects(
  () =>
    db.query("insert into projects(name,visible_to) values ('Private', '{}')"),
  /Only admins/,
);
await assert.rejects(
  () => db.query("update projects set visible_to='{}' where id=$1", [p]),
  /Only admins/,
);
await assert.rejects(
  () => db.query("update projects set archived_at=now() where id=$1", [p]),
  /Only admins/,
);
assert.equal(
  (await db.query("delete from projects where id=$1 returning id", [p])).rows
    .length,
  0,
);
const t = (
  await first(
    "insert into tasks(project_id,title,assignees) values ($1,'Private task',$2) returning id",
    [p, [allowed, excluded]],
  )
).id;
const t2 = (
  await first(
    "insert into tasks(project_id,title) values ($1,'Public task') returning id",
    [p2],
  )
).id;
await db.query(
  "insert into notes(project_id,title,body) values ($1,'Private note','Private content')",
  [p],
);
await db.query(
  "insert into task_comments(task_id,body) values ($1,'Private comment')",
  [t],
);
await db.query(
  "insert into attachments(path,name,mime,size,task_id) values ($1,'private.txt','text/plain',10,$2)",
  [`tasks/${t}/file.txt`, t],
);
await db.query(
  "insert into storage.objects(bucket_id,name) values ('workspace',$1)",
  [`tasks/${t}/file.txt`],
);
await login(admin);
const c = (
  await first("insert into channels(name) values ('private-chat') returning id")
).id;
await login(excluded);
const m = (
  await first(
    "insert into messages(channel_id,body) values ($1,'Private message') returning id",
    [c],
  )
).id;
await db.query(
  "insert into attachments(path,name,mime,size,channel_id,message_id) values ($1,'chat.txt','text/plain',10,$2,$3)",
  [`channels/${c}/file.txt`, c, m],
);
await db.query(
  "insert into storage.objects(bucket_id,name) values ('workspace',$1)",
  [`channels/${c}/file.txt`],
);
await login(admin);
await db.query(
  "insert into task_comments(task_id,body) values ($1,'A notification before hiding')",
  [t],
);
await db.query("update projects set visible_to=$2 where id=$1", [p, [allowed]]);
await db.query("update channels set visible_to=$2 where id=$1", [c, [allowed]]);
await assert.rejects(
  () =>
    db.query("update projects set visible_to=$2 where id=$1", [
      p,
      ["unknown@example.test"],
    ]),
  /existing team members/,
);
await assert.rejects(
  () => db.query("update projects set visible_to=array[null] where id=$1", [p]),
  /existing team members/,
);
await login(excluded);
for (const [table, clause, args] of [
  ["projects", "where id=$1", [p]],
  ["channels", "where id=$1", [c]],
  ["tasks", "where project_id=$1", [p]],
  ["notes", "where project_id=$1", [p]],
  ["messages", "where channel_id=$1", [c]],
  ["task_comments", "where task_id=$1", [t]],
  ["task_activity", "where task_id=$1", [t]],
  ["attachments", "", []],
  ["storage.objects", "", []],
  ["notifications", "where project_id=$1", [p]],
])
  assert.equal(
    await count(table, clause, args),
    0,
    `${table} must hide restricted content`,
  );
assert.equal(await count("projects", "where id=$1", [p2]), 1);
await assert.rejects(
  () =>
    db.query("insert into tasks(project_id,title) values ($1,'Forbidden')", [
      p,
    ]),
  /row-level security|Unknown project status/,
);
await assert.rejects(
  () =>
    db.query("insert into notes(project_id,title) values ($1,'Forbidden')", [
      p,
    ]),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query("insert into messages(channel_id,body) values ($1,'Forbidden')", [
      c,
    ]),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into task_comments(task_id,body) values ($1,'Forbidden')",
      [t],
    ),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into task_dependencies(task_id,blocked_by) values ($1,$2)",
      [t2, t],
    ),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into storage.objects(bucket_id,name) values ('workspace',$1)",
      [`tasks/${t}/new.txt`],
    ),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into storage.objects(bucket_id,name) values ('workspace','tasks/invalid/file.txt')",
    ),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into attachments(path,name,mime,size,task_id) values ($1,'forged.txt','text/plain',10,$2)",
      [`tasks/${t}/forged.txt`, t2],
    ),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query("select _member_resource_access('project',$1,$2)", [p, allowed]),
  /permission denied/,
);
assert.equal(
  (
    await db.query(
      "update tasks set title='Forbidden' where id=$1 returning id",
      [t],
    )
  ).rows.length,
  0,
);
assert.equal(
  (
    await db.query(
      "update messages set body='Forbidden' where id=$1 returning id",
      [m],
    )
  ).rows.length,
  0,
);
assert.equal(
  (await db.query("delete from storage.objects returning id")).rows.length,
  0,
);
await assert.rejects(
  () =>
    db.query("select save_project_status($1,null,'Forbidden','#123456')", [p]),
  /Unknown project status/,
);
await login(allowed);
assert.equal(await count("projects", "where id=$1", [p]), 1);
assert.equal(await count("messages", "where id=$1", [m]), 1);
assert.equal(await count("attachments"), 2);
assert.equal(await count("storage.objects"), 2);
await db.query(
  "insert into storage.objects(bucket_id,name) values ('workspace',$1)",
  [`tasks/${t}/allowed.txt`],
);
await db.query(
  "select save_project_status($1,null,'Allowed custom status','#123456')",
  [p],
);
await assert.rejects(
  () => db.query("update projects set visible_to=null where id=$1", [p]),
  /Only admins/,
);
await login(admin);
await db.query(
  "insert into task_comments(task_id,body) values ($1,'Notification after hiding')",
  [t],
);
const mentionedMessage = await first(
  "insert into messages(channel_id,body) values ($1,$2) returning id",
  [c, `Hello @[Allowed](${allowed}) and @[Excluded](${excluded})`],
);
await db.exec("reset role");
assert.equal(
  await count(
    "notifications",
    "where recipient=$1 and preview like '%Notification after hiding%'",
    [excluded],
  ),
  0,
);
assert.equal(
  await count(
    "notifications",
    "where recipient=$1 and preview like '%Notification after hiding%'",
    [allowed],
  ),
  1,
);
assert.equal(
  await count("notifications", "where recipient=$1 and message_id=$2", [
    allowed,
    mentionedMessage.id,
  ]),
  1,
);
assert.equal(
  await count("notifications", "where recipient=$1 and message_id=$2", [
    excluded,
    mentionedMessage.id,
  ]),
  0,
);
await login(admin);
await db.query("update projects set visible_to='{}' where id=$1", [p]);
assert.equal(await count("tasks", "where id=$1", [t]), 1);
await login(allowed);
assert.equal(await count("tasks", "where id=$1", [t]), 0);
await login(admin);
await db.query("update projects set visible_to=null where id=$1", [p]);
await db.query("update channels set visible_to=null where id=$1", [c]);
await login(excluded);
assert.equal(await count("tasks", "where id=$1", [t]), 1);
assert.equal(await count("messages", "where id=$1", [m]), 1);
await login("outsider@example.test");
assert.equal(await count("projects"), 0);
assert.equal(await count("channels"), 0);
assert.equal(await count("storage.objects"), 0);
await db.exec("set role anon");
await assert.rejects(
  () => db.query("select can_access_project($1)", [p]),
  /permission denied/,
);
await db.exec("reset role");
await db.exec(
  await fs.readFile(
    "supabase/migrations/20261019000000_project_invoices.sql",
    "utf8",
  ),
);
await login(admin);
await db.query(
  "insert into project_billing(project_id,details) values ($1,$2)",
  [p, JSON.stringify({ client: "Private client" })],
);
const reservationId = "00000000-0000-4000-8000-000000000111";
await db.query(
  "insert into project_invoices(id,project_id,share_id,invoice_number,fingerprint,task_ids) values ($1,$2,$3,'TEST','hash',$4)",
  [reservationId, p, "A".repeat(24), [t]],
);
await assert.rejects(
  () =>
    db.query(
      "insert into project_invoices(id,project_id,share_id,invoice_number,fingerprint,task_ids) values (gen_random_uuid(),$1,$2,'TEST','hash',$3)",
      [p, "B".repeat(24), [t]],
    ),
  /already included/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into project_invoices(id,project_id,share_id,invoice_number,fingerprint,task_ids) values (gen_random_uuid(),$1,$2,'TEST','hash',$3)",
      [p, "B".repeat(24), [t2]],
    ),
  /must belong/,
);
await db.query("update project_invoices set state='saved' where id=$1", [
  reservationId,
]);
await login(allowed);
assert.equal(await count("project_billing"), 0);
assert.equal(await count("project_invoices"), 0);
await assert.rejects(
  () => db.query("insert into project_billing(project_id) values ($1)", [p2]),
  /row-level security/,
);
await assert.rejects(
  () =>
    db.query(
      "insert into project_invoices(id,project_id,share_id,invoice_number,fingerprint,task_ids) values (gen_random_uuid(),$1,$2,'TEST','hash',$3)",
      [p, "C".repeat(24), [t]],
    ),
  /Only admins/,
);
// Exercise assignment, mention and comment delivery as separate signed-in users.
await login(admin);
const notificationTask = (await first(
  "insert into tasks(project_id,title,assignees) values ($1,'Notification checks',$2) returning id",
  [p2, [allowed, admin]],
)).id;
await login(allowed);
assert.equal(await count("notifications", "where task_id=$1 and kind='assigned'", [notificationTask]), 1);
await login(admin);
assert.equal(await count("notifications", "where task_id=$1", [notificationTask]), 0);
await db.query("update tasks set title='Updated title' where id=$1", [notificationTask]);
await db.query("update tasks set details=$2 where id=$1", [notificationTask, `Please check @[Allowed](${allowed})`]);
await db.query("insert into task_comments(task_id,body) values ($1,$2)", [notificationTask, `Hi @[Allowed](${allowed})`]);
await db.query("insert into task_comments(task_id,body) values ($1,'A follow-up')", [notificationTask]);
await login(allowed);
assert.equal(await count("notifications", "where task_id=$1 and kind='assigned'", [notificationTask]), 1);
assert.equal(await count("notifications", "where task_id=$1 and kind='mention'", [notificationTask]), 2);
assert.equal(await count("notifications", "where task_id=$1 and kind='comment'", [notificationTask]), 1);
await db.query("update notifications set read_at=now() where task_id=$1", [notificationTask]);
assert.equal(await count("notifications", "where task_id=$1 and read_at is null", [notificationTask]), 0);
// A member can start a DM; the same pair reuses it in either direction.
await login(allowed);
const dm = (await first("select start_direct_message($1) as id", [excluded])).id;
await assert.rejects(() => db.query("select start_direct_message($1)", [allowed]), /Choose another/);
await assert.rejects(() => db.query("select start_direct_message($1)", ["nobody@example.test"]), /Choose another/);
await assert.rejects(() => db.query("insert into channels(name,direct_members) values ('forged',$1)", [[allowed, admin]]), /Use the private conversation functions/);
const dmMessage = (await first("insert into messages(channel_id,body) values ($1,'Private hello') returning id", [dm])).id;
await db.query("insert into storage.objects(bucket_id,name) values ('workspace',$1)", [`channels/${dm}/dm.txt`]);
await login(excluded);
assert.equal((await first("select start_direct_message($1) as id", [allowed])).id, dm);
assert.equal(await count("messages", "where id=$1", [dmMessage]), 1);
assert.equal(await count("notifications", "where channel_id=$1 and kind='direct'", [dm]), 1);
assert.equal((await db.query("update channels set direct_members=null where id=$1 returning id", [dm])).rows.length, 0);
await login(admin);
assert.equal(await count("channels", "where id=$1", [dm]), 0);
assert.equal(await count("messages", "where id=$1", [dmMessage]), 0);
assert.equal(await count("storage.objects", "where name=$1", [`channels/${dm}/dm.txt`]), 0);
assert.equal((await first("select can_access_channel($1) as allowed", [dm])).allowed, false);
await assert.rejects(() => db.query("insert into messages(channel_id,body) values ($1,'Intrusion')", [dm]), /row-level security/);
// Time tracking is an admin-controlled project feature, with own-log editing.
await login(allowed);
await assert.rejects(()=>db.query("update projects set time_tracking_enabled=true where id=$1",[p2]),/Only admins/);
await assert.rejects(()=>db.query("insert into task_time_logs(task_id,work_date,minutes,note) values ($1,'2026-10-13',90,'Work')",[t2]),/row-level security/);
await login(admin);
await db.query("update projects set time_tracking_enabled=true where id=$1",[p2]);
await login(allowed);
const logId=(await first("insert into task_time_logs(task_id,work_date,minutes,note) values ($1,'2026-10-13',90,'Work') returning id",[t2])).id;
await db.query("update task_time_logs set minutes=120 where id=$1",[logId]);
assert.equal(await count("task_activity", "where task_id=$1 and kind='time_logged'", [t2]), 1);
assert.equal(await count("task_activity", "where task_id=$1 and kind='time_updated'", [t2]), 1);
assert.equal(Number((await first("select minutes from project_time_totals($1) where task_id=$2",[p2,t2])).minutes),120);
await assert.rejects(()=>db.query("update task_time_logs set author=$2 where id=$1",[logId,excluded]),/permission denied/);
await login(excluded);
assert.equal(await count("task_time_logs","where id=$1",[logId]),1);
assert.equal((await db.query("update task_time_logs set minutes=1 where id=$1 returning id",[logId])).rows.length,0);
assert.equal((await db.query("delete from task_time_logs where id=$1 returning id",[logId])).rows.length,0);
await login(admin);
await db.query("update projects set visible_to=$2 where id=$1",[p2,[allowed]]);
await login(excluded);
assert.equal(await count("task_time_logs","where id=$1",[logId]),0);
await login(admin);
await db.query("update projects set time_tracking_enabled=false where id=$1",[p2]);
await login(allowed);
assert.equal(await count("task_time_logs","where id=$1",[logId]),1);
assert.equal((await db.query("update task_time_logs set minutes=1 where id=$1 returning id",[logId])).rows.length,0);
await assert.rejects(()=>db.query("insert into task_time_logs(task_id,work_date,minutes,note) values ($1,'2026-10-14',10,'More work')",[t2]),/row-level security/);
await login(admin);
await db.exec("reset role");
await db.exec(await fs.readFile("supabase/migrations/20261022000000_time_log_activity.sql", "utf8"));
await login(admin);
assert.equal(await count("task_activity", "where task_id=$1 and kind='time_logged'", [t2]), 1);
await db.query("update projects set time_tracking_enabled=true where id=$1",[p2]);
await db.query("delete from task_time_logs where id=$1",[logId]);
assert.equal(await count("task_activity", "where task_id=$1 and kind='time_deleted'", [t2]), 1);
assert.equal((await db.query("select * from project_time_totals($1) where task_id=$2",[p2,t2])).rows.length,0);
await login(allowed);
const groupId=(await first("select start_private_conversation($1) as id",[[admin,excluded]])).id;
assert.notEqual(groupId,dm);
assert.equal((await first("select start_private_conversation($1) as id",[[excluded,admin]])).id,groupId);
await assert.rejects(()=>db.query("select start_private_conversation($1)",[[admin,excluded,allowed,admin,excluded]]),/five people/);
await login(admin);
const deleteParent=(await first("insert into tasks(project_id,title) values ($1,'Delete parent') returning id",[p2])).id;
const deleteChild=(await first("insert into tasks(project_id,title,parent_id) values ($1,'Delete child',$2) returning id",[p2,deleteParent])).id;
await db.query("insert into task_time_logs(task_id,work_date,minutes,note) values ($1,'2026-10-14',30,'Child work')",[deleteChild]);
await db.query("insert into task_comments(task_id,body) values ($1,'Child comment')",[deleteChild]);
await db.query("delete from tasks where id=$1",[deleteParent]);
assert.equal(await count("tasks","where id=$1 or id=$2",[deleteParent,deleteChild]),0);
await login(admin);
await assert.rejects(()=>db.query("select add_conversation_members($1,$2)",[dm,[admin]]),/not available/);
await assert.rejects(()=>db.query("select delete_private_conversation($1)",[dm]),/not available/);
await login(allowed);
assert.equal((await first("select add_conversation_members($1,$2) as id",[dm,[admin]])).id,dm);
await login(admin);
assert.equal(await count("messages","where id=$1",[dmMessage]),1);
assert.equal((await first("select delete_private_conversation($1) as removed",[dm])).removed,true);
assert.equal(await count("channels","where id=$1",[dm]),0);
assert.equal(await count("messages","where id=$1",[dmMessage]),0);
await db.close();
console.log(
  "PASS: full migrations and rerun; public defaults; admin-only controls; project/chat/content/file isolation; forged paths; notifications; custom statuses; revocation and restoration; outsider denial.",
);
