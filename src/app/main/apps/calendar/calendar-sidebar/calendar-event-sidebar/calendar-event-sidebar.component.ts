import { Component, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';

import { CoreSidebarService } from '@core/components/core-sidebar/core-sidebar.service';

import { EventRef } from 'app/main/apps/calendar/calendar.model';
import { CalendarService } from 'app/main/apps/calendar/calendar.service';
import {AuthenticationService} from "../../../../../auth/service";

@Component({
  selector: 'app-calendar-event-sidebar',
  templateUrl: './calendar-event-sidebar.component.html',
  encapsulation: ViewEncapsulation.None
})
export class CalendarEventSidebarComponent implements OnInit {
  //  Decorator
  @ViewChild('startDatePicker') startDatePicker;
  @ViewChild('endDatePicker') endDatePicker;

  // Public
  public event: any;
  public isDataEmpty;
  public selectLabel = [
    { label: 'Business', bullet: 'primary' },
    { label: 'Personal', bullet: 'danger' },
    { label: 'Family', bullet: 'warning' },
    { label: 'Holiday', bullet: 'success' },
    { label: 'ETC', bullet: 'info' }
  ];
  public selectGuest = [
    { name: 'Jane Foster', avatar: 'assets/images/avatars/1-small.png' },
    { name: 'Donna Frank', avatar: 'assets/images/avatars/3-small.png' },
    { name: 'Gabrielle Robertson', avatar: 'assets/images/avatars/5-small.png' },
    { name: 'Lori Spears', avatar: 'assets/images/avatars/7-small.png' },
    { name: 'Sandy Vega', avatar: 'assets/images/avatars/9-small.png' },
    { name: 'Cheryl May', avatar: 'assets/images/avatars/11-small.png' }
  ];
  public startDateOptions = {
    altInput: true,
    mode: 'single',
    altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    enableTime: true,
    dateFormat: 'Y-m-d'
  };
  public endDateOptions = {
    altInput: true,
    mode: 'single',
    altInputClass: 'form-control flat-picker flatpickr-input invoice-edit-input',
    enableTime: true,
    dateFormat: 'Y-m-d'
  };
  public isSecretaire: boolean = false;

  /**
   *
   * @param {CoreSidebarService} _coreSidebarService
   * @param {CalendarService} _calendarService
   * @param authService
   */
  constructor(private _coreSidebarService: CoreSidebarService, private _calendarService: CalendarService,private authService: AuthenticationService,) {}

  // Public Methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Toggle Event Sidebar
   */
  toggleEventSidebar() {
    this._coreSidebarService.getSidebarRegistry('calendar-event-sidebar').toggleOpen();
  }

  /**
   * Add Event
   *
   * @param eventForm
   */
  addEvent(eventForm) {
    if (eventForm.valid) {
      //! Fix: Temp fix till ng2-flatpicker support ng-modal (Getting NG0100: Expression has changed after it was checked error if we use ng-model with ng2-flatpicker)
      eventForm.form.value.dateDebut = this.startDatePicker.flatpickrElement.nativeElement.children[0].value;
      eventForm.form.value.dateFin = this.endDatePicker.flatpickrElement.nativeElement.children[0].value;
      console.log(eventForm.form.value)
      this._calendarService.addEvent(eventForm.form.value);
      this.toggleEventSidebar();
    }
  }

  /**
   * Update Event
   */
  updateEvent() {
    this.toggleEventSidebar();
    //! Fix: Temp fix till ng2-flatpicker support ng-modal
    this.event.dateDebut = this.startDatePicker.flatpickrElement.nativeElement.children[0].value;
    this.event.dateFin = this.endDatePicker.flatpickrElement.nativeElement.children[0].value;
    this._calendarService.postUpdatedEvent(this.event);
  }

  /**
   * Delete Event
   */
  deleteEvent() {
    this._calendarService.deleteEvent(this.event);
    this.toggleEventSidebar();
  }

  // Lifecycle Hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    this.isSecretaire = this.authService.currentUserValue.role.includes("SECRETAIRE")
    // Subscribe to current event changes
    this._calendarService.onCurrentEventChange.subscribe(response => {
      this.event = response;

      // If Event is available
      if (Object.keys(response).length > 0) {
        this.event = response;
        this.isDataEmpty = false;
        if (response.id === undefined) {
          this.isDataEmpty = true;
        }
      }
      // else Create New Event
      else {
        this.event = {};

        // Clear Flatpicker Values
        setTimeout(() => {
          this.startDatePicker.flatpickr.clear();
          this.endDatePicker.flatpickr.clear();
        });
        this.isDataEmpty = true;
      }
    });
  }
}
