import { indexedDB, IDBKeyRange } from 'fake-indexeddb';
import { webcrypto } from 'node:crypto';

// Polyfills for tests (must be before Angular/Dexie imports)
Object.defineProperty(globalThis, 'indexedDB', { value: indexedDB, writable: true });
Object.defineProperty(globalThis, 'IDBKeyRange', { value: IDBKeyRange, writable: true });
Object.defineProperty(globalThis, 'crypto', { value: webcrypto, writable: true });

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
