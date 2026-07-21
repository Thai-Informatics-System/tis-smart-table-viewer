import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClassPrefixHelper } from '../../helpers/class-prefix.helper';

@Component({
  selector: 'tis-smart-table-error-dialog',
  standalone: false,
  templateUrl: './tis-smart-table-error-dialog.component.html',
  styleUrl: './tis-smart-table-error-dialog.component.css'
})
export class TisSmartTableErrorDialogComponent {
  classPrefix = ClassPrefixHelper.DEFAULT_PREFIX;

  constructor(
    public dialogRef: MatDialogRef<TisSmartTableErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.classPrefix = this.data?.classPrefix ?? ClassPrefixHelper.DEFAULT_PREFIX;
    this.dialogRef.addPanelClass([this.cx('smart-table-error-dialog')]);
  }

  cx(name: string): string {
    return ClassPrefixHelper.cx(this.classPrefix, name);
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
