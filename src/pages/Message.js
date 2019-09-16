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
    TouchableOpacity
} from 'react-native';
import {getConversation, ConversationType} from "rongcloud-react-native-imlib";
import AsyncStorage from '@react-native-community/async-storage';
import moment from 'moment';
import TopBar from './components/TopBar';

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
        this.dataRequest();
        this.deEmitter = DeviceEventEmitter.addListener('new Message', res => {
            this.state.data = [];
            this.dataRequest()
        });
    }

    componentWillUnmount() {
        this.deEmitter.remove();
    }

    dataRequest() {
        AsyncStorage.getItem('token').then(token => {
            apiRequest("/index/friend/friend_list", {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    token: token
                })
            }).then(req => {
                req.res.map(item => {
                    console.log(ConversationType.PRIVATE, item.userid);
                    // getConversation(ConversationType.PRIVATE, item.userid).then(res => {
                    //     if (res) {
                    //         this.setState({
                    //             data: [
                    //                 ...this.state.data,
                    //                 {
                    //                     targetId: item.userid,
                    //                     avatar: item.header_img,
                    //                     name: item.nickname || item.username,
                    //                     msg: res.latestMessage.content,
                    //                     time: moment(new Date(res.receivedTime)).format('HH:mm')
                    //                 },
                    //             ],
                    //             refreshing: false
                    //         })

                    //     } else {
                    //         this.setState({ refreshing: false });
                    //     }
                    // });
                })
            }).catch(error => console.warn(error))
        })
    }

    refresh = () => {
        this.state.data = [];
        this.setState({refreshing: true}, () => this.dataRequest())
    }

    showOption() {
        this.setState({showOption: !this.state.showOption, angle: 0});
        Animated.timing(this.state.fadeAnim, {toValue: this.state.showOption ? 118 : 0, duration: 300,}).start();
    }

    MessageList(item, index) {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatBox', {userid: item.targetId})}>
                <View style={styles.container}>
                    <View style={styles.leftView}>
                        {/* <View style={styles.marker}></View> */}
                        <Image
                            style={styles.avatar}
                            defaultSource={require('../assets/images/default_avatar.png')}
                            source={{uri: item.avatar}}
                        />
                    </View>
                    <View style={styles.main}>
                        <Text numberOfLines={1} style={styles.name}>{item.name}</Text>
                        <Text numberOfLines={1} style={styles.msg}>{item.msg}</Text>
                    </View>
                    <View style={styles.rightView}>
                        <Text numberOfLines={1} style={styles.time}>{item.time}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    /**
     * 扫描二维码
     */
    openQrcode() {
        const {navigation} = this.props;
        navigation.navigate('QrScand',{
            /**
             * 接收扫描结果
             * @param res
             */
            callBack:(res)=>{
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
                    renderItem={({item, index}) => this.MessageList(item, index)}
                    onRefresh={this.refresh.bind(this)}
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
                    refreshing={this.state.refreshing}
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
        borderRadius: 19,
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
