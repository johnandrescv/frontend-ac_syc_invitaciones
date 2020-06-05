import { environment } from './../../environments/environment';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import Swal from 'sweetalert2';
import * as moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class RequestService {

  loading = false;
  constructor(private http: HttpClient) {
    moment.locale('es');
  }

  buscarSocio(body: FormData) {
    this.loading = true;
    return new Promise(resolve => {
      this.http.post(`${environment.apiUrl}/usuarios/search_dni`, body).subscribe((response: any) => {
        this.loading = false;
        if (response.usuarios) {
          resolve([true, response.usuarios]);
          return;
        }
        this.showAlert('No se encontro ningún dato', 'warning', 'Volver a intentar');
        resolve([false]);
      }, (error: any) => {
        this.loading = false;
        this.showAlert('No se encontro ningún dato', 'warning');
        resolve([false]);
      });
    });
  }

  guardarInvitacion(body: FormData) {
    this.loading = true;
    return new Promise(resolve => {
      this.http.post(`${environment.apiUrl}/invitaciones`, body).subscribe((response: any) => {
        this.loading = false;
        resolve(true);
        this.showAlert(response.message, 'success', 'Listo');
      }, (error: any) => {
        this.loading = false;
        this.showAlert(error.error.message, 'warning');
        resolve(false);
      });
    });
  }

  editarInvitacion(id: number, body: string) {
    this.loading = true;
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded',
    });
    return new Promise(resolve => {
      this.http.put(`${environment.apiUrl}/invitaciones/${id}`, body, {headers}).subscribe((response: any) => {
        this.loading = false;
        resolve(true);
        this.showAlert(response.message, 'success', 'Listo');
      }, (error: any) => {
        this.loading = false;
        this.showAlert(error.error.message, 'warning');
        resolve(false);
      });
    });
  }

  borrarInvitacion(id: number) {
    this.loading = true;
    return new Promise(resolve => {
      this.http.delete(`${environment.apiUrl}/invitaciones/${id}`).subscribe((response: any) => {
        this.loading = false;
        resolve(true);
      }, (error: any) => {
        this.loading = false;
        this.showAlert(error.error.message, 'warning');
        resolve(false);
      });
    });
  }

  createUser(data: FormData) {
    this.loading = true;
    return new Promise(resolve => {
      this.http.post(`${environment.apiUrl}/usuarios/invitados`, data).subscribe((response: any) => {
        this.showAlert(response.message, 'success', 'Listo');
        resolve([true, response.usuarios]);
        this.loading = false;
      }, (error: any) => {
        this.loading = false;
        this.showAlert(error.error.message, 'error');
        resolve([false]);
      });
    });
  }

  showAlert(message: string, tipo: any, confirmBtnText: string = 'Intentar nuevamente') {
    Swal.fire({
      title: 'Salinas Yacht Club',
      text: message,
      icon: tipo,
      confirmButtonText: confirmBtnText
    });
  }
}
