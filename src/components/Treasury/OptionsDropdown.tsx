import { useEffect, useRef } from "react";

interface OptionsDropdownProps {
  uniqueLevelAndUseTypes: { level: string; useType: string }[];
  setSelectedLevel: React.Dispatch<React.SetStateAction<string>>;
  setSelectedUseType: React.Dispatch<React.SetStateAction<string>>;
  setShowOptionsDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const OptionsDropdown = ({
  uniqueLevelAndUseTypes,
  setSelectedLevel,
  setSelectedUseType,
  setShowOptionsDropdown,
}: OptionsDropdownProps) => {
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowOptionsDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={dropdownRef}
      className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto"
    >
      {uniqueLevelAndUseTypes.map(({ level, useType }) => (
        <button
          key={`${level}|${useType}`}
          onClick={() => {
            console.log(`Selecting level: ${level}, useType: ${useType}`);
            setSelectedLevel(level);
            setSelectedUseType(useType);
            setShowOptionsDropdown(false); 
          }}
          className="w-full px-4 py-2 text-left hover:bg-blue-50 focus:outline-none focus:bg-blue-50"
        >
          ชั้น {level} - {useType}
        </button>
      ))}
    </div>
  );
};

export default OptionsDropdown;
