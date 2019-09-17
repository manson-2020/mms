import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TextInput,
    TouchableOpacity, Image
} from 'react-native';
import TopBar from '../components/TopBar';
import InputPayPasswordModal from '../../common/InputPayPasswordModal'
import Utils from '../../../util/Utils'
import AsyncStorage from "@react-native-community/async-storage";

const InputItem = ({title, showRightText = true, inputStyle, ...inputProps}) => {
    return <View style={styles.itemWrap}>
        <Text style={styles.title}>{title}</Text>
        <TextInput style={[styles.input, inputStyle]} {...inputProps}/>
        {showRightText ? <Text style={styles.bolddText}>元</Text> : null}
    </View>
};


export default class SendRedBagsPage extends Component {
    constructor(props) {
        super(props);
        this.isPerson = this.props.navigation.getParam('isPerson');
        this.targetId = this.props.navigation.getParam('targetId');
        this.callBack = this.props.navigation.getParam('callBack');
        this.state = {
            rm_money: 0,
            max_rev: 0,
            showPayPassword: false
        }
    }

    closePayPassword() {
        this.setState({showPayPassword: false})
    }

    showPayPassword() {
        this.setState({showPayPassword: true})
    }

    /**
     * 发送红包
     * @returns {Promise<void>}
     */
    async sendRedBags(pay_pwd) {
        this.props.navigation.goBack();
        const token = await AsyncStorage.getItem('token');
        const url = '/index/redmoney/redmoney_create';
        const {rm_money} = this.state;
        const data = {
            token,
            rm_money,
            rm_type: 1,
            pay_pwd,
            rev_userid: this.targetId

        };
        apiRequest(url, {
            method: 'post',
            mode: "cors",
            body: JSON.stringify(data)
        }).then((res) => {
            alert(res['msg']);
            if(res['code'] == 200){
                alert(res['msg']);
                this.hb_orderid=res['hb_orderid'];
                this.callBack && this.callBack(res['hb_orderid'],true)
            }
        }, (error) => {
            console.log(error)
        })
    }

    render() {
        const {rm_money, max_rev, showPayPassword} = this.state;
        return <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content'/>
            <TopBar
                leftText={'取消'}
                leftPress={() => this.props.navigation.goBack()}
                title={'发红包'}
            />
            <ScrollView style={{backgroundColor: '#f5f5f5'}}>
                <InputItem title={'金额'}
                           keyboardType={'numeric'}
                           placeholder={'请输入金额'}
                           defaultValue={rm_money}
                           onChangeText={(rm_money) => this.setState(() => {
                               return {
                                   rm_money: Utils.clearNoNum(rm_money)
                               }
                           })}
                           value={rm_money}/>
                {!this.isPerson ? <InputItem title={'人数'}
                                             placeholder={'请输入人数'}
                                             showRightText={false}
                                             inputStyle={{textAlign: 'left'}}
                                             value={0.00}/> : null
                }

                <InputItem title={'祝福语'}
                           placeholder={'恭喜发财吉祥如意'}
                           showRightText={false}
                           inputStyle={{textAlign: 'left'}}
                           value={0.00}/>

                <View style={styles.nubWrap}>
                    <Text style={[styles.moneyNub, {fontSize: 28, marginTop: -1}]}>¥</Text>
                    <Text style={styles.moneyNub}>{Utils.returnFloat(rm_money)}</Text>
                </View>
                <TouchableOpacity style={styles.btnWrap} onPress={() => {
                    if (rm_money > 0) {
                        this.showPayPassword()
                    }
                }}>
                    <Text
                        style={[styles.subBtn, {backgroundColor: rm_money && rm_money > 0 ? '#FF5353FF' : '#FF535366'}]}>赛钱进红包</Text>
                </TouchableOpacity>
                {showPayPassword ? <InputPayPasswordModal
                    ref={(ref) => this.inputPayPassword = ref}
                    rm_money={rm_money}
                    close={() => this.closePayPassword()}
                    show={() => this.showPayPassword()}
                    callBack={async (pay_pwd) => this.sendRedBags(pay_pwd)}
                /> : null}
            </ScrollView>
        </View>
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemWrap: {
        flexDirection: 'row',
        height: 66,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 20,
        paddingLeft: 16,
        paddingRight: 16

    },
    title: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold'
    },
    input: {
        flex: 1,
        textAlign: 'right',
        color: '#999',
        fontSize: 14,
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 0,
        paddingBottom: 0
    },
    bolddText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    nubWrap: {
        flexDirection: 'row',
        marginTop: 56,
        justifyContent: 'center',
    },
    moneyNub: {
        color: '#333',
        fontSize: 44
    },
    btnWrap: {
        marginTop: 25,
        alignItems: 'center'
    },
    subBtn: {
        width: 200,
        height: 40,
        lineHeight: 40,
        borderRadius: 20,
        fontSize: 15,
        color: '#fff',
        backgroundColor: '#FF535366',
        textAlign: 'center'
    }
});
