import React, { Component } from 'react';
import { View, Text, Picker, ActivityIndicator, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Hoshi } from 'react-native-textinput-effects';
import api from '../services/api';
import AsyncStorage from '@react-native-community/async-storage';
import { StackActions, NavigationActions } from 'react-navigation';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import firebase from 'react-native-firebase';
import axios from 'axios';


const chave = '';

export default class Login extends Component {

    static navigationOptions = { header: null };

    state = {
        lojas: [],
        usuario: '',
        senha: '',
        loja: '00',
        error: '',
    }

    getLojas = async () => {
        const response = await api.get(`/lojas/`);
        this.setState({ lojas: response.data });
    }

    async componentDidMount(){
        this.getLojas();
        this.checkPermission();
        this.createNotificationListeners();
    }

    componentWillUnmount() {
        this.notificationListener;
        this.notificationOpenedListener;
    }

    checkPermission = async () => {
        const enabled = await firebase.messaging().hasPermission();
        if (enabled) {
            this.getToken();
        } else {
            this.requestPermission();
        }
    }

    getToken = async () => {
        let fcmToken = await AsyncStorage.getItem('fcmToken');
        if (!fcmToken) {
            axios({
                method: 'post',
                url: `https://iid.googleapis.com/iid/v1/${fcmToken}/rel/topics/interessados`,
                data: {},
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `key=${chave}`,
                    'Content-Length': 0,
                },
            })
            .then((res) => {
                console.log(res);
            })
            .catch((error) => {
                console.log(error.response)
            });
            fcmToken = await firebase.messaging().getToken();
            if (fcmToken) {
                // user has a device token
                console.log('fcmToken:', fcmToken);
                await AsyncStorage.setItem('fcmToken', fcmToken);
            }
        }
        console.log('fcmToken:', fcmToken);
    }

    requestPermission = async () => {
        try {
            await firebase.messaging().requestPermission();
            // User has authorised
            this.getToken();
        } catch (error) {
            // User has rejected permissions
            console.log('permission rejected');
        }
    }

    createNotificationListeners = async () => {
        /*
        * Triggered when a particular notification has been received in foreground
        * */
        const channel = new firebase.notifications.Android.Channel('fcm_FirebaseNotifiction_default_channel', 'Projeto Teste', firebase.notifications.Android.Importance.High)
        .setDescription('Projeto Teste')
        firebase.notifications().android.createChannel(channel);

        this.notificationListener = firebase.notifications().onNotification((notification) => {
            const { title, body } = notification;
            console.log('onNotification:');

            const localNotification = new firebase.notifications.Notification({
                sound: 'default',
                show_in_foreground: true,
            })
            .setNotificationId(notification.notificationId)
            .setTitle(notification.title)
            .setBody(notification.body)
            .android.setChannelId('fcm_FirebaseNotifiction_default_channel') // e.g. the id you chose above
            .android.setSmallIcon('@drawable/icon_b') // create this icon in Android Studio
            .android.setColor('#000000') // you can set a color here
            .android.setPriority(firebase.notifications.Android.Priority.High);

            firebase.notifications()
            .displayNotification(localNotification)
            .catch(err => console.error(err));
        });


        /*
        * If your app is in background, you can listen for when a notification is clicked / tapped / opened as follows:
        * */
        this.notificationOpenedListener = firebase.notifications().onNotificationOpened((notificationOpen) => {
            const { title, body } = notificationOpen.notification;
            console.log('onNotificationOpened:');
            Alert.alert();
        });

        /*
        * If your app is closed, you can check if it was opened by a notification being clicked / tapped / opened as follows:
        * */
        const notificationOpen = await firebase.notifications().getInitialNotification();
        if (notificationOpen) {
            const { title, body } = notificationOpen.notification;
            console.log('getInitialNotification:');
            Alert.alert();
        }
        /*
        * Triggered for data only payload in foreground
        * */
        this.messageListener = firebase.messaging().onMessage((message) => {
            //process data message
            console.log("JSON.stringify:", JSON.stringify(message));
        });
    }

    login = async () => {
        try {
            const response = await api.post('/login/', { usuario: this.state.usuario, senha: this.state.senha, loja: this.state.loja });
            await AsyncStorage.setItem('token', response.data.token);
            const resetAction = StackActions.reset({
                index: 0,
                actions: [
                    NavigationActions.navigate({ routeName: 'Prevendas' }),
                ],
            });
            this.props.navigation.dispatch(resetAction);
        } catch(error) {
            this.setState({ error: error.response.data.message });
        }
    }

    render(){
        return(
            <KeyboardAwareScrollView style={{ flex: 1, backgroundColor: '#153e4d' }}>
                <View style={ styles.card }>
                    <Text style={ styles.title }>Entrar</Text>
                    <Hoshi
                        label={'Usuário'}
                        borderColor={'#153e4d'}
                        borderHeight={3}
                        inputPadding={16}
                        backgroundColor={'#fff'}
                        style={ styles.inputs }
                        onChangeText={(usuario) => this.setState({usuario})}
                        value={this.state.usuario}
                    />
                    <Hoshi
                        label={'Senha'}
                        borderColor={'#153e4d'}
                        borderHeight={3}
                        inputPadding={16}
                        backgroundColor={'#fff'}
                        style={ styles.inputs }
                        secureTextEntry={true}
                        onChangeText={(senha) => this.setState({senha})}
                        value={this.state.senha}
                    />
                    {
                        this.state.lojas != undefined ?
                            <View>
                                <Picker
                                style={styles.inputs}
                                onValueChange={(value) => {this.setState({ loja: value })}}
                                selectedValue={this.state.loja}>
                                    { this.state.lojas.map((loja) => 
                                        <Picker.Item key={loja.id} label={`${loja.id} - ${loja.nome}`} value={loja.id} />
                                    ) }
                                </Picker>
                            </View>
                        :
                            <View style={{ justifyContent: 'center' }}>
                                <ActivityIndicator size="large" color="#0000ff" />
                            </View>
                    }
                    <TouchableOpacity
                        style={ styles.button }
                        onPress={() => {this.login()}}
                    >
                        <Text style={{ textAlign: 'center', color: '#fff', fontWeight: 'bold', fontSize: 20, padding: 10 }}>Login</Text>
                    </TouchableOpacity>
                    {
                        this.state.error != '' ?
                            <Text style={{ textAlign: 'center', color: '#9b1c31', fontWeight: 'bold', fontSize: 20, padding: 10 }}>{this.state.error}</Text>
                        :
                            null
                    }
                </View>
            </KeyboardAwareScrollView>
        );
    }
}


const styles = StyleSheet.create({
    title: {
        fontSize: 25,
        textAlign: "center",
        margin: 30,
        fontWeight: "bold",
    },
    inputs: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
    },
    card: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: '#fff',
        borderRadius: 5,
    },
    button: {
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 20,
        marginRight: 20,
        backgroundColor: '#27a44f',
        borderRadius: 5
    },
});
