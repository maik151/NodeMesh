import '@angular/compiler';
import 'zone.js'; // Needed if not using zoneless
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

// Polyfill for Web Crypto API in jsdom
import { webcrypto } from 'node:crypto';
Object.defineProperty(globalThis, 'crypto', {
    value: webcrypto,
});
