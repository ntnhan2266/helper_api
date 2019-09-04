const config = require('../configs/firebase-config');

const admin = require("firebase-admin");

admin.initializeApp({
  credential: admin.credential.cert(config),
  databaseURL: "https://smart-rabbit-aa1e6.firebaseio.com"
});