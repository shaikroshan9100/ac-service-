AC WORKS - Customer + Nabi Admin v4

WHAT THIS VERSION DOES
- Same GitHub Pages URL for everyone.
- Customers create/sign in with an email + password.
- Customer bookings require customer login and are saved to Firebase under that customer UID.
- Customer bookings are also cached on the customer's phone in localStorage.
- Nabi signs in with a separate Firebase email + password account.
- Nabi's role is checked from /users/<uid>/role == "admin" before admin access is allowed.
- Nabi's dashboard reads cloud bookings in real time and caches a copy on his device.
- Customer status changes are synchronized to the customer's device.
- Admin actions: Confirm, Assign Nabi, On The Way, Complete, Cancel, Call, WhatsApp.
- Same URL automatically opens Admin for an authenticated admin account; customer accounts return to the customer home.
- Push notification files and Cloud Function are included.

FIREBASE ONE-TIME SETUP
1. Firebase Console -> Authentication -> Sign-in method -> enable Email/Password.
2. Authentication -> Users -> Add user. Create Nabi's owner account.
3. In Realtime Database, create /users/<NABI_UID> with:
   { "role": "admin", "name": "Nabi Rasool", "email": "NABI_EMAIL" }
   IMPORTANT: Do this in Firebase Console after creating Nabi's user. Do not let the client create an admin role.
4. Deploy the included database.rules.json so only admins can read all bookings and customers can read only their own userBookings.
5. Remove any old Test Mode/open rules before public use.

CUSTOMER SETUP
- Customer uses Customer Login -> Create Customer Account.
- Customer enters name, email and password (6+ characters).
- The account is created with role "customer".
- Then the customer can book services.

PUSH NOTIFICATIONS FOR NABI
1. Firebase Console -> Project settings -> Cloud Messaging -> Web Push certificates -> Generate key pair.
2. Copy the PUBLIC VAPID key into app.js:
   const VAPID_KEY='PASTE_PUBLIC_VAPID_KEY_HERE';
3. Nabi opens the HTTPS GitHub Pages site, logs in, and presses Enable Notifications.
4. Deploy the functions folder from a machine logged into the Firebase project:
   firebase login
   firebase use ac-works-c1cbf
   cd functions
   npm install
   cd ..
   firebase deploy --only functions
5. Background push notifications require HTTPS and browser notification permission.

GITHUB PAGES
Upload the CONTENTS of this folder to the root of the ac-service- repository. Do not upload the outer folder.

IMPORTANT
- The Firebase web config in the frontend is not a password, but never publish Google passwords, OTPs, service-account keys or private VAPID keys.
- Test all flows before public launch.
