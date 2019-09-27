import React from 'react';
import { View, Text, FlatList, TouchableWithoutFeedback, TouchableOpacity, StyleSheet, Image, TextInput, StatusBar } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import TopBar from './components/TopBar';

class AddFriend extends React.Component {
    constructor() {
        super();
        this.state = {
            showInput: false,
            searchValue: null,
            newFriendList: []
        };
        this.status = ["等待验证", "未接受", "已同意", "同意", "未接受", "已同意"];
    }


    componentWillMount() {
        this.dataRequest("getList");
    }

    dataRequest(params, userid = null) {
        //对方的userid
        AsyncStorage.getItem('token').then(token => {
            switch (params) {
                case "getList":
                    apiRequest('/index/friend/apply_list', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token
                        })
                    }).then(result => {
                        if (result.code == 200) {
                            this.setState({ newFriendList: result.res })
                        }
                    });
                    break;
                case "agreeSubmit":
                    apiRequest('/index/friend/accept', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token,
                            userid: userid,
                            status: 3
                        })
                    }).then(result => {
                        if (result.code == 200) {
                            this.props.navigation.state.params.refresh();
                            this.dataRequest("getList")
                        }
                    });
                    break;
                case "searchSubmit":
                    apiRequest('/index/friend/search', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token,
                            lxname: this.state.searchValue
                        })
                    }).then(result => {
                        if (result.code == 401) {
                            alert(result.msg)
                        } else {
                            this.props.navigation.navigate("TargetInfo", { targetInfo: result.res })
                        }
                    });
                    break;
            }
        })
    }

    InputComponent = () => (
        <View style={styles.searchContainer}>
            <TouchableWithoutFeedback onPress={() => { this.setState({ showInput: !this.state.showInput }) }}>
                <View style={styles.searchMain}>
                    <Image style={styles.iconSearch} source={require("../assets/images/icon-search.png")} />
                    {
                        this.state.showInput ?
                            <TextInput
                                autoFocus={true}
                                ref={searchInput => this.searchInput = searchInput}
                                onChangeText={value => this.setState({ searchValue: value })}
                                onBlur={() => { this.state.searchValue || this.setState({ showInput: false }) }}
                                style={styles.inputSearch}
                                keyboardType="numeric"
                                blurOnSubmit={false}
                                returnKeyType="search"
                                value={this.state.searchValue}
                                onSubmitEditing={this.dataRequest.bind(this, "searchSubmit")}
                            />
                            :
                            <Text style={styles.textPlaceholder}>彩信号</Text>
                    }
                </View>
            </TouchableWithoutFeedback>
        </View>
    );

    /**
     * 扫描二维码添加朋友
     */
    openQrcode() {
        const { navigation } = this.props;
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

    newFriendList = (item, index) => (
        <TouchableOpacity onPress={() => this.props.navigation.navigate("TargetInfo", { targetInfo: item })}>
            <View style={styles.optionContainer}>
                <View style={styles.optionWrapper}>
                    <Image style={styles.avatar} source={{ uri: item.header_img }} />
                    <Text style={styles.userName}>{item.username}</Text>
                </View>
                <TouchableOpacity
                    onPress={this.dataRequest.bind(this, "agreeSubmit", item.userid)}
                    disabled={!(item.status == 3)}
                >
                    <View style={{ backgroundColor: item.status == 3 ? "#196FF0" : "#fff", borderRadius: 6 }}>
                        <Text style={{ marginHorizontal: 9, lineHeight: 30, textAlign: "center", color: item.status == 3 ? "#fff" : "#666" }}>
                            {this.status[item.status]}
                        </Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={{ display: (this.state.newFriendList.length == index + 1) ? "none" : "flex", backgroundColor: "#fff" }}>
                <View style={{ height: 1, backgroundColor: "#eee", marginHorizontal: 25 }}></View>
            </View>
        </TouchableOpacity>
    )
    render() {
        return (
            <View style={{ flex: 1 }}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
                <TopBar title="新朋友"
                    leftIcon="icon_back"
                    rightIcon="icon_scan_black"
                    rightPress={() => this.openQrcode()}
                    leftPress={() => {
                        this.props.navigation.state.params.refresh();
                        this.props.navigation.goBack();
                    }} />
                <this.InputComponent />
                <TouchableWithoutFeedback onPress={() => this.searchInput && this.searchInput.blur()} >
                    <View style={{ flex: 1, backgroundColor: "#F0F0F0" }}>
                        <View style={{ justifyContent: "space-around", flexDirection: "row", backgroundColor: "#fff", paddingVertical: 9 }}                        >
                            <TouchableOpacity style={{ alignItems: "center" }} onPress={() => this.props.navigation.navigate("MobileContacts")} >
                                <Image style={{ width: 19, height: 30 }} source={require("../assets/images/icon-phone-blue.png")} />
                                <Text style={{ color: "#333", marginTop: 9, }}>手机联系人</Text>
                            </TouchableOpacity>
                        </View>
                        <Text style={{ marginVertical: 12, marginLeft: 25, color: "#000" }}>新的朋友</Text>
                        <FlatList
                            style={{ flex: 1 }}
                            data={this.state.newFriendList}
                            keyExtractor={(item, index) => index.toString()}
                            renderItem={({ item, index }) => this.newFriendList(item, index)}
                        // onRefresh={this.refresh.bind(this, "group")}
                        // refreshing={this.state.refreshing}
                        />
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );
    }
}



const styles = StyleSheet.create({
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
    iconSearch: {
        width: 12,
        height: 12,
        paddingLeft: 12
    },
    inputSearch: {
        height: 32,
        width: 297,
        textAlign: "center",
        padding: 0,
        margin: 0,
        paddingLeft: 12,
        paddingRight: 12
    },
    textPlaceholder: {
        fontSize: 14,
        color: "#ccc",
        paddingLeft: 12
    },
    optionContainer: {
        flexDirection: "row",
        paddingHorizontal: 25,
        justifyContent: "space-between",
        alignItems: "center",
        backgroundColor: "#fff"
    },
    optionWrapper: {
        flexDirection: "row",
        alignItems: "center",
        marginVertical: 12
    },
    avatar: {
        width: 50,
        height: 50,
        borderRadius: 25
    },
    userName: {
        marginLeft: 15,
        fontSize: 16,
        color: "#333"
    }
});

export default AddFriend;
