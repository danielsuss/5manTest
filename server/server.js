const express = require('express');
const cors = require('cors');
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, collection, addCollection, setCollection, getDoc, updateDoc, arrayUnion, arrayRemove } = require('firebase/firestore');

const firebaseConfig = {
    apiKey: "AIzaSyAj9Zf-H7fZ93oxYFyDTW6chIdW-1-7O1g",
    authDomain: "dbchatroomtest.firebaseapp.com",
    projectId: "dbchatroomtest",
    storageBucket: "dbchatroomtest.appspot.com",
    messagingSenderId: "465223248067",
    appId: "1:465223248067:web:f71707dea068b29fa69a76",
    measurementId: "G-FQ4RW2HX19"
};

const firebaseApp = initializeApp(firebaseConfig);
const firestoreDB = getFirestore(firebaseApp);
const server = express();

server.use(cors());
server.use(express.json());
server.use(express.urlencoded({ extended: true }));

server.post("/userEntry", async (req, res) => {
    console.log("Received info from client:", req.body);

    username = req.body['username'];
    roomID = req.body['roomID'];

    const roomDocRef = doc(firestoreDB, "rooms", roomID);
    const docSnap = await getDoc(roomDocRef);
    
    if(docSnap.exists()) {
        const users = docSnap.data().users;
        if (!users.includes(username)){
            console.log('new user');
            await updateDoc(roomDocRef, {
                users: arrayUnion(username)
            });
        }
        else{
            res.status(200).json({
                'status': 'userExists'
            });
        }
    }
    else {
        await setDoc(roomDocRef, {
            users: arrayUnion(username)
        });
    }

    const newSnap = await getDoc(roomDocRef);
    const users = newSnap.data().users;
    const userCollectionRef = collection(roomDocRef, username);

    // for (let user of users) {
    //     console.log(`Username: ${username}, User: ${user}`);
    //     if (user != username) {
    //         const userDoc = doc(userCollectionRef, user);
    //         setDoc(userDoc, {
    //             "content": 'placeholder'
    //         });
    //         const offerCandidates = doc(collection(userDoc, 'offerCandidates'));
    //         setDoc(offerCandidates, {
    //             "content": 'placeholder'
    //         });
    //         const answerCandidates = doc(collection(userDoc, 'answerCandidates'));
    //         setDoc(answerCandidates, {
    //             "content": 'placeholder'
    //         });
    //     }
    // }
    try {
        res.status(200).json({
            'status': 'done'
        });
    } catch {}
})

server.post("/disconnectUser", async (req, res) => {
    console.log("Received info from client:", req.body);

    username = req.body['username'];
    roomID = req.body['roomID'];

    const roomDocRef = doc(firestoreDB, "rooms", roomID);
    await updateDoc(roomDocRef, {
        users: arrayRemove(username)
    });
})

server.listen(5000, () => { console.log("Server started on port 5000")});