import React, { useState, useEffect, useRef } from "react";
import { StyleSheet, SafeAreaView, View, Text, TouchableOpacity, Modal, Image, Alert, PermissionsAndroid } from "react-native";
import { RNCamera } from "react-native-camera";
import Icon from 'react-native-vector-icons/FontAwesome';
import * as MediaLibrary from 'expo-media-library';

export default function App() {

    const camRef = useRef(null);
    const [type, setType] = useState(RNCamera.Constants.Type.back);
    const [hasPermission, setHasPermission] = useState(null);
    const [capturedPhoto, setCapturedPhoto] = useState(null);
    const [open, setOpen] = useState(false);

    useEffect(() => {
        const requestPermissions = async () => {
            const cameraStatus = await RNCamera.requestPermissionsAsync();
            setHasPermission(cameraStatus.status === 'granted');

            const storageStatus = await PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE);
            setHasPermission(storageStatus === PermissionsAndroid.RESULTS.GRANTED);
        };

        requestPermissions();
    }, []);

    if (hasPermission === null) {
        return <View />;
    }

    if (hasPermission === false) {
        return <Text>Acesso negado</Text>;
    }

    async function takePicture() {
        if (camRef.current) {
            const data = await camRef.current.takePictureAsync();
            setCapturedPhoto(data.uri);
            setOpen(true);
            console.log(data);
        }
    }

    async function savePicture() {
        try {
            const asset = await MediaLibrary.createAssetAsync(capturedPhoto);
            Alert.alert('Salvo com sucesso');
        } catch (error) {
            console.log('err', error);
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <RNCamera
                style={styles.camera}
                type={type}
                ref={camRef}
            >
                <View style={styles.cameraContainer}>
                    <TouchableOpacity style={styles.switchButton}
                        onPress={() => {
                            setType(type === RNCamera.Constants.Type.back ? RNCamera.Constants.Type.front : RNCamera.Constants.Type.back);
                        }}
                    >
                        <Text style={styles.switchText}>Trocar</Text>
                    </TouchableOpacity>
                </View>
            </RNCamera>

            <TouchableOpacity style={styles.button} onPress={takePicture}>
                <Icon name='camera' size={23} color='#FFF' />
            </TouchableOpacity>

            {
                capturedPhoto &&
                <Modal
                    animationType="slide"
                    transparent={false}
                    visible={open}
                >
                    <View style={styles.modalContainer}>
                        <View style={styles.modalButtonContainer}>
                            <TouchableOpacity style={styles.modalButton} onPress={() => setOpen(false)}>
                                <Icon name='window-close' size={50} color='#FF0000' />
                            </TouchableOpacity>

                            <TouchableOpacity style={styles.modalButton} onPress={savePicture}>
                                <Icon name='upload' size={50} color='#121212' />
                            </TouchableOpacity>
                        </View>

                        <Image style={styles.capturedImage} source={{ uri: capturedPhoto }} />
                    </View>
                </Modal>
            }

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    camera: {
        flex: 1,
    },
    cameraContainer: {
        flex: 1,
        backgroundColor: 'transparent',
        flexDirection: 'row',
    },
    switchButton: {
        position: 'absolute',
        bottom: 20,
        left: 20,
    },
    switchText: {
        fontSize: 20,
        marginBottom: 13,
        color: '#FFF',
    },
    button: {
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#121212',
        margin: 20,
        borderRadius: 10,
        height: 50,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 20,
    },
    modalButtonContainer: {
        margin: 10,
        flexDirection: 'row',
    },
    modalButton: {
        margin: 10,
    },
    capturedImage: {
        width: '100%',
        height: 450,
        borderRadius: 20,
    },
});
