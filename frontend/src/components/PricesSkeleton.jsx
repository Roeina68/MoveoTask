function PricesSkeleton() {
  return (
    <div className="prices-skeleton">
      {[1, 2, 3].map((i) => (
        <div key={i} className="skeleton pulse" style={{ height: '40px', width: '90%' }} />
      ))}
    </div>
  );
}

export default PricesSkeleton;

