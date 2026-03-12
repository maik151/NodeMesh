import { vi } from 'vitest';
import { indexedDB as fIDB, IDBKeyRange as fIDBKR } from 'fake-indexeddb';
import { webcrypto } from 'node:crypto';

// Polyfills for tests (Hyper-redundant stubbing to survive environment isolation)
const polyfills = {
    indexedDB: fIDB,
    IDBKeyRange: fIDBKR,
    crypto: webcrypto
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
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';
import { provideZonelessChangeDetection } from '@angular/core';

getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(),
    {
        teardown: { destroyAfterEach: true }
    }
);
