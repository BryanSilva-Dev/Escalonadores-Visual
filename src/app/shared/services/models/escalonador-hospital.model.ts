export class Execucao {
    public idExecucao: number;
    public idAlgoritmo: number;
    public nMedicos: number;
    public nTrocasContexto: number;
    public mediaEspera: number;
    public mediaExecucao: number;
    public mediaCPU: number;
    public dataExecucao: Date;
}

export class EscalonadorExecucao {
    public idEscalonadorExecucao: number;
    public idExecucao: number;
    public idPaciente: number | null;
    public contadorMedico: number | null;
    public inicio: boolean;
    public fim: boolean;
    public espera: boolean;
    public momento: number;
}

export class Escalonador {
    public idEscalonador: number;
    public nomeEscalonador: string;
}

export class PrioridadeManchester {
    public idPrioridadeManchester: number;
    public nomePrioridade: string;
    public cor: string;
}