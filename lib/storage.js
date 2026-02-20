import { put, list, del } from '@vercel/blob';

// Storage abstraction over Vercel Blob
// All data stored as JSON files in Blob storage

export async function readJSON(key) {
    try {
        const { blobs } = await list({ prefix: key });
        if (blobs.length === 0) return null;
        const response = await fetch(blobs[0].url);
        return await response.json();
    } catch (err) {
        console.error(`Storage read error for ${key}:`, err);
        return null;
    }
}

export async function writeJSON(key, data) {
    try {
        // Delete existing blob with this key
        const { blobs } = await list({ prefix: key });
        for (const blob of blobs) {
            await del(blob.url);
        }
        // Write new blob
        const result = await put(key, JSON.stringify(data, null, 2), {
            contentType: 'application/json',
            addRandomSuffix: false,
        });
        return result;
    } catch (err) {
        console.error(`Storage write error for ${key}:`, err);
        throw err;
    }
}

export async function readBlob(key) {
    try {
        const { blobs } = await list({ prefix: key });
        if (blobs.length === 0) return null;
        const response = await fetch(blobs[0].url);
        return await response.text();
    } catch (err) {
        console.error(`Storage read error for ${key}:`, err);
        return null;
    }
}

export async function writeBlob(key, content, contentType = 'text/csv') {
    try {
        const { blobs } = await list({ prefix: key });
        for (const blob of blobs) {
            await del(blob.url);
        }
        return await put(key, content, { contentType, addRandomSuffix: false });
    } catch (err) {
        console.error(`Storage write error for ${key}:`, err);
        throw err;
    }
}

export async function listBlobs(prefix) {
    try {
        const { blobs } = await list({ prefix });
        return blobs;
    } catch (err) {
        console.error(`Storage list error for ${prefix}:`, err);
        return [];
    }
}
