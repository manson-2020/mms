import ImagePicker from 'react-native-image-crop-picker';
import {
    sendMessage,
    ConversationType,
    ObjectName,
    sendMediaMessage,
} from "rongcloud-react-native-imlib";
import {RNCamera} from 'react-native-camera';


/**
 * 基本的参数配置
 * @type {{cropping: boolean, width: number, height: number}}
 */
const baseOptions = {
    // compressImageMaxWidth: 300,
    // compressImageMaxHeight: 400,
    // compressImageQuality: 0.4,
    cropping: false,
};
const coptions = {quality: 0.5, base64: false};


/**
 * 检查传传入的配置参数
 * @param option
 */
const checkParms = (option) => {
    if (!option instanceof Object) {
        throw new Error('option 必须是个对象')
    }
    if (option['mediaType'] === undefined) {
        throw new Error('option 中必须包含mediaType这个属性')
    }
    if (!['photo', 'video', 'any'].includes(option['mediaType'])) {
        throw new Error('option 中必须包含mediaType这个属性且值必须是[photo,video,any]中的一个')
    }
}

export default class MediaUtils {
    /**
     * 从相册选取 相册或者视频
     * @param option
     * @returns {Promise<Image | Image[]>}
     */
    static openPicker(option) {
        checkParms(option);
        return ImagePicker.openPicker({...baseOptions, ...option})
    }

    /**
     * 打开相机 拍照或者录像
     * @param option
     * @returns {Promise<Image | Image[]>}
     */
    static openCamera(option) {
        checkParms(option);
        return ImagePicker.openCamera({...baseOptions, ...option})
    }

    static getSendParams(parmas,send){
        const {targetId,content, success, progress, cancel, error, getLocalMes,} = parmas;
        if (targetId === undefined) throw new Error('parmas 中必须包含 targetId 这个属性');
        if (content === undefined) throw new Error('parmas 中必须包含 content 这个属性');
        if (!content instanceof Object) throw new Error('parmas 中必须包含 content 必须是个对象');

        const conversationType = /group/.test(targetId) ? ConversationType.GROUP : ConversationType.PRIVATE;
        const callback = {
            success(messageId) {
                success && success(messageId,{conversationType, targetId, content});
                console.log("发送成功：" + messageId);
            },
            progress(pro, messageId) {
                progress && progress(pro, messageId);
                console.log(`发送进度: ${pro} %`);
            },
            cancel() {
                cancel && cancel();
                console.log("发送取消");
            },
            error(errorCode, messageId, message) {
                error && error(errorCode, messageId, message);
                console.log("发送失败：" + errorCode, messageId, message);
            }
        };

        console.log({conversationType, targetId, content});
        getLocalMes && getLocalMes({conversationType, targetId, content});
        send({conversationType, targetId, content},callback)
    }

    /**
     * @param parmas
     */
    static sendMediaMessage(parmas) {
       this.getSendParams(parmas,(mes,callback)=>{
           sendMediaMessage(mes, callback);
       })
    }

    static sendMessage(parmas) {
        this.getSendParams(parmas,(mes,callback)=>{
            sendMessage(mes, callback);
        })
    }

    static takePictureAsync(camera, options) {
        return camera.takePictureAsync({...coptions, ...options});
    };

    static recordAsync(camera, options) {
        const baseoptions = {quality: RNCamera.Constants.VideoQuality["480p"], maxFileSize: (100 * 1024 * 1024)};
        return camera.recordAsync({...baseoptions, ...options});
    }

    static stopRecording(camera) {
        camera.stopRecording()
    }

}
