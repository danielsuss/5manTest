import { useEffect, useState, useRef } from 'react';
import styles from './style/LobbyConnected.module.css';

function AudioBubble({ user, mediaStream, username }) {
    const [bubbleClass, setBubbleClass] = useState(styles.user);
    const animationFrameRef = useRef();
    const audioRef = useRef(); // Create a ref for the audio element

    useEffect(() => {
        let analyser;
        if (mediaStream && audioRef.current) {
            if (user != username) {
                audioRef.current.srcObject = mediaStream; // Assign the media stream directly to the srcObject
            }
            analyser = newAnalyser(mediaStream);
            const checkAudio = () => checkAudioLevel(analyser, setBubbleClass, animationFrameRef);
            animationFrameRef.current = requestAnimationFrame(checkAudio);
        }

        // Cleanup function to disconnect the analyser and cancel the animation frame
        return () => {
            if (analyser) {
                analyser.disconnect(); // If your analyser has a disconnect method
            }
            cancelAnimationFrame(animationFrameRef.current);
        };
    }, [mediaStream, setBubbleClass]);

    return (
        <div className={styles.userWrapper}>
            <span className={bubbleClass}>{user}</span>
            <audio ref={audioRef} autoPlay></audio> {/* Use ref here */}
        </div>
    );
}

function newAnalyser(mediaStream) {
    if (!mediaStream) return;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const analyser = audioContext.createAnalyser();
    const source = audioContext.createMediaStreamSource(mediaStream);
    source.connect(analyser);
    return analyser;
}

export function checkAudioLevel(analyser, setBubbleClass, animationFrameRef) {
    if (!analyser) return;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(dataArray);

    let isAudioDetected = dataArray.some(value => value > 100);
    setBubbleClass(isAudioDetected ? styles.audioDetected : styles.user);
    // Update the animation frame request
    animationFrameRef.current = requestAnimationFrame(() => checkAudioLevel(analyser, setBubbleClass, animationFrameRef));
}

export default AudioBubble;
