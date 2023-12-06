import { post_user_entry } from "./requests"
import { firestoreDB } from "./firebase.js";
import { doc, onSnapshot, getDoc, setDoc, collection, updateDoc, arrayUnion } from 'firebase/firestore';
import { UserLinkedPeer, servers } from "./userPeer.js";
import { initMicrophone } from "./audio.js";

function UserEntry({ setState, username, setUsername, roomID, setRoomID, appendToPeerList, localStream, setLocalStream }) {


    async function fetchMicrophone() {
        const stream = await initMicrophone();
        setLocalStream(stream);
        return stream;
    }

    const connectButton = async () => {
        const stream = await fetchMicrophone();
        console.log(stream);
        const roomDocRef = doc(firestoreDB, "rooms", roomID);
        const newSnap = await getDoc(roomDocRef);

        if (!newSnap.exists()) {
            await setDoc(roomDocRef, {
                users: arrayUnion(username)
            });

            setState('LobbyConnected');
        } else {

            const users = newSnap.data().users;

            if (!users.includes(username)) {
                const userCollectionRef = collection(roomDocRef, username);

                for (let user in users) {
                    
                    if (users[user] != username) {
                        const userDoc = doc(userCollectionRef, users[user]);
                        const offerCandidates = doc(collection(userDoc, 'offerCandidates'));
                        const answerCandidates = doc(collection(userDoc, 'answerCandidates'));

                        const pc = new RTCPeerConnection(servers);
                        pc.onsignalingstatechange = (event) => {
                            console.log(`signaling state changed to: ${pc.signalingState}`);
                        }

                        stream.getAudioTracks().forEach((track) => {
                            pc.addTrack(track, stream);
                        });

                        pc.onicecandidate = event => {
                            event.candidate && setDoc(offerCandidates, event.candidate.toJSON());
                        };

                        const offerDescription = await pc.createOffer();
                        await pc.setLocalDescription(offerDescription);

                        const offer = {
                            sdp: offerDescription.sdp,
                            type: offerDescription.type,
                        };

                        setDoc(userDoc, { offer });
                        appendToPeerList(users[user], pc);
                    }
                }
                await updateDoc(roomDocRef, {
                    users: arrayUnion(username)
                });
                setState('LobbyConnected');
            } else {
                setState('NotAllowed');
            }
        }      
    }
    

    return (
        <div>
            <input type="text" placeholder="username" onChange={(event) => setUsername(event.target.value)} />
            <input type="text" placeholder="Room ID" onChange={(event) => setRoomID(event.target.value)} />
            <button onClick={connectButton}>Connect</button>
        </div>
    )
}

export default UserEntry