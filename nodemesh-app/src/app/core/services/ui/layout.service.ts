import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isExpandedSubject = new BehaviorSubject<boolean>(true);
  isExpanded$ = this.isExpandedSubject.asObservable();

  get isExpanded(): boolean {
    return this.isExpandedSubject.value;
  }

  setExpanded(expanded: boolean) {
    this.isExpandedSubject.next(expanded);
  }

  toggleSidebar() {
    this.isExpandedSubject.next(!this.isExpandedSubject.value);
  }

  collapseSidebar() {
    this.isExpandedSubject.next(false);
  }

  expandSidebar() {
    this.isExpandedSubject.next(true);
  }
}
