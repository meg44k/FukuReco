import '@testing-library/jest-dom'
import {beforeAll, afterEach, afterAll, vi } from 'vitest'
import { server } from './tests/mocks/node'

// Google Maps API の簡易的なモック
global.google = {
  maps: {
    Marker: vi.fn(),
    Map: vi.fn().mockImplementation(() => ({
      setCenter: vi.fn(),
      setZoom: vi.fn(),
      getBounds: vi.fn().mockReturnValue({
        getNorthEast: vi.fn().mockReturnValue({ lat: () => 0, lng: () => 0 }),
        getSouthWest: vi.fn().mockReturnValue({ lat: () => 0, lng: () => 0 }),
      }),
      panTo: vi.fn(),
      addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
    })),
    LatLng: vi.fn(),
    LatLngBounds: vi.fn(),
    Size: vi.fn(),
    Point: vi.fn(),
    SymbolPath: { CIRCLE: 0 },
    event: {
      addListener: vi.fn().mockReturnValue({ remove: vi.fn() }),
      removeListener: vi.fn(),
      trigger: vi.fn(),
    },
  },
} as any;

beforeAll(()=>server.listen())

afterEach(()=>server.resetHandlers())

afterAll(()=>server.close())
