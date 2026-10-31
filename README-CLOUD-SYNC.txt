LIFE ETERNAL QUEST — MULTI-DEVICE CLOUD SYNC
============================================

This is an installable web app (PWA) with Supabase email/password sign-in.
Use the SAME email and password on every phone. Each device has its own browser
session; sign in separately on each device.

IMPORTANT: The app is not connected to a cloud project until YOU create one
and add its Project URL and anon/public key to cloud-sync.js. Do not share your
service_role key. The anon key is intended for browser use; database access is
protected by the included row-level security policies.

PART A — CREATE YOUR PRIVATE CLOUD DATABASE
-------------------------------------------
1. Go to https://supabase.com/ and create an account/project.
2. Choose a strong database password and keep it private.
3. In the project dashboard open Project Settings > API (or API Keys).
4. Copy the Project URL and the anon/public key (NOT service_role/secret).
5. Open cloud-sync.js in a text editor.
6. Replace PASTE_YOUR_SUPABASE_PROJECT_URL_HERE with your Project URL.
7. Replace PASTE_YOUR_SUPABASE_ANON_KEY_HERE with your anon/public key.
8. Save cloud-sync.js.
9. In Supabase open SQL Editor > New query.
10. Paste the complete contents of supabase.sql and click Run.
11. In Authentication > URL Configuration, add your final HTTPS app URL to
    Site URL and Redirect URLs. If you change hosting domain, update this.
12. For easiest first setup, leave email confirmation enabled and confirm the
    verification email after creating the account. You can configure this in
    Authentication > Providers > Email.

PART B — HOST IT YOURSELF (EASY OPTION: NETLIFY)
------------------------------------------------
1. Extract this ZIP on your computer. You should see index.html,
   cloud-sync.js, supabase.sql, manifest.webmanifest, sw.js and both icons.
2. After editing cloud-sync.js with your Supabase values, open
   https://app.netlify.com/drop in your browser.
3. Sign in/create a Netlify account and drag the extracted app folder onto
   the deploy area (or use the site's manual deploy option).
4. Netlify will give you an HTTPS address. Open it and test the app.
5. Add that exact HTTPS address in Supabase Authentication > URL Configuration.
6. Keep the folder and a copy of this ZIP as your source/backup.

Alternative: GitHub Pages. Create a repository, upload the extracted files to
its root, enable Pages under repository Settings > Pages, and use the HTTPS
Pages URL in Supabase Authentication URL Configuration.

PART C — SIGN IN ON ALL PHONES
------------------------------
1. Open the published HTTPS URL on Phone 1.
2. Create ONE account with your email and a strong password.
3. If email confirmation is enabled, confirm it, then sign in.
4. On every other phone, open the exact same URL and sign in with the SAME
   email/password. Do not create a second account.
5. Android: browser menu > Install app / Add to Home screen.
   iPhone: Safari Share > Add to Home Screen.

SYNC NOTES
----------
- Daily body metrics, workouts, spiritual check-ins and goals are synced as
  the app's account data record.
- Updates are uploaded after a short debounce and broadcast to other signed-in
  devices. A device may need a refresh if it was offline during a change.
- This version uses a single shared account and a last-write-wins whole-record
  sync model. Avoid editing the same tracker on two phones at the exact same
  moment; the latest saved copy can replace an earlier simultaneous edit.
- Export a JSON backup from the app before connecting an existing local tracker.
  If the cloud record already exists, it is treated as the source of truth on
  a newly connected device and replaces that device's local copy.
- Browser storage is device-specific. Cloud sync requires internet. Do not
  clear browser site data unless you have confirmed your cloud copy/backup.

SECURITY
--------
- Never put the Supabase service_role key in cloud-sync.js.
- Keep your email/password private and use a unique strong password.
- The SQL enables row-level security so authenticated users can access only
  their own account row.
- Anyone who can sign in to your shared account can see and change its tracker.

FILES
-----
index.html                 Tracker app
cloud-sync.js              Supabase login + realtime sync
supabase.sql               Private table, RLS policies and realtime publication
manifest.webmanifest       Install metadata
sw.js                      Offline app shell cache
icon-192.png / icon-512.png App icons
