import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    ScrollView,
    TextInput,
    TouchableOpacity, Image
} from 'react-native';
import TopBar from '../components/TopBar';
import InputPayPasswordModal from '../../common/InputPayPasswordModal'

const InputItem=({title,showRightText=true,inputStyle,...inputProps})=>{
    return  <View style={styles.itemWrap}>
        <Text style={styles.title}>{title}</Text>
        <TextInput style={[styles.input,inputStyle]} {...inputProps}/>
        {showRightText?<Text style={styles.bolddText}>元</Text> : null}
    </View>
};


export default class SendRedBagsPage extends Component {
   constructor(props){
       super(props);
       this.state={

       }
   }

    render() {
        return <View style={styles.container}>
            <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content'/>
            <TopBar
                leftText={'取消'}
                leftPress={() => this.props.navigation.goBack()}
                title={'发红包'}
            />
            <ScrollView style={{  backgroundColor: '#f5f5f5'}}>
                <InputItem title={'金额'}
                           placeholder={'请输入金额'}
                           value={0.00}/>
                <InputItem title={'人数'}
                           placeholder={'请输入人数'}
                           showRightText={false}
                           inputStyle={{textAlign: 'left'}}
                           value={0.00}/>

                <InputItem title={'祝福语'}
                           placeholder={'恭喜发财吉祥如意'}
                           showRightText={false}
                           inputStyle={{textAlign: 'left'}}
                           value={0.00}/>

                <View style={styles.nubWrap}>
                    <Text style={[styles.moneyNub, {fontSize: 28, marginTop: -1}]}>¥</Text>
                    <Text style={styles.moneyNub}>0.00</Text>
                </View>
                <TouchableOpacity style={styles.btnWrap}>
                    <Text style={styles.subBtn}>赛钱进红包</Text>
                </TouchableOpacity>
                <InputPayPasswordModal/>
            </ScrollView>
        </View>
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    itemWrap: {
        flexDirection: 'row',
        height: 66,
        alignItems: 'center',
        backgroundColor: '#fff',
        marginTop: 20,
        paddingLeft: 16,
        paddingRight: 16

    },
    title: {
        fontSize: 16,
        color: '#333',
        fontWeight: 'bold'
    },
    input: {
        flex: 1,
        textAlign: 'right',
        color: '#999',
        fontSize: 14,
        paddingRight: 10,
        paddingLeft: 10,
        paddingTop: 0,
        paddingBottom: 0
    },
    bolddText: {
        fontWeight: 'bold',
        fontSize: 16,
        color: '#333',
    },
    nubWrap: {
        flexDirection: 'row',
        marginTop: 56,
        justifyContent: 'center',
    },
    moneyNub: {
        color: '#333',
        fontSize: 44
    },
    btnWrap:{
        marginTop:25,
        alignItems:'center'
    },
    subBtn: {
        width: 200,
        height: 40,
        lineHeight: 40,
        borderRadius: 20,
        fontSize: 15,
        color: '#fff',
        backgroundColor: '#FF535366',
        textAlign:'center'
    }
});
