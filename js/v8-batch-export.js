/* 
  Mockup Studio Pro - V2.0 Phase 8: Batch Processing & Export History
  - Multi-file Upload Queue
  - IndexedDB Persistence for Export History
*/

const dbName = "MockupStudioDB";
const storeName = "exports";

// Initialize IndexedDB
const initDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(storeName)) {
        db.createObjectStore(storeName, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

// Batch Processing Logic
window.processBatch = async (files) => {
  showToast(`🚀 Starting batch processing of ${files.length} images...`);
  for (const file of files) {
    if (!file.type.startsWith('image/')) continue;
    
    // 1. Load into Desktop Slot (Primary)
    const reader = new FileReader();
    const loaded = new Promise(resolve => reader.onload = resolve);
    reader.readAsDataURL(file);
    const event = await loaded;
    
    state.desktopImg = event.target.result;
    document.getElementById('desktopImg').src = event.target.result;
    document.getElementById('desktopImg').style.display = 'block';
    document.getElementById('desktopPlaceholder').style.display = 'none';

    // 2. Auto-export with current settings
    await exportMockup();
    await new Promise(r => setTimeout(r, 1000)); // Cool down
  }
  showToast('✅ Batch processing complete!');
};

initDB();
