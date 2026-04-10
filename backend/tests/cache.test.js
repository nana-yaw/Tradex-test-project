const { getOrFetch, clear } = require('../src/services/cache');

describe('Cache Layer', () => {
  beforeEach(() => {
    clear();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call fetchFn on cache miss and return its result', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ price: 100 });

    const result = await getOrFetch('prices', fetchFn, 30000);

    expect(result).toEqual({ price: 100 });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should return cached data within TTL without calling fetchFn again', async () => {
    const fetchFn = jest.fn().mockResolvedValue({ price: 100 });

    await getOrFetch('prices', fetchFn, 30000);

    jest.advanceTimersByTime(25000);

    const result = await getOrFetch('prices', fetchFn, 30000);

    expect(result).toEqual({ price: 100 });
    expect(fetchFn).toHaveBeenCalledTimes(1);
  });

  it('should call fetchFn again after TTL expires', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({ price: 100 })
      .mockResolvedValueOnce({ price: 110 });

    await getOrFetch('prices', fetchFn, 30000);

    jest.advanceTimersByTime(31000);

    const result = await getOrFetch('prices', fetchFn, 30000);

    expect(result).toEqual({ price: 110 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('should not cache null results from fetchFn', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ price: 100 });

    const first = await getOrFetch('prices', fetchFn, 30000);
    const second = await getOrFetch('prices', fetchFn, 30000);

    expect(first).toBeNull();
    expect(second).toEqual({ price: 100 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });

  it('should cache different keys independently', async () => {
    const fetchPrices = jest.fn().mockResolvedValue({ price: 100 });
    const fetchChart = jest.fn().mockResolvedValue({ prices: [[1, 200]] });

    await getOrFetch('prices', fetchPrices, 30000);
    await getOrFetch('chart:bitcoin', fetchChart, 30000);

    jest.advanceTimersByTime(25000);

    const prices = await getOrFetch('prices', fetchPrices, 30000);
    const chart = await getOrFetch('chart:bitcoin', fetchChart, 30000);

    expect(prices).toEqual({ price: 100 });
    expect(chart).toEqual({ prices: [[1, 200]] });
    expect(fetchPrices).toHaveBeenCalledTimes(1);
    expect(fetchChart).toHaveBeenCalledTimes(1);
  });

  it('should serve stale data when fetchFn fails and cache exists', async () => {
    const fetchFn = jest
      .fn()
      .mockResolvedValueOnce({ price: 100 })
      .mockResolvedValueOnce(null);

    await getOrFetch('prices', fetchFn, 30000);

    jest.advanceTimersByTime(31000);

    const result = await getOrFetch('prices', fetchFn, 30000);

    expect(result).toEqual({ price: 100 });
    expect(fetchFn).toHaveBeenCalledTimes(2);
  });
});
