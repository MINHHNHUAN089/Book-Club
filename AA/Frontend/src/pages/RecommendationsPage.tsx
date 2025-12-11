import Recommendations from "../components/Recommendations";
import { Book } from "../types";

interface RecommendationsPageProps {
  books: Book[];
}

const RecommendationsPage = ({ books }: RecommendationsPageProps) => {
  return (
    <>
      <div className="section-title">
        <h3>Gợi ý đọc tiếp</h3>
        <span className="small">Dựa trên tiến độ và đánh giá</span>
      </div>
      <Recommendations books={books} />
    </>
  );
};

export default RecommendationsPage;


