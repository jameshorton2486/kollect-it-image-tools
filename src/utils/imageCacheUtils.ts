const CACHE_NAME = 'image-processing-cache';
const CACHE_VERSION = '2'; // Increment when cache structure changes
const MAX_CACHE_ENTRIES = 50; // Maximum number of images to store in cache

export async function openCache(): Promise<Cache> {
  return await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
}

export function generateCacheKey(
  file: File,
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean,
  model: string = 'removebg'
): string {
  // Create a cache key based on file properties and processing options
  const key = `${file.name}-${file.size}-${file.lastModified}-${compressionLevel}-${maxWidth}-${maxHeight}-${removeBackground ? '1' : '0'}-${model}`;
  return btoa(encodeURIComponent(key));
}

export async function getProcessedImageFromCache(key: string): Promise<File | null> {
  try {
    const cache = await openCache();
    const response = await cache.match(new Request(`cache/${key}`));
    
    if (response && response.ok) {
      const blob = await response.blob();
      const metadata = await response.json();
      
      if (blob && metadata && metadata.filename) {
        return new File([blob], metadata.filename, { type: blob.type });
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error retrieving from cache:', error);
    return null;
  }
}

export async function cacheProcessedImage(key: string, file: File, originalName: string): Promise<void> {
  try {
    const cache = await openCache();
    
    // Store blob data
    const blobResponse = new Response(file);
    await cache.put(new Request(`cache/${key}/data`), blobResponse);
    
    // Store metadata separately
    const metadata = {
      filename: file.name,
      originalName,
      timestamp: Date.now()
    };
    const metadataResponse = new Response(JSON.stringify(metadata), {
      headers: { 'Content-Type': 'application/json' }
    });
    await cache.put(new Request(`cache/${key}`), metadataResponse);
    
    // Clean up old cache entries if needed
    await cleanupCache();
  } catch (error) {
    console.error('Error storing in cache:', error);
  }
}

async function cleanupCache(): Promise<void> {
  try {
    const cache = await openCache();
    const keys = await cache.keys();
    
    // Only keep metadata keys (not data keys)
    const metadataKeys = keys.filter(key => !key.url.includes('/data'));
    
    if (metadataKeys.length > MAX_CACHE_ENTRIES) {
      // Get all cache entries with timestamps
      const entries = await Promise.all(
        metadataKeys.map(async (key) => {
          const response = await cache.match(key);
          if (response) {
            try {
              const metadata = await response.json();
              return {
                key,
                timestamp: metadata.timestamp || 0
              };
            } catch (e) {
              return { key, timestamp: 0 };
            }
          }
          return { key, timestamp: 0 };
        })
      );
      
      // Sort by timestamp (oldest first) and remove excess entries
      const toRemove = entries
        .sort((a, b) => a.timestamp - b.timestamp)
        .slice(0, entries.length - MAX_CACHE_ENTRIES)
        .map(entry => entry.key);
      
      // Delete the old entries and their data
      for (const key of toRemove) {
        const url = key.url;
        await cache.delete(key);
        await cache.delete(new Request(`${url}/data`));
      }
    }
  } catch (error) {
    console.error('Error cleaning cache:', error);
  }
}

export async function clearImageCache(): Promise<void> {
  try {
    const cacheKeys = await caches.keys();
    const imageCacheKeys = cacheKeys.filter(key => key.startsWith(CACHE_NAME));
    
    await Promise.all(imageCacheKeys.map(key => caches.delete(key)));
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}
