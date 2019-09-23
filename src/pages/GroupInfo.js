import React from 'react';
import { View, Text, StyleSheet, Image, Switch, StatusBar, BackHandler, Platform, TextInput, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Dialog,
{
    ScaleAnimation,
    SlideAnimation,
    DialogContent,
    DialogTitle,
    DialogFooter,
    DialogButton,
} from 'react-native-popup-dialog';
import TopBar from './components/TopBar';

class GroupInfo extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            falseSwitchIsOn: true,
            memberList: [],
            groupInfo: [],
            selfShowName: null,
            groupName: null,
            selfNickName: null,
            isGroupMatser: false,
            QrCodePoup: false,
            SelfNickNamePoup: false,
            GroupNamePoup: false,
        }
        this.info = props.navigation.state.params;
    }

    componentWillMount() {
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
        this.refresh();
    }

    componentWillUnmount() {
        Platform.OS == "android" && BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    }

    onBackButtonPressAndroid = () => {
        if (this.state.QrCodePoup || this.state.SelfNickNamePoup || this.state.GroupNamePoup) {
            this.setState({ QrCodePoup: false, SelfNickNamePoup: false, SexPoup: false, GroupNamePoup: false });
            return true; //返回true, 不执行系统操作。
        }
    }

    refresh() {
        this.dataRequest("getMemberList");
        this.dataRequest("getGroupInfo");
    }

    QrCodePoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="群组二维码" />}
            dialogAnimation={new ScaleAnimation()}
            visible={this.state.QrCodePoup}
            onTouchOutside={() => this.setState({ QrCodePoup: false })}
        >
            <DialogContent style={{ alignItems: "center" }}>
                <Image style={styles.qrCode} source={{ uri: this.state.groupInfo.qr_code }} />
                <Text style={{ color: "#999" }}>扫描上面二维码，加入群聊</Text>
            </DialogContent>
        </Dialog>
    )

    SelfNickNamePoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="修改我在本群显示的昵称" />}
            dialogAnimation={new SlideAnimation({ slideFrom: 'right' })}
            visible={this.state.SelfNickNamePoup}
        >
            <DialogContent style={{ height: 60, alignItems: "center" }}>
                <TextInput
                    style={{ width: "100%", height: 60, textAlign: "center" }}
                    placeholder="请输入你要改的昵称"
                    maxLength={27}
                    autoFocus={true}
                    onChangeText={selfNickName => this.setState({ selfNickName: selfNickName })}
                    defaultValue={this.state.selfShowName}
                />
            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{ fontSize: 14 }}
                    onPress={() => this.setState({ SelfNickNamePoup: false })}
                />
                <DialogButton
                    text="确认"
                    textStyle={{ fontSize: 14 }}
                    onPress={this.dataRequest.bind(this, "updateShowNickName")}
                />
            </DialogFooter>
        </Dialog>
    )

    GroupNamePoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="修改群名称" />}
            dialogAnimation={new SlideAnimation({ slideFrom: 'right' })}
            visible={this.state.GroupNamePoup}
        >
            <DialogContent style={{ height: 60, alignItems: "center" }}>
                <TextInput
                    style={{ width: "100%", height: 60, textAlign: "center" }}
                    placeholder="请输入你要改的昵称"
                    maxLength={27}
                    autoFocus={true}
                    onChangeText={groupName => this.setState({ groupName: groupName })}
                    defaultValue={this.state.groupInfo.group_name}
                />
            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{ fontSize: 14 }}
                    onPress={() => this.setState({ GroupNamePoup: false })}
                />
                <DialogButton
                    text="确认"
                    textStyle={{ fontSize: 14 }}
                    onPress={this.dataRequest.bind(this, "updateGroupName")}
                />
            </DialogFooter>
        </Dialog>
    )

    dataRequest(params) {
        let async_storage = Object();
        AsyncStorage.multiGet([`token`, `userid`]).then(value => {
            value.map(item => async_storage[item[0]] = item[1]);
            switch (params) {
                case "getMemberList":
                    apiRequest('/index/group/get_groupuser',
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: async_storage.token,
                                group_id: this.info.group_id
                            })
                        }
                    ).then(result => {
                        this.setState({ memberList: result.res });
                        result.res.map(item => {
                            if (item.ry_userid == async_storage.userid) {
                                this.setState({ selfShowName: item.remarks || item.username })
                            }
                        });
                    }).catch(error => console.log(error));
                    break;
                case "getGroupInfo":
                    apiRequest('/index/group/group_info',
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: async_storage.token,
                                group_id: this.info.group_id
                            })
                        }
                    ).then(result => {
                        this.setState({
                            groupInfo: result.res,
                            isGroupMatser: result.res.group_master == async_storage.userid ? true : false
                        });
                    }).catch(error => console.log(error));
                    break;
                case "deGroup":
                    if (this.state.isGroupMatser) {
                        apiRequest('/index/group/dismiss_group',
                            {
                                method: 'post',
                                mode: "cors",
                                body: formDataObject({
                                    token: async_storage.token,
                                    group_id: this.info.group_id
                                })
                            }
                        ).then(result => {
                            if (result.code == 200) {
                                this.props.navigation.navigate("AuthLoading")
                            }
                        }).catch(error => console.warn(error));
                    } else {
                        apiRequest('/index/group/user_quit',
                            {
                                method: 'post',
                                mode: "cors",
                                body: formDataObject({
                                    token: async_storage.token,
                                    group_id: this.info.group_id
                                })
                            }
                        ).then(result => {
                            if (result.code == 200) {
                                this.props.navigation.navigate("AuthLoading")
                            }
                        }).catch(error => console.warn(error));
                    }
                    break;
                case "updateShowNickName":
                    apiRequest('/index/group/group_remarks',
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: async_storage.token,
                                group_id: this.info.group_id,
                                remarks: this.state.selfNickName
                            })
                        }
                    ).then(result => {
                        if (result.code == 200) {
                            this.dataRequest("getMemberList");
                            this.setState({ SelfNickNamePoup: false })
                        }
                    })
                        .catch(error => console.warn(error));
                    break;
                case "updateGroupName":
                    apiRequest('/index/group/update_groupname',
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: async_storage.token,
                                group_id: this.info.group_id,
                                group_name: this.state.groupName
                            })
                        }
                    ).then(result => {
                        if (result.code == 200) {
                            this.dataRequest("getGroupInfo");
                            this.setState({ GroupNamePoup: false });
                        }
                    }).catch(error => console.warn(error));
                    break;
            }
        });
    }


    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
                <TopBar
                    leftIcon="icon_back"
                    leftPress={() => this.props.navigation.goBack()}
                    title={`群聊信息(${this.state.memberList.length})`}
                />

                <View style={styles.main}>
                    <View style={styles.groupMemberContainer}>
                        {/* 遍历群成员 */}
                        {
                            this.state.memberList.map((item, index) => (
                                <View key={index} style={styles.groupMember}>
                                    <Image
                                        style={styles.avatar}
                                        source={{ uri: item.header_img }}
                                    />
                                    <Text numberOfLines={1} style={styles.groupName}>{item.remarks || item.username}</Text>
                                </View>
                            ))
                        }
                        <View style={styles.groupMember}>
                            <TouchableOpacity
                                style={[styles.avatar, styles.memberBtn]}
                                onPress={() => (
                                    this.props.navigation.navigate("FriendList",
                                        {
                                            info: this.info,
                                            member: this.state.memberList,
                                            page: "Inviter",
                                            refresh: () => this.refresh()
                                        })
                                )}>
                                <Text style={styles.btnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                        {
                            //判断是否为群主, 如果是则显示踢人按钮
                            this.state.isGroupMatser &&
                            <View style={styles.groupMember}>
                                <TouchableOpacity
                                    onPress={() => (
                                        this.props.navigation.navigate("FriendList",
                                            {
                                                info: this.info,
                                                member: this.state.memberList,
                                                page: "Kickout",
                                                refresh: () => this.refresh()
                                            })
                                    )}
                                    style={[styles.avatar, styles.memberBtn]}
                                >
                                    <Text style={styles.btnText}>-</Text>
                                </TouchableOpacity>
                            </View>
                        }

                        <View style={styles.openContainer}>
                            <Text style={styles.discribeText}>查看全部成员</Text>
                            <Image style={styles.icon_bottm} source={require("../assets/images/icon-bottom.png")} />
                        </View>
                    </View>
                    <TouchableOpacity disabled={!this.state.isGroupMatser} onPress={() => this.setState({ GroupNamePoup: true })}>
                        <View style={[styles.optionContainer, { marginTop: 10 }]}>
                            <Text style={styles.optionName}>群名称</Text>
                            <Text style={styles.discribeText}>{this.state.groupInfo.group_name}</Text>
                            <Image style={styles.icon_next} source={require('../assets/images/icon-next.png')} />

                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setState({ QrCodePoup: true })}>
                        <View style={[styles.optionContainer, { marginTop: 1 }]}>
                            <Text style={styles.optionName}>群二维码</Text>
                            <Image style={styles.icon_qrcode} source={require("../assets/images/icon-QRcode_black.png")} />
                            <Image style={styles.icon_next} source={require('../assets/images/icon-next.png')} />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => this.setState({ SelfNickNamePoup: true })}>
                        <View style={[styles.optionContainer, { marginTop: 10 }]}>
                            <Text style={styles.optionName}>我在本群的昵称</Text>
                            <Text style={styles.discribeText}>{this.state.selfShowName}</Text>
                            <Image style={styles.icon_next} source={require('../assets/images/icon-next.png')} />
                        </View>
                    </TouchableOpacity>
                    <View style={[styles.optionContainer, { marginTop: 1 }]}>
                        <Text style={styles.optionName}>显示群成员昵称</Text>
                        <Switch
                            trackColor={{ false: "#F0F0F0", true: "#196FF0" }}
                            onValueChange={value => this.setState({ falseSwitchIsOn: value })}
                            style={{ marginRight: 15, height: 30, width: 55 }}
                            value={this.state.falseSwitchIsOn}
                        />
                    </View>


                    <View style={[styles.optionContainer, { marginTop: 10 }]}>
                        <Text style={styles.redText}>清空聊天记录</Text>
                    </View>
                    <TouchableOpacity
                        onPress={
                            this.dataRequest.bind(this, "deGroup")
                        }
                        style={[styles.optionContainer, { marginTop: 10 }]}>
                        <Text style={styles.redText}>{this.state.isGroupMatser ? "删除并解散该群" : "删除并退出该群"}</Text>
                    </TouchableOpacity>
                </View>
                <this.QrCodePoup />
                <this.SelfNickNamePoup />
                <this.GroupNamePoup />
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
    groupMemberContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        backgroundColor: "#fff",
        borderTopWidth: 1,
        borderTopColor: "#eee",
        paddingTop: 18
    },
    groupMember: {
        width: "20%",
        justifyContent: "center",
        alignItems: "center",
        marginBottom: 20
    },
    avatar: {
        width: 54,
        height: 54,
        borderRadius: 27
    },
    groupName: {
        marginTop: 9,
        color: "#333",
        fontSize: 12,
        textAlign: "center",
        width: 50
    },
    memberBtn: {
        backgroundColor: "#ccc",
        marginBottom: 18
    },
    btnText: {
        color: "#fff",
        fontSize: 50,
        lineHeight: 54,
        textAlign: "center"
    },
    openContainer: {
        width: "100%",
        alignItems: "center",
        justifyContent: "center",
        marginTop: 10,
        marginBottom: 30,
        flexDirection: "row"
    },
    discribeText: {
        color: "#666",
        fontSize: 16
    },
    icon_bottm: {
        width: 12,
        height: 7,
        marginLeft: 8
    },
    optionContainer: {
        height: 58,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center"
    },
    optionName: {
        color: "#333",
        fontSize: 16,
        flex: 1,
        marginLeft: 15
    },
    icon_next: {
        width: 8,
        height: 12,
        marginHorizontal: 15
    },
    icon_qrcode: {
        width: 14,
        height: 14
    },
    redText: {
        color: "#FF1F1F",
        fontSize: 16,
        flex: 1,
        textAlign: "center"
    },
    qrCode: {
        marginVertical: 18,
        borderRadius: 6,
        width: 204,
        height: 204,
        borderWidth: 1,
        borderColor: "#eee"
    },
});

export default GroupInfo;