import { Suspense } from 'react';
import TreasuryContent from '@/components/Treasury/TreasuryContent';
import Loading from '@/components/Treasury/Loading';
import '../styles/globals.css';
import CondoTaxCalculator from '../components/TaxCalculator/CondoTaxCalculator'

export default function Page() {
  return (
    <>
      <CondoTaxCalculator />
      <Suspense fallback={<Loading />}>
        <TreasuryContent />
      </Suspense>
    </>
  );
}