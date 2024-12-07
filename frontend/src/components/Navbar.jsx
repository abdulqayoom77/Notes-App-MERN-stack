import React, { useState } from "react";
import ProfileInfo from "./ProfileInfo";
import { useNavigate, useLocation } from "react-router-dom";
import SearchBar from "./SearchBar";

const Navbar = ({ userInfo, onSearchNote, handleClearSearch }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const onLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const handleSearch = () => {
    if (searchQuery) {
      onSearchNote(searchQuery);
    }
  };

  const onClearSearch = () => {
    setSearchQuery("");
    handleClearSearch();
  };

  const shouldShowProfileInfo =
    !["/login", "/signup"].includes(location.pathname);

  return (
    <div className="bg-white flex items-center justify-between px-6 py-2 drop-shadow">
      <h2 className="text-xl font-medium text-black py-2">Notes</h2>
      <SearchBar
        value={searchQuery}
        onChange={({ target }) => setSearchQuery(target.value)}
        handleSearch={handleSearch}
        onClearSearch={onClearSearch}
      />
      {shouldShowProfileInfo ? (
        <ProfileInfo userInfo={userInfo} logout={onLogout} />
      ) : null}
    </div>
  );
};

export default Navbar;
