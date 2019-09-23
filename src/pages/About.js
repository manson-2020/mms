import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import TopBar from './components/TopBar';

class About extends React.Component {

    render() {
        return (
            <View style={styles.container}>
                <TopBar title="关于彩信" leftIcon="icon_back" leftPress={() => this.props.navigation.goBack()} />
                <View style={styles.main}>
                    <View>
                        <Text style={styles.text}>&emsp;&emsp;在科技迅速发展的时代，舆论对社交软件的看法也不同。</Text>
                        <Text style={styles.text}>&emsp;&emsp;一方认为，社交软件拉近了社会人与人之间的距离，使世界成为了一个统一的整体。 而另一方却坚持认为社交软件的出现也伴随着邪恶势力的出现，黑客屡见不鲜，以及艳照门事件等等 。</Text>
                        <Text style={styles.text}>&emsp;&emsp;客观来讲，软件本身无对错，其本质是一个工具，主要是在于我们怎么使用，适当的时候用之，会是生活的一个调节剂，倘若过度依赖、沉溺其中，那就是生活的腐蚀剂。 </Text>
                    </View>
                    <View>
                        <Text style={styles.copyRight}>版本信息</Text>
                    </View>
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
        backgroundColor: "#F5F5F5",
        padding: 25,
        justifyContent: "space-between"
    },
    text: {
        fontSize: 16,
        color: "#666",
        lineHeight: 24,
        marginBottom: 25
    },
    copyRight: {
        color: "#999",
        textAlign: "center"
    }
});

export default About;