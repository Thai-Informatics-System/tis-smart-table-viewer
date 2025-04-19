export type DataNotFoundConfig = {
    title: string;
    desc: string;
    btnText?: string | null;
    btnUrl?: string | null;
    btnClick?: null | ((rec: any, event?: MouseEvent) => void);
    secondBtnText?: string | null;
    secondBtnUrl?: string | null;
    secondBtnClick?: null | ((rec: any, event?: MouseEvent) => void);
}