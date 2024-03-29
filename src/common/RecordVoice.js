import React, {Component, Fragment} from 'react';
import {View, Text, StyleSheet, TouchableHighlight, Platform, Vibration, Modal} from 'react-native';
import Sound from 'react-native-sound';
import {AudioRecorder, AudioUtils} from 'react-native-audio';
import propTypes from 'prop-types'
import MaterialIcons from 'react-native-vector-icons/MaterialIcons'


export default class RecordVoice extends Component {
    static propTypes = {
        callBack: propTypes.func,
    };

    constructor(props) {
        super(props);
        this.state = {
            currentTime: 0,
            hasPermission: undefined,
            isRecording: false,
        }
    }

    componentWillMount(): void {
        /**
         * 获取权限
         */
        AudioRecorder.requestAuthorization().then((isAuthorised) => {
            this.setState({hasPermission: isAuthorised});

            if (!isAuthorised) return;
            /**
             * 设置录音路径以及配置参数
             */
            this.prepareRecordingPath();
            /**
             * 监听录音进度
             * @param data
             */
            AudioRecorder.onProgress = (data) => {
                const currentTime = data.currentTime;
                console.log(currentTime);
                this.setState({currentTime,}, () => {
                    if (currentTime >= 60) {
                        this.stopRecord()
                    }
                });
            };
            /**
             * ios录音结束触发
             * @param data
             */
            AudioRecorder.onFinished = (data) => {
                // Android callback comes in the form of a promise instead.
                if (Platform.OS === 'ios') {
                    const {status, audioFileURL} = data;
                    if (status === 'OK') {
                        const {currentTime} = this.state;
                        const {callBack} = this.props;
                        callBack && callBack(audioFileURL, currentTime);

                    }
                }
            };
        });
    }

    componentWillUnmount(): void {
        if (this.state.isRecording) {
            AudioRecorder.stopRecording();
        }
    }

    /**
     * 初始化录音参数
     */
    prepareRecordingPath() {
        this.audioPath = AudioUtils.DocumentDirectoryPath + '/' + new Date().getTime() + '.aac';
        AudioRecorder.prepareRecordingAtPath(this.audioPath, {
            SampleRate: 8000,
            Channels: 1,
            AudioQuality: "Low",
            AudioEncoding: "aac"
        });
    }

    /**
     * 开始录音
     * @returns {Promise<void>}
     */
    async startRecord() {
        try {
            if (this.state.isRecording) {
                this.setState({isRecording: false});
                await AudioRecorder.stopRecording;
            }
            Vibration.vibrate();
            const filePath = await AudioRecorder.startRecording();
            console.log('start');
            this.setState({isRecording: true});
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 停止录音
     * @returns {Promise<void>}
     */
    async stopRecord() {
        const {callBack} = this.props;
        const {currentTime} = this.state;
        try {
            if (!this.state.isRecording) {
                return;
            }
            const filePath = await AudioRecorder.stopRecording();
            this.setState({isRecording: false});
            console.log('start');
            if (currentTime < 1) {
                alert('说话时间太短');
                this.reset();
                return
            }
            if (Platform.OS === 'android') {
                callBack && callBack(filePath, currentTime);
                this.reset()
            }
            return filePath;
        } catch (error) {
            console.error(error);
        }
    }

    /**
     * 重置参数
     */
    reset() {
        this.setState({
            currentTime: 0,
        }, () => {
            this.prepareRecordingPath();
        })
    }

    render() {
        const {isRecording,currentTime} = this.state;
        return <Fragment>
            <TouchableHighlight onLongPress={() => this.startRecord()}
                                onPressOut={() => this.stopRecord()}
                                style={styles.voiceBtnWrap}
                                underlayColor={'#999'}>
                <Text>{this.state.isRecording ? '松开停止' : '按住说话'}</Text>

            </TouchableHighlight>
            <Modal
                animationType="none"
                transparent={true}
                visible={isRecording}
            >
                <View style={styles.wrap}>
                    <View style={styles.mainWrap}>
                        <MaterialIcons name={'keyboard-voice'} size={60}color={'#fff'}/>
                        <Text style={{fontSize:20,paddingTop:5}}>{parseInt(currentTime)}秒</Text>
                    </View>
                </View>
            </Modal>
        </Fragment>
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    voiceBtnWrap: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    wrap:{
        flex:1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    mainWrap:{
        width: 150,
        height: 150,
        backgroundColor:'rgba(0,0,0,.3)',
        borderRadius:5,
        justifyContent:'center',
        alignItems: 'center',
    }
});
