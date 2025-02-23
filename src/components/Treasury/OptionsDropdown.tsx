interface OptionsDropdownProps {
  uniqueLevelAndUseTypes: { level: string; useType: string }[];
  setSelectedLevel: (level: string) => void;
  setSelectedUseType: (useType: string) => void;
  setShowOptionsDropdown: React.Dispatch<React.SetStateAction<boolean>>;
}

const OptionsDropdown: React.FC<OptionsDropdownProps> = ({
  uniqueLevelAndUseTypes,
  setSelectedLevel,
  setSelectedUseType,
  setShowOptionsDropdown,
}) => {
  return (
    <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
      {uniqueLevelAndUseTypes.map(({ level, useType }) => (
        <button
          key={`${level}-${useType}`}
          className="w-full text-left px-4 py-2.5 hover:bg-gray-100"
          onClick={() => {
            setSelectedLevel(level);
            setSelectedUseType(useType);
            setShowOptionsDropdown(false);
          }}
        >
          ชั้น {level} - {useType}
        </button>
      ))}
    </div>
  );
};

export default OptionsDropdown;