import React from 'react';
import dynamic from 'next/dynamic';

const Report = dynamic(import('@/components/Report'));

function DefaultPage() {
  return (
    <>
      <Report />
    </>
  );
}
export default DefaultPage;
