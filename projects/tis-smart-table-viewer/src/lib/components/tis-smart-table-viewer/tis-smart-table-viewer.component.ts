import { CdkColumnDef } from '@angular/cdk/table';
import { Component, EventEmitter, Input, Output, SimpleChanges, ViewChild, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, Subject, takeUntil, tap, Observable, map, shareReplay, distinctUntilChanged, debounceTime } from 'rxjs';
import type { SmartTableWrapperRowsConfig } from '../../interfaces';
import { AnyKeyValueObject, SelectedFilterDisplayValuesType, SelectedFilterDisplayValueType, SelectedFiltersGroupedValuesType, SmartTableWrapperColumnsConfig } from '../../interfaces';
import { CollectionViewer, SelectionModel } from '@angular/cdk/collections';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { ApiDataSource } from '../../datasources/api.datasource';
import { ApiService } from '../../services/api.service';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTable } from '@angular/material/table';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import * as storageHelper from '../../helpers/storage-helper';
import { TimeoutManager } from '../../helpers/timeout-manager.helper';
import { QueryParamsHelper } from '../../helpers/query-params.helper';
import { FilterDisplayHelper } from '../../helpers/filter-display.helper';
import { ValidationHelper } from '../../helpers/validation.helper';
import { CollectionHelper } from '../../helpers/collection.helper';
import { UrlHelper } from '../../helpers/url.helper';
import { Location } from '@angular/common';
import type { DataNotFoundConfig } from '../../interfaces/data-not-found-config.type';
import type { ColumnCustomizationUrlConfig } from '../../interfaces/url-config.type';

@Component({
  selector: 'tis-smart-table-viewer',
  standalone: false,
  templateUrl: './tis-smart-table-viewer.component.html',
  styleUrl: './tis-smart-table-viewer.component.css',
  providers: [CdkColumnDef],
})
export class TisSmartTableViewerComponent implements OnDestroy {
  homeUrl = '';

  @Input({ required: true }) columnCustomizationUrlConfig!: ColumnCustomizationUrlConfig;
  @Input({ required: true }) t: any = {};
  @Input({ required: true }) componentName = '';
  @Input({ required: true }) mainTitle!: string;
  @Input() searchPlaceholder!: string;
  @Input() breadcrumbs: { url: string, name: string }[] = [];
  @Input() hideHeader = false;
  @Input() hideTableHeader = false;
  @Input() hidePaginator = false;
  @Input() keepFilterInUrl = true;
  @Input() disableBorderedView = false;
  @Input() displayColumnsSelectionButton = true;
  @Input() loadDataApiBaseUrl!: string;
  @Input() startStickyColumnCount!: number;
  @Input() endStickyColumnCount!: number;
  @Input() loaderPosition: 'top' | 'bottom' = 'top';
  @Input({ required: true }) dataNotFoundConfig: DataNotFoundConfig = {
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

  @Output() onDataLoaded = new EventEmitter<boolean>();
  @Output() onSetExtraData = new EventEmitter<any>();
  @Output() onSetTotal = new EventEmitter<number>();

  @Input() hasSelectedAllRows = false;

  selectedTemplate: any = {
    id: -1,
    name: 'Default',
    fromStartColumnNumber: 0,
    fromEndColumnNumber: 0,
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
  displayAfterFilterRemoved = false;

  filterFromQueryParams: any = {};
  sortFromQueryParams: any = {};

  search = '';
  searchCtrl = new FormControl();
  private _onDestroy = new Subject<void>();

  // Additional subscriptions that need cleanup
  private _selectionSubscription!: Subscription;
  private _handsetSubscription!: Subscription;
  private _queryParamsSubscription!: Subscription;

  // Memory-efficient caching
  private _columnMappingCache: Map<string, SmartTableWrapperColumnsConfig> = new Map();
  private _displayedColumnsCache: string[] = [];
  private _lastColumnsCodeMappingHash: string = '';

  // Race condition prevention
  private _currentRequestSubject = new Subject<void>();
  
  // Timeout management for proper cleanup - prevent memory leaks
  private timeoutManager = new TimeoutManager();
  
  // Computed row backgrounds for optimal performance
  private computedRowBackgrounds = new Map<string, string | null>();
  
  dataSource!: ApiDataSource;

  private _table!: MatTable<any>;
  @ViewChild(MatTable) set table(value: MatTable<any>) {
    this._table = value;
    // ✅ FIX: When table becomes available, connect it to datasource if it exists
    if (this._table && this.dataSource) {
      // Force the table to connect to our datasource
      this._table.dataSource = this.dataSource;
    }
  }

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
  @Input() selectedRowIds!: (number | string)[];
  @Input() selectedRowKey: string = 'id';
  @Input() selectedRows!: any[];
  @Output() selectedRowsChange = new EventEmitter<any>();

  selection = new SelectionModel<any>(true, []);
  selectedIds: Set<number | string> = new Set();
  isAllRowsSelected = false;
  @Output() allRowsSelectedChange = new EventEmitter<boolean>(false);

  @Input() enableDragNDrop = false;
  @Output() listDataSequenceChange = new EventEmitter<any>();
  
  @Input() isExpansion: boolean = false;
  @Input() isExpandedRow: boolean = false;
  @Input() expandedTemplate: any;
  isAllExpanded: boolean = false;
  
  // Expansion state management - avoid direct mutation
  private expandedRowIds: Set<string | number> = new Set();

  isHandset$!: Observable<boolean>;
  isMobile: boolean = false;

  constructor(
    // private userCustomizationService: UserCustomizationService,
    private dialog: MatDialog,
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private breakpointObserver: BreakpointObserver,
    private cdr: ChangeDetectorRef
  ) {
    // Store subscription reference for proper cleanup
    this._selectionSubscription = this.selection.changed.subscribe(change => {
      change.added.forEach(item => {
        if (item && item[this.selectedRowKey] !== undefined) {
          this.selectedIds.add(item[this.selectedRowKey]);
        }
      });
      change.removed.forEach(item => {
        if (item && item[this.selectedRowKey] !== undefined) {
          this.selectedIds.delete(item[this.selectedRowKey]);
        }
      });
    });
  }

  ngOnInit(): void {

    this.isHandset$ = this.breakpointObserver.observe([Breakpoints.Handset])
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

    this._handsetSubscription = this.isHandset$.subscribe(r => {
      this.isMobile = r;
    });

    this.setDefaultColumns();

    this.getHomeUrl();

    this._queryParamsSubscription = this.route.queryParams.subscribe(qp => {
      // Initialize objects
      this.filterFromQueryParams = {};
      this.sortFromQueryParams = {};
      
      if (this.keepFilterInUrl) {
        const { filterParams, sortParams, pageIndex, pageSize, search } = 
          QueryParamsHelper.processForFilters(qp, this.columnsCodeMapping);
        
        this.filterFromQueryParams = filterParams;
        this.sortFromQueryParams = sortParams;
        this.pageIndex = pageIndex;
        this.pageSize = pageSize;
        this.search = search;
        this.searchCtrl.patchValue(this.search);
        
        this.filterFormGroup.patchValue(this.filterFromQueryParams);

        if (ValidationHelper.hasProperty(this.sortFromQueryParams, 'sortBy') && 
            ValidationHelper.hasProperty(this.sortFromQueryParams, 'sortOrder')) {
          this.sortObj = this.sortFromQueryParams;
          this.sortObjChange.emit(this.sortObj);
        }
      }

      this.filterApplied = ValidationHelper.hasNonEmptyValue(this.filterFromQueryParams);
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
    // console.log(`[table-list-view-wrapper]: ngOnChanges:`, changes);

    if (changes['defaultDisplayedColumns']) {
      this.handleDisplayedColumns('defaultDisplayedColumns');
    }

    if (changes['columnsCodeMapping']) {
      this.columnsCodeMapping = changes['columnsCodeMapping'].currentValue;
      this.handleDisplayedColumns('columnsCodeMapping');

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
        // Clean up existing subscriptions
        if (this.loadingSubscription) {
          this.loadingSubscription.unsubscribe();
        }

        if (this.dataLengthSubscription) {
          this.dataLengthSubscription.unsubscribe();
        }

        // ✅ FIX: Only create datasource once on initialization
        // Reusing the same datasource prevents subscription issues
        if (!this.dataSource) {
          this.dataSource = new ApiDataSource(this.apiService);
          // Template binding [dataSource]="dataSource" will handle the connection
        }

        this.loadingSubscription = this.dataSource.loading$.subscribe(loading => {
          if (!loading) {
            if(this._paginator){
              this._paginator.pageIndex = this.pageIndex;
              this._paginator.pageSize = this.pageSize;
            }
            
            // ✅ FIX: Always clear caches when new data arrives (even if empty)
            // Clear background cache when new data arrives
            this.clearRowBackgroundCache();
            // Pre-compute all row backgrounds for optimal performance
            this.computeAllRowBackgrounds();
            
            // ✅ FIX: Ensure selection state is updated even when data changes from empty to populated
            this.checkAllRowsSelected();
            
            // ✅ FIX: Force Angular change detection to ensure table re-renders
            // This is critical for data → empty → data transitions
            this.cdr.detectChanges();
            
            // ✅ FIX: Force MatTable to re-render rows after data transitions
            // This ensures rows are properly rendered when going from empty → data
            if (this._table) {
              this._table.renderRows();
            }
            
            // ✅ FIX: Force change detection by emitting events
            this.onDataLoaded.emit(true);
            this.onSetExtraData.emit(this.dataSource.extraDataSubject.value);
            
            // if (this.selectedRowIds && this.selectedRowIds.length) {
            //   setTimeout(() => {
            //     this.setSelectedRows();
            //   }, 200);
            // }
          }
        });

        this.dataLengthSubscription = this.dataSource.totalDataLength$.subscribe((total: any) => {
          if (total !== null) {
            this.initialLoading = false;
            this.onSetTotal.emit(total);
            // console.log('[table-list-view-wrapper]: dataSource total total:', total);
          }
        });
      }
    }


    if (changes['filterFormGroup']) {
      if (this.filterFormGroupSubscription) {
        this.filterFormGroupSubscription.unsubscribe();
      }

      // ✅ FIX: Use custom comparator for distinctUntilChanged to properly detect form value changes
      this.filterFormGroupSubscription = this.filterFormGroup.valueChanges
        .pipe(
          takeUntil(this._onDestroy),
          distinctUntilChanged((prev, curr) => {
            // Custom comparator: deep compare form values
            return JSON.stringify(prev) === JSON.stringify(curr);
          })
        ).subscribe(val => {
          this.filterHasNonEmptyValue = ValidationHelper.hasNonEmptyValue(val);
        })
    }


    if (changes['selectedRows']) {
      this.selectedRows = changes['selectedRows'].currentValue;
      if (this.selectedRows && this.selectedRows.length) {
        // TODO:: Leave for now.....  (Not able to decide whether in future we need to pass whole row or ids only)
      }
    }

    if (changes['selectedRowIds']) {
      this.selectedRowIds = changes['selectedRowIds'].currentValue;
      if (this.selectedRowIds && this.selectedRowIds.length) {
        this.setSelectedRows();
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
    // Complete the destroy subject first to trigger takeUntil operators
    this._onDestroy.next();
    this._onDestroy.complete();

    // Clean up all subscriptions
    this._sortSubscription?.unsubscribe();
    this._paginatorSubscription?.unsubscribe();
    this.loadingSubscription?.unsubscribe();
    this.dataLengthSubscription?.unsubscribe();
    this.filterFormGroupSubscription?.unsubscribe();
    
    // Clean up additional subscriptions
    this._selectionSubscription?.unsubscribe();
    this._handsetSubscription?.unsubscribe();
    this._queryParamsSubscription?.unsubscribe();

    // Clean up selection model and data structures using CollectionHelper
    this.selection.clear();
    CollectionHelper.clearSet(this.selectedIds);
    CollectionHelper.clearSet(this.expandedRowIds);
    
    // Clear arrays to free memory using CollectionHelper
    CollectionHelper.clearArray(this.selectedFilterValues);
    CollectionHelper.clearArray(this.finalSelectedFilterValuesToDisplay);
    CollectionHelper.clearArray(this.selectedFilterGroupedValues);
    CollectionHelper.clearArray(this.displayedColumns);
    
    // Clear caches to free memory
    CollectionHelper.clearMap(this._columnMappingCache);
    CollectionHelper.clearArray(this._displayedColumnsCache);
    this._lastColumnsCodeMappingHash = '';
    CollectionHelper.clearMap(this.computedRowBackgrounds);
    
    // Complete race condition prevention subject
    this._currentRequestSubject.next();
    this._currentRequestSubject.complete();
    
    // Clear all pending timeouts to prevent memory leaks
    this.timeoutManager.clearAll();
    
    // Disconnect data source to stop API calls and complete observables
    if (this.dataSource) {
      this.dataSource.disconnect({} as CollectionViewer);
    }
  }

  setDefaultColumns() {
    if (this.defaultDisplayedColumns && this.defaultDisplayedColumns.length) {
      this.defaultColumns = this.defaultDisplayedColumns;
    } else {
      this.defaultColumns = this.columnsCodeMapping.map(c => c.name);
    }
  }


  handleDisplayedColumns(msg: String = '') {

    if(this.selectedTemplate?.id > 0 && this.defaultDisplayedColumns && this.defaultDisplayedColumns.length){
      this.displayedColumns = this.defaultDisplayedColumns.filter(c => this._columnMappingCache.has(c));
    }
    else{
      // Create a hash of current columns to check if cache is valid
      const columnsHash = JSON.stringify(this.columnsCodeMapping.map(c => c.name));
      // Use cache if columns haven't changed
      if (this._lastColumnsCodeMappingHash === columnsHash && this._displayedColumnsCache.length > 0) {
        this.displayedColumns = [...this._displayedColumnsCache];
      } else {
        // Update cache
        this.updateColumnMappingCache();
        this._lastColumnsCodeMappingHash = columnsHash;
        
        if (this.defaultDisplayedColumns && this.defaultDisplayedColumns.length) {
          this.displayedColumns = this.defaultDisplayedColumns.filter(c => this._columnMappingCache.has(c));
        } else {
          this.displayedColumns = this.columnsCodeMapping.map(c => c?.columnDef || c.name);
        }
        
        // Cache the result before adding selection/drag columns
        this._displayedColumnsCache = [...this.displayedColumns];
      }
    }

    // Add selection and drag columns (these are dynamic and shouldn't be cached)
    const finalColumns = [...this.displayedColumns];
    
    if (this.enableRowsSelection) {
      finalColumns.unshift('Select');
    }

    if (this.enableDragNDrop) {
      finalColumns.unshift('drag');
    }
    
    console.log(`=== handleDisplayedColumns :: ${msg} :: finalColumns  ===`, finalColumns);
    
    this.displayedColumns = finalColumns;
    this.displayedColumnsChange.emit(this.displayedColumns);
  }

  private updateColumnMappingCache(): void {
    this._columnMappingCache.clear();
    this.columnsCodeMapping.forEach(column => {
      this._columnMappingCache.set(column.name, column);
    });
  }

  // TrackBy functions for optimal rendering performance
  trackByBreadcrumb(index: number, breadcrumb: { url: string, name: string }): string {
    return breadcrumb.url + breadcrumb.name || index.toString();
  }

  trackByFilterValue(index: number, filterValue: SelectedFilterDisplayValueType): string {
    return `${filterValue.formControlName}_${filterValue.valueKey}_${filterValue.value}`;
  }

  trackByAutoColumn(index: number, column: SmartTableWrapperColumnsConfig): string {
    return column.name + (column.serverKeyCode || '');
  }

  trackByTemplateColumn(index: number, column: SmartTableWrapperColumnsConfig): string {
    return column.name + (column.serverKeyCode || '');
  }

  trackByTableRow(index: number, row: any): any {
    return row.id || row[this.selectedRowKey] || index;
  }

  // Helper method to get consistent row identifier for expansion tracking
  private getRowIdentifier(row: any): string | number {
    return CollectionHelper.getRowIdentifier(row, 'id', this.selectedRowKey);
  }

  // Helper method to check if a row is expanded (non-mutating)
  public isRowExpanded(row: any): boolean {
    if (!this.isExpansion) return false;
    const rowId = this.getRowIdentifier(row);
    return this.expandedRowIds.has(rowId);
  }

  // Clear background cache when data changes to ensure fresh calculations
  private clearRowBackgroundCache(): void {
    this.computedRowBackgrounds.clear();
  }

  // Compute all row backgrounds when data changes (runs once per data load)
  private computeAllRowBackgrounds(): void {
    // ✅ FIX: Always clear the cache first to ensure fresh computation
    this.computedRowBackgrounds.clear();
    
    // ✅ FIX: Safely check if we have data and a background function
    if (!this.dataSource?.apiSubject?.value || 
        !Array.isArray(this.dataSource.apiSubject.value) || 
        !this.rowsConfig.backgroundApplyFunction) {
      return;
    }
    
    // ✅ FIX: Only compute backgrounds if we have actual data
    if (this.dataSource.apiSubject.value.length === 0) {
      return;
    }
    
    this.dataSource.apiSubject.value.forEach((row: any) => {
      if (!row) return; // Skip null/undefined rows
      
      const rowId = row?.id || row?.[this.selectedRowKey] || JSON.stringify(row);
      try {
        const background = this.rowsConfig.backgroundApplyFunction!(row);
        this.computedRowBackgrounds.set(rowId, background);
      } catch (error) {
        console.warn('Error computing row background:', error);
        this.computedRowBackgrounds.set(rowId, null);
      }
    }); 
  }


  handleSortingChanges(ch: any) {
    this.sortObj = { sortOrder: ch.direction, sortBy: this.columnsCodeMapping.find(c => c.name === ch.active)?.serverKeyCode };
    this.sortFromQueryParams.sortBy = this.sortObj.sortBy;
    this.sortFromQueryParams.sortOrder = this.sortObj.sortOrder;
    this.resetFlag = true;
    this.getList();
  }


  private getHomeUrl() {
    this.homeUrl = UrlHelper.getHomeUrl();
  }


  getNestedValue(obj: any, path: string): any {
    return CollectionHelper.getNestedProperty(obj, path);
  }



  private groupByFormControlAttributes(data: SelectedFilterDisplayValueType[]): SelectedFiltersGroupedValuesType[] {
    return FilterDisplayHelper.groupByFormControlAttributes(data);
  }

  updateSelectedFilterValues(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    let currentFormControlName: string;
    if (Array.isArray(values)) {
      currentFormControlName = values[0]?.formControlName;
    } else {
      currentFormControlName = values?.formControlName;
    }

    const result = FilterDisplayHelper.updateSelectedFilterValues(
      this.selectedFilterValues, 
      values, 
      currentFormControlName
    );
    
    this.selectedFilterValues = result.selectedFilterValues;
    this.selectedFilterGroupedValues = result.selectedFilterGroupedValues;
    this.displayAfterFilterRemoved = true;
    this.getFinalSelectedFilterValuesToDisplay();
  }

  getFinalSelectedFilterValuesToDisplay() {
    this.finalSelectedFilterValuesToDisplay = FilterDisplayHelper.getValuesForDisplay(
      this.selectedFilterValues, 
      this.filterFromQueryParams
    );
  }

  removeParticularFilter(f: SelectedFilterDisplayValueType) {
    let val = this.filterFormGroup.get(f.formControlName)?.value;
    
    if (Array.isArray(val)) {
      val = val.filter(v => v != f.value);
      this.filterFormGroup.get(f.formControlName)?.patchValue(val);
    } else {
      this.filterFormGroup.get(f.formControlName)?.reset();
    }
    
    this.selectedFilterValues = FilterDisplayHelper.removeFilterValue(this.selectedFilterValues, f);
    this.displayAfterFilterRemoved = true;
    
    this.timeoutManager.createTimeout(() => {
      this.filterRecords();
    }, 500);
  }


  filterRecords() {
    this.filterApplied = true;
    this.resetFlag = true;
    // Clear computed backgrounds before loading filtered data
    this.clearRowBackgroundCache();
    this.timeoutManager.createTimeout(() => {
      this.getList(true);
      this.isShowFilter = false;
    }, 500);
  }

  public resetFilters() {
    this.filterApplied = false;
    // Clear computed backgrounds before reset
    this.clearRowBackgroundCache();
    this.timeoutManager.createTimeout(() => {
      this.resetFlag = true;
      this.filterFromQueryParams = {};
      this.sortFromQueryParams = {};
      this.selectedFilterGroupedValues = [];
      this.selectedFilterValues = [];
      this.getList();
    }, 250);
  }

  public getList(forceFromObject = false) {
    // Cancel any previous request to prevent race conditions
    this._currentRequestSubject.next();
    
    this.isAllExpanded = false;
    // Clear expansion state when loading new data to avoid stale expansion state
    CollectionHelper.clearSet(this.expandedRowIds);
    
    // ✅ FIX: Clear row background cache before loading new data to prevent stale computed backgrounds
    this.clearRowBackgroundCache();
    
    const filterFormData = this.filterFormGroup?.value;
    this.filterHasNonEmptyValue = ValidationHelper.hasFormData(filterFormData);

    // Build query string using helper
    const qs = QueryParamsHelper.buildQueryString(
      filterFormData,
      this.sortFromQueryParams,
      this.resetFlag ? 0 : this.pageIndex,
      this.pageSize,
      this.search
    );

    if (this.resetFlag) {
      this.pageIndex = 0;
    }

    if (this._paginator) {
      this._paginator.pageIndex = this.pageIndex;
      this._paginator.pageSize = this.pageSize;
    }

    // Update URL if needed
    const baseUrl = UrlHelper.getBaseUrl(this.router);
    const genUrl = UrlHelper.buildUrl(baseUrl, qs);
    
    if (this.keepFilterInUrl && UrlHelper.hasUrlChanged(genUrl)) {
      UrlHelper.updateUrl(this.location, baseUrl, qs.toString());
      this.filterFromQueryParams = QueryParamsHelper.parseQueryParams(window.location.href);
    }

    // Load data with race condition protection
    this.dataSource.loadWithCancellation(
      this.loadDataApiBaseUrl, 
      this.pageIndex, 
      this.pageSize, 
      this.search, 
      filterFormData, // Pass original form data - datasource will handle conversions
      this.sortObj,
      this._currentRequestSubject
    );
    this.getFinalSelectedFilterValuesToDisplay();

    this.resetFlag = false;
  }


  onPaginationChanges() {
    if (this.pageIndex != this._paginator.pageIndex) {
      this.pageIndex = this._paginator.pageIndex;
      // Clear computed backgrounds before loading new page data
      this.clearRowBackgroundCache();
      this.getList();
      this.pageIndexChange.emit(this.pageIndex);
    }

    if (this.pageSize != this._paginator.pageSize) {
      this.pageSize = this._paginator.pageSize;
      // Clear computed backgrounds before loading new page size data
      this.clearRowBackgroundCache();
      this.getList();
      this.pageSizeChange.emit(this.pageSize);
      storageHelper.setToLocalStorageWithExpiry('user_pagination_page_size', this.pageSize, 1000 * 60 * 60 * 24 * 15);
    }

  }

  onSetSelectedTemplate(data: any) {
    console.log("=== onSetSelectedTemplate ===", data);
    // this.selectedTemplate = data;
  }

  onChangeDisplayColumns(columns: string[]) {
    console.log("=== onChangeDisplayColumns ===", columns);
    
    this.defaultDisplayedColumns = columns;
    this.handleDisplayedColumns('onChangeDisplayColumns');
  }

  onChangeFromStartColumnNumber(columnNumber: number) {
    this.startStickyColumnCount = columnNumber;
  }

  onChangeFromEndColumnNumber(columnNumber: number) {
    this.endStickyColumnCount = columnNumber;
  }

  goToUrl(url: string) {
    UrlHelper.safeNavigate(this.router, url);
  }

  toggleSelection(status: MatCheckboxChange, row: any): void {
    // ✅ Add null guards to prevent crashes
    if (!row || !ValidationHelper.hasRowKey(row, this.selectedRowKey)) {
      return;
    }
    
    if (this.onlySingleSelection && status.checked) {
      this.selection.clear();
    }

    const found = this.selection?.selected.find((el: any) => {
      return el[this.selectedRowKey] == row[this.selectedRowKey];
    });

    if (found) {
      this.selection?.deselect(found);
    } else {
      this.selection?.select(row);
    }

    // this.selection.toggle(row);
    this.selectedRows = this.selection.selected;
    this.selectedRowsChange.emit(this.selectedRows);
    this.checkAllRowsSelected();
  }


  checkAllRowsSelected() {
    // ✅ Add comprehensive null guards to prevent crashes
    if (!this.dataSource?.apiSubject?.value || !Array.isArray(this.dataSource.apiSubject.value)) {
      this.isAllRowsSelected = false;
      this.allRowsSelectedChange.emit(this.isAllRowsSelected);
      return;
    }
    
    this.isAllRowsSelected = this.selection.selected.length === this.dataSource.apiSubject.value.length;
    this.allRowsSelectedChange.emit(this.isAllRowsSelected);
  }


  toggleAllRows(): void {
    // ✅ Add comprehensive null guards
    if (!this.dataSource?.apiSubject?.value || !Array.isArray(this.dataSource.apiSubject.value)) {
      return;
    }
    
    if (this.isAllRowsSelected) {
      this.selection.clear();
    } else {
      this.dataSource.apiSubject.value.forEach(row => {
        // ✅ Validate each row before selecting
        if (row && ValidationHelper.hasRowKey(row, this.selectedRowKey)) {
          if(!this.isChecked(row)) {
            this.selection.select(row);
          }
        }
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
    // ✅ Add comprehensive null guards
    if (!row || 
        !ValidationHelper.hasRowKey(row, this.selectedRowKey) || 
        !this.selectedIds) {
      return false;
    }
    
    return this.selectedIds.has(row[this.selectedRowKey]);
  }

  getQueryParams(url: string): Record<string, string | string[]> {
    return QueryParamsHelper.parseQueryParams(url);
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


  // Optimized getRowBackground - simple O(1) lookup
  getRowBackground(row: any): string | null {
    // Early return if no background function is provided
    if (!this.rowsConfig.backgroundApplyFunction) {
      return null;
    }

    const rowId = row?.id || row?.[this.selectedRowKey] || JSON.stringify(row);
    
    // If not computed yet, compute on-demand (fallback)
    if (!this.computedRowBackgrounds.has(rowId)) {
      try {
        const background = this.rowsConfig.backgroundApplyFunction(row);
        this.computedRowBackgrounds.set(rowId, background);
        return background;
      } catch (error) {
        console.warn('Error computing row background:', error);
        return null;
      }
    }
    
    return this.computedRowBackgrounds.get(rowId) || null;
  }


  drop(event: CdkDragDrop<any[]>) {
    // ✅ Add null guards to prevent crashes
    if (!this.dataSource?.apiSubject?.value || !Array.isArray(this.dataSource.apiSubject.value)) {
      return;
    }
    
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
    UrlHelper.handleButtonClick(this.router, config);
  }

  handleSecondButtonClick(config: any) {
    UrlHelper.handleSecondaryButtonClick(this.router, config);
  }

  setSelectedRows(){
    // ✅ Add null guards to prevent crashes
    if (!this.dataSource?.apiSubject?.value || 
        !Array.isArray(this.dataSource.apiSubject.value) || 
        !this.selectedRowIds) {
      this.selection.clear();
      this.selectedRows = [];
      this.selectedRowsChange.emit(this.selectedRows);
      return;
    }
    
    this.selection.clear();
    
    // ✅ FIX: Convert array to Set for O(1) lookup instead of O(n) indexOf
    const selectedIdsSet = new Set(this.selectedRowIds);
    
    this.dataSource.apiSubject.value.forEach(row => {
      if (row && 
          ValidationHelper.hasRowKey(row, this.selectedRowKey) && 
          selectedIdsSet.has(row[this.selectedRowKey])) {
        this.selection.select(row);
      }
    });
    
    this.selectedRows = this.selection.selected;
    this.selectedRowsChange.emit(this.selectedRows);
    this.checkAllRowsSelected();
  }

  public resetSelectedRows(){
    this.isAllRowsSelected = false;
    this.selection.clear();
    this.selectedRows = this.selection.selected;
    this.selectedRowsChange.emit(this.selectedRows);
  }

  /** Toggles the expanded state of an element. */
  public toggleExpand(element: any) {
    if (!this.isExpansion || !element) {
      return;
    }
    
    const rowId = this.getRowIdentifier(element);
    
    if (this.expandedRowIds.has(rowId)) {
      this.expandedRowIds.delete(rowId);
    } else {
      this.expandedRowIds.add(rowId);
    }
  }

  public expandAllRow(){
    if (!this.isExpansion || !this.dataSource?.apiSubject?.value) {
      return;
    }
    
    this.isAllExpanded = !this.isAllExpanded;
    
    if (this.isAllExpanded) {
      // Add all row IDs to expanded set
      this.dataSource.apiSubject.value.forEach(row => {
        const rowId = this.getRowIdentifier(row);
        this.expandedRowIds.add(rowId);
      });
    } else {
      // Clear all expanded rows
      this.expandedRowIds.clear();
    }
  }
}
