import { NavLink } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="page-nav">
      <NavLink to="/books" className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}>
        Danh sách
      </NavLink>
      <NavLink
        to="/recommendations"
        className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}
      >
        Gợi ý
      </NavLink>
      <NavLink to="/groups" className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}>
        Book club
      </NavLink>
      <NavLink to="/challenges" className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}>
        Thử thách
      </NavLink>
      <NavLink to="/authors" className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}>
        Tác giả
      </NavLink>
    </nav>
  );
};

export default Navigation;

