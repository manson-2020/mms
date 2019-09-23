import React, {Component} from 'react';
import Sound from "react-native-sound";
import propTypes from 'prop-types'

export default class PlayVoice extends Component {
    static propTypes = {
        url: propTypes.string.isRequired
    };

    constructor(props) {
        super(props)
    }

    /**
     * 第一次调用
     */
    componentWillMount(): void {
        this.initVoice()
    }

    /**
     * 组件url属性将要跟新时候触发，重置上一条语音播放的状态
     * @param nextProps
     * @param nextState
     * @param nextContext
     */
    componentWillUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void {
        if (this.sound) {
            this.sound.isPlaying() && this.sound.stop();
            this.sound.release();
            console.log('stop or release')
        }
    }

    /**
     * 根据url的值判断是否跟新
     * @param nextProps
     * @param nextState
     * @param nextContext
     * @returns {boolean}
     */
    shouldComponentUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): boolean {
        if (nextProps['url'] === this.props.url) {
            return false
        }
        return true
    }

    componentWillUnmount(): void {
        if(this.sound){
            this.sound.isPlaying() && this.sound.stop();
            this.sound.release();
        }
    }

    /**
     * 初始化播放语音
     */
    initVoice() {
        const url = this.props.url;
        if(!url)return;
        this.sound = new Sound(url, Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log(error)
            } else {
                console.log('paly', url);
                this.sound.play();
            }
        });
    }

    render(): React.ReactNode {
        return null;
    }
}
