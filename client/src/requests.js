export const post_user_entry = async (username, roomID) => {
    try {
        const response = await fetch('http://localhost:5000/userEntry', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: username,
                roomID: roomID
            }),
        });
        const data = await response.json();
        console.log('Success:', data);
        return data['status'];
    } catch (error) {
        console.error('Error:', error);
        // Optionally, you can return a default status or rethrow the error
        // throw error;
        // or
        // return 'error';
    }
}


export const post_disconnect_user = (username, roomID) => {
    fetch('http://localhost:5000/disconnectUser', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            username: username,
            roomID: roomID
        }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Sucess:', data);
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}