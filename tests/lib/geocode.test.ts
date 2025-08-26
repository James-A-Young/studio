import { geocodeAddress } from '@/lib/geocode';

describe('geocodeAddress', () => {

  it('handles 429 rate limit (mocked)', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ ok: false, status: 429 });
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [{ lat: '51.5', lon: '-0.1' }],
      });
    }) as any;
    const result = await geocodeAddress('London, UK', 2);
    expect(result).toEqual({ latitude: 51.5, longitude: -0.1 });
  });

  it('handles 503 service unavailable (mocked)', async () => {
    let callCount = 0;
    global.fetch = jest.fn().mockImplementation(() => {
      callCount++;
      if (callCount === 1) return Promise.resolve({ ok: false, status: 503 });
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => [{ lat: '52.0', lon: '-1.0' }],
      });
    }) as any;
    const result = await geocodeAddress('Oxford, UK');
    expect(result).toEqual({ latitude: 52.0, longitude: -1.0 });
  });

});
