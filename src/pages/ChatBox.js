import React from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TextInput,
    TouchableWithoutFeedback,
    TouchableOpacity,
    TouchableHighlight,
    StatusBar,
    FlatList,
    Animated,
    ActivityIndicator,
    Keyboard,
} from 'react-native';
import TopBar from './components/TopBar';
import AsyncStorage from '@react-native-community/async-storage';
import MediaUtils from '../../util/MediaUtils'
import Camera from '../common/Camera'
import RecordVoice from '../common/RecordVoice'
import PlayVoiceMes from '../common/PlayVoice'
import {
    sendMessage,
    ConversationType,
    ObjectName,
    getHistoryMessages,
    addReceiveMessageListener,
    cancelSendMediaMessage
} from "rongcloud-react-native-imlib";
import RNThumbnail from "react-native-thumbnail";
import VideoPlay from '../common/VideoPlay'
import ViewerImageModal from '../common/ViewerImageModal'
import GetRedBags from '../common/GetRedBags'


// 18981796331


class ChatBox extends React.Component {
    constructor(props) {
        super(props);
        this.imageUrls = [];
        this.info = props.navigation.state.params;
        this.state = {
            animatedValue: new Animated.Value(0),
            isShow: false,
            isLoadMore: false,
            showFoot: 1,
            selfInfo: [],
            userInfo: [],
            msgData: [],
            msgText: '',
            targetImgLoadErr: false,
            selfImgLoadErr: false,
            groupListInfo: [],
            activeVideoUrl: null,
            activeposter: null,
            imageUrls: [],
            imgActiveIndex: 0,
            showVoiceBtn: false,
            currentVoice: '',
            redBagsItem: null,
        }
        ;
        this.dataNum = 9;
        this.bottomData = [
            {
                width: 24,
                height: 22,
                text: '图片',
                source: require('../assets/images/icon-picture.png'),
                onClick: () => this.checkedImages()
            },
            {
                width: 26,
                height: 21,
                text: '拍摄',
                source: require('../assets/images/icon-photo.png'),
                onClick: () => this.camera.showModal()
            }
            ,
            {
                width: 22,
                height: 25,
                text: '位置',
                source: require('../assets/images/icon-position.png'),
                onClick: () => {
                }
            },
            {
                width: 27,
                height: 19,
                text: '个人名片',
                source: require('../assets/images/icon-card.png'),
                onClick: (hb_orderid) => this.props.navigation.navigate('SendRedBags', {
                    targetId: this.targetId,
                    isPerson: !/group/.test(this.targetId),
                    callBack: (hb_orderid, suc) => {
                        console.log(hb_orderid)
                        if (suc) {
                            const content = {
                                objectName: ObjectName.Text,
                                content: "红包",
                                extra: JSON.stringify({
                                    type: 'redBags',
                                    hb_orderid,
                                    isGet: false,
                                })
                            };
                            MediaUtils.sendMessage({
                                targetId: this.targetId,
                                content: content,
                                getLocalMes: (itemMes) => {
                                    const nmes = {
                                        ...itemMes,
                                        senderUserId: this.state.selfInfo.ry_userid,
                                        conversationType: this.conversationType,
                                    };
                                    this.setState((pre) => ({
                                        msgData: [nmes, ...pre.msgData],
                                    }));
                                }
                            })
                        }
                    }
                })
            },

            {
                width: 18,
                height: 24,
                text: '语音聊天',
                source: require('../assets/images/icon-voiceChat.png'),
                onClick: () => {
                }
            },
            {
                width: 27,
                height: 19,
                text: '视频聊天',
                source: require('../assets/images/icon-videoChat.png'),
                onClick: () => {
                }
            },
            {
                width: 27,
                height: 20,
                text: '邀请群聊',
                source: require('../assets/images/invite_group-icon.png'),
                onClick: () => {
                }
            },
            {
                width: 24,
                height: 23,
                text: '收藏',
                source: require('../assets/images/icon-collection.png'),
                onClick: () => {
                }
            }
        ];
        this.targetId = this.info.userid || this.info.group_id;
        this.conversationType = (this.targetId.indexOf('group') == -1) ? ConversationType.PRIVATE : ConversationType.GROUP
    }

    componentWillMount() {
        AsyncStorage.multiGet([`token`, `userid`]).then(value => {
            //获取个人信息
            apiRequest("/index/userinfo/getinfo",
                {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: value[0][1]
                    })
                }
            ).then(result => {
                console.log('sef', result);
                this.setState({
                    selfInfo: result.res
                });
            }).catch(error => console.warn(error));

            if (this.info.group_id) {
                apiRequest('/index/group/get_groupuser',
                    {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: value[0][1],
                            group_id: this.info.group_id
                        })
                    }
                ).then(result => {
                    //将获取到的群成员存入以对应的userid为键的对象中
                    let obj = Object();
                    result.res.map(item => {
                        obj[item.ry_userid] = item;
                    });
                    console.log('groupListInfo', obj);
                    this.setState({
                        groupListInfo: obj
                    }, () => {
                        getHistoryMessages(ConversationType.GROUP, this.targetId, [ObjectName.Text, ObjectName.Image, ObjectName.File], 0, 30)
                            .then(result => {
                                console.log(result)
                                const imageUrls = [];
                                result.map((item) => {
                                    const {objectName, remote, local, thumbnail} = item['content'];
                                    if (objectName === 'RC:ImgMsg') {
                                        imageUrls.push({
                                            url: local || thumbnail || remote, freeHeight: true
                                        })
                                    }

                                });
                                this.setState({msgData: result, imageUrls});
                            });
                    });
                }).catch(error => console.warn(error));
            } else {
                apiRequest('/index/userinfo/getuserinfo', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: value[0][1],
                        userid: this.targetId,
                    })
                }).then(req => {
                    console.log('userInfo', req.res)
                    this.setState({userInfo: req.res})
                })

                getHistoryMessages(ConversationType.PRIVATE, this.targetId, [ObjectName.Text, ObjectName.Image, ObjectName.File], 0, 30)
                    .then(result => {
                        console.log(result)
                        const imageUrls = [];
                        result.map((item) => {
                            const {objectName, remote, local, thumbnail} = item['content'];
                            if (objectName === 'RC:ImgMsg') {
                                imageUrls.push({
                                    url: local || thumbnail || remote, freeHeight: true
                                })
                            }

                        });
                        this.setState({msgData: result, imageUrls});
                    });

            }
        });


        //监听接收消息
        this.listener = addReceiveMessageListener(result => {
            if (result.message.targetId == this.targetId) {
                console.log('监听接收消息', msgData);
                this.setState({
                    msgData: [result.message, ...this.state.msgData]
                });
            }
        });
    }

    componentWillUnmount() {
        this.listener = null;
    }


    _createListFooter = () => {
        return (
            <View style={styles.footerView}>
                {this.state.showFoot === 1 && <ActivityIndicator/>}
                <Text style={{color: 'red'}}>
                    {this.state.showFoot === 1 ? '正在加载更多数据...' : '没有更多数据了'}
                </Text>
            </View>
        )
    }

    getData() {
        // this.msgData = this.data.msgData.slice(0, this.dataNum);
    }

    onLoadMore() {
        /*  this.setState({ isLoadMore: true });
         this.dataNum += 10;
         this.getData(); */
    }


    ChatFrame(item, index) {
        const {groupListInfo, selfInfo, userInfo} = this.state;
        const {senderUserId} = item;
        const targetHeader = !/group/.test(this.targetId) ? userInfo.header_img : (groupListInfo[senderUserId] ? groupListInfo[senderUserId].header_img : "");
        const targetName = groupListInfo[senderUserId] && (groupListInfo[senderUserId]['nickname'] || groupListInfo[senderUserId]['username']) || '';
        return (
            <View>
                {item.senderUserId == this.state.selfInfo.ry_userid ?
                    <View style={{
                        flexDirection: "row",
                        marginBottom: 15,
                        marginTop: !index ? 15 : 0,
                        justifyContent: "flex-end",
                        marginRight: 15
                    }}>
                        <View>
                            {
                                this.info.group_id &&
                                <Text style={{
                                    color: "#999",
                                    fontSize: 12,
                                    textAlign: "right",
                                    marginRight: 9,
                                    marginBottom: 6
                                }}>
                                    {
                                        targetName
                                    }
                                </Text>
                            }
                            <View style={{
                                backgroundColor: "#6fff5f",
                                maxWidth: 220,
                                marginRight: 10,
                                borderRadius: 5
                            }}>
                                {this.showMesByObjectName(item, index, true)}
                            </View>
                        </View>
                        <Image
                            style={{width: 38, height: 38, borderRadius: 19}}
                            source={{uri: selfInfo.header_img}}/>

                    </View>
                    :
                    <View style={{flexDirection: "row", marginBottom: 15, marginLeft: 15, marginTop: !index ? 15 : 0}}>
                        <TouchableWithoutFeedback onPress={() => this.props.navigation.navigate('UserInfo')}>
                            <Image
                                style={{width: 38, height: 38, borderRadius: 19}}
                                source={{
                                    uri: targetHeader
                                }}
                            />
                        </TouchableWithoutFeedback>
                        <View>
                            {
                                this.info.group_id &&
                                <Text style={{
                                    color: "#999",
                                    fontSize: 12,
                                    textAlign: "left",
                                    marginLeft: 9,
                                    marginBottom: 6
                                }}>
                                    {
                                        targetName
                                    }
                                </Text>
                            }
                            <View style={{backgroundColor: "#fff", maxWidth: 220, marginLeft: 10, borderRadius: 5}}>
                                <View style={{
                                    color: "#333",
                                    fontSize: 16,
                                    lineHeight: 21
                                }}>{this.showMesByObjectName(item, index, false,)}</View>
                            </View>
                        </View>
                    </View>
                }
            </View>

        );
    }

    getBottomOption() {
        return (
            <View style={styles.moreOption}>
                {
                    this.bottomData.map((item, index) => (
                        <TouchableWithoutFeedback key={index} onPress={() => item.onClick()}>
                            <View style={[styles.optionContainer, {marginTop: index >= 4 ? 40 : 0}]}>
                                <Image style={{width: item.width, height: item.height}} source={item.source}/>
                                <Text style={styles.optionText}>{item.text}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    ))
                }
            </View>
        );
    }

    showMore() {
        this.setState({
            isShow: !this.state.isShow
        });
        Animated.timing(this.state.animatedValue, {toValue: this.state.isShow ? 0 : 215, duration: 300,}).start();
    }

    sendMessage() {
        // this.setState({ msgText: msgText.replace(/\n/g, "") })

        if (this.state.msgText) {

            const message = {
                conversationType: (this.targetId.indexOf('group') == -1) ? ConversationType.PRIVATE : ConversationType.GROUP,
                targetId: this.targetId,
                senderUserId: this.state.selfInfo.ry_userid,
                content: {objectName: ObjectName.Text, content: this.state.msgText.replace(/\n/g, "")}
            }
            sendMessage(message, {
                success: messageId => {
                    this.setState({
                        msgData: [message, ...this.state.msgData],
                        msgText: ''
                    })
                },
                error: errorCode => {
                    console.warn("发送失败：" + errorCode);
                }
            });
        } else {
            return false;
        }
    }

    /**
     * 选择相册并发送图片消息
     */
    checkedImages() {
        MediaUtils.openPicker({mediaType: 'any', multiple: true}).then((res) => {

            /**
             * 根据选择的图片的数量循环上传
             */
            res.forEach(async (item) => {
                const {path, mime} = item;
                let content = null;
                if (/video/.test(mime)) {
                    try {
                        const thumbnail = await RNThumbnail.get(path);
                        content = {
                            objectName: ObjectName.File, local: path, extra: JSON.stringify({
                                type: 'video',
                                path: thumbnail.path
                            })
                        }
                    } catch (e) {
                        alert('视频截图失败')
                    }
                } else {
                    content = {objectName: ObjectName.Image, local: path};
                }
                //发送
                content && MediaUtils.sendMediaMessage({
                    content,
                    targetId: this.targetId,
                    getLocalMes: (itemMes) => {
                        const nMes = {
                            ...itemMes,
                            senderUserId: this.state.selfInfo.ry_userid,
                            conversationType: this.conversationType
                        };
                        this.setState((pre) => {
                            if (/video/.test(mime)) {
                                return {msgData: [nMes, ...pre.msgData],}
                            } else {
                                return {
                                    msgData: [nMes, ...pre.msgData],
                                    imageUrls: [{url: path, freeHeight: true}, ...pre.imageUrls]
                                }
                            }
                        });
                    },
                    success: (messageId, itemMes) => {
                    }
                })
            });
        }, (error) => {
            console.log(error)
        })
    }

    /**
     * 打开红包
     */
    openRedBags(item, index, isSelf,extra) {
        this.setState((pre) => {
            let redBagsItem = {};
            if (isSelf) {
                redBagsItem = {
                    ...pre.selfInfo,
                };
                return null
            } else {
                if (/group/.test(this.targetId)) {
                    redBagsItem = {
                        ...pre.groupListInfo[senderUserId],
                    }
                } else {
                    redBagsItem = {
                        ...pre.userInfo,
                    }
                }
            }
            return {
                redBagsItem: {...redBagsItem, ...JSON.parse(extra), messageUId: item['messageUId'], index}
            }
        }, () => {
            this.getRedBags.show()
        });
    }

    _renderTxtMsg(item, index, isSelf) {
        const {extra, content, senderUserId} = item.content;
        if (!extra) {
            return <Text style={[styles.textMes, {color: isSelf ? '#fff' : '#333'}]}>
                {content}
            </Text>;
        }
        try {
            const {hb_orderid, type, isGet} = JSON.parse(extra);
            if (type === 'redBags') {
                return <TouchableOpacity activeOpacity={1}
                                         onPress={() => this.openRedBags(item, index, isSelf,extra)}
                                         style={styles.redBagsWrap}>
                    <View style={[styles.redBagsTop, {backgroundColor: isGet ? '#BC3D3D' : '#FF5353'}]}>
                        <Image style={{width: 32, height: 37, marginRight: 12}}
                               source={isGet ? require('../assets/img/img-open-red-envelope.png') : require('../assets/img/img-red-envelope.png')}/>
                        <Text style={{color: '#fff'}}>恭喜发财，红包拿来</Text>
                    </View>
                    <Text style={{paddingLeft: 15}}>彩信红包</Text>
                </TouchableOpacity>
            }
        } catch (e) {
            return null
        }


    }

    /**
     *通过消息的不同类型显示不同的ui，以及不同的操作
     * @param item
     * @returns {*}
     */
    showMesByObjectName(item, index, isSelf) {
        const {content} = item;
        const {remote, thumbnail, local, objectName, extra} = content;
        switch (objectName) {
            /**
             * 文本消息
             */
            case 'RC:TxtMsg':
                return this._renderTxtMsg(item, index, isSelf);
            /**
             * 图片消息
             */
            case 'RC:ImgMsg':
                return <TouchableOpacity onPress={() => this.viewImages(local, thumbnail, remote)}>
                    <Image style={{width: 100, height: 150,}} source={{uri: local || thumbnail || remote}}/>
                </TouchableOpacity>;
            /**
             * 文件消息
             */
            case 'RC:FileMsg':
                let extradata = null;
                try {
                    extradata = extra && JSON.parse(extra);
                } catch (e) {
                    return null
                }
                // const extradata = extra && JSON.parse(extra);
                if (!extradata) return null;
                if (extradata['type'] === 'video') {
                    return <TouchableOpacity onPress={() => this.setState({
                        activeVideoUrl: local || remote,
                        activeposter: extra
                    })} style={styles.videoWrap}>
                        <Image style={{width: '100%', height: '100%',}} source={{uri: extradata['path'] || local}}/>
                        <View style={styles.playBtnWrap}>
                            <Image style={{width: 40, height: 40,}} source={require('../assets/images/play-btn.png')}/>
                        </View>
                    </TouchableOpacity>;
                }
                if (extradata['type'] === 'voice') {
                    return <TouchableOpacity
                        onPress={() => this.playVoice(local, remote)}
                        style={styles.voiceWrap}>
                        <Text style={{
                            paddingRight: 5,
                            fontSize: 16,
                            paddingLeft: 10
                        }}>{parseInt(extradata['duration'])}</Text>
                        <Image style={{width: 21, height: 20}} source={require("../assets/images/icon-voice.png")}/>
                    </TouchableOpacity>
                }
            default :
                return null
        }
    }

    /**
     * 播放语音
     * @param local
     * @param remote
     */
    playVoice(local, remote) {
        const {currentVoice} = this.state;
        if (currentVoice && currentVoice === local.slice(7) || currentVoice === remote) {
            if (this.playVoiceMes.sound.isPlaying()) {
                this.playVoiceMes.sound.pause()
            } else {
                this.playVoiceMes.sound.play()
            }
            return;
        }
        this.setState({
            currentVoice: local.slice(7) || remote
        }, () => {
            this.playVoiceMes.initVoice()
        })
    }

    /**
     * 预览图片
     * @param local
     * @param thumbnail
     * @param remote
     */
    viewImages(local, thumbnail, remote) {
        // local ||thumbnail|| remote
        const {imageUrls} = this.state;
        let imgActiveIndex = -1;
        for (let i = 0; i < imageUrls.length; i++) {
            if ([local, thumbnail, remote].includes(imageUrls[i]['url'])) {
                imgActiveIndex = i;
                break
            }
        }
        this.setState({
            imgActiveIndex,
        }, () => {
            this.viewerImage.showModal()
        })
    }

    /**
     * 拍摄
     * @param data
     * @returns {Promise<void>}
     */
    async takeCamera(data) {
        const {type, uri} = data;
        let content = null;
        if (type === 'video') {
            try {
                const thumbnail = await RNThumbnail.get(uri);
                content = {
                    objectName: ObjectName.File, local: uri, extra: JSON.stringify({
                        path: thumbnail.path,
                        type: 'video'
                    })
                }
            } catch (e) {
                alert('视频截图失败')
            }
        } else {
            content = {objectName: ObjectName.Image, local: uri}
        }
        /**
         * 上传消息
         */
        content && MediaUtils.sendMediaMessage({
            content,
            targetId: this.targetId,
            getLocalMes: (itemMes) => {
                const nmes = {
                    ...itemMes,
                    senderUserId: this.state.selfInfo.ry_userid,
                    conversationType: this.conversationType
                };
                this.setState((pre) => ({
                    msgData: [nmes, ...pre.msgData],
                }));
                if (type !== 'video') {
                    this.setState((pre) => ({
                        imageUrls: [{url: uri, freeHeight: true}, ...pre.imageUrls]
                    }));
                }
            },
            success: (messageId, itemMes) => {

            }
        })
    }

    /**
     * 切换语音录制按钮
     */
    toggleVoiceBtn() {
        this.setState((pre) => {
            return {
                showVoiceBtn: !pre.showVoiceBtn
            }
        })
    }

    /**
     * 发送语音消息
     * @param url
     * @param duration
     */
    sendVoiceMes(url, duration) {
        const content = {
            objectName: ObjectName.File,
            local: 'file://' + url, // Android 使用文件方式发送
            extra: JSON.stringify({
                duration,
                type: 'voice'
            })
        };
        MediaUtils.sendMediaMessage({
            targetId: this.targetId,
            content,
            getLocalMes: (itemMes) => {
                const nmes = {
                    ...itemMes,
                    senderUserId: this.state.selfInfo.ry_userid,
                    conversationType: this.conversationType
                };
                console.log(nmes)
                this.setState((pre) => ({
                    msgData: [nmes, ...pre.msgData],
                }));
            },
            success: (messageId, itemMes) => {

            }
        })
    }

    render() {
        const {
            activeVideoUrl,
            activeposter,
            imageUrls,
            imgActiveIndex,
            showVoiceBtn,
            currentVoice,
        } = this.state;
        let source = {
            icon_voice: require("../assets/images/icon-voice.png"),
            icon_emoji: require("../assets/images/icon-emoji.png"),
            icon_more: require("../assets/images/icon-more.png")
        }
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content'/>
                <TopBar
                    leftIcon="icon_back"
                    leftPress={() => this.props.navigation.goBack()}
                    title={this.state.userInfo.nickname || this.state.userInfo.username || this.info.group_name}
                    rightIcon="icon_option_black"
                    rightBtnStyle={{width: 16, height: 8}}
                    rightPress={() => {
                        this.props.navigation.navigate(this.targetId.indexOf('group') == -1 ? 'DataSetting' : 'GroupInfo', this.info)
                    }}
                />
                <SafeAreaView style={styles.container}>
                    <View style={[styles.container, styles.main]}>
                        {
                            this.state.selfInfo &&
                            <FlatList
                                style={{flex: 1}}
                                data={this.state.msgData}
                                keyExtractor={(item, index) => index.toString()}
                                renderItem={({item, index}) => this.ChatFrame(item, index)}
                                ref="flatList"
                                inverted={true}
                                // onEndReached={this.onLoadMore.bind(this)}
                                // onEndReachedThreshold={0.1}
                                // ListFooterComponent={this._createListFooter.bind(this)}
                            />
                        }
                    </View>
                    <View style={styles.bottomBar}>
                        <TouchableWithoutFeedback onPress={() => this.toggleVoiceBtn()}>
                            <Image style={[styles.barIcon, {width: 27.3, height: 26.6}]} source={source.icon_voice}/>
                        </TouchableWithoutFeedback>
                        <View style={styles.barInputContainer}>
                            {showVoiceBtn ? <View style={styles.voiceBtnWrap}>
                                <RecordVoice callBack={(url, time) => this.sendVoiceMes(url, time)}/>
                            </View> : null
                            }
                            <TextInput
                                ref="msgInput"
                                onChangeText={(msgText) => this.setState({msgText})}
                                blurOnSubmit={false}
                                returnKeyType="send"
                                maxLength={99}
                                autoCorrect={false}
                                iosreturnKeyType="send"
                                onSubmitEditing={() => this.sendMessage()}
                                style={styles.barInput}
                                multiline={true}
                                value={this.state.msgText}
                            />
                        </View>
                        <TouchableWithoutFeedback>
                            <Image style={styles.barIcon} source={source.icon_emoji}/>
                        </TouchableWithoutFeedback>
                        <TouchableWithoutFeedback onPress={this.showMore.bind(this)}>
                            <Image style={styles.barIcon} source={source.icon_more}/>
                        </TouchableWithoutFeedback>
                    </View>
                    <Animated.View style={[styles.moreContainer, {height: this.state.animatedValue}]}>
                        {this.getBottomOption()}
                    </Animated.View>

                    <Camera ref={(camera) => this.camera = camera} callBack={(data) => data && this.takeCamera(data)}/>


                    {activeVideoUrl ? <VideoPlay
                        ref={(ref) => this.videoPlay = ref}
                        poster={activeposter}
                        style={{padding: 0, margin: 0, backgroundColor: '#000'}}
                        videoSource={{uri: activeVideoUrl}}
                        onBackButtonPress={() => {
                            this.setState({activeVideoUrl: null, activeposter: null})
                        }}/> : null}


                    <ViewerImageModal
                        ref={(ref) => this.viewerImage = ref}
                        imageUrls={imageUrls}
                        index={imgActiveIndex}
                    />
                    {currentVoice ? <PlayVoiceMes
                        ref={(ref) => this.playVoiceMes = ref}
                        url={currentVoice}
                    /> : null}
                    <GetRedBags ref={(ref) => this.getRedBags = ref}
                                callBack={async (rm_orderid) => {
                                    const {hb_orderid, messageUId, index} = this.state.redBagsItem;
                                    const token = await AsyncStorage.getItem('token');
                                    const url = '/index/redmoney/get_rm';
                                    apiRequest(url, {
                                        method: 'post',
                                        mode: "cors",
                                        body: JSON.stringify({
                                            token,
                                            rm_orderid: hb_orderid
                                        })
                                    }).then((res) => {
                                        console.log(res);
                                        if (res['code'] == 200) {
                                            this.setState((pre) => {
                                                const msgData = pre.msgData;
                                                try {
                                                    const extra = JSON.parse(msgData[index]['content']['extra']);
                                                    extra['isGet'] = true;
                                                    msgData[index]['content']['extra'] = JSON.stringify(extra);
                                                    console.log(msgData)
                                                    return {msgData}
                                                } catch (e) {

                                                }

                                            })
                                        }else {
                                            alert(res['msg'])
                                        }
                                    })
                                }}
                                redBagsItem={this.state.redBagsItem}/>
                </SafeAreaView>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    voiceBtnWrap: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 3,
    },
    container: {
        flex: 1
    },
    main: {
        backgroundColor: "#F0F0F0",
    },
    bottomBar: {
        backgroundColor: "#f5f5f5",
        bottom: 0,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        shadowColor: '#ccc',
        shadowOffset: {width: 0, height: 0},
        shadowOpacity: 0.3,
        shadowRadius: 5,
        elevation: 2,
    },
    barIcon: {
        width: 26,
        height: 26,
        margin: 6
    },
    barInputContainer: {
        flex: 1,
        minHeight: 40,
        // width: 222,
        marginBottom: 8,
        marginTop: 8,
        justifyContent: "center",
        backgroundColor: "#fff",
        position: 'relative'
    },
    barInput: {
        flex: 1,
        maxHeight: 90,
        backgroundColor: "#fff",
        padding: 0,
        borderWidth: 0,
        margin: 0,
        paddingLeft: 6
    },
    moreContainer: {
        justifyContent: "center",
        overflow: "hidden",
        backgroundColor: "#fff",
    },
    moreOption: {
        flexWrap: "wrap",
        flexDirection: "row",
        marginRight: 30,
        marginLeft: 30
    },
    optionContainer: {
        alignItems: "center",
        justifyContent: "center",
        width: "25%"
    },
    optionText: {
        marginTop: 10,
        color: "#999",
        fontSize: 12
    },
    videoWrap: {
        width: 100,
        height: 150,
        position: 'relative'
    },
    playBtnWrap: {
        width: '100%',
        height: '100%',
        position: 'absolute',
        left: 0,
        top: 0,
        justifyContent: 'center',
        alignItems: 'center'
    },
    voiceWrap: {
        flexDirection: 'row',
        height: 30,
        backgroundColor: '#46ff3e',
        alignItems: 'center',
        paddingLeft: 10,
        paddingRight: 10,
        borderRadius: 3,
    },
    textMes: {padding: 12, fontSize: 16, lineHeight: 21},
    redBagsWrap: {
        width: 219,
        height: 89,
        borderRadius: 5,
        backgroundColor: '#fff'
    },
    redBagsTop: {
        height: 64,
        backgroundColor: '#FF5353',
        paddingLeft: 15,
        paddingRight: 15,
        flexDirection: 'row',
        alignItems: 'center',
    }
});

export default ChatBox;
