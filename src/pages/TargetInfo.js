import React from 'react';
import { YellowBox, StatusBar, Platform, View, Image, Text, BackHandler, TextInput, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';

class TargetInfo extends React.Component {
    constructor(props) {
        super(props);
        this.targetInfo = props.navigation.state.params.targetInfo;
        this.state = {
            userInfo: Object(),
            groupInfo: Object(),
            isSelf: false,
            remarks: null,
            remarksInput: false
        }
        YellowBox.ignoreWarnings([
            'Warning: componentWillMount is deprecated',
            'Warning: componentWillReceiveProps is deprecated',
        ]);
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }

    onBackButtonPressAndroid = () => {
        this.props.navigation.navigate("AuthLoading")
        return true; //返回true, 不执行系统操作。
    }

    componentWillMount() {
        this.dataRequest(this.targetInfo.userid ? "getUserInfo" : "getGroupInfo");
    }

    async dataRequest(params) {
        const token = await AsyncStorage.getItem(`token`);
        const userid = await AsyncStorage.getItem(`userid`);

        switch (params) {
            case "getUserInfo":
                this.setState({ isSelf: this.targetInfo.userid == userid })
                apiRequest('/index/userinfo/getuserinfo', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: token,
                        userid: this.targetInfo.userid || this.targetInfo.ry_userid,
                    })
                }).then(result => result.code == 200 && this.setState({ userInfo: result.res }));
                break;
            case "getGroupInfo":
                apiRequest('/index/group/group_info',
                    {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token,
                            group_id: this.targetInfo.groupid
                        })
                    }
                ).then(result => {
                    result.code == 200 && this.setState({ groupInfo: result.res });
                }).catch(error => console.log(error));
                break;
            case "addFriend":
                apiRequest('/index/friend/send', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: token,
                        userid: this.state.userInfo.ry_userid,
                    })
                }).then(result => {
                    if (result.code == 200) {
                        this.props.navigation.navigate("AuthLoading")
                    } else {
                        alert(result.msg)
                    }
                });
                break;
            case "settingRemarks":
                if (this.state.remarks != null) {
                    apiRequest('/index/friend/set_nickname', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token,
                            userid: this.state.userInfo.ry_userid,
                            nickname: this.state.remarks
                        })
                    }).then(result => {
                        if (result.code == 200) {
                            this.dataRequest("getUserInfo");
                        }
                    })
                }
                this.remarksInput.blur();
                this.setState({ remarksInput: false });
                break;
            case "joinGroup":
                apiRequest('/index/group/join_group', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token,
                        group_userid: userid,
                        group_id: this.targetInfo.groupid
                    })
                }).then(result => {
                    // console.warn(result);
                    alert(result.msg);
                    this.props.navigation.navigate("AuthLoading")
                })
                break;
        }
    }

    render() {
        return (
            <LinearGradient colors={['#333', '#494949']} style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='light-content' />
                {
                    this.state.userInfo.is_friend ?
                        <TopBar
                            leftIcon="icon_back_white"
                            leftPress={() => this.props.navigation.navigate("AuthLoading")}
                            rightIcon="icon_option"
                            rightBtnStyle={styles.rightBtnStyle}
                            rightPress={() => { this.props.navigation.navigate('DataSetting', this.targetInfo) }}
                        />
                        :
                        <TopBar
                            leftIcon="icon_back_white"
                            leftPress={() => this.props.navigation.navigate("AuthLoading")}
                            rightIcon="icon_option"
                            rightBtnStyle={styles.rightBtnStyle}
                            rightPress={() => alert("添加好友过后才能点哦～")}
                        />
                }
                <TouchableWithoutFeedback onPress={() => this.remarksInput ? this.setState({ remarksInput: false }) : false}>

                    <View style={styles.deviceContainer}>

                        <View style={styles.main}>
                            {this.targetInfo.userid ?
                                <View style={{ flexDirection: "row", marginTop: 56, alignItems: "flex-end" }}>
                                    {/* 头像 */}
                                    <Image style={styles.avatar} source={{ uri: this.state.userInfo.header_img }} />

                                    {this.state.userInfo.sex == "男" ?
                                        <Image style={styles.iconSex} source={require('../assets/images/icon-boy.png')} />
                                        :
                                        this.state.userInfo.sex == "女" ?
                                            <Image style={styles.iconSex} source={require('../assets/images/icon-girl.png')} />
                                            :
                                            false
                                    }
                                </View>

                                :

                                Boolean(Object.values(this.state.groupInfo).length) &&
                                (this.state.groupInfo.header_img.length == 4 ?
                                    <View style={styles.groupImage}>
                                        {
                                            this.state.groupInfo.header_img.map((avatarItem, index) => (
                                                <Image key={index} style={{ width: "50%", height: "50%" }} source={{ uri: avatarItem }} />
                                            ))
                                        }
                                    </View>
                                    :
                                    this.state.groupInfo.header_img.length == 3 ?
                                        <View style={styles.groupImage}>
                                            <Image style={{ flex: 1 }} source={{ uri: this.state.groupInfo.header_img[0] }} />
                                            <View style={{ flex: 1 }}>
                                                <Image style={{ width: "100%", height: "50%" }} source={{ uri: this.state.groupInfo.header_img[1] }} />
                                                <Image style={{ width: "100%", height: "50%" }} source={{ uri: this.state.groupInfo.header_img[2] }} />
                                            </View>
                                        </View>
                                        :
                                        <View style={styles.groupImage}>
                                            {
                                                this.state.groupInfo.header_img.map((avatarItem, index) => (
                                                    <Image key={index} style={{ flex: 1 }} source={{ uri: avatarItem }} />
                                                ))
                                            }
                                        </View>)

                            }


                            {/* 用户详细信息以及修改备注 */}
                            <View style={[styles.nameContainer, !(this.state.userInfo.nickname || this.state.userInfo.username) && { display: "none" }]}>
                                <View style={[styles.iconEditBtn, { display: this.state.userInfo.is_friend ? "flex" : "none" }]}></View>
                                {
                                    this.state.remarksInput ?
                                        <TextInput
                                            ref={remarksInput => this.remarksInput = remarksInput}
                                            style={styles.name}
                                            autoFocus={true}
                                            placeholder="设置备注"
                                            onChangeText={remarks => this.setState({ remarks: remarks })}
                                            defaultValue={this.state.userInfo.nickname}
                                            value={this.state.remarks}
                                            blurOnSubmit={false}
                                            returnKeyType="next"
                                            onSubmitEditing={this.dataRequest.bind(this, "settingRemarks")}
                                        />
                                        :
                                        <Text style={styles.name}>
                                            {this.state.userInfo.nickname || this.state.userInfo.username}
                                        </Text>
                                }
                                {
                                    !this.state.isSelf ?
                                        <TouchableOpacity onPress={() => this.setState({ remarksInput: true })}>
                                            <View style={[styles.iconEditBtn, { display: this.state.userInfo.is_friend ? "flex" : "none" }]}>
                                                <Image style={styles.iconEdit} source={require('../assets/images/icon-edit.png')} />
                                            </View>
                                        </TouchableOpacity>
                                        :
                                        <View style={styles.iconEditBtn} />
                                }
                            </View>

                            <Text style={[styles.name, { display: this.state.groupInfo.group_name ? "flex" : "none" }]}>
                                {this.state.groupInfo.group_name}
                            </Text>
                            <Text style={[styles.infoText, { display: this.state.groupInfo.count ? "flex" : "none" }]}>
                                ( {this.state.groupInfo.count} 人 )
                            </Text>

                            <Text style={[styles.infoText, { display: this.state.userInfo.lxname ? "flex" : "none" }]}>
                                彩信号: {this.state.userInfo.lxname}
                            </Text>
                            <Text style={[styles.infoText, { display: this.state.userInfo.nickname ? "flex" : "none" }]}>
                                昵称: {this.state.userInfo.username}
                            </Text>

                            <Text style={[styles.infoText, { display: this.state.userInfo.city ? "flex" : "none" }]}>
                                地区: {this.state.userInfo.city}
                            </Text>


                            {/* <Text style={styles.lifeCircle}>他/她的生活圈</Text>
                            <View style={styles.showImages}>
                                <Image style={styles.lifeCircleImages} />
                                <Image style={styles.lifeCircleImages} />
                                <Image style={styles.lifeCircleImages} />
                                <Image style={styles.lifeCircleImages} />
                                <Image style={{ width: 7, height: 12 }} source={require('../assets/images/icon-next.png')} />
                            </View> */}


                            <Text style={styles.line}></Text>
                            {Boolean(Object.values(this.state.userInfo).length) &&
                                (this.state.userInfo.is_friend ?
                                    <View style={styles.optionContainer}>
                                        <TouchableOpacity
                                            onPress={() => this.props.navigation.navigate('ChatBox', this.targetInfo)
                                            }>
                                            <View style={styles.optionView}>
                                                <Image style={styles.iconBtn} source={require('../assets/images/icon-sendMsg.png')} />
                                                <Text style={styles.optionText}>发消息</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <View style={styles.optionView}>
                                                <Image style={styles.iconBtn} source={require('../assets/images/icon-voice_btn.png')} />
                                                <Text style={styles.optionText}>语音通话</Text>
                                            </View>
                                        </TouchableOpacity>
                                        <TouchableOpacity>
                                            <View style={styles.optionView}>
                                                <Image style={styles.iconBtn} source={require('../assets/images/icon-video_btn.png')} />
                                                <Text style={styles.optionText}>视频通话</Text>
                                            </View>
                                        </TouchableOpacity>
                                    </View>
                                    :
                                    <TouchableOpacity onPress={this.dataRequest.bind(this, "addFriend")}>
                                        <ImageBackground style={{ width: 220, height: 73, justifyContent: "center", alignItems: "center" }} source={require('../assets/images/blueBtn-bg.png')}>
                                            <Text style={{ color: "#fff", fontSize: 16 }}>添加好友</Text>
                                        </ImageBackground>
                                    </TouchableOpacity>
                                )
                            }

                            {
                                Boolean(Object.values(this.state.groupInfo).length) &&
                                <TouchableOpacity onPress={() => this.dataRequest("joinGroup")}>
                                    <ImageBackground style={{ width: 220, height: 73, justifyContent: "center", alignItems: "center" }} source={require('../assets/images/blueBtn-bg.png')}>
                                        <Text style={{ color: "#fff", fontSize: 16 }}>加入群聊</Text>
                                    </ImageBackground>
                                </TouchableOpacity>
                            }
                        </View>


                    </View>

                </TouchableWithoutFeedback>
            </LinearGradient>

        )
    }
}


const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    rightBtnStyle: {
        width: 16,
        height: 8
    },
    deviceContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    },
    main: {
        width: 300,
        backgroundColor: "rgba(255,255,255,0.92)",
        borderRadius: 5,
        alignItems: "center",
        justifyContent: "center",
        zIndex: 99
    },
    avatar: {
        width: 75,
        height: 75,
        borderRadius: 37.5
    },
    nameContainer: {
        marginTop: 15,
        flexDirection: 'row',
        alignItems: "center",
        justifyContent: "center",
    },
    name: {
        color: "#333",
        margin: 0,
        padding: 0,
        fontSize: 24,
        textAlign: "center",
        marginTop: 9
    },
    iconEdit: {
        width: 10,
        height: 10
    },
    iconEditBtn: {
        width: 25,
        height: 25,
        alignItems: "center",
        justifyContent: "center"
    },
    infoText: {
        color: "#666",
        fontSize: 14,
        marginTop: 17,
        marginTop: 9
    },
    lifeCircle: {
        marginTop: 37,
        color: '#333',
        fontSize: 14,
        fontWeight: 'bold'
    },
    showImages: {
        marginTop: 15,
        width: 215,
        height: 50,
        flexDirection: "row",
        alignItems: "center"
    },
    lifeCircleImages: {
        marginRight: 5,
        width: 50,
        height: 50,
        borderRadius: 5,
        backgroundColor: '#ddd'
    },
    line: {
        marginTop: 18,
        width: 255,
        height: 1,
        backgroundColor: 'rgba(51, 51, 51, 0.08)',
    },
    optionContainer: {
        flexDirection: "row",
        width: 223,
        marginTop: 18,
        alignItems: "center",
        justifyContent: "space-between"
    },
    optionView: {
        alignItems: "center",
        marginBottom: 36
    },
    optionText: {
        color: "#666",
        fontSize: 12,
        marginTop: 6
    },
    iconBtn: {
        width: 50,
        height: 50
    },
    iconSex: {
        width: 14,
        height: 14,
        marginLeft: -18
    },
    groupImage: {
        width: 75,
        marginTop: 30,
        height: 75,
        backgroundColor: "#eee",
        borderRadius: 37.5,
        flexDirection: "row",
        flexWrap: "wrap",
        overflow: "hidden"
    },
});

export default TargetInfo;
