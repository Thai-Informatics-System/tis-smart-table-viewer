import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ClassPrefixHelper } from '../../helpers/class-prefix.helper';

@Component({
  selector: 'tis-smart-table-confirmation-dialog',
  standalone: false,
  templateUrl: './tis-smart-table-confirmation-dialog.component.html',
  styleUrl: './tis-smart-table-confirmation-dialog.component.css'
})
export class TisSmartTableConfirmationDialogComponent {
  classPrefix = ClassPrefixHelper.DEFAULT_PREFIX;

  constructor(
    public dialogRef: MatDialogRef<TisSmartTableConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.classPrefix = this.data?.classPrefix ?? ClassPrefixHelper.DEFAULT_PREFIX;
    this.dialogRef.addPanelClass([ClassPrefixHelper.cx(this.classPrefix, 'smart-table-confirmation-dialog')]);
  }

  onClose(status: boolean | null): void {
    this.dialogRef.close(status);
  }
}
