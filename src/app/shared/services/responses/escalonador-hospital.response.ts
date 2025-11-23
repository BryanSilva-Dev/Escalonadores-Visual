import { Escalonador, EscalonadorExecucao, Execucao, PrioridadeManchester } from "../models/escalonador-hospital.model";
import { ReturnStruct } from "../structs/system-structs/return.struct";

export class EscalonadorHospitalResponse extends ReturnStruct {
    public execucao: Execucao;
    public eventos: EscalonadorExecucao[] = [];
}

export class LookupResponse extends ReturnStruct {
    public listEscalonador: Escalonador[] = [];
    public listPrioridades: PrioridadeManchester[] = [];
}