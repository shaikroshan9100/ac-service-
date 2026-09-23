/* Firebase Cloud Messaging service worker for AC WORKS.
   Add the same firebaseConfig values as in app.js before using background push. */
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/12.19.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyB4KfsauDGiLCxnWVKZ8bM-zLaJZn9Qoq0',
  authDomain: 'ac-works-c1cbf.firebaseapp.com',
  projectId: 'ac-works-c1cbf',
  storageBucket: 'ac-works-c1cbf.firebasestorage.app',
  messagingSenderId: '42938457253',
  appId: '1:42938457253:web:84f1e83d75af8284d2414c',
  measurementId: 'G-358V7JQGMJ'
});

const messaging = firebase.messaging();
messaging.onBackgroundMessage(payload => {
  const title = payload.notification?.title || 'AC WORKS - New Booking';
  const options = {
    body: payload.notification?.body || 'A new AC service booking has arrived.',
    icon: 'ac-works-poster.png',
    badge: 'ac-works-poster.png',
    data: payload.data || {}
  };
  self.registration.showNotification(title, options);
});
