const store = new Map();

async function getOrFetch(key, fetchFn, ttlMs) {
  const entry = store.get(key);
  const now = Date.now();

  if (entry && now - entry.timestamp < ttlMs) {
    return entry.data;
  }

  const data = await fetchFn();

  if (data === null) {
    return entry ? entry.data : null;
  }

  store.set(key, { data, timestamp: now });
  return data;
}

function clear() {
  store.clear();
}

module.exports = { getOrFetch, clear };
