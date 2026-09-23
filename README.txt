AC WORKS - Firebase Booking + Owner Admin

Business
Owner: Nabi Rasool
Phone/WhatsApp: 9505225027
Service model: online doorstep service
Hours: 10:00 AM - 10:00 PM
Payment: Cash, UPI, Card, Online Payment

Included
- Customer booking form
- Firebase Realtime Database cloud bookings
- Customer local booking history
- Secure Firebase Email/Password owner login
- Real-time owner admin dashboard
- Booking status controls
- Assign Nabi / On Way / Complete / Cancel
- Call and WhatsApp customer buttons
- PWA for Android/iPhone
- Browser notification support while admin dashboard is open
- Firebase Cloud Messaging background notification code included
- Firebase Cloud Function included to send push notifications to registered admin devices
- Database security rules included

Important setup
1. In Firebase Console -> Authentication -> Sign-in method, enable Email/Password.
2. Create the owner's email/password account. Use that account in Owner Login.
3. In Firebase Console -> Realtime Database -> Rules, use database.rules.json (deploy with Firebase CLI, or paste the rules carefully).
4. For push notifications when the admin app is closed, create a Web Push certificate key (VAPID key) in Firebase Project Settings -> Cloud Messaging -> Web configuration, then put the public key into VAPID_KEY in app.js. Also keep firebase-messaging-sw.js at the site root.
5. The included functions/ folder sends FCM notifications when a new booking is created. Deploying Cloud Functions requires Firebase CLI and a billing-enabled Firebase plan.
6. GitHub Pages is HTTPS and works for the PWA/push client.

Do not publish the database in open/test mode. Deploy database.rules.json before real customers use the app.
