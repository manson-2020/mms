import React from 'react';
import { View, Image, Text, StyleSheet, StatusBar, ImageBackground, TouchableWithoutFeedback, Dimensions } from 'react-native';
import Login from './components/Login';
import Register from './components/Register';


class LoginRegister extends React.Component {

    static MaxHeight = Dimensions.get('window').height;
    static MaxWidth = Dimensions.get('window').width;

    constructor() {
        super();
        this.state = {
            login: true,
            register: false
        }
    }

    loginRegister(isLogin) {
        this.setState(isLogin ? {
            login: true,
            register: false
        } : {
                login: false,
                register: true
            });
    }

    selected(flag) {
        return flag ? (
            <Image style={{ marginTop: 23, width: 23, height: 12 }} source={require('../assets/images/triangle.png')} />
        ) : (
                <View style={{ marginTop: 23, width: 23, height: 12 }} />
            );
    }


    render() {
        return (
            <View>
                <ImageBackground style={styles.banner} source={require("../assets/images/lr_bg.png")}>
                    <StatusBar translucent={true} backgroundColor="transparent" barStyle='light-content' />
                    <View style={styles.main}>
                        <View style={styles.tabBar}>
                            <TouchableWithoutFeedback onPress={this.loginRegister.bind(this, true)}>
                                <View style={styles.barView}>
                                    <Text style={styles.barText}>登录</Text>
                                    {this.selected(this.state.login)}
                                </View>
                            </TouchableWithoutFeedback>
                            <TouchableWithoutFeedback onPress={this.loginRegister.bind(this, false)}>
                                <View style={styles.barView}>
                                    <Text style={styles.barText}>注册</Text>
                                    {this.selected(this.state.register)}
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={styles.blank} />
                    </View>
                </ImageBackground>
                {
                    this.state.login ?
                        <Login navigation={this.props.navigation} />
                        :
                        <Register navigation={this.props.navigation} />
                }
            </View >
        );
    }
}


const styles = StyleSheet.create({
    banner: {
        height: 247
    },
    main: {
        flex: 1,
        justifyContent: "flex-end",
        alignItems: "flex-end"
    },
    tabBar: {
        width: LoginRegister.MaxWidth,
        flexDirection: 'row',
        justifyContent: "space-around",
        alignItems: "center"
    },
    barView: {
        justifyContent: 'center',
        alignItems: "center"
    },
    barText: {
        color: "#fff",
        fontSize: 24,
        fontWeight: "bold"
    },
    blank: {
        height: 38,
        width: LoginRegister.MaxWidth,
        backgroundColor: "#fff",
        borderTopStartRadius: 17,
        borderTopEndRadius: 17
    }
})

export default LoginRegister;