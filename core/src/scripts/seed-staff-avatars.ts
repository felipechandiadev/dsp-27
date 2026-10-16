import { randomUUID } from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IsNull } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { MultimediaAsset } from '../modules/multimedia/domain/multimedia-asset.entity';
import type { StaffMember } from '../modules/staff/domain/staff-member.entity';

const SEED_MULTIMEDIA_DIR = path.join(
  __dirname,
  'seed-assets',
  'multimedia',
);

const IMAGE_EXT = /\.(jpe?g|png|webp|gif)$/i;

function mimeFor(fileName: string): string {
  const lower = fileName.toLowerCase();
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  if (lower.endsWith('.gif')) return 'image/gif';
  return 'image/jpeg';
}

function storageRoot(): string {
  return path.resolve(
    process.cwd(),
    process.env.STORAGE_LOCAL_DIR || './storage/uploads',
  );
}

export async function listSeedPortraitFiles(): Promise<string[]> {
  try {
    const entries = await fs.readdir(SEED_MULTIMEDIA_DIR);
    return entries
      .filter((name) => IMAGE_EXT.test(name) && !name.startsWith('.'))
      .sort()
      .map((name) => path.join(SEED_MULTIMEDIA_DIR, name));
  } catch {
    return [];
  }
}

/**
 * Asigna retratos del catálogo seed a fichas staff (cíclico; puede repetir).
 * Reemplaza imágenes previas del staff (soft-delete) para que el seed sea idempotente.
 */
export async function seedStaffAvatars(staffRows: StaffMember[]): Promise<number> {
  const portraits = await listSeedPortraitFiles();
  if (portraits.length === 0) {
    console.warn(
      `[seed] no hay imágenes en ${SEED_MULTIMEDIA_DIR}; omitiendo avatares`,
    );
    return 0;
  }

  const assetRepo = AppDataSource.getRepository(MultimediaAsset);
  const root = storageRoot();
  const year = new Date().getFullYear();
  let attached = 0;

  for (let i = 0; i < staffRows.length; i++) {
    const staff = staffRows[i];
    const sourcePath = portraits[i % portraits.length];
    const originalName = path.basename(sourcePath);
    const buffer = await fs.readFile(sourcePath);

    const existing = await assetRepo.find({
      where: {
        entityType: 'staff',
        entityId: staff.id,
        kind: 'image',
        deletedAt: IsNull(),
      },
    });
    for (const row of existing) {
      row.deletedAt = new Date();
      await assetRepo.save(row);
    }

    const safeName = originalName
      .replace(/[^a-zA-Z0-9._-]+/g, '_')
      .slice(0, 120);
    const storageKey = `dsp/${year}/staff/${staff.id}/${randomUUID()}-${safeName}`;
    const dest = path.join(root, storageKey);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, buffer);

    await assetRepo.save(
      assetRepo.create({
        entityType: 'staff',
        entityId: staff.id,
        kind: 'image',
        mimeType: mimeFor(originalName),
        originalName,
        storageKey,
        storageDriver: process.env.STORAGE_DRIVER || 'local',
        byteSize: buffer.length,
        checksum: null,
        classification: 'interno',
        sortOrder: 0,
        uploadedByUserId: null,
      }),
    );
    attached += 1;
  }

  return attached;
}
