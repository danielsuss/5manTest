export async function initMicrophone() {
    const localStream = await navigator.mediaDevices.getUserMedia({ audio: {
        echoCancellation: false,
    } });
    return localStream;
}

export function muteMicrophone(muted, mediaStream) {
    if (!muted) {
        mediaStream.getTracks()[0].enabled = false;
    } else {
        mediaStream.getTracks()[0].enabled = true;
    }
}