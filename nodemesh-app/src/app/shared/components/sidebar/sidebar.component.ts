import { Component, inject, HostBinding } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { ThemeService } from '../../../core/services/ui/theme.service';
import { AuthService } from '../../../core/services/auth/auth.service';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-wrapper">
      <div class="sidebar-header">
        <div class="logo-container" [class.hidden]="!isExpanded">
          <!-- Logo completo SVG -->
          <svg class="logo-svg" viewBox="0 0 1310.88 248.49" xmlns="http://www.w3.org/2000/svg">
            <g>
              <g>
                <path fill="#86db00" d="M247.82,150.55v97.92h-30.77s-13.81.01-13.81.01c-2.38-2.32-4.82-4.74-7.35-7.23-4.7-4.66-7.97-7.97-11.39-11.38-21.88-21.89-43.7-43.88-65.61-65.76-13-13.03-26.06-26.02-39.16-38.92-2.83-2.79-5.62-6.07-8.55-8.92-6.34-6.14-13.28-10.09-22.5-1.98-6.98,6.13-13.19,14.05-20.18,20.22L.08,162.85c.02-10.85.03-21.69.03-32.54,0-10.56-.02-21.11-.05-31.67V.01c15.06,0,30.12,0,45.18-.01,48.5,48.45,71.77,72.37,83.76,85.08,13.59,14.4,28.9,27.17,41.79,42.19.08.1,2.59,2.43,5.92,5.65,6.34,6.13,13.28,10.09,22.5,1.98,6.98-6.13,13.19-14.05,20.19-20.22l28.39-28.34v.87c-.07,21.11-.01,42.23.03,63.35Z"/>
                <path fill="#86db00" d="M247.86,0v49.23c-19.68,19.15-39.37,38.29-59.05,57.44-4.07-4.09-8.13-8.17-12.2-12.26-15.42-15.52-30.84-31.04-46.26-46.56C146.54,31.91,162.72,15.96,178.9,0h68.96Z"/>
                <path fill="#86db00" d="M117.35,200.09l-27.54,27.86-20.86,20.53H0c.02-16.27.04-32.54.06-48.81,12.96-12.56,25.93-25.12,38.89-37.69l8.95-8.9c3.88-3.73,7.75-7.45,11.63-11.18,19.28,19.39,38.55,38.79,57.83,58.18Z"/>
              </g>
              <g class="logo-wordmark">
                <path d="M384.64,183.85v-49.2c0-5.72-.23-10.43-.68-14.13-.45-3.7-1.22-6.9-2.32-9.6-1.41-3.47-3.71-6.11-6.89-7.91-3.18-1.8-6.87-2.7-11.04-2.7-6.63,0-11.96,2.02-16.02,6.08-1.48,1.48-2.71,3.04-3.71,4.68s-1.78,3.62-2.36,5.93c-.58,2.32-1,5.06-1.26,8.25-.26,3.18-.38,6.99-.38,11.43v47.17h-26.24v-104.28h7.91l14.57,16.59c1.48-2.57,3.18-5.02,5.11-7.33,1.93-2.32,4.15-4.34,6.66-6.08,2.51-1.74,5.4-3.1,8.68-4.1,3.28-1,7.01-1.5,11.19-1.5,3.6,0,7.25.32,10.95.96,3.7.64,7.27,1.78,10.71,3.42,3.44,1.64,6.61,3.87,9.5,6.7,2.9,2.83,5.34,6.43,7.33,10.8.9,1.99,1.64,3.99,2.22,5.98.58,1.99,1.04,4.2,1.4,6.61.35,2.41.59,5.13.72,8.15.13,3.02.19,6.59.19,10.71v53.35h-26.23Z"/>
                <path d="M538.99,110.34c-.03-.16-.12-.31-.19-.47-3.08-6.7-7.23-12.46-12.49-17.32-5.3-4.86-11.47-8.63-18.6-11.34-7.07-2.71-14.71-4.05-22.81-4.05-5.33,0-10.47.62-15.39,1.84-4.89,1.21-9.5,2.96-13.77,5.27-4.3,2.27-8.16,5.05-11.68,8.29-3.49,3.24-6.51,6.89-9,10.94-2.52,4.05-4.46,8.44-5.8,13.18-1.34,4.74-2.02,9.72-2.02,14.99,0,7.91,1.53,15.2,4.58,21.9,3.05,6.7,7.23,12.49,12.49,17.36,5.27,4.89,11.43,8.72,18.48,11.43,7.04,2.74,14.55,4.11,22.53,4.11s15.58-1.37,22.65-4.11c7.07-2.71,13.24-6.51,18.48-11.37,5.23-4.86,9.38-10.62,12.4-17.32.03-.06.06-.12.09-.19,2.96-6.61,4.46-13.83,4.46-21.59s-1.47-14.99-4.39-21.53ZM514.62,144.58c-1.56,3.86-3.71,7.2-6.48,10-2.74,2.77-6.08,4.99-9.97,6.54-3.89,1.59-8.19,2.37-12.87,2.37s-8.79-.78-12.59-2.37c-3.83-1.56-7.17-3.77-10-6.54-2.83-2.8-5.02-6.14-6.6-10-1.59-3.86-2.37-8.1-2.37-12.71s.75-8.79,2.27-12.65c1.53-3.86,3.65-7.2,6.36-10,2.74-2.77,6.01-4.95,9.85-6.54,3.83-1.59,8.07-2.37,12.68-2.37s9,.78,12.93,2.37c3.93,1.59,7.29,3.77,10.13,6.54,2.84,2.8,5.05,6.14,6.61,10,1.59,3.86,2.37,8.07,2.37,12.65s-.78,8.85-2.3,12.71Z"/>
                <path d="M642.05,32.7v54.96c-3.99-3.21-8.54-5.76-13.62-7.66-5.08-1.87-11.09-2.84-18.04-2.84-4.67,0-9.32.59-13.9,1.78-4.55,1.21-8.91,2.9-13.05,5.11-4.14,2.24-8.01,4.95-11.53,8.16-3.52,3.21-6.6,6.82-9.16,10.84-1.46,2.31-2.77,4.74-3.86,7.29-.84,1.9-1.59,3.93-2.21,5.98-1.5,4.83-2.21,9.94-2.21,15.33s.72,10.62,2.15,15.45c.65,2.18,1.43,4.3,2.37,6.36,1.03,2.43,2.28,4.74,3.68,6.95,2.55,4.05,5.64,7.69,9.19,10.94,3.58,3.27,7.48,5.98,11.68,8.23,4.21,2.21,8.69,3.89,13.4,5.11,4.74,1.18,9.53,1.78,14.43,1.78,6.76,0,13.4-1.15,19.94-3.49,6.51-2.3,12.99-6.42,19.41-12.34l7.73,13.21h9.85V32.7h-26.23ZM611.96,163.49c-4.7,0-8.94-.9-12.74-2.71-3.8-1.78-7.04-4.18-9.75-7.13-2.68-2.96-4.77-6.36-6.26-10.16-1.46-3.83-2.21-7.79-2.21-11.84,0-4.42.78-8.57,2.31-12.4,1.56-3.8,3.68-7.13,6.42-9.91,2.74-2.8,5.95-5.02,9.6-6.64,3.68-1.59,7.63-2.4,11.87-2.4,4.64,0,8.94.81,12.99,2.4,3.99,1.62,7.51,3.83,10.5,6.64,2.99,2.77,5.36,6.11,7.1,9.91,1.71,3.83,2.59,7.98,2.59,12.4,0,4.7-.84,9-2.56,12.93-1.71,3.93-4.02,7.29-6.95,10.1-2.93,2.8-6.36,4.95-10.31,6.51-3.96,1.53-8.16,2.3-12.59,2.3Z"/>
                <path d="M798.56,126.74c0,1.22-.23,2.52-.67,3.91-.46,1.38-1.16,2.67-2.12,3.86-.97,1.19-2.2,2.22-3.72,3.09-1.51.87-3.36,1.4-5.54,1.59l-72.64,6.95c.77,2.06,2.03,4.13,3.77,6.22,1.73,2.09,3.87,3.96,6.41,5.6,2.54,1.64,5.46,2.98,8.77,4,3.32,1.03,6.93,1.54,10.86,1.54,2.7,0,5.43-.24,8.2-.72,2.76-.48,5.46-1.19,8.11-2.12,2.63-.93,5.14-2.12,7.52-3.57,2.38-1.45,4.5-3.13,6.37-5.06l14.47,16.78c-2.51,2.38-5.31,4.65-8.39,6.8-3.09,2.15-6.48,4.04-10.17,5.64-3.7,1.61-7.72,2.88-12.06,3.81-4.34.93-9.02,1.4-14.03,1.4-9.01,0-17.15-1.41-24.46-4.24-7.3-2.83-13.54-6.75-18.71-11.77-5.18-5.02-9.16-10.95-11.96-17.8-2.79-6.85-4.19-14.29-4.19-22.33,0-4.69.68-9.26,2.03-13.7,1.35-4.44,3.26-8.62,5.74-12.54,2.48-3.92,5.45-7.54,8.92-10.85,3.47-3.31,7.34-6.16,11.62-8.54,4.28-2.38,8.88-4.23,13.8-5.55,4.92-1.32,10.05-1.98,15.39-1.98,8.16,0,15.71,1.27,22.62,3.81,6.91,2.54,12.89,6.03,17.94,10.47,5.05,4.44,9.01,9.68,11.87,15.72,2.86,6.05,4.29,12.57,4.29,19.58ZM767.79,116.52c0-2.32-.72-4.47-2.17-6.46-1.45-1.99-3.36-3.71-5.74-5.16-2.38-1.45-5.08-2.57-8.11-3.38-3.02-.8-6.11-1.2-9.26-1.2-4.62,0-8.73.66-12.3,1.98-3.57,1.32-6.67,3.15-9.3,5.5-2.64,2.35-4.78,5.18-6.42,8.49-1.64,3.31-2.84,6.93-3.61,10.85l51.32-4.92c1.8-.19,3.18-.92,4.15-2.17.96-1.26,1.45-2.43,1.45-3.52Z"/>
                <path d="M953.09,183.85v-55.76c0-9.65-1.62-16.69-4.87-21.13-3.25-4.44-8.48-6.66-15.68-6.66-6.63,0-11.96,2.22-16.02,6.66-1.16,1.35-2.12,2.83-2.89,4.44-.77,1.61-1.4,3.47-1.88,5.59-.49,2.12-.82,4.6-1.02,7.43-.19,2.83-.29,6.11-.29,9.84v49.58h-26.34v-55.76c0-3.66-.16-6.86-.48-9.6-.32-2.73-.87-5.13-1.64-7.19-1.28-3.34-3.63-6.01-7.04-8.01-3.41-1.99-7.39-2.99-11.96-2.99-7.27,0-12.68,2.35-16.21,7.04-.96,1.29-1.78,2.72-2.46,4.29-.68,1.58-1.22,3.42-1.64,5.55-.42,2.12-.72,4.58-.92,7.38-.19,2.8-.29,6.03-.29,9.69v49.58h-26.24v-104.28h8.87l13.6,16.59c1.1-2.06,2.57-4.21,4.44-6.46,1.86-2.25,4.06-4.31,6.6-6.17,2.54-1.87,5.4-3.39,8.59-4.58,3.18-1.19,6.64-1.78,10.37-1.78,6.43,0,12.43,1.8,17.99,5.4,5.56,3.6,10.17,8.52,13.84,14.76,2.19-2.96,4.55-5.67,7.1-8.15,2.54-2.48,5.26-4.6,8.15-6.37,2.9-1.77,6.01-3.15,9.36-4.15,3.34-1,6.94-1.5,10.8-1.5,14.79,0,25.89,4.08,33.28,12.25,7.39,8.17,11.09,20.35,11.09,36.56v57.88h-26.24Z"/>
                <path d="M1110.33,126.74c0,1.22-.23,2.52-.68,3.91s-1.16,2.67-2.12,3.86c-.96,1.19-2.2,2.22-3.71,3.09-1.51.87-3.36,1.4-5.55,1.59l-72.63,6.95c.77,2.06,2.03,4.13,3.76,6.22,1.73,2.09,3.88,3.96,6.41,5.6,2.54,1.64,5.46,2.98,8.78,4,3.31,1.03,6.93,1.54,10.85,1.54,2.7,0,5.43-.24,8.2-.72,2.76-.48,5.46-1.19,8.1-2.12,2.63-.93,5.15-2.12,7.53-3.57,2.37-1.45,4.5-3.13,6.37-5.06l14.47,16.78c-2.51,2.38-5.31,4.65-8.39,6.8-3.09,2.15-6.48,4.04-10.18,5.64-3.7,1.61-7.72,2.88-12.05,3.81-4.34.93-9.02,1.4-14.04,1.4-9,0-17.15-1.41-24.45-4.24-7.3-2.83-13.54-6.75-18.72-11.77-5.17-5.02-9.16-10.95-11.96-17.8-2.8-6.85-4.2-14.29-4.2-22.33,0-4.69.68-9.26,2.03-13.7,1.35-4.44,3.26-8.62,5.74-12.54,2.48-3.92,5.45-7.54,8.93-10.85,3.47-3.31,7.34-6.16,11.62-8.54,4.27-2.38,8.87-4.23,13.8-5.55,4.92-1.32,10.05-1.98,15.38-1.98,8.17,0,15.71,1.27,22.62,3.81,6.91,2.54,12.89,6.03,17.95,10.47,5.04,4.44,9,9.68,11.87,15.72,2.86,6.05,4.29,12.57,4.29,19.58ZM1079.56,116.52c0-2.32-.72-4.47-2.17-6.46-1.45-1.99-3.37-3.71-5.74-5.16-2.38-1.45-5.08-2.57-8.1-3.38-3.02-.8-6.11-1.2-9.26-1.2-4.63,0-8.73.66-12.3,1.98-3.57,1.32-6.68,3.15-9.31,5.5s-4.78,5.18-6.41,8.49c-1.64,3.31-2.85,6.93-3.61,10.85l51.32-4.92c1.8-.19,3.18-.92,4.14-2.17.97-1.26,1.45-2.43,1.45-3.52Z"/>
                <path d="M1199.08,153.08c0,5.21-1.11,9.89-3.33,14.04-2.22,4.15-5.23,7.67-9.02,10.56-3.8,2.89-8.18,5.1-13.17,6.61-4.98,1.51-10.24,2.23-15.77,2.17-3.09,0-5.95-.16-8.59-.48-2.63-.32-5.24-.82-7.81-1.5-2.57-.68-5.21-1.53-7.91-2.56-2.7-1.03-5.59-2.28-8.68-3.76l2.6-22.77c2.44,1.16,4.97,2.27,7.57,3.33,2.6,1.06,5.19,1.99,7.76,2.8,2.57.8,5.13,1.46,7.67,1.98,2.54.52,5,.77,7.38.77,5.28,0,9.16-.95,11.67-2.84,2.51-1.9,3.76-4.29,3.76-7.19,0-1.29-.19-2.46-.58-3.52-.38-1.06-1.06-2.07-2.03-3.04-.96-.96-2.25-1.93-3.86-2.89-1.61-.96-3.6-2.03-5.98-3.18l-21.51-10.13c-5.4-2.44-9.33-5.79-11.77-10.03-2.45-4.24-3.67-9.19-3.67-14.86,0-4.69.83-8.86,2.51-12.49,1.67-3.63,3.99-6.7,6.95-9.21,2.96-2.51,6.46-4.42,10.52-5.74,4.05-1.32,8.45-1.98,13.21-1.98,3.09,0,6.21.19,9.36.58,3.15.39,6.24.93,9.26,1.64,3.02.71,5.88,1.58,8.59,2.6,2.7,1.03,5.14,2.19,7.33,3.47l-2.7,22.09c-5.66-2.96-11.09-5.24-16.3-6.85-5.21-1.61-9.74-2.41-13.6-2.41-1.22,0-2.43.16-3.61.48-1.19.32-2.23.79-3.13,1.4-.9.61-1.64,1.4-2.22,2.36s-.87,2.12-.87,3.47c0,1.16.27,2.22.82,3.18.55.96,1.28,1.85,2.22,2.65.93.8,2.06,1.56,3.38,2.27,1.31.71,2.74,1.45,4.29,2.22l19.29,9.07c6.43,3.09,11.37,6.9,14.81,11.43,3.44,4.53,5.16,9.95,5.16,16.25Z"/>
                <path d="M1284.64,183.85v-51.32c0-5.79-.38-10.72-1.16-14.81-.77-4.08-2.01-7.41-3.71-9.98-1.7-2.57-3.91-4.45-6.61-5.64-2.7-1.19-5.98-1.78-9.84-1.78-3.47,0-6.61.55-9.41,1.64-2.79,1.09-5.19,2.77-7.19,5.02-1.22,1.35-2.25,2.81-3.09,4.39-.83,1.58-1.51,3.39-2.03,5.45-.51,2.06-.88,4.41-1.11,7.04-.23,2.64-.33,5.66-.33,9.07v50.93h-26.24V32.69h26.24v54.98c3.99-3.6,8.18-6.25,12.58-7.96,4.41-1.7,9.44-2.56,15.1-2.56,5.98,0,11.5.87,16.55,2.6,5.04,1.74,9.4,4.31,13.07,7.72,2.44,2.19,4.52,4.55,6.22,7.09,1.7,2.54,3.09,5.4,4.15,8.58,1.06,3.18,1.83,6.79,2.31,10.8.48,4.02.72,8.6.72,13.75v56.14h-26.24Z"/>
              </g>
            </g>
          </svg>
        </div>
        <!-- Logo solo isotipo para modo comprimido — clickable para expandir -->
        <div class="logo-icon-only" [class.hidden]="isExpanded" (click)="toggle()" title="Expandir">
          <svg class="logo-icon-svg" viewBox="0 0 248 248.49" xmlns="http://www.w3.org/2000/svg">
            <path fill="#86db00" d="M247.82,150.55v97.92h-30.77s-13.81.01-13.81.01c-2.38-2.32-4.82-4.74-7.35-7.23-4.7-4.66-7.97-7.97-11.39-11.38-21.88-21.89-43.7-43.88-65.61-65.76-13-13.03-26.06-26.02-39.16-38.92-2.83-2.79-5.62-6.07-8.55-8.92-6.34-6.14-13.28-10.09-22.5-1.98-6.98,6.13-13.19,14.05-20.18,20.22L.08,162.85c.02-10.85.03-21.69.03-32.54,0-10.56-.02-21.11-.05-31.67V.01c15.06,0,30.12,0,45.18-.01,48.5,48.45,71.77,72.37,83.76,85.08,13.59,14.4,28.9,27.17,41.79,42.19.08.1,2.59,2.43,5.92,5.65,6.34,6.13,13.28,10.09,22.5,1.98,6.98-6.13,13.19-14.05,20.19-20.22l28.39-28.34v.87c-.07,21.11-.01,42.23.03,63.35Z"/>
            <path fill="#86db00" d="M247.86,0v49.23c-19.68,19.15-39.37,38.29-59.05,57.44-4.07-4.09-8.13-8.17-12.2-12.26-15.42-15.52-30.84-31.04-46.26-46.56C146.54,31.91,162.72,15.96,178.9,0h68.96Z"/>
            <path fill="#86db00" d="M117.35,200.09l-27.54,27.86-20.86,20.53H0c.02-16.27.04-32.54.06-48.81,12.96-12.56,25.93-25.12,38.89-37.69l8.95-8.9c3.88-3.73,7.75-7.45,11.63-11.18,19.28,19.39,38.55,38.79,57.83,58.18Z"/>
          </svg>
          <!-- Overlay >> que aparece en hover -->
          <div class="expand-overlay">
            <svg class="expand-chevron" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M205.66,202.34a8,8,0,0,1-11.32,11.32l-80-80a8,8,0,0,1,0-11.32l80-80a8,8,0,0,1,11.32,11.32L131.31,128ZM51.31,128l74.35-74.34a8,8,0,0,0-11.32-11.32l-80,80a8,8,0,0,0,0,11.32l80,80a8,8,0,0,0,11.32-11.32Z"/>
            </svg>
          </div>
        </div>
        <!-- Botón toggle — solo visible cuando está expandido -->
        <button class="toggle-btn" *ngIf="isExpanded" (click)="toggle()" title="Contraer">
          <svg class="chevron-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M201.54,54.46A104,104,0,0,0,54.46,201.54,104,104,0,0,0,201.54,54.46ZM190.23,190.23a88,88,0,1,1,0-124.46A88.11,88.11,0,0,1,190.23,190.23Zm-16.57-88.57L147.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32Zm-56,0L91.31,128l26.35,26.34a8,8,0,0,1-11.32,11.32l-32-32a8,8,0,0,1,0-11.32l32-32a8,8,0,0,1,11.32,11.32Z"/>
          </svg>
        </button>
      </div>

      <nav class="sidebar-nav">
        <!-- Bloque 1: Flujo de Trabajo -->
        <div class="nav-group">
          <small class="group-label" [class.hidden]="!isExpanded">Flujo</small>
          <a routerLink="/center" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M128,128a8,8,0,0,1-3,6.25l-40,32a8,8,0,1,1-10-12.5L107.19,128,75,102.25a8,8,0,1,1,10-12.5l40,32A8,8,0,0,1,128,128Zm48,24H136a8,8,0,0,0,0,16h40a8,8,0,0,0,0-16Zm56-96V200a16,16,0,0,1-16,16H40a16,16,0,0,1-16-16V56A16,16,0,0,1,40,40H216A16,16,0,0,1,232,56ZM216,200V56H40V200H216Z"/>
            </svg>
            <span class="item-text" [class.hidden]="!isExpanded">Command Center</span>
          </a>
          <a routerLink="/vault" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M216,40H40A16,16,0,0,0,24,56V216a8,8,0,0,0,11.58,7.16L64,208.94l28.42,14.22a8,8,0,0,0,7.16,0L128,208.94l28.42,14.22a8,8,0,0,0,7.16,0L192,208.94l28.42,14.22A8,8,0,0,0,232,216V56A16,16,0,0,0,216,40Zm0,163.06-20.42-10.22a8,8,0,0,0-7.16,0L160,207.06l-28.42-14.22a8,8,0,0,0-7.16,0L96,207.06,67.58,192.84a8,8,0,0,0-7.16,0L40,203.06V56H216ZM60.42,167.16a8,8,0,0,0,10.74-3.58L76.94,152h38.12l5.78,11.58a8,8,0,1,0,14.32-7.16l-32-64a8,8,0,0,0-14.32,0l-32,64A8,8,0,0,0,60.42,167.16ZM96,113.89,107.06,136H84.94ZM136,128a8,8,0,0,1,8-8h16V104a8,8,0,0,1,16,0v16h16a8,8,0,0,1,0,16H176v16a8,8,0,0,1-16,0V136H144A8,8,0,0,1,136,128Z"/>
            </svg>
            <span class="item-text" [class.hidden]="!isExpanded">Temas y Tests</span>
          </a>
          <a routerLink="/stats" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M216,40H136V24a8,8,0,0,0-16,0V40H40A16,16,0,0,0,24,56V176a16,16,0,0,0,16,16H79.36L57.75,219a8,8,0,0,0,12.5,10l29.59-37h56.32l29.59,37a8,8,0,1,0,12.5-10l-21.61-27H216a16,16,0,0,0,16-16V56A16,16,0,0,0,216,40Zm0,136H40V56H216V176ZM104,120v24a8,8,0,0,1-16,0V120a8,8,0,0,1,16,0Zm32-16v40a8,8,0,0,1-16,0V104a8,8,0,0,1,16,0Zm32-16v56a8,8,0,0,1-16,0V88a8,8,0,0,1,16,0Z"/>
            </svg>
            <span class="item-text" [class.hidden]="!isExpanded">Estadísticas</span>
          </a>
        </div>

        <!-- Bloque 2: Sistema (Push down) -->
        <div class="nav-group bottom">
          <small class="group-label" [class.hidden]="!isExpanded">Sistema</small>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M144,157.68a68,68,0,1,0-71.9,0c-20.65,6.76-39.23,19.39-54.17,37.17a8,8,0,1,0,12.24,10.3C50.25,181.19,77.91,168,108,168s57.75,13.19,77.87,37.15a8,8,0,0,0,12.26-10.3C183.18,177.07,164.6,164.44,144,157.68ZM56,100a52,52,0,1,1,52,52A52.06,52.06,0,0,1,56,100Zm196.25,43.07-4.66-2.69a23.6,23.6,0,0,0,0-8.76l4.66-2.69a8,8,0,1,0-8-13.86l-4.67,2.7a23.92,23.92,0,0,0-7.58-4.39V108a8,8,0,0,0-16,0v5.38a23.92,23.92,0,0,0-7.58,4.39l-4.67-2.7a8,8,0,1,0-8,13.86l4.66,2.69a23.6,23.6,0,0,0,0,8.76l-4.66,2.69a8,8,0,0,0,8,13.86l4.67-2.7a23.92,23.92,0,0,0,7.58,4.39V164a8,8,0,0,0,16,0v-5.38a23.92,23.92,0,0,0,7.58-4.39l4.67,2.7a7.92,7.92,0,0,0,4,1.07,8,8,0,0,0,4-14.93ZM216,136a8,8,0,1,1,8,8A8,8,0,0,1,216,136Z"/>
            </svg>
            <span class="item-text" [class.hidden]="!isExpanded">Usuario</span>
          </a>
          <a routerLink="/docs" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M216,56H176V48a24,24,0,0,0-24-24H104A24,24,0,0,0,80,48v8H40A16,16,0,0,0,24,72V200a16,16,0,0,0,16,16H216a16,16,0,0,0,16-16V72A16,16,0,0,0,216,56ZM96,48a8,8,0,0,1,8-8h48a8,8,0,0,1,8,8v8H96ZM216,72v41.61A184,184,0,0,1,128,136a184.07,184.07,0,0,1-88-22.38V72Zm0,128H40V131.64A200.19,200.19,0,0,0,128,152a200.25,200.25,0,0,0,88-20.37V200ZM104,112a8,8,0,0,1,8-8h32a8,8,0,0,1,0,16H112A8,8,0,0,1,104,112Z"/>
            </svg>
            <span class="item-text" [class.hidden]="!isExpanded">Documentos</span>
          </a>
          <a routerLink="/settings" routerLinkActive="active" class="nav-item">
            <svg class="nav-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M128,80a48,48,0,1,0,48,48A48.06,48.06,0,0,0,128,80Zm0,80a32,32,0,1,1,32-32A32,32,0,0,1,128,160Zm95.68-93.85L135.68,18a15.88,15.88,0,0,0-15.36,0l-88,48.17a16,16,0,0,0-8.32,14v95.64a16,16,0,0,0,8.32,14l88,48.17a15.88,15.88,0,0,0,15.36,0l88-48.17h0a16,16,0,0,0,8.32-14V80.18A16,16,0,0,0,223.68,66.15ZM128,224,40,175.82V80.18L128,32l88,48.17v95.64Z"/>
            </svg>
            <span class="item-text" [class.hidden]="!isExpanded">Configuración</span>
          </a>
        </div>
      </nav>

      <!-- Theme Switcher: segmented pill control -->
      <div class="theme-switcher">
        <div class="theme-track">
          <div class="theme-slider" [class.dark]="isDark$ | async"></div>
          <button class="theme-btn" [class.active]="!(isDark$ | async)" (click)='setTheme("light")' title="Modo Claro">
            <svg class="theme-icon icon-sun" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M120,40V32a8,8,0,0,1,16,0v8a8,8,0,0,1-16,0Zm72,88a64,64,0,1,1-64-64A64.07,64.07,0,0,1,192,128Zm-16,0a48,48,0,1,0-48,48A48.05,48.05,0,0,0,176,128ZM58.34,69.66A8,8,0,0,0,69.66,58.34l-8-8A8,8,0,0,0,50.34,61.66Zm0,116.68-8,8a8,8,0,0,0,11.32,11.32l8-8a8,8,0,0,0-11.32-11.32ZM192,72a8,8,0,0,0,5.66-2.34l8-8a8,8,0,0,0-11.32-11.32l-8,8A8,8,0,0,0,192,72Zm5.66,114.34a8,8,0,0,0-11.32,11.32l8,8a8,8,0,0,0,11.32-11.32ZM40,120H32a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Zm88,88a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-8A8,8,0,0,0,128,208Zm96-88h-8a8,8,0,0,0,0,16h8a8,8,0,0,0,0-16Z"></path>
            </svg>
            <span class="theme-label" [class.hidden]="!isExpanded">Light</span>
          </button>
          <button class="theme-btn" [class.active]="isDark$ | async" (click)='setTheme("dark")' title="Modo Oscuro">
            <svg class="theme-icon" viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
              <path d="M233.54,142.23a8,8,0,0,0-8-2,88.08,88.08,0,0,1-109.8-109.8,8,8,0,0,0-10-10,104.84,104.84,0,0,0-52.91,37A104,104,0,0,0,136,224a103.09,103.09,0,0,0,62.52-20.88,104.84,104.84,0,0,0,37-52.91A8,8,0,0,0,233.54,142.23ZM188.9,190.34A88,88,0,0,1,65.66,67.11a89,89,0,0,1,31.4-26A106,106,0,0,0,96,56,104.11,104.11,0,0,0,200,160a106,106,0,0,0,14.92-1.06A89,89,0,0,1,188.9,190.34Z"></path>
            </svg>
            <span class="theme-label" [class.hidden]="!isExpanded">Dark</span>
          </button>
        </div>
      </div>


      <!-- Profile Card -->
      <div class="profile-card">
        <div class="avatar">{{ userInitial }}</div>
        <div class="profile-info" [class.hidden]="!isExpanded">
          <span class="profile-name">{{ userName }}</span>
          <span class="profile-email">{{ userEmail }}</span>
        </div>
        <button class="logout-btn" [class.hidden]="!isExpanded" (click)="logout()" title="Cerrar sesión">
          <svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">
            <path d="M120,216a8,8,0,0,1-8,8H48a16,16,0,0,1-16-16V48A16,16,0,0,1,48,32h64a8,8,0,0,1,0,16H48V208h64A8,8,0,0,1,120,216Zm109.66-93.66-40-40a8,8,0,0,0-11.32,11.32L204.69,120H112a8,8,0,0,0,0,16h92.69l-26.35,26.34a8,8,0,0,0,11.32,11.32l40-40A8,8,0,0,0,229.66,122.34Z"/>
          </svg>
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      --sidebar-bg: var(--theme-surface-solid);
      --active-glow: var(--theme-brand-neon);
      --text-main: var(--theme-text);
      --text-dim: var(--theme-text-muted);
      --border-color: var(--theme-border);
      
      display: block;
      height: 100vh;
      background: var(--sidebar-bg);
      border-radius: 0 24px 24px 0;
      box-shadow: inset -1px 0 0 var(--border-color);
      transition: width 0.35s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.4s ease;
      width: 260px;
      overflow: hidden;
      flex-shrink: 0;
      position: relative;
      z-index: 100;
    }

    :host-context([data-theme="light"]) {
      --sidebar-bg: #ffffff;
      --border-color: var(--theme-border);
    }

    :host.collapsed {
      width: 72px;
    }

    .sidebar-wrapper {
      display: flex;
      flex-direction: column;
      height: 100%;
      padding: 1.5rem 1rem;
    }

    :host.collapsed .sidebar-wrapper {
      padding: 1.5rem 0.75rem;
    }

    .sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem 1.25rem;
      margin: 0 -1rem 1.25rem;
      height: 52px;
      position: relative;
      gap: 0.75rem;
      z-index: 2;
      border-bottom: 1px solid var(--border-color);
    }

    :host.collapsed .sidebar-header {
      justify-content: center;
      gap: 0;
    }

    .logo-container {
      display: flex;
      align-items: center;
      flex: 1;
      overflow: hidden;
    }

    .logo-container.hidden, .logo-icon-only.hidden {
      display: none;
    }

    .logo-svg {
      height: 34px;
      width: auto;
      max-width: 180px;
    }

    /* En dark mode, la wordmark (texto) debe ser blanca */
    :host-context([data-theme="dark"]) .logo-wordmark path,
    :host-context(:not([data-theme])) .logo-wordmark path {
      fill: #ffffff;
    }

    :host-context([data-theme="light"]) .logo-wordmark path {
      fill: #1d1d1b;
    }

    .logo-icon-only {
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      cursor: pointer;
      width: 42px;
      height: 42px;
      border-radius: 10px;
      transition: background 0.2s ease;
    }

    .logo-icon-only:hover {
      background: rgba(129, 193, 6, 0.08);
    }

    /* Overlay >> que aparece al hover en modo comprimido */
    .expand-overlay {
      position: absolute;
      bottom: -10px;
      right: -14px;
      width: 26px;
      height: 26px;
      border-radius: 50%;
      background: var(--sidebar-bg);
      border: 2px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transform: scale(0.6);
      transition: opacity 0.2s ease, transform 0.2s ease;
      pointer-events: none;
    }

    .expand-chevron {
      width: 14px;
      height: 14px;
      fill: #81c106;
      transform: rotate(180deg); /* Apunta hacia la derecha >> */
    }

    .logo-icon-only:hover .expand-overlay {
      opacity: 1;
      transform: scale(1);
    }

    .logo-icon-svg {
      width: 32px;
      height: 32px;
    }

    .toggle-btn {
      background: transparent;
      border: none;
      border-radius: 50%;
      width: 34px;
      height: 34px;
      padding: 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s ease;
    }

    .chevron-icon {
      width: 22px;
      height: 22px;
      fill: var(--theme-text-muted);
      transition: fill 0.25s ease;
    }

    .toggle-btn:hover .chevron-icon {
      fill: #81c106;
      animation: compress-pulse 0.45s ease forwards;
    }

    .toggle-btn:hover {
      background: rgba(129, 193, 6, 0.12);
    }

    /* Animación de compresión: las flechas se juntan y rebotan */
    @keyframes compress-pulse {
      0%   { transform: scaleX(1); }
      30%  { transform: scaleX(0.55); }
      55%  { transform: scaleX(1.12); }
      75%  { transform: scaleX(0.88); }
      100% { transform: scaleX(1); }
    }

    /* Animación de expansión en el overlay del logo comprimido */
    @keyframes expand-pulse {
      0%   { transform: scale(1) rotate(180deg); }
      30%  { transform: scale(1.35) rotate(180deg); }
      55%  { transform: scale(0.9) rotate(180deg); }
      80%  { transform: scale(1.08) rotate(180deg); }
      100% { transform: scale(1) rotate(180deg); }
    }

    .logo-icon-only:hover .expand-chevron {
      animation: expand-pulse 0.45s ease forwards;
    }

    .sidebar-nav {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .nav-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .nav-group.bottom {
      border-top: 1px solid var(--border-color);
      padding-top: 0.5rem;
      margin-top: 0.25rem;
    }

    .group-label {
      color: var(--theme-text-muted);
      font-size: 13px;
      font-weight: 800;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      margin-bottom: 0.3rem;
      margin-left: 0.75rem;
      letter-spacing: 0.01em;
      opacity: 0.9;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.5rem 0.85rem;
      color: var(--text-dim);
      text-decoration: none;
      border-radius: 12px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      white-space: nowrap;
      position: relative;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
    }

    .nav-item:hover {
      background: rgba(154, 205, 50, 0.1);
      color: var(--text-main);
    }

    :host.collapsed .nav-item {
      justify-content: center;
      padding: 0.75rem 0;
      gap: 0;
    }

    /* SVG icon en los nav items */
    .nav-icon {
      width: 20px;
      height: 20px;
      fill: var(--text-dim);
      flex-shrink: 0;
      transition: fill 0.25s ease, width 0.3s ease, height 0.3s ease;
    }

    :host.collapsed .nav-icon {
      width: 24px;
      height: 24px;
    }

    .nav-item:hover .nav-icon {
      fill: var(--text-main);
    }

    .nav-item.active .nav-icon {
      fill: var(--active-glow);
    }

    .item-highlight {
      display: none; /* Reemplazado por el nuevo estilo de active */
    }

    .nav-item.active {
      background: rgba(154, 205, 50, 0.12);
      color: var(--active-glow);
      font-weight: 700;
      border-radius: 12px;
    }

    :host-context([data-theme="light"]) .nav-item.active {
      background: rgba(103, 163, 0, 0.1);
    }

    .item-text {
      font-size: 0.82rem;
      font-weight: 600;
      font-family: 'JetBrains Mono', 'Fira Code', monospace;
      white-space: nowrap;
      letter-spacing: -0.02em;
    }

    .material-symbols-rounded {
      font-size: 20px;
      min-width: 20px;
      color: var(--text-dim);
      transition: color 0.25s ease;
    }

    .nav-item:hover .material-symbols-rounded {
      color: var(--text-main);
    }

    .nav-item.active .material-symbols-rounded {
      color: var(--active-glow);
    }

    /* ── THEME SWITCHER ─────────────────────────────── */
    .theme-switcher {
      margin: auto 0 0;
      padding: 1.25rem 1rem;
      border-top: 1px solid var(--border-color);
      transition: padding 0.35s ease;
      display: flex;
      flex-direction: column;
    }

    .theme-track {
      display: flex;
      position: relative;
      border-radius: 12px;
      background: var(--theme-border);
      padding: 2px;
      isolation: isolate;
      margin: 0 auto;
      width: 100%;
    }

    .theme-slider {
      position: absolute;
      top: 2px;
      left: 2px;
      width: calc(50% - 2px);
      height: calc(100% - 4px);
      background: #ffffff;
      border-radius: 10px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
      transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease;
      z-index: 0;
      pointer-events: none;
    }

    /* Subtle emphasis for Dark Mode */
    :host-context([data-theme="dark"]) .theme-slider {
      background: rgba(255, 255, 255, 0.12);
      box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(4px);
    }

    /* Logic: Default (Light) is LEFT, Dark is RIGHT */
    .theme-slider.dark {
      transform: translateX(100%);
    }

    .item-text, .group-label, .theme-label, .profile-info, .logout-btn {
      transition: opacity 0.2s ease, transform 0.2s ease, max-width 0.2s ease;
      white-space: nowrap;
      display: inline-block;
      overflow: hidden;
      max-width: 200px;
    }

    /* Collapsed: Vertical layout */
    :host.collapsed .theme-switcher {
      padding: 1.5rem 0;
      align-items: center;
    }

    :host.collapsed .theme-track {
      width: 42px;
      height: 82px;
      flex-direction: column;
      padding: 3px;
    }

    :host.collapsed .theme-slider {
      width: 36px;
      height: 36px;
      left: 3px;
      top: 3px;
      transform: translateY(0); /* Default: Top (Light/Sun) */
    }
    
    /* Logic: Light is TOP, Dark is BOTTOM in vertical */
    :host.collapsed .theme-slider.dark {
      transform: translateY(40px) !important;
    }

    :host.collapsed .theme-btn {
      width: 36px;
      height: 36px;
      padding: 0;
      gap: 0;
      z-index: 10;
    }

    :host.collapsed .theme-icon {
      width: 20px;
      height: 20px;
    }

    .theme-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      padding: 0.5rem;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--text-dim);
      cursor: pointer;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.72rem;
      font-weight: 600;
      transition: color 0.25s ease;
      position: relative;
      z-index: 5;
      min-height: 34px;
    }

    .theme-btn.active {
      color: #000000 !important;
      font-weight: 800;
    }

    :host-context([data-theme="dark"]) .theme-btn.active {
      color: var(--theme-brand-neon) !important;
    }

    .theme-btn:not(.active):hover {
      color: var(--text-main);
    }

    .theme-icon {
      width: 17px;
      height: 17px;
      fill: currentColor;
      flex-shrink: 0;
    }

    .hidden {
      display: none !important;
    }

    .theme-label {
      white-space: nowrap;
    }

    /* ── PROFILE CARD ───────────────────────────────── */
    .profile-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.85rem 0;
      margin: 0 -1rem;
      padding-left: 1rem;
      padding-right: 0.75rem;
      border-top: 1px solid var(--border-color);
    }

    :host.collapsed .profile-card {
      justify-content: center;
      padding-left: 0;
      padding-right: 0;
    }

    .avatar {
      width: 34px;
      height: 34px;
      border-radius: 50%;
      background: #8b0000;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.85rem;
      font-weight: 800;
      flex-shrink: 0;
    }

    .profile-info {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .profile-name {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.75rem;
      font-weight: 700;
      color: var(--text-main);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .profile-email {
      font-family: 'JetBrains Mono', monospace;
      font-size: 0.65rem;
      font-weight: 400;
      color: var(--text-dim);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .logout-btn {
      background: transparent;
      border: none;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      transition: background 0.2s ease;
    }

    .logout-btn svg {
      width: 18px;
      height: 18px;
      fill: var(--text-dim);
      transition: fill 0.2s ease;
    }

    .logout-btn:hover {
      background: rgba(255, 60, 60, 0.12);
    }

    .logout-btn:hover svg {
      fill: #ff4444;
    }
  `]
})
export class SidebarComponent {
  private readonly themeService = inject(ThemeService);
  private readonly authService  = inject(AuthService);
  private readonly router       = inject(Router);

  @HostBinding('class.collapsed') get isCollapsed() { return !this.isExpanded; }
  @HostBinding('class.expanded') get isExpandedInternal() { return this.isExpanded; }

  isExpanded = true;
  isDark$ = this.themeService.isDark$;

  get currentUser() { return this.authService.getCurrentUser(); }
  get userName()    { return this.currentUser?.displayName ?? 'Admin Profile'; }
  get userEmail()   { return this.currentUser?.email ?? ''; }
  get userInitial() { return (this.currentUser?.displayName ?? 'A')[0].toUpperCase(); }

  toggle() { this.isExpanded = !this.isExpanded; }

  setTheme(theme: 'light' | 'dark') {
    this.themeService.setTheme(theme);
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
