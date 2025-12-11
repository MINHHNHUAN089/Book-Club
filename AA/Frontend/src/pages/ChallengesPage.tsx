import Challenges from "../components/Challenges";
import { Challenge } from "../types";

interface ChallengesPageProps {
  challenges: Challenge[];
}

const ChallengesPage = ({ challenges }: ChallengesPageProps) => {
  return (
    <>
      <div className="section-title">
        <h3>Thử thách đọc</h3>
        <span className="small">Tiến độ và hạn hoàn thành</span>
      </div>
      <Challenges challenges={challenges} />
    </>
  );
};

export default ChallengesPage;


