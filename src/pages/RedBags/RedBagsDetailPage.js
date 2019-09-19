import React, {Component, Fragment} from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ImageBackground,
    Image,
    TouchableOpacity,
    ScrollView,
} from 'react-native'
import TopBar from "../components/TopBar";
import Utils from "../../../util/Utils";

export default class RedBagsDetailPage extends Component {
    constructor(props) {
        super(props);
        this.params = this.props.navigation.state.params
    }

    getList() {
        const {res} = this.params;
        return res.have_list.map((item, index) => (
            <View key={`redopenList${index}`} style={styles.itemWrap}>
                <Image style={styles.itemImage} source={{uri: item.header_img}}/>
                <View style={styles.centerWrap}>
                    <Text style={styles.itemTitle}>{item.username}</Text>
                    <Text style={styles.time}>{item.rev_time}</Text>
                </View>
                <Text style={styles.itemMoney}>{Utils.returnFloat(item.rev_money)} 元</Text>
            </View>
        ))
    }

    getListTitle() {
        // sum_user	红包总个数	string	Y	-
        // sum_money	红包总金额	string	Y	-
        // have_money	已领取金额	string	Y	-
        // have_sum	已领取人数	string	Y	-
        // have_list	领取人列表	string	Y	-

        const {code, res, isSelf, nickname, username} = this.params;
        const {sum_money} = res;
        if (isSelf) {
            if (code == 112 || code == 114) {
                return `红包金额${sum_money}元,已被对方领取`
            } else if (code == 200 || code == 115 || code == 201) {
                return `红包金额${sum_money}元,未被对方领取`
            }

        } else {
            return `你领取了${nickname || username}的红包${sum_money}元`
        }


    }

    showMoneyWrap() {

    }

    getSelfGeyMoney() {
        const {code, isSelf, isGroup, res, ry_userid, self_id} = this.params;
        const {sum_money} = res;
        const selfItem = res.have_list.filter((item) => item.userid === self_id);
        console.log(selfItem)
        if (isGroup) {
            return selfItem.length > 0 && Utils.returnFloat(selfItem[0]['rev_money'])
        } else {
            console.log(sum_money)
            return Utils.returnFloat(sum_money)
        }
    }

    render() {
        // sum_user	红包总个数	string	Y	-
        // sum_money	红包总金额	string	Y	-
        // have_money	已领取金额	string	Y	-
        // have_sum	已领取人数	string	Y	-
        // have_list	领取人列表	string	Y	-
        const {header_img, nickname, username, code, isSelf, isGroup, res,} = this.params;
        const {sum_user, sum_money, have_money, have_sum} = res;
        return <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="#FF5353" barStyle={'light-content'}/>
            <View style={styles.container}>
                <ImageBackground
                    style={styles.bgTopWrap}
                    source={require('../../assets/img/img-navbg-red-envelope.png')}>
                    <TouchableOpacity
                        onPress={() => this.props.navigation.goBack()}
                        style={styles.button}>
                        <Image style={styles.leftButton}
                               source={require("../../assets/images/icon-back_white.png")}/>
                    </TouchableOpacity>
                    <View style={styles.headerWrap}>
                        <Image style={styles.headerImage} source={{uri: header_img}}/>
                    </View>
                </ImageBackground>
                <Text style={styles.name}>{nickname || username}</Text>
                <Text style={styles.zfText}>恭喜发财,吉祥如意</Text>
                {isSelf && !isGroup ? null : <View style={styles.moneyWrap}>
                    <Fragment>
                        <Text style={styles.money}>{this.getSelfGeyMoney()}</Text>
                        <Text style={styles.dw}>元</Text>
                    </Fragment>
                </View>}
                {
                    isGroup ? <View style={styles.listWrap}>
                            <Text style={styles.listTitle}>
                                红包明细({sum_user}个红包共{sum_money}元,已领取金额{have_sum}元,已领取人数{have_sum})
                            </Text>
                            <ScrollView>
                                {this.getList()}
                            </ScrollView>
                        </View> :

                        <Text style={styles.zfText}>{this.getListTitle()}</Text>
                }

            </View>

        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bgTopWrap: {
        height: 116,
        position: 'relative',
        width: '100%'
    },
    button: {
        height: 84,
        justifyContent: "center",
        paddingLeft: 15,
        paddingRight: 15,

    },
    leftButton: {
        width: 9,
        height: 16
    },
    headerWrap: {
        width: 60,
        height: 60,
        position: 'absolute',
        left: '50%',
        marginLeft: -30,
        bottom: -30
    },
    headerImage: {
        width: '100%',
        height: '100%',
        borderRadius: 30,
    },
    name: {
        color: '#333',
        fontSize: 18,
        textAlign: 'center',
        paddingTop: 43,
    },
    zfText: {
        color: '#999',
        fontSize: 16,
        paddingTop: 10,
        textAlign: 'center',
        paddingBottom: 10
    },
    moneyWrap: {
        height: 125,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingTop: 40,
        alignItems: 'flex-end',
        paddingBottom: 40
    },
    money: {
        fontSize: 45,
        color: '#FF5353'
    },
    dw: {
        fontSize: 16,
        color: '#FF5353'
    },
    listWrap: {
        flex: 1,
        backgroundColor: '#fff5f5f5',
        paddingLeft: 15,
        paddingRight: 15,
    },
    listTitle: {
        color: '#999',
        fontSize: 13,
        paddingTop: 15,
        paddingBottom: 17
    },
    itemWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 13,
        paddingBottom: 13
    },
    itemImage: {
        width: 38,
        height: 38,
        borderRadius: 19,
    },
    centerWrap: {
        flex: 1,
        marginLeft: 16,
        marginRight: 16,
    },
    itemTitle: {
        fontSize: 16,
        color: '#333',
        height: 26
    },
    time: {
        fontSize: 13,
        color: '#999'
    },
    itemMoney: {
        fontSize: 16,
        color: '#333'
    }


});
