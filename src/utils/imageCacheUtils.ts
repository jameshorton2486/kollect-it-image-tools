
/**
 * Utility functions for caching processed images
 */

// Cache keys
const CACHE_PREFIX = 'img_cache_';
const CACHE_METADATA_KEY = 'img_cache_metadata';

// Cache metadata to track stored images and manage cache size/expiration
interface CacheMetadata {
  entries: CacheEntry[];
  lastCleanup: number;
}

interface CacheEntry {
  key: string;
  timestamp: number;
  originalName: string;
  size: number;
}

// Maximum cache size (in bytes) - default 100 MB
const MAX_CACHE_SIZE = 100 * 1024 * 1024;
// Cache entry expiration time (7 days in milliseconds)
const CACHE_EXPIRATION = 7 * 24 * 60 * 60 * 1000;

/**
 * Initialize cache metadata if not exists
 */
function initCacheMetadata(): CacheMetadata {
  const metadata = localStorage.getItem(CACHE_METADATA_KEY);
  if (metadata) {
    return JSON.parse(metadata);
  }
  
  const newMetadata: CacheMetadata = {
    entries: [],
    lastCleanup: Date.now()
  };
  
  localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(newMetadata));
  return newMetadata;
}

/**
 * Update cache metadata with a new entry
 */
function updateCacheMetadata(entry: CacheEntry): void {
  const metadata = initCacheMetadata();
  
  // Remove existing entry with the same key if exists
  metadata.entries = metadata.entries.filter(e => e.key !== entry.key);
  
  // Add new entry
  metadata.entries.push(entry);
  
  localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
}

/**
 * Clean up expired or excess cache entries
 */
function cleanupCache(): void {
  const metadata = initCacheMetadata();
  const now = Date.now();
  
  // Only run cleanup once per day
  if (now - metadata.lastCleanup < 24 * 60 * 60 * 1000) {
    return;
  }
  
  // Remove expired entries
  let validEntries = metadata.entries.filter(entry => {
    const isExpired = now - entry.timestamp > CACHE_EXPIRATION;
    if (isExpired) {
      // Remove from localStorage
      localStorage.removeItem(entry.key);
    }
    return !isExpired;
  });
  
  // Check cache size and remove oldest entries if exceed limit
  let totalSize = validEntries.reduce((sum, entry) => sum + entry.size, 0);
  
  if (totalSize > MAX_CACHE_SIZE) {
    // Sort by timestamp, oldest first
    validEntries.sort((a, b) => a.timestamp - b.timestamp);
    
    while (totalSize > MAX_CACHE_SIZE && validEntries.length > 0) {
      const oldestEntry = validEntries.shift();
      if (oldestEntry) {
        localStorage.removeItem(oldestEntry.key);
        totalSize -= oldestEntry.size;
      }
    }
  }
  
  // Update metadata
  metadata.entries = validEntries;
  metadata.lastCleanup = now;
  localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
}

/**
 * Generate a cache key based on image attributes and processing options
 */
export function generateCacheKey(
  originalFile: File,
  compressionLevel: number,
  maxWidth: number,
  maxHeight: number,
  removeBackground: boolean
): string {
  // Create a unique key based on file attributes and processing parameters
  const fileInfo = `${originalFile.name}_${originalFile.size}_${originalFile.lastModified}`;
  const processingParams = `${compressionLevel}_${maxWidth}_${maxHeight}_${removeBackground}`;
  
  return `${CACHE_PREFIX}${fileInfo}_${processingParams}`;
}

/**
 * Store a processed image in the cache
 */
export function cacheProcessedImage(
  key: string,
  processedFile: File,
  originalName: string
): void {
  try {
    // Read file as ArrayBuffer
    const reader = new FileReader();
    reader.onload = function(event) {
      if (event.target?.result) {
        // Store file data
        localStorage.setItem(key, JSON.stringify({
          name: processedFile.name,
          type: processedFile.type,
          data: event.target.result // Store ArrayBuffer as base64
        }));
        
        // Update metadata
        updateCacheMetadata({
          key,
          timestamp: Date.now(),
          originalName,
          size: processedFile.size
        });
        
        // Run cleanup after storing new data
        cleanupCache();
      }
    };
    
    reader.readAsDataURL(processedFile);
  } catch (error) {
    console.error('Error caching processed image:', error);
    // If caching fails, just continue without caching
  }
}

/**
 * Retrieve a processed image from the cache
 */
export function getProcessedImageFromCache(key: string): Promise<File | null> {
  return new Promise(resolve => {
    try {
      const cachedData = localStorage.getItem(key);
      
      if (!cachedData) {
        resolve(null);
        return;
      }
      
      const { name, type, data } = JSON.parse(cachedData);
      
      // Convert base64 to blob
      fetch(data)
        .then(res => res.blob())
        .then(blob => {
          // Create file from blob
          const file = new File([blob], name, { type });
          
          // Update timestamp to mark as recently used
          const metadata = initCacheMetadata();
          const entry = metadata.entries.find(e => e.key === key);
          if (entry) {
            entry.timestamp = Date.now();
            localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
          }
          
          resolve(file);
        })
        .catch(error => {
          console.error('Error retrieving cached image:', error);
          resolve(null);
        });
        
    } catch (error) {
      console.error('Error reading from cache:', error);
      resolve(null);
    }
  });
}

/**
 * Clear all cached images
 */
export function clearImageCache(): void {
  try {
    const metadata = initCacheMetadata();
    
    // Remove all cached files
    metadata.entries.forEach(entry => {
      localStorage.removeItem(entry.key);
    });
    
    // Reset metadata
    localStorage.setItem(CACHE_METADATA_KEY, JSON.stringify({
      entries: [],
      lastCleanup: Date.now()
    }));
    
    console.log('Image cache cleared');
  } catch (error) {
    console.error('Error clearing image cache:', error);
  }
}
