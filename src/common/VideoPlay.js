import * as React from "react";
import {
    View,
    TouchableOpacity,
    Dimensions,
    StyleSheet,
    Platform, StatusBar,
} from "react-native";
import Video from "react-native-video";
import Modal from 'react-native-modal'
import Ionicons from 'react-native-vector-icons/Ionicons'

const {width, height} = Dimensions.get('window');

export default class VideoPlayerPage extends React.Component<any, any> {
    player: any;

    constructor(props) {
        super(props);

    }

    componentDidMount() {
    }

    componentWillUnmount(): void {

    }

    render() {
        const {videoSource, poster, onBackButtonPress,...modelPorps} = this.props;
        return (
            <Modal isVisible={true}
                   {...modelPorps}
                   onBackButtonPress={() => onBackButtonPress && onBackButtonPress()}
            >
                <View style={styles.container}>
                    <StatusBar hidden={true}/>
                    <TouchableOpacity style={styles.back} onPress={() => onBackButtonPress && onBackButtonPress()}>
                        <Ionicons name={'ios-arrow-back'} size={30} color={'#fff'}/>
                    </TouchableOpacity>
                    <Video
                        poster={poster}
                        source={videoSource}
                        onBackButtonPress={()=>onBackButtonPress && onBackButtonPress()}
                        style={{width: width, height: height}}
                        ref={(ref: any) => this.player = ref}
                        controls={true}
                    />
                </View>
            </Modal>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        alignItems: "center",
        justifyContent: "center",
        position: 'relative'
    },
    back: {
        width: 50,
        height: 50,
        position: 'absolute',
        left: 0,
        top: 0,
        zIndex: 9999,
        marginLeft:20,
        marginTop:20
    }
});
