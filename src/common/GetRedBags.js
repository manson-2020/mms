import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    ImageBackground,
    StatusBar,
    TouchableOpacity,
    Image,
    TouchableWithoutFeedback,
} from 'react-native'
import Modal from 'react-native-modal'
import EvilIcons from "react-native-vector-icons/EvilIcons";
import propTypes from 'prop-types'

export default class name extends Component {
    static propTypes = {
        redBagsItem: propTypes.object
    };
    static defaultProps = {};

    constructor(props) {
        super(props);
        this.state = {
            isVisible: false,

        }
    }

    componentWillUpdate(nextProps: Readonly<P>, nextState: Readonly<S>, nextContext: any): void {

    }

    hide() {
        this.setState({isVisible: false})
    }

    show() {
        this.setState({isVisible: true})
    }

    render() {
        const {redBagsItem,callBack} = this.props;
        if (!redBagsItem) return null;
        const {header_img, nickname, username, hb_orderid,isGet} = redBagsItem;

        return <View>
            <StatusBar hidden={this.state.isVisible}/>
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
                        <View style={styles.mainWrap}>
                            <Image
                                style={styles.header}
                                source={{uri: header_img}}/>
                            <Text style={styles.name}>{nickname || username}</Text>
                            <Text style={styles.descText}>恭喜发财,吉祥如意</Text>
                        </View>
                        {/*<Text style={styles.backText}>红包超时未领取,已退回</Text>*/}
                        <TouchableWithoutFeedback onPress={() => {
                            this.hide();
                            callBack && callBack()
                        }}>
                            <Image style={styles.openIcon}
                                   source={require('../assets/img/icon-open.png')}/>
                        </TouchableWithoutFeedback>
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
    mainWrap: {
        alignItems: 'center',
        paddingTop: 20,
        height: 270
    },
    header: {
        width: 60,
        height: 60,
        borderRadius: 30,
    },
    name: {
        fontSize: 16,
        color: '#F5E175',
        paddingTop: 15,
    },
    descText: {
        fontSize: 24,
        color: '#F5E175',
        paddingTop: 35
    },
    backText: {
        width: '100%',
        textAlign: 'center',
        fontSize: 16,
        color: '#F5E175',
        paddingTop: 25
    },
    openIcon: {
        position: 'absolute',
        bottom: 72,
        left: '50%',
        width: 70,
        height: 70,
        marginLeft: -35,
        zIndex: 10
    }
});
