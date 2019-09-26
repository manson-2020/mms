import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class Test extends React.Component {

    constructor(props) {
        super(props);
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