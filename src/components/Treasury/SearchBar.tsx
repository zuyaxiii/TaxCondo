interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: React.Dispatch<React.SetStateAction<string>>;
  setShowCondoDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  setSearchTerm,
  setShowCondoDropdown,
}) => {
  return (
    <div className="mb-6 relative">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        ชื่ออาคารชุด
      </label>
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setShowCondoDropdown(true);
          }}
          onFocus={() => setShowCondoDropdown(true)}
          placeholder="กรอกชื่ออาคารชุดที่ต้องการค้นหา (ภาษาไทย)..."
          className="w-full px-4 py-2.5 text-left bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
      </div>
    </div>
  );
};

export default SearchBar;