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
    TouchableHighlight,
} from 'react-native';
import {
    getConversation,
    ConversationType,
    removeConversation,
    getConversationList,
    addReceiveMessageListener
} from "rongcloud-react-native-imlib";
import {PermissionsAndroid} from 'react-native';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-community/async-storage';
import EventBus from 'react-native-event-bus'
import moment from 'moment';
import TopBar from './components/TopBar';
import {CONNECT_SUCCESS_RONGCLOUD, MESSAGE_CHANGE, CONVERSATION_REFRESH} from '../../static'
import Utils from "../../util/Utils";
import TipModel from '../common/TipModel'

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
            data: [],
            nativeEvent: null,
            showTipModal: false,
            isActive: false
        };
        this.index = -1;
        this.MaxHeight = Dimensions.get('window').height;
        this.MaxWidth = Dimensions.get('window').width;
    }


    componentWillMount() {
        this.getAllContacts();

        /**
         * 通过全局变量 CONNECT_SUCCESS_RONGCLOUD 判断是否连接容云成功，没有就监听连接成功的事件，
         * 然后再调用获会话列表的接口
         * 如果已经连接成功 直接调用获取会话列表的接口
         */
        if (global[CONNECT_SUCCESS_RONGCLOUD]) {
            this.suclistener && this.suclistener.remove();
            console.log('CONNECT_SUCCESS_RONGCLOUD 收到消息1')
            this.dataRequest();
            return;
        }
        this.suclistener = DeviceEventEmitter.addListener(CONNECT_SUCCESS_RONGCLOUD, (message) => {
            if (message['suc']) {
                console.log('CONNECT_SUCCESS_RONGCLOUD 收到消息2')
                this.dataRequest()
            }
        });

        /**
         * 监听接受消息
         * @type {import("react-native").EmitterSubscription}
         */
        this.receiveMes = addReceiveMessageListener((mes) => {
            if (mes) {
                console.log('messgage 收到消息');
                this.dataRequest();
            }
        })
    }

    componentDidMount(): void {
        /**
         * 监听有消息发送，有消息改变，刷新会话列表
         */
        // EventBus.getInstance().addListener(MESSAGE_CHANGE,this.mesageChanged=(data)=>{
        //     if (data['mesChanged']) {
        //         console.log('mesChanged', data);
        //         this.dataRequest()
        //     }
        // });
        this._navListener = this.props.navigation.addListener('didFocus', () => {
            if (global[CONVERSATION_REFRESH]) {
                this.dataRequest();
                global[CONVERSATION_REFRESH] = false;
            }
        })

    }

    componentWillUnmount() {
        this.suclistener && this.suclistener.remove();
        // EventBus.getInstance().removeListener(this.mesageChanged);
        this.receiveMes && this.receiveMes.remove()
    }

    /**
     * 获取手机通讯录 并上传
     * @returns {Promise<void>}
     */
    async getAllContacts() {
        try {
            const res = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
                {
                    'title': '提示',
                    'message': '彩信想获取你的通讯录信息'
                }
            );
            /**
             * contacts 返回的通讯录数据
             */
            Contacts.getAll(async (err, contacts) => {
                if (err === 'denied') {
                    alert('获取通讯录失败');
                    return
                }
                // console.log(contacts);
                /**
                 * contactsArr电话号码数组
                 */
                let key = 0;
                const contactsObj = contacts.reduce((obj, item, index) => {
                    const phoneNumbers = item['phoneNumbers'];
                    const len = phoneNumbers.length;
                    for (let i = 0; i < len; i++) {
                        obj[key + ""] = phoneNumbers[i]['number'];
                        key++;
                    }
                    return obj
                }, {});
                // console.log(contactsObj);
                const token = await AsyncStorage.getItem('token');
                const url = '/index/userinfo/mail_list';

                apiRequest(url, {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token,
                        mail: [{'0': '18780074005'}]
                    })
                }).then((res) => {
                    console.log(res)
                }, (e) => {
                    console.log(e)
                })
            })
        } catch (e) {

        }

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
                            return '[语音]';
                        default:
                            return '[文件]'
                    }
                } catch (e) {
                    return '[文件]'
                }
            }
        } else if (objectName === "RC:ImgMsg") {
            return '[图片]'
        }
    }

    /**
     * 跳转会话详情页面   特别注释 （根据容云返回的数据特点，根据targetId,senderUserId是否相等来判断取不同的用户信息展示，
     * 以及跳转到不同的会话详情页面，显示需要的相关信息 放在latestMessage['extra']的json字符串中，包含这条消息当前发送者以及接收者的相关信息 头像 id 名字）
     * @param item
     * @param info
     * @param selfInfo
     */
    goPage(item, info, selfInfo) {
        const {targetId, senderUserId} = item;
        const params = senderUserId === targetId ? {...selfInfo, userid: selfInfo['ry_userid']} : {...info};

        this.props.navigation.navigate('ChatBox', params)
    }

    /**
     * 根据数据特点获取显示的消息会话的个人或者群的头像
     */
    getHeaderImage(item, index, info, selfInfo) {
        const {targetId, senderUserId} = item;
        const isGroup = /group/.test(targetId);
        if (isGroup) return info['group_img'];
        if (targetId === senderUserId) {
            return selfInfo['header_img']
        } else {
            return info['header_img']
        }
    }

    /**
     * 根据数据特点获取显示的消息会话的个人或者群名字
     */
    getName(item, index, info, selfInfo) {
        const {targetId, senderUserId} = item;
        const isGroup = /group/.test(targetId);
        if (isGroup) return info['group_name'];
        if (targetId === senderUserId) {
            return selfInfo['username']
        } else {
            return info['nickname'] || info['username']
        }
    }

    /*
    * 选人列表的每一项
    **/
    renderItem(item, index) {
        const {latestMessage, targetId, sentTime, senderUserId} = item;
        const {extra} = latestMessage;
        const isGroup = /group/.test(targetId);
        try {
            const extraData = JSON.parse(extra);
            const {info, selfInfo} = extraData;
            return (
                <TouchableOpacity
                    style={{backgroundColor: this.state.isActive && this.index === index ? '#ddd' : '#fff'}}
                    onLongPress={(event) => {
                        const {nativeEvent} = event;
                        this.setState({nativeEvent, isActive: true}, () => {
                            this.index = index;
                            this.setState({showTipModal: true})
                        })
                    }}
                    onPress={() => this.goPage(item, info, selfInfo)}>
                    <View style={styles.container}>
                        <View style={styles.leftView}>
                            {/* <View style={styles.marker}></View> */}
                            <Image
                                style={styles.avatar}
                                defaultSource={require('../assets/images/default_avatar.png')}
                                source={{uri: this.getHeaderImage(item, index, info, selfInfo)}}
                            />
                        </View>
                        <View style={styles.main}>
                            <Text numberOfLines={1} style={styles.name}>
                                {this.getName(item, index, info, selfInfo)}
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
            callBack: async (res) => {
                console.log(res);

            }
        })
    }

    /**
     * 选择tip相应对应的操作
     * @param key
     */
    selectTipItem(key) {
        this.setState({showTipModal: false, isActive: false});
        switch (key) {
            case 'del':
                this._removeConversation();
                break
        }
    }

    async _removeConversation() {
        const {conversationType, targetId} = this.state.data[this.index];
        const res = await removeConversation(conversationType, targetId);
        this.setState((pre) => {
            const {data} = pre;
            data.splice(this.index, 1);
            return {data}
        })
    }

    render() {
        const {nativeEvent, showTipModal} = this.state;
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
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('Search')}
                                          style={styles.searchMain}>
                            <Image style={styles.icon} source={require("../assets/images/icon-search.png")}/>
                            <Text style={styles.text}>搜索</Text>
                        </TouchableOpacity>
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
                {showTipModal ? <TipModel
                        ref={(ref) => this.tipModal = ref}
                        hide={() => this.setState({showTipModal: false, isActive: false})}
                        callBack={(key) => this.selectTipItem(key)}
                        nativeEvent={nativeEvent}/>
                    : null
                }
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
