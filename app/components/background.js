export default function Background() {
    return (
      <div className="background">
        {Array.from({ length: 20 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>
    );
  }