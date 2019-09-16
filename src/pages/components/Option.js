import React from 'react';
import {View, Text, StyleSheet, Image, TouchableHighlight, TextInput, BackHandler, Platform} from 'react-native';
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
            NickNamePoup: false,
            QrCodePoup: false,
            SexPoup: false,
            AreaPoup: false,
            TiesNumberPoup: true,

            nickname: false,
            area: false,
            sex: false,
            qrCode: false,
            phone: false,
            showHeaderPoup: false
        };
        this.rowIndex0 = 0;
        this.rowIndex1 = 0;
        this.rowIndex2 = 0;
        this.ChinaArea = cityCode.CityZoneCode.China;
        this.data = props.data;
        this.icon = {
            icon_qrCode: require("../../assets/images/icon-QRcode_black.png"),
        };
        Platform.OS == "android" && BackHandler.addEventListener('hardwareBackPress', this.onBackButtonPressAndroid);
    }

    onBackButtonPressAndroid = () => {
        if (this.state.showHeaderPoup || this.state.NickNamePoup || this.state.QrCodePoup || this.state.SexPoup || this.state.AreaPoup || this.state.TiesNumberPoup) {
            this.setState({
                NickNamePoup: false,
                QrCodePoup: false,
                SexPoup: false,
                AreaPoup: false,
                TiesNumberPoup: false,
                showHeaderPoup: false
            });
            return true; //返回true, 不执行系统操作。
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

    cancle(poup) {
        this.setState({[poup]: false})
    }

    dataRequest(params, paramsBody, poup) {
        /**
         *  @param params 传入请求的方法名
         *  @param paramsBody object, 传入需要修改的键值
         *  @param poup sxtring, 传入需要关闭的弹窗
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
                                    item.method = () => this.setState({showHeaderPoup: true});
                                    break;
                                case "我的昵称":
                                    this.data[index].rightText = result.res.username;
                                    this.data[index].method = () => this.setState({
                                        NickNamePoup: true,
                                        nickname: result.res.username
                                    });
                                    break;
                                case "彩信号":
                                    this.data[index].rightText = result.res.lxname;
                                    break;
                                case "我的二维码":
                                    this.data[index].method = () => this.setState({
                                        QrCodePoup: true,
                                        qrCode: result.res.qr_img
                                    });
                                    break;
                                case "性别":
                                    this.data[index].rightText = result.res.sex;
                                    this.data[index].method = () => this.setState({SexPoup: true, sex: result.res.sex});
                                    break;
                                case "地区":
                                    this.data[index].rightText = result.res.city;
                                    this.data[index].method = () => this.setState({
                                        AreaPoup: true,
                                        area: result.res.city
                                    });
                                    break;
                            }
                        });

                        this.setState({data: this.data})
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
                            if (item.text == "绑定手机号") {
                                this.data[index].rightText = req.res.phone;
                                this.data[index].method = () => this.setState({
                                    TiesNumberPoup: true,
                                    phone: req.res.phone
                                });
                            }
                        })
                        this.setState({data: this.data})
                    })
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
                            this.setState({[poup]: false}, this.dataRequest.bind(this, "getSelfInfo"));
                        }
                    });
                    break;
            }
        })

    }

    /**
     * 修改头像弹框
     * @returns {*}
     * @constructor
     */
    ChangeHeaderPoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="修改头像"/>}
            dialogAnimation={new ScaleAnimation()}
            visible={this.state.showHeaderPoup}
            onTouchOutside={() => this.setState({showHeaderPoup: false})}
        >
            <DialogContent style={{alignItems: "center"}}>
                <Text style={styles.headerItem} onPress={() => this.getImge('camera')}>拍照</Text>
                <Text style={styles.line}/>
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
            this.setState({showHeaderPoup:false});
            const option = {
                mediaType: 'photo',
                cropping: true,
                includeBase64: true,
                multiple:false,
            };
            const result = type === 'album' ? await MediaUtils.openPicker(option) : await MediaUtils.openCamera(option);
            const img='data:image/jpg;base64,'+result.data;
            const url = '/index/userinfo/updateheaderimg';
            const token=await AsyncStorage.getItem('token').catch(()=>alert('获取token失败'));
            apiRequest(url,{
                method: 'post',
                mode: "cors",
                body: JSON.stringify({token,img})
            }).then((res)=>{
                if(res['code'] == 200){
                    alert(res['msg']);
                    this.setState((pre)=>{
                        pre['data'][0]['image']=res['res']['img'];
                        return {data:pre.data}
                    })
                }
            },(e)=>{
                console.log(e)
            });


        } catch (e) {
            console.log(e)
        }
    }

    NickNamePoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="修改昵称"/>}
            dialogAnimation={new SlideAnimation({slideFrom: 'right'})}
            visible={this.state.NickNamePoup}
        >
            <DialogContent style={{height: 60, alignItems: "center"}}>
                <TextInput
                    style={{width: "100%", height: 60, textAlign: "center"}}
                    placeholder="请输入你要改的昵称"
                    maxLength={27}
                    autoFocus={true}
                    onChangeText={nickname => this.setState({nickname: nickname})}
                    value={this.state.nickname}
                />
            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{fontSize: 14}}
                    onPress={this.cancle.bind(this, "NickNamePoup")}
                />
                <DialogButton
                    text="确认"
                    textStyle={{fontSize: 14}}
                    onPress={this.dataRequest.bind(this, "confirm", {username: this.state.nickname}, 'NickNamePoup')}
                />
            </DialogFooter>
        </Dialog>
    )

    QrCodePoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="我的二维码"/>}
            dialogAnimation={new ScaleAnimation()}
            visible={this.state.QrCodePoup}
            onTouchOutside={() => this.setState({QrCodePoup: false})}
        >
            <DialogContent style={{alignItems: "center"}}>
                <Image style={styles.qrCode} source={{uri: this.state.qrCode}}/>
                <Text style={{color: "#999"}}>扫描上面二维码，加我彩信</Text>
            </DialogContent>
        </Dialog>
    )

    SexPoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="性别"/>}
            dialogAnimation={new FadeAnimation()}
            visible={this.state.SexPoup}
            onTouchOutside={() => this.setState({SexPoup: false})}
        >
            <DialogContent style={{alignItems: "center"}}>
                <TouchableHighlight
                    style={{marginTop: 20}}
                    underlayColor="rgba(0,0,0,0.1)"
                    onPress={this.dataRequest.bind(this, "confirm", {sex: "男"}, "SexPoup")}
                >
                    <View style={styles.sexPoupBtn}>
                        <Text style={styles.sexOption}>男</Text>
                        <View
                            style={[styles.selectCotainer, {borderColor: this.state.sex == "男" ? "#2375F1" : "#999"}]}>
                            {this.state.sex == "男" && <View style={styles.selected}></View>}
                        </View>
                    </View>
                </TouchableHighlight>
                <View style={styles.sexLine}></View>
                <TouchableHighlight
                    underlayColor="rgba(0,0,0,0.1)"
                    onPress={this.dataRequest.bind(this, "confirm", {sex: "女"}, "SexPoup")}
                >
                    <View style={styles.sexPoupBtn}>
                        <Text style={styles.sexOption}>女</Text>
                        <View
                            style={[styles.selectCotainer, {borderColor: this.state.sex == "女" ? "#2375F1" : "#999"}]}>
                            {this.state.sex == "女" && <View style={styles.selected}></View>}
                        </View>
                    </View>
                </TouchableHighlight>
            </DialogContent>
        </Dialog>
    )

    AreaPoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="选择地区"/>}
            dialogAnimation={new SlideAnimation({slideFrom: 'bottom'})}
            visible={this.state.AreaPoup}
        >
            <DialogContent style={{alignItems: "center"}}>

                <View style={{height: 225, flexDirection: 'row'}}>
                    <View style={{flex: 1}}>
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
                    <View style={{flex: 1}}>
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
                    <View style={{flex: 1}}>
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
                    textStyle={{fontSize: 14}}
                    onPress={this.cancle.bind(this, "AreaPoup")}
                />
                <DialogButton
                    text="确认"
                    textStyle={{fontSize: 14}}
                    onPress={() => {
                        let address = String();
                        if (this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].Area[this.rowIndex2]) {
                            address = `${this.ChinaArea.Province[this.rowIndex0].name} ${this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].name} ${this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].Area[this.rowIndex2].name}`;
                        } else {
                            address = `${this.ChinaArea.Province[this.rowIndex0].name} ${this.ChinaArea.Province[this.rowIndex0].City[this.rowIndex1].name}`;
                        }
                        this.dataRequest("confirm", {city: address}, 'AreaPoup')
                    }}
                />
            </DialogFooter>
        </Dialog>
    )

    TiesNumberPoup = () => (
        <Dialog
            width={0.8}
            dialogTitle={<DialogTitle title="绑定手机号"/>}
            dialogAnimation={new SlideAnimation({slideFrom: 'right'})}
            visible={this.state.TiesNumberPoup}
        >
            <DialogContent style={{/*  height: 60, */backgroundColor: "#f5f5f5", alignItems: "center"}}>
                <TextInput
                    style={{width: "100%", textAlign: "center", backgroundColor: "#fff"}}
                    placeholder="请输入手机号码"
                    maxLength={27}
                    autoFocus={true}
                    onChangeText={nickname => this.setState({nickname: nickname})}
                    value={this.state.nickname}
                />
                <TextInput
                    style={{width: "100%", textAlign: "center", backgroundColor: "#fff"}}
                    placeholder="请输入手机号码"
                    maxLength={27}
                    autoFocus={true}
                    onChangeText={nickname => this.setState({nickname: nickname})}
                    value={this.state.nickname}
                />

            </DialogContent>

            <DialogFooter>
                <DialogButton
                    text="取消"
                    textStyle={{fontSize: 14}}
                    onPress={this.cancle.bind(this, "TiesNumberPoup")}
                />
                <DialogButton
                    text="确认"
                    textStyle={{fontSize: 14}}
                    // onPress={this.dataRequest.bind(this, 'TiesNumberPoup')}
                />
            </DialogFooter>
        </Dialog>

    )

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
                            style={[styles.optionContainer, {marginTop: item.mt}]}
                            onPress={item.method}
                        >
                            <View style={styles.optionMain}>
                                <Text style={[styles.optionText, item.isCenter && {textAlign: "center"}]}>
                                    {item.text}
                                </Text>
                                {item.image &&
                                <Image
                                    style={!item.image.indexOf('http') ? styles.rightImage : styles.rightImage_icon}
                                    source={!item.image.indexOf('http') ? {uri: item.image} : this.icon[item.image]}
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
                                    style={[styles.iconNext, {display: !item.disIconNext ? 'flex' : 'none'}]}
                                    source={require('../../assets/images/icon-next.png')}
                                />
                            </View>
                        </TouchableHighlight>
                    ))
                }
                {this.ChangeHeaderPoup()}
                <this.NickNamePoup/>
                <this.QrCodePoup/>
                <this.SexPoup/>
                <this.AreaPoup/>
                <this.TiesNumberPoup/>
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
    sexPoupBtn: {
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
    }
});
