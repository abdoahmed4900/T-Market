const { db } = require("../config/firebase");
const webpush = require("web-push");


 subscribeToNotifications = async (req, res) => {
  const { userId, deviceId, endpoint, keys, deviceType, userAgent } = req.body;
  
   const userRef = db.collection("users").doc(userId);

   const newSub = {
    deviceId,
    endpoint,
    keys,
    deviceType,
    userAgent,
    createdAt: new Date(),
  };

  if (!endpoint || !keys?.p256dh || !keys?.auth) {
    return res.status(400).json({ error: "Invalid subscription data" });
  }

   await db.runTransaction(async (tx) => {
    const snap = await tx.get(userRef);

    const subs = snap.data().subscriptions || [];

    const filtered = subs.filter(s => s.deviceId !== deviceId);

    filtered.push(newSub);

    tx.update(userRef, { subscriptions: filtered });
  });

  res.status(201).json({ message: "Subscription saved" });
 }

 getNotificationKey = async (req,res) => {
    return res.status(200).json({ publicKey: process.env.publicKey });
 }

sendNotification = async (req, res) => {
    console.log('entered func');
    
    const { message,userId } = req.body;
    const userSnap = await db.collection("users").doc(userId).get();
    let allSubs = userSnap.data().subscriptions || []

    const notificationPayload = {
        "notification": {
            "title": "VoltTech",
            "body": message,
            "icon": "https://static.vecteezy.com/system/resources/previews/025/638/528/non_2x/simple-notification-icon-the-icon-can-be-used-for-websites-print-templates-presentation-templates-illustrations-etc-free-vector.jpg",
            "badge": "https://static.thenounproject.com/png/1304336-200.png",
            "vibrate": [100, 50, 100],
            "data": {
                "dateOfArrival": Date.now(),
                "url": "http://localhost:4200",
                "primaryKey": 1
            },
            "actions": [
              {
                "action": "open",
                "title": "Open App"
              },
              {
                "action": "dismiss",
                "title": "Dismiss"
              }
          ]
        }
    };

    allSubs.map(async sub => {
        try {
          await webpush.sendNotification(sub, JSON.stringify(notificationPayload));
        } catch(err) {
          console.log(err);
          if (err.statusCode === 410 || err.statusCode === 404) {
            return null;
          }
          return sub;
        }
      }
    )
    allSubs = allSubs.filter(Boolean);

    await db.collection("users").doc(userId).update({subscriptions : allSubs});
    console.log('notifcation is sent');
    
    return res.status(200).json({ message: "Notifications sent" });
}

module.exports = { sendNotification, subscribeToNotifications, getNotificationKey};
