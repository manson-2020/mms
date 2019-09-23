import React from 'react';
import { FlatList, View, Text, StyleSheet, StatusBar, TouchableWithoutFeedback, TouchableOpacity, Dimensions, Image, TextInput, SectionList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';

const { width, height } = Dimensions.get('window'); //屏幕宽高
const headerHeight = 38;    //每一组数据的头部高度
const rowHeight = 58;   // 一行内容的高度
const separatorHeight = 1;  //边框线
const bottomBar = 70;   //底部bar高度
const searchHeight = 50;   //底部bar高度

class AddressBook extends React.Component {
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
            category: [{ title: "个人", active: true }, { title: '群聊', active: false }],
            groupList: [],
            indexContainerHeight: 0
        };
        this.arr = Array();
    }

    componentWillMount() {
        this.dataRequest("friendList");
    }

    dataRequest(params) {
        AsyncStorage.getItem('token').then(token => {
            if (params == "friendList") {
                apiRequest("/index/friend/friend_list", {
                    method: 'post',
                    mode: "cors",
                    body: formDataObject({
                        token: token
                    })
                }).then(req => {
                    let friendList = dataGroup(req.res);
                    friendList.map(item => {
                        if (item.data.length) {
                            this.state.indexArr.push(item.key)
                        }
                    })
                    this.setState({ friendList: friendList, refreshing: false, indexArr: Array.from(new Set(this.state.indexArr)) })
                }).catch(error => console.warn(error))
            } else if (params == "groupList") {
                apiRequest('/index/group/group_list',
                    {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token
                        })
                    }
                ).then(result => {
                    this.setState({
                        groupList: result.res,
                        refreshing: false
                    });
                }).catch(error => console.log(error));
            }
        });
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
                onRefresh={this.refresh.bind(this, "friend")} // 刷新方法,写了此方法，下拉才会出现  刷新控件，使用此方法必须写 refreshing
                refreshing={this.state.refreshing} // 是否刷新 ，自带刷新控件
            />
            {this.state.showRightIndex && <this.sectionIndex />}
        </React.Fragment>
    )


    renderItem = info => (
        <TouchableOpacity onPress={() => this.props.navigation.navigate('UserInfo', { userInfo: info.item })}>
            <View style={styles.itemContainer}>
                <Image source={{ uri: info.item.header_img }} style={styles.avatar} />
                <Text style={styles.rowStyle}>
                    {info.item.nickname || info.item.username}
                </Text>
            </View>
        </TouchableOpacity>
    )

    // 处理事件
    scrollSectionList = event => {
        const touch = event.nativeEvent.touches[0];
        this.setState({ isTouchDown: true })
        //索引框到搜索框的距离
        let si = (height - (this.state.titleHeight + searchHeight + 9 + this.state.indexContainerHeight + bottomBar)) / 2;
        //计算从索引容器顶部坐标和底部坐标的位置
        if (touch.pageY >= (si + this.state.titleHeight + searchHeight + 9) && touch.pageY <= (si + this.state.titleHeight + searchHeight + 9 + this.state.indexContainerHeight)) {
            //touch.pageY 从顶部开始，包括导航条 iOS 如此，如果是android 则具体判断
            const index = parseInt((touch.pageY - (si + this.state.titleHeight + searchHeight + 9)) / (this.state.indexContainerHeight / this.state.indexArr.length));
            //让对应索引框内的索引值高亮
            this.setState({ index: index });
            // 默认跳转到 第 index 个section  的第 1 个 item
            // this.friendList.scrollToLocation({ animated: true, itemIndex: 0, sectionIndex: index })
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


    groupRender(item) {
        return (
            <TouchableOpacity onPress={() => this.props.navigation.navigate('ChatBox', item)}>
                <View style={styles.group}>
                    {
                        item.header_img.length == 4 ?
                            <View style={styles.groupImage}>
                                {
                                    item.header_img.map((avatarItem, index) => (
                                        <Image key={index} style={{ width: "50%", height: "50%" }} source={{ uri: avatarItem }} />
                                    ))
                                }
                            </View>
                            :
                            item.header_img.length == 3 ?
                                <View style={styles.groupImage}>
                                    <Image style={{ flex: 1 }} source={{ uri: item.header_img[0] }} />
                                    <View style={{ flex: 1 }}>
                                        <Image style={{ width: "100%", height: "50%" }} source={{ uri: item.header_img[1] }} />
                                        <Image style={{ width: "100%", height: "50%" }} source={{ uri: item.header_img[2] }} />
                                    </View>
                                </View>
                                :
                                <View style={styles.groupImage}>
                                    {
                                        item.header_img.map((avatarItem, index) => (
                                            <Image key={index} style={{ flex: 1 }} source={{ uri: avatarItem }} />
                                        ))
                                    }
                                </View>
                    }
                    <View style={styles.groupView}>
                        <Text style={styles.groupName}>{item.group_name}</Text>
                        <View style={styles.groupLine}></View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }

    render = () => (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle={'dark-content'} />
            <View onLayout={e => this.setState({ titleHeight: e.nativeEvent.layout.height })}  >
                <TopBar
                    ref="topBar"
                    titleComponent={
                        <View style={{ flexDirection: "row", alignItems: "center", width: 108, justifyContent: "space-between" }}>
                            {
                                this.state.category.map((item, index) => (
                                    <TouchableWithoutFeedback key={index} onPress={() => {
                                        this.state.category.map(item => { item.active = false });
                                        item.active = true;
                                        this.setState({ category: this.state.category },
                                            this.dataRequest.bind(this, item.title == "个人" ? "friendList" : "groupList"));
                                    }}>
                                        <View style={{ alignItems: "center" }}>
                                            <Text style={[{ fontSize: 18, fontWeight: "bold", paddingVertical: 15 }, item.active && styles.TextActive]}>{item.title}</Text>
                                            <View style={[{ width: 15, height: 2 }, item.active && styles.ViewActive]}></View>
                                        </View>
                                    </TouchableWithoutFeedback>
                                ))
                            }
                        </View>
                    }
                    rightIcon="icon_addFriend"
                    rightBtnStyle={{ width: 20, height: 16 }}
                    rightPress={() => this.props.navigation.navigate('AddFriend', { refresh: () => { this.dataRequest("friendList"); } })}
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

            {
                this.state.category.map(item => {
                    if (item.active) {
                        switch (item.title) {
                            case "个人":
                                return (
                                    <View key={item.title} style={{ flex: 1, justifyContent: "center" }}>
                                        <this.FriendList />
                                    </View>
                                );
                            case "群聊":
                                return (
                                    <View key={item.title} style={styles.groupChatContainer}>
                                        <FlatList
                                            style={{ flex: 1 }}
                                            data={this.state.groupList}
                                            keyExtractor={(item, index) => index.toString()}
                                            renderItem={({ item, index }) => this.groupRender(item, index)}
                                            onRefresh={this.refresh.bind(this, "group")}
                                            refreshing={this.state.refreshing}
                                        />
                                    </View>
                                );
                        }
                    }
                })
            }
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
        height: rowHeight
    },
    rowStyle: {
        lineHeight: rowHeight,
        width: width,
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
        right: 18
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
        marginLeft: 15,
        borderRadius: 19
    },
    checkBox: {
        width: 16,
        height: 16,
        borderRadius: 8,
        marginLeft: 20,
        alignItems: "center",
        justifyContent: "center"
    },
    icon_checked: {
        width: 10,
        height: 8
    },
    rightBtnStyle: {
        color: "#fff",
        lineHeight: 30,
        borderRadius: 5,
        overflow: "hidden",
        paddingHorizontal: 15,
        backgroundColor: "#196FF0"
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

    TextActive: {
        color: "#2375F1"
    },
    ViewActive: {
        backgroundColor: "#2375F1"
    },
    groupChatContainer: {
        borderTopColor: "#eee",
        borderTopWidth: 1,
        flex: 1
    },
    group: {
        flexDirection: "row",
        alignItems: "center",
    },
    groupImage: {
        width: 46,
        marginLeft: 15,
        marginVertical: 10,
        height: 46,
        backgroundColor: "#eee",
        borderRadius: 23,
        flexDirection: "row",
        flexWrap: "wrap",
        overflow: "hidden"
    },
    groupView: {
        flex: 1,
        marginLeft: 15
    },
    groupName: {
        color: "#333",
        fontSize: 16,
        lineHeight: 60,
        fontWeight: "500"
    },
    groupLine: {
        height: 1,
        backgroundColor: "#eee",
        marginRight: 15
    }
});

export default AddressBook;