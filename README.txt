AC WORKS - Firebase Booking + Owner Admin v3

PUBLIC WEBSITE
Same GitHub Pages URL can be used by customers and Nabi.
- Customer who is not signed in sees the customer booking website.
- Nabi signs in through Owner Login.
- Firebase Auth keeps Nabi signed in on that device by default, so later visits to the same URL can open the Admin dashboard automatically.

IMPORTANT FIREBASE SETUP
1. Firebase Console -> Authentication -> Sign-in method -> enable Email/Password.
2. Authentication -> Users -> Add user. Create Nabi's owner email/password.
3. For stronger production security, restrict Realtime Database admin reads/updates to the owner's UID/email in database.rules.json before launch.
4. Realtime Database is currently intended for testing; do not leave broad test-mode rules in production.

PUSH NOTIFICATIONS
- The website includes Firebase Cloud Messaging files.
- In Firebase Console -> Project settings -> Cloud Messaging -> Web configuration, create a Web Push certificate/key pair and put the public VAPID key into app.js as VAPID_KEY.
- Nabi must open the Admin dashboard on an HTTPS URL and press Enable Notifications, then allow browser notifications.
- Deploy the functions folder with Firebase CLI for automatic notifications when a new booking is created.

GITHUB PAGES
Upload the CONTENTS of this folder to the root of the GitHub repository. Do not upload the outer folder itself.

FIREBASE FUNCTIONS
From this folder:
  cd functions
  npm install
  firebase deploy --only functions

If Firebase CLI is not installed/configured, install it and sign in with the Google account that owns the AC WORKS Firebase project.
