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
];

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TranslocoModule, TisSmartTableViewerModule, CommonModule, FormsModule, ReactiveFormsModule, RouterLink, ...uiImports],
  providers: [provideTranslocoScope('serviceManagement')],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'tis-ng-smart-table-viewer';
  @ViewChild('mainTableWrapper') tableListViewWrapperComponent!: TisSmartTableViewerComponent;

  defaultColumnsCodeMapping: SmartTableWrapperColumnsConfig[] = [
    { name: "action", type: 'action', serverKeyCode: "action", template: this.actionColumnTemplate, sort: false },
    { name: "caseNumber", type: 'string', serverKeyCode: "displayId", valueKey: 'displayId', sort: true, clickFn: this.detailsRecord.bind(this) },
    { name: "image", type: 'string', serverKeyCode: "image", template: this.imageColumnTemplate, sort: false },
    { name: "description", type: 'string', serverKeyCode: "description", template: this.descriptionColumnTemplate, sort: true },
    { name: "serviceRequestType", type: 'string', serverKeyCode: "serviceRequestTypeName", valueKey: 'serviceRequestTypeName', sort: true, clickFn: this.detailsRecord.bind(this) },
    { name: "reportedHouse", type: 'string', serverKeyCode: "reportedByUnitHouse", valueKey: 'reportedByUnitHouse', sort: true },
    { name: "reportedResident", type: 'string', serverKeyCode: "reportedBy", valueKey: 'reportedBy', sort: true },
    { name: "sourceOfRequest", type: 'string', serverKeyCode: "sourceOfRequest", template: this.sourceOfReColumnTemplate, sort: true },
    { name: "status", type: 'string', serverKeyCode: "cmStatusId", template: this.statusColumnTemplate, sort: true },
    { name: "dateCreated", type: 'date-time-with-seconds', serverKeyCode: "createdAt", valueKey: 'createdAt', sort: true },
    { name: "scheduledDate", type: 'date-time-with-seconds', serverKeyCode: "scheduledAt", valueKey: 'scheduledAt', sort: true },
    { name: "dateClosed", type: 'date-time-with-seconds', serverKeyCode: "dateClosed", valueKey: 'dateClosed', sort: true },
    { name: "createdBy", type: 'string', serverKeyCode: "createdByName", valueKey: 'createdByName', sort: false },
  ];

  columnsCodeMapping: SmartTableWrapperColumnsConfig[] = this.defaultColumnsCodeMapping;

  @ViewChild('imageColumnTemplate') set imageColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('image', value);
  }

  @ViewChild('statusColumnTemplate') set statusColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('status', value);
  }

  @ViewChild('descriptionColumnTemplate') set descriptionColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('description', value);
  }

  @ViewChild('sourceOfReColumnTemplate') set sourceOfReColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('sourceOfRequest', value);
  }

  @ViewChild('dateColumnTemplate') set dateColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('date', value);
  }

  @ViewChild('areaColumnTemplate') set areaColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('area', value);
  }

  @ViewChild('actionColumnTemplate') set actionColumnTemplate(value: TemplateRef<any>) {
    this.setColumnTemplateMapping('action', value);
  }

  pageSize = 10;
  pageIndex = 0;
  loadDataApiBaseUrl = `https://mocki.io/v1/e5774f40-933a-41cf-8005-1921f7ee4dcc`;
  filterData!: any;

  filterFormGroup!: FormGroup;
  isShowFilter = false;

  columnCustomizationUrlConfig!: ColumnCustomizationUrlConfig;

  selectedRows: any[] = [];
  selectedRowIds: any[] = ["1816", "1915"];

  rowsConfig: SmartTableWrapperRowsConfig = {
    backgroundApplyFunction: (row: any) => {
      if (row?.viewsCount == 0) {
        return '#f2f6fc'; // Light grey
      } else {
        return null; // No background change
      }
    }
  };

  constructor(
    private router: Router,
    private translocoService: TranslocoService,
  ) { }

  ngOnInit(): void {
    this.columnCustomizationUrlConfig = {
      list: '/user-customization/get-columns-templates',
      add: '/user-customization/add-columns-template',
      update: '/user-customization/update-columns-template',
      delete: '/user-customization/delete-columns-template',
      getSelectedTemplate: '/user-customization/get-selected-columns-template',
      updateSelectedTemplate: '/user-customization/update-selected-columns-template'
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
      type: new FormControl(null),
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

  get getLanguageJson(){
    let translations = this.translocoService.translateObject('serviceRequestListComponent', {}, 'serviceManagement');
    // console.log("==== translation::getLanguageJson ====", translations);
    return translations;
  }

  selectedRowsChanged(selectedRows: any) {
    this.selectedRows = selectedRows;
    console.log("=== selectedRowsChanged ===", this.selectedRows);
  }
}
