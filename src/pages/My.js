import React from 'react';
import { Image, View, TouchableOpacity, findNodeHandle, StatusBar, Text, StyleSheet, YellowBox, BackHandler, Platform } from 'react-native';
import { BlurView } from "@react-native-community/blur";
import AsyncStorage from '@react-native-community/async-storage';
import Dialog,
{
    ScaleAnimation,
    DialogContent,
    DialogTitle,
} from 'react-native-popup-dialog';
import TopBar from './components/TopBar';
YellowBox.ignoreWarnings(['Warning: Failed prop type: ']);

class My extends React.Component {
    constructor() {
        super();
        this.state = { viewRef: 0, selfInfo: [], QrCodePoup: false };
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }

    imageLoaded() {
        this.setState({ viewRef: findNodeHandle(this.backgroundImage) });
    }

    componentWillMount() {
        this.getSelfInfo();
    }

    onBackButtonPressAndroid = () => {
        if (this.state.QrCodePoup) {
            this.setState({ QrCodePoup: false });
            return true; //返回true, 不执行系统操作。
        }
    }

    componentWillUnmount() {
        Platform.OS == "android" && BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    }

    getSelfInfo() {
        AsyncStorage.getItem('token').then(token => {
            apiRequest('/index/userinfo/getinfo', {
                method: 'post',
                mode: "cors",
                body: formDataObject({
                    token: token
                })
            }).then(result => {
                this.setState({ selfInfo: result.res })
            })
        })
    }

    QrCodePoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="我的二维码" />}
            dialogAnimation={new ScaleAnimation()}
            visible={this.state.QrCodePoup}
            onTouchOutside={() => this.setState({ QrCodePoup: false })}
        >
            <DialogContent style={{ alignItems: "center" }}>
                <Image style={styles.qrCode} source={{ uri: this.state.selfInfo.qr_img }} />
                <Text style={{ color: "#999" }}>扫描上面二维码，加我彩信</Text>
            </DialogContent>
        </Dialog>
    )

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
                <View style={styles.virtualPart}>
                    <TopBar rightIcon="icon_scan" />
                    <BlurView
                        style={[styles.absolute, styles.virtualPart, styles.z9]}
                        viewRef={this.state.viewRef}
                        blurType="dark"
                        blurAmount={10}
                    />
                    <Image
                        ref={img => (this.backgroundImage = img)}
                        source={{ uri: this.state.selfInfo.header_img }}
                        style={[styles.virtualPart, styles.absolute]}
                        onLoadEnd={this.imageLoaded.bind(this)}
                    />
                    <View style={[styles.infoContainer, styles.z9]}>
                        <TouchableOpacity onPress={() => this.props.navigation.navigate('PersonalInfo', { refresh: () => this.getSelfInfo() })}>
                            <View style={styles.avatarContainer}>
                                <Image
                                    style={styles.avatar}
                                    source={{ uri: this.state.selfInfo.header_img }}
                                />
                            </View>
                        </TouchableOpacity>
                        <Text style={styles.nickname}>{this.state.selfInfo.username}</Text>
                        <TouchableOpacity onPress={() => this.setState({ QrCodePoup: true })}>
                            <View style={styles.touchNumContainer}>
                                <Text style={styles.numText}>{this.state.selfInfo.lxname}</Text>
                                <Text style={[styles.margin_lr5, styles.numText]}>/</Text>
                                <Image style={styles.icon_QRcode} source={require("../assets/images/icon-QRcode.png")} />
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={[styles.blank, styles.z9]}></View>
                </View>
                <View style={[styles.z9, { flex: 1, backgroundColor: "#fff" }]}>
                    {
                        [
                            { navigate: "Signin", icon: require("../assets/images/icon-integral.png"), text: "签到收益" },
                            { navigate: "Wallet", icon: require("../assets/images/icon-wallet.png"), text: "我的钱包" },
                            { navigate: "Setting", icon: require("../assets/images/icon-setting.png"), text: "设置" },
                        ].map((item, index) => (
                            <TouchableOpacity
                                style={styles.optionContainer}
                                key={index}
                                onPress={() => this.props.navigation.navigate(item.navigate)}
                            >
                                <Image style={styles.option_icon} source={item.icon} />
                                <Text style={styles.option_text}>{item.text}</Text>
                                <Image style={styles.icon_next} source={require("../assets/images/icon-next.png")} />
                            </TouchableOpacity>
                        ))
                    }
                </View >

                <this.QrCodePoup />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    virtualPart: {
        height: 300
    },
    absolute: {
        position: "absolute",
        top: 0,
        left: 0,
        bottom: 0,
        right: 0
    },
    z9: {
        zIndex: 9
    },
    infoContainer: {
        alignItems: "center",
        flex: 1,
        justifyContent: "center"
    },
    avatarContainer: {
        width: 82,
        height: 82,
        borderRadius: 41,
        borderWidth: 4,
        justifyContent: "center",
        alignItems: "center",
        borderColor: "rgba(255,255,255,0.39)"
    },
    avatar: {
        width: 75,
        height: 75,
        borderRadius: 37.5
    },
    nickname: {
        fontSize: 24,
        color: "#FFF",
        fontWeight: "bold",
        marginTop: 11
    },
    touchNumContainer: {
        flexDirection: "row",
        marginTop: 14,
        alignItems: "center"
    },
    numText: {
        fontSize: 12,
        color: "#FFF"
    },
    margin_lr5: {
        marginLeft: 5,
        marginRight: 5
    },
    icon_QRcode: {
        width: 10,
        height: 10
    },
    blank: {
        height: 17,
        backgroundColor: "#fff",
        borderTopStartRadius: 17,
        borderTopEndRadius: 17
    },
    optionContainer: {
        height: 60,
        alignItems: "center",
        flexDirection: "row",
        justifyContent: "space-between"
    },
    option_icon: {
        width: 19,
        height: 19,
        marginLeft: 25
    },
    option_text: {
        flex: 1,
        marginLeft: 20,
        color: "#333",
        fontSize: 16
    },
    icon_next: {
        width: 7,
        height: 12,
        marginRight: 25
    },
    qrCode: {
        marginVertical: 18,
        borderRadius: 6,
        width: 204,
        height: 204,
        borderWidth: 1,
        borderColor: "#eee"
    },
});

export default My;
