import React from 'react';
import { View, StyleSheet, StatusBar, BackHandler, Platform } from 'react-native';
import TopBar from './components/TopBar';
import Option from './components/Option';

class PersonalInfo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            nickname: null,
            option: [
                { text: "我的头像", mt: 15, },
                { text: "我的昵称" },
                { text: "彩信号", disIconNext: true },
                { text: "我的二维码", image: "icon_qrCode" },
                { text: "性别", mt: 15 },
                { text: "地区" },
            ]
        }
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    }

    onBackButtonPressAndroid = () => {
        this.props.navigation.state.params.refresh();
    }

    componentWillUnmount() {
        Platform.OS == "android" && BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    }

    render() {
        return (
            <View style={styles.container}>
                <StatusBar translucent={true} backgroundColor="transparent" barStyle='dark-content' />
                <TopBar
                    title="个人信息"
                    leftIcon="icon_back"
                    leftPress={() => {
                        this.props.navigation.state.params.refresh();
                        this.props.navigation.goBack();
                    }} />
                <Option data={this.state.option} navigation={this.props.navigation} pageName="personalInfo" />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    }
});

export default PersonalInfo;
