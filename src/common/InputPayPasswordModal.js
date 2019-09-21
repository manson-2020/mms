import React, { Component } from 'react';
import { View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity, Animated } from 'react-native';
import Modal from 'react-native-modal'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
import propTypes from 'prop-types'
import AsyncStorage from '@react-native-community/async-storage';
import Utils from '../../util/Utils'
import { KEYBOARAD_NUB, PAY_PASSWORD_LEN } from '../../static'

const { width, height } = Dimensions.get('window');

export default class InputPayPasswordModal extends Component {
    static propTypes = {
        rm_money: propTypes.number,
        close: propTypes.func.isRequired,
        show: propTypes.func.isRequired,
        callBack: propTypes.func,
    };

    constructor(props) {
        super(props);
        this.minNoSelectIndex = 0;
        this.state = {
            animatedValue: new Animated.Value(0),
            isVisible: true,
            pwdArr: [-1, -1, -1, -1, -1, -1],
        }
    }

    componentDidMount(): void {
        Animated.timing(this.state.animatedValue, { toValue: 250, duration: 500, }).start();
    }

    /**
     * 输入密码
     * @param nub
     */
    selectPasswordNub(nub) {
        if (this.minNoSelectIndex >= PAY_PASSWORD_LEN) {
            return
        }
        this.setState((pre) => {
            let pwdArr = pre.pwdArr;
            pwdArr[this.minNoSelectIndex] = nub;
            return { pwdArr }
        }, () => {
            this.minNoSelectIndex = this.minNoSelectIndex + 1;
            if (this.minNoSelectIndex === PAY_PASSWORD_LEN) {
                this.props.close();
                this.props.callBack(this.state.pwdArr.join(''))
            }
        });


    }

    /**
     * 删除密码
     */
    rmoveNub() {
        if (this.minNoSelectIndex <= 0) {
            return
        }
        this.minNoSelectIndex = this.minNoSelectIndex - 1;
        this.setState((pre) => {
            let pwdArr = pre.pwdArr;
            pwdArr[this.minNoSelectIndex] = -1;
            console.log(pwdArr);
            return { pwdArr }
        })
    }
    render() {
        const { close, rm_money, notPay, tips } = this.props;
        const { pwdArr } = this.state;
        const len = pwdArr.length - 1;
        return (
            <Modal
                isVisible={this.state.isVisible}
                animationIn="fadeIn"
                animationOut="fadeOut"
                style={{ margin: 0, padding: 0, flex: 1, backgroundColor: 'rgba(0,0,0,.5)' }}
                onBackButtonPress={() => close()}>
                <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                    <StatusBar hidden={true} />
                    <View style={styles.mainWrap}>
                        <TouchableOpacity onPress={() => close()} style={styles.closeWrap}>
                            <EvilIcons name={'close'} size={26} />
                        </TouchableOpacity>
                        {!notPay && <Text style={styles.title}>支付金额</Text>}
                        <View style={styles.nubWrap}>
                            <Text style={styles.moneyNub1}>{!notPay && "¥"}</Text>
                            <Text style={styles.moneyNub}>{rm_money}</Text>
                        </View>
                        <View style={{ alignItems: "center", justifyContent: "space-around" }}>
                            <Text style={styles.title}>{tips}</Text>
                            <View style={styles.passwordWrap}>
                                {pwdArr.map((item, index) => <View key={`payPassword${index}`}
                                    style={[styles.passwordNub, { borderRightWidth: index === len ? 1 : 0 }]}>
                                    {item !== -1 ? <View style={styles.splot} /> : null}
                                </View>)}
                            </View>
                            <Text />
                        </View>
                    </View>
                </View>
                <Animated.View style={[styles.keyboard, { height: this.state.animatedValue }]}>
                    <TouchableOpacity style={{ alignItems: 'center' }}>
                        <Ionicons name={'ios-arrow-down'} size={26} color={'#fff'} />
                    </TouchableOpacity>
                    <View style={styles.keyboardWrap}>
                        {KEYBOARAD_NUB.map((item, index) => {
                            return <TouchableOpacity
                                onPress={() => this.selectPasswordNub(item)}
                                key={`keyboardNub${index}`}
                                style={styles.keyboardNubWrap}>
                                <View style={styles.keyboardNub}>
                                    <Text style={{ fontSize: 16 }}>{item}</Text>
                                </View>
                            </TouchableOpacity>
                        })}
                    </View>
                    <View style={[styles.keyboardWrap, { justifyContent: 'flex-end' }]}>
                        <TouchableOpacity style={styles.keyboardNubWrap}>
                            <View style={styles.keyboardNub}>
                                <Text style={{ fontSize: 16 }}>0</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.rmoveNub()} style={styles.keyboardNubWrap}>
                            <Entypo name={'arrow-left'} size={50} color={'#fff'} />
                        </TouchableOpacity>
                    </View>
                </Animated.View>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    mainWrap: {
        width: 300,
        height: 290,
        borderRadius: 15,
        backgroundColor: '#fff',
        alignItems: 'center',
        padding: 16,
        marginBottom: 244,
    },
    closeWrap: {
        alignItems: 'flex-end',
        marginTop: 5,
        width: '100%'
    },
    nubWrap: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'center',
        borderBottomWidth: 1,
        borderBottomColor: '#EEEEEEFF',
        paddingBottom: 25
    },
    moneyNub: {
        color: '#333',
        fontSize: 30,
        fontWeight: 'bold',
    },
    moneyNub1: {
        color: '#333',
        fontSize: 20,
    },
    title: {
        paddingTop: 10,
        paddingBottom: 10,
        color: '#666666FF',
        fontSize: 16,
    },
    passwordWrap: {
        flexDirection: 'row',
        width: '100%',
        marginTop: 5
    },
    passwordNub: {
        width: 45,
        height: 45,
        borderWidth: 1,
        borderColor: '#CCCCCCFF',
        borderRightWidth: 0,
        alignItems: 'center',
        justifyContent: 'center'
    },
    keyboard: {
        width: '100%',
        backgroundColor: '#c8ccd1',
        height: 250,
        position: 'absolute',
        left: 0,
        bottom: 0
    },
    keyboardWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        paddingLeft: 6,
        paddingRight: 5,
    },
    keyboardNubWrap: {
        width: '33.3%',
        height: 54,
        paddingTop: 3,
        paddingBottom: 3,
        justifyContent: 'center',
        alignItems: 'center'
    },
    keyboardNub: {
        marginLeft: 3,
        marginRight: 3,
        backgroundColor: '#fff',
        height: '100%',
        borderRadius: 5,
        width: (width - 11) / 3 - 6,
        justifyContent: 'center',
        alignItems: 'center',
    },
    splot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#000'
    }
});
