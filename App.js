/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity
} from "react-native";
import { Button, Container, Content, Card, CardItem } from "native-base";
import firebase from "react-native-firebase";
import type { RemoteMessage } from "react-native-firebase";
import axios from "axios";

const localDB = axios.create({
  baseURL: "http://192.168.1.128:3333",
  timeout: 1000,
  headers: { "Content-Type": "application/json" }
});

const firebaseAPI = axios.create({
  baseURL: "https://fcm.googleapis.com/fcm",
  timeout: 1000,
  headers: {
    Authorization:
      "key=AAAAwIc77NY:APA91bGw-BDKM4qG7a3BeWWiG_4iv1wYVqoDbcxaLbZ11HDidtznpBiocmTsusfzzkhzQFR_YNORJcrhFUsTKDXr_Qcneov6rvFcFMrKQJYfGVUterQo5m8FCBJp9stR_Ix3sLgCeMVU",
    "Content-Type": "application/json"
  }
});

type Props = {};
export default class App extends Component<Props> {
  constructor(props) {
    super(props);

    this.state = {
      tokens: []
    };
  }

  async componentDidMount() {
    this.checkPermission();
    this.checkToken();
    this.createNotificationListener();
    this.createNotificationOpenedListener();
  }
  render() {
    localDB.get("/tokenData").then(res => {
      const tokens = res.data.data;
      this.setState({
        tokens: tokens
      });
    });
    return (
      <Container>
        <Content>
          <View
            style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
          >
            <Text style={{ fontSize: 24 }}>Notification App</Text>
            <Text>Select Recipient:</Text>
            <FlatList
              style={{ margin: 12, width: 330 }}
              data={this.state.tokens}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={this.callFCM.bind(this, item.token)}>
                  <Card>
                    <CardItem>
                      <Text style={{ fontSize: 18 }}>{item.name}</Text>
                    </CardItem>
                    <CardItem>
                      <Text style={{ fontSize: 14 }}>{item.token}</Text>
                    </CardItem>
                  </Card>
                </TouchableOpacity>
              )}
            />
          </View>
        </Content>
      </Container>
    );
  }
  async componentWillUnmount() {
    this.createNotificationListener();
    this.createNotificationOpenedListener();
  }

  async callFCM(token) {
    await firebaseAPI
      .post("/send", {
        to: token,
        data: { title: "Notification Arrived", body: "congrats" },
        priority: "high"
      })
      .then(res => {
        if (res.data.failure > 0) {
          alert("Failed to send notification");
        }
        if (res.data.success > 0) {
          alert("Notificaton sent!");
        }
      });
  }

  async createNotificationListener() {
    this.messageListener = firebase
      .messaging()
      .onMessage((message: RemoteMessage) => {
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
        console.log("onNotification:");
        console.log(message);
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
    const today = new Date();
    const date = "-on-" + today.getTime();
    // today.getFullYear() +
    // (today.getMonth() + 1) +
    // today.getDate() +
    // today.getHours() +
    // today.getMinutes() +
    // today.getSeconds();
    const fcmToken = await firebase.messaging().getToken();
    await localDB.get("/tokenData/" + fcmToken).then(res => {
      if (res.data.data == null) {
        localDB
          .post("/tokenData", {
            name: "device" + date,
            token: fcmToken
          })
          .then(console.log("success update"));
      }
    });
    if (fcmToken) {
      console.log("token:", fcmToken);
    } else {
      console.log("retrying...");
      await firebase.messaging().getToken();
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
