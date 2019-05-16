// @flow
import firebase from "react-native-firebase";
// Optional flow type
import type { RemoteMessage } from "react-native-firebase";

export default async (message: RemoteMessage) => {
  const notificationData = new firebase.notifications.Notification()
    .setNotificationId(message.messageId)
    .setTitle(message.data.title)
    .setBody(message.data.body)
    .setData({
      key1: "value1",
      key2: "value2"
    });
  notificationData.android.setChannelId("test-channel");
  firebase.notifications().displayNotification(notificationData);

  return Promise.resolve();
};
