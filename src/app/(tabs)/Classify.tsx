import { ExternalLink } from '@tamagui/lucide-icons'
import { Anchor, H2, Paragraph, XStack, YStack, SizableText, Button } from 'tamagui'
import { ToastControl } from '../CurrentToast'
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useState, useRef, useEffect } from 'react';
import { StyleSheet, Image } from 'react-native'
import * as tf from '@tensorflow/tfjs';
import * as ImageManipulator from 'expo-image-manipulator';
import { Asset } from 'expo-asset';
import { bundleResourceIO, decodeJpeg } from '@tensorflow/tfjs-react-native';
import * as FileSystem from 'expo-file-system';
import { loadTensorflowModel, TensorflowModel } from "react-native-fast-tflite"

export default function ClassificationScreen() {
    const [facing, setFacing] = useState<CameraType>('back');
    const [permission, requestPermission] = useCameraPermissions();
    const [isTfReady, setIsTfReady] = useState(false);
    const [classification, setClassification] = useState(null);
    const [model, setModel] = useState<TensorflowModel | null>(null);
    const cameraRef = useRef<CameraView | null>(null);

    // Ensure TensorFlow is ready before classifying
    useEffect(() => {
        const initializeTf = async () => {
            // await tf.ready();
            setIsTfReady(true);
            await loadModel();  // Load the model when TensorFlow is ready
        };
        initializeTf();
    }, []);

    const loadModel = async () => {
        // Load the TFLite model from the app bundle
     /*   const tfliteModel = await loadTensorflowModel(require("../../../assets/model/tflite/ASL.tflite"))*/
        const tfliteModel = await loadTensorflowModel(require("../../../assets/model/tflite/plant-disease.tflite"))
        setModel(tfliteModel);
    };

    if (!permission) {
        return <YStack />;
    }

    if (!permission.granted) {
        return (
            <YStack>
                <SizableText>We need your permission to show the camera</SizableText>
                <Button onPress={requestPermission}>grant permission</Button>
            </YStack>
        );
    }

    function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }


    const captureAndClassify = async () => {
        if (!cameraRef.current) return console.log("no camera ref");
        console.log("Wil Capture Image");

        // Capture the image from the camera
        const photo = await cameraRef.current.takePictureAsync();

        if (!photo) {
            throw new Error("Photo is undefined.");
        }

        const manipulatedImage = await ImageManipulator.manipulateAsync(photo.uri, [{ resize: { width: 224, height: 224 } }], { base64: true });
        console.log("Image Captured");

        if (!manipulatedImage.base64) {
            throw new Error("Base64 data is undefined.");
        }


        const imageTensor = decodeJpeg(Buffer.from(manipulatedImage.base64,"base64" ));
        console.log(imageTensor.toString());
        console.log("Image Converted into Tensor");


        if (!model) {
            console.log("Model is not loaded yet.");
            return;
        }

        // Perform classification with the loaded TFLite model
        console.log("Starting Classification");


        const typedArrayArray = await convertImageToTypedArrayArray(manipulatedImage.uri);

        const prediction = await model.run(typedArrayArray)
        console.log(prediction)

        console.log("Image Classified")
    };

    function base64ToUint8Array(base64) {
        const binaryString = atob(base64); // Decode base64 string to binary
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }

    // Main function to convert image to TypedArray[]
    async function convertImageToTypedArrayArray(imageUri) {
        // Resize the image and get it in base64 format
        const manipulatedImage = await ImageManipulator.manipulateAsync(
            imageUri,
            [{ resize: { width: 224, height: 224 } }],
            { base64: true }
        );

        // Convert the base64 image to a Uint8Array
        const uint8ArrayData = base64ToUint8Array(manipulatedImage.base64);

        // Initialize TypedArray arrays for R, G, B channels
        const width = 224;
        const height = 224;
        const redChannel = new Uint8Array(width * height);
        const greenChannel = new Uint8Array(width * height);
        const blueChannel = new Uint8Array(width * height);

        // Populate the channels from uint8ArrayData
        for (let i = 0; i < width * height; i++) {
            redChannel[i] = uint8ArrayData[i * 4];     // R
            greenChannel[i] = uint8ArrayData[i * 4 + 1]; // G
            blueChannel[i] = uint8ArrayData[i * 4 + 2]; // B
        }

        // Return as an array of TypedArrays
        return [redChannel, greenChannel, blueChannel];
    }

    return (
        <YStack flex={1}>
            <CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <YStack>
                    <Button onPress={toggleCameraFacing}>
                        <SizableText>Flip Camera</SizableText>
                    </Button>
                </YStack>
            </CameraView>

            <YStack style={styles.buttonContainer}>
                <Button onPress={captureAndClassify} disabled={!isTfReady}>
                    {isTfReady ? <SizableText>Capture and Classify</SizableText> : <SizableText>Waiting for Tensorflow...</SizableText>}
                </Button>
            </YStack>

            {/* Display Classification Result */}
            {classification && (
                <SizableText style={styles.message}>
                    Classification: {classification}
                </SizableText>
            )}
        </YStack>
    );
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
