import styles from './style/LobbyConnected.module.css';

function UserBubble({ user }) {

    let bubbleClass;

    bubbleClass = styles.user;

    return (
      <div className={styles.userWrapper}>
          <span className={bubbleClass}>{user}</span>
      </div>
    )
  }

export default UserBubble