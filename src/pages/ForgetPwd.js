import React from 'react';
import { View, Image, Text, StyleSheet, TextInput, TouchableOpacity, StatusBar, SafeAreaView, TouchableWithoutFeedback, Alert } from 'react-native';
import TopBar from './components/TopBar';

class ForgetPwd extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            countdownState: true,
            countdownText: '获取验证码',
            phoneNumber: null,
            secureTextEntry: true,
            confirmPassword: null,
            password: null,
            verfiyCode: null,
            phoneNumberNotice: null,
            passwordNotice: null,
            verfiCodeNotice: null,
        };
        this.timer;
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    countdown() {
        if (/^1[3456789]\d{9}$/.test(this.state.phoneNumber)) {

            if (this.state.countdownState) {
                apiRequest('/index/user/passwordsendsms', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        phone: this.state.phoneNumber
                    })
                }).then(result => {
                    if (result.code == 200) {
                        let i = 60;
                        this.setState({
                            countdownState: false,
                            countdownText: i + 's后重新获取'
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
                    this.setState({ phoneNumberNotice: result.msg })
                })
            }
        } else {
            this.setState({ phoneNumberNotice: "手机号输入有误！" })
        }

        return false;
    }

    confirmSumit = () => {
        this.setState({ passwordNotice: '', verfiCodeNotice: '' })
        if (this.state.password === this.state.confirmPassword) {
            apiRequest('/index/user/get_password', {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    phone: this.state.phoneNumber,
                    password: this.state.password,
                    code: this.state.verfiyCode,
                })
            }).then(result => {
                if (result.code == 500) {
                    this.setState({ verfiCodeNotice: result.msg })
                } else if (result.code == 200) {
                    Alert.alert('修改成功', '立即前往登录页面！',
                        [{ text: '确认', onPress: () => this.props.navigation.navigate('LoginRigister') }]
                    )
                } else {
                    this.setState({ passwordNotice: result.msg })
                }
            }).catch(error => console.warn(error))
        } else {
            this.setState({ passwordNotice: '两次密码输入不匹配' })
        }
    }

    render() {

        let isHeightLight = (!(/^1[3456789]\d{9}$/.test(this.state.phoneNumber)) || !this.state.verfiyCode || !this.state.password || !this.state.confirmPassword)

        return (
            <View>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle={'dark-content'} />
                <TopBar leftIcon="icon_back" leftPress={() => this.props.navigation.goBack()} />
                <SafeAreaView>
                    <View style={styles.main}>
                        <View style={styles.titleView}>
                            <Text style={styles.titleText}>找回密码</Text>
                        </View>
                        <View style={[styles.inputView, styles.mt_53]}>
                            <Image style={styles.icon} source={require('../assets/images/user-icon.png')} />
                            <TextInput
                                keyboardType="numeric"
                                maxLength={11}
                                style={styles.input}
                                placeholder="请输入手机号"
                                onChangeText={phoneNumber => this.setState({ phoneNumber: phoneNumber, phoneNumberNotice: '' })}
                                value={this.state.phoneNumber}
                            />
                            <TouchableWithoutFeedback onPress={() => this.setState({ phoneNumber: '', phoneNumberNotice: '' })}>
                                <Image style={styles.clear_icon} source={require("../assets/images/clear-icon.png")} />
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={styles.noticeView}>
                            <Text style={styles.noticeText}>{this.state.phoneNumberNotice}</Text>
                        </View>

                        <View style={styles.inputView}>
                            <Image style={[styles.icon, { width: 15 }]} source={require('../assets/images/verfiCode-icon.png')} />
                            <TextInput
                                keyboardType="numeric"
                                maxLength={6}
                                onChangeText={verfiyCode => this.setState({ verfiyCode: verfiyCode, phoneNumberNotice: '', verfiCodeNotice: '' })}
                                style={[styles.input, { width: 196 }]}
                                placeholder="请输入验证码"
                                value={this.state.verfiyCode}
                            />
                            <TouchableWithoutFeedback
                                onPress={this.countdown.bind(this)}
                                disabled={!this.state.countdownState || !this.state.phoneNumber}
                            >
                                <View style={[styles.getVerfiCodeButton, (this.state.countdownState && this.state.phoneNumber) || { backgroundColor: "#ccc" }]}>
                                    <Text style={[styles.getVerfiCodeButtonText, this.state.countdownState || { fontSize: 11 }]}>{this.state.countdownText}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={styles.noticeView}>
                            <Text style={styles.noticeText}>{this.state.verfiCodeNotice}</Text>
                        </View>

                        <View style={styles.inputView}>
                            <Image style={styles.icon} source={require('../assets/images/password-icon.png')} />
                            <TextInput
                                style={styles.input}
                                onChangeText={password => this.setState({ password: password })}
                                secureTextEntry={this.state.secureTextEntry}
                                placeholder="请输入新密码"
                                value={this.state.password}
                            />
                            <TouchableWithoutFeedback onPress={() => this.setState({ secureTextEntry: !this.state.secureTextEntry })}>
                                <Image style={styles.plaintext_ciphertext_icon} source={require("../assets/images/hide-icon.png")} />
                            </TouchableWithoutFeedback>
                        </View>

                        <View style={styles.noticeView}>
                            <Text style={styles.noticeText}>{this.state.passwordNotice}</Text>
                        </View>

                        <View style={styles.inputView}>
                            <Image style={styles.icon} source={require('../assets/images/password-icon.png')} />
                            <TextInput
                                style={styles.input}
                                onChangeText={confirmPassword => this.setState({ confirmPassword: confirmPassword })}
                                secureTextEntry={this.state.secureTextEntry}
                                placeholder="请确认密码"
                                value={this.state.confirmPassword}
                            />
                            <TouchableWithoutFeedback onPress={() => this.setState({ secureTextEntry: !this.state.secureTextEntry })}>
                                <Image style={styles.plaintext_ciphertext_icon} source={require("../assets/images/hide-icon.png")} />
                            </TouchableWithoutFeedback>
                        </View>

                        <TouchableOpacity
                            onPress={this.confirmSumit}
                            disabled={isHeightLight}>
                            <View style={[styles.loginButton, isHeightLight && { opacity: 0.3 }]}>
                                <Text style={styles.loginButtonText}>确定</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </View>
        )
    }
}

const styles = StyleSheet.create({
    main: {
        alignItems: "center",
        marginTop: 48
    },
    inputView: {
        width: 297,
        height: 46,
        flexDirection: 'row',
        alignItems: "center",
        borderBottomColor: "#EEEEEE",
        borderBottomWidth: 1,
        marginTop: 3
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
    mt_53: {
        marginTop: 53
    },
    titleView: {
        width: 297,
        alignItems: "flex-start"
    },
    titleText: {
        color: "#333",
        fontSize: 24
    },
    noticeView: {
        width: 297,
        alignItems: "flex-start"
    },
    noticeText: {
        color: "#FF1F1F",
        fontSize: 16,
        marginLeft: 34,
        marginTop: 10
    }
})

export default ForgetPwd;
