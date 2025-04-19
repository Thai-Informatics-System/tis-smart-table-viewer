import { NgModule } from '@angular/core';
import { TisSmartTableViewerComponent } from './components/tis-smart-table-viewer/tis-smart-table-viewer.component';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterLink, RouterOutlet } from '@angular/router';
import { LayoutModule } from '@angular/cdk/layout';
import { MatPaginatorModule } from '@angular/material/paginator';
import { TisColumnsBtnComponent } from './components/tis-columns-btn/tis-columns-btn.component';
import { TisSmartTableConfirmationDialogComponent } from './components/tis-smart-table-confirmation-dialog/tis-smart-table-confirmation-dialog.component';
import { TisSmartTableErrorDialogComponent } from './components/tis-smart-table-error-dialog/tis-smart-table-error-dialog.component';
import { CreateColumnsTemplateComponent } from './components/create-columns-template/create-columns-template.component';
import { MatDialogModule } from '@angular/material/dialog';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatTableModule } from '@angular/material/table';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { ScrollingDirective } from './directives/scrolling/scrolling.directive';
import { TisDatePipe } from './pipes/tis-date.pipe';
import { TisDateTimePipe } from './pipes/tis-date-time.pipe';
import { TisDateTimeWithSecondsPipe } from './pipes/tis-date-time-with-seconds.pipe';
import { Quantity } from './pipes/quantity.pipe';
import { Money } from './pipes/money.pipe';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';


const directives = [
  ScrollingDirective
];

const pipes = [
  TisDatePipe,
  TisDateTimePipe,
  TisDateTimeWithSecondsPipe,
  Quantity,
  Money,
];

const uiImports = [
  MatTooltipModule,
  MatIconModule,
  MatFormFieldModule,
  MatSelectModule,
  MatInputModule,
  MatSnackBarModule,
  MatProgressSpinnerModule,
  MatButtonModule,
  MatPaginatorModule,
  LayoutModule, // For Breakpoint Observer,
  MatDialogModule,
  MatTableModule,
  MatCheckboxModule,
  MatMenuModule,
  MatDividerModule
];


@NgModule({
  declarations: [
    ...directives,
    ...pipes,
    TisSmartTableViewerComponent,
    TisColumnsBtnComponent,
    CreateColumnsTemplateComponent,
    TisSmartTableViewerComponent,
    TisSmartTableErrorDialogComponent,
    TisSmartTableConfirmationDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterLink,
    RouterOutlet,
    ...uiImports,
    DragDropModule
  ],
  exports: [
    TisSmartTableViewerComponent
  ]
})
export class TisSmartTableViewerModule { }
