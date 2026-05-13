import { TemplateRef } from "@angular/core";

export interface SmartTableWrapperColumnsConfig {
    name: string;
    columnName?: string;
    columnDef?: string;
    type: 'string' | 'number' | 'quantity' | 'money' | 'date' | 'date-time' | 'date-time-with-seconds' | 'action' | 'expand';
    align?: 'left' | 'right' | 'center' | null;
    serverKeyCode: string;
    valueKey?: string;
    template?: TemplateRef<any>;
    sort: boolean;
    clickFn?: (rec: any, event?: MouseEvent) => void;
    /** Function that returns routerLink value - enables right-click "Open in new tab" */
    linkFn?: (row: any) => string | any[];
    filterFormKey?: string;
    transformQueryParamFn?: Function;
}

/**
 * Maps column value types to their custom format strings.
 * - For 'date' / 'date-time' / 'date-time-with-seconds': Luxon format string (e.g. 'yyyy/MM/dd', 'dd-MM-yyyy HH:mm')
 * - For 'quantity': Angular DecimalPipe digitsInfo string (e.g. '1.2-2', '1.0-0')
 * - For 'money': number of decimal places (e.g. '4', '0')
 * - For 'number': Angular DecimalPipe digitsInfo string
 * - For 'string': unused (reserved for future use)
 *
 * Example:
 * {
 *   'date': 'yyyy/MM/dd',
 *   'date-time': 'dd-MM-yyyy HH:mm',
 *   'money': '2',
 *   'quantity': '1.4-4',
 *   'number': '1.1-1'
 * }
 */
export type ColumnValueTypeFormats = Partial<Record<'number' | 'quantity' | 'money' | 'date' | 'date-time' | 'date-time-with-seconds', string>>;


export interface SmartTableWrapperRowsConfig {
    backgroundApplyFunction?: (row: any) => string | null;
}