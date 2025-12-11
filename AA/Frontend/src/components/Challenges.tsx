import { Challenge } from "../types";

interface ChallengesProps {
  challenges: Challenge[];
}

const Challenges = ({ challenges }: ChallengesProps) => {
  return (
    <div className="card">
      <div className="section-title">
        <h3>Thử thách</h3>
        <span className="small">{challenges.length} mục tiêu</span>
      </div>
      {challenges.map((challenge) => (
        <div key={challenge.id} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 700 }}>{challenge.name}</div>
          <div className="small">{challenge.target}</div>
          <div className="progress" style={{ marginTop: 6 }}>
            <div className="progress-inner" style={{ width: `${challenge.progress}%` }} />
          </div>
          <div className="small">Hạn: {challenge.due}</div>
        </div>
      ))}
    </div>
  );
};

export default Challenges;

