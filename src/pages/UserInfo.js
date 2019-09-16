import React from 'react';
import { YellowBox, StatusBar, View, Image, Text, TextInput, StyleSheet, ImageBackground, Dimensions, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';

class UserInfo extends React.Component {
    constructor(props) {
        super(props);
        this.userInfo = props.navigation.state.params.userInfo;
        this.state = {
            userInfo: Object(),
            remarks: null,
            remarksInput: false
        }
        YellowBox.ignoreWarnings([
            'Warning: componentWillMount is deprecated',
            'Warning: componentWillReceiveProps is deprecated',
        ]);
    }

    componentWillMount() {
        this.dataRequest("getUserInfo");
    }

    dataRequest(params) {
        AsyncStorage.getItem(`token`).then(token => {
            if (params == "getUserInfo") {
                apiRequest('/index/userinfo/getuserinfo', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: token,
                        userid: this.userInfo.userid || this.userInfo.ry_userid,
                    })
                }).then(result => result.code == 200 ? this.setState({ userInfo: result.res }) : false)
            } else if (params == "addFriend") {
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
            } else if (params == "settingRemarks") {
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
            }
        })
    }

    render() {
        return (
            <LinearGradient colors={['#333', '#494949']} style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='light-content' />
                {
                    this.state.userInfo.is_friend ?
                        <TopBar
                            leftIcon="icon_back_white"
                            leftPress={() => this.props.navigation.goBack()}
                            rightIcon="icon_option"
                            rightBtnStyle={styles.rightBtnStyle}
                            rightPress={() => { this.props.navigation.navigate('DataSetting', this.userInfo) }}
                        />
                        :
                        <TopBar
                            leftIcon="icon_back_white"
                            leftPress={() => this.props.navigation.goBack()}
                            rightIcon="icon_option"
                            rightBtnStyle={styles.rightBtnStyle}
                            rightPress={() => alert("添加好友过后才能点哦～")}
                        />
                }
                <TouchableWithoutFeedback onPress={() => this.remarksInput ? this.setState({ remarksInput: false }) : false}>

                    <View style={styles.deviceContainer}>
                        <View style={styles.main}>
                            <View style={{ flexDirection: "row", marginTop: 56, alignItems: "flex-end" }}>
                                <Image style={styles.avatar} source={{ uri: this.state.userInfo.header_img }} />
                                {
                                    this.state.userInfo.sex == "男" ?
                                        <Image style={styles.iconSex} source={require('../assets/images/icon-boy.png')} />
                                        :
                                        this.state.userInfo.sex == "女" ?
                                            <Image style={styles.iconSex} source={require('../assets/images/icon-girl.png')} />
                                            :
                                            false
                                }
                            </View>

                            <View style={styles.nameContainer}>
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

                                <TouchableOpacity
                                    onPress={() => this.setState({ remarksInput: true })}
                                >
                                    <View style={[styles.iconEditBtn, { display: this.state.userInfo.is_friend ? "flex" : "none" }]}>
                                        <Image style={styles.iconEdit} source={require('../assets/images/icon-edit.png')} />
                                    </View>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.infoText}>彩信号: {this.state.userInfo.lxname}</Text>

                            <Text style={[styles.infoText, styles.content, { display: this.state.userInfo.nickname ? "flex" : "none" }]}>
                                昵称: {this.state.userInfo.username}
                            </Text>

                            <Text style={[styles.infoText, styles.content, { display: this.state.userInfo.city ? "flex" : "none" }]}>
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
                            {Boolean(Object.values(this.state.userInfo).length) && (this.state.userInfo.is_friend ?
                                <View style={styles.optionContainer}>
                                    <TouchableOpacity
                                        onPress={() => this.props.navigation.navigate('ChatBox', this.userInfo)
                                        }>
                                        <View style={styles.optionView}>
                                            <Image style={styles.iconBtn} source={require('../assets/images/icon-sendMsg.png')} />
                                            <Text style={styles.optionText}>
                                                发消息</Text>
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
                            )}
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
        textAlign: "center"
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
        marginTop: 17
    },
    content: {
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
        marginTop: 20,
        marginBottom: 20,
        width: 255,
        height: 1,
        backgroundColor: 'rgba(51, 51, 51, 0.08)',
    },
    optionContainer: {
        flexDirection: "row",
        width: 223,
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
    }
});

export default UserInfo;