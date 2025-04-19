import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'tis-smart-table-error-dialog',
  standalone: false,
  templateUrl: './tis-smart-table-error-dialog.component.html',
  styleUrl: './tis-smart-table-error-dialog.component.css'
})
export class TisSmartTableErrorDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TisSmartTableErrorDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }
}
