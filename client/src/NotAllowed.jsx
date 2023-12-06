function NotAllowed({ setState }) {

    const returnButton = () => {
        setState('UserEntry');
    }

    return (
        <div>
            <p>There is a user with that username already in this room!</p>
            <button onClick={returnButton}>Return</button>
        </div>
    )
}

export default NotAllowed