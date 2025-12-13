import { NavLink } from "react-router-dom";

const Navigation = () => {
  const handleClick = (path: string) => {
    console.log("Navigation clicked:", path);
  };

  return (
    <nav className="page-nav">
      <NavLink 
        to="/books" 
        className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}
        onClick={() => handleClick("/books")}
      >
        Danh sách
      </NavLink>
      <NavLink
        to="/recommendations"
        className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}
        onClick={() => handleClick("/recommendations")}
      >
        Gợi ý
      </NavLink>
      <NavLink 
        to="/groups" 
        className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}
        onClick={() => handleClick("/groups")}
      >
        Book club
      </NavLink>
      <NavLink 
        to="/challenges" 
        className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}
        onClick={() => handleClick("/challenges")}
      >
        Thử thách
      </NavLink>
      <NavLink 
        to="/authors" 
        className={({ isActive }) => (isActive ? "page-nav-link active" : "page-nav-link")}
        onClick={() => handleClick("/authors")}
      >
        Tác giả
      </NavLink>
    </nav>
  );
};

export default Navigation;

