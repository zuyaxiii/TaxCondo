import { DetailedPeriod } from "../api/types";

export const calculateHoldingPeriod = (purchaseDate: string, saleDate: string): number => {
    const purchase = new Date(purchaseDate);
    const sale = new Date(saleDate);

    sale.setDate(sale.getDate() + 1);

    let years = sale.getFullYear() - purchase.getFullYear();
    if (
        sale.getMonth() > purchase.getMonth() ||
        (sale.getMonth() === purchase.getMonth() &&
            sale.getDate() > purchase.getDate())
    ) {
        years += 1;
    }

    return years;
};

export const validateDates = (
    name: string,
    value: string,
    purchaseDate: string,
    saleDate: string
): boolean => {
    const date = new Date(value);
    const today = new Date();
    const purchase = new Date(purchaseDate);
    const sale = new Date(saleDate);

    if (name === "purchaseDate") {
        if (date > today || (saleDate && date > sale)) {
            return false;
        }
    } else if (name === "saleDate") {
        if (purchaseDate && date < purchase) {
            return false;
        }
    } else if (name === "registrationDate") {
        if (date > today || (saleDate && date > sale)) {
            return false;
        }
    }
    return true;
};

export const calculateDetailedHoldingPeriod = (
    purchaseDate: string,
    saleDate: string
  ): DetailedPeriod => {
    const purchase = new Date(purchaseDate);
    const sale = new Date(saleDate);
    
    let years = 0;
    let months = 0;
    let days = 0;
    
    years = sale.getFullYear() - purchase.getFullYear();
    
    if (sale.getMonth() >= purchase.getMonth()) {
      months = sale.getMonth() - purchase.getMonth();
    } else {
      years--;
      months = 12 + (sale.getMonth() - purchase.getMonth());
    }
    
    if (sale.getDate() >= purchase.getDate()) {
      days = sale.getDate() - purchase.getDate();
    } else {
      const lastMonthDate = new Date(
        sale.getFullYear(),
        sale.getMonth(),
        0
      ).getDate();
      
      if (months === 0) {
        years--;
        months = 11;
      } else {
        months--;
      }
      
      days = lastMonthDate - purchase.getDate() + sale.getDate();
    }
    
    return { years, months, days };
  };
  
  export const formatDetailedPeriod = (period: DetailedPeriod): string => {
    const parts: string[] = [];
    
    if (period.years > 0) {
      parts.push(`${period.years} ปี`);
    }
    
    if (period.months > 0) {
      parts.push(`${period.months} เดือน`);
    }
    
    if (period.days > 0) {
      parts.push(`${period.days} วัน`);
    }
    
    if (parts.length === 0) {
      return "0 วัน";
    }
    
    return parts.join(" ");
  };