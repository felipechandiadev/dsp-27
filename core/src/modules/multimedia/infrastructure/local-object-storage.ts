import { Injectable } from '@nestjs/common';
import * as fs from 'fs/promises';
import * as path from 'path';
import { AppConfigService } from '@config/config.service';
import { ObjectStoragePort } from '../application/ports/object-storage.port';

@Injectable()
export class LocalObjectStorage implements ObjectStoragePort {
  constructor(private readonly config: AppConfigService) {}

  private root(): string {
    return path.resolve(this.config.storageLocalDir);
  }

  private fullPath(key: string): string {
    const resolved = path.resolve(this.root(), key);
    if (!resolved.startsWith(this.root())) {
      throw new Error('Invalid storage key');
    }
    return resolved;
  }

  async put(key: string, data: Buffer, _mimeType: string): Promise<void> {
    const dest = this.fullPath(key);
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await fs.writeFile(dest, data);
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(this.fullPath(key));
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.fullPath(key));
    } catch {
      /* ignore missing */
    }
  }
}
