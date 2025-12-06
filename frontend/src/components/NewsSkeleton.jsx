function NewsSkeleton() {
  return (
    <div className="news-skeleton">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="news-skeleton-row">
          <div className="skeleton pulse" style={{ height: '22px', width: '100%', marginBottom: '8px' }} />
          <div className="skeleton pulse" style={{ height: '18px', width: '60%', marginBottom: '10px' }} />
          <div className="skeleton pulse" style={{ height: '16px', width: '40%' }} />
        </div>
      ))}
    </div>
  );
}

export default NewsSkeleton;

