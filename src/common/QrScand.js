import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Animated,
    Easing,
    Image,
    Dimensions,
    BackHandler,
    Platform,
    TouchableOpacity
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { height, width } = Dimensions.get('window');

class QrScand extends React.Component {
    //初始参数
    constructor(props) {
        super(props);
        this.flag = false;
        this.state = {
            show: true,
            animation: new Animated.Value(0),
            tabAnimation: new Animated.Value(0),
            isLight: false
        };
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.goBack);
    }

    //组件加载完成执行
    componentDidMount() {
        this.startAnimation();
    }

    //组件即将销毁时
    componentWillUnMount() {
        this.setState({
            show: false
        });
        this.flag = false;
        Platform.OS == "android" && BackHandler.removeEventListener('hardwareBackPress', this.goBack)
    }

    //启动动画
    startAnimation() {
        if (this.state.show) {
            this.state.animation.setValue(0);
            Animated.timing(this.state.animation, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear
            }).start(() => this.startAnimation());
        }
    }

    goBack = () => {
        const { getParam, goBack } = this.props.navigation;
        getParam("refresh") && getParam("refresh")();
        goBack(getParam("key"));
        return true;
    }

    render() {
        return (
            <View style={[styles.container, { position: 'relative' }]}>
                <RNCamera
                    style={styles.preview}
                    type={RNCamera.Constants.Type.back}
                    barCodeTypes={[RNCamera.Constants.BarCodeType.qr]}//android
                    googleVisionBarcodeType={RNCamera.Constants.GoogleVisionBarcodeDetection.BarcodeType.QR_CODE}//ios
                    flashMode={this.state.isLight ? RNCamera.Constants.FlashMode.torch : RNCamera.Constants.FlashMode.off}
                    onBarCodeRead={(e) => this.barcodeReceived(e)}>
                    {({ camera, status, recordAudioPermissionStatus }) => (
                        <View style={{ flex: 1 }}>
                            <View style={styles.topWrap}>
                                <View style={styles.scanHeader}>
                                    <TouchableOpacity style={styles.leftButton} onPress={() => this.goBack()} >
                                        <Ionicons
                                            name={'ios-arrow-back'}
                                            size={26}
                                            style={{ color: 'white' }} />
                                    </TouchableOpacity>
                                    <Text style={styles.txtTitle}>二维码扫描</Text>
                                    <TouchableOpacity onPress={() => {
                                        this.setState({
                                            isLight: !this.state.isLight
                                        })
                                    }}>
                                        <Ionicons
                                            name={!this.state.isLight ? 'ios-flash-off' : 'ios-flash'}
                                            size={26}
                                            style={{ color: 'white', padding: 10, }} />
                                    </TouchableOpacity>

                                </View>
                                <Text style={styles.textStyle}>将二维码放入框内，即可自动扫描</Text>
                            </View>
                            <View style={styles.rectangleLayout}>
                                <View style={styles.rectangle}>
                                    <Image style={[styles.rectangle, { position: 'absolute', left: 0, top: 0 }]}
                                        source={require('../assets/img/icon_scan_rect.png')} />
                                    <Animated.View style={[styles.animatedStyle, {
                                        transform: [{
                                            translateY: this.state.animation.interpolate({
                                                inputRange: [0, 1],
                                                outputRange: [0, 200]
                                            })
                                        }]
                                    }]} />
                                </View>
                            </View>
                        </View>
                    )}
                </RNCamera>
            </View>
        )
    }

    barcodeReceived(e) {
        if (e) {
            if (this.flag) return;
            const { navigate, state, getParam } = this.props.navigation;
            //e.data.indexOf("group")返回0表示群组，返回-1表示用户
            navigate(
                "TargetInfo",
                {
                    targetInfo: { [!e.data.indexOf("group") ? "groupid" : "userid"]: e.data },
                    key: state.key,
                    refresh: getParam("refresh")
                }
            );
            this.flag = true;

        } else {
            alert('扫描失败,对准二维码继续扫描')
        }
    }
}

export default QrScand;
const styles = StyleSheet.create({
    scanHeader: {
        flexDirection: 'row',
        flexWrap: 'nowrap',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width: width,
        height: 50,
        lineHeight: 50,
        color: '#fff'
    },
    topWrap: {
        position: 'absolute',
        left: 0,
        top: 20,
        zIndex: 10
    },
    leftButton: {
        flex: .25,
        paddingLeft: 10
    },
    headTitle: {
        flex: .5
    },
    txtTitle: {
        flex: 1,
        fontSize: 20,
        color: '#fff',
        textAlign: 'center'
    },
    rightButton: {
        flex: .25,
        paddingRight: 10
    },
    container: {
        flex: 1,
        backgroundColor: 'black'
    },
    preview: {
        width: width,
        height: height,
        position: 'relative',
    },
    itemStyle: {
        backgroundColor: 'rgba(0,0,0,0.5)',
        width: (width - 200) / 2,
    },
    textStyle: {
        color: '#fff',
        marginTop: 20,
        fontWeight: 'bold',
        fontSize: 14,
        textAlign: 'center'
    },
    animatedStyle: {
        height: 2,
        backgroundColor: '#00c050'
    },
    rectangle: {
        height: 200,
        width: 200
    },
    rectangleLayout: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,.5)',
        justifyContent: 'center',
        alignItems: 'center'
    }


});
