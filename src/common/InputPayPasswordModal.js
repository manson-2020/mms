import React, {Component} from 'react';
import {View, Text, StyleSheet, StatusBar, ScrollView, Dimensions, TouchableOpacity, Animated} from 'react-native';
import Modal from 'react-native-modal'
import EvilIcons from 'react-native-vector-icons/EvilIcons'
import Entypo from 'react-native-vector-icons/Entypo'
import Ionicons from 'react-native-vector-icons/Ionicons'
const {width,height}=Dimensions.get('window');
const keyboardNub = [1,2,3,4,5,6,7,8,9];
export default class InputPayPasswordModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            animatedValue: new Animated.Value(0),
            isVisible: true,
            isShow:true
        }
    }
    componentDidMount(): void {
        Animated.timing(this.state.animatedValue, {toValue:250, duration: 500,}).start();
    }

    hide() {
        this.setState({isVisible: false})
    }

    render() {
        return <Modal
            isVisible={this.state.isVisible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            style={{margin: 0, padding: 0, backgroundColor: 'rgba(0,0,0,.5)'}}
            onBackButtonPress={() => this.hide()}>
            <View style={{alignItems: 'center',flex: 1,justifyContent:'center'}}>
                <StatusBar hidden={true}/>
                <View style={styles.mainWrap}>
                    <View style={styles.closeWrap}>
                        <EvilIcons name={'close'} size={26}/>
                    </View>
                    <Text style={styles.title}>支付金额</Text>
                    <View style={styles.nubWrap}>
                        <Text style={styles.moneyNub1}>¥</Text>
                        <Text style={styles.moneyNub}>60.00</Text>
                    </View>
                    <Text style={styles.title}>支付密码</Text>
                    <View style={styles.passwordWrap}>
                        <Text style={styles.passwordNub}> </Text>
                        <Text style={styles.passwordNub}> </Text>
                        <Text style={styles.passwordNub}> </Text>
                        <Text style={styles.passwordNub}> </Text>
                        <Text style={styles.passwordNub}> </Text>
                        <Text style={[styles.passwordNub, {borderRightWidth: 1}]}> </Text>
                    </View>
                </View>
            </View>
            <Animated.View  style={[styles.keyboard,{height: this.state.animatedValue}]}>
                <TouchableOpacity  style={{alignItems:'center'}} >
                    <Ionicons name={'ios-arrow-down'} size={26} color={'#fff'}/>
                </TouchableOpacity>
                <View style={styles.keyboardWrap}>
                    {keyboardNub.map((item,index) => {
                        return <TouchableOpacity style={styles.keyboardNubWrap}>
                            <View style={styles.keyboardNub}>
                                <Text style={{fontSize:16}}>{item}</Text>
                            </View>
                        </TouchableOpacity>
                    })}
                </View>
                <View style={[styles.keyboardWrap,{justifyContent:'flex-end'}]}>
                    <TouchableOpacity style={styles.keyboardNubWrap}>
                        <View style={styles.keyboardNub}>
                            <Text style={{fontSize:16}}>0</Text>
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.keyboardNubWrap}>
                        <Entypo name={'arrow-left'} size={50} color={'#fff'}/>
                    </TouchableOpacity>
                </View>
            </Animated.View >
        </Modal>
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
        borderRightWidth: 0
    },
    keyboard: {
        width: '100%',
        backgroundColor: '#c8ccd1',
        height:250,
        position:'absolute',
        left:0,
        bottom:0
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
        justifyContent:'center',
        alignItems:'center'
    },
    keyboardNub: {
        marginLeft: 3,
        marginRight: 3,
        backgroundColor: '#fff',
        height: '100%',
        borderRadius: 5,
        width:(width-11)/3-6,
        justifyContent:'center',
        alignItems:'center',
    }
});
