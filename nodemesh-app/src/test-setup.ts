import { vi } from 'vitest';
import { indexedDB as fIDB, IDBKeyRange as fIDBKR } from 'fake-indexeddb';
import { webcrypto } from 'node:crypto';

// Polyfills for tests (Hyper-redundant stubbing to survive environment isolation)
const polyfills = {
    indexedDB: fIDB,
    IDBKeyRange: fIDBKR,
    crypto: webcrypto,
    ResizeObserver: class {
        observe() {
            // Intentionally empty: JSDOM stub for ResizeObserver.observe
        }
        unobserve() {
            // Intentionally empty: JSDOM stub for ResizeObserver.unobserve
        }
        disconnect() {
            // Intentionally empty: JSDOM stub for ResizeObserver.disconnect
        }
    }
};

Object.entries(polyfills).forEach(([key, value]) => {
    vi.stubGlobal(key, value);
    const g = globalThis as any;
    g[key] = value;
    // Survival for older environments if needed
    if (g.window) g.window[key] = value;
    if (g.global) g.global[key] = value;
});

import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserTestingModule,
    platformBrowserTesting,
} from '@angular/platform-browser/testing';

getTestBed().initTestEnvironment(
    BrowserTestingModule,
    platformBrowserTesting(),
    {
        teardown: { destroyAfterEach: true }
    }
);
