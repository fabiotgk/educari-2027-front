import type { Metadata } from 'next';
import { InfraMonitoringDashboard } from '@/features/infra/infra-monitoring-dashboard';

export const metadata: Metadata = { title: 'Infra Monitoring' };

export default function InfraMonitoringPage() {
  return <InfraMonitoringDashboard />;
}
