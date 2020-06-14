/**
 * date-time.class
 */
import { Directive, EventEmitter, Inject, Input, Optional } from '@angular/core';
import { coerceBooleanProperty, coerceNumberProperty } from '@angular/cdk/coercion';
import { DateTimeAdapter } from './adapter/date-time-adapter.class';
import { OWL_DATE_TIME_FORMATS, OwlDateTimeFormats } from './adapter/date-time-format.class';

let nextUniqueId = 0;

export type PickerType = 'both' | 'calendar' | 'timer';

export type PickerMode = 'popup' | 'dialog' | 'inline';

export type SelectMode = 'single' | 'range' | 'rangeFrom' | 'rangeTo';

@Directive()
export abstract class OwlDateTime<T> {
  /**
   * The view that the calendar should start in.
   */
  @Input()
  startView: 'month' | 'year' | 'multi-years' = 'month';

  abstract yearSelected: EventEmitter<T>;
  abstract monthSelected: EventEmitter<T>;
  private readonly _id: string;

  protected constructor(
    @Optional() protected dateTimeAdapter: DateTimeAdapter<T>,
    @Optional()
    @Inject(OWL_DATE_TIME_FORMATS)
    protected dateTimeFormats: OwlDateTimeFormats
  ) {
    if (!this.dateTimeAdapter) {
      throw Error(
        `OwlDateTimePicker: No provider found for DateTimeAdapter. You must import one of the following ` +
        `modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a ` +
        `custom implementation.`
      );
    }

    if (!this.dateTimeFormats) {
      throw Error(
        `OwlDateTimePicker: No provider found for OWL_DATE_TIME_FORMATS. You must import one of the following ` +
        `modules at your application root: OwlNativeDateTimeModule, OwlMomentDateTimeModule, or provide a ` +
        `custom implementation.`
      );
    }

    this._id = `owl-dt-picker-${nextUniqueId++}`;
  }

  /**
   * Whether to show the second's timer
   */
  private _showSecondsTimer = false;

  @Input()
  get showSecondsTimer(): boolean {
    return this._showSecondsTimer;
  }

  set showSecondsTimer(val: boolean) {
    this._showSecondsTimer = coerceBooleanProperty(val);
  }

  /**
   * Whether the timer is in hour12 format
   */
  private _hour12Timer = false;

  @Input()
  get hour12Timer(): boolean {
    return this._hour12Timer;
  }

  set hour12Timer(val: boolean) {
    this._hour12Timer = coerceBooleanProperty(val);
  }

  /**
   * Hours to change per step
   */
  private _stepHour = 1;

  @Input()
  get stepHour(): number {
    return this._stepHour;
  }

  set stepHour(val: number) {
    this._stepHour = coerceNumberProperty(val, 1);
  }

  /**
   * Minutes to change per step
   */
  private _stepMinute = 1;

  @Input()
  get stepMinute(): number {
    return this._stepMinute;
  }

  set stepMinute(val: number) {
    this._stepMinute = coerceNumberProperty(val, 1);
  }

  /**
   * Seconds to change per step
   */
  private _stepSecond = 1;

  @Input()
  get stepSecond(): number {
    return this._stepSecond;
  }

  set stepSecond(val: number) {
    this._stepSecond = coerceNumberProperty(val, 1);
  }

  /**
   * Set the first day of week
   */
  private _firstDayOfWeek: number;

  @Input()
  get firstDayOfWeek() {
    return this._firstDayOfWeek;
  }

  set firstDayOfWeek(value: number) {
    value = coerceNumberProperty(value);
    if (value > 6 || value < 0) {
      this._firstDayOfWeek = undefined;
    } else {
      this._firstDayOfWeek = value;
    }
  }

  /**
   * Whether to hide dates in other months at the start or end of the current month.
   */
  private _hideOtherMonths = false;

  @Input()
  get hideOtherMonths(): boolean {
    return this._hideOtherMonths;
  }

  set hideOtherMonths(val: boolean) {
    this._hideOtherMonths = coerceBooleanProperty(val);
  }

  get id(): string {
    return this._id;
  }

  abstract get selected(): T | null;

  abstract get selecteds(): T[] | null;

  abstract get dateTimeFilter(): (date: T | null) => boolean;

  abstract get maxDateTime(): T | null;

  abstract get minDateTime(): T | null;

  abstract get selectMode(): SelectMode;

  abstract get startAt(): T | null;

  abstract get endAt(): T | null;

  abstract get opened(): boolean;

  abstract get pickerMode(): PickerMode;

  abstract get pickerType(): PickerType;

  abstract get isInSingleMode(): boolean;

  abstract get isInRangeMode(): boolean;

  get formatString(): string {
    return this.pickerType === 'both'
      ? this.dateTimeFormats.fullPickerInput
      : this.pickerType === 'calendar'
        ? this.dateTimeFormats.datePickerInput
        : this.dateTimeFormats.timePickerInput;
  }

  get disabled(): boolean {
    return false;
  }

  abstract select(date: T | T[]): void;

  abstract selectYear(normalizedYear: T): void;

  abstract selectMonth(normalizedMonth: T): void;

  /**
   * Date Time Checker to check if the give dateTime is selectable
   */
  public dateTimeChecker = (dateTime: T) => {
    return (
      !!dateTime &&
      (!this.dateTimeFilter || this.dateTimeFilter(dateTime)) &&
      (!this.minDateTime ||
        this.dateTimeAdapter.compare(dateTime, this.minDateTime) >=
        0) &&
      (!this.maxDateTime ||
        this.dateTimeAdapter.compare(dateTime, this.maxDateTime) <= 0)
    );
  };

  protected getValidDate(obj: any): T | null {
    return this.dateTimeAdapter.isDateInstance(obj) &&
    this.dateTimeAdapter.isValid(obj)
      ? obj
      : null;
  }

  public setToToday() {
    this.select(new Date() as any);
  }

  public setToTomorrow() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    this.select(tomorrow as any);
  }

  public setToNextWeek() {
    const d = new Date();
    d.setDate(d.getDate() + (1 + 7 - d.getDay()) % 7);
    this.select(d as any);
  }

  public setToNone() {
    this.select(null);
  }

}
