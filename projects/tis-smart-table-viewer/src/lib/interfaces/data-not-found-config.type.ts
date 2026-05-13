export type DataNotFoundConfig = {
    title: string;
    desc?: string;
    /** Optional custom icon/image URL. If provided, this image will be displayed instead of the default SVG. */
    iconUrl?: string | null;
    btnText?: string | null;
    btnUrl?: string | null;
    btnClick?: null | ((rec: any, event?: MouseEvent) => void);
    secondBtnText?: string | null;
    secondBtnUrl?: string | null;
    secondBtnClick?: null | ((rec: any, event?: MouseEvent) => void);
}