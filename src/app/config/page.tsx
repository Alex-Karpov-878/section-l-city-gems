import 'server-only';
import { serverApi } from '@/lib/api/server';
import ConfigClientPage from './ConfigClientPage';

export default async function ConfigPage() {
  const properties = await serverApi.getProperties();

  return <ConfigClientPage properties={properties} />;
}
