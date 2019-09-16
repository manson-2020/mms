
import React from 'react';
import { View, Image, Text, StyleSheet, TextInput, TouchableOpacity, TouchableWithoutFeedback, Platform } from 'react-native';

class Register extends React.Component {
    constructor() {
        super();
        this.state = {
            countdownState: true,
            countdownText: '获取验证码',
            verfiyCode: null,
            phoneNumber: null,
            password: null,
            secureTextEntry: true
        }
        this.timer;
    }

    countdown() {
        if (this.state.countdownState) {
            let i = 60;
            this.setState({
                countdownState: false,
                countdownText: i + 's后重新获取'
            }, () => {
                apiRequest('/index/user/sendsms', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        phone: this.state.phoneNumber
                    })
                }).then(result => result.code == 200 && alert(result.msg))
            });

            this.timer = setInterval(() => {
                this.setState({
                    countdownText: `${i--}s后重新获取`
                });
                if (!i) {
                    clearInterval(this.timer);
                    this.setState({
                        countdownState: true,
                        countdownText: '重新获取'
                    });
                }
            }, 1000)
        }
        return false;
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    registerSubmit = () => {
        apiRequest('/index/user/register', {
            method: 'post',
            mode: "cors",
            body: formDataObject({
                password: this.state.password,
                phone: this.state.phoneNumber,
                dev_type: (Platform.OS === 'ios') ? 1 : 2,
                code: this.state.verfiyCode
            })
        }).then(result => {
            if (result.code == 200) {
                this.props.navigation.navigate("AuthLoading")
            }
            alert(result.msg);
        })
    }

    render() {
        let isPhoneNumber = /^1[3456789]\d{9}$/.test(this.state.phoneNumber);
        let isVerfiyCode = /^\d{6}$/.test(this.state.verfiyCode);
        return (
            <View style={styles.main}>
                <View style={styles.inputView}>
                    <Image style={styles.icon} source={require('../../assets/images/user-icon.png')} />
                    <TextInput
                        onChangeText={phoneNumber => this.setState({ phoneNumber: phoneNumber })}
                        style={styles.input}
                        placeholder="请输入手机号"
                        keyboardType="numeric"
                        maxLength={11}
                        value={this.state.phoneNumber}
                    />
                    <TouchableWithoutFeedback onPress={() => this.setState({ phoneNumber: '' })}>
                        <Image style={styles.clear_icon} source={require("../../assets/images/clear-icon.png")} />
                    </TouchableWithoutFeedback>
                </View>

                <View style={[styles.inputView, styles.mt_29]}>
                    <Image style={[styles.icon, { width: 15 }]} source={require('../../assets/images/verfiCode-icon.png')} />
                    <TextInput
                        keyboardType="numeric"
                        maxLength={6}
                        onChangeText={verfiyCode => this.setState({ verfiyCode: verfiyCode })}
                        style={[styles.input, { width: 196 }]}
                        placeholder="请输入验证码"
                        value={this.state.verfiyCode}
                    />
                    <TouchableOpacity onPress={this.countdown.bind(this)} disabled={!this.state.countdownState || !isPhoneNumber}>
                        <View style={[styles.getVerfiCodeButton, ((this.state.countdownState && isPhoneNumber) || styles.bg_ccc)]}>
                            <Text style={styles.getVerfiCodeButtonText}>{this.state.countdownText}</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={[styles.inputView, styles.mt_29]}>
                    <Image style={styles.icon} source={require('../../assets/images/password-icon.png')} />
                    <TextInput
                        style={styles.input}
                        onChangeText={password => this.setState({ password: password })}
                        secureTextEntry={this.state.secureTextEntry}
                        placeholder="请输入密码"
                        value={this.state.password}
                    />
                    <TouchableWithoutFeedback onPress={() => this.setState({ secureTextEntry: !this.state.secureTextEntry })}>
                        <Image style={styles.plaintext_ciphertext_icon} source={require("../../assets/images/hide-icon.png")} />
                    </TouchableWithoutFeedback>
                </View>

                <TouchableOpacity onPress={this.registerSubmit} disabled={!(isPhoneNumber && isVerfiyCode && this.state.password)}>
                    <View style={[styles.loginButton, { opacity: isPhoneNumber && isVerfiyCode && this.state.password ? 1 : 0.3 }]}>
                        <Text style={styles.loginButtonText}>注册</Text>
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
    },
    getVerfiCodeButton: {
        width: 88,
        height: 28,
        backgroundColor: "#196FF0",
        borderRadius: 14,
        justifyContent: "center",
        alignItems: "center"
    },
    getVerfiCodeButtonText: {
        color: "#fff",
        fontSize: 12
    },
    bg_ccc: {
        backgroundColor: "#ccc"
    },
    mt_29: {
        marginTop: 29
    }
})

export default Register;
