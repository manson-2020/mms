import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import Switch from 'react-native-switchbutton';
import TopBar from './components/TopBar';

class Notify extends React.Component {

    constructor() {
        super();
        this.state = {
            notify: true,
            sound: false,
            shock: false,
        };
        this.option = [
            { name: "声音", switch: "sound" },
            { name: "震动", switch: "shock", tips: "当应用运行时，你可以设置是否需要声音或者震动" },
        ]
    }

    Option = () => (
        this.option.map((item, index) => (
            <View key={index}>
                <View style={[styles.option, { opacity: this.state.notify ? 1 : 0.6 }]}>
                    <Text style={styles.optionText}>{item.name}</Text>
                    <Switch
                        onTintColor="#196FF0"
                        disabled={!this.state.notify}
                        onValueChange={value => this.setState({ [item.switch]: value })}
                        value={this.state[item.switch]}
                    />
                </View>
                {item.tips && <Text style={styles.tips}>{item.tips}</Text>}
            </View >
        ))
    )

    render() {
        return (
            <View style={styles.container}>
                <StatusBar barStyle="dark-content" translucent={true} backgroundColor="transparent" />
                <TopBar title="新消息通知" leftIcon="icon_back" leftPress={() => this.props.navigation.goBack()} />
                <View style={styles.main}>
                    <View style={styles.option}>
                        <Text style={styles.optionText}>新消息通知</Text>
                        <Switch
                            ref={notifySwitch => this.notifySwitch = notifySwitch}
                            onTintColor="#196FF0"
                            onValueChange={value => this.setState(this.state.notify ? { sound: false, shock: false, notify: value } : { notify: value })}
                            value={this.state.notify}
                        />
                    </View>
                    <Text style={styles.tips}>关闭后手机将不再接受新消息通知</Text>
                    {
                        (Platform.OS == "ios" && this.state.notify) && <this.Option />
                    }
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    main: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        paddingTop: 15
    },
    option: {
        backgroundColor: "#fff",
        height: 66,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
        borderBottomColor: "#eee",
        borderBottomWidth: 1,
    },
    optionText: {
        color: "#333",
        fontSize: 16,
    },
    tips: {
        marginVertical: 9,
        fontSize: 12,
        color: "#999",
        paddingHorizontal: 15,
    }
});

export default Notify;