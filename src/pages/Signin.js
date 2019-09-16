import React from 'react';
import { View, Text, StyleSheet, StatusBar, ImageBackground, Image, TouchableOpacity } from 'react-native';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';

class Signin extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            dataSource: [],
            signed: [],
            myMonth: moment(new Date()).format('YYYY-MM-DD'),
            money: 0,
            todayIsSignin: false
        }
    }

    componentWillMount() {
        this.dataRequest();
    }

    dataRequest(params) {
        let async_storage = Object();
        AsyncStorage.multiGet([`token`, `userid`]).then(value => {
            value.map(item => async_storage[item[0]] = item[1]);
            switch (params) {
                case "submit":
                    apiRequest(`/index/wallet/addSign`,
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: async_storage.token,
                                userid: async_storage.userid,
                                date: moment(new Date()).format('YYYY-MM-DD')
                            })
                        }
                    ).then(result => {
                        this.setState({ money: result.res.money });
                        this.dataRequest();
                    }).catch(error => console.warn(error));
                default:
                    apiRequest(`/index/wallet/checkSign`,
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: async_storage.token,
                                userid: async_storage.userid,
                                date: moment(new Date()).format('YYYY-MM') + '-' + moment(moment(new Date()).format('YYYY-MM-DD')).daysInMonth()
                            })
                        }
                    ).then(result => {
                        this.setState({ signed: result.res.date, money: result.res.rmb }, () => {
                            this.calendarData(moment(new Date()).format('YYYY-MM-DD'))
                        });
                    }).catch(error => console.warn(error));
                    break;
            }
        });
    }

    calendarData = date => {
        let daysArr = [];
        let currentWeekday = moment(date)
            .date(1)
            .weekday(); // 获取当月1日为星期几
        let currentMonthDays = moment(date).daysInMonth(); // 获取当月天数
        let endWeekday = moment(date)
            .date(currentMonthDays)
            .weekday();
        for (let i = 0; i < currentWeekday; i++) {
            daysArr.push({ id: '' })
        }
        // let YYMM = moment(date).format('YYYYMM');
        // let myDate;
        for (let i = 1; i <= currentMonthDays; i++) {
            //本月所有日期
            // myDate = moment(YYMM + (i < 10 ? '0' + i : i)).format('YYYY-MM-DD');
            // if (moment(new Date()).date() === moment(myDate).date()) {
            //     //今天
            //     daysArr.push({ id: i, })
            // } else {
            daysArr.push({ id: i < 10 ? `0${i}` : i });
            // }
        }

        for (i = 0; i < 6 - endWeekday; endWeekday++) {
            daysArr.push({ id: '' })
        }

        this.state.signed.map(item => {
            for (let i = 0; i < currentMonthDays; i++) {
                if (moment(item.date).format("DD") == i) {
                    if (moment(new Date()).date() == moment(item.date).format("DD")) {
                        this.setState({ todayIsSignin: true })
                    }
                    daysArr[i + (currentWeekday - 1)] = { id: moment(item.date).format("DD"), isSigned: true }
                }
            }
        });

        this.setState({ dataSource: daysArr })
    }

    Calendar = () => {
        return (
            <View style={{ marginTop: 33 }}>
                <React.Fragment>
                    <View style={styles.dateTitle}>
                        <TouchableOpacity>
                            <Image style={styles.switchIcon} source={require('../assets/images/icon-back-left.png')} />
                        </TouchableOpacity>
                        <Text style={styles.curMonth}>{this.state.myMonth}</Text>
                        <TouchableOpacity>
                            <Image style={styles.switchIcon} source={require('../assets/images/icon-back-right.png')} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.weekTitle}>
                        {`日,一,二,三,四,五,六`.split(',').map((item, index) => (
                            <Text key={index} style={styles.line}>{item}</Text>
                        ))}
                    </View>
                </React.Fragment>
                <View style={styles.dateContainer}>
                    {this.state.dataSource.map((item, index) => (
                        <View key={index} style={styles.row}>
                            <TouchableOpacity style={styles.littleRow}>
                                <Text style={[styles.dayText, { color: item.isSigned ? '#196FF0' : '#999' }]}>{item.id}</Text>
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            </View>
        )
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.main}>
                    <ImageBackground style={styles.banner} source={require('../assets/images/signin-bg.jpg')}>
                        <StatusBar translucent={true} backgroundColor="transparent" barStyle='light-content' />
                        <TopBar title="签到" leftIcon="icon_back_white" titleStyle={{ color: "#fff" }} leftPress={() => this.props.navigation.goBack()} />
                        <View style={styles.integral}>
                            <View style={styles.integralMain}>
                                <Text style={styles.sumIntegral}>本月收益:</Text>
                                <Text style={styles.numIntegral}>{this.state.money}</Text>
                                <Text style={{ flex: 1, lineHeight: 33, color: "#fff" }}>元</Text>
                            </View>
                        </View>
                    </ImageBackground>
                    <View style={styles.canlendarContainer}>
                        <View style={styles.canlendar}>
                            <this.Calendar />
                        </View>
                    </View>
                </View>
                <View style={styles.signinBtnContainer}>
                    <TouchableOpacity onPress={this.dataRequest.bind(this, "submit")} disabled={this.state.todayIsSignin || !this.state.dataSource.length}>
                        <ImageBackground source={require("../assets/images/blueBtn-bg.png")} style={[styles.signinView, (this.state.todayIsSignin || !this.state.dataSource.length) && { opacity: 0.6 }]}>
                            <Text style={styles.signinText}>今日{this.state.todayIsSignin && "已"}签到</Text>
                        </ImageBackground>
                    </TouchableOpacity>
                </View>
            </View >
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    main: {
        position: "relative",
    },
    banner: {
        top: 0,
        height: 200,
        width: "100%",
        backgroundColor: "#ccc",
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 1,
        shadowRadius: 10,
        elevation: 20,
    },
    integral: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    integralMain: {
        flexDirection: "row",
        alignItems: "flex-end"
    },
    sumIntegral: {
        flex: 1,
        fontWeight: "500",
        lineHeight: 33,
        color: "#fff",
        textAlign: "right"
    },
    numIntegral: {
        fontSize: 44,
        fontWeight: "bold",
        color: "#fff",
        marginLeft: 18,
        marginRight: 18
    },
    canlendarContainer: {
        width: "100%",
        bottom: 0,
        zIndex: -1,
        alignItems: "center",
    },
    canlendar: {
        width: 345,
        backgroundColor: "#fff",
        borderBottomLeftRadius: 17,
        borderBottomRightRadius: 17,
        shadowColor: '#666',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    signinBtnContainer: {
        marginTop: 50,
        alignItems: "center"
    },
    signinView: {
        width: 220,
        height: 73,
        justifyContent: "center",
        alignItems: "center",
    },
    signinText: {
        textAlign: "center",
        lineHeight: 40,
        fontSize: 16,
        color: "#fff",
        fontWeight: "500"
    },

    line: {
        flex: 1,
        textAlign: 'center',
        color: '#ff8c87',
        fontWeight: "500",
        color: '#666'
    },
    row: {
        alignItems: 'center',
        justifyContent: 'center'
    },
    littleRow: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 26,
        height: 26,
        marginHorizontal: 11,
        borderRadius: 13,
        marginTop: 13
    },

    dateTitle: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    curMonth: {
        fontSize: 18,
        fontWeight: "600",
        color: "#666"
    },
    dateContainer: {
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
        flexWrap: 'wrap',
        marginTop: 16,
        marginBottom: 30,
    },
    switchIcon: {
        width: 9,
        height: 16
    },
    weekTitle: {
        flexDirection: 'row',
        marginTop: 30
    },
    dayText: {
        fontWeight: "500"
    }
});

export default Signin;