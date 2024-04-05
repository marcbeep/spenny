function StatsCard({ title, value, description }) {
    return (
        <div className="stat">
            <div className="stat-title">{title}</div>
            <div className="stat-value">{value}</div>
            <div className="stat-desc">{description}</div>
        </div>
    );
}

export default StatsCard;
