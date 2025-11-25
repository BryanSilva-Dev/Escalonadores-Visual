import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, AlertType } from 'src/app/shared/services/alert.service';
import { EscalonadorEnum } from 'src/app/shared/services/enum/escalonador.enum'
import { EscalonadorService } from 'src/app/shared/services/API/escalonador/escalonador.service';
import { Escalonador, EscalonadorExecucao, PrioridadeManchester } from 'src/app/shared/services/models/escalonador-hospital.model';
import { LookupResponse } from 'src/app/shared/services/responses/escalonador-hospital.response';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EscalonadorHospitalRequest } from 'src/app/shared/services/requests/escalonador-hospital.request';
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts'; import * as echarts from 'echarts/core';
import { LineChart } from 'echarts/charts';
import { TitleComponent, TooltipComponent, GridComponent, LegendComponent } from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

@Component({
  selector: 'app-escalonador-novo',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatFormFieldModule,
    MatInputModule,
    NgxEchartsModule
  ],
  providers: [
    {
      provide: NGX_ECHARTS_CONFIG,
      useValue: { echarts: () => import('echarts') } // importa dinamicamente o echarts
    }
  ],

  templateUrl: './escalonador-novo.html',
  styleUrls: ['./escalonador-novo.css'],
})
export class EscalonadorNovo implements OnInit {

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private escalonadorService: EscalonadorService,
    private alertService: AlertService,
    private cdr: ChangeDetectorRef
  ) { }

  public form: FormGroup;
  public isLoading: boolean = true;
  public listAlgoritmos: Escalonador[] = [];
  public listPrioridades: PrioridadeManchester[] = [];
  public EscalonadorEnum = EscalonadorEnum;
  public request: EscalonadorHospitalRequest = new EscalonadorHospitalRequest();
  public isResult: boolean = false;
  public chartOption: any = {};

  ngOnInit(): void {
    this.form = this.fb.group({
      idAlgoritmo: [null, Validators.required],
      nMedicos: [null, Validators.required],
      listPacientes: this.fb.array([]),
    });
    echarts.use([TitleComponent, TooltipComponent, GridComponent, LegendComponent, LineChart, CanvasRenderer]);
    this.loadLookups();
    this.addPaciente();
    this.form.get('idAlgoritmo')?.valueChanges.subscribe(() => {
      this.updateQuantumValidation();
    });
  }

  loadLookups() {
    this.isLoading = true;
    this.escalonadorService.GetLookups().subscribe({
      next: (response: LookupResponse) => {
        if (response.isError) {
          this.alertService.show(
            'Ops!',
            response.errorDescription,
            AlertType.warning
          );
          this.isLoading = false;
          return;
        }

        this.listAlgoritmos = response.listEscalonador;
        this.listPrioridades = response.listPrioridades;
        this.isLoading = false;

      },
      error: (error) => {
        this.alertService.show('Ops!', error, AlertType.warning);
        this.isLoading = false;
      },
    });
  }

  pacientes(): FormArray {
    return this.form.get('listPacientes') as FormArray;
  }

  newPaciente(): FormGroup {
    return this.fb.group({
      tempoChegada: [null, [Validators.required, Validators.min(0)]],
      duracao: [null, [Validators.required, Validators.min(1)]],
      idPrioridadeManchester: [null, Validators.required],
      quantum: [null],
    });
  }

  addPaciente() {
    this.pacientes().push(this.newPaciente());
  }

  removePaciente(i: number) {
    this.pacientes().removeAt(i);
  }

  updateQuantumValidation() {
    const isRR = this.form.get('idAlgoritmo')?.value == EscalonadorEnum.RoundRobin;

    this.pacientes().controls.forEach((group: FormGroup) => {
      const ctrl = group.get('quantum');

      if (isRR) {
        ctrl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        ctrl?.clearValidators();
      }

      ctrl?.updateValueAndValidity();
    });

    this.cdr.detectChanges();
  }

  submit() {

    if (this.form.invalid) {
      this.alertService.show('Ops!', 'Preencha os campos obrigatórios.', AlertType.warning);
      return;
    }

    const formValue = this.form.value;

    const request: EscalonadorHospitalRequest = {
      idAlgoritmo: formValue.idAlgoritmo,
      nMedicos: formValue.nMedicos,
      qPacientes: this.pacientes().length,
      listPacientes: formValue.listPacientes.map((p: any) => ({
        tempoChegada: p.tempoChegada,
        duracao: p.duracao,
        idPrioridadeManchester: p.idPrioridadeManchester,
        quantum: p.quantum ?? null
      }))
    };

    this.escalonadorService.ExecucaoEscalonador(request).subscribe({
      next: (response) => {
        if (response.isError) {
          this.alertService.show('Ops!', response.errorDescription, AlertType.warning);
          return;
        }

        this.alertService.show('Sucesso!', 'Escalonamento enviado!', AlertType.success);
        this.isResult = true;
        this.generateChart(response.eventos, response.execucao.nMedicos, response.execucao);
        this.cdr.detectChanges();
        console.log(response);
      },
      error: (error) => {
        this.alertService.show('Erro!', 'Falha ao enviar requisição.', AlertType.warning);
      }
    });

  }

  generateChart(eventos: any[], nMedicos: number, execucao: any) {

    if (!eventos || eventos.length === 0) {
      this.chartOption = {};
      return;
    }

    const getAlgoritmoNome = (id: number) => {
      switch (id) {
        case 1: return 'Round-Robin';
        case 2: return 'SJF';
        case 3: return 'SRTF';
        case 4: return 'Prioridade (Não-preemptivo)';
        default: return `Algoritmo ${id}`;
      }
    };

    const algoritmoNomeGlobal = getAlgoritmoNome(execucao.idAlgoritmo);

    const pacientesMap = new Map<number, {
      idPaciente: number,
      execucoes: { start: number, end: number, medico: number, algoritmo: string }[]
    }>();

    const startEvents = new Map<number, { momento: number, medico: number, algoritmo: string }>();

    const esperaMap = new Map<number, { start: number, end: number }[]>();
    const esperaStart = new Map<number, number>();

    eventos.forEach(ev => {

      if (ev.inicio && ev.contador_medico != null) {
        startEvents.set(ev.idPaciente, {
          momento: ev.momento,
          medico: ev.contador_medico,
          algoritmo: getAlgoritmoNome(execucao.idAlgoritmo)
        });
      }

      if (ev.fim && startEvents.has(ev.idPaciente)) {
        const data = startEvents.get(ev.idPaciente)!;

        if (!pacientesMap.has(ev.idPaciente)) {
          pacientesMap.set(ev.idPaciente, {
            idPaciente: ev.idPaciente,
            execucoes: []
          });
        }

        pacientesMap.get(ev.idPaciente)!.execucoes.push({
          start: data.momento,
          end: ev.momento,
          medico: data.medico,
          algoritmo: data.algoritmo
        });

        startEvents.delete(ev.idPaciente);
      }

      if (ev.espera === true && !esperaStart.has(ev.idPaciente)) {
        esperaStart.set(ev.idPaciente, ev.momento);
      }

      if (ev.espera === false && esperaStart.has(ev.idPaciente)) {
        const inicio = esperaStart.get(ev.idPaciente)!;
        const fim = ev.momento;

        if (!esperaMap.has(ev.idPaciente))
          esperaMap.set(ev.idPaciente, []);

        esperaMap.get(ev.idPaciente)!.push({ start: inicio, end: fim });

        esperaStart.delete(ev.idPaciente);
      }

    });

    const pacientes = Array.from(pacientesMap.values()).sort((a, b) =>
      a.idPaciente - b.idPaciente
    );

    const numeroPorPaciente = new Map<number, number>();
    pacientes.forEach((p, index) => {
      numeroPorPaciente.set(p.idPaciente, index + 1);
    });

    const yAxisData = pacientes.map(p =>
      `Paciente ${numeroPorPaciente.get(p.idPaciente)}`
    );

    const execSeries = pacientes.flatMap((p, index) =>
      p.execucoes.map(exec => ({
        name: `Paciente ${numeroPorPaciente.get(p.idPaciente)} (Atendimento)`,
        tipo: 'execucao',
        value: [
          index,
          exec.start,
          exec.end,
          exec.end - exec.start,
          'execucao',
          exec.medico,
          exec.algoritmo
        ]
      }))
    );

    const esperaSeries = pacientes.flatMap((p, index) =>
      (esperaMap.get(p.idPaciente) || []).map(esp => ({
        name: `Paciente ${numeroPorPaciente.get(p.idPaciente)} (Espera)`,
        tipo: 'espera',
        value: [
          index,
          esp.start,
          esp.end,
          esp.end - esp.start,
          'espera'
        ]
      }))
    );

    const seriesData = [...execSeries, ...esperaSeries];

    this.chartOption = {
      tooltip: {
        formatter: (params: any) => {
          const tipo = params.value[4];
          if (tipo === 'execucao') {
            const medico = params.value[5];
            const algoritmo = params.value[6] || algoritmoNomeGlobal;
            return `
            <b>${params.name}</b><br>
            Médico: ${medico}<br>
            Algoritmo: ${algoritmo}<br>
            Início: ${params.value[1]}<br>
            Fim: ${params.value[2]}<br>
            Duração: ${params.value[3]}
          `;
          } else {
            return `
            <b>${params.name}</b><br>
            (Espera)<br>
            Início: ${params.value[1]}<br>
            Fim: ${params.value[2]}<br>
            Duração: ${params.value[3]}
          `;
          }
        }
      },

      title: {
        text: 'Linha do Tempo dos Pacientes (Gantt)',
        subtext: `
Média Espera: ${execucao.mediaEspera}
Média Execução: ${execucao.mediaExecucao}
Uso CPU: ${execucao.mediaCPU}
Trocas de Contexto: ${execucao.nTrocasContexto}
Médicos: ${execucao.nMedicos}
Algoritmo: ${algoritmoNomeGlobal}
      `.trim()
      },

      xAxis: { type: 'value', name: 'Tempo' },
      yAxis: { type: 'category', data: yAxisData, name: 'Pacientes' },

      series: [
        {
          type: 'custom',
          renderItem: (params, api) => {
            const categoryIndex = api.value(0);
            const start = api.coord([api.value(1), categoryIndex]);
            const end = api.coord([api.value(2), categoryIndex]);
            const height = 28;

            const tipo = api.value(4);

            return {
              type: 'rect',
              shape: {
                x: start[0],
                y: start[1] - height / 2,
                width: end[0] - start[0],
                height: height
              },
              style: {
                fill:
                  tipo === 'execucao'
                    ? '#4caf50'
                    : '#bdbdbd',
                opacity: 0.95
              }
            };
          },
          encode: { x: [1, 2], y: 0 },
          data: seriesData
        }
      ]
    };
  }

  get isFormValid() {
    return this.form.valid;
  }
}