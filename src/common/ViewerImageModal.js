import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
    Platform, StatusBar,
} from 'react-native'
import Modal from 'react-native-modal'
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from "react-native-vector-icons/Ionicons";

export default class name extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,
            index: 0,
        }
    }

    hideModal() {
        this.setState({
            isVisible: false
        })
    }

    showModal() {
        this.setState({
            isVisible: true
        })
    }

    render() {
        const {imageUrls, index} = this.props;
        return <Modal
            isVisible={this.state.isVisible}
            animationIn="fadeIn"
            animationOut="fadeOut"
            style={{margin: 0, padding: 0, backgroundColor: '#000'}}
            onBackButtonPress={() => this.hideModal()}
        >
            <StatusBar hidden={true}/>
            <ImageViewer
                enableImageZoom={true}
                index={index}
                enableSwipeDown={true}
                onSwipeDown={() => {
                    this.hideModal()
                }}
                imageUrls={imageUrls}
            />
            <TouchableOpacity
                onPress={() => this.hideModal()}
                style={{position: 'absolute', left: 10, top: Platform.OS === 'ios' ? 10 : -10}}>
                <Ionicons
                    name={'ios-close'}
                    color={'#fff'}
                    style={{margin: 10}}
                    size={40}
                />
            </TouchableOpacity>

        </Modal>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
});
