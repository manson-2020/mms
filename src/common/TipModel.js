import React, {Component} from 'react';
import {View, Text, StyleSheet, StatusBar} from 'react-native'
import Modal from 'react-native-modal'
import propTypes from 'prop-types'

export default class TipModel extends Component {
    static propTypes = {
        nativeEvent: propTypes.any,
        hide:propTypes.func,
        callBack:propTypes.func,
    };

    constructor(props) {
        super(props);

    }


    render() {
        const {nativeEvent, hide,callBack} = this.props;
        if (!nativeEvent) return null;
        let {pageX, pageY,} = nativeEvent;
        if(pageX>150){
            pageX= pageX-120
        }
        return <Modal isVisible={true}
                      animationIn="fadeIn"
                      animationOut="fadeOut"
                      backdropOpacity={0}
                      backdropTransitionInTiming={0}
                      backdropTransitionOutTiming={0}
                      onBackdropPress={() => hide && hide()}
                      style={styles.modalWrap}>
            <View style={[styles.listWrap, {left: pageX, top: pageY}]}>
                <Text onPress={()=>callBack && callBack('del')} style={styles.itemWrap}>删除该聊天</Text>
                {/*<Text style={styles.itemWrap}>标记为已读</Text>*/}
            </View>

        </Modal>
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    modalWrap: {
        margin: 0,
        padding: 0,
        backgroundColor: 'transparent',
        position: 'relative'
    },
    listWrap: {
        width: 120,
        minHeight: 150,
        padding: 15,
        elevation: 10,
        borderRadius: 5,
        borderColor: '#000',
        position: 'absolute',
        left: 100,
        top: 100,
        zIndex: 10,
        backgroundColor: '#fff'
    },
    itemWrap: {
        width: '100%',
        height: 30,
        lineHeight: 30,
        fontSize:16
    }
});
