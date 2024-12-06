import React from "react";
import { FaMagnifyingGlass } from "react-icons/fa6";
import { IoMdClose } from "react-icons/io";

const SearchBar = ({ value, onChange, handleSearch, onClearSearch }) => {
  return (
    <div className="w-80 flex items-center px-4 bg-slate-100 rounded-md relative">
      <input 
        type="text" 
        placeholder="Search Notes"
        className="w-full text-xs bg-transparent py-2 pl-3 pr-8 outline-none rounded-md"
        value={value}
        onChange={onChange}
      />
      
      {/* Search Icon */}
      <FaMagnifyingGlass
        className="absolute right-10 text-slate-400 cursor-pointer hover:text-black"
        onClick={handleSearch}
      />

      {/* Clear Icon */}
      {value && (
        <IoMdClose
          className="absolute right-2 text-xl text-slate-500 cursor-pointer hover:text-black"
          onClick={onClearSearch}
        />
      )}
    </div>
  );
};

export default SearchBar;
