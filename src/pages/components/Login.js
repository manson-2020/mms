
import React from 'react';
import { View, Image, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

class Login extends React.Component {
    constructor() {
        super();
        this.state = {
            notice: '',
            accountNumber: null,
            password: null,
            secureTextEntry: true
        };
    }

    loginSubmit() {
        apiRequest('/index/user/login',
            {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    lxname: this.state.accountNumber,
                    password: this.state.password
                })
            }
        ).then(result => {
            if (result.code == "200") {
                AsyncStorage.multiSet([['token', result.res.token], ['userid', result.res.userid]]);
                this.props.navigation.navigate('AuthLoading');
            } else {
                this.setState({ notice: result.msg });
            }
        }).catch(error => console.warn(error));
    }

    render() {
        let dataVerify = /^1[3456789]\d{9}$/.test(this.state.accountNumber) && this.state.password;
        return (
            <View style={styles.main}>
                <View style={styles.inputView}>
                    <Image style={styles.icon} source={require('../../assets/images/user-icon.png')} />
                    <TextInput
                        onChangeText={accountNumber => this.setState({ accountNumber: accountNumber, notice: '' })}
                        style={styles.input}
                        keyboardType="numeric"
                        maxLength={11}
                        placeholder="请输入手机号"
                        value={this.state.accountNumber}
                    />
                    <TouchableWithoutFeedback onPress={() => this.setState({ accountNumber: '' })}>
                        <Image style={styles.clear_icon} source={require("../../assets/images/clear-icon.png")} />
                    </TouchableWithoutFeedback>
                </View>

                <View style={[styles.inputView, { marginTop: 30 }]}>
                    <Image style={styles.icon} source={require('../../assets/images/password-icon.png')} />
                    <TextInput
                        onChangeText={password => this.setState({ password: password, notice: '' })}
                        style={styles.input}
                        secureTextEntry={this.state.secureTextEntry}
                        placeholder="请输入密码"
                    />
                    <TouchableWithoutFeedback onPress={() => this.setState({ secureTextEntry: !this.state.secureTextEntry })}>
                        <Image style={styles.plaintext_ciphertext_icon} source={require("../../assets/images/hide-icon.png")} />
                    </TouchableWithoutFeedback>
                </View>

                <View style={styles.notice}>
                    <Text style={styles.leftText}>{this.state.notice}</Text>
                    <Text style={styles.rightText} onPress={() => this.props.navigation.navigate('ForgetPwd')}>忘记密码？</Text>
                </View>

                <TouchableOpacity disabled={!dataVerify} onPress={this.loginSubmit.bind(this)}>
                    <View style={[styles.loginButton, { opacity: dataVerify ? 1 : 0.3 }]}>
                        <Text style={styles.loginButtonText}>登录</Text>
                    </View>
                </TouchableOpacity>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    main: {
        alignItems: "center",
        marginTop: 21
    },
    inputView: {
        width: 297,
        height: 46,
        flexDirection: 'row',
        alignItems: "center",
        borderBottomColor: "#EEEEEE",
        borderBottomWidth: 1
    },
    icon: {
        width: 19,
        height: 19
    },
    input: {
        paddingLeft: 15,
        paddingRight: 5,
        fontSize: 16,
        width: 257,
        height: 46
    },
    clear_icon: {
        width: 12,
        height: 12
    },
    plaintext_ciphertext_icon: {
        width: 15,
        height: 11
    },
    notice: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginTop: 15,
        width: 297
    },
    leftText: {
        color: "#FF1F1F"
    },
    rightText: {
        color: "#196FF0"
    },
    loginButton: {
        width: 297,
        height: 44,
        backgroundColor: "#196FF0",
        marginTop: 47,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center"
    },
    loginButtonText: {
        color: "#FFFFFF",
        fontSize: 16
    }
});


export default Login;
