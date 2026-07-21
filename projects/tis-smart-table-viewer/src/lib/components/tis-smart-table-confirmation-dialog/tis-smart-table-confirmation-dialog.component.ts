import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'tis-smart-table-confirmation-dialog',
  standalone: false,
  templateUrl: './tis-smart-table-confirmation-dialog.component.html',
  styleUrl: './tis-smart-table-confirmation-dialog.component.css'
})
export class TisSmartTableConfirmationDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<TisSmartTableConfirmationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.dialogRef.addPanelClass(['tis-smart-table-confirmation-dialog']);
  }

  onClose(status: boolean | null): void {
    this.dialogRef.close(status);
  }
}
