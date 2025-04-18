export type SelectedFilterDisplayValueType = {
    value: any | any[] | null,
    labelKey?: string | number | null,
    valueKey: any | null;
    formControlName: string,
    formControlType: 'input' | 'radio' | 'date' | 'date-time' | 'toggle' | 'checkbox' | 'chip' | 'select' | 'search-select',
    isSingleValue?: boolean,   // In case of 'input' | 'radio' | 'date' | 'date-time' | 'toggle' if not passed defaults to be true, otherwise false...
    selectedObjData?: any
}
export type SelectedFilterDisplayValuesType = SelectedFilterDisplayValueType[];


export type AnyKeyValueObject = Record<string, any>;

 
export type SelectedFiltersGroupedValuesType = {
    formControlName: string,
    formControlType: string,
    arrValues: SelectedFilterDisplayValueType[]
};
