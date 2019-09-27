import React from 'react';
import { FlatList, View, Text, PermissionsAndroid, StyleSheet, StatusBar, TouchableOpacity, Dimensions, Image, TextInput, SectionList } from 'react-native';
import Contacts from 'react-native-contacts';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';
const { width, height } = Dimensions.get('window'); //屏幕宽高
const headerHeight = 38;    //每一组数据的头部高度
const rowHeight = 58;   // 一行内容的高度
const separatorHeight = 1;  //边框线
const searchHeight = 50;   //底部bar高度

class MobileContacts extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            titleHeight: 0,
            friendList: [],
            selectUser: [],
            indexArr: [],
            showRightIndex: true,
            searchValue: false,
            index: null,
            isTouchDown: false,
            refreshing: false,
            indexContainerHeight: 0
        };
    }

    componentWillMount() {
        // this.dataRequest();
        this.getAllContacts();
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
                /**
                 * contactsArr电话号码数组
                 */
                let arr = Array();
                contacts.map(mobileItem => {
                    mobileItem['phoneNumbers'].map(item => {
                        arr.push(item["number"].replace(/-|\s|\+86|#|\*/g, ""))
                    })
                })

                let mobileNum = Array();
                arr.map(item => {
                    if (/^1[3456789]\d{9}$/.test(item)) {
                        mobileNum.push(item);
                    }
                })

                const token = await AsyncStorage.getItem('token');
                apiRequest('/index/userinfo/mail_list', {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token,
                        mail: JSON.stringify(Array.from(new Set(mobileNum)))
                    })
                }).then(req => {
                    let friendList = dataGroup(req.res);
                    friendList.map(item => {
                        if (item.data.length) {
                            this.state.indexArr.push(item.key)
                        }
                    });
                    this.setState({ friendList: friendList, indexArr: Array.from(new Set(this.state.indexArr)) })
                }, e => {
                    console.log(e)
                })
            })
        } catch (e) {
            console.warn(e)
        }
    }

    refresh(params) {
        this.setState({ refreshing: true }, this.dataRequest.bind(this, `${params}List`));
    }

    FriendList = () => (
        <React.Fragment>
            <SectionList
                ref={friendList => this.friendList = friendList}
                renderSectionHeader={info => (!!info.section.data.length && <Text style={styles.sectionStyle}>{info.section.key}</Text>)} // sectionHeader
                renderItem={this.renderItem} // rowItem
                sections={this.state.friendList} // 数据源
                keyExtractor={(item, index) => index} // 每个item都有唯一的key
                ItemSeparatorComponent={() => <View style={styles.separtorStyle} />} // 分割线
                ListFooterComponent={() => this.state.friendList.length ? <View style={{ height: 200 }}></View> : null} // 尾部组件
                ListEmptyComponent={<View style={styles.noDataViewStyle}><Text style={styles.noDataSubViewStyle}>加载中。。。</Text></View>} // 没有数据时显示的组件
            />
            {this.state.showRightIndex && <this.sectionIndex />}
        </React.Fragment>
    )


    renderItem = info => (

        <View style={styles.itemContainer}>
            <Image source={{ uri: info.item.header_img }} style={styles.avatar} />
            <Text style={styles.rowStyle}>
                {info.item.nickname || info.item.username}
            </Text>

            <TouchableOpacity
                style={{ backgroundColor: info.item.type ? "#fff" : "#196FF0", borderRadius: 6 }}
                onPress={() => this.props.navigation.navigate("TargetInfo", { targetInfo: { userid: info.item.userid } })}
            >
                <Text style={{ marginHorizontal: 9, lineHeight: 30, textAlign: "center", color: info.item.type ? "#666" : "#fff" }}> {info.item.type ? "已添加" : "添加"}</Text>
            </TouchableOpacity>
        </View>
    )

    // 处理事件
    scrollSectionList = event => {
        const touch = event.nativeEvent.touches[0];
        this.setState({ isTouchDown: true })
        //索引框到搜索框的距离
        let si = (height - (this.state.titleHeight + searchHeight + 9 + this.state.indexContainerHeight)) / 2;
        //计算从索引容器顶部坐标和底部坐标的位置
        if (touch.pageY >= (si + this.state.titleHeight + searchHeight + 9) && touch.pageY <= (si + this.state.titleHeight + searchHeight + 9 + this.state.indexContainerHeight)) {
            //touch.pageY 从顶部开始，包括导航条 iOS 如此，如果是android 则具体判断
            const index = parseInt((touch.pageY - (si + this.state.titleHeight + searchHeight + 9)) / (this.state.indexContainerHeight / this.state.indexArr.length));
            //让对应索引框内的索引值高亮
            this.setState({ index: index });
            // 默认跳转到 第 index 个section  的第 1 个 item
            this.friendList.scrollToLocation({ animated: true, itemIndex: 0, sectionIndex: index })
        } else {
            this.setState({ isTouchDown: false })
        }
    }

    //索引
    sectionIndex = () => (
        <React.Fragment>
            <View style={styles.sectionItemViewStyle}
                onLayout={e => this.setState({ indexContainerHeight: e.nativeEvent.layout.height })}
                ref={sectionIndexView => this.sectionIndexView = sectionIndexView}
                onStartShouldSetResponder={() => true} // 在用户开始触摸的时候（手指刚刚接触屏幕的瞬间），是否愿意成为响应者？
                onMoveShouldSetResponder={() => true} // 如果View不是响应者，那么在每一个触摸点开始移动（没有停下也没有离开屏幕）时再询问一次：是否愿意响应触摸交互呢？
                onResponderGrant={event => { this.scrollSectionList(event) }} // View现在要开始响应触摸事件了。这也是需要做高亮的时候，使用户知道他到底点到了哪里
                onResponderMove={event => { this.scrollSectionList(event) }} // 用户正在屏幕上移动手指时（没有停下也没有离开屏幕）
                onResponderRelease={event => {
                    this.friendList.scrollToLocation({ animated: true, itemIndex: 0, sectionIndex: this.state.index });
                    this.setState({ isTouchDown: false })
                }} // 触摸操作结束时触发，比如"touchUp"（手指抬起离开屏幕）
            >
                {this.state.indexArr.map((item, index) => (
                    <View key={index} style={styles.sectionViewStyle}>
                        <Text style={[styles.sectionItemStyle, (this.state.isTouchDown && this.state.index == index) && { backgroundColor: "#196FF0", color: "#fff" }]} >
                            {item}
                        </Text>
                    </View>
                ))}
            </View>
            {
                this.state.isTouchDown &&
                <View pointerEvents='box-none' style={{ position: 'absolute', width: "100%", alignItems: "center" }}>
                    <View style={{ width: 60, height: 60, backgroundColor: "rgba(0,0,0,0.3)", borderRadius: 5, alignItems: "center", justifyContent: "center" }}>
                        <Text style={{ color: "#fff", fontSize: 27, fontWeight: "bold" }}>{this.state.indexArr[this.state.index]}</Text>
                    </View>
                </View>
            }
        </React.Fragment>
    )

    render = () => (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle={'dark-content'} />
            <View onLayout={e => this.setState({ titleHeight: e.nativeEvent.layout.height })}  >
                <TopBar
                    ref="topBar"
                    title="手机联系人"
                    leftIcon="icon_back"
                    leftPress={() => this.props.navigation.goBack()}
                />
            </View>

            <View style={styles.searchContainer} >
                <Image style={styles.searchImage} source={require('../assets/images/icon-search.png')} />
                <TextInput
                    onBlur={() => this.setState({ showRightIndex: true })}
                    onFocus={() => this.setState({ showRightIndex: false })}
                    placeholder="搜索"
                    style={styles.searchInput}
                />
            </View>
            <View style={{ flex: 1, justifyContent: "center" }}>
                <this.FriendList />
            </View>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    sectionStyle: {
        backgroundColor: '#f5f5f5',
        fontSize: 16,
        color: "#666",
        paddingLeft: 20,
        height: headerHeight,
        lineHeight: headerHeight,
        fontWeight: "bold",
    },
    itemContainer: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        height: rowHeight,
        paddingLeft: 15,
        paddingRight: 30
    },
    rowStyle: {
        lineHeight: rowHeight,
        flex: 1,
        color: "#333",
        fontSize: 16,
        fontWeight: "500",
        marginLeft: 16,
    },
    separtorStyle: {
        height: separatorHeight,
        backgroundColor: '#eee',
        marginLeft: 68,
    },
    noDataViewStyle: {
        height: 500,
        justifyContent: "center",
        alignItems: "center"
    },
    noDataSubViewStyle: {
        alignItems: 'center',
        justifyContent: "center",
        color: '#196FF0'
    },
    sectionItemViewStyle: {
        position: 'absolute',
        right: 15
    },
    sectionViewStyle: {
        borderRadius: 6,
        marginVertical: 3,
        height: 12,
        width: 12,
        overflow: "hidden"
    },
    sectionItemStyle: {
        textAlign: "center",
        fontSize: 10,
        color: "#666"
    },
    avatar: {
        width: 38,
        height: 38,
        borderRadius: 19
    },
    searchContainer: {
        alignItems: "center",
        marginTop: 9,
        flexDirection: "row",
        height: searchHeight,
        marginRight: 20
    },
    searchImage: {
        width: 14,
        height: 14,
        marginLeft: 20
    },
    searchInput: {
        height: 50,
        marginLeft: 11,
        marginRight: 20,
        flex: 1
    },
});

export default MobileContacts;