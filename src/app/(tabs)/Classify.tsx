import { ExternalLink } from '@tamagui/lucide-icons'
import { Anchor, H2, Paragraph, XStack, YStack, SizableText, Button } from 'tamagui'
import { ToastControl } from '../../app/CurrentToast'
import { Camera, CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState } from 'react';
// import { Button, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native'

export default function ClassificationScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();


    if (!permission) {
        // Camera permissions are still loading.
        return <YStack />;
    }

    if (!permission.granted) {
        // Camera permissions are not granted yet.
        return (
            <YStack >
                <SizableText>We need your permission to show the camera</SizableText>
                <Button onPress={requestPermission} >grant permission</Button>
            </YStack>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }

    return (
        // <YStack f={1} ai="center" gap="$8" px="$10" pt="$5">
        //     <XStack ai="center" jc="center" fw="wrap" gap="$1.5" pos="absolute" b="$8">
        //         <Paragraph>

        //         </Paragraph>
        //     </XStack>
        // </YStack>

        <YStack flex={1}>
            <CameraView style={styles.camera} facing={facing}>
                <YStack >
                    <Button onPress={toggleCameraFacing}>
                        <SizableText >Flip Camera</SizableText>
                    </Button>
                </YStack>
            </CameraView>
        </YStack>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    message: {
        textAlign: 'center',
        paddingBottom: 10,
    },
    camera: {
        flex: 1,
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'transparent',
        margin: 64,
    },
    button: {
        flex: 1,
        alignSelf: 'flex-end',
        alignItems: 'center',
    },
    text: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
});