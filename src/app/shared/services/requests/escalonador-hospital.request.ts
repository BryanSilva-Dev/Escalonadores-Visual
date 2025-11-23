import { Escalonador, PrioridadeManchester } from "../models/escalonador-hospital.model";
import { PacienteStruct } from "../structs/escalonador/escalonador-hospital.struct";

export class EscalonadorHospitalRequest {
    public idAlgoritmo: number;
    public nMedicos: number;
    public qPacientes: number;
    public listPacientes: PacienteStruct[] = [];
}

export class LookupRequest {
    public listPrioridades: PrioridadeManchester[] = [];
    public listAlgoritmos: Escalonador[] = [];
}