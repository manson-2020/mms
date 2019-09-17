import React, {Component} from 'react';
import {View, Text, StyleSheet, ImageBackground, StatusBar, TouchableOpacity, Image} from 'react-native'
import Modal from 'react-native-modal'
import EvilIcons from "react-native-vector-icons/EvilIcons";

export default class name extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isVisible: true,

        }
    }

    hide() {
        this.setState({isVisible: false})
    }

    show() {
        this.setState({isVisible: true})
    }

    render() {
        return <View style={styles.container}>
            <StatusBar hidden={true}/>
            <Modal
                isVisible={this.state.isVisible}
                animationIn="fadeIn"
                animationOut="fadeOut"
                style={{margin: 0, padding: 0, backgroundColor: 'rgba(0,0,0,.5)', alignItems: 'center'}}
                onBackButtonPress={() => this.hide()}>
                <View style={{
                    width: 300,
                    height: 410,
                    backgroundColor: "#FF5353",
                    borderRadius: 10,
                    position: 'relative'
                }}>
                    <ImageBackground source={require('../assets/img/img-bg-red-envelope.png')}
                                     style={{width: '100%', height: '100%'}}>
                        <TouchableOpacity onPress={() => this.hide()} style={styles.closeWrap}>
                            <EvilIcons name={'close'} color={'#fff'} size={26}/>
                        </TouchableOpacity>
                        <View style={{alignItems: 'center', paddingTop: 20, height: 270}}>
                            {this.props.header_img ? <Image
                                style={{width: 60, height: 60, borderRadius: 30}}
                                source={{uri: this.props.header_img}}/> : null}
                            <Text style={{fontSize: 16, color: '#F5E175', paddingTop: 15}}>赵浩生</Text>
                            <Text style={{fontSize: 24, color: '#F5E175', paddingTop: 35}}>恭喜发财,吉祥如意</Text>
                        </View>
                        <Text style={{width:'100%',textAlign:'center',fontSize: 24, color: '#F5E175', paddingTop: 35}}>红包超时未领取,已退回</Text>
                        {/*<Image style={{*/}
                            {/*position: 'absolute',*/}
                            {/*bottom: 72,*/}
                            {/*left: '50%',*/}
                            {/*width: 70,*/}
                            {/*height: 70,*/}
                            {/*marginLeft: -35*/}
                        {/*}}*/}
                               {/*source={require('../assets/img/icon-open.png')}/>*/}
                    </ImageBackground>
                </View>
            </Modal>
        </View>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    closeWrap: {
        alignItems: 'flex-end',
        paddingTop: 10,
        paddingRight: 10,
        width: '100%'
    },
});
