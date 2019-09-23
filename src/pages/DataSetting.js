import React from 'react';
import { Image, View, Text, StyleSheet, StatusBar, Switch, TouchableOpacity, TouchableHighlight } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';


class DataSetting extends React.Component {
    constructor(props) {
        super(props);
        this.userInfo = props.navigation.state.params;
        this.state = {
            falseSwitchIsOn: true
        }
    }

    dataRequest() {
        AsyncStorage.getItem(`token`).then(token => {
            apiRequest('/index/friend/del_friend', {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    token: token,
                    userid: this.userInfo.ry_userid || this.userInfo.userid,
                })
            }).then(result => {
                if (result.code == 200) {
                    this.props.navigation.navigate("AddressBook")
                }
            })
        })
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar
                    translucent={true}
                    backgroundColor="transparent"
                    barStyle={'dark-content'}
                />
                <TopBar
                    leftPress={() => this.props.navigation.goBack()}
                    leftIcon="icon_back"
                    title="资料设置"
                />
                <View style={styles.main}>
                    <View style={[styles.list, styles.topList]}>
                        <Text style={[styles.text, styles.color_333]}>把他/她推荐给朋友</Text>
                        <Image style={{ width: 7, height: 12 }} source={require('../assets/images/icon-next.png')} />
                    </View>
                    <View style={[styles.list, styles.topList]}>
                        <Text style={[styles.text, styles.color_333]}>加入黑名单</Text>
                        <Switch
                            trackColor={{ false: "#F0F0F0", true: "#196FF0" }}
                            onValueChange={value => this.setState({ falseSwitchIsOn: value })}
                            style={{ marginBottom: 10, marginTop: 10 }}
                            value={this.state.falseSwitchIsOn}
                        />
                    </View>
                    <View style={[styles.list, styles.bottomList, { borderBottomColor: "#eee", borderBottomWidth: 1 }]}><Text style={[styles.text, styles.color_red]}>清空聊天记录</Text></View>


                    <TouchableOpacity
                        onPress={this.dataRequest.bind(this)}
                        style={[styles.list, styles.bottomList, { marginTop: 0 }]}
                    >
                        <Text style={[styles.text, styles.color_red]}>删除好友</Text>
                    </TouchableOpacity>
                </View>

            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    main: {
        flex: 1,
        backgroundColor: "#F0F0F0"
    },
    list: {
        height: 58,
        backgroundColor: "#fff",
        marginTop: 11,
        flexDirection: "row",
        alignItems: "center",
        paddingLeft: 15,
        paddingRight: 15
    },
    topList: {
        justifyContent: "space-between",
    },
    bottomList: {
        justifyContent: "center",
    },
    text: {
        fontSize: 16,
    },
    color_333: {
        color: "#333"
    },
    color_red: {
        color: "#FF1F1F"
    }
});

export default DataSetting;