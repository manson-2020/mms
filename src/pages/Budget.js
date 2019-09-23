import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, StatusBar, FlatList } from 'react-native';
import Picker from 'react-native-roll-picker';
import Dialog,
{
    FadeAnimation,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogButton,
} from 'react-native-popup-dialog';
import moment from 'moment';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';

class Budget extends React.Component {

    constructor() {
        super();
        this.state = {
            flatlistHeight: null,
            refreshing: false,
            date: [],
            curShowDate: moment(new Date()).format("YYYY.MM"),
            listData: [],
            timePickerPoup: false,
            expenditure: 0,
            income: 0
        };

        this.icon = {
            iconRedbag: require("../assets/images/icon-redbag.png"),
            iconSignin: require("../assets/images/icon-signin.png"),
        }

    }

    componentWillMount() {
        let data = new Date();
        data.setMonth(data.getMonth() + 1, 1)//获取到当前月份,设置月份
        for (let i = 0; i < 12; i++) {
            data.setMonth(data.getMonth() - 1);//每次循环一次 月份值减1
            let m = data.getMonth() + 1;
            this.state.date.push({ ym: `${data.getFullYear()}.${m < 10 ? "0" + m : m}` })
        }
        this.setState({ date: this.state.date })
        this.dataRequest(new Date());
    }


    dataRequest(time) {
        let async_storage = Object();
        AsyncStorage.multiGet(["token", "userid"]).then(value => {
            value.map(item => async_storage[item[0]] = item[1]);
            apiRequest("/index/wallet/bills", {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    token: async_storage.token,
                    date: moment(time).format('YYYY-MM') + '-' + moment(moment(time).format('YYYY-MM-DD')).daysInMonth(),
                })
            }).then(req => {
                this.state.expenditure = this.state.income = 0;
                req.res.map(item => {
                    if (Number(item.order_money) > 0) {
                        this.state.expenditure += Number(item.order_money)
                    } else {
                        this.state.income += Math.abs(item.order_money)
                    }
                })

                this.setState({ listData: req.res, expenditure: this.state.expenditure, income: this.state.income });
            }).catch(err => console.warn(err))
        })
    }

    timePickerPoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="选择日期" />}
            dialogAnimation={new FadeAnimation()}
            visible={this.state.timePickerPoup}
            onTouchOutside={() => this.setState({ timePickerPoup: false })}
        >
            <DialogContent style={{ alignItems: "center" }}>
                <View style={{ height: 225, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Picker
                            ref={picker => this.picker = picker}
                            data={this.state.date}
                            name='ym'
                            onRowChange={index => this.curShowDate = this.state.date[index].ym}
                        />
                    </View>
                </View>
            </DialogContent>
            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{ fontSize: 14 }}
                    onPress={() => this.setState({ timePickerPoup: false })}
                />
                <DialogButton
                    text="确认"
                    textStyle={{ fontSize: 14 }}
                    onPress={() => {
                        if (this.curShowDate) {
                            this.dataRequest(this.curShowDate.replace(".", "-"));
                            this.setState({ curShowDate: this.curShowDate });
                        }
                        this.setState({ timePickerPoup: false })
                    }}
                />
            </DialogFooter>
        </Dialog>
    )

    FlatRender = item => {

        let money = item.order_money.indexOf("-");
        let type = (item.order_type == 1 && "彩信红包") || (item.order_type == 3 && "签到奖励");

        return (
            <View style={styles.listContainer}>
                <Image style={styles.icon} source={(type == "彩信红包" && this.icon.iconRedbag) || (type == "签到奖励" && this.icon.iconSignin)} />
                <View style={styles.details}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[styles.fs_16, styles.color_black]}>{type}</Text>
                        <Text style={[styles.fs_13, styles.color_gray, { marginTop: 9 }]}>{item.complete_time}</Text>
                    </View>
                    <Text style={[styles.fs_16, styles.money, money ? styles.color_red : styles.color_black]} >
                        {money ? `+${item.order_money}` : item.order_money}
                    </Text>
                </View>
            </View>
        )
    }

    refresh = () => {
        this.setState({ refreshing: true }/* , () => this.dataRequest() */)
    }


    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle={'dark-content'} />
                <TopBar title="收支明细" leftIcon="icon_back" leftPress={() => this.props.navigation.goBack()} />
                <FlatList
                    style={{ flex: 1 }}
                    onLayout={e => {
                        if (this.state.flatlistHeight < e.nativeEvent.layout.height) {
                            this.setState({ flatlistHeight: e.nativeEvent.layout.height })
                        }
                    }}
                    data={this.state.listData}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item, index }) => this.FlatRender(item, index)}
                    ListHeaderComponent={(
                        <View style={styles.headerContainer}>
                            <TouchableOpacity onPress={() => { this.setState({ timePickerPoup: true }); this.curShowDate = moment(new Date()).format("YYYY.MM"); }} style={styles.date} >
                                <Text style={styles.dateText}>{this.state.curShowDate}</Text>
                                <View style={styles.triangle} />
                            </TouchableOpacity>
                            <View>
                                <Text style={[styles.fs_13, styles.color_red, { fontWeight: "500" }]}>收入:<Text style={styles.color_gray}>  {this.state.expenditure}元</Text></Text>
                                <Text style={[styles.fs_13, styles.color_black, { fontWeight: "500", marginTop: 6 }]}>支出:<Text style={styles.color_gray}> {this.state.income}元</Text></Text>
                            </View>
                        </View>
                    )}
                    onRefresh={this.refresh.bind(this)}
                    refreshing={this.state.refreshing}
                />
                <this.timePickerPoup />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    headerContainer: {
        height: 70,
        backgroundColor: "#F5F5F5",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15
    },
    date: {
        flexDirection: "row",
        alignItems: "center"
    },
    dateText: {
        color: '#333',
        fontSize: 16,
        fontWeight: "bold"
    },
    triangle: {
        marginLeft: 5,
        borderTopWidth: 7,
        borderRightWidth: 4,
        borderBottomWidth: 0,
        borderLeftWidth: 4,
        borderColor: "transparent",
        borderTopColor: "#333"
    },
    // total: {
    //     justifyContent: "space-between"
    // },
    fs_13: {
        fontSize: 13
    },
    fs_16: {
        fontSize: 16
    },
    color_red: {
        color: "#FF5353"
    },
    color_gray: {
        color: "#999"
    },
    color_black: {
        color: "#333"
    },
    listContainer: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    icon: {
        width: 38,
        height: 38,
        marginLeft: 15
    },
    details: {
        flex: 1,
        height: 68,
        flexDirection: "row",
        justifyContent: "space-between", alignItems: "center", marginHorizontal: 15,
        borderBottomColor: "#eee",
        borderBottomWidth: 1
    },
    money: {
        marginLeft: 15,
        fontWeight: "500"
    }
});

export default Budget;