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
import { NGX_ECHARTS_CONFIG, NgxEchartsModule } from 'ngx-echarts';import * as echarts from 'echarts/core';
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
  ) {}

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
      this.generateChart(response.eventos, response.execucao.nMedicos);
      this.cdr.detectChanges();
      console.log(response);
    },
    error: (error) => {
      this.alertService.show('Erro!', 'Falha ao enviar requisição.', AlertType.warning);
    }
  });

}

generateChart(eventos: EscalonadorExecucao[], nMedicos: number) {
  const momentos = [...new Set(eventos.map(e => e.momento))].sort((a, b) => a - b);

  const series: any[] = [];

  for (let medico = 1; medico <= nMedicos; medico++) {
    const data = momentos.map(momento => {
      const evento = eventos.find(e => e.momento === momento && e.contadorMedico === medico);
      if (!evento) return 0; // 0 será "Ocioso"

      // Podemos codificar os estados com números diferentes se quiser diferenciar visualmente
      if (evento.inicio) return evento.idPaciente ?? -1;
      if (evento.fim) return evento.idPaciente ?? -1;
      if (evento.espera) return evento.idPaciente ?? -1;

      return 0; // Ocioso
    });

    series.push({
      name: `Médico ${medico}`,
      type: 'line',
      step: 'middle',
      data,
      // opcional: diferenciar cor por médico
      lineStyle: { width: 2 },
      symbol: 'circle',
      symbolSize: 6,
    });
  }

  // Criar categorias Y: 0 = Ocioso, depois pacientes 1, 2, 3...
  const pacienteIds = [...new Set(eventos.map(e => e.idPaciente).filter(p => p != null))].sort((a, b) => a - b);
  const yAxisData = ['Ocioso', ...pacienteIds.map(p => `Paciente ${p}`)];

  this.chartOption = {
    title: { text: 'Timeline de Escalonamento' },
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        return params.map((p: any) => {
          const paciente = p.data === 0 ? 'Ocioso' : `Paciente ${p.data}`;
          return `${p.seriesName} - ${paciente} <br> Momento: ${p.axisValue}`;
        }).join('');
      }
    },
    legend: { data: series.map(s => s.name) },
    grid: { left: '3%', right: '4%', bottom: '3%', containLabel: true },
    xAxis: {
      type: 'category',
      name: 'Momento',
      data: momentos
    },
    yAxis: {
      type: 'category',
      name: 'Paciente',
      data: yAxisData
    },
    series
  };
}


  get isFormValid() {
    return this.form.valid;
  }
}