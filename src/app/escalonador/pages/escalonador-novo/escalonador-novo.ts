import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertService, AlertType } from 'src/app/shared/services/alert.service';
import { EscalonadorEnum } from 'src/app/shared/services/enum/escalonador.enum'
import { EscalonadorService } from 'src/app/shared/services/API/escalonador/escalonador.service';
import { Escalonador, PrioridadeManchester } from 'src/app/shared/services/models/escalonador-hospital.model';
import { LookupResponse } from 'src/app/shared/services/responses/escalonador-hospital.response';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { EscalonadorHospitalRequest } from 'src/app/shared/services/requests/escalonador-hospital.request';
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
    MatInputModule
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

  ngOnInit(): void {
    this.form = this.fb.group({
      idAlgoritmo: [null, Validators.required],
      nMedicos: [null, Validators.required],
      listPacientes: this.fb.array([]),
    });

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
      console.log(response);
    },
    error: (error) => {
      this.alertService.show('Erro!', 'Falha ao enviar requisição.', AlertType.warning);
    }
  });

}

  get isFormValid() {
    return this.form.valid;
  }
}