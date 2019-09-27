import React from 'react';
import { FlatList, View, Text, StyleSheet, StatusBar, TouchableWithoutFeedback, TouchableOpacity, Dimensions, Image, TextInput, SectionList } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';

const { width, height } = Dimensions.get('window');
const statusHeight = 20;
const headerHeight = 38;
const rowHeight = 58;
const separatorHeight = 1;
const sectionHeight = 500;

class FriendList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            friendList: [],
            selectUser: [],  //选中的好友， 在邀请页面为已是群成员的好友
            selectUserForInviter: [], //邀请页面选中的群成员
            showRightIndex: true,
            searchValue: false,
            index: null,
            isTouchDown: false,
        };
        this.selectUserData;
        this.group_userid = String();
        this.member = props.navigation.state.params.member;
        this.info = props.navigation.state.params.info;
    }

    componentWillMount() {
        this.dataRequest("friendList");
    }

    dataRequest(params) {
        AsyncStorage.getItem('token').then(token => {

            switch (params) {
                //获取好友列表
                case "friendList":
                    apiRequest('/index/friend/friend_list',
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: token
                            })
                        }
                    ).then(result => {
                        if (this.member) {
                            this.member.map(groupMemberItem => {
                                result.res.map(friendItem => {
                                    if (groupMemberItem.ry_userid == friendItem.userid) {
                                        friendItem.disabled = true;
                                        this.state.selectUser.push(friendItem);
                                    }
                                })
                            });
                        }
                        this.setState({
                            friendList: dataGroup(result.res),
                            selectUser: this.state.selectUser
                        });
                    }).catch(error => console.log(error));
                    break;
                //创建群聊
                case "createGroup":
                    this.group_userid = String();
                    this.state.selectUser.map(item => {
                        if (!item.disabled) {
                            this.group_userid += `${item.userid},`;
                        }
                    });
                    apiRequest('/index/group/creat_group',
                        {
                            method: 'post',
                            mode: "cors",
                            body: formDataObject({
                                token: token,
                                group_userid: this.group_userid.substring(0, this.group_userid.length - 1)
                            })
                        }
                    ).then(result => {
                        if (result.code == 200) {
                            this.props.navigation.navigate("ChatBox",
                                { group_id: result.res.group_id, group_name: "群聊" }
                            )
                        }
                    }).catch(error => console.warn(error));
                    break;
                //邀请联系人
                case "inviterGroup":
                    this.group_userid = String();
                    this.state.selectUser.map(item => {
                        if (!item.disabled) {
                            this.group_userid += `${item.userid},`;
                        }
                    });
                    if (this.group_userid) {
                        apiRequest('/index/group/join_group',
                            {
                                method: 'post',
                                mode: "cors",
                                body: formDataObject({
                                    token: token,
                                    group_userid: this.group_userid.substring(0, this.group_userid.length - 1),
                                    group_id: this.info.group_id
                                })
                            }
                        ).then(result => {
                            if (result.code == 200) {
                                this.props.navigation.state.params.refresh();
                                this.props.navigation.goBack();
                            }
                        }).catch(error => console.warn(error));
                    } else {
                        alert("没有选中联系人！")
                    }
                    break;
                //踢出群聊
                case "kickout":
                    this.group_userid = String();
                    this.state.selectUser.map(item => {
                        if (!item.disabled) {
                            this.group_userid += `${item.ry_userid},`;
                        }
                    });
                    if (this.group_userid) {
                        apiRequest('/index/group/admin_quit',
                            {
                                method: 'post',
                                mode: "cors",
                                body: formDataObject({
                                    token: token,
                                    group_userid: this.group_userid.substring(0, this.group_userid.length - 1),
                                    group_id: this.info.group_id
                                })
                            }
                        ).then(result => {
                            if (result.code == 200) {
                                this.props.navigation.state.params.refresh();
                                this.props.navigation.goBack();
                            }
                        }).catch(error => console.warn(error));
                    } else {
                        alert("没有选中联系人！")
                    }
                    break;
            }
        });
    }
    

    Search = () => (
        <View style={styles.searchContainer}>
            <TouchableWithoutFeedback onPress={() => { this.setState({ showInput: !this.state.showInput }) }}>
                <View style={styles.searchMain}>
                    <Image style={styles.icon} source={require("../assets/images/icon-search.png")} />
                    {
                        this.state.showInput ?
                            <TextInput
                                autoFocus={true}
                                onChangeText={value => this.setState({ searchValue: value })}
                                onBlur={() => { this.setState({ showRightIndex: true }); this.state.searchValue || this.setState({ showInput: false }) }}
                                onFocus={() => { this.setState({ showRightIndex: false }) }}
                                style={styles.input} />
                            :
                            <Text style={styles.text}>搜索</Text>
                    }
                </View>
            </TouchableWithoutFeedback>
        </View>
    )

    FriendList = () => (
        <React.Fragment>
            <SectionList
                ref={friendList => this.friendList = friendList}
                renderSectionHeader={info => (!!info.section.data.length && <Text style={styles.sectionStyle}>{info.section.key}</Text>)} // sectionHeader
                renderItem={this.renderItem} // rowItem
                sections={this.props.navigation.state.params.page == "Kickout" ? dataGroup(this.member) : this.state.friendList} // 数据源
                // sections={dataGroup(this.member)} // 数据源
                keyExtractor={(item, index) => index} // 每个item都有唯一的key
                ItemSeparatorComponent={() => <View style={styles.separtorStyle} />} // 分割线
                ListFooterComponent={() => this.state.friendList.length ? <View style={{ height: 200 }}></View> : null} // 尾部组件
                ListEmptyComponent={<View style={styles.noDataViewStyle}><Text style={styles.noDataSubViewStyle}>加载中。。。</Text></View>} // 没有数据时显示的组件
            />
            {
                this.state.showRightIndex && <this.sectionIndex />
            }
        </React.Fragment>
    )


    renderItem = info => {
        return (
            <TouchableOpacity
                disabled={info.item.disabled}
                onPress={() => {
                    this.setState({ selectUser: [info.item, ...this.state.selectUser] });
                    this.state.selectUser.map((item, index) => {
                        if (this.props.navigation.state.params.page == "Kickout") {
                            if (item.ry_userid == info.item.ry_userid) {
                                this.state.selectUser.splice(index, 1); //删除数组中对应选中项
                                this.setState({ selectUser: this.state.selectUser });
                            }
                        } else {
                            if (item.userid == info.item.userid) {
                                this.state.selectUser.splice(index, 1); //删除数组中对应选中项
                                this.setState({ selectUser: this.state.selectUser });
                            }
                        }
                    })
                }}>
                <View style={styles.itemContainer}>
                    <View style={[
                        styles.checkBox,
                        { borderWidth: 1, borderColor: "#ccc" },
                        this.state.selectUser.map(item => {
                            if (this.props.navigation.state.params.page == "Kickout") {
                                if (item.ry_userid == info.item.ry_userid) {
                                    return { backgroundColor: info.item.disabled ? "#ccc" : "#196FF0", borderWidth: 0 }
                                }
                            } else {
                                if (item.userid == info.item.userid) {
                                    return { backgroundColor: info.item.disabled ? "#ccc" : "#196FF0", borderWidth: 0 }
                                }
                            }
                        })
                    ]}>
                        <Image style={styles.icon_checked} source={require('../assets/images/icon-checked.png')} />
                    </View>
                    <Image source={{ uri: info.item.header_img }} style={styles.avatar} />
                    <Text style={styles.rowStyle}>
                        {info.item.nickname || info.item.username}
                    </Text>
                </View>
            </TouchableOpacity>
        )
    }

    /*手指滑动，触发事件*/
    scrollSectionList = event => {
        const touch = event.nativeEvent.touches[0];
        if (touch.pageY >= ((height - sectionHeight) / 2 - statusHeight) && touch.pageY <= (height - sectionHeight) / 2 + sectionHeight) {
            //touch.pageY 从顶部开始，包括导航条 iOS 如此，如果是android 则具体判断
            const index = parseInt((touch.pageY + 20 - (height - sectionHeight) / 2) / (sectionHeight / 9));
            this.setState({
                index: index
            });
            // 默认跳转到 第 index 个section  的第 1 个 item
            this.friendList.scrollToLocation({ animated: true, itemIndex: 0, sectionIndex: index });
        }
    } 

    sectionIndex = () => (
        <View style={styles.sectionItemViewStyle}
            ref={sectionIndexView => this.sectionIndexView = sectionIndexView}
            onStartShouldSetResponder={() => true} // 在用户开始触摸的时候（手指刚刚接触屏幕的瞬间），是否愿意成为响应者？
            onMoveShouldSetResponder={() => true} // :如果View不是响应者，那么在每一个触摸点开始移动（没有停下也没有离开屏幕）时再询问一次：是否愿意响应触摸交互呢？
            onResponderGrant={event => { this.scrollSectionList(event); this.setState({ isTouchDown: true }) }} // View现在要开始响应触摸事件了。这也是需要做高亮的时候，使用户知道他到底点到了哪里
            onResponderMove={event => { this.scrollSectionList(event); this.setState({ isTouchDown: true }); }} // 用户正在屏幕上移动手指时（没有停下也没有离开屏幕）
            onResponderRelease={event => this.setState({ isTouchDown: false })} // 触摸操作结束时触发，比如"touchUp"（手指抬起离开屏幕）
        >
            {
                'A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,#'.split(',').map((item, index) => (
                    <Text
                        key={index}
                        style={[styles.sectionItemStyle, (this.state.isTouchDown && this.state.index == index) && { backgroundColor: "#196FF0", color: "#fff" }]}
                    >
                        {item}
                    </Text>
                ))
            }
        </View>
    )

    TopBar = () => {
        switch (this.props.navigation.state.params.page) {
            case "InitGroupChat":
                return (
                    <TopBar
                        title="邀请群聊"
                        leftText="取消"
                        rightText="确认"
                        rightBtnDisabled={!this.state.selectUser.length}
                        rightBtnStyle={[styles.rightBtnStyle, { opacity: !this.state.selectUser.length ? 0.3 : 1 }]}
                        leftPress={() => { this.props.navigation.state.params.refresh(); this.props.navigation.goBack(); }}
                        rightPress={this.dataRequest.bind(this, "createGroup")}
                    />
                )
            case "Inviter":
                return (
                    <TopBar
                        title="选择联系人"
                        leftText="取消"
                        rightText="确认"
                        rightBtnDisabled={!this.state.selectUser.length}
                        rightBtnStyle={[styles.rightBtnStyle, { opacity: !this.state.selectUser.length ? 0.3 : 1 }]}
                        leftPress={() => { this.props.navigation.goBack(); }}
                        rightPress={this.dataRequest.bind(this, "inviterGroup")}
                    />
                )
            case "Kickout":
                return (
                    <TopBar
                        title="聊天成员"
                        leftText="取消"
                        rightText="删除"
                        rightBtnDisabled={!this.state.selectUser.length}
                        rightBtnStyle={[styles.rightBtnStyle, { opacity: !this.state.selectUser.length ? 0.3 : 1 }]}
                        leftPress={() => { this.props.navigation.goBack(); }}
                        rightPress={this.dataRequest.bind(this, "kickout")}
                    />
                )
        }
    }

    render = () => (
        <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
            <this.TopBar />
            <View style={{ justifyContent: "center" }}>
                <FlatList
                    ref={selectUser => this.selectUser = selectUser}
                    contentContainerStyle={{ alignItems: "center" }}
                    horizontal={true}
                    keyExtractor={(item, index) => index.toString()}
                    data={this.state.selectUser}
                    showsHorizontalScrollIndicator={false}
                    inverted={true}
                    renderItem={({ item }) => !item.disabled ? <Image style={styles.avatar} source={{ uri: item.header_img }} /> : false}
                />
            </View>

            <this.Search />
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
    searchContainer: {
        alignItems: "center",
        justifyContent: "center",
        height: 52,
        borderTopWidth: 1,
        borderTopColor: "#eee"
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
        justifyContent: "space-around",
        width: 10,
        height: sectionHeight,
        right: 18
    },
    sectionItemStyle: {
        textAlign: "center",
        fontSize: 10,
        color: "#666",
        height: 12,
        borderRadius: 6
    },
    avatar: {
        width: 38,
        height: 38,
        marginLeft: 15,
        marginVertical: 8,
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
    }
});

export default FriendList;