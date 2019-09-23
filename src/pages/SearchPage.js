import React, {Component} from 'react';
import {
    View,
    Text,
    StyleSheet,
    StatusBar,
    DeviceInfo,
    Platform,
    ScrollView,
    TextInput,
    TouchableOpacity,
} from 'react-native';
import { searchConversations, ConversationType, ObjectName ,searchMessages} from "rongcloud-react-native-imlib";
import EvilIcons from 'react-native-vector-icons/EvilIcons'

const STATUS_BAR_HEIGHT = DeviceInfo.isIPhoneX_deprecated ? 0 : 20;//状态栏的高度
export default class SearchPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            searchValue: ''
        }
    }
    async onSearch(searchValue){
        this.setState({searchValue});
        const conversationTypes = [ConversationType.PRIVATE,ConversationType.GROUP];
        const objectNames = [ObjectName.Text, ObjectName.Image];
        const conversations = await searchConversations('zhs',['1'],objectNames);
        console.log(conversations)
    }
    render() {
        const {searchValue} = this.state;
        return <View style={styles.container}>
            <View style={styles.statusBar}>
                <StatusBar barStyle='dark-content'/>
            </View>
            <View style={styles.topBar}>
                <View style={styles.searchWrap}>
                    <EvilIcons name={'search'} size={26} style={styles.icon}/>
                    <TextInput
                        autoFocus={true}
                        returnKeyType="send"
                        placeholder={'输入搜索条件'}
                        onChangeText={(searchValue)=>this.onSearch(searchValue)}
                        onSubmitEditing={()=>{

                        }}
                        value={searchValue}
                        onBlur={() => {

                        }}
                        style={styles.input}/>
                </View>
                <TouchableOpacity onPress={()=>this.props.navigation.goBack()}>
                    <Text style={styles.btn}>取消</Text>
                </TouchableOpacity>
            </View>
            <View style={{flex:1}}>
                <ScrollView>

                </ScrollView>
            </View>
        </View>
    }

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    statusBar: {
        height: Platform.OS === 'ios' ? STATUS_BAR_HEIGHT : 20,
    },
    topBar: {
        flexDirection: 'row',
        height: 50,
        alignItems:'center',
        paddingLeft:15,
        paddingRight: 15,
        marginTop:10
    },
    searchWrap: {
        flex: 1,
        flexDirection: 'row',
        height:40,
        backgroundColor: '#f0f0f0',
        borderRadius:20,
        alignItems: 'center'
    },
    icon: {
        marginLeft:10
    },
    input: {
        flex: 1,
        padding: 0,
        margin: 0,
        paddingLeft: 12,
        paddingRight: 12,
    },
    btn:{
        paddingLeft:8,
        fontSize:16
    }
});
