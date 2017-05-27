const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp(functions.config().firebase);

exports.sendMessageNotification = functions.database.ref('/messages/{messageId}').onWrite(event => {
  const messageId = event.params.messageId;
  const message = event.data.val();

  admin.database().ref('users/' + message.fromId).once('value', function(snapshot) {
    const fromUser = snapshot.val();

    admin.database().ref('users/' + message.toId).once('value', function(snapshot) {
      const toUser = snapshot.val();

      var text = ''

      if (message.imageUrl == undefined) {
        text = message.text
      } else {
        text = '對方傳送一張圖片'
      }

      const payload = {
        notification: {
          title: fromUser.name,
          body: text,
          sound: 'default'
        },
        data: {
          user_id: message.fromId,
          user_name: fromUser.name,
          user_email: fromUser.email,
          user_image: fromUser.profileImageUrl
        }
      };

      admin.messaging().sendToDevice(toUser.registrationId, payload)
        .then(function(response) {
          console.log('Successfully sent message: ', response);
        })
        .catch(function(error) {
          console.log('Error sending message: ', error);
      });
    });
  });
});
