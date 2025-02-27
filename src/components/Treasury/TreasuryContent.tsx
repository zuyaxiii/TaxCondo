import { useState, useEffect, useMemo } from "react";
import { Condo } from "@/app/api/types";
import { condoApi } from "@/app/api/treasury/route";
import PriceDisplay from "./PriceDisplay";
import OptionsDropdown from "./OptionsDropdown";
import SearchBar from "./SearchBar";
import { useDebounce } from "@/app/utils/useDebounce";

function TreasuryContent() {
  const [data, setData] = useState<Condo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("");
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedUseType, setSelectedUseType] = useState<string>("");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  useEffect(() => {
    const fetchCondos = async () => {
      try {
        setLoading(true);
        const condoData = await condoApi.getAllCondos();
        setData(condoData);
        setError(null);
      } catch (err) {
        console.error('Error fetching condos:', err);
        setError('Failed to load condos. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCondos();
  }, []);
  
  useEffect(() => {
    if (debouncedSearchTerm.length > 0) {
      const fetchSearchResults = async () => {
        try {
          setLoading(true);
          const searchResults = await condoApi.searchCondosByName(debouncedSearchTerm);
          setData(searchResults);
          setError(null);
        } catch (err) {
          console.error("Search error:", err);
          setError('Failed to search condos');
        } finally {
          setLoading(false);
        }
      };

      fetchSearchResults();
    }
  }, [debouncedSearchTerm]);
  
  const uniqueCondos = useMemo(() => {
    return Array.from(
      new Set(
        data
          .map((record) => record.CONDO_NAME)
          .filter((name): name is string => name != null)
      )
    ).sort();
  }, [data]);
  
  const filteredCondos = useMemo(() => {
    if (!searchTerm) return uniqueCondos;
    return uniqueCondos.filter((condo) =>
      condo.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, uniqueCondos]);
  
  const filteredOptions = useMemo(() => {
    if (!selectedCondo) return [];
    return data.filter((record) => record.CONDO_NAME === selectedCondo);
  }, [data, selectedCondo]);
  
  const uniqueLevelAndUseTypes = useMemo(() => {
    return Array.from(
      new Set(
        filteredOptions.map((record) => `${record.OFLEVEL}|${record.USE_CATG}`)
      )
    )
      .map((combined) => {
        const [level, useType] = combined.split("|");
        return { level, useType };
      })
      .sort((a, b) => a.level.localeCompare(b.level));
  }, [filteredOptions]);
  
  const selectedPrice = useMemo(() => {
    return data.find(
      (record) =>
        record.CONDO_NAME === selectedCondo &&
        record.OFLEVEL === selectedLevel &&
        record.USE_CATG === selectedUseType
    )?.VAL_AMT_P_MET;
  }, [data, selectedCondo, selectedLevel, selectedUseType]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">ราคาประเมินห้องชุด</h1>

        <div className="relative">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowCondoDropdown={setShowCondoDropdown}
          />

          {loading && (
            <div className="absolute right-3 top-9">
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          )}
        </div>

        {showCondoDropdown && filteredCondos.length > 0 && (
          <div className="relative z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
            {filteredCondos.map((condo) => (
              <div
                key={condo}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                onClick={() => {
                  setSelectedCondo(condo);
                  setSearchTerm(condo);
                  setShowCondoDropdown(false);
                }}
              >
                {condo}
              </div>
            ))}
          </div>
        )}

        {selectedCondo && (
          <div className="relative space-y-2">
            <h2 className="text-lg font-semibold">
              ชื่ออาคารชุดที่เลือก: {selectedCondo}
            </h2>

            <button
              onClick={() => setShowOptionsDropdown(true)}
              className="text-blue-700 border border-blue-700 rounded-lg px-5 py-2.5 hover:bg-blue-800 hover:text-white"
            >
              เลือกชั้น
            </button>

            {showOptionsDropdown && (
              <div className="absolute left-0 mt-2 w-full z-10 bg-white shadow-lg rounded-lg border border-gray-200">
                <OptionsDropdown
                  uniqueLevelAndUseTypes={uniqueLevelAndUseTypes}
                  setSelectedLevel={setSelectedLevel}
                  setSelectedUseType={setSelectedUseType}
                  setShowOptionsDropdown={setShowOptionsDropdown}
                />
              </div>
            )}
          </div>
        )}

        <PriceDisplay selectedPrice={selectedPrice} />
      </div>
    </div>
  );
}

export default TreasuryContent;
