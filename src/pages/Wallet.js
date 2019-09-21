import React from 'react';
import { View, Text, StyleSheet, ImageBackground, Image, TouchableOpacity, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';
import InputPayPasswordModal from '../common/InputPayPasswordModal'

class Wallet extends React.Component {
    constructor() {
        super();
        this.state = {
            money: "0.00",
            showPayPassword: false
        };
    }

    componentWillMount() {
        this.dataRequest("getMoney");
    }

    dataRequest(params, paramsBody) {
        let async_storage = Object();
        AsyncStorage.multiGet(["token", "userid"]).then(value => {
            value.map(item => async_storage[item[0]] = item[1]);
            if (params == "getMoney") {
                apiRequest("/index/userinfo/get_money", {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: async_storage.token
                    })
                }).then(req => this.setState({ money: req.res.change }));
            } else {
                apiRequest("/index/userinfo/set_paypwd", {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: async_storage.token,
                        pay_pwd: paramsBody
                    })
                }).then(req => console.warn(req));
            }
        })
    }

    closePayPassword() {
        this.setState({ showPayPassword: false })
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
                <TopBar
                    title="我的钱包"
                    leftIcon="icon_back"
                    rightText="明细"
                    rightBtnStyle={styles.rightBtnStyle}
                    leftPress={() => this.props.navigation.goBack()}
                    rightPress={() => this.props.navigation.navigate("Budget")}
                />
                <View style={styles.main}>
                    <View style={styles.bg_white}>
                        <ImageBackground style={styles.walletBg} source={require("../assets/images/wallet-bg.jpg")} >
                            <Text style={styles.walletSum}>总资产（元）</Text>
                            <View style={styles.walletBlank} />
                            <Text numberOfLines={1} style={styles.walletMoney}>{this.state.money}</Text>
                        </ImageBackground>
                    </View>
                    <View style={[styles.optionContainer, styles.bg_white]}>
                        <TouchableOpacity onPress={() => this.setState({ showPayPassword: true })}>
                            <View style={styles.option}>
                                <Text style={styles.optionText}>设置支付密码</Text>
                                <Image style={styles.iconNext} source={require("../assets/images/icon-next.png")} />
                            </View>
                        </TouchableOpacity>
                        <View style={styles.line} />
                    </View>
                </View>
                {
                    this.state.showPayPassword &&
                    <InputPayPasswordModal
                        ref={ref => this.inputPayPassword = ref}
                        rm_money="设置支付密码"
                        tips="输入新的支付密码"
                        notPay={true}
                        close={() => this.closePayPassword()}
                        callBack={pay_pwd => this.dataRequest(null, pay_pwd)}
                    />
                }

            </View >
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    rightBtnStyle: {
        fontSize: 16,
        fontWeight: "500",
        color: "#333"
    },
    main: {
        flex: 1,
        backgroundColor: "#F5F5F5"
    },
    bg_white: {
        backgroundColor: "#fff"
    },
    walletBg: {
        height: 160,
        margin: 15,
        paddingLeft: 25,
        borderRadius: 5,
        overflow: "hidden"
    },
    walletSum: {
        color: "#FFF",
        fontSize: 16,
        fontWeight: "500",
        marginTop: 35
    },
    walletBlank: {
        width: 20,
        height: 3,
        backgroundColor: "#70AFFF",
        marginTop: 12
    },
    walletMoney: {
        marginTop: 18,
        color: "#fff",
        fontSize: 44,
        fontWeight: "bold"
    },
    optionContainer: {
        marginTop: 10
    },
    option: {
        flexDirection: "row",
        paddingHorizontal: 15,
        height: 66,
        alignItems: "center",
        justifyContent: "space-between"
    },
    optionText: {
        color: "#333",
        fontSize: 16
    },
    iconNext: {
        width: 8,
        height: 12
    },
    line: {
        height: 1,
        backgroundColor: "#eee",
        marginHorizontal: 15
    }
});

export default Wallet;