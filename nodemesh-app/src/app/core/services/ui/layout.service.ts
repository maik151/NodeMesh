import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private isExpandedSubject = new BehaviorSubject<boolean>(true);
  isExpanded$ = this.isExpandedSubject.asObservable();

  private quizActiveSubject = new BehaviorSubject<boolean>(false);
  isQuizActive$ = this.quizActiveSubject.asObservable();

  get isExpanded(): boolean {
    return this.isExpandedSubject.value;
  }

  get isQuizActive(): boolean {
    return this.quizActiveSubject.value;
  }

  setExpanded(expanded: boolean) {
    this.isExpandedSubject.next(expanded);
  }

  setQuizActive(active: boolean) {
    this.quizActiveSubject.next(active);
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
