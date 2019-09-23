import React from 'react';
import { Image, View, StyleSheet, YellowBox, Platform } from 'react-native';
import { createAppContainer, createMaterialTopTabNavigator } from 'react-navigation';
import Message from './pages/Message';
import AddressBook from './pages/AddressBook';
import LifeCircle from './pages/LifeCircle';
import My from './pages/My';

YellowBox.ignoreWarnings(['Warning: ViewPagerAndroid']);
// console.disableYellowBox = true;

const imagesArr = {
    msg1_icon: require('./assets/images/msg1_icon.png'),
    msg0_icon: require('./assets/images/msg0_icon.png'),
    ab1_icon: require('./assets/images/ab1_icon.png'),
    ab0_icon: require('./assets/images/ab0_icon.png'),
    lc1_icon: require('./assets/images/lc1_icon.png'),
    lc0_icon: require('./assets/images/lc0_icon.png'),
    my1_icon: require('./assets/images/my1_icon.png'),
    my0_icon: require('./assets/images/my0_icon.png')
}

const TabBarIcon = props => {
    const styles = StyleSheet.create({
        container: {
            width: 35,
            justifyContent: "center",
            alignItems: "center"
        },
        icon: {
            height: 19, width: 19
        },
        marker: {
            position: "absolute",
            right: 0,
            top: 0,
            width: 9,
            height: 9,
            backgroundColor: "#FF1F1F",
            borderRadius: 9
        }
    });
    return (
        <View style={styles.container}>
            <Image style={styles.icon}
                source={props.focused ? imagesArr[`${props.iconName}1_icon`] : imagesArr[`${props.iconName}0_icon`]}
            />
            {/* 红点 */}
            {/* <View style={styles.marker}></View> */}
        </View>
    );
}

//Tab
const TabNavigator = createMaterialTopTabNavigator({
    Message: {
        screen: Message,//当前选项卡加载的页面
        navigationOptions: {
            tabBarLabel: '彩信',
            tabBarIcon: ({ tintColor, focused }) => (
                <TabBarIcon focused={focused} iconName="msg" />
            )
        },
    },
    AddressBook: {
        screen: AddressBook,
        navigationOptions: {
            tabBarLabel: '通讯录',
            tabBarIcon: ({ tintColor, focused }) => (
                <TabBarIcon focused={focused} iconName="ab" />
            ),
        },
    },
    /*  LifeCircle: {
         screen: LifeCircle,
         navigationOptions: {
             tabBarLabel: '生活圈',
             tabBarIcon: ({ tintColor, focused }) => (
                 <TabBarIcon focused={focused} iconName="lc" />
             ),
         }
     }, */
    My: {
        screen: My,
        navigationOptions: {
            tabBarLabel: '我的',
            tabBarIcon: ({ tintColor, focused }) => (
                <TabBarIcon focused={focused} iconName="my" />
            ),
        }
    }
}, {
    // initialRouteName: 'AddressBook',
    swipeEnabled: true,
    animationEnabled: true,
    tabBarPosition: "bottom", //如果在顶部，就是 top
    tabBarOptions: {
        showIcon: true, // 是否显示图标, 默认为false
        showLabel: true, // 是否显示label
        labelStyle: {
            fontSize: 10,
            color: '#000'
        },
        style: [
            {
                backgroundColor: '#fff',
                borderTopWidth: 1,
                borderTopColor: '#FEF1F4',
            },
            Platform.OS == "ios" &&
            {
                height: 80
            }
        ],
        indicatorStyle: {
            height: 0, // 不显示indicator
        },
    },
});

export default createAppContainer(TabNavigator);