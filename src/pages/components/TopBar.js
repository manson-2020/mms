import React from 'react';
import { Image, View, Text, StyleSheet, StatusBar, NativeModules, Platform, TouchableHighlight, TouchableOpacity, Animated, Easing } from 'react-native';
import PropTypes from 'prop-types'

class TopBar extends React.Component {

    static returnFalse = () => {
        return false;
    }

    static defaultProps = {
        leftPress: this.returnFalse,
        rightPress: this.returnFalse,
        rightButtonRotate: 0
    }

    static propTypes = {
        leftIcon: PropTypes.string,
        rightIcon: PropTypes.string
    }

    constructor(props) {
        super(props);
        this.state = {
            deviceHeight: 20,
            leftIcon: props.leftIcon,
            rightIcon: props.rightIcon,
            animatedValue: new Animated.Value(0),
            showOption: true,
        };
        this.rotateAnimated = Animated.timing(
            this.state.animatedValue,
            {
                toValue: 1,
                duration: 200,
                easing: Easing.in,
            }
        );

        this.images = {
            icon_back: require("../../assets/images/icon-back.png"),
            icon_back_white: require("../../assets/images/icon-back_white.png"),
            icon_plus: require("../../assets/images/icon-plus.png"),
            icon_option: require("../../assets/images/icon-option.png"),
            icon_option_black: require("../../assets/images/icon-option_black.png"),
            icon_addFriend: require("../../assets/images/icon-addFriend.png"),
            icon_scan: require("../../assets/images/icon-scanTitle.png"),
            icon_scan_black: require("../../assets/images/icon-scanTitle_black.png"),
        };
        this.rotate = this.state.animatedValue.interpolate({
            inputRange: [0, 1],
            outputRange: this.state.showOption ? ['0deg', `${this.props.angle || 0}deg`] : [`${this.props.angle || 0}deg`, '0deg']
        });
    }
    componentDidMount() {
        const { StatusBarManager } = NativeModules;
        if (Platform.OS === 'ios') {
            StatusBarManager.getHeight(statusBarHeight => {
                this.setState({
                    deviceHeight: statusBarHeight.height
                })
            });
        } else {
            this.setState({
                deviceHeight: StatusBar.currentHeight
            })
        }
    }

    rightPress() {
        this.props.rightPress();

        this.state.animatedValue.setValue(0);
        this.rotateAnimated.start(() => {
            this.setState({
                showOption: !this.state.showOption
            });
        });
    }

    render() {
        return (
            <View style={{ zIndex: 999 ,}}>
                <View style={[{ backgroundColor: "transparent" }, { height: this.state.deviceHeight }]}></View>
                <View style={styles.bg_transparent}>
                    <View style={styles.titleButton}>
                        {/* 左侧按钮 */}
                        <View style={styles.flex}>
                            <TouchableOpacity
                                disabled={!(this.props.leftIcon || this.props.leftText)}
                                style={styles.button}
                                // underlayColor="rgba(0,0,0,0.1)"
                                onPress={() => this.props.leftPress()}
                            >
                                {
                                    this.props.leftIcon ?
                                        <Image style={styles.leftButton} source={this.images[this.state.leftIcon]} />
                                        :
                                        <Text style={styles.leftText}>{this.props.leftText}</Text>
                                }
                            </TouchableOpacity>
                        </View>

                        {/* 中间标题 */}
                        <View style={[styles.flex, { justifyContent: "center" }]}>
                            <Text numberOfLines={1} style={[styles.middleButton, this.props.titleStyle]}>
                                {this.props.title}
                            </Text>

                            {this.props.titleComponent}

                        </View>

                        {/* 右侧按钮 */}
                        <View style={[styles.flex, { justifyContent: "flex-end" }]}>
                            <TouchableOpacity
                                disabled={this.props.rightBtnDisabled || !(this.props.rightIcon || this.props.rightText)}
                                style={styles.button}
                                onPress={this.rightPress.bind(this)}
                            >
                                {
                                    this.props.rightIcon ?
                                        <Animated.Image
                                            resizeMode="cover"
                                            style={[styles.rightButton, { transform: [{ rotate: this.rotate }] }, this.props.rightBtnStyle]}
                                            source={this.images[this.state.rightIcon]} />
                                        :
                                        <Text style={this.props.rightBtnStyle}>{this.props.rightText}</Text>
                                }

                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>
        );
    }
}


const styles = StyleSheet.create({
    flex: {
        flex: 1,
        flexDirection: "row"
    },
    bg_transparent: {
        backgroundColor: "transparent"
    },
    titleButton: {
        height: 44,
        flexDirection: 'row',
        justifyContent: "space-between",
        alignItems: "center"
    },
    button: {
        height: 44,
        justifyContent: "center",
        paddingLeft: 15,
        paddingRight: 15
    },
    leftButton: {
        width: 9,
        height: 16
    },
    leftText: {
        color: "#666",
        fontSize: 16
    },
    middleButton: {
        fontSize: 18,
        color: '#333',
        fontWeight: "bold"
    },
    rightButton: {
        width: 16,
        height: 16,
    }
});


export default TopBar;
