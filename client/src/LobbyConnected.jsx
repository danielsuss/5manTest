import { post_disconnect_user } from "./requests";
import { firestoreDB } from "./firebase.js";
import { useEffect, useState, useRef } from "react";
import { doc, onSnapshot, collection, getDoc, setDoc } from 'firebase/firestore';
import styles from './style/LobbyConnected.module.css';
import UserBubble from "./UserBubble.jsx";
import AudioBubble from "./AudioBubble.jsx";
import { initMicrophone, muteMicrophone } from "./audio.js";
import { servers } from "./userPeer.js";

function LobbyConnected({ setState, username, roomID, peerList, localStream }) {
  
    const [users, setUsers] = useState([]);
    const [muted, setMuted] = useState(false);
    const [muteText, setMuteText] = useState('Mute');
    const [streamList, setStreamList] = useState({});

    const appendToStreamList = (user, stream) => {
        setStreamList(prevStreamList => {
            return { ...prevStreamList, [user]: stream };
        });
    }

    useEffect(() => {
        async function  listenForAnswers(peerList, roomID, username) {
            const roomDocRef = doc(firestoreDB, "rooms", roomID);
            const newSnap = (await getDoc(roomDocRef)).data()
            const users = newSnap.users;
            for (let user in users) {
                user = users[user];
                if (user != username) {
                    const pc = peerList[user];
                    const callDoc = doc(roomDocRef, username, user);

                    const remoteStream = new MediaStream();
                        pc.ontrack = event => {
                            event.streams[0].getAudioTracks().forEach(track => {
                                remoteStream.addTrack(track);
                                console.log('track added to remote stream');
                                appendToStreamList(user, remoteStream);
                            });
                        };

                    onSnapshot(callDoc, (snapshot) => {
                        const data = snapshot.data();
                        console.log('trying to set remote description');
                        if (!pc.currentRemoteDescription && data?.answer) {
                            const answerDescription = new RTCSessionDescription(data.answer);
                            try {
                                pc.setRemoteDescription(answerDescription);
                                console.log('remote description set');
                            } catch {
                                console.log('failed to set remote description');
                            }
                        }
                    });

                    onSnapshot(collection(callDoc, 'answerCandidates'), (snapshot) => {
                        snapshot.docChanges().forEach((change) => {
                            if (change.type === 'added') {
                                const candidate = new RTCIceCandidate(change.doc.data());
                                pc.addIceCandidate(candidate);
                            }
                        });
                    });
                }
            }
        }
        listenForAnswers(peerList, roomID, username);
    }, [peerList, roomID, username])

    const disconnectUser = () => {

        for (let user in peerList) {
            if (peerList.hasOwnProperty(user)) {
                let peerConnection = peerList[user];
                if (peerConnection.getStreams) {
                    peerConnection.getStreams().forEach(stream => {
                    stream.getTracks().forEach(track => track.stop());
                    });
                }

                peerConnection.close();
            }
        }
    }

    const disconnectButton = () => {
        disconnectUser();
        post_disconnect_user(username, roomID);
        setState('UserEntry');
    }

    useEffect(() => {
        const pageClose = (e) => {
            disconnectUser();
            post_disconnect_user(username, roomID);
        }

        window.addEventListener('beforeunload', pageClose);

        return () => {
            window.removeEventListener('beforeunload', pageClose);
        };
    }, []);
    

    const muteButton = () => {
        muteMicrophone(muted, localStream);
        setMuted(!muted);

        if (!muted) {
            setMuteText('Unmute');
        } else {
            setMuteText('Mute');
        }
    }

    

    const prevUsersRef = useRef();

    useEffect(() => {
        const roomDocRef = doc(firestoreDB, "rooms", roomID);
        const unsubscribe = onSnapshot(roomDocRef, async (snapshot) => {
            const currentUsers = snapshot.data().users;
            setUsers(currentUsers);

            if (prevUsersRef.current) {
                const prevUsers = prevUsersRef.current;

                const addedUser = currentUsers.filter(user => !prevUsers.includes(user));
                if (addedUser.length > 0){
                    const newUser = addedUser[0];
                    if (newUser != username) {
                        const joinerCollectionRef = collection(roomDocRef, newUser);
                        console.log(joinerCollectionRef);
                        console.log(username);
                        const myCandidateDocRef = doc(joinerCollectionRef, username);
                        const answerCandidates = doc(collection(myCandidateDocRef, 'answerCandidates'));

                        const pc = new RTCPeerConnection(servers);

                        localStream.getAudioTracks().forEach((track) => {
                            pc.addTrack(track, localStream);
                        });

                        const remoteStream = new MediaStream();
                        pc.ontrack = event => {
                            event.streams[0].getAudioTracks().forEach(track => {
                                remoteStream.addTrack(track);
                                console.log('track added to remote stream');
                                appendToStreamList(newUser, remoteStream);
                            });
                        };

                        pc.onicecandidate = event => {
                            event.candidate && setDoc(answerCandidates, event.candidate.toJSON());
                        };
                        
                        const newSnap = await getDoc(myCandidateDocRef);
                        console.log(newSnap.data());
                        const offerDescription = newSnap.data().offer;
                        console.log(offerDescription);

                        if (offerDescription && offerDescription.type && offerDescription.sdp) {
                            console.log('setting remote description');
                            await pc.setRemoteDescription(new RTCSessionDescription(offerDescription));
                        } else {
                            console.error('Invalid offer description', offerDescription);
                        }

                        const answerDescription = await pc.createAnswer();
                        console.log('setting local description');
                        await pc.setLocalDescription(answerDescription);

                        const answer = {
                            type: answerDescription.type,
                            sdp: answerDescription.sdp,
                        }

                        await setDoc(myCandidateDocRef, {answer} );

                        onSnapshot(collection(myCandidateDocRef, 'offerCandidates'), (snapshot) => {
                            snapshot.docChanges().forEach((change) => {
                                if (change.type === 'added') {
                                    const candidate = new RTCIceCandidate(change.doc.data());
                                    pc.addIceCandidate(candidate);
                                }
                            });
                        });
                    }
                }
            }
            prevUsersRef.current = currentUsers;
        }, err => {
            console.log(`Encountered error: ${err}`);
        })
        return () => unsubscribe();
    }, [roomID]);

    return (
        <div>
            <p>connected to room {roomID}</p>
            <AudioBubble key={"local"} user={username} mediaStream={localStream} username={username} />
            <p>Other users:</p>
            <div className={styles.usersList}>
                {users.map((user, index) => (
                    user !== username && (
                        <AudioBubble key={index} user={user} mediaStream={streamList[user]}  username={username} />
                    )
                ))}
            </div>
            <button onClick={muteButton}>{muteText}</button>
            <button onClick={disconnectButton} className={styles.disconnectButton}>Disconnect</button>
        </div>
    );
}

export default LobbyConnected