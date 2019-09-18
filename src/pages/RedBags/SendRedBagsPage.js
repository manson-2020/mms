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

        const token = await AsyncStorage.getItem('token');
        const url = '/index/redmoney/redmoney_create';
        const {rm_money, max_rev} = this.state;
        // token	用户身份认证	string	Y	-
        // rm_money	红包金额	string	Y	-
        // rm_type	红包类型 1单聊 3群随机 4众筹随机	string	Y	-
        // rev_userid	红包接收人的时候必传	string	N	rm_type为1的时候必传
        // max_rev	最多领取人数	string	N	rm_type为3或4的时候必传
        // group_id	群组id	string	N	rm_type为3或4的时候必传
        // pay_pwd	支付密码	string	Y	-

        let baseData = {
            token,
            rm_money,
            rm_type: this.isPerson ? 1 : 3,
            pay_pwd,
        };
        const data = this.isPerson ?
            {
                ...baseData,
                rev_userid: this.targetId
            }
            :
            {
                ...baseData,
                max_rev,
                group_id: this.targetId
            };

        apiRequest(url, {
            method: 'post',
            mode: "cors",
            body: JSON.stringify(data)
        }).then((res) => {
            console.log(res);
            if (res['code'] == 200) {
                alert(res['msg']);
                this.props.navigation.goBack();
                const hb_orderid = res['res']['hb_orderid'];
                this.callBack && this.callBack(hb_orderid, true)
            } else {
                alert('支付密码错误请重试')
            }
        }, (error) => {
            console.log(error)
        })
    }

    canSend() {
        const {rm_money, max_rev} = this.state;
        if (this.isPerson) {
            if (rm_money && rm_money > 0) {
                return true
            }
        } else {
            if (rm_money && rm_money > 0 && max_rev && max_rev >= 1) {
                return true
            }
        }
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
            <View style={{flex:1}}>
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
                                                 onChangeText={(max_rev) => this.setState(() => {
                                                     max_rev = max_rev.replace(/[^\d]+/, '');
                                                     return {
                                                         max_rev
                                                     }
                                                 })}
                                                 inputStyle={{textAlign: 'left'}}
                                                 value={max_rev}/> : null
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
                        if (this.canSend()) {
                            this.showPayPassword()
                        }
                    }}>
                        <Text
                            style={[styles.subBtn, {
                                backgroundColor: this.canSend()? '#FF5353FF' : '#FF535366'
                            }]}>赛钱进红包</Text>
                    </TouchableOpacity>
                    {showPayPassword ? <InputPayPasswordModal
                        ref={(ref) => this.inputPayPassword = ref}
                        rm_money={rm_money}
                        close={() => this.closePayPassword()}
                        show={() => this.showPayPassword()}
                        callBack={(pay_pwd) => this.sendRedBags(pay_pwd)}
                    /> : null}
                </ScrollView>
            </View>
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
