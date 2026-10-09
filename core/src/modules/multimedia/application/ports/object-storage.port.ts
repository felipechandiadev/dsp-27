export const OBJECT_STORAGE = Symbol('OBJECT_STORAGE');

export interface ObjectStoragePort {
  put(key: string, data: Buffer, mimeType: string): Promise<void>;
  get(key: string): Promise<Buffer>;
  delete(key: string): Promise<void>;
}
