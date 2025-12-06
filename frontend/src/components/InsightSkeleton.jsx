function InsightSkeleton() {
  return (
    <div className="insight-skeleton">
      <div className="skeleton pulse" style={{ height: '20px', width: '100%' }} />
      <div className="skeleton pulse" style={{ height: '20px', width: '95%' }} />
      <div className="skeleton pulse" style={{ height: '20px', width: '100%' }} />
      <div className="skeleton pulse" style={{ height: '20px', width: '90%' }} />
      <div className="skeleton pulse" style={{ height: '20px', width: '85%' }} />
      <div className="skeleton pulse" style={{ height: '16px', width: '50%', marginTop: '8px' }} />
    </div>
  );
}

export default InsightSkeleton;

