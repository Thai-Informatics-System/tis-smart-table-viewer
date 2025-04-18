import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, TextOnlySnackBar } from '@angular/material/snack-bar';
import { TisSmartTableErrorDialogComponent } from '../tis-smart-table-error-dialog/tis-smart-table-error-dialog.component';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class TisHelperService {

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog,
    private http: HttpClient
  ) { }

  showHttpErrorMsg(error: HttpErrorResponse, duration = 5000) {
    console.log('httpError: ', error);

    let errorMessage = 'Some Unknown Error Occurred.';
    let errorCode = 'Unknown Error';
    const httpError = error;

    if (httpError.status >= 400) {
      const errorFromServer = httpError.error;
      if (Array.isArray(errorFromServer) && errorFromServer.length > 0) {
        errorMessage = errorFromServer[0].message;
        errorCode = errorFromServer[0].code;
      }
    } else if (httpError.status < 100) {
      errorMessage = httpError.message;
      errorCode = httpError.statusText;
    }

    if (errorCode == "VALIDATION_ERROR" || errorCode == "NOT_FOUND_ERROR" || errorCode == "THIRD_PARTY_API_ERROR") {
      let confirmBoxData: any = {
        title: "Error !",
        message: errorMessage,
        icon: "error",
        iconClass: "tis-text-danger",
        buttonText: "Ok",
        buttonClass: "tis-btn-primary",
      };

      const dialogRef: MatDialogRef<TisSmartTableErrorDialogComponent> = this.dialog.open(TisSmartTableErrorDialogComponent, {
        width: "550px",
        panelClass: ['tis-simple-confirmation'],
        data: confirmBoxData,
        disableClose: false,
      });

      return dialogRef;

    } else {
      const snackbarRef: MatSnackBarRef<TextOnlySnackBar> = this.snackBar.open(errorMessage, 'Error', { duration: duration });
      return snackbarRef;
    }

  }

  showSuccessMsg(message: string, title: string, duration = 5000) {
    this.snackBar.open(message, title, {
      duration: duration
    })
  }

  showErrorMsg(message: string, title: string, duration = 5000) {
    this.snackBar.open(message, title, {
      duration: duration
    })
  }

  sortArrayByOrder(A: string[], B: string[]): string[] {
    const sortedA = [];
    for (const element of B) {
      const index = A.indexOf(element);
      if (index !== -1) {
        sortedA.push(A[index]);
        A.splice(index, 1);
      }
    }
    return [...sortedA, ...A]; // Combine sorted elements with remaining elements
  }

}