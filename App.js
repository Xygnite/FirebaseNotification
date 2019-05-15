/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Platform, StyleSheet, Text, View } from "react-native";
import firebase from "react-native-firebase";
import type { RemoteMessage } from "react-native-firebase";

type Props = {};
export default class App extends Component<Props> {
  async componentDidMount() {
    this.checkPermission();
    this.checkToken();
    this.createNotificationListener();
    this.createNotificationOpenedListener();
  }
  render() {
    const fcmToken = firebase.messaging().getToken();
    return null;
  }

  async componentWillUnmount() {
    this.notificationListener();
    this.notificationOpenedListener();
  }

  async createNotificationListener() {
    this.notificationListener = firebase
      .notifications()
      .onNotification(notification => {
        const { title, body, notificationId } = notification;

        const notificationData = new firebase.notifications.Notification()
          .setNotificationId(notificationId)
          .setTitle(title)
          .setBody(body)
          .setData({
            key1: "value1",
            key2: "value2"
          });
        notificationData.android.setChannelId("test-channel");
        firebase.notifications().displayNotification(notificationData);
        console.log("onNotification:");
        console.log(notification);
      });
  }

  async createNotificationOpenedListener() {
    this.notificationOpenedListener = firebase
      .notifications()
      .onNotificationOpened((notificationOpen: NotificationOpen) => {
        // Get the action triggered by the notification being opened
        const action = notificationOpen.action;
        // Get information about the notification that was opened
        const notification: Notification = notificationOpen.notification;
      });
  }

  async checkPermission() {
    const enabled = await firebase.messaging().hasPermission();
    if (enabled) {
      console.log("permission granted!");
    } else {
      this.requestPermission();
    }
  }

  async requestPermission() {
    try {
      await firebase.messaging().requestPermission();
      console.log("Authorized!");
    } catch (error) {
      this.requestPermission();
    }
  }

  async checkToken() {
    const fcmToken = await firebase.messaging().getToken();
    if (fcmToken) {
      console.log("token:", fcmToken);
    } else {
      console.log("retrying...");
      firebase.messaging().getToken();
    }
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5FCFF"
  },
  welcome: {
    fontSize: 20,
    textAlign: "center",
    margin: 10
  },
  instructions: {
    textAlign: "center",
    color: "#333333",
    marginBottom: 5
  }
});
