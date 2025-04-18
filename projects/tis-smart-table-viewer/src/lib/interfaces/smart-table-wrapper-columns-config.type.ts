import { TemplateRef } from "@angular/core";

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


export interface SmartTableWrapperRowsConfig {
    backgroundApplyFunction?: (row: any) => string | null;
}