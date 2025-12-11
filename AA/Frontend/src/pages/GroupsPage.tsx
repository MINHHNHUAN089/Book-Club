import Groups from "../components/Groups";
import { ClubGroup } from "../types";

interface GroupsPageProps {
  groups: ClubGroup[];
}

const GroupsPage = ({ groups }: GroupsPageProps) => {
  return (
    <>
      <div className="section-title">
        <h3>Book club & thảo luận</h3>
        <span className="small">Lịch họp, chủ đề, thành viên</span>
      </div>
      <Groups groups={groups} />
    </>
  );
};

export default GroupsPage;


