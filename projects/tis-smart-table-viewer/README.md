
# TIS Smart Table Viewer

`@servicemind.tis/tis-smart-table-viewer` is an Angular component library that provides a highly configurable and reusable smart table component for enterprise applications.

---

## 🌟 Features

- Customizable columns and templates
- Filter form integration with URL syncing
- Column customization templates with API integration
- Internationalization support (e.g., Transloco)
- Custom row background styling
- Built-in pagination and sorting
- Dynamic slot and template injection for full control

---

## 🚀 Installation

```bash
npm install @servicemind.tis/tis-smart-table-viewer
```

---

## 🔧 Usage Example

### `app.component.html`

```html
<ng-container *transloco="let t; read: 'serviceManagement.serviceRequestListComponent'">
  <tis-smart-table-viewer
    #mainTableWrapper
    [columnCustomizationUrlConfig]="columnCustomizationUrlConfig"
    [t]="t"
    componentName="cm-service-request"
    [mainTitle]="t('list')"
    [breadcrumbs]="[{url: '/admin/service-management/cases', name: t('breadcrumb')}]"
    [columnsCodeMapping]="columnsCodeMapping"
    [searchPlaceholder]="t('searchPlaceholder')"
    [loadDataApiBaseUrl]="loadDataApiBaseUrl"
    [(pageSize)]="pageSize"
    [(pageIndex)]="pageIndex"
    [hideHeader]="true"
    [rowsConfig]="rowsConfig"
    [filterFormGroup]="filterFormGroup"
    [keepFilterInUrl]="false"
    [dataNotFoundConfig]="{
        title: t('noDataFound'),
        desc: t('noDataFoundDescription'),
        btnText: t('addNew'),
        btnUrl: '/admin/service-management/cases/add'
    }"
  >
    <!-- Custom slots like filter buttons, filter section, templates, etc. -->
  </tis-smart-table-viewer>
</ng-container>
```

### `app.component.ts`

```ts
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import {
  SmartTableWrapperColumnsConfig,
  SmartTableWrapperRowsConfig,
  TisSmartTableViewerComponent,
  ColumnCustomizationUrlConfig
} from 'tis-smart-table-viewer';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  @ViewChild('mainTableWrapper') tableListViewWrapperComponent!: TisSmartTableViewerComponent;

  columnsCodeMapping: SmartTableWrapperColumnsConfig[] = [
    { name: 'action', serverKeyCode: 'action', type: 'action', sort: false, template: this.actionColumnTemplate },
    { name: 'description', serverKeyCode: 'description', type: 'string', sort: true, template: this.descriptionColumnTemplate },
    { name: 'sourceOfRequest', serverKeyCode: 'sourceOfRequest', type: 'string', template: this.sourceOfReColumnTemplate },
    { name: 'status', serverKeyCode: 'cmStatusId', type: 'string', template: this.statusColumnTemplate },
    // Add more columns as needed...
  ];

  @ViewChild('actionColumnTemplate') set actionColumnTemplate(tpl: TemplateRef<any>) {
    this.setColumnTemplate('action', tpl);
  }
  @ViewChild('descriptionColumnTemplate') set descriptionColumnTemplate(tpl: TemplateRef<any>) {
    this.setColumnTemplate('description', tpl);
  }
  @ViewChild('sourceOfReColumnTemplate') set sourceOfReColumnTemplate(tpl: TemplateRef<any>) {
    this.setColumnTemplate('sourceOfRequest', tpl);
  }
  @ViewChild('statusColumnTemplate') set statusColumnTemplate(tpl: TemplateRef<any>) {
    this.setColumnTemplate('status', tpl);
  }

  filterFormGroup!: FormGroup;
  isShowFilter = false;
  pageSize = 10;
  pageIndex = 0;
  loadDataApiBaseUrl = 'https://mocki.io/v1/2f34e933-74dc-4433-83ac-b66991f7e472';
  columnCustomizationUrlConfig: ColumnCustomizationUrlConfig = {
    list: '/user-customization/get-columns-templates',
    add: '/user-customization/add-columns-template',
    update: '/user-customization/update-columns-template',
    delete: '/user-customization/delete-columns-template',
    getSelectedTemplate: '/user-customization/get-selected-columns-template',
    updateSelectedTemplate: '/user-customization/update-selected-columns-template'
  };

  rowsConfig: SmartTableWrapperRowsConfig = {
    backgroundApplyFunction: (row: any) => row.viewsCount === 0 ? '#f2f6fc' : null
  };

  ngOnInit() {
    this.filterFormGroup = new FormGroup({
      type: new FormControl(null)
    });
  }

  setColumnTemplate(name: string, template: TemplateRef<any>) {
    const col = this.columnsCodeMapping.find(c => c.name === name);
    if (col) col.template = template;
    this.columnsCodeMapping = [...this.columnsCodeMapping];
  }

  filterRecords() {
    this.tableListViewWrapperComponent.filterRecords();
    this.changeFilterVisibility();
  }

  changeFilterVisibility() {
    this.isShowFilter = !this.isShowFilter;
    this.tableListViewWrapperComponent.isShowFilter = this.isShowFilter;
  }

  onReset() {
    this.filterFormGroup.reset();
    this.filterRecords();
  }
}
```

---

## 🧠 Key Interfaces

### `SmartTableWrapperColumnsConfig`

```ts
export interface SmartTableWrapperColumnsConfig {
    name: string;
    type: 'string' | 'number' | 'quantity' | 'money' | 'date' | 'date-time' | 'date-time-with-seconds' | 'action';
    align?: 'left' | 'right' | 'center' | null;
    serverKeyCode: string;
    valueKey?: string;
    template?: TemplateRef<any>;
    sort: boolean;
    clickFn?: (rec: any, event?: MouseEvent) => void;
    filterFormKey?: string;
    transformQueryParamFn?: Function;
}
```

### `SmartTableWrapperRowsConfig`

```ts
export interface SmartTableWrapperRowsConfig {
    backgroundApplyFunction?: (row: any) => string | null;
}
```

### `SelectedFilterDisplayValueType`

```ts
export type SelectedFilterDisplayValueType = {
    value: any | any[] | null;
    labelKey?: string | number | null;
    valueKey: any | null;
    formControlName: string;
    formControlType: 'input' | 'radio' | 'date' | 'date-time' | 'toggle' | 'checkbox' | 'chip' | 'select' | 'search-select';
    isSingleValue?: boolean;
    selectedObjData?: any;
};
```

### `SelectedFilterDisplayValuesType`

```ts
export type SelectedFilterDisplayValuesType = SelectedFilterDisplayValueType[];
```

### `AnyKeyValueObject`

```ts
export type AnyKeyValueObject = Record<string, any>;
```

### `SelectedFiltersGroupedValuesType`

```ts
export type SelectedFiltersGroupedValuesType = {
    formControlName: string;
    formControlType: string;
    arrValues: SelectedFilterDisplayValueType[];
};
```

### `ColumnCustomizationUrlConfig`

```ts
export interface ColumnCustomizationUrlConfig {
    list: string;
    add: string;
    update: string;
    delete: string;
    getSelectedTemplate: string;
    updateSelectedTemplate: string;
}
```

### `DataNotFoundConfig`

```ts
export type DataNotFoundConfig = {
    title: string;
    desc: string;
    btnText?: string | null;
    btnUrl?: string | null;
    btnClick?: null | ((rec: any, event?: MouseEvent) => void);
    secondBtnText?: string | null;
    secondBtnUrl?: string | null;
    secondBtnClick?: null | ((rec: any, event?: MouseEvent) => void);
};
```

---

## 📦 Module Setup

Make sure to import `TisSmartTableViewerModule` and necessary Angular Material modules in your app module or standalone components.

---


## 🤝 Contributing

1. Clone the repo
2. Run `npm install`
3. Use the demo app to test (`projects/` directory)
4. Submit a PR or issue with details

---

## 🚀 Publishing to npm

```bash
git tag v1.0.0
git push origin v1.0.0
```

GitHub Actions will build and publish to npm automatically if configured.

---

## 📬 Support / Questions

For bugs, suggestions, or feature requests, please open an issue on the [GitHub repository](https://github.com/Thai-Informatics-System/tis-smart-table-viewer).

---

> Made with ❤️ by [Thai Informatic Systems Co. Ltd](https://tis.co.th/)
