function Card({ title, content, onUpvote, onDownvote }) {
  return (
    <div className="card">
      <div className="card-header">
        <h3>{title}</h3>
        <div className="vote-buttons">
          <button onClick={onUpvote} className="vote-btn upvote" title="Thumbs up">
            👍
          </button>
          <button onClick={onDownvote} className="vote-btn downvote" title="Thumbs down">
            👎
          </button>
        </div>
      </div>
      <div className="card-content">{content}</div>
    </div>
  );
}

export default Card;

