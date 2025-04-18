import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component, Inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TisHelperService } from '../services/tis-helper.service';
import { UserCustomizationService } from '../services/user-customization.service';

@Component({
    selector: 'app-create-columns-template',
    templateUrl: './create-columns-template.component.html',
    styleUrl: './create-columns-template.component.scss',
    standalone: false
})
export class CreateColumnsTemplateComponent {
  loading: boolean = false;
  updatingTemplate: boolean = false;
  savingTemplate: boolean = false;
  columns: any = [];
  displayedColumns: any = [];
  listComponentColumns: any;
  listComponentColumnsTemplateDetail: any;
  form!: FormGroup;
  userId!: number;
  translationReadKey!: string
  customColumns: any;
  t: any;

  constructor(
    public dialogRef: MatDialogRef<CreateColumnsTemplateComponent>,
    private helper: TisHelperService,
    private snackBar: MatSnackBar,
    private userCustomizationService: UserCustomizationService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    // private translocoService: TranslocoService,
  ) {
    this.translationReadKey = this.data?.translationReadKey ?? '';
    
    if(this.data?.customColumns){
      this.customColumns = this.data?.customColumns ?? {};
    }
    
    // this.dialogRef.addPanelClass(['lg-w-45-per']);
  }

  ngOnInit(): void {
    this.t = this.data?.t || {};
    this.columns = JSON.parse(JSON.stringify(this.data.columns));
    this.displayedColumns = JSON.parse(JSON.stringify(this.data.displayColumns));
    this.displayedColumns = this.data.displayColumns;

    if(this.data?.defaultSelectedState == null || this.data?.defaultSelectedState == 'undefined') {
      this.data.defaultSelectedState = true;
    }

    if(this.data?.selectedTemplateId && this.displayedColumns?.length){
      this.columns = this.helper.sortArrayByOrder(JSON.parse(JSON.stringify(this.columns)), JSON.parse(JSON.stringify(this.displayedColumns)));
    }
    
    this.listComponentColumns = this.columns.map((col: any, ndx: number) => ({ id: ndx + 1, isSelected: this.data?.defaultSelectedState === true ? true : (this.displayedColumns?.indexOf(col) >= 0 ? true : false), column: col }));

    this.createForm();

    // this.store.select('auth').subscribe((authState: fromAuth.State) => {
    //   console.log('Current AuthState:', authState);
    //   if(authState?.user?.id){
    //     this.userId = authState.user.id;
    //   }
    // })
  }

  ngAfterViewInit(){
    // this.translocoService.selectTranslate('lang', {}, 'shared').subscribe((translation: string) => {
    //   this.tl = this.translocoService.translateObject('createColumnsTemplateComponent', {}, 'shared');
    // });
  }

  createForm() {
    this.form = new FormGroup({
      name: new FormControl(this.data?.name ?? '', Validators.required),
      enableStickiness: new FormControl(true),
      fromStartColumnNumber: new FormControl(this.data?.fromStartColumnNumber ? Number(this.data?.fromStartColumnNumber) : 0, Validators.required),
      fromEndColumnNumber: new FormControl(this.data?.fromEndColumnNumber ? Number(this.data?.fromEndColumnNumber) : 0, Validators.required),
    });
  }

  get name(){
    return (this.form.get('name') as FormControl)
  }
  
  get listComponentColumnsTemplateName(){
    return this.name.value;
  }

  get orgDisplayColumns(){
    return this.displayedColumns;
  }

  drop(event: CdkDragDrop<string[]>) {
    moveItemInArray(this.listComponentColumns, event.previousIndex, event.currentIndex);
  }

  onSubmit() {
    const orgDisplayColumns = this.orgDisplayColumns;

    if(this.form.invalid){
      return ;
    }

    //  Get selected columns (first filter on selected column and then get column array)
    this.displayedColumns = this.listComponentColumns.filter((r: any) => { if(r.isSelected) return r.column } ).map((r: any) => r.column);
    if(this.displayedColumns.length <= 0){
      this.snackBar.open("Please select at least one column", "ok", {
        duration: 4000
      })
      return ;
    }
    console.log('new and org display columns: ', this.displayedColumns, orgDisplayColumns);

    this.acceptTemplateNameAndSave();

  }

  acceptTemplateNameAndSave() {
    let data = {
      listComponentName: this.data.listComponentName,
      name: this.name.getRawValue(),
      enableStickiness: this.form.getRawValue().enableStickiness,
      fromStartColumnNumber: this.form.getRawValue().fromStartColumnNumber,
      fromEndColumnNumber: this.form.getRawValue().fromEndColumnNumber,
      defaultColumns: this.columns.join(),
      displayColumns: this.displayedColumns.join()
    }

    console.log('save value: ', data);
  
    this.savingTemplate = true;
    this.loading = true;
    if(this.data?.selectedTemplateId){
      this.userCustomizationService.updateColumnsTemplate({id: this.data?.selectedTemplateId, ...data}).subscribe(r => {
        console.log("add response: ", r);
        // this.loading = false;
        this.helper.showSuccessMsg(r.message, 'Success');
        let selectedTemplate = {
          ...r.data,
          ...data,
          isUpdated: true,
        }
        this.onClose(selectedTemplate);
      }, err => {
        this.loading = false;
        this.savingTemplate = false;
        this.helper.showHttpErrorMsg(err);
      })
    }
    else{
      this.userCustomizationService.addColumnsTemplate(data).subscribe(r => {
        console.log("add response: ", r);
        // this.loading = false;
        this.helper.showSuccessMsg(r.message, 'Success');
        let selectedTemplate = {
          ...r.data,
          ...data
        }
        this.onClose(selectedTemplate);
      }, err => {
        console.log(err);
        this.loading = false;
        this.savingTemplate = false;
        this.helper.showHttpErrorMsg(err);
      })
    }
  }

  onChangeColumnStatus(status: boolean, data: any){
    if(status == false){
      let leftColumn = data.id;
      let rightColumn = this.listComponentColumns?.length - (data.id - 1);
      let formValue = this.form.getRawValue();
      if(formValue?.fromStartColumnNumber == leftColumn){
        this.form.patchValue({
          fromStartColumnNumber: 0
        });
      }

      if(formValue?.fromEndColumnNumber == rightColumn){
        this.form.patchValue({
          fromEndColumnNumber: 0
        });
      }
    }
  }

  onClose(data: any = null){
    this.dialogRef.close(data);
  }
}
