import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, Button, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as tf from '@tensorflow/tfjs';
import { fetch, bundleResourceIO } from '@tensorflow/tfjs-react-native';

const Predict = () => {
    const [model, setModel] = useState<tf.GraphModel | null>(null);
    const [image, setImage] = useState<string | null>(null);
    const [prediction, setPrediction] = useState<string>('');

    useEffect(() => {
        const loadModel = async () => {
            await tf.ready();
            const model = await tf.loadGraphModel('https://www.kaggle.com/models/rishitdagli/plant-disease/TfJs/default/1', { fromTFHub: true });
            setModel(model);
        };
        loadModel();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });

        if (!result.canceled) {
            const { uri } = result.assets[0];
            setImage(uri);
            classifyImage(uri);
        }
    };

    const classifyImage = async (uri) => {
        if (!model) return;

        const response = await fetch(uri, {}, { isBinary: true });
        const imageData = new Uint8Array(await response.arrayBuffer());
        const imageTensor = tf.tidy(() => {
            const img = tf.node.decodeImage(imageData, 3);
            const resized = tf.image.resizeBilinear(img, [224, 224]);
            const normalized = resized.div(255.0);
            return normalized.expandDims(0);
        });

        const predictions = model.predict(imageTensor);
        const topK = predictions.topk();
        const classIndex = topK.indices.dataSync()[0];

        const classNames = [
            "Apple___Apple_scab", "Apple___Black_rot", "Apple___Cedar_apple_rust", "Apple___healthy",
            "Blueberry___healthy", "Cherry_(including_sour)___Powdery_mildew", "Cherry_(including_sour)___healthy",
            "Corn_(maize)___Cercospora_leaf_spot Gray_leaf_spot", "Corn_(maize)___Common_rust_",
            "Corn_(maize)___Northern_Leaf_Blight", "Corn_(maize)___healthy", "Grape___Black_rot",
            "Grape___Esca_(Black_Measles)", "Grape___Leaf_blight_(Isariopsis_Leaf_Spot)", "Grape___healthy",
            "Orange___Haunglongbing_(Citrus_greening)", "Peach___Bacterial_spot", "Peach___healthy",
            "Pepper_bell___Bacterial_spot", "Pepper_bell___healthy", "Potato___Early_blight",
            "Potato___Late_blight", "Potato___healthy", "Raspberry___healthy", "Soybean___healthy",
            "Squash___Powdery_mildew", "Strawberry___Leaf_scorch", "Strawberry___healthy", "Tomato___Bacterial_spot",
            "Tomato___Early_blight", "Tomato___Late_blight", "Tomato___Leaf_Mold", "Tomato___Septoria_leaf_spot",
            "Tomato___Spider_mites Two-spotted_spider_mite"
        ];

        setPrediction(classNames[classIndex]);
    };

    return (
        <View style={styles.container}>
            <Button title="Pick an image from camera roll" onPress={pickImage} />
            {image && <Image source={{ uri: image }} style={{ width: 200, height: 200 }} />}
            {prediction && <Text style={styles.prediction}>{prediction}</Text>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    prediction: {
        margin: 20,
        fontSize: 18,
    },
});

export default Predict;
