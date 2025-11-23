import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AlertService } from '../../alert.service';
import { CommonService } from '../../commom.service';
import { environment } from 'src/environments/environment';
import { ReturnStruct } from '../../structs/system-structs/return.struct';
import { catchError, Observable } from 'rxjs';
import { EscalonadorHospitalRequest } from '../../requests/escalonador-hospital.request';
import { LookupResponse } from '../../responses/escalonador-hospital.response';

@Injectable({
    providedIn: 'root',
})
export class EscalonadorService extends CommonService {
    constructor(
        private httpClient: HttpClient,
        private alertService: AlertService
    ) 
    {
        super();
    }


    public GetLookups(): Observable<LookupResponse> {
        return this.httpClient.get<LookupResponse>(environment.urlApiBase + 'EscalonadorHospital/Lookups').pipe(catchError(this.handleError));
    }

    public billsReceiveRegister(request: EscalonadorHospitalRequest): Observable<ReturnStruct>
    {
        return this.httpClient.post<ReturnStruct>(environment.urlApiBase + 'EscalonadorHospital', request)
        .pipe(catchError(this.handleError));
    }
}