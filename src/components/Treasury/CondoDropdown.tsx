import { useEffect, useRef } from "react";

interface CondoDropdownProps {
  filteredCondos: string[];
  searchTerm: string;
  setSelectedCondo: React.Dispatch<React.SetStateAction<string>>;
  setShowCondoDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const CondoDropdown = ({ filteredCondos, setSelectedCondo, setShowCondoDropdown }: CondoDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCondoDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setShowCondoDropdown]);

  return (
    <div ref={dropdownRef} className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
      {filteredCondos.map((condo) => (
        <button
          key={condo}
          onClick={() => {
            setSelectedCondo(condo);
            setShowCondoDropdown(false);
          }}
          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
        >
          {condo}
        </button>
      ))}
    </div>
  );
};

export default CondoDropdown;
