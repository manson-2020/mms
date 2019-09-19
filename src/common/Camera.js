import React, {PureComponent} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    StatusBar,
    Dimensions,
    Image,
    TouchableWithoutFeedback,
    Animated,
    PermissionsAndroid
} from 'react-native';
import { AnimatedCircularProgress } from 'react-native-circular-progress';
import {RNCamera} from 'react-native-camera';
import AntDesign from 'react-native-vector-icons/AntDesign'
import Ionicons from 'react-native-vector-icons/Ionicons'
import Modal from "react-native-modal";
import MediaUtils from '../../util/MediaUtils'

const {width, height} = Dimensions.get('window');
export default class Camera extends PureComponent {
    state = {
        animatedValue: new Animated.Value(1),
        isVisible: false,
        canUseCamera: true,
        cameraData: null,
        scale:1,
        currentTime:0
    };
    constructor(props){
        super(props)
        this.requestCameraPermission()
    }
    componentWillMount(){
        // this.requestCameraPermission()

    }
    componentWillUnmount(): void {
    }
    async requestCameraPermission() {
        try {
            const granted = await PermissionsAndroid.requestMultiple(
                [
                    PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
                    PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
                ]
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('现在你获得摄像头权限了');
            } else {
               console.log('用户并不屌你');
            }
        } catch (err) {
            console.warn(err);
        }
    }

    /**
     *
     */
    hideModal() {
        this.setState({isVisible: false})
    }

    showModal() {
        this.setState({isVisible: true})
    }

    canCamera() {
        this.setState({canUseCamera: true,cameraData:null,currentTime:0})
    }

    noCamera() {
        this.setState({canUseCamera: false})
    }

    callBackData() {
        const {callBack} = this.props;
        const {cameraData} = this.state;
        this.setState({
            isVisible: false,
        },()=>{
            setTimeout(()=>{
                this.canCamera()
            },200)
        });
        callBack && callBack(cameraData);

    }

    usedToggle() {
        const {canUseCamera,currentTime} = this.state;

        if (canUseCamera) {
            return <View style={{flex: 1, alignItems: 'center'}}>
                <Text style={styles.tipText}>轻触拍照,长按摄像</Text>
                <View style={styles.btnWrap}>
                    <Animated.View style={{ transform: [{scale:this.state.animatedValue}]}}>
                        <AnimatedCircularProgress
                            size={66}
                            width={5}
                            fill={currentTime * 5 / 3}
                            rotation={0}
                            tintColor={'#18dd61'}
                            // onAnimationComplete={() => console.log('onAnimationComplete')}
                            backgroundColor={'#deebfb'}
                        >
                            {(fill)=> <TouchableWithoutFeedback
                                onLongPress={() => {
                                    this.isRecord = true;
                                    Animated.timing(this.state.animatedValue, {toValue: 1.5, duration: 500,}).start();
                                    this.timer=setTimeout(()=>{
                                        MediaUtils.recordAsync(this.camera).then((cameraData) => {
                                            this.setState({ cameraData: {type: 'video', ...cameraData}});
                                        });
                                        this.timer1=setInterval(()=>{
                                            this.setState((pre)=>({
                                                currentTime:pre.currentTime+.2
                                            }))
                                        },200);
                                    },500)

                                }}
                                onPress={() => {
                                    MediaUtils.takePictureAsync(this.camera).then((cameraData) => {
                                        this.setState({canUseCamera: false, cameraData: {type: 'photo', ...cameraData}})
                                    }, (e) => {
                                        console.log(e)
                                    })
                                }}
                                onPressOut={() => {
                                    this.timer && clearTimeout(this.timer);
                                    this.timer1 && clearTimeout(this.timer1);
                                    if (this.isRecord) {
                                        this.isRecord = false;
                                        MediaUtils.stopRecording(this.camera);

                                        if(this.state.currentTime <2){
                                            alert('录制时间太短,重新录制');
                                            this.setState({
                                                animatedValue: new Animated.Value(1),
                                                canUseCamera: true,
                                                cameraData:null,
                                                currentTime:0,
                                            });
                                            return
                                        }
                                        this.setState({
                                            animatedValue: new Animated.Value(1),
                                            currentTime:0,
                                            canUseCamera: false,
                                        });
                                    }
                                }}
                            >
                                <View  style={[styles.playBtn,]}/>
                            </TouchableWithoutFeedback>}
                        </AnimatedCircularProgress>
                    </Animated.View>
                    <TouchableOpacity
                        onPress={()=>this.hideModal()}
                        style={styles.backbtn}>
                        <Ionicons name={'ios-arrow-down'} size={38} color={'#fff'}/>
                    </TouchableOpacity>
                </View>
            </View>
        }
        return <View style={styles.btnWrap1}>
            <TouchableOpacity onPress={() => this.canCamera()} style={styles.qxBtn}>
                <AntDesign name={'back'} size={28}/>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => this.callBackData()} style={styles.okBtn}>
                <AntDesign name={'check'} size={28} color={ '#18dd61'}/>
            </TouchableOpacity>
        </View>

    }

    render() {
        const {isVisible} = this.state;
        return (
            <Modal isVisible={isVisible}
                   style={{backgroundColor: '#000', padding: 0, margin: 0}}
                   onBackButtonPress={() => this.hideModal()}
            >
                <View style={styles.container}>
                    <StatusBar hidden={true}/>
                    <RNCamera
                        ref={ref => {
                            this.camera = ref;
                        }}
                        style={styles.preview}
                        type={RNCamera.Constants.Type.back}
                        flashMode={RNCamera.Constants.FlashMode.on}
                        androidCameraPermissionOptions={{
                            title: 'Permission to use camera',
                            message: 'We need your permission to use your camera',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                        androidRecordAudioPermissionOptions={{
                            title: 'Permission to use audio recording',
                            message: 'We need your permission to use your audio',
                            buttonPositive: 'Ok',
                            buttonNegative: 'Cancel',
                        }}
                    />
                    <View style={styles.handleWrap}>
                        {this.usedToggle()}
                    </View>
                </View>
            </Modal>

        );
    }
}

const styles = StyleSheet.create({
    handleWrap: {
        width: width,
        height: 180,
        position: 'absolute',
        bottom: 0,
        left: 0,
        alignItems: 'center'

    },
    tipText: {
        color: '#fff',
    },
    btnWrap: {
        width:width,
        flex: 1,
        justifyContent: 'center',
        position:'relative',
        alignItems:'center'
    },
    btnWrap1: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
        alignItems: 'center',
        height: '100%'
    },
    playBtn: {
        backgroundColor: '#fff',
        width: 66,
        height: 66,
        borderRadius: 33,
    },
    qxBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#ddd',
        justifyContent: 'center',
        alignItems: 'center'
    },
    okBtn: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center'
    },
    container: {
        flex: 1,
        flexDirection: 'column',
        backgroundColor: 'black',
    },
    preview: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
    },
    capture: {
        flex: 0,
        backgroundColor: '#fff',
        borderRadius: 5,
        padding: 15,
        paddingHorizontal: 20,
        alignSelf: 'center',
        margin: 20,
    },
    backbtn:{
        position: 'absolute',
        left: 60,
        bottom: 55,
    }
});
