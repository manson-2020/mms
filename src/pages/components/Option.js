import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableHighlight,
    TextInput,
    BackHandler,
    Platform,
    TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Dialog,
{
    SlideAnimation,
    ScaleAnimation,
    FadeAnimation,
    DialogFooter,
    DialogButton,
    DialogContent,
    DialogTitle,
} from 'react-native-popup-dialog';
import Picker from 'react-native-roll-picker';
import cityCode from '../../ChinaCityCode'
import MediaUtils from '../../../util/MediaUtils'

export default class Option extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            data: [],

            NickNamePopup: false,
            QrCodePopup: false,
            SexPopup: false,
            AreaPopup: false,
            TiesNumberPopup: false,
            FeedbackPopup: false,
            showHeaderPopup: false,

            nickname: false,
            area: false,
            sex: false,
            qrCode: false,
            phoneNumber: false,
            verfiyCode: false,

            countdownState: true,
            countdownText: '获取验证码',
        };
        this.rowIndex0 = this.rowIndex1 = this.rowIndex2 = 0;
        this.ChinaArea = cityCode.CityZoneCode.China;
        this.data = props.data;
        this.icon = {
            icon_qrCode: require("../../assets/images/icon-QRcode_black.png"),
        };
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }

    onBackButtonPressAndroid = () => {
        let { navigation } = this.props
        if (this.state.showHeaderPopup || this.state.NickNamePopup || this.state.QrCodePopup || this.state.SexPopup || this.state.AreaPopup || this.state.TiesNumberPopup) {
            this.setState({
                NickNamePopup: false,
                QrCodePopup: false,
                SexPopup: false,
                AreaPopup: false,
                TiesNumberPopup: false,
                showHeaderPopup: false
            });
            navigation.goBack();
            // return true; //返回true, 不执行系统操作。
        }
    }

    componentWillUnmount() {
        Platform.OS == "android" && BackHandler.removeEventListener('hardwareBackPress', this.onBackButtonPressAndroid)
    }

    componentWillMount() {
        switch (this.props.pageName) {
            case "personalInfo":
                this.dataRequest("getSelfInfo");
                break;
            case "setting":
                this.dataRequest("getNumber");
                // this.setState({ data: this.data });
                break;
        }
    }

    cancle(popup) {
        this.setState({ [popup]: false })
    }

    countdown() {
        if (this.state.countdownState) {
            let i = 60;
            this.setState({
                countdownState: false,
                countdownText: i + 's后重新获取'
            }, this.dataRequest.bind(this, "sendVerfiyCode"));
            this.timer = setInterval(() => {
                this.setState({
                    countdownState: false,
                    countdownText: `${i--}s后重新获取`
                });
                if (!i) {
                    clearInterval(this.timer);
                    this.setState({
                        countdownState: true,
                        countdownText: '重新获取'
                    });
                }
            }, 1000)
        }
        return false;
    }

    dataRequest(params, paramsBody, popup) {
        /**
         *  @param params 传入请求的方法名
         *  @param paramsBody object, 传入需要修改的键值
         *  @param popup sxtring, 传入需要关闭的弹窗
         */
        AsyncStorage.getItem('token').then(token => {
            switch (params) {
                case "getSelfInfo":
                    apiRequest('/index/userinfo/getinfo', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token
                        })
                    }).then(result => {
                        this.data.map((item, index) => {
                            switch (item.text) {
                                case "我的头像":
                                    this.data[index].image = result.res.header_img;
                                    item.method = () => this.setState({ showHeaderPopup: true });
                                    break;
                                case "我的昵称":
                                    this.data[index].rightText = result.res.username;
                                    this.data[index].method = () => this.setState({
                                        NickNamePopup: true,
                                        nickname: result.res.username
                                    });
                                    break;
                                case "彩信号":
                                    this.data[index].rightText = result.res.lxname;
                                    break;
                                case "我的二维码":
                                    this.data[index].method = () => this.setState({
                                        QrCodePopup: true,
                                        qrCode: result.res.qr_img
                                    });
                                    break;
                                case "性别":
                                    this.data[index].rightText = result.res.sex;
                                    this.data[index].method = () => this.setState({ SexPopup: true, sex: result.res.sex });
                                    break;
                                case "地区":
                                    this.data[index].rightText = result.res.city;
                                    this.data[index].method = () => this.setState({
                                        AreaPopup: true,
                                        area: result.res.city
                                    });
                                    break;
                            }
                        });

                        this.setState({ data: this.data })
                    })
                    break;
                case "getNumber":
                    apiRequest('/index/userinfo/get_num', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token
                        })
                    }).then(req => {
                        this.data.map((item, index) => {
                            switch (item.text) {
                                case "绑定手机号":
                                    this.data[index].rightText = req.res.phone;
                                    this.data[index].method = () => this.setState({ TiesNumberPopup: true, phone: req.res.phone });
                                    break;
                                case "帮助与反馈":
                                    this.data[index].method = () => this.setState({ FeedbackPopup: true });
                                    break;
                            }
                        })
                        this.setState({ data: this.data })
                    })
                    break;
                case "sendVerfiyCode":
                    apiRequest('/index/user/sendsms', {
                        method: 'post',
                        mode: "cors",
                        body: JSON.stringify({
                            phone: this.state.phoneNumber
                        })
                    }).then(req => req.code == 200 && alert(req.msg))
                    break;
                case "confirm":
                    apiRequest('/index/userinfo/updateinfo', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token,
                            ...paramsBody
                        })
                    }).then(result => {
                        if (result.code == 200) {
                            this.setState({ [popup]: false }, this.dataRequest.bind(this, "getSelfInfo"));
                        }
                    });
                    break;
                case "phoneSubmit":
                    apiRequest('/index/userinfo/bind_phone_do', {
                        method: 'post',
                        mode: "cors",
                        body: formDataObject({
                            token: token,
                            phone: this.state.phoneNumber,
                            ver_code: this.state.verfiyCode,
                        })
                    }).then(req => {
                        if (req.code == 200) {
                            this.setState({ [popup]: false, phoneNumber: null, verfiyCode: null }, this.dataRequest.bind(this, "getNumber"));
                        }
                    })
                    break;
            }
        })

    }

    /**
     * 修改头像弹框
     * @returns {*}
     * @constructor
     */
    ChangeHeaderPopup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="修改头像" />}
            dialogAnimation={new ScaleAnimation()}
            visible={this.state.showHeaderPopup}
            onTouchOutside={() => this.setState({ showHeaderPopup: false })}
        >
            <DialogContent style={{ alignItems: "center" }}>
                <Text style={styles.headerItem} onPress={() => this.getImge('camera')}>拍照</Text>
                <Text style={styles.line} />
                <Text style={styles.headerItem} onPress={() => this.getImge('album')}>从相册选取</Text>
            </DialogContent>
        </Dialog>
    );

    /**
     * 获取裁剪头像并上传
     * @param type
     * @returns {Promise<void>}
     */
    async getImge(type) {
        try {
            this.setState({ showHeaderPopup: false });
            const option = {
                mediaType: 'photo',
                cropping: true,
                includeBase64: true,
                multiple: false,
            };
            const result = type === 'album' ? await MediaUtils.openPicker(option) : await MediaUtils.openCamera(option);
            const img = 'data:image/jpg;base64,' + result.data;
            const url = '/index/userinfo/updateheaderimg';
            const token = await AsyncStorage.getItem('token').catch(() => alert('获取token失败'));
            apiRequest(url, {
                method: 'post',
                mode: "cors",
                body: JSON.stringify({ token, img })
            }).then((res) => {
                if (res['code'] == 200) {
                    alert(res['msg']);
                    this.setState((pre) => {
                        pre['data'][0]['image'] = res['res']['img'];
                        return { data: pre.data }
                    })
                }
            }, (e) => {
                console.log(e)
            });


        } catch (e) {
            console.log(e)
        }
    }

    NickNamePopup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="修改昵称" />}
            dialogAnimation={new SlideAnimation({ slideFrom: 'right' })}
            visible={this.state.NickNamePopup}
        >
            <DialogContent style={{ height: 60, alignItems: "center" }}>
                <TextInput
                    style={{ width: "100%", height: 60, textAlign: "center" }}
                    placeholder="请输入你要改的昵称"
                    maxLength={27}
                    autoFocus={true}
                    onChangeText={nickname => this.setState({ nickname: nickname })}
                    value={this.state.nickname}
                />
            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{ fontSize: 14 }}
                    onPress={this.cancle.bind(this, "NickNamePopup")}
                />
                <DialogButton
                    text="确认"
                    textStyle={{ fontSize: 14 }}
                    onPress={this.dataRequest.bind(this, "confirm", { username: this.state.nickname }, 'NickNamePopup')}
                />
            </DialogFooter>
        </Dialog>
    )

    QrCodePopup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="我的二维码" />}
            dialogAnimation={new ScaleAnimation()}
            visible={this.state.QrCodePopup}
            onTouchOutside={() => this.setState({ QrCodePopup: false })}
        >
            <DialogContent style={{ alignItems: "center" }}>
                <Image style={styles.qrCode} source={{ uri: this.state.qrCode }} />
                <Text style={{ color: "#999" }}>扫描上面二维码，加我彩信</Text>
            </DialogContent>
        </Dialog>
    )

    SexPopup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="性别" />}
            dialogAnimation={new FadeAnimation()}
            visible={this.state.SexPopup}
            onTouchOutside={() => this.setState({ SexPopup: false })}
        >
            <DialogContent style={{ alignItems: "center" }}>
                <TouchableHighlight
                    style={{ marginTop: 20 }}
                    underlayColor="rgba(0,0,0,0.1)"
                    onPress={this.dataRequest.bind(this, "confirm", { sex: "男" }, "SexPopup")}
                >
                    <View style={styles.sexPopupBtn}>
                        <Text style={styles.sexOption}>男</Text>
                        <View
                            style={[styles.selectCotainer, { borderColor: this.state.sex == "男" ? "#2375F1" : "#999" }]}>
                            {this.state.sex == "男" && <View style={styles.selected}></View>}
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={styles.sexLine}></View>
                <TouchableHighlight
                    underlayColor="rgba(0,0,0,0.1)"
                    onPress={this.dataRequest.bind(this, "confirm", { sex: "女" }, "SexPopup")}
                >
                    <View style={styles.sexPopupBtn}>
                        <Text style={styles.sexOption}>女</Text>
                        <View
                            style={[styles.selectCotainer, { borderColor: this.state.sex == "女" ? "#2375F1" : "#999" }]}>
                            {this.state.sex == "女" && <View style={styles.selected}></View>}
                        </View>
                    </View>
                </TouchableHighlight>
            </DialogContent>
        </Dialog>
    )

    AreaPopup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="选择地区" />}
            dialogAnimation={new SlideAnimation({ slideFrom: 'bottom' })}
            visible={this.state.AreaPopup}
        >
            <DialogContent style={{ alignItems: "center" }}>

                <View style={{ height: 225, flexDirection: 'row' }}>
                    <View style={{ flex: 1 }}>
                        <Picker
                            data={this.ChinaArea.Province}
                            ref={_Picker0 => this._Picker0 = _Picker0}
                            name='name'
                            onRowChange={index => {
                                this.rowIndex0 = index;
                                this.rowIndex1 = 0;
                                this.rowIndex2 = 0;
                                this._Picker1.setDataSource(this.ChinaArea.Province[this.rowIndex0].City);
                                this._Picker2.setDataSource(this.ChinaArea.Province[this.rowIndex0].City[0].Area)
                            }}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Picker
                            data={this.ChinaArea.Province[0].City}
                            ref={_Picker1 => this._Picker1 = _Picker1}
                            name='name'
                            onRowChange={index => {
                                this.rowIndex1 = index;
                                this.rowIndex2 = 0;
                                this._Picker2.setDataSource(this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].Area)
                            }}
                        />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Picker
                            data={this.ChinaArea.Province[0].City[0].Area}
                            ref={_Picker2 => this._Picker2 = _Picker2}
                            name='name'
                            onRowChange={index => this.rowIndex2 = index}
                        />
                    </View>
                </View>
            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{ fontSize: 14 }}
                    onPress={this.cancle.bind(this, "AreaPopup")}
                />
                <DialogButton
                    text="确认"
                    textStyle={{ fontSize: 14 }}
                    onPress={() => {
                        let address = String();
                        if (this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].Area[this.rowIndex2]) {
                            address = `${this.ChinaArea.Province[this.rowIndex0].name} ${this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].name} ${this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].Area[this.rowIndex2].name}`;
                        } else {
                            address = `${this.ChinaArea.Province[this.rowIndex0].name} ${this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].name}`;
                        }
                        this.dataRequest("confirm", { city: address }, 'AreaPopup')
                    }}
                />
            </DialogFooter>
        </Dialog>
    )


    FeedbackPopup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="帮助与反馈" />}
            dialogAnimation={new SlideAnimation({ slideFrom: 'top' })}
            visible={this.state.FeedbackPopup}
        >
            <DialogContent>
                <TextInput
                    style={{ marginTop: 22 }}
                    placeholder="请写下您的反馈信息…"
                    maxLength={99}
                    autoFocus={true}
                    multiline={true}
                    onChangeText={feedback => this.setState({ feedback: feedback })}
                    value={this.state.feedback}
                />
            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{ fontSize: 14 }}
                    onPress={this.cancle.bind(this, "FeedbackPopup")}
                />
                <DialogButton
                    text="提交"
                    textStyle={{ fontSize: 14 }}
                // onPress={this.dataRequest.bind(this, "confirm", { username: this.state.nickname }, 'FeedbackPopup')}
                />
            </DialogFooter>
        </Dialog>
    )

    TiesNumberPopup = () => {
        let isPhoneNumber = /^1[3456789]\d{9}$/.test(this.state.phoneNumber);
        return (
            <Dialog
                width={0.8}
                dialogTitle={<DialogTitle title="绑定手机号" />}
                dialogAnimation={new SlideAnimation({ slideFrom: 'right' })}
                visible={this.state.TiesNumberPopup}
            >
                <DialogContent style={{ backgroundColor: "#f5f5f5", alignItems: "center" }}>
                    <View style={[styles.TiesNumberPopup_inputContainer]}>
                        <TextInput
                            style={{ flex: 1 }}
                            placeholder="新的手机号码"
                            maxLength={11}
                            autoFocus={true}
                            keyboardType="numeric"
                            onChangeText={phoneNumber => this.setState({ phoneNumber: phoneNumber })}
                            value={this.state.phoneNumber}
                        />
                        <TouchableOpacity
                            onPress={() => this.countdown()}
                            disabled={!this.state.countdownState || !isPhoneNumber}
                        >
                            <Text style={[styles.verfiyCodeBtn, { opacity: (this.state.countdownState && isPhoneNumber) ? 1 : 0.6, }]}>{this.state.countdownText}</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={[styles.TiesNumberPopup_inputContainer]}>
                        <TextInput
                            style={{ flex: 1, }}
                            placeholder="请输入验证码"
                            keyboardType="numeric"
                            maxLength={6}
                            onChangeText={verfiyCode => this.setState({ verfiyCode: verfiyCode })}
                            value={this.state.verfiyCode}
                        />
                    </View>

                </DialogContent>

                <DialogFooter>
                    <DialogButton
                        text="取消"
                        textStyle={{ fontSize: 14 }}
                        onPress={this.cancle.bind(this, "TiesNumberPopup")}
                    />
                    <DialogButton
                        text="确认"
                        textStyle={{ fontSize: 14 }}
                        onPress={() => ((this.state.phoneNumber && this.state.verfiyCode) && this.dataRequest("phoneSubmit", null, "TiesNumberPopup"))}
                    />
                </DialogFooter>
            </Dialog>

        )
    }

    render() {
        /**
         * @param text: 左侧文本
         * @param mt: 上外边距
         * @param image: 右边图片
         * @param method: 点击方法
         * @param disIconNext: 不显示icon_next
         * @param isCenter: 左侧文本是否居中
         * @param rightText: 右侧文本
         **/

        return (
            <View style={styles.container}>
                {
                    this.state.data.map((item, index) => (
                        <TouchableHighlight
                            underlayColor="rgba(0,0,0,0.1)"
                            key={index}
                            style={[styles.optionContainer, { marginTop: item.mt }]}
                            onPress={item.method}
                        >
                            <View style={styles.optionMain}>
                                <Text style={[styles.optionText, item.isCenter && { textAlign: "center" }]}>
                                    {item.text}
                                </Text>
                                {item.image &&
                                    <Image
                                        style={!item.image.indexOf('http') ? styles.rightImage : styles.rightImage_icon}
                                        source={!item.image.indexOf('http') ? { uri: item.image } : this.icon[item.image]}
                                    />
                                }
                                <Text style={[
                                    styles.optionDescribe,
                                    {
                                        display: item.rightText ? 'flex' : 'none',
                                        marginRight: item.disIconNext ? 0 : 15
                                    }
                                ]}>
                                    {item.rightText}
                                </Text>
                                <Image
                                    style={[styles.iconNext, { display: !item.disIconNext ? 'flex' : 'none' }]}
                                    source={require('../../assets/images/icon-next.png')}
                                />
                            </View>
                        </TouchableHighlight>
                    ))
                }
                {this.ChangeHeaderPopup()}
                <this.NickNamePopup />
                <this.QrCodePopup />
                <this.SexPopup />
                <this.AreaPopup />
                <this.TiesNumberPopup />
                <this.FeedbackPopup />
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5"
    },
    optionContainer: {
        backgroundColor: "#fff",
        height: 66
    },
    optionMain: {
        flexDirection: "row",
        alignItems: "center",
        flex: 1,
        borderColor: "#eee",
        borderBottomWidth: 1,
        marginLeft: 15,
        marginRight: 15
    },
    optionText: {
        flex: 1,
        color: "#333",
        fontSize: 16
    },
    optionDescribe: {
        color: "#666",
        fontSize: 16
    },
    rightImage: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        marginRight: 15
    },
    rightImage_icon: {
        width: 14,
        height: 14,
        marginRight: 15
    },
    iconNext: {
        width: 7,
        height: 12
    },
    qrCode: {
        marginVertical: 18,
        borderRadius: 6,
        width: 204,
        height: 204,
        borderWidth: 1,
        borderColor: "#eee"
    },
    sexPopupBtn: {
        paddingVertical: 15,
        marginHorizontal: 10,
        width: 220,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
    },
    sexOption: {
        fontSize: 16
    },
    sexLine: {
        height: 0.5,
        width: 220,
        backgroundColor: "#eee",
        opacity: 0.6
    },
    selectCotainer: {
        justifyContent: "center",
        alignItems: "center",
        borderWidth: 1.5,
        width: 16,
        height: 16,
        borderRadius: 8
    },
    selected: {
        width: 9,
        height: 9,
        borderRadius: 4.5,
        backgroundColor: "#2375F1"
    },
    headerItem: {
        height: 40,
        lineHeight: 40,
        fontSize: 16,
    },
    line: {
        height: 1,
        width: '100%',
        backgroundColor: '#ddd'
    },
    TiesNumberPopup_inputContainer: {
        width: "100%",
        borderRadius: 9,
        paddingHorizontal: 18,
        justifyContent: "space-between",
        height: 66,
        backgroundColor: "#fff",
        flexDirection: "row",
        alignItems: "center",
        marginTop: 23
    },
    verfiyCodeBtn: {
        color: "#333",
        fontSize: 12,
        borderColor: "#bbb",
        borderWidth: 1,
        lineHeight: 26,
        borderRadius: 5,
        paddingHorizontal: 10
    }
});
