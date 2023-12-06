import { useState } from "react"
import UserEntry from "./UserEntry";
import LobbyConnected from "./LobbyConnected";
import NotAllowed from "./NotAllowed";

function Lobby() {
    const [state, setState] = useState('UserEntry');
    const [username, setUsername] = useState('');
    const [roomID, setRoomID] = useState('');
    const [peerList, setPeerList] = useState({});
    const [localStream, setLocalStream] = useState(null);

    const appendToPeerList = (user, peerConnection) => {
        setPeerList(prevPeerList => {
            return { ...prevPeerList, [user]: peerConnection };
        });
    }

    let content;

    switch (state) {
        case 'UserEntry':
            content = <UserEntry setState={setState} username={username} setUsername={setUsername} roomID={roomID} setRoomID={setRoomID} appendToPeerList={appendToPeerList} localStream={localStream} setLocalStream={setLocalStream} />;
            break;
        case 'LobbyConnected':
            content = <LobbyConnected setState={setState} username={username} roomID={roomID} peerList={peerList} localStream={localStream} />;
            break;
        case 'NotAllowed':
            content = <NotAllowed setState={setState} />
            break;
    }

    return (
        <div>
            {content}
        </div>
    )
}

export default Lobby