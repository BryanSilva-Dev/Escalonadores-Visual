import { Injectable } from '@angular/core';
declare var iziToast: any;

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  constructor() {}

  public show(title: string, menssage: string, type: AlertType) {
    if (type == AlertType.success) this.success(title, menssage);
    else if (type == AlertType.warning) this.warning(title, menssage);
    else if (type == AlertType.error) this.erro(title, menssage);
    else this.other(title, menssage);
  }

  public erro(title?: string, menssage?: string) {
    iziToast.error({
      title: title ? title : 'Erro',
      message: menssage,
    });
  }

  public warning(title?: string, menssage?: string) {
    iziToast.warning({
      title: title ? title : 'Erro',
      message: menssage,
    });
  }

  public success(title?: string, menssage?: string) {
    iziToast.success({
      title: title ? title : 'Erro',
      message: menssage,
    });
  }

  public other(title?: string, menssage?: string) {
    iziToast.show({
      title: title ? title : 'Erro',
      message: menssage,
      theme: 'dark',
    });
  }
}

export enum AlertType {
  warning,
  error,
  success,
}