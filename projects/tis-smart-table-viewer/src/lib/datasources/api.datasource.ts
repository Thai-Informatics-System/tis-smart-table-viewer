import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, Subscription, of } from 'rxjs';
import { catchError, finalize } from 'rxjs/operators';
import { ApiService } from '../services/api.service';

export class ApiDataSource implements DataSource<any> {

    private apiSubs!: Subscription;

    apiSubject = new BehaviorSubject<any[]>([]);
    extraDataSubject = new BehaviorSubject<any>(null);

    private loadingSubject = new BehaviorSubject<boolean>(false);
    public loading$ = this.loadingSubject.asObservable();

    public totalDataLength = new BehaviorSubject<number | null>(null);
    public totalDataLength$ = this.totalDataLength.asObservable();

    constructor(private apiService: ApiService) { 
        console.log(' DataSource Initialized...')
    }

    connect(collectionViewer: CollectionViewer): Observable<any[]> {
        return this.apiSubject.asObservable();
    }

    disconnect(collectionViewer: CollectionViewer): void {
        this.apiSubject.complete();
        this.extraDataSubject.complete();
        this.loadingSubject.complete();

        // if(this.apiSubs) {
        //     this.apiSubs.unsubscribe();
        // }
    }

    load(url: string, pageIndex: number, pageSize: number, search: string, filter?: object, sortFilter?: object) {

        if(this.apiSubs) {
            this.apiSubs.unsubscribe();
        }

        this.loadingSubject.next(true);
        this.apiSubs = this.apiService.getList(url, (pageIndex + 1), pageSize, search, {filter}, {sortFilter}).pipe(
            catchError(() => of([])),
            finalize(() => this.loadingSubject.next(false))
        ).subscribe(r => {
            console.log(`DataSource: Url: ${url}, Reply:`, r);
            if (r?.data?.length > 0) {
                this.totalDataLength.next(r?.total);
            }
            else {
                this.totalDataLength.next(0);
            }
            this.apiSubject.next(r?.data);
            this.extraDataSubject.next(r?.extraData);
        });
    }
}
