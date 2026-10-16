import { RegionEnum } from './regions.enum';
import { REGION_COMMUNES } from './regions.data';

export { RegionEnum } from './regions.enum';
export { REGION_COMMUNES } from './regions.data';

export type ChileGeoOption = {
  id: string;
  label: string;
};

export function listRegionesChile(): ChileGeoOption[] {
  return Object.values(RegionEnum).map((value) => ({
    id: value,
    label: value,
  }));
}

export function listComunasByRegion(region: string | null | undefined): ChileGeoOption[] {
  if (!region) return [];
  const comunas = REGION_COMMUNES[region as RegionEnum];
  if (!comunas) return [];
  return comunas.map((comuna) => ({
    id: comuna,
    label: comuna,
  }));
}

export function isChileRegion(value: string | null | undefined): value is RegionEnum {
  if (!value) return false;
  return (Object.values(RegionEnum) as string[]).includes(value);
}
