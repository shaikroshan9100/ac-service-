const {onValueCreated} = require('firebase-functions/v2/database');
const {setGlobalOptions} = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp({databaseURL: 'https://ac-works-c1cbf-default-rtdb.asia-southeast1.firebasedatabase.app'});
setGlobalOptions({region: 'asia-southeast1'});

exports.notifyAdminOfBooking = onValueCreated('/bookings/{bookingId}', async (event) => {
  const b = event.data.val();
  if (!b) return;

  const snap = await admin.database().ref('/adminTokens').once('value');
  const tokens = Object.keys(snap.val() || {});
  if (!tokens.length) return;

  const message = {
    notification: {
      title: 'AC WORKS - New Booking',
      body: `${b.name || 'Customer'} booked ${b.service || 'AC service'} on ${b.date || ''}.`
    },
    data: {bookingId: String(b.id || event.params.bookingId), url: '/#admin'},
    tokens
  };

  const response = await admin.messaging().sendEachForMulticast(message);
  const invalid = [];
  response.responses.forEach((r, i) => {
    if (!r.success && r.error && [
      'messaging/registration-token-not-registered',
      'messaging/invalid-registration-token'
    ].includes(r.error.code)) invalid.push(tokens[i]);
  });
  if (invalid.length) {
    const updates = {};
    invalid.forEach(t => updates[t] = null);
    await admin.database().ref('/adminTokens').update(updates);
  }
});
