interface CondoDropdownProps {
  filteredCondos: string[];
  searchTerm: string;
  setSelectedCondo: (condo: string) => void;
  setShowCondoDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const CondoDropdown: React.FC<CondoDropdownProps> = ({
  filteredCondos,
  searchTerm,
  setSelectedCondo,
  setShowCondoDropdown,
}) => {
  return (
    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {filteredCondos.map((condo) => (
        <button
          key={condo}
          className="w-full text-left px-4 py-2.5 hover:bg-gray-100"
          onClick={() => {
            setSelectedCondo(condo);
            setShowCondoDropdown(false);
          }}
        >
          {condo}
        </button>
      ))}
    </div>
  );
};

export default CondoDropdown;