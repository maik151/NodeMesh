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
    (globalThis as any)[key] = value;
    if (typeof global !== 'undefined') (global as any)[key] = value;
    if (typeof window !== 'undefined') (window as any)[key] = value;
});

import '@angular/compiler';
import 'zone.js';
import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting,
} from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting()
);
