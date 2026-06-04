import { Component, TemplateRef, ViewChild } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { SelectedFilterDisplayValuesType, SelectedFilterDisplayValueType, SmartTableWrapperColumnsConfig, TisSmartTableViewerComponent, TisSmartTableViewerModule } from 'tis-smart-table-viewer';
import type { ColumnCustomizationUrlConfig, SmartTableWrapperRowsConfig } from 'tis-smart-table-viewer';
import { TranslocoModule, TranslocoService, provideTranslocoScope } from '@ngneat/transloco';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { LayoutModule } from '@angular/cdk/layout';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialogModule } from '@angular/material/dialog';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ClientSideMultipleSelectionConfig, ClientSideSingleSelectionConfig, ServerSideSingleSelectionConfig, TisSearchAndSelectDropdownModule } from '@servicemind.tis/tis-search-and-select-dropdown';


const uiImports = [
  MatTooltipModule,
  MatMenuModule, MatButtonModule, MatTableModule, CdkTableModule,
  MatIconModule, MatDividerModule,
  MatFormFieldModule, MatSelectModule, MatCheckboxModule, MatInputModule,
  MatSnackBarModule, MatDialogModule, MatProgressSpinnerModule,
  MatPaginatorModule,
  LayoutModule, // For Breakpoint Observer,
  ScrollingModule, // For cdk-virtual-scroll
  MatSortModule,
  TisSearchAndSelectDropdownModule
];

@Component({
  selector: 'app-root',
  imports: [TranslocoModule, TisSmartTableViewerModule, CommonModule, FormsModule, ReactiveFormsModule, ...uiImports],
  providers: [provideTranslocoScope('common')],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tis-ng-smart-table-viewer';
  @ViewChild('mainTableWrapper') tableListViewWrapperComponent!: TisSmartTableViewerComponent;

  columnsCodeMapping: SmartTableWrapperColumnsConfig[] = [
    { name: "client", type: 'string', serverKeyCode: "name", template: this.clientColumnTemplate, sort: false },
    { name: "phoneNumber", type: 'string', serverKeyCode: "phone", valueKey: 'phone', sort: true },
    { name: "email", type: 'string', serverKeyCode: "email", valueKey: 'email', sort: true },
    { name: "segmentation", type: 'string', serverKeyCode: "segment", valueKey: 'segment', sort: false },
    { name: "twelveMonthSpend", type: 'money', serverKeyCode: "spend", valueKey: 'spend', sort: false },
    { name: "propensity", type: 'string', serverKeyCode: "propensity", template: this.propensityColumnTemplate, sort: false },
    { name: "lastPurchase", type: 'date', serverKeyCode: "lastPurchase", valueKey: 'lastPurchase', sort: true },
    { name: "status", type: 'string', serverKeyCode: "status", template: this.statusColumnTemplate, sort: false },
    { name: "action", type: 'action', serverKeyCode: "action", template: this.actionColumnTemplate, sort: false },
  ];

  @ViewChild('clientColumnTemplate') set clientColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('client', value);
  }
  @ViewChild('propensityColumnTemplate') set propensityColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('propensity', value);
  }
  @ViewChild('statusColumnTemplate') set statusColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('status', value);
  }
  @ViewChild('actionColumnTemplate') set actionColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('action', value);
  }

  documentStatusList: any[] = [
    { id: 0, name: 'Draft' },
    { id: 1, name: 'New' },
    { id: 2, name: 'Pending' },
    { id: 3, name: 'Approved' },
    { id: 4, name: 'Rejected' },
    { id: 5, name: 'Completed' },
  ];

  trackingStatusList: any[] = [
    { id: 2, name: 'Ready for Pickup' },
    { id: 3, name: 'Picked Up' },
    { id: 4, name: 'Delivered' },
    { id: 5, name: 'Received' },
  ];


  pageSize = 10;
  pageIndex = 0;
  loadDataApiBaseUrl = `http://localhost:3000/dev/client-module/clients/list`;
  filterData!: any;

  filterFormGroup!: FormGroup;
  isShowFilter = false;

  columnCustomizationUrlConfig!: ColumnCustomizationUrlConfig;

  selectedRows: any[] = [];
  selectedRowIds: (number | string)[] = [];

  rowsConfig: SmartTableWrapperRowsConfig = {
    backgroundApplyFunction: (row: any) => {
      if (row?.viewsCount == 0) {
        return '#f2f6fc'; // Light grey
      } else {
        return null; // No background change
      }
    }
  };

  config = {
    companyId: <ClientSideSingleSelectionConfig>{
      uri: '/document-distribution/common/get-companies',
      method: 'GET',
      limit: 200,
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
    },
    documentStatusId: <ClientSideMultipleSelectionConfig>{
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
    },
    trackingStatusId: <ClientSideMultipleSelectionConfig>{
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
    },
    lastUpdatedById: <ServerSideSingleSelectionConfig>{
      uri: '/document-distribution/common/get-user-list',
      dataValueKey: 'data',
      method: 'POST',
      limit: 30,
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
      clickRefreshBtn: true,
      additionalName: {
        keys: ['email'],
        separators: ['(,)']
      }
    },
    initiatorId: <ServerSideSingleSelectionConfig>{
      uri: '/document-distribution/common/get-user-list',
      dataValueKey: 'data',
      method: 'POST',
      limit: 30,
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
      clickRefreshBtn: true,
      additionalName: {
        keys: ['email'],
        separators: ['(,)']
      }
    },
    ownerId: <ServerSideSingleSelectionConfig>{
      uri: '/document-distribution/common/get-user-list',
      dataValueKey: 'data',
      method: 'POST',
      limit: 30,
      isSearchable: true,
      isAllOption: false,
      isEnableRefreshMode: false,
      clickRefreshBtn: true,
      additionalName: {
        keys: ['email'],
        separators: ['(,)']
      }
    },
  };


  constructor(
    private router: Router,
    private translocoService: TranslocoService,
  ) { }

  ngOnInit(): void {
    this.columnCustomizationUrlConfig = {
      list: 'http://localhost:3000/dev/user-customisation/get-columns-templates',
      add: 'http://localhost:3000/dev/user-customisation/add-columns-template',
      update: 'http://localhost:3000/dev/user-customisation/update-columns-template',
      delete: 'http://localhost:3000/dev/user-customisation/delete-columns-template',
      getSelectedTemplate: 'http://localhost:3000/dev/user-customisation/get-selected-columns-template',
      updateSelectedTemplate: 'http://localhost:3000/dev/user-customisation/update-selected-columns-template'
    }

    this.createFilterForm();

    this.translocoService.selectTranslate('lang', {}, 'serviceManagement').subscribe((translation: string) => {
      console.log("==== translation ====", translation);
      let t = this.translocoService.translateObject('serviceRequestListComponent', {}, 'serviceManagement');
      console.log("==== translation::t ====", t);
    });
  }

  createFilterForm() {
    this.filterFormGroup = new FormGroup({
      companyId: new FormControl(null),
      documentStatusId: new FormControl(null),
      trackingStatusId: new FormControl(null),
      lastUpdatedById: new FormControl(null),
      initiatorId: new FormControl(null),
      ownerId: new FormControl(null),
      fromDateCreated: new FormControl(null),
      toDateCreated: new FormControl(null),
      fromLastUpdated: new FormControl(null),
      toLastUpdated: new FormControl(null),
      showMyDocumentsOnly: new FormControl(null),
    });
  }

  setColumnTemplateMapping(colName: string, templateVal: TemplateRef<any>) {
    let selectedCol = this.columnsCodeMapping.find(c => c.name == colName);
    if (selectedCol) {
      selectedCol.template = templateVal;
    }
    this.columnsCodeMapping = [...this.columnsCodeMapping];
    console.log('setColumnCodeMapping:', this.columnsCodeMapping);
  }

  /**
  * COPY PASTE AS IT IS, For SmartTable Component (If Filters Are There)
  */
  filterRecords() {
    this.tableListViewWrapperComponent.filterRecords();
    this.changeFilterVisibility();
  }

  changeFilterVisibility() {
    this.isShowFilter = !this.isShowFilter;
    this.tableListViewWrapperComponent.isShowFilter = this.isShowFilter;
  }

  updateSelectedFilterValues(values: SelectedFilterDisplayValueType | SelectedFilterDisplayValuesType) {
    this.tableListViewWrapperComponent?.updateSelectedFilterValues(values);
  }
  /**
  * END OF COPY PASTE AS IT IS, For SmartTable Component (If Filters Are There)
  */

  detailsRecord(element: any) {
    this.router.navigate([`/admin/service-management/cases/details/${element.id}`]);
  }

  onReset() {
    this.filterFormGroup.patchValue({
      type: null,
    });
    this.tableListViewWrapperComponent.getList(true);
  }

  resetSelectedRows(){
    this.tableListViewWrapperComponent.resetSelectedRows();
  }

  toggleExpand(element: any){
    this.tableListViewWrapperComponent.toggleExpand(element);
  }

  get getLanguageJson(){
    let translations = this.translocoService.translateObject('common', {}, 'common');
    // console.log("==== translation::getLanguageJson ====", translations);
    return translations;
  }

  selectedRowsChanged(selectedRows: any) {
    this.selectedRows = selectedRows;
    console.log("=== selectedRowsChanged ===", this.selectedRows);
  }

  onDataLoaded(status: boolean) {
    this.selectedRowIds = ["1816", "1915", "1717"];
    // alert(true);
  }

  onSetExtraData(data: any) {
    console.log("=== onSetExtraData ===", data);
  }

  onSetTotal(total: number) {
    console.log("=== onSetTotal ===", total);
  }

  toggleExpandForMobileResponsive(element: any){
    this.tableListViewWrapperComponent.toggleExpandForMobileResponsive(element);
  }

  isRowExpandedForMobileResponsive(element: any) {
    return this.tableListViewWrapperComponent.isRowExpandedForMobileResponsive(element);
  }

}
