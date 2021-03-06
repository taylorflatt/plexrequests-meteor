Meteor.methods({
  sendNotifications: function (request) {
    check(request, Object);

    var settings = Settings.find().fetch()[0];
    var type = (request.media_type === 'tv') ? 'TV Show' : 'Movie';
    var message = Meteor.call(
      "setTestVARS",
      settings.customNotificationTITLE,
      settings.customNotificationTEXT,
      request
    );

    if (request.notification_type === 'request') {
      if (settings.pushbulletENABLED) {
        Meteor.call("sendPushbulletNotification", settings, message.title, message.body)
      }
      if (settings.pushoverENABLED) {
        Meteor.call("sendPushoverNotification", settings, message.title, message.body)
      }
      if (settings.slackENABLED) {
        Meteor.call("sendSlackNotification", settings, message.title + ":\n" + message.body)
      }

      if (settings.iftttENABLED){
        try {
          Meteor.call("sendIFTTT", settings, request)

        } catch (error) {
          console.log(error);
        }
      }
    } else {
      if (settings.pushbulletENABLED) {
        Meteor.call(
          "sendPushbulletNotification",
          settings,
          'Plex Requests ' + type + ' Issue',
          request.title + ' Issues: ' + request.issues.toString() + ' (' + request.user + ')'
        )
      }
      if (settings.pushoverENABLED) {
        Meteor.call(
          "sendPushoverNotification",
          settings,
          'Plex Requests ' + type + ' Issue',
          request.title + ' Issues: ' + request.issues.toString() + ' (' + request.user + ')'
        )
      }
      if (settings.slackENABLED) {
        Meteor.call(
          "sendSlackNotification",
          settings,
          request.title + ' Issues: ' + request.issues.toString() + ' (' + request.user + ')'
        )
      }
      if (settings.iftttENABLED){
        request["notification_type"] = "issue";
        console.log("IFTTT: Attempting to send...");
        Meteor.call("sendIFTTT", settings, request)
      }
    }
  }
});
