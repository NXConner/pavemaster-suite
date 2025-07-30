import React from 'react';
import { Estimates } from '@/components/Estimates';
import { Layout } from '@/components/layouts/Layout';

const EstimatesPage: React.FC = () => {
  return (
    <Layout>
      <Estimates />
    </Layout>
  );
};

export default EstimatesPage;