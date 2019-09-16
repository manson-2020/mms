import React, { Component } from 'react';
import { View, Text, Button, Platform, PermissionsAndroid } from 'react-native';
import Sound from 'react-native-sound';                        // 播放声音组件
import { AudioRecorder, AudioUtils } from 'react-native-audio';

class TestRecordAudio extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentTime: 0.0,                                                   //开始录音到现在的持续时间
      recording: false,                                                   //是否正在录音
      stoppedRecording: false,                                            //是否停止了录音
      finished: false,                                                    //是否完成录音
      audioPath: AudioUtils.DocumentDirectoryPath + '/test.aac',          //路径下的文件名
      hasPermission: undefined,                                           //是否获取权限
      isPlay: true
    };

    this.prepareRecordingPath = this.prepareRecordingPath.bind(this);     //执行录音的方法
    this.checkPermission = this.checkPermission.bind(this);               //检测是否授权
    this.record = this.record.bind(this);                                 //录音
    this.stop = this.stop.bind(this);                                     //停止
    this.play = this.play.bind(this);                                     //播放
    this.pause = this.pause.bind(this);                                   //暂停
    this.finishRecording = this.finishRecording.bind(this);
  }

  prepareRecordingPath(audioPath) {
    AudioRecorder.prepareRecordingAtPath(audioPath, {
      SampleRate: 22050,
      Channels: 1,
      AudioQuality: "High",            //录音质量
      AudioEncoding: "aac",           //录音格式
      AudioEncodingBitRate: 32000     //比特率
    });
  }

  checkPermission() {
    if (Platform.OS !== 'android') {
      return Promise.resolve(true);
    }

    const rationale = {
      'title': '获取录音权限',
      'message': '彩信正请求获取麦克风权限用于录音,是否准许'
    };

    return PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.RECORD_AUDIO, rationale)
      .then((result) => {
        // alert(result);     //结果: granted ,    PermissionsAndroid.RESULTS.GRANTED 也等于 granted
        return (result === true || PermissionsAndroid.RESULTS.GRANTED)
      })
  }

  async record() {
    // 如果正在录音
    if (this.state.recording) {
      alert('正在录音中!' + this.state.audioPath);
      return;
    }

    //如果没有获取权限
    if (!this.state.hasPermission) {
      alert('没有获取录音权限!');
      return;
    }

    //如果暂停获取停止了录音
    if (this.state.stoppedRecording) {
      this.prepareRecordingPath(this.state.audioPath);
    }

    this.setState({ recording: true });

    try {
      const filePath = await AudioRecorder.startRecording();
    } catch (error) {
      console.error(error);
    }
  }

  async stop() {
    // 如果没有在录音
    if (!this.state.recording) {
      alert('没有录音, 无需停止!');
      return;
    }

    this.setState({ stoppedRecording: true, recording: false });

    try {
      const filePath = await AudioRecorder.stopRecording();

      if (Platform.OS === 'android') {
        this.finishRecording(true, filePath);
      }
      return filePath;
    } catch (error) {
      console.error(error);
    }

  }

  async play() {
    // 如果在录音 , 执行停止按钮
    if (this.state.recording) {
      await this.stop();
    }

    // 使用 setTimeout 是因为, 为避免发生一些问题 react-native-sound中
    setTimeout(() => {
      let sound = new Sound(this.state.audioPath,  Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('failed to load the sound', error);
        }
      });
      setTimeout(() => {
        if (this.state.isPlay) {
          sound.play();
          this.setState({ isPlay: !this.state.isPlay })
        } else {
          this.setState({ isPlay: !this.state.isPlay })
          sound.pause();
        }
      }, 100);
    }, 100);
  }

  async pause() {
    if (!this.state.recording) {
      alert('没有录音, 无需停止!');
      return;
    }

    this.setState({ stoppedRecording: true, recording: false });

    try {
      const filePath = await AudioRecorder.pauseRecording();

      // 在安卓中, 暂停就等于停止
      if (Platform.OS === 'android') {
        this.finishRecording(true, filePath);
      }
    } catch (error) {
      console.error(error);
    }
  }

  finishRecording(didSucceed, filePath) {
    this.setState({ finished: didSucceed });
    console.log(`Finished recording of duration ${this.state.currentTime} seconds at path: ${filePath}`);
  }

  componentDidMount() {

    // 页面加载完成后获取权限
    this.checkPermission().then((hasPermission) => {
      this.setState({ hasPermission });

      //如果未授权, 则执行下面的代码
      if (!hasPermission) return;
      this.prepareRecordingPath(this.state.audioPath);

      AudioRecorder.onProgress = (data) => {
        this.setState({ currentTime: Math.floor(data.currentTime) });
      };

      AudioRecorder.onFinished = (data) => {
        if (Platform.OS === 'ios') {
          this.finishRecording(data.status === "OK", data.audioFileURL);
        }
      };

    })
    // console.log(this.props.navigator)
    // console.log(audioPath)
  }

  render() {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        {/*  <NavBar
          title="录音"
          goBack={() => this.props.navigator.pop()}
        /> */}


        <View style={{ marginTop: 30 }}><Button onPress={this.record} title="录音" /></View>
        <View style={{ marginTop: 30 }}><Button onPress={this.stop} title="停止录音" /></View>
        <View style={{ marginTop: 30 }}><Button onPress={this.play} title="播放/暂停录音" /></View>


        {/* <WingBlank size="lg" style={{ paddingTop: 20 }}>
          <WhiteSpace size="md" />
          <Button type="primary" size="large" onClick={this.record}>录音</Button>
          <WhiteSpace size="md" />
          <Button type="primary" size="large" onClick={this.stop}>停止录音</Button>
          <WhiteSpace size="md" />
          <Button type="primary" size="large" onClick={this.pause}>暂停录音</Button>
          <WhiteSpace size="md" />
          <Button type="primary" size="large" onClick={this.play}>播放录音</Button>
        </WingBlank> */}
      </View>
    )
  }
}

export default TestRecordAudio;
