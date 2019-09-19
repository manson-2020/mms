import React from 'react';
import {
    Image,
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    Animated,
    StatusBar,
    Platform,
    TouchableWithoutFeedback,
    DeviceEventEmitter,
    Dimensions,
    TouchableOpacity,
    RefreshControl,
} from 'react-native';
import {getConversation, ConversationType, getConversationList} from "rongcloud-react-native-imlib";
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import TopBar from './components/TopBar';
import {CONNECT_SUCCESS_RONGCLOUD} from '../../static'
import Utils from "../../util/Utils";

class Message extends React.Component {

    constructor() {
        super();
        this.state = {
            fadeAnim: new Animated.Value(0),
            inputState: true,
            refreshing: false,
            showOption: true,
            showInput: false,
            flatlistHeight: 0,
            angle: -45,
            searchValue: false,
            data: []
        };
        this.MaxHeight = Dimensions.get('window').height;
        this.MaxWidth = Dimensions.get('window').width;
    }


    componentWillMount() {
        /**
         * 通过全局变量 CONNECT_SUCCESS_RONGCLOUD 判断是否连接容云成功，没有就监听连接成功的事件，
         * 然后再调用获会话列表的接口
         * 如果已经连接成功 直接调用获取会话列表的接口
         */
        if (global[CONNECT_SUCCESS_RONGCLOUD]) {
            this.suclistener && this.suclistener.remove();
            this.dataRequest();
            return;
        }
        this.suclistener = DeviceEventEmitter.addListener(CONNECT_SUCCESS_RONGCLOUD, (message) => {
            if (message['suc']) {
                this.dataRequest()
            }
        });
    }

    componentWillUnmount() {
        this.suclistener && this.suclistener.remove();
    }

    /**
     * 获取单个用户的基本信息
     * @param token
     * @param userid
     * @param index
     * @returns {Promise<any> | Promise}
     */
    getuserinfo(token, userid, index) {
        return new Promise((resolve, reject) => {
            apiRequest('/index/userinfo/getuserinfo', {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    token,
                    userid,
                })
            }).then((res) => {
                if (res.code == 200) {
                    resolve({...res.res, index})
                } else {
                    reject(res)
                }
            }, (e) => {
                reject(e)
            })
        });

    }

    /**
     * 获取会话列表
     */
    async dataRequest() {
        try {
            this.setState({refreshing: true});
            const list = await getConversationList().catch((e) => alert('获取容云数据失败'));
            if (list) {
                this.setState({
                    data: list,
                    refreshing: false
                })
            }
            console.log(list);
        } catch (e) {
            this.setState({refreshing: false});
            console.log(e)
        }
    }

    showOption() {
        this.setState({showOption: !this.state.showOption, angle: 0});
        Animated.timing(this.state.fadeAnim, {toValue: this.state.showOption ? 118 : 0, duration: 300,}).start();
    }

    /**
     * 根据消息类型 返回不同的文本
     **/
    getMesText(latestMessage) {
        const {objectName, extra, content} = latestMessage;
        if (objectName === 'RC:TxtMsg') {
            if (extra) {
                try {
                    const {type} = JSON.parse(extra);
                    if (type === 'redBags') {
                        return '[红包]'
                    } else {
                        return content
                    }

                } catch (e) {
                    return content
                }
            }
            return content
        } else if (objectName === 'RC:FileMsg') {
            if (extra) {
                try {
                    const {type} = JSON.parse(extra);
                    switch (type) {
                        case 'video':
                            return '[视频]';
                        case 'voice':
                            return ['语音']
                        default:
                            return '[文件]'
                    }
                } catch (e) {
                    return '[文件]'
                }
            }
        }
    }
    goPage(info){
        this.props.navigation.navigate('ChatBox', info)
    }
    renderItem(item, index) {
        const {latestMessage, targetId, sentTime} = item;
        const {extra} = latestMessage;
        const isGroup = /group/.test(targetId);
        try {
            const extraData = JSON.parse(extra);
            const {info, selfInfo} = extraData;
            return (
                <TouchableOpacity onPress={() =>this.goPage(info)}>
                    <View style={styles.container}>
                        <View style={styles.leftView}>
                            {/* <View style={styles.marker}></View> */}
                            <Image
                                style={styles.avatar}
                                defaultSource={require('../assets/images/default_avatar.png')}
                                source={{uri: isGroup ? info['group_img'] : info['header_img']}}
                            />
                        </View>
                        <View style={styles.main}>
                            <Text numberOfLines={1} style={styles.name}>
                                {isGroup ? info['group_name'] : info['nickname'] || info['username']}
                            </Text>
                            <Text numberOfLines={1} style={styles.msg}>
                                {isGroup ? (selfInfo['nickname'] || selfInfo['username']) + ':' : ''}{this.getMesText(latestMessage)}
                            </Text>
                        </View>
                        <View style={styles.rightView}>
                            <Text numberOfLines={1} style={styles.time}>{Utils.format(sentTime)}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            );
        } catch (e) {
            return null
        }
    }

    /**
     * 扫描二维码
     */
    openQrcode() {
        const {navigation} = this.props;
        navigation.navigate('QrScand', {
            /**
             * 接收扫描结果
             * @param res
             */
            callBack: (res) => {
                alert(JSON.stringify(res))
            }
        })
    }

    render() {
        return (
            <View style={{flex: 1}}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content'/>
                <TopBar title="彩信" rightIcon="icon_plus" rightPress={this.showOption.bind(this)}/>
                <Animated.View style={{overflow: "hidden", height: this.state.fadeAnim}}>
                    <View style={styles.optionMain}>
                        <TouchableOpacity onPress={() => this.openQrcode()}>
                            <View style={styles.optionContent}>
                                <Image style={{width: 22, height: 22}}
                                       source={require('../assets/images/scan-icon.png')}/>
                                <Text style={styles.optionText}>扫一扫</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.props.navigation.navigate('AddFriend', {refresh: () => this.showOption()})}>
                            <View style={styles.optionContent}>
                                <Image style={{width: 23, height: 21}}
                                       source={require('../assets/images/add_friend-icon.png')}/>
                                <Text style={styles.optionText}>添加朋友</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('FriendList', {
                            refresh: () => this.showOption(),
                            page: "InitGroupChat"
                        })}>
                            <View style={styles.optionContent}>
                                <Image style={{width: 27, height: 20}}
                                       source={require('../assets/images/invite_group-icon.png')}/>
                                <Text style={styles.optionText}>邀请群聊</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <View style={styles.searchContainer}>
                    <TouchableWithoutFeedback onPress={() => {
                        this.setState({showInput: !this.state.showInput})
                    }}>
                        <View style={styles.searchMain}>
                            <Image style={styles.icon} source={require("../assets/images/icon-search.png")}/>
                            {
                                this.state.showInput ?
                                    <TextInput
                                        autoFocus={true}
                                        onChangeText={value => this.setState({searchValue: value})}
                                        onBlur={() => {
                                            this.state.searchValue || this.setState({showInput: false})
                                        }}
                                        style={styles.input}/>
                                    :
                                    <Text style={styles.text}>搜索</Text>
                            }
                        </View>
                    </TouchableWithoutFeedback>
                </View>
                <FlatList
                    style={{flex: 1}}
                    onLayout={e => {
                        if (this.state.flatlistHeight < e.nativeEvent.layout.height) {
                            this.setState({flatlistHeight: e.nativeEvent.layout.height})
                        }
                    }}
                    data={this.state.data}
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({item, index}) => this.renderItem(item, index)}
                    refreshControl={
                        <RefreshControl
                            title={'Loading'}
                            refreshing={this.state.refreshing}
                            onRefresh={() => this.dataRequest()}
                        />
                    }
                    ListEmptyComponent={() => (
                        <View style={{
                            height: this.state.flatlistHeight,
                            backgroundColor: "#F5F5F5",
                            alignItems: "center",
                            justifyContent: "center"
                        }}>
                            <Image style={{width: 136, height: 99}}
                                   source={require("../assets/images/default_message_bg.png")}/>
                            <Text style={{color: "#999", marginTop: 16}}>暂无新消息</Text>
                        </View>
                    )}
                />
            </View>
        );
    }
}


const styles = StyleSheet.create({
    container: {
        marginLeft: 15,
        marginRight: 17,
        flexDirection: "row"
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25,
    },
    leftView: {
        marginTop: 15,
        flexGrow: 0,
        flexShrink: 0,
        flexBasis: 42,
        justifyContent: "center"
    },
    main: {
        flexGrow: 1,
        flexShrink: 1,
        flexBasis: 'auto',
        marginLeft: 18,
        marginTop: 18,
        marginBottom: 9,
        width: 100
    },
    rightView: {
        flexGrow: 0,
        flexShrink: 0
    },
    name: {
        color: "#333",
        fontSize: 16,
        fontWeight: "500"
    },
    msg: {
        color: "#999",
        marginRight: 12,
        marginTop: 10
    },
    time: {
        marginTop: 21,
        color: "#999",
        fontSize: 12
    },
    marker: {
        position: "absolute",
        right: 0,
        top: 0,
        width: 9,
        height: 9,
        backgroundColor: "#FF1F1F",
        borderRadius: 4.5
    },
    searchContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderTopWidth: 1,
        borderTopColor: "#eee",
        borderBottomWidth: 1,
        borderBottomColor: "#eee"
    },
    searchMain: {
        width: 345,
        height: 32,
        backgroundColor: "#eee",
        borderRadius: 16,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: 'row'
    },
    icon: {
        width: 12,
        height: 12,
        paddingLeft: 12
    },
    input: {
        height: 32,
        width: 297,
        textAlign: "center",
        padding: 0,
        margin: 0,
        paddingLeft: 12,
        paddingRight: 12
    },
    text: {
        fontSize: 14,
        color: "#ccc",
        paddingLeft: 12
    },
    optionMain: {
        height: 118,
        width: 375,
        flexDirection: 'row',
        justifyContent: "space-around",
        alignItems: "center",
        backgroundColor: "#fff",
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 2
    },
    optionContent: {
        alignItems: "center"
    },
    optionText: {
        paddingTop: 10,
        fontSize: 12,
        color: "#333"
    }
});

export default Message;
