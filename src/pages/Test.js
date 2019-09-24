import React, { Component } from 'react';
import {
    AppRegistry,
    StyleSheet,
    Image,
    Text,
    TouchableHighlight,
    View
} from 'react-native';


export default class ViewProject extends Component {


    StringToContentArray(text) {
        // let text = "[Smile][Smail]"
        let reg = new RegExp(/\[ww]|\[微笑]/, 'g');
        let contentArray = [];
        let regArray = text.match(reg);
        console.warn(regArray)
        if (regArray === null) {
            contentArray.push({ "Content": text });
            return contentArray;
        }
        let indexArray = [];
        let pos = text.indexOf(regArray[0]);//头

        for (let i = 1; i < regArray.length; i++) {
            indexArray.push(pos);
            pos = text.indexOf(regArray[i], pos + 1);
        }
        indexArray.push(pos);//尾

        let result = [];
        indexArray.map((item, index) => {
            if (!index) {
                result.push({ text: text.substring(index, item) });
            }
            result.push({ emoji: text.substring(item, item + 4) });
            result.push({ text: text.substring(item + 4, indexArray[index + 1]) });
        })

        return result;
    }

    render() {
        let emoji = {
            "[ww]": require("../assets/emoji/ww.png")
        }
        return (
            <View style={styles.container}>
                {
                    this.StringToContentArray("123[ww]asdasd[ww]909-90-[123]asdasdasdas[ww]asdsadasd[ww]").map((item, index) => {
                        // console.warn(item)
                        if (item.text || item.content) {
                            return <Text key={index}>{item.text}</Text>
                        } else {
                            return <Image key={index} source={emoji[item.emoji]} style={{ width: 20, height: 20, marginHorizontal: 3 }} />
                        }
                    })
                }
            </View>
        );
    }


}



const styles = StyleSheet.create({
    container: {
        flex: 1,
        marginTop: 90,
        flexDirection: "row",
        alignItems: "center",
        flexWrap: "wrap"
    },
    welcome: {
        fontSize: 40,
        margin: 5
    },
    imageInTextStyle: {
        width: 100,
        height: 100,
        resizeMode: 'cover'
    }


});
