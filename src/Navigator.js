import React from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, DeviceEventEmitter } from 'react-native';
import { createAppContainer, createStackNavigator, createSwitchNavigator } from 'react-navigation';
import AsyncStorage from '@react-native-community/async-storage';
import { init, connect, addReceiveMessageListener } from "rongcloud-react-native-imlib";
import pinyin from 'pinyin';
import Config from "./config.json";
import LoginRigisterScreen from './pages/LoginRigister';
import TabNavigator from './TabNavigator';
import ForgetPwdScreen from './pages/ForgetPwd';
import ChatBoxScreen from './pages/ChatBox';
import UserInfoScreen from './pages/UserInfo';
import DataSettingScreen from './pages/DataSetting';
import AddFriendScreen from './pages/AddFriend';
import SettingScreen from './pages/Setting';
import SigninScreen from './pages/Signin';
import PersonalInfoScreen from './pages/PersonalInfo';
import GroupInfoScreen from './pages/GroupInfo';
import FriendListScreen from './pages/FriendList';
import WalletScreen from './pages/Wallet';
import BudgetScreen from './pages/Budget';
import AboutScreen from './pages/About';
import NotifyScreen from './pages/Notify';
import Test from './pages/Test';
import QrScand from './common/qrScand';
import SendRedBagsPage from './pages/RedBags/SendRedBagsPage';
import RedBagsDetailPage from './pages/RedBags/RedBagsDetailPage';
import SearchPage from './pages/SearchPage';
import {CONNECT_SUCCESS_RONGCLOUD} from '../static'

global.formDataObject = obj => {
    let formData = new FormData();
    for (let key in obj) {
        formData.append(key, obj[key]);
    }
    return formData;
}

global.apiRequest = (url, params) => fetch(`${Config.apiAddress}${url}`, params).then(res => res.json());

global.dataGroup = initData => {
    let transformName = [];
    initData.map(item => {
        transformName.push(
            pinyin((item.nickname || item.username).substring(0, 1), {
                style: pinyin.STYLE_FIRST_LETTER
            })[0][0].toUpperCase()
        );
    });

    let charArr = 'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,#'.split(',');
    let group = [];
    charArr.map(item => {
        group.push({ key: item, data: [] });
    });

    transformName.map((item, index) => {
        switch (item) {
            case "A":
                group[0].data.push(initData[index])
                break;
            case "B":
                group[1].data.push(initData[index])
                break;
            case "C":
                group[2].data.push(initData[index])
                break;
            case "D":
                group[3].data.push(initData[index])
                break;
            case "E":
                group[4].data.push(initData[index])
                break;
            case "F":
                group[5].data.push(initData[index])
                break;
            case "G":
                group[6].data.push(initData[index])
                break;
            case "H":
                group[7].data.push(initData[index])
                break;
            case "I":
                group[8].data.push(initData[index])
                break;
            case "J":
                group[9].data.push(initData[index])
                break;
            case "K":
                group[10].data.push(initData[index])
                break;
            case "L":
                group[11].data.push(initData[index])
                break;
            case "M":
                group[12].data.push(initData[index])
                break;
            case "N":
                group[13].data.push(initData[index])
                break;
            case "O":
                group[14].data.push(initData[index])
                break;
            case "P":
                group[15].data.push(initData[index])
                break;
            case "Q":
                group[16].data.push(initData[index])
                break;
            case "R":
                group[17].data.push(initData[index])
                break;
            case "S":
                group[18].data.push(initData[index])
                break;
            case "T":
                group[19].data.push(initData[index])
                break;
            case "U":
                group[20].data.push(initData[index])
                break;
            case "V":
                group[21].data.push(initData[index])
                break;
            case "W":
                group[22].data.push(initData[index])
                break;
            case "X":
                group[23].data.push(initData[index])
                break;
            case "Y":
                group[24].data.push(initData[index])
                break;
            case "Z":
                group[25].data.push(initData[index])
                break;
            default:
                group[26].data.push(initData[index])
        }
    });
    return group;
};
global[CONNECT_SUCCESS_RONGCLOUD]=false;

class AuthLoadingScreen extends React.Component {
    constructor() {
        super();
        init(Config.AppKey);
        this._bootstrapAsync();

        //监听接收消息
        addReceiveMessageListener(result => {
            //取反表示群聊
            if (result.message.targetId.indexOf("group")) {
                DeviceEventEmitter.emit('new Message', result);
            }
        });
    }

    onSuccess(userId) {
        global[CONNECT_SUCCESS_RONGCLOUD]=true;
        DeviceEventEmitter.emit(CONNECT_SUCCESS_RONGCLOUD, {suc:true,userId});
        console.log("连接成功：" + userId);
    }

    onError(errorCode) {
        console.log("连接失败：" + errorCode);
    }

    onTokenIncorrect() {
        console.log("Token 不正确或已过期");
    }

    _bootstrapAsync = async () => {
        const token = await AsyncStorage.getItem('token');
        connect(
            token,
            this.onSuccess,
            this.onError,
            this.onTokenIncorrect
        );
        this.props.navigation.navigate(token ? 'App' : 'Auth');
    }

    render() {
        return (
            <View style={styles.container}>
                <ActivityIndicator />
                <StatusBar barStyle="default" />
            </View>
        );
    }
}
const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

const AppStack = createStackNavigator({
    TabNavigator: TabNavigator,
    ChatBox: ChatBoxScreen,
    UserInfo: UserInfoScreen,
    DataSetting: DataSettingScreen,
    AddFriend: AddFriendScreen,
    Setting: SettingScreen,
    Signin: SigninScreen,
    PersonalInfo: PersonalInfoScreen,
    GroupInfo: GroupInfoScreen,
    FriendList: FriendListScreen,
    Wallet: WalletScreen,
    Budget: BudgetScreen,
    About: AboutScreen,
    Notify: NotifyScreen,
    QrScand: QrScand,
    SendRedBags: SendRedBagsPage,
    RedBagsDetail: RedBagsDetailPage,
    Search: SearchPage,
    Test: Test
}, {
        headerMode: 'none',
        // initialRouteName: 'Wallet',
        //  headerLayoutPreset: 'center',
    });

const AuthStack = createStackNavigator(
    {
        LoginRigister: LoginRigisterScreen,
        ForgetPwd: ForgetPwdScreen
    }, {
        headerMode: 'none',
        // initialRouteName: 'ForgetPwd'
    });

export default createAppContainer(createSwitchNavigator(
    {
        AuthLoading: AuthLoadingScreen,
        App: AppStack,
        Auth: AuthStack,
    },
    {
        initialRouteName: 'AuthLoading'
    }
));
