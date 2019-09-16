import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

class LifeCircle extends React.Component {

    render() {
        return (
            <View style={styles.container}>
                <Text>This Is LifeCircle Page !</Text>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center"
    }
});

export default LifeCircle;