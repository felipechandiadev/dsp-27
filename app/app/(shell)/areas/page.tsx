import { getServerSession } from 'next-auth';
import {
  NextNavProvider,
  TabPageLayout,
  Tabs,
} from '@felipechandiadev/ui';
import { authOptions } from '@/lib/auth/auth-options';
import { coreFetch } from '@/lib/api/core-fetch';
import { AreasWorkspace } from '@/features/territory/ui/AreasWorkspace';
import { AreaTypesAdmin } from '@/features/territory/ui/AreaTypesAdmin';
import type {
  AreaTypeRow,
  OperationAreaRow,
} from '@/features/territory/ui/territory-types';

const TAB_ITEMS = [
  { url: '/areas?tab=areas', label: 'Áreas' },
  { url: '/areas?tab=types', label: 'Tipos' },
];

export default async function AreasPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = params.tab === 'types' ? 'types' : 'areas';
  const session = await getServerSession(authOptions);
  const token = session?.user?.accessToken;

  const [typesRes, areasRes] = await Promise.all([
    coreFetch<AreaTypeRow[]>('/api/territory/area-types', token),
    coreFetch<OperationAreaRow[]>('/api/territory/areas', token),
  ]);

  const types = typesRes.ok && Array.isArray(typesRes.data) ? typesRes.data : [];
  const areas = areasRes.ok && Array.isArray(areasRes.data) ? areasRes.data : [];

  const activeTab =
    tab === 'types' ? '/areas?tab=types' : '/areas?tab=areas';
  const search = tab === 'types' ? 'tab=types' : 'tab=areas';

  return (
    <NextNavProvider search={search}>
      <TabPageLayout
        title="Áreas de operación"
        subtitle="Divisiones geográficas de intervención DSP (polígonos en mapa)"
        tabs={<Tabs items={TAB_ITEMS} activeTab={activeTab} />}
      >
        {tab === 'types' ? (
          <AreaTypesAdmin initialTypes={types} />
        ) : (
          <AreasWorkspace initialAreas={areas} initialTypes={types} />
        )}
      </TabPageLayout>
    </NextNavProvider>
  );
}
