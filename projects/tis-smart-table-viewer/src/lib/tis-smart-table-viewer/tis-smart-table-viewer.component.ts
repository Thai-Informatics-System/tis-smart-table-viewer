import { CdkColumnDef } from '@angular/cdk/table';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject, takeUntil, tap, Observable, map, shareReplay, distinctUntilChanged, debounceTime } from 'rxjs';
import { AnyKeyValueObject, SelectedFilterDisplayValuesType, SelectedFilterDisplayValueType, SelectedFiltersGroupedValuesType, SmartTableWrapperColumnsConfig, SmartTableWrapperRowsConfig } from '../interfaces';
import { SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiDataSource } from '../datasources/api.datasource';
import { ApiService } from '../services/api.service';
import { MatCheckbox, MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DateTime } from "luxon";
import * as storageHelper from '../helpers/storage-helper';
import { Location } from '@angular/common';

@Component({
  selector: 'tis-smart-table-viewer',
  standalone: false,
  templateUrl: './tis-smart-table-viewer.component.html',
  styleUrl: './tis-smart-table-viewer.component.css',
  providers: [CdkColumnDef],
})
export class TisSmartTableViewerComponent {
  homeUrl = '';

  @Input({ required: true }) t: any = {};
  @Input({ required: true }) componentName = '';
  @Input({ required: true }) mainTitle!: string;
  @Input() searchPlaceholder!: string;
  @Input() breadcrumbs: { url: string, name: string }[] = [];
  @Input() hideHeader = false;
  @Input() hideTableHeader = false;
  @Input() hidePaginator = false;
  @Input() keepFilterInUrl = true;
  @Input() displayColumnsSelectionButton = true;
  @Input() loadDataApiBaseUrl!: string;
  @Input() startStickyColumnCount!: number;
  @Input() endStickyColumnCount!: number;
  @Input() loaderPosition: 'top' | 'bottom' = 'top';
  @Input({ required: true }) dataNotFoundConfig = {
    title: 'No Data Found',
    desc: 'There is no data. Please click on button to add',
    btnText: 'Add New',
    btnUrl: '',
    btnClick: null,
    secondBtnText: '',
    secondBtnUrl: '',
    secondBtnClick: null
  };
  @Input() showFilterButtonSection!: boolean;

  @Input({ required: true }) columnsCodeMapping!: SmartTableWrapperColumnsConfig[];
  autoRenderColumns!: SmartTableWrapperColumnsConfig[];
  templateRenderColumns!: SmartTableWrapperColumnsConfig[];

  @Input() defaultDisplayedColumns!: string[];
  displayedColumns!: string[];
  defaultColumns!: string[];
  columns!: string[];

  @Output() displayedColumnsChange = new EventEmitter<string[]>();
  usersColumnSelectionDetail: any;

  @Input() defaultSortObj: any = {};
  sortObj: any = {};
  @Output() sortObjChange = new EventEmitter<AnyKeyValueObject>();

  @Input() loadingSpinnerDiameter = 30;
  @Input() pageSizeOptions = [5, 10, 25, 100];

  @Input() pageSize = 10;
  @Output() pageSizeChange = new EventEmitter<number>();
  @Input() useGlobalPageSize = true;

  @Input() pageIndex = 0;
  @Output() pageIndexChange = new EventEmitter<number>();

  @Input() filterFormGroup: FormGroup = new FormGroup({});

  @Input() rowsConfig: SmartTableWrapperRowsConfig = {
    backgroundApplyFunction: () => null // Default blank function
  }; 

  selectedFilterValues: SelectedFilterDisplayValuesType = [];
  finalSelectedFilterValuesToDisplay: SelectedFilterDisplayValuesType = [];
  selectedFilterGroupedValues: SelectedFiltersGroupedValuesType[] = [];
  isShowFilter = false;
  filterFormGroupSubscription!: Subscription;
  filterHasNonEmptyValue = false;

  filterApplied = false;
  resetFlag = false;
  initialLoading = true;

  filterFromQueryParams: any = {};
  sortFromQueryParams: any = {};

  search = '';
  searchCtrl = new FormControl();
  private _onDestroy = new Subject<void>();

  dataSource!: ApiDataSource;

  private _sort!: MatSort;
  private _sortSubscription!: Subscription;
  @ViewChild(MatSort) set sort(value: MatSort) {
    this._sort = value;
    if (this._sort) {

      if (this._sortSubscription) {
        this._sortSubscription.unsubscribe();
      }

      this._sortSubscription = this._sort.sortChange.pipe(
        takeUntil(this._onDestroy),
      ).subscribe((ch) => {
        this.handleSortingChanges(ch);
      });
    }
  }

  private _paginator!: MatPaginator;
  private _paginatorSubscription!: Subscription;
  @ViewChild(MatPaginator) set paginator(value: MatPaginator) {
    this._paginator = value;
    if (this._paginator) {

      if (this._paginatorSubscription) {
        this._paginatorSubscription.unsubscribe();
      }

      this._paginatorSubscription = this._paginator.page.pipe(
        takeUntil(this._onDestroy),
        tap(() => {
          this.onPaginationChanges();
        })
      ).subscribe();
    }
  }


  loadingSubscription!: Subscription;
  dataLengthSubscription!: Subscription;

  @Input() enableRowsSelection = false;
  @Input() enableAllRowsSelection = false;
  @Input() onlySingleSelection = false;
  @Input() selectedRows!: any[];
  @Output() selectedRowsChange = new EventEmitter<any>();

  selection = new SelectionModel<any>(true, []);
  selectedIds: Set<number | string> = new Set();
  isAllRowsSelected = false;


  @Input() enableDragNDrop = false;
  @Output() listDataSequenceChange = new EventEmitter<any>();

  isHandset$!: Observable<boolean>;
  isMobile: boolean = false;

  constructor(
    // private userCustomizationService: UserCustomizationService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private breakpointObserver: BreakpointObserver
  ) {
    this.selection.changed.subscribe(change => {
      change.added.forEach(item => this.selectedIds.add(item['id']));
      change.removed.forEach(item => this.selectedIds.delete(item['id']));
    });

  }

  

  ngOnInit(): void {

    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(
      map(result => {
        console.log("== result ==", result);
        return result.matches;
      }),
      shareReplay()
    );

    this.isHandset$.subscribe(r => {
      console.log('IS HANDSET:', r);
      this.isMobile = r;
    });

    this.setDefaultColumns();

    this.getHomeUrl();

    this.route.queryParams.subscribe(qp => {
      this.filterFromQueryParams = {};
      this.sortFromQueryParams = {};

      if (this.keepFilterInUrl) {
        for (const key in qp) {
          if (qp.hasOwnProperty(key) && qp[key] && qp[key] != '' && qp[key] != 'null' && qp[key] != 'undefined') {

            let fixedKeyMatched = false;

            if (key.toLowerCase() === 'pageIndex'.toLowerCase()) {
              this.pageIndex = Number(qp[key]);
              fixedKeyMatched = true;
            }

            if (key.toLowerCase() === 'pageSize'.toLowerCase()) {
              this.pageSize = Number(qp[key]);
              fixedKeyMatched = true;
            }

            if (key.toLowerCase() === 'sortBy'.toLowerCase()) {
              this.sortFromQueryParams.sortBy = qp[key];
              fixedKeyMatched = true;
            }

            if (key.toLowerCase() === 'sortOrder'.toLowerCase()) {
              this.sortFromQueryParams.sortOrder = qp[key];
              fixedKeyMatched = true;
            }

            if (key.toLowerCase() === 'search'.toLowerCase()) {
              this.search = qp[key];
              this.searchCtrl.patchValue(this.search);
              fixedKeyMatched = true;
            }


            if (key.toLowerCase().includes('date') && qp[key].length == 13) {  // To Check if it is a date
              // this.filterFromQueryParams[key] = moment(Number(qp[key]));
              this.filterFromQueryParams[key] = DateTime.fromMillis(Number(qp[key]));
              fixedKeyMatched = true;
            }

            if (!fixedKeyMatched) {
              if ((qp[key]).includes(',')) {
                this.filterFromQueryParams[key] = (qp[key]).split(',');
              } else {
                this.filterFromQueryParams[key] = qp[key];
              }
            }

            // Transform Data, before patching in filter Form
            let mapping = this.columnsCodeMapping.find(ccm => ccm.filterFormKey == key);
            if (mapping?.transformQueryParamFn) {
              this.filterFromQueryParams[key] = mapping.transformQueryParamFn(this.filterFromQueryParams[key]);
            }

          }
        }
        this.filterFormGroup.patchValue(this.filterFromQueryParams);

        if (this.sortFromQueryParams && this.sortFromQueryParams.sortBy && this.sortFromQueryParams.sortOrder) {
          this.sortObj = this.sortFromQueryParams;
          console.log('[table-list-view-wrapper]: Emitting Sort Obj from QP to parent component:', this.sortFromQueryParams);
          this.sortObjChange.emit(this.sortObj);
        }
      }



      let filterHasNonEmptyValue = Object.values(this.filterFromQueryParams).some(value => value !== null && value !== undefined && value !== '');
      if (filterHasNonEmptyValue) {
        this.filterApplied = true;
      }

      this.getList();

    });

    this.searchCtrl.valueChanges
      .pipe(takeUntil(this._onDestroy), debounceTime(400), distinctUntilChanged())
      .subscribe((search) => {
        this.search = search;
        this.resetFlag = true;    // B/c every time search is made, make sure we go to first page...
        this.getList(false);
      });
  }


  ngOnChanges(changes: SimpleChanges): void {
    console.log(`[table-list-view-wrapper]: ngOnChanges:`, changes);

    if (changes['defaultDisplayedColumns']) {
      console.log(`[table-list-view-wrapper]: changes['defaultDisplayedColumns']:`, changes['defaultDisplayedColumns']);
      this.handleDisplayedColumns();
    }

    if (changes['columnsCodeMapping']) {
      console.log(`[table-list-view-wrapper]: changes['columnsCodeMapping']:`, changes['columnsCodeMapping']);

      this.columnsCodeMapping = changes['columnsCodeMapping'].currentValue;
      this.handleDisplayedColumns();

      this.columns = this.columnsCodeMapping.map(c => c.name);
      this.autoRenderColumns = this.columnsCodeMapping.filter(c => c.hasOwnProperty('valueKey'));
      this.templateRenderColumns = this.columnsCodeMapping.filter(c => c.hasOwnProperty('template'));
    }

    if (changes['pageIndex']) {
      this.pageIndex = changes['pageIndex'].currentValue;
    }

    if (changes['pageSize']) {
      if (!changes['pageSize'].isFirstChange) {
        this.pageSize = changes['pageSize'].currentValue;
      } else {
        if (this.useGlobalPageSize) {
          let userDefaultPageSize = storageHelper.getFromLocalStorageWithExpiry('user_pagination_page_size');
          this.pageSize = userDefaultPageSize ? userDefaultPageSize : changes['pageSize'].currentValue;
        }
      }
    }


    if (changes['loadDataApiBaseUrl']) {
      if (changes['loadDataApiBaseUrl'].currentValue) {
        console.log(`[table-list-view-wrapper]: Datasource changes['loadDataApiBaseUrl'].currentValue:`, changes['loadDataApiBaseUrl'].currentValue);


        if (this.loadingSubscription) {
          this.loadingSubscription.unsubscribe();
        }

        if (this.dataLengthSubscription) {
          this.dataLengthSubscription.unsubscribe();
        }

        this.dataSource = new ApiDataSource(this.apiService);
        console.log('[table-list-view-wrapper]: Datasource Initialized:', this.dataSource);

        this.loadingSubscription = this.dataSource.loading$.subscribe(loading => {
          console.log('[table-list-view-wrapper]: dataSource loading:', loading);
          if (!loading && this._paginator) {
            this._paginator.pageIndex = this.pageIndex;
            this._paginator.pageSize = this.pageSize;
            this.checkAllRowsSelected();
          }
        });

        this.dataLengthSubscription = this.dataSource.totalDataLength$.subscribe((total: any) => {
          console.log('[table-list-view-wrapper]: dataSource total:', total);
          if (total !== null) {
            this.initialLoading = false;
            // console.log('[table-list-view-wrapper]: dataSource total total:', total);
          }
        });
      }
    }


    if (changes['filterFormGroup']) {
      if (this.filterFormGroupSubscription) {
        this.filterFormGroupSubscription.unsubscribe();
      }

      this.filterFormGroupSubscription = this.filterFormGroup.valueChanges
        .pipe(takeUntil(this._onDestroy), distinctUntilChanged()).subscribe(val => {
          this.filterHasNonEmptyValue = Object.values(val).some(value => value !== null && value !== undefined && value !== '');
        })
    }


    if (changes['selectedRows']) {
      this.selectedRows = changes['selectedRows'].currentValue;
      if (this.selectedRows && this.selectedRows.length) {
        // TODO:: Leave for now.....  (Not able to decide whether in future we need to pass whole row or ids only)
      }
    }

    if (changes['defaultSortObj']?.currentValue) {
      this.defaultSortObj = changes['defaultSortObj'].currentValue;

      this.handleSortingChanges({
        direction: this.defaultSortObj.sortOrder,
        active: this.defaultSortObj.sortBy
      });
    }
  }


  ngOnDestroy(): void {
    this._sortSubscription?.unsubscribe();
    this._paginatorSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
    this.dataLengthSubscription?.unsubscribe();
    this.filterFormGroupSubscription?.unsubscribe();
  }

  setDefaultColumns() {
    if (this.defaultDisplayedColumns && this.defaultDisplayedColumns.length) {
      this.defaultColumns = this.defaultDisplayedColumns;
    } else {
      this.defaultColumns = this.columnsCodeMapping.map(c => c.name);
    }
  }


  handleDisplayedColumns() {
    if (this.defaultDisplayedColumns && this.defaultDisplayedColumns.length) {

      const columnsSet = new Set<string>(this.columnsCodeMapping.map(ccm => ccm.name));
      this.displayedColumns = this.defaultDisplayedColumns.filter(c => columnsSet.has(c));

    } else {
      this.displayedColumns = this.columnsCodeMapping.map(c => c.name);
    }

    if (this.enableRowsSelection) {
      this.displayedColumns = ['Select', ...this.displayedColumns];
    }

    if (this.enableDragNDrop) {
      this.displayedColumns = ['drag', ...this.displayedColumns];
    }
    this.displayedColumnsChange.emit(this.displayedColumns);
  }


  handleSortingChanges(ch: any) {
    this.sortObj = { sortOrder: ch.direction, sortBy: this.columnsCodeMapping.find(c => c.name === ch.active)?.serverKeyCode };
    this.sortFromQueryParams.sortBy = this.sortObj.sortBy;
    this.sortFromQueryParams.sortOrder = this.sortObj.sortOrder;
    this.resetFlag = true;
    this.getList();
  }


  private getHomeUrl() {
    let pathname = window.location.pathname;
    // console.log("=== app-table-list-view-wrapper :: pathname ===", pathname);
    this.homeUrl = `/${pathname.split('/')[1]}`;
  }


  getNestedValue(obj: any, path: string): any {
    if (!path) return null;
    // If there is no '.', just return the direct property
    if (!path.includes('.')) {
      return obj ? obj[path] : null;
    }
    // Otherwise, traverse the nested properties
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }



  private groupByFormControlAttributes(data: SelectedFilterDisplayValueType[]): SelectedFiltersGroupedValuesType[] {
    const groups: Record<string, SelectedFiltersGroupedValuesType> = {};

    data.forEach(item => {

      if (item.formControlType == 'input') {
        // Do Nothing...
      }
      if (item.formControlType == 'checkbox') {
        // Do Nothing...
      }
      if (item.formControlType == 'date') {
        item.valueKey = DateTime.fromJSDate(item.value).toFormat('dd-MM-yyyy');
      }
      if (item.formControlType == 'date-time') {
        item.valueKey = DateTime.fromJSDate(item.value).toFormat('dd-MM-yyyy HH:mm');
      }

      const key = `${item.formControlName}-${item.formControlType}`;
      if (!groups[key]) {
        groups[key] = {
          formControlName: item.formControlName,
          formControlType: item.formControlType,
          arrValues: []
        };
      }
      const isSingleValue = item.isSingleValue ?? ['input', 'radio', 'date', 'date-time', 'toggle'].includes(item.formControlType);
      // Check if only the last value should be kept due to isSingleValue or duplicated value/valueKey
      if (isSingleValue) {
        groups[key].arrValues = [item]; // Replace with the current item
      } else {
        // Check for duplicate value and valueKey in the current array
        const existingIndex = groups[key].arrValues.findIndex(x => x.value === item.value && x.valueKey === item.valueKey);
        if (existingIndex !== -1) {
          groups[key].arrValues[existingIndex] = item; // Replace the duplicate
        } else {
          groups[key].arrValues.push(item); // Add new item
        }
      }
    });

    return Object.values(groups);
  }

  updateSelectedFilterValues(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    let currentFormControlName: string;
    if (Array.isArray(values)) {
      this.selectedFilterGroupedValues = this.groupByFormControlAttributes(values);
      currentFormControlName = values[0]?.formControlName;
    } else {
      currentFormControlName = values?.formControlName;
      this.selectedFilterGroupedValues = this.groupByFormControlAttributes([values]);
    }

    this.selectedFilterValues = this.selectedFilterValues.filter(sfv => sfv.formControlName != currentFormControlName);

    this.selectedFilterGroupedValues.forEach(gv => {
      if (gv.formControlName = currentFormControlName) {
        gv.arrValues.forEach(v => {
          this.selectedFilterValues.push(v);
        })
      }
    })

    // this.filterFromQueryParams
    this.getFinalSelectedFilterValuesToDisplay();


  }

  getFinalSelectedFilterValuesToDisplay() {
    this.finalSelectedFilterValuesToDisplay = [];
    this.selectedFilterValues.forEach(sf => {
      if (Object.keys(this.filterFromQueryParams).includes(sf.formControlName)) {
        this.finalSelectedFilterValuesToDisplay.push(sf);
      }
    });
  }

  removeParticularFilter(f: SelectedFilterDisplayValueType) {

    let val = this.filterFormGroup.get(f.formControlName)?.value;
    
    if (Array.isArray(val)) {
      val = val.filter(v => v != f.value);
      this.filterFormGroup.get(f.formControlName)?.patchValue(val);
    } else {
      this.filterFormGroup.get(f.formControlName)?.reset();
    }
    this.selectedFilterValues = this.selectedFilterValues.filter(sfv => !(sfv.formControlName == f.formControlName && sfv.valueKey == f.valueKey));
    
    setTimeout(() => {
      this.filterRecords();
    }, 500);
  }


  filterRecords() {
    this.filterApplied = true;
    this.resetFlag = true;
    setTimeout(() => {
      this.getList(true);
      this.isShowFilter = false;
    }, 500);
  }

  public resetFilters() {
    this.filterApplied = false;
    setTimeout(() => {
      this.resetFlag = true;
      this.filterFromQueryParams = {};
      this.sortFromQueryParams = {};
      this.selectedFilterGroupedValues = [];
      this.selectedFilterValues = [];
      this.getList();
    }, 250);
  }

  public getList(forceFromObject = false) {
    const filterFormData = this.filterFormGroup?.value;

    let qs: any = new URLSearchParams();
    let filter: any = { ...filterFormData };

    if (filterFormData) {
      this.filterHasNonEmptyValue = Object.values(filterFormData).some(value => value !== null && value !== undefined && value !== '');
    } else {
      this.filterHasNonEmptyValue = false;
    }

    for (const key in filter) {
      if (typeof filter[key] === 'object' && (filter[key] instanceof Date || DateTime.isDateTime(filter[key]))) {
        if (filter[key] instanceof Date) {
          filter[key] = DateTime.fromJSDate(filter[key]).toMillis();
        }
        else if (DateTime.isDateTime(filter[key])) {
          filter[key] = filter[key].toMillis();
        }
      }
    }

    // Append All Filters from filter form
    Object.keys(filter).forEach(key => {
      if (filter[key] != null && filter[key] != '' && filter[key] != 'null' && filter[key] != 'undefined') {
        if (filter[key] === '*') {
          filter[key] = '';
        }
        qs.append(key, filter[key]);
      }
    });


    // Append sorting conditions...
    if (this.sortFromQueryParams) {
      Object.keys(this.sortFromQueryParams).forEach(key => {
        if (this.sortFromQueryParams[key] != null && this.sortFromQueryParams[key] != '' && this.sortFromQueryParams[key] != 'null' && this.sortFromQueryParams[key] != 'undefined') {
          qs.append(key, this.sortFromQueryParams[key]);
        }
      });
    }

    if (this.resetFlag) {
      this.pageIndex = 0;
    }

    if (this._paginator) {
      this._paginator.pageIndex = this.pageIndex;
      this._paginator.pageSize = this.pageSize;
    }

    qs.append("pageIndex", this.pageIndex);
    qs.append("pageSize", this.pageSize);

    if (this.search != '') {
      qs.append('search', this.search);
    }


    qs = qs.toString();
    let genUrl = this.router.url.split('?')[0] + '?' + qs;
    let currentUrl = window.location.pathname + window.location.search;

    if (currentUrl != genUrl) {
      if (this.keepFilterInUrl) {
        this.location.go(genUrl);
        this.filterFromQueryParams = this.getQueryParams(window.location.href);
      }
    } else {}

    this.dataSource.load(this.loadDataApiBaseUrl, this.pageIndex, this.pageSize, this.search, filter, this.sortObj);
    this.getFinalSelectedFilterValuesToDisplay();

    this.resetFlag = false;
  }


  onPaginationChanges() {
    if (this.pageIndex != this._paginator.pageIndex) {
      this.pageIndex = this._paginator.pageIndex;
      this.getList();
      this.pageIndexChange.emit(this.pageIndex);
    }

    if (this.pageSize != this._paginator.pageSize) {
      this.pageSize = this._paginator.pageSize;
      this.getList();
      this.pageSizeChange.emit(this.pageSize);
      storageHelper.setToLocalStorageWithExpiry('user_pagination_page_size', this.pageSize, 1000 * 60 * 60 * 24 * 15);
    }

  }

  onChangeDisplayColumns(columns: string[]) {
    this.defaultDisplayedColumns = columns;
    this.handleDisplayedColumns();
  }

  onChangeFromStartColumnNumber(columnNumber: number) {
    this.startStickyColumnCount = columnNumber;
  }

  onChangeFromEndColumnNumber(columnNumber: number) {
    this.endStickyColumnCount = columnNumber;
  }

  goToUrl(url: string) {
    if (url) {
      this.router.navigateByUrl(url);
    }
  }

  toggleSelection(status: MatCheckboxChange, row: any): void {
    if (this.onlySingleSelection && status.checked) {
      this.selection.clear();
    }
    this.selection.toggle(row);
    this.selectedRows = this.selection.selected;
    this.selectedRowsChange.emit(this.selectedRows);
    this.checkAllRowsSelected();
  }


  checkAllRowsSelected() {
    this.isAllRowsSelected = this.selection.selected.length === this.dataSource.apiSubject.value.length;
  }


  toggleAllRows(): void {
    if (this.isAllRowsSelected) {
      this.selection.clear();
    } else {
      this.dataSource.apiSubject.value.forEach(row => {
        this.selection.select(row);
      });
    }
    this.selectedRows = this.selection.selected;
    this.selectedRowsChange.emit(this.selectedRows);
    this.checkAllRowsSelected();
  }

  stopPropagation($event: any) {
    $event.stopPropagation();
  }

  isChecked(row: any): boolean {
    return this.selectedIds.has(row['id']);
  }

  getQueryParams(url: string): Record<string, string | string[]> {
    const urlObj = new URL(url);
    const params = new URLSearchParams(urlObj.search);
    const paramsObj: Record<string, string | string[]> = {};

    params.forEach((value, key) => {
      // Check if the parameter already exists (for handling multiple values)
      if (paramsObj.hasOwnProperty(key)) {
        // If it's not already an array, convert it to an array
        if (!Array.isArray(paramsObj[key])) {
          paramsObj[key] = [paramsObj[key] as string];  // Cast as string because we know it's not an array here
        }
        // Push the new value to the existing array
        (paramsObj[key] as string[]).push(value); // Cast as string[] to use array methods
      } else {
        // Assign the value to the key in the object
        paramsObj[key] = value;
      }
    });

    return paramsObj;
  }


  isStickyStart(columnName: string): boolean {
    const index = this.displayedColumns.indexOf(columnName);
    return index !== -1 && index < this.startStickyColumnCount;
  }

  isStickyEnd(columnName: string): boolean {
    const index = this.displayedColumns.indexOf(columnName);
    if (index === -1) return false;
    return index >= this.displayedColumns.length - this.endStickyColumnCount;
  }

  getColumnClasses(column: SmartTableWrapperColumnsConfig): { [key: string]: boolean } {
    // Check if alignment is explicitly specified
    if (column.align) {
      return {
        'text-right': column.align === 'right',
        'text-left': column.align === 'left',
        'text-center': column.align === 'center'
      };
    } else {
      // Default alignment based on column type
      switch (column.type) {
        case 'money':
        case 'quantity':
          return { 'text-right': true };
        case 'number':
          return { 'text-center': true };
        default:
          return {};
      }
    }
  }


  getRowBackground(row: any): string | null {
    return this.rowsConfig.backgroundApplyFunction
      ? this.rowsConfig.backgroundApplyFunction(row)
      : null;
  }


  drop(event: CdkDragDrop<any[]>) {
    // Ignore if the item was dropped at the same index
    if (event.previousIndex === event.currentIndex) {
      return;
    }

    // Access current data from apiSubject
    const currentData = [...this.dataSource.apiSubject.value];

    if (!currentData || currentData.length === 0) {
      return;
    }

    // Rearrange items based on the drop event
    moveItemInArray(currentData, event.previousIndex, event.currentIndex);

    // Update the apiSubject with reordered data
    this.dataSource.apiSubject.next(currentData);

    // We need to emit this also
    this.listDataSequenceChange.emit(currentData);
  }

  handleButtonClick(config: any) {
    if (config?.btnClick) {
      config.btnClick();
    } else if (config?.btnUrl) {
      this.goToUrl(config.btnUrl);
    }
  }

  handleSecondButtonClick(config: any) {
    if (config?.secondBtnClick) {
      config.secondBtnClick();
    } else if (config?.secondBtnUrl) {
      this.goToUrl(config.secondBtnUrl);
    }
  }
}
