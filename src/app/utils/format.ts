
export const formatNumberWithCommas = (
  value: string | number,
  decimalPlaces: number = 2
): string => {
  if (value === null || value === undefined || value === "") return "";
  
  const numStr = String(value).replace(/,/g, "");
  
  if (numStr === "" || isNaN(Number(numStr))) return String(value);
  
  const hasDot = numStr.includes('.');
  
  const num = parseFloat(numStr);
  
  if (hasDot && numStr.split('.')[1].length < decimalPlaces) {
    const parts = numStr.split('.');
    const integerPart = parts[0];
    let decimalPart = parts[1] || '';
    
    while (decimalPart.length < decimalPlaces) {
      decimalPart += '0';
    }
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  } else {

    const fixedNum = num.toFixed(decimalPlaces);
    const parts = fixedNum.split(".");
    const integerPart = parts[0];
    const decimalPart = parts[1];
    
    const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return `${formattedInteger}.${decimalPart}`;
  }
};

export const unformatNumber = (value: string): string => {
  if (!value) return "";
  return value.replace(/,/g, "");
};