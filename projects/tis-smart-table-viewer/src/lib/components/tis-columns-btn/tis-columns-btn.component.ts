import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { UserCustomizationService } from '../../services/user-customization.service';
import { TisHelperService } from '../../services/tis-helper.service';
import { TisSmartTableConfirmationDialogComponent } from '../tis-smart-table-confirmation-dialog/tis-smart-table-confirmation-dialog.component';
import { CreateColumnsTemplateComponent } from '../create-columns-template/create-columns-template.component';
import type { ColumnCustomizationUrlConfig } from '../../interfaces/url-config.type';

@Component({
    selector: 'tis-columns-btn',
    templateUrl: './tis-columns-btn.component.html',
    styleUrl: './tis-columns-btn.component.css',
    standalone: false
})
export class TisColumnsBtnComponent {
  static readonly COMPONENT_NAME = 'TisColumnsBtnComponent';

  @Input({ required: true }) columnCustomizationUrlConfig!: ColumnCustomizationUrlConfig;
  @Input() t: any = {};
  @Input({required: true}) componentName!: string;
  @Input({required: true}) defaultColumns!: string[];
  @Input({required: true}) columns!: string[];
  @Input() skipTranslation: boolean = false;
  @Input() customColumns?: object;

  @Output() displayedColumnsChange = new EventEmitter();
  @Output() fromStartColumnNumberChange = new EventEmitter();
  @Output() fromEndColumnNumberChange = new EventEmitter();

  selectedTemplate: any = {
    id: -1,
    name: 'Default'
  };
  displayedColumns: any[] = [];
  templates: any[] = [];
  isDeleteTemplate = false;
  isEditTemplate = false;

  constructor(
    private helper: TisHelperService,
    private userCustomizationService: UserCustomizationService,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    this.getColumnsTemplates();
    // setTimeout(() => {
    //   this.createNewTemplateDialog();
    // }, 2000);
  }

  public createNewTemplateDialog(stData: any = null) {
    if(!this.componentName) return;

    let data = {
      name: stData ? stData.name : null,
      enableStickiness: stData ? stData.enableStickiness : false,
      fromStartColumnNumber: stData ? stData.fromStartColumnNumber : 0,
      fromEndColumnNumber: stData ? stData.fromEndColumnNumber : 0,
      listComponentName: this.componentName,
      selectedTemplateId: stData ? stData?.id : null,
      defaultSelectedState: stData && stData?.id ? false : true,
      defaultColumns: this.defaultColumns,
      columns: this.columns,
      displayColumns: stData ? stData?.displayColumns?.split(',') : this.displayedColumns,
      t: this.t,
      skipTranslation: this.skipTranslation,
      customColumns: this.customColumns
    };

    const dialogRef = this.dialog.open(CreateColumnsTemplateComponent, {
      width: "35%",
      minWidth: '370px',
      data: data,
      panelClass: ['tis-create-new-columns-template'],
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((res) => {
      if (res) {
        console.log("=== createNewTemplateDialog ===", res);
        
        if(res?.isUpdated){
          this.templates = this.templates?.map(t =>{
            if(t.id == res?.id){
              t = res;
            }
            return t;
          });
        }
        else{
          this.templates = [res, ...this.templates];
        }
        this.selectedTemplate = res;
        this.changeDisplayColumns();
      }
    });
  }

  getColumnsTemplates() {
    this.userCustomizationService.getColumnsTemplates(this.columnCustomizationUrlConfig.list, this.componentName).subscribe(r => {
      console.log("getColumnsTemplates:", r.data);
      this.templates = r?.data ?? [];
      setTimeout(() => {
        this.getSelectedColumnsTemplate();
      }, 100);
    });
  }

  getSelectedColumnsTemplate() {
    this.userCustomizationService.getSelectedColumnsTemplate(this.columnCustomizationUrlConfig.getSelectedTemplate, this.componentName).subscribe((r) => {
      console.log("getSelectedColumnsTemplate:", r.data);
      if (r?.data && Object.keys(r?.data).length != 0) {
        if(r.data?.listComponentColumnsTemplateId > 0){
          this.selectedTemplate = this.templates?.find((t: any) => t.id == r.data?.listComponentColumnsTemplateId);
        }
        console.log("getSelectedColumnsTemplate:", this.templates, this.selectedTemplate);
        this.changeDisplayColumns();
      }
    });
  }

  onSelectedTemplate(templateId: number){
    setTimeout(() => {
      if(this.isDeleteTemplate){
        console.log("onSelectedTemplate:", this.isDeleteTemplate);
        let confirmBoxData: any = {
          title: "Delete template",
          message: `Are you sure you want to delete this template?`,
          iconClass: "tis-text-danger",
          icon: "delete",
          approveButtonText: "Yes, Confirm",
          approveButtonClass: "tis-btn-danger",
          cancelButtonText: "Cancel",
          cancelButtonClass: "tis-btn-primary"
        };
    
        const dialogRef = this.dialog.open(TisSmartTableConfirmationDialogComponent, {
          width: "30%",
          minWidth: '370px',
          // panelClass: ['tis-simple-confirmation'],
          data: confirmBoxData,
          disableClose: true,
        });
    
        dialogRef.afterClosed().subscribe((result) => {
          console.log("The dialog was closed with result:", result);
          if (result) {
            this.userCustomizationService.deleteColumnsTemplate(this.columnCustomizationUrlConfig.delete, {id: templateId, isSelectedTemplate: this.selectedTemplate?.id == templateId}).subscribe((r) => {
              this.helper.showSuccessMsg('Columns template has been deleted successfully', 'Done');
              this.templates.splice(this.templates.findIndex(ee => ee.id == templateId), 1);
              if(this.selectedTemplate?.id == templateId){
                this.selectedTemplate = {
                  id: -1,
                  name: 'Default',
                  fromStartColumnNumber: 0,
                  fromEndColumnNumber: 0,
                };
                this.changeDisplayColumns();
              }
            });
          }
        });
      }
      else if(this.isEditTemplate){
        console.log("onSelectedTemplate:", this.isEditTemplate);
        let st = this.templates?.find((t: any) => t.id == templateId);
        this.createNewTemplateDialog(st);
      }
      else{
        if(this.selectedTemplate?.id != templateId){
          if(templateId > 0){
            this.selectedTemplate = this.templates?.find((t: any) => t.id == templateId);
          }
          else{
            this.selectedTemplate = {
              id: -1,
              name: 'Default'
            };
          }

          this.userCustomizationService.updateSelectedColumnsTemplate(this.columnCustomizationUrlConfig.updateSelectedTemplate, {id: this.selectedTemplate?.id, listComponentName: this.componentName}).subscribe((r) => {
            this.changeDisplayColumns();
          });
        }
      }

      this.isDeleteTemplate = false;
      this.isEditTemplate = false;
    }, 200);  
  }

  changeDisplayColumns(){
    if(this.selectedTemplate?.id > 0){
      this.displayedColumns = this.selectedTemplate.displayColumns?.split(',')
    }
    else{
      this.displayedColumns = this.defaultColumns;
    }

    this.displayedColumnsChange.emit(this.displayedColumns);
    this.fromStartColumnNumberChange.emit(this.selectedTemplate?.fromStartColumnNumber ?? 0);
    this.fromEndColumnNumberChange.emit(this.selectedTemplate?.fromEndColumnNumber ?? 0);
  }
}
