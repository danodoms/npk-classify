import {Button, SizableText, YStack} from 'tamagui'
import {useEffect, useRef, useState} from 'react';
import {Image, StyleSheet} from 'react-native'
import * as ImageManipulator from 'expo-image-manipulator';
import {SaveFormat} from 'expo-image-manipulator';
import {loadTensorflowModel, TensorflowModel} from "react-native-fast-tflite"
import {
    Camera,
    runAtTargetFps,
    useCameraDevice,
    useCameraPermission,
    useFrameProcessor
} from "react-native-vision-camera";
import {useResizePlugin} from "vision-camera-resize-plugin"
import {decodeJpeg} from "@tensorflow/tfjs-react-native";
import {convertToRGB} from "react-native-image-to-rgb";


export default function ClassificationScreen() {

    /*const [facing, setFacing] = useState<CameraType>('back');*/
    const [isTfReady, setIsTfReady] = useState(false);
    const [classification, setClassification] = useState<string  | null>(null);
    const [model, setModel] = useState<TensorflowModel | null>(null);
    const cameraRef = useRef<Camera | null>(null);
    const [capturedImageUri, setCapturedImageUri] = useState<string | null>(null); // To hold the image URI
    const { resize } = useResizePlugin()




    const { hasPermission, requestPermission } = useCameraPermission()
    const device = useCameraDevice('back')



    const frameProcessor = useFrameProcessor((frame) => {
        'worklet'
      /*  console.log(`Frame: ${frame.width}x${frame.height} (${frame.pixelFormat})`)*/
        if (model == null) return

        'worklet'
        runAtTargetFps(1, () => {
            console.log("I'm running synchronously at 1 FPS!")
  /*          const brightness = detectBrightness(frame)*/

            // 1. Resize Frame using vision-camera-resize-plugin

            const resized = resize(frame, {
                scale: {
                    width: 224,
                    height: 224,
                },
                pixelFormat: 'rgb',
                dataType: 'uint8',
            })

            // 2. Run model with given input buffer synchronously
            const outputs = model.runSync([resized])
           /* console.log("model output:", outputs)*/


           /* setClassification(()=>"random")*/
            /*'worklet';
            runClassification()*/




        })
    }, [model])


    'worklet'
    const runClassification = (()=>{
        'worklet'
         setClassification(()=>"random")
    })


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
        const tfliteModel = await loadTensorflowModel(require("../../../assets/model/tflite/plant-disease/plant-disease.tflite"))
        setModel(tfliteModel);
    };



    if (!hasPermission) {
        return (
            <YStack>
                <SizableText>We need your permission to show the camera</SizableText>
                <Button onPress={requestPermission}>grant permission</Button>
            </YStack>
        );
    }

    if (!device) {
        return (
            <YStack>
                <SizableText>No camera device</SizableText>
            </YStack>
        );
    }

    /*function toggleCameraFacing() {
        setFacing(current => (current === 'back' ? 'front' : 'back'));
    }*/


    const captureAndClassify = async () => {
        if (!model) return console.log("Model is not loaded yet.");
        if (!cameraRef.current) return console.log("no camera ref");

        // Capture the image from the camera
        const photo = await cameraRef.current.takePhoto();

        if (!photo) {
            throw new Error("Photo is undefined, no image captured");
        }
        console.log("Image Captured");


        // Sets the captured image preview to flash on screen
        setCapturedImageUri("file://" + photo.path); // Set the image URI to show on screen
        setTimeout(() => setCapturedImageUri(null), 5000); // Hide the image preview after 5 seconds

        // Resize the image to fit the model requirements ex. 224 x 224 in 3 channels
        const manipulatedImage = await ImageManipulator.manipulateAsync("file://"  +  photo.path, [{ resize: { width: 224, height: 224 } }], {format:SaveFormat.JPEG , base64:true});
        console.log("Image Resized")

        // Convert manipulated image into rgb to fit the model and run classification
        const imageRgb = await uint8arrayToRgb("file://" + manipulatedImage.uri)

        // Perform classification with the loaded TFLite model
        console.log("Starting Classification");
        const prediction = model.runSync([imageRgb])
        console.log(prediction)

        console.log("Done, Image Classified")
    };


    async function uint8arrayToRgb(image){
        const convertedArray = await convertToRGB(image);
        let red: number[] = [];
        let green: number[] = [];
        let blue: number[] = [];
        for (let index = 0; index < convertedArray.length; index += 3) {
            red.push(convertedArray[index] / 255);
            green.push(convertedArray[index + 1] / 255);
            blue.push(convertedArray[index + 2] / 255);
        }
        const finalArray = [...red, ...green, ...blue];

        return new Uint8Array(finalArray);
    }


    function base64ToUint8Array(base64) {
        const binaryString = atob(base64); // Decode base64 string to binary
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes;
    }


    return (
        <YStack flex={1}>
            {/*<CameraView style={styles.camera} facing={facing} ref={cameraRef}>
                <YStack>
                    <Button onPress={toggleCameraFacing}>
                        <SizableText>Flip Camera</SizableText>
                    </Button>
                </YStack>
            </CameraView>*/}

            <Camera
                style={StyleSheet.absoluteFill}
                device={device}
                isActive={true}
                ref={cameraRef}
                photo={true}
                frameProcessor={frameProcessor}
            />
            {/* Image Preview */}
            {capturedImageUri && (
                <YStack style={styles.previewContainer}>
                    <Image source={{ uri: capturedImageUri }} style={styles.imagePreview} />
                </YStack>
            )}

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
    previewContainer: {
        position: 'absolute',
        top: 40,
        left: 20,
        borderRadius: 10,
        padding: 5,
    },
    imagePreview: {
        width: 100,
        height: 100,
        borderRadius: 5,
    }
});
