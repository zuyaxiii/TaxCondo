interface PriceDisplayProps {
  selectedPrice: number | undefined;
}

const PriceDisplay: React.FC<PriceDisplayProps> = ({ selectedPrice }) => {
  if (!selectedPrice) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      <p className="text-sm text-gray-600 mb-1">ราคาประเมินต่อตารางเมตร</p>
      <p className="text-3xl font-bold text-blue-600">
        {selectedPrice.toLocaleString()} บาท
      </p>
    </div>
  );
};

export default PriceDisplay;
