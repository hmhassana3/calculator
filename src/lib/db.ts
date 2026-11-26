// IndexedDB wrapper for persistent calculation History and Trash (Recycle Bin).

export interface HistoryEntry {
  id?: number;
  expression: string;
  answer: string;
  category: string;
  timestamp: number; // ms epoch
}

export interface TrashEntry extends HistoryEntry {
  deletedAt: number; // ms epoch
}

const DB_NAME = 'calc_app_db';
const DB_VERSION = 1;
const HISTORY_STORE = 'history';
const TRASH_STORE = 'trash';
const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

let dbPromise: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(HISTORY_STORE)) {
        const store = db.createObjectStore(HISTORY_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('timestamp', 'timestamp');
        store.createIndex('category', 'category');
      }
      if (!db.objectStoreNames.contains(TRASH_STORE)) {
        const store = db.createObjectStore(TRASH_STORE, { keyPath: 'id', autoIncrement: true });
        store.createIndex('deletedAt', 'deletedAt');
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

function tx(storeName: string, mode: IDBTransactionMode) {
  return openDB().then((db) => db.transaction(storeName, mode).objectStore(storeName));
}

export async function addHistoryEntry(entry: Omit<HistoryEntry, 'id'>): Promise<HistoryEntry> {
  const store = await tx(HISTORY_STORE, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.add(entry);
    req.onsuccess = () => resolve({ ...entry, id: req.result as number });
    req.onerror = () => reject(req.error);
  });
}

export async function getAllHistory(): Promise<HistoryEntry[]> {
  const store = await tx(HISTORY_STORE, 'readonly');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as HistoryEntry[]).sort((a, b) => b.timestamp - a.timestamp));
    req.onerror = () => reject(req.error);
  });
}

export async function getAllTrash(): Promise<TrashEntry[]> {
  const store = await tx(TRASH_STORE, 'readonly');
  return new Promise((resolve, reject) => {
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result as TrashEntry[]).sort((a, b) => b.deletedAt - a.deletedAt));
    req.onerror = () => reject(req.error);
  });
}

export async function moveToTrash(ids: number[]): Promise<void> {
  const histStore = await tx(HISTORY_STORE, 'readwrite');
  const entries: HistoryEntry[] = await new Promise((resolve, reject) => {
    const items: HistoryEntry[] = [];
    let remaining = ids.length;
    if (remaining === 0) { resolve([]); return; }
    ids.forEach((id) => {
      const req = histStore.get(id);
      req.onsuccess = () => {
        if (req.result) items.push(req.result);
        remaining--;
        if (remaining === 0) resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  });
  const trashStore = await tx(TRASH_STORE, 'readwrite');
  for (const e of entries) {
    const { id, ...rest } = e;
    trashStore.add({ ...rest, deletedAt: Date.now() });
  }
  const delStore = await tx(HISTORY_STORE, 'readwrite');
  for (const id of ids) delStore.delete(id);
}

export async function restoreFromTrash(ids: number[]): Promise<void> {
  const trashStore = await tx(TRASH_STORE, 'readwrite');
  const entries: TrashEntry[] = await new Promise((resolve, reject) => {
    const items: TrashEntry[] = [];
    let remaining = ids.length;
    if (remaining === 0) { resolve([]); return; }
    ids.forEach((id) => {
      const req = trashStore.get(id);
      req.onsuccess = () => {
        if (req.result) items.push(req.result);
        remaining--;
        if (remaining === 0) resolve(items);
      };
      req.onerror = () => reject(req.error);
    });
  });
  const histStore = await tx(HISTORY_STORE, 'readwrite');
  for (const e of entries) {
    const { id, deletedAt, ...rest } = e;
    histStore.add(rest);
  }
  const delStore = await tx(TRASH_STORE, 'readwrite');
  for (const id of ids) delStore.delete(id);
}

export async function permanentlyDelete(ids: number[]): Promise<void> {
  const store = await tx(TRASH_STORE, 'readwrite');
  for (const id of ids) store.delete(id);
}

export async function emptyTrash(): Promise<void> {
  const store = await tx(TRASH_STORE, 'readwrite');
  return new Promise((resolve, reject) => {
    const req = store.clear();
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

export async function clearAllHistoryToTrash(): Promise<void> {
  const all = await getAllHistory();
  await moveToTrash(all.map((e) => e.id!));
}

export async function purgeExpiredTrash(): Promise<number> {
  const all = await getAllTrash();
  const now = Date.now();
  const expired = all.filter((e) => now - e.deletedAt >= THIRTY_DAYS_MS);
  if (expired.length) await permanentlyDelete(expired.map((e) => e.id!));
  return expired.length;
}

export function retentionDaysLeft(deletedAt: number): number {
  const elapsed = Date.now() - deletedAt;
  const remaining = THIRTY_DAYS_MS - elapsed;
  return Math.max(0, Math.ceil(remaining / (24 * 60 * 60 * 1000)));
}

export const THIRTY_DAYS = THIRTY_DAYS_MS;
