import { Component, Input, OnChanges, SimpleChanges, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LiquidGlassComponent } from '../../../../shared/components/liquid-glass/liquid-glass.component';
import { UI_ICONS } from '../../../../shared/constants/icons.constants';

@Component({
  selector: 'app-streak-bento',
  standalone: true,
  imports: [CommonModule, LiquidGlassComponent],
  template: `
    <app-liquid-glass [simple]="true" [radius]="20" [depth]="2" [blur]="16" backgroundColor="var(--glass-fill)" style="display: flex; flex-direction: column; height: 100%; width: 100%;">
      <div class="streak-widget-container">
        <div class="streak-header">
          <div class="streak-title-box">
            <svg class="streak-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
              <path d="M223.62,226.42a8,8,0,0,1-10.05,5.2L128,204.39,42.43,231.62a8,8,0,1,1-4.85-15.25l64-20.37-64-20.38a8,8,0,1,1,4.85-15.24L128,187.6l85.57-27.22a8,8,0,1,1,4.85,15.24l-64,20.38,64,20.37A8,8,0,0,1,223.62,226.42ZM68,108c0-20.1,9.77-40.87,28.24-60a156,156,0,0,1,27.57-22.76,8,8,0,0,1,8.38,0C134.47,26.59,188,60.08,188,108a60,60,0,0,1-120,0Zm60,44a16,16,0,0,0,16-16c0-13.57-10-24.46-16-29.79-6,5.33-16,16.22-16,29.79A16,16,0,0,0,128,152ZM84,108a43.83,43.83,0,0,0,12.09,30.24c0-.74-.09-1.49-.09-2.24,0-28,26.44-45.91,27.56-46.66a8,8,0,0,1,8.88,0C133.56,90.09,160,108,160,136c0,.75,0,1.5-.09,2.24A43.83,43.83,0,0,0,172,108c0-32-32.26-58-44-66.34C116.27,50,84,76,84,108Z" fill="currentColor"></path>
            </svg>
            <span class="streak-title">Sistema de Rachas</span>
          </div>
          <div class="streak-kpis">
            <span class="kpi-streak-value">{{ streak }}</span>
            <span class="material-symbols-rounded neon-text" style="font-size: 1.5rem;">local_fire_department</span>
          </div>
        </div>
        
        <div class="streak-week-grid scroll-hide">
          <div class="streak-day" *ngFor="let day of weekDays" 
               [class.active]="day.status === 'active'" 
               [class.frozen]="day.status === 'frozen'" 
               [class.empty]="day.status === 'empty'">
            <span class="day-label">{{ day.label }}</span>
            <div class="day-icon-wrapper">
              <!-- ICON FOR ACTIVE -->
              <span class="icon-active" *ngIf="day.status === 'active'">
                <svg id="Capa_2" data-name="Capa 2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 393.61 519.23" style="width: 100%; height: 100%;">
                  <defs>
                    <style>
                      .streak-svg-cls-1 { fill: #fdeb95; transition: fill 0.3s ease; }
                      .streak-svg-cls-2 { fill: #c98039; transition: fill 0.3s ease; }
                      .streak-svg-cls-3 { fill: #fb8715; transition: fill 0.3s ease; }
                      .streak-svg-cls-4 { fill: #fdaf32; transition: fill 0.3s ease; }
                      .streak-svg-cls-5 { fill: #f35b01; transition: fill 0.3s ease; }
                      .streak-svg-cls-6 { fill: #fcf2c0; transition: fill 0.3s ease; }
                      .streak-svg-cls-7 { fill: #fcb130; transition: fill 0.3s ease; }
                      .streak-svg-cls-8 { fill: #fcc430; transition: fill 0.3s ease; }
                      .streak-svg-cls-9 { fill: #fd9f2f; transition: fill 0.3s ease; }
                      .streak-svg-cls-10 { fill: #cb9e68; transition: fill 0.3s ease; }
                      .streak-svg-cls-11 { fill: #eacc65; transition: fill 0.3s ease; }
                      .streak-svg-cls-12 { fill: #fdb232; transition: fill 0.3s ease; }
                      .streak-svg-cls-13 { fill: #fedb6b; transition: fill 0.3s ease; }
                      .streak-svg-cls-14 { fill: #fae685; transition: fill 0.3s ease; }
                      
                      :host-context([data-theme="light"]) .streak-svg-cls-1 { fill: #e8a515; }
                      :host-context([data-theme="light"]) .streak-svg-cls-2 { fill: #9e5b1d; }
                      :host-context([data-theme="light"]) .streak-svg-cls-3 { fill: #d16104; }
                      :host-context([data-theme="light"]) .streak-svg-cls-4 { fill: #db8a16; }
                      :host-context([data-theme="light"]) .streak-svg-cls-5 { fill: #c44700; }
                      :host-context([data-theme="light"]) .streak-svg-cls-6 { fill: #edd668; }
                      :host-context([data-theme="light"]) .streak-svg-cls-7 { fill: #d68f1c; }
                      :host-context([data-theme="light"]) .streak-svg-cls-8 { fill: #d99e1c; }
                      :host-context([data-theme="light"]) .streak-svg-cls-9 { fill: #de7e18; }
                      :host-context([data-theme="light"]) .streak-svg-cls-10 { fill: #9e7545; }
                      :host-context([data-theme="light"]) .streak-svg-cls-11 { fill: #c2a13a; }
                      :host-context([data-theme="light"]) .streak-svg-cls-12 { fill: #d98f1a; }
                      :host-context([data-theme="light"]) .streak-svg-cls-13 { fill: #deaf31; }
                      :host-context([data-theme="light"]) .streak-svg-cls-14 { fill: #d6bd4b; }
                    </style>
                  </defs>
                  <g id="Capa_1-2" data-name="Capa 1">
                    <g>
                      <path class="streak-svg-cls-1" d="M376.66,238.06c-6.25-15.97-21.35-47.49-35.3-64.08-.15-.17-.29-.36-.44-.55-1.87-2.38-6.82-8.7-15.8-8.7-.77,0-1.55.05-2.32.15-7,.9-12.24,6.85-12.24,13.91v19.03c-.61,2.99-3.39,11.75-4.36,13.95-.92,1.98-2.79,4.73-4.85,7.25-.33-6.01-.5-12.84-.6-17.16-.15-6.19-.27-11.08-.59-14.21-6.46-63.38-38.78-120.54-91.01-160.97-2.65-2.05-11.3-8.24-20.2-13.92C172.37,2.17,165.46,0,160.2,0c-4.28,0-8.24,1.58-11.15,4.44-3.57,3.51-5,8.67-3.74,13.52.74,2.84,1.5,5.67,2.27,8.49,3.86,14.24,7.51,27.68,6.86,41.4-1.48,31.16-17.32,51.97-34.09,73.99-14.58,19.15-29.67,38.96-36.32,66.2-1.61,6.59-2.49,13.09-3.17,19.44-1.87-5.53-3.5-12.81-3.85-17.48-.06-1.6.46-7.29.78-10.69,1.12-12.12,1.58-17.14-3.5-22.22-2.81-2.81-6.65-4.36-10.83-4.36-4.45,0-9.09,1.71-12.42,4.59-10.89,9.41-31.12,53.49-31.3,53.92C6.28,262.74-.35,294.82.01,326.59c.36,31.32,7.48,60.7,21.16,87.32,26.24,51.08,74.49,86.72,135.87,100.37.46.11.91.21,1.34.29,9.35,2.04,16.62,3.23,25.05,4.11,3.51.37,7.17.54,11.19.54,4.4,0,8.7-.21,12.86-.42l1.36-.07c13.49-.66,21.4-2.63,32.18-5.36,1-.17,1.97-.41,2.91-.74,57.95-14.92,103.58-49.87,128.57-98.48,13.16-25.6,20.23-53.86,21.02-84,.8-30.46-4.88-61.44-16.87-92.1Z"/>
                      <path class="streak-svg-cls-5" d="M160.24,500.63C35.07,472.9-17.02,352.98,32.63,236.75c3.92-9.18,21.26-43.36,27.57-48.82,1.21-1.05,3.59-1.49,4.16-.93.85.85-1.7,19.08-1.34,23.94.54,7.45,3.25,18.41,6.17,25.33,2.3,5.44,15.8,27.98,22.47,18.4,2.76-14.32,2.52-29.08,5.99-43.31,13.48-55.19,67.77-79.19,70.8-142.86.9-18.87-4.91-36.18-9.56-54.08,3.85-3.78,36.81,19.54,41.71,23.33,47.96,37.11,79.44,90.39,85.64,151.3.9,8.8.11,43.97,4.14,47.89,9.42,9.15,25.08-11.76,28.57-19.32,1.44-3.12,5.65-16.33,5.65-19v-19.86c2.92-.38,4.45,2.33,6.05,4.23,11.88,14.13,26.16,42.75,32.97,60.16,44.13,112.81-5.06,225.94-123.93,256.1-4.05,1.23-6.33.77-6.85-1.37,30.1-15.56,56.07-31.02,77.89-57.92,19.69-24.29,33.5-54.14,37.12-84.93l2.78-2.33c2.04-35.08-4.9-71.37-18.45-102.4-29.96,38.47-77.07,22.13-79.33-26.77-.83-49.68-16.77-98.45-55.7-131.87,3.21,28.25-1.46,54.95-19.72,77.82l-30.04,37.81c-14.13,16.68-20.74,36.19-26.53,56.52-9.25,31.61-48.09,29.61-65.8,6.45-6.62,16.09-9.33,33.51-10.87,50.78l-1.73,2.9c-1.28,6.3-1.2,12.86,0,19.17.95.55.95,1.92,0,4.11l2.71,2.58c3.13,32.18,16.27,63.3,36.82,88.8,23.25,28.85,51.92,44.97,83.73,62.01-1.39.57-3.21.57-5.48,0Z"/>
                      <path class="streak-svg-cls-6" d="M158.87,385.59l2.92-.46c3.92,5.53,6.19,3.96,6.68-2.65.48-20.46,7.26-37.74,22.33-52.38,15.4-14.97,19.3-11.1,15.99,8.06,3.21,15.09,9.8,29.41,19.75,42.97,1.4,2.13,1.31,3.87-.56,5.82,2.73,6.72,5.24,4.02,8.22-1.37-5.43-2.35-3.08-12.71,4.32-12.01,4.87.46,17.71,27.91,19.36,32.63,12.96,37.14.96,75.37-34.63,93.05.16,3.51-16.02,5.35-16.43,4.12-.04-.13,1.97-.05,1.37,1.35-7.82.38-15.33.83-23.28,0-.81-.9.07-1.3,2.61-1.21-5.61-.07-17.29-.28-19.05-5.64-34.72-14.74-43.56-52.58-33.88-86.52,2.67-9.36,7.41-24.64,16.08-28.53,6.19-8.56,6.9-5.54,8.22,2.74Z"/>
                      <path class="streak-svg-cls-2" d="M228.72,497.89c2.12-1.01,3.49-1.01,4.11,0,1.3.16,4.23,2.61,6.85,1.37-12.05,3.06-18.92,4.87-31.5,5.48l-1.37-1.35c5.72-.31,10.93-3,16.43-4.12,2.49-2.47,4.32-2.92,5.48-1.37Z"/>
                      <path class="streak-svg-cls-10" d="M168.46,497.89c4.6,2.71,14.39,5.16,19.85,5.48l-3.41,1.37c-8.88-.92-16.07-2.21-24.65-4.11,1.73-.21,3.88.31,5.48,0-.15-1.18.76-1.64,2.74-1.37-.77-.41-.76-.87,0-1.37Z"/>
                      <path class="streak-svg-cls-3" d="M42.46,347.24c.13-24.88,3.85-49.12,11.18-72.72l3.93.05c22.84,18.06,48.51,22.73,61.86-7.14,8.38-36.13,28.51-63.57,53.09-91.35,11.86-15.41,22.76-32.61,24.79-52.33l2.65-3.18c-3.33-.16-2.69-19.68-1.83-20.35.52-.4,1.16-.66,1.83-.88,1-.03,1.99-.02,2.95.18,7.05,1.46,23.01,25.52,27.28,32.93,16.92,29.42,21.25,59.33,22.77,92.03,2.29,44.36,44.73,65.97,76.03,30.61,1.36-.92,4.5-1.02,5.36.07,4.86,6.16,11.83,38.22,13.47,47.81,2.8,16.4,3.73,33.14,2.8,49.74.07,5.88-1.1,10.56-2.3,16.18-12.48,58.3-58.69,110.57-115.48,128.99-.22-.03-3.88-.02-4.11,0l.69-2.31c32.8-21.14,63.38-53.1,65.08-94.12l2.71-3.55c-1.04-36.72-12.2-73.23-36.91-100.47,1.78,5.35-6.19,37.61-14.94,30.69-4.11-18.6-12.53-35.66-25.27-51.19-13.08-18.36-13.55-41.46-10.88-62.4-31.44,22.39-49.17,57.92-50.96,96.28-6.45,26.74-27.18,2.16-24.27-14.65-19.82,22.07-29.82,50.01-36.73,78.46.66,7.8,1.1,15.93,1.32,24.37,3.16,44.66,34.15,76.89,69.9,100.26-.18,1.67-1.65,1.16-2.74,1.37-58.05-20.62-105.56-68.03-119.59-128.99-1.77-7.68-4.03-16.59-3.67-24.4Z"/>
                      <path class="streak-svg-cls-9" d="M42.46,323.95c.76-20.05,4.82-38.53,10.97-57.52,2.12-1.54,12.92,11.53,15.96,13.47,10.21,6.51,28.83,6.39,38.73-.55,13.54-9.49,13.82-28.87,19.58-43.42,17.93-45.29,63.4-65.89,67.98-119.65.8-9.42-1.48-17.67-1.25-25.81.06-2.07-.9-4.03,2.09-3.45,30.16,26.03,49.91,62.5,55.29,102.22,2.93,21.65-.39,47.45,13.92,65.51,15.67,19.78,38.98,17.6,56.84,2.12,2.81-2.43,8.42-11.78,11.59-9.62,1.42.96,9.55,28.54,10.59,32.57,6.01,23.45,9.22,48.75,5.87,72.88-.22-17.4-2.15-39.02-5.86-56.46-2.83-13.34-7.89-26.43-11.96-39.41-2.03-1.49-8.27,6.69-10.29,8.18-14.05,10.4-28.41,14.18-44.99,6.71-30.62-13.81-25.34-57.82-30.02-85.02-5.56-32.29-22.93-65.85-47.53-87.37v21.23c0,41.93-50.07,78.35-66.94,113.84-13.87,29.18-11.74,69.76-60.48,53.3l-17.75-11.69c-7.38,22.53-9.26,44.4-10.93,67.89-.13,1.83-1.4,3.15-1.41,3.33v-4.11c-1.2-6.33-1.27-12.85,0-19.17Z"/>
                      <path class="streak-svg-cls-3" d="M42.46,343.13c-2.28-4.59-2.32-14.3,0-19.17-.24,6.34,0,12.82,0,19.17Z"/>
                      <path class="streak-svg-cls-7" d="M326.99,280.48c2.1,2.28,6.45,20.97,7.06,25.13,2.42,16.35,3.44,47.72-6.93,61.27-5.55,7.25-7.22,1.44-7.99-5.26-1.24-10.76,1.1-23.62-.17-35.44-1.19-11.07-8.02-29.09-7.81-38.56.2-8.76,10.4-13.04,15.84-7.14Z"/>
                      <path class="streak-svg-cls-12" d="M232.84,181.52c-1.85-.28-5.37.64-6.67-.18-1.02-.64-6.34-18.83-8.15-22.67-2.92-6.19-17.6-23.72-8.07-28.23,7.1-3.37,15.52,14.44,17.68,19.99,3.83,9.83,5.84,20.45,5.22,31.09Z"/>
                      <path class="streak-svg-cls-4" d="M232.42,191.32c8.24-2.35,9.62,13.85,3.66,17.5-6.49,1.89-10.97-15.42-3.66-17.5Z"/>
                      <path class="streak-svg-cls-8" d="M97.24,374.63l1.14-.05c.17-14.64,21.55-70.92,33.42-73.83.41-.1,1,.49,1.63,1.29,1.85,14.62,18.37,33.24,24.66,9.54,2.29-23.73,6.11-41.81,18.81-62.22,3.21-5.16,23.37-31.3,29.67-28.84.7.27,1.35.7,1.97,1.18-4.77,29.14,7.43,52.21,24.51,74.63,4.01,6.25,7.52,12.87,9.59,20.04,1.04,28.98,17.43,2.27,16.84-10.86.39-1.39,1.25-3.6,2.32-3.53,5.59.37,15.22,18.52,18.26,24.4,11.65,22.59,16.02,46.48,17.14,71.53,1.37,41.39-33.58,81.71-68.48,99.98-1.74.12-3.7,1.01-5.48,1.37,2.91-4.53,8.44-6.75,12.34-10.26,30.71-27.55,30.99-66.96,10.67-101.09-1.05-1.76-7.93-11.74-8.64-11.91-4.58-1.13-3.01,7.51-3.41,9.59-2.87,5.76-6.01,10.28-8.22,1.37-6.37-17.71-21.07-28.33-21.93-48.68-.23-5.43,2.44-10.42.69-15.7-14.41,8.72-27.64,25.92-31.55,42.41-1.3,5.49-1.34,22.06-4.01,24.74-3.9,3.92-8.31-.52-10.31-4.13-.65-7.03-3.76-8.81-8.22-2.74-24.93,38.27-25.3,89.62,17.8,115.05v1.37c-46.95-23.8-77.17-66.92-72.64-121.32.15-1.8,1.38-2.98,1.42-3.32Z"/>
                      <path class="streak-svg-cls-11" d="M234.2,385.59c-.6,3.14-1.26,8.11-4.81,9.57-3.12,1.28-2.83-6.6-3.4-8.21,2.56,5.73,4.48.9,8.22-1.37Z"/>
                      <path class="streak-svg-cls-14" d="M150.66,382.85c.53-.82,4.36-10.68,6.83-8.22.43.43,1.62,9.2,1.38,10.96-1.06-1.92-1.87-3.03-1.38-5.49-2.84-.45-4.74,1.12-6.84,2.75Z"/>
                      <path class="streak-svg-cls-13" d="M97.24,374.63c3.08-24.85,12.22-48.32,26.27-68.91,1.13-1.66,11.28-17.08,13.44-14.63.16,7.58-1.18,15.58,2.95,22.39,4.29,7.07,13.69,9.66,15.94-.08,2.42-10.46,1.6-22.57,4.48-33.87,5.46-21.42,28.88-57.45,48.51-67.9,1.65-.88,2.6-1.87,4.82-1.33-3.72,15.61-4.93,28.38-.95,44.1,6.7,26.46,32.48,43.19,33.85,72.31,12.22-5.8,11.04-22.6,10.95-34.23,2.3-2.68,13.22,13.59,14.26,15.17,17.17,26.23,27.73,58.69,25.45,90.28,0-.18-1.32-1.55-1.43-3.31-2.08-33.82-11.52-65.63-34.17-91.19.25,7.97-4.83,28.22-14.52,28.78-7.33.42-5.2-10.46-6.62-15.18-6.12-20.23-24.05-35.16-30.97-55.32-4.27-12.43-5.43-26.14-2.69-39.08-2.22-2.33-19.9,17.44-21.87,19.89-20.17,25.15-19.14,40.22-25.05,69.45-5.44,26.93-28.01,9.19-27.71-9.91-18.31,22.22-29.21,49.64-33.58,78.05l-1.35-5.47Z"/>
                      <path class="streak-svg-cls-1" d="M266.68,336.47c7.5-2.1,11.01,11.35,12.74,16.91,1.38,4.44,6.6,21.71.5,23.84-9.49,3.32-7.49-8.49-9.11-13.87-1.79-5.94-12.69-24.49-4.13-26.88Z"/>
                      <path class="streak-svg-cls-6" d="M262.03,336.69v-22.01c0-5.11-4.14-9.25-9.25-9.25h-30.83c-2.43,0-4.76.96-6.5,2.66l-21.7,21.39c-.66.65-1.2,1.38-1.63,2.17-6.36-6.46-14.16-14.32-23.38-23.52-1.73-1.73-4.09-2.71-6.54-2.71,0,0-20.2,0-20.2,0-5.11,0-9.25,4.14-9.25,9.25v44.11c.01,4.71.02,9.43.02,14.14,0,4.84,0,9.68-.01,14.52,0,3.35,1.79,6.41,4.65,8.05l-1.85,1.79c-1.8,1.74-2.81,4.13-2.81,6.63l-.03,21.82c0,2.45.97,4.81,2.71,6.55s4.09,2.71,6.55,2.71h30.82c2.43,0,4.76-.95,6.49-2.66l9.32-9.18s12.4-12.54,12.4-12.54c.62-.62,1.13-1.31,1.53-2.05.86.86,1.72,1.73,2.58,2.59,4.26,4.27,8.51,8.54,12.79,12.82l1.83,1.83c.96.96,2,2.01,3.3,3.29l.96.94c.8.79,1.59,1.56,2.35,2.31,1.73,1.69,4.05,2.63,6.47,2.63h19.93c5.11,0,9.25-4.15,9.25-9.26v-47.01c-.02-8.21-.04-16.71-.01-25.08v-.39c0-3.37-1.83-6.44-4.71-8.06l1.94-1.89c1.79-1.74,2.8-4.13,2.8-6.63Z"/>
                      <path class="streak-svg-cls-5" d="M252.75,381.98v43.77h-13.76s-6.17,0-6.17,0c-1.06-1.04-2.16-2.12-3.29-3.23-2.1-2.08-3.56-3.56-5.09-5.09-9.78-9.79-19.54-19.62-29.33-29.4-5.81-5.82-11.65-11.63-17.5-17.4-1.27-1.25-2.51-2.72-3.82-3.99-2.83-2.75-5.93-4.51-10.06-.88-3.12,2.74-5.9,6.28-9.02,9.04l-12.7,12.67c.01-4.85.01-9.7.01-14.54,0-4.72-.01-9.44-.02-14.16v-44.09c6.73,0,13.46,0,20.2,0,21.68,21.66,32.08,32.35,37.44,38.03,6.07,6.43,12.92,12.14,18.68,18.86.04.04,1.16,1.09,2.64,2.52,2.83,2.74,5.93,4.51,10.06.88,3.12-2.74,5.9-6.28,9.03-9.04l12.69-12.67v.39c-.03,9.44,0,18.88.01,28.32ZM221.95,314.69c-7.23,7.13-14.47,14.26-21.7,21.39,6.89,6.94,13.78,13.87,20.68,20.81,1.82,1.83,3.63,3.65,5.45,5.48,8.8-8.56,17.6-17.12,26.4-25.68v-22.01h-30.82ZM168.59,378.12c-1.73,1.67-3.47,3.33-5.2,5l-4,3.98c-5.79,5.62-11.59,11.23-17.38,16.85,0,7.27-.02,14.54-.02,21.82h30.82l9.32-9.18,12.31-12.45c-8.62-8.67-17.23-17.34-25.85-26.01Z"/>
                    </g>
                  </g>
                </svg>
              </span>
              
              <!-- ICON FOR FROZEN -->
              <img *ngIf="day.status === 'frozen'" src="streak-frozen.svg" class="icon-frozen-svg" />
              
              <!-- ICON FOR EMPTY -->
              <svg *ngIf="day.status === 'empty'" viewBox="0 0 387.2 513.19" class="icon-custom-empty">
                <path [attr.d]="UI_ICONS.streak_empty_p1" class="empty-p1"></path>
                <path [attr.d]="UI_ICONS.streak_empty_p2" class="empty-p2"></path>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </app-liquid-glass>
  `,
  styles: [`
    .streak-widget-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
      overflow: hidden;
    }
    
    .streak-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.2rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    :host-context([data-theme="light"]) .streak-header {
      border-bottom-color: rgba(0,0,0,0.08);
    }

    .streak-title-box {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--theme-text-secondary);
      font-family: 'JetBrains Mono', monospace;
    }
    :host-context([data-theme="light"]) .streak-title-box {
      color: #333;
    }

    :host {
      --streak-active-glow: rgba(255, 140, 0, 0.5);
      --streak-active-glow-bright: rgba(255, 120, 0, 0.7);
      --streak-frozen-glow: rgba(56, 189, 248, 0.4);
      --streak-frozen-glow-bright: rgba(56, 189, 248, 0.65);
    }

    :host-context([data-theme="light"]) {
      --streak-active-glow: rgba(200, 100, 0, 0.3);
      --streak-active-glow-bright: rgba(220, 110, 0, 0.45);
      --streak-frozen-glow: rgba(30, 120, 200, 0.3);
      --streak-frozen-glow-bright: rgba(40, 140, 220, 0.45);
    }

    .streak-icon {
      width: 22px;
      height: 22px;
      opacity: 0.8;
      animation: campfireFlicker 3.5s infinite ease-in-out;
      transform-origin: bottom center;
    }

    .streak-title {
      font-size: 0.95rem;
      font-weight: 600;
      letter-spacing: -0.3px;
      opacity: 0.8;
    }

    .streak-kpis {
      display: flex;
      align-items: center;
      gap: 0.4rem;
    }

    .kpi-streak-value {
      font-size: 1.6rem;
      font-weight: 800;
      color: var(--theme-text);
      font-family: 'JetBrains Mono', monospace;
      line-height: 1;
    }

    .streak-week-grid {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      width: 100%;
      margin-top: auto;
      gap: 1.2rem;
      overflow-x: auto;
      padding: 1.2rem;
    }
    
    .scroll-hide::-webkit-scrollbar { display: none; }
    .scroll-hide { -ms-overflow-style: none; scrollbar-width: none; }

    .streak-day {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.6rem;
      flex-shrink: 0;
      min-width: 45px;
    }

    .day-label {
      font-size: 0.7rem;
      font-weight: 800;
      color: var(--theme-text-secondary);
      opacity: 0.5;
    }

    .day-icon-wrapper {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 42px;
      height: 42px;
      background: transparent;
      border: none;
      transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    }
    
    .day-icon-wrapper:hover {
      transform: scale(1.1);
    }

    .streak-day.active .day-icon-wrapper {
      animation: activeFlameDance 2.5s infinite ease-in-out;
      transform-origin: bottom center;
    }

    .streak-day.frozen .day-icon-wrapper {
      color: #38bdf8;
      animation: frozenCrystalFloat 4s infinite ease-in-out;
      transform-origin: center center;
    }

    .streak-day.empty .day-icon-wrapper {
      opacity: 0.85;
    }

    .icon-active {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .icon-active svg { width: 100%; height: 100%; }

    .icon-frozen-svg {
      width: 52px;
      height: 52px;
      object-fit: contain;
      transition: filter 0.3s ease;
    }
    
    .icon-custom-empty {
      width: 38px;
      height: 38px;
      transition: transform 0.3s ease;
    }

    /* Empty SVG fill colors - dark mode */
    .empty-p1 { fill: #fdeb95; transition: fill 0.3s ease; }
    .empty-p2 { fill: #fcf2c0; transition: fill 0.3s ease; }

    /* Empty SVG fill colors - light mode (darker so visible on white) */
    :host-context([data-theme="light"]) .empty-p1 { fill: #c4a040; }
    :host-context([data-theme="light"]) .empty-p2 { fill: #d4b050; }

    :host-context([data-theme="light"]) .kpi-streak-value { color: #1e293b; }
    :host-context([data-theme="light"]) .day-label { color: #64748b; }

    /* Keyframes for Active Fire */
    @keyframes activeFlameDance {
      0% {
        transform: scale(1) rotate(0deg);
        filter: drop-shadow(0 0 10px var(--streak-active-glow));
      }
      25% {
        transform: scale(1.04) rotate(-1.5deg);
        filter: drop-shadow(0 0 15px var(--streak-active-glow-bright)) drop-shadow(0 0 20px rgba(251, 135, 21, 0.25));
      }
      50% {
        transform: scale(0.97) rotate(1deg);
        filter: drop-shadow(0 0 8px var(--streak-active-glow));
      }
      75% {
        transform: scale(1.05) rotate(-0.5deg);
        filter: drop-shadow(0 0 17px var(--streak-active-glow-bright)) drop-shadow(0 0 25px rgba(251, 135, 21, 0.3));
      }
      100% {
        transform: scale(1) rotate(0deg);
        filter: drop-shadow(0 0 10px var(--streak-active-glow));
      }
    }

    /* Keyframes for Frozen Crystal Floating */
    @keyframes frozenCrystalFloat {
      0% {
        transform: translateY(0px) scale(1);
        filter: drop-shadow(0 0 8px var(--streak-frozen-glow));
      }
      50% {
        transform: translateY(-4px) scale(1.04);
        filter: drop-shadow(0 0 15px var(--streak-frozen-glow-bright)) drop-shadow(0 0 20px rgba(56, 189, 248, 0.2));
      }
      100% {
        transform: translateY(0px) scale(1);
        filter: drop-shadow(0 0 8px var(--streak-frozen-glow));
      }
    }

    /* Keyframes for Campfire flicker */
    @keyframes campfireFlicker {
      0%, 100% {
        opacity: 0.75;
        transform: scale(1);
      }
      30% {
        opacity: 0.95;
        transform: scale(1.05) rotate(-1deg);
      }
      60% {
        opacity: 0.7;
        transform: scale(0.96) rotate(1deg);
      }
      80% {
        opacity: 0.9;
        transform: scale(1.03) rotate(-0.5deg);
      }
    }
  `]
})
export class StreakBentoComponent implements OnChanges {
  @Input() activityData: { date: string, count: number }[] = [];
  
  private readonly cdr = inject(ChangeDetectorRef);
  protected readonly UI_ICONS = UI_ICONS;

  streak: number = 0;
  weekDays: any[] = [];

  ngOnChanges(changes: SimpleChanges) {
    if (changes['activityData']) {
      this.calculateStreak();
    }
  }

  private calculateStreak() {
    if (!this.activityData || this.activityData.length === 0) return;

    let currentStreak = 0;
    const sortedActivity = [...this.activityData].reverse();
    const todayStr = (() => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    })();

    for (const day of sortedActivity) {
      if (day.count > 0) currentStreak++;
      else if (day.date === todayStr) continue;
      else break;
    }
    this.streak = currentStreak;

    // Calcular la semana de racha (Lunes a Domingo)
    const today = new Date();
    const dayOfWeek = today.getDay() === 0 ? 6 : today.getDay() - 1; 
    
    const weekLabels = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
    this.weekDays = weekLabels.map((label, index) => {
      const date = new Date(today);
      date.setDate(today.getDate() - dayOfWeek + index);
      
      const yyyy = date.getFullYear();
      const mm = String(date.getMonth() + 1).padStart(2, '0');
      const dd = String(date.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${mm}-${dd}`;
      
      const todayYyyy = today.getFullYear();
      const todayMm = String(today.getMonth() + 1).padStart(2, '0');
      const todayDd = String(today.getDate()).padStart(2, '0');
      const todayString = `${todayYyyy}-${todayMm}-${todayDd}`;
      
      const activityForDay = this.activityData.find(d => d.date === dateString);
      const count = activityForDay ? activityForDay.count : 0;
      
      let status = 'empty';
      if (count > 0) {
        status = 'active';
      } else if (dateString < todayString) {
        status = 'frozen';
      } else {
        status = 'empty';
      }
      return { label, status, date: dateString };
    });

    this.cdr.detectChanges();
  }
}
