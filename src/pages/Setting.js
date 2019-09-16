import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { disconnect } from "rongcloud-react-native-imlib";
import TopBar from './components/TopBar';
import Option from './components/Option';


class Setting extends React.Component {
    constructor() {
        super();
        this.option = [
            { text: "绑定手机号", mt: 15 },
            {
                text: "新消息通知", mt: 15, method: () => { }
            },
            {
                text: "黑名单", method: () => { }
            },
            {
                text: "帮助与反馈", method: () => { }
            },
            {
                text: "关于彩信", method: () => { }
            },
            {
                text: "清空聊天记录", disIconNext: true, isCenter: true, mt: 15, method: () => { }
            },
            {
                text: "退出登录", disIconNext: true, isCenter: true, mt: 15,
                method: () => {
                    AsyncStorage.removeItem('token');
                    disconnect(false);
                    this.props.navigation.navigate('AuthLoading');
                }
            },
        ]
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
                <TopBar leftIcon="icon_back" title="设置" leftPress={() => this.props.navigation.goBack()} />
                <Option data={this.option} pageName="setting" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default Setting;