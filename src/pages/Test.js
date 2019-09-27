import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class Test extends React.Component {

    constructor(props) {
        super(props);

        console.warn(this.stringToContentArray("a[Love][Hee][Stare]b[Cry]c"));
    }



    stringToContentArray(text, result = []) {
        let reg = new RegExp(/\[Oops]|\[Love]|\[Hee]|\[Cry]|\[Stare]|\[Awkward]|\[Shy]|\[Cold]|\[Laid-back]|\[Sinister-smile]|\[Thinking]|\[Wonder]|\[Surprised]|\[Cute]|\[Cool]|\[Sweat]|\[Shed-tears]|\[Sad]|\[Angry]|\[Momentum]|\[Pray]|\[Injured]|\[Wow]|\[Brick]/, 'g');
        let regArray = text.match(reg);
        if (regArray) {
            let indexArray = [];
            let pos = text.indexOf(regArray[0]);//头
            for (let i = 1; i < regArray.length; i++) {
                indexArray.push(pos);
                pos = text.indexOf(regArray[i], pos + 1);
            }
            indexArray.push(pos);//尾
            indexArray.map((item, index) => {
                if (!index) {
                    result.push({ text: text.substring(index, item) });
                }
                result.push({ emoji: text.substring(item, item + regArray[index].length) });

                if (indexArray[index + 1] - regArray[index].length != item) {
                    result.push({ text: text.substring(item + regArray[index].length, indexArray[index + 1]) });
                }
            })
        } else {
            result.push({ "text": text });
        }

        return result;
    }

    render = () => (
        <View style={styles.container}>
            <Text>This Is Test Page !</Text>
        </View>
    )

}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default Test;