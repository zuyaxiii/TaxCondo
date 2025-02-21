import { Suspense } from 'react';
import TreasuryContent from '@/components/Treasury/TreasuryContent';
import Loading from '@/components/Treasury/Loading';
import '../styles/globals.css';

export default function Page() {
  return (
    <Suspense fallback={<Loading />}>
      <TreasuryContent />
    </Suspense>
  );
}