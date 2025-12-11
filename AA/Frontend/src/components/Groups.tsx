import { ClubGroup } from "../types";

interface GroupsProps {
  groups: ClubGroup[];
}

const Groups = ({ groups }: GroupsProps) => {
  return (
    <div className="card">
      <div className="section-title">
        <h3>Book club</h3>
        <span className="small">{groups.length} nhóm</span>
      </div>
      {groups.map((group) => (
        <div key={group.id} style={{ padding: "10px 0", borderBottom: "1px solid #e2e8f0" }}>
          <div style={{ fontWeight: 700 }}>{group.name}</div>
          <div className="small">{group.topic}</div>
          <div className="small">Thành viên: {group.members}</div>
          {group.nextMeeting && <div className="tag">⏰ {group.nextMeeting}</div>}
        </div>
      ))}
    </div>
  );
};

export default Groups;

