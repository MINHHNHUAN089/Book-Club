import Authors from "../components/Authors";
import { AuthorFollow } from "../types";

interface AuthorsPageProps {
  authors: AuthorFollow[];
}

const AuthorsPage = ({ authors }: AuthorsPageProps) => {
  return (
    <>
      <div className="section-title">
        <h3>Theo dõi tác giả</h3>
        <span className="small">Thông báo sách mới & thể loại</span>
      </div>
      <Authors authors={authors} />
    </>
  );
};

export default AuthorsPage;


