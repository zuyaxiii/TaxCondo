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
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 500);

    return () => clearTimeout(timer);
  }, [search]);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `/api/treasury?page=${page}&search=${debouncedSearch}`
        );
        const json = await response.json();
        if (json.success) {
          setData(json.result.records);
          setTotalPages(json.result.totalPages);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
      setLoading(false);
    };

    fetchData();
  }, [page, debouncedSearch]);

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      {/* Search Input */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="ค้นหาข้อมูล..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8 text-gray-600">กำลังโหลดข้อมูล...</div>
      )}

      {/* Data Display */}
      {!loading && data.length > 0 && (
        <div className="space-y-4">
          {data.map((item: any, index: number) => (
            <div key={index} className="bg-white rounded-lg shadow-md">
              <div className="p-4">
                {/* Customize this based on your data structure */}
                <pre className="whitespace-pre-wrap text-sm">
                  {JSON.stringify(item, null, 2)}
                </pre>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && data.length === 0 && (
        <div className="text-center py-8 text-gray-600">
          ไม่พบข้อมูลที่ค้นหา
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-4 mt-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg ${
              page === 1
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            ก่อนหน้า
          </button>

          <span className="text-gray-600">
            หน้า {page} จาก {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className={`px-4 py-2 rounded-lg ${
              page === totalPages
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            ถัดไป
          </button>
        </div>
      )}
    </div>
  );
}

export default TreasuryContent;
