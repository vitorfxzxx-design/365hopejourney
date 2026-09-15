// IndexedDB Helper for large Audio blobs and media persistence

const DB_NAME = 'health365_media_db';
const STORE_NAME = 'audio_files';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB not supported'));
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveAudioToStorage(id, dataUrlOrBlob) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(dataUrlOrBlob, id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not save audio to IndexedDB:', err);
    return false;
  }
}

export async function getAudioFromStorage(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not get audio from IndexedDB:', err);
    return null;
  }
}

export async function deleteAudioFromStorage(id) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(id);
      req.onsuccess = () => resolve(true);
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Could not delete audio from IndexedDB:', err);
    return false;
  }
}

// Extract duration string "MM:SS" from File or DataURL
export function getAudioFileDuration(fileOrUrl) {
  return new Promise((resolve) => {
    let src = '';
    let isObjectUrl = false;
    if (typeof fileOrUrl === 'string') {
      src = fileOrUrl;
    } else if (fileOrUrl instanceof Blob) {
      src = URL.createObjectURL(fileOrUrl);
      isObjectUrl = true;
    } else {
      return resolve('05:00');
    }

    const audio = new Audio();
    audio.preload = 'metadata';
    audio.onloadedmetadata = () => {
      if (isObjectUrl) URL.revokeObjectURL(src);
      const totalSecs = audio.duration;
      if (isNaN(totalSecs) || totalSecs <= 0) {
        return resolve('05:00');
      }
      const mins = Math.floor(totalSecs / 60);
      const secs = Math.floor(totalSecs % 60);
      resolve(`${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`);
    };
    audio.onerror = () => {
      if (isObjectUrl) URL.revokeObjectURL(src);
      resolve('05:00');
    };
    audio.src = src;
  });
}
