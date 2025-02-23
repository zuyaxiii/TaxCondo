import { useEffect, useState, useMemo } from "react";
import Loading from "@/components/Treasury/Loading";
import SearchBar from "@/components/Treasury/SearchBar";
import CondoDropdown from "@/components/Treasury/CondoDropdown";
import OptionsDropdown from "@/components/Treasury/OptionsDropdown";
import PriceDisplay from "@/components/Treasury/PriceDisplay";

interface CondoRecord {
  CONDO_NAME: string | null;
  OFLEVEL: string;
  USE_CATG: string;
  VAL_AMT_P_MET: number;
}

interface TreasuryData {
  result: {
    records: CondoRecord[];
    totalRecords: number;
  };
}

function TreasuryContent() {
  // State management
  const [data, setData] = useState<CondoRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCondo, setSelectedCondo] = useState<string>("");
  const [showCondoDropdown, setShowCondoDropdown] = useState(false);
  const [showOptionsDropdown, setShowOptionsDropdown] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [selectedUseType, setSelectedUseType] = useState<string>("");
  const [totalRecords, setTotalRecords] = useState(0);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/treasury?page=1&limit=1000`); // Fetch more records initially
        if (!response.ok) throw new Error("Failed to fetch data");
        const result: TreasuryData = await response.json();
        setData(result.result.records);
        setTotalRecords(result.result.totalRecords);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update search function
  useEffect(() => {
    if (searchTerm.length > 0) {
      const fetchSearchResults = async () => {
        try {
          const response = await fetch(
            `/api/treasury?search=${searchTerm}&page=1&limit=1000`
          );
          if (!response.ok) throw new Error("Failed to fetch search results");
          const result: TreasuryData = await response.json();
          setData(result.result.records);
        } catch (err) {
          console.error("Search error:", err);
        }
      };

      fetchSearchResults();
    }
  }, [searchTerm]);

  // Memoized values
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

  if (loading) return <Loading />;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 flex justify-center items-center">
      <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-gray-800">ราคาประเมินห้องชุด</h1>

        {/* Search Bar Component */}
        <div className="relative">
          <SearchBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            setShowCondoDropdown={setShowCondoDropdown}
          />

          {/* Condo Dropdown Component */}
          {showCondoDropdown && filteredCondos.length > 0 && (
            <div className="absolute left-0 mt-2 w-full z-10 bg-white shadow-lg rounded-lg border border-gray-200">
              <CondoDropdown
                filteredCondos={filteredCondos}
                searchTerm={searchTerm}
                setSelectedCondo={(condo) => {
                  setSelectedCondo(condo);
                  setSelectedLevel("");
                  setSelectedUseType("");
                  setShowOptionsDropdown(false);
                }}
                setShowCondoDropdown={setShowCondoDropdown}
              />
            </div>
          )}
        </div>
        
        {/* Selected Condo and Options */}
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

        {/* Price Display Component */}
        <PriceDisplay selectedPrice={selectedPrice} />
      </div>
    </div>
  );
}

export default TreasuryContent;
