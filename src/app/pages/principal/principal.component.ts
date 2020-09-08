import { Component, OnInit, Inject, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { RequestService } from '../../services/request.service';
import Swal from 'sweetalert2';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as moment from 'moment';

@Component({
  selector: 'app-principal',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css']
})
export class PrincipalComponent implements OnInit {

  loading = false;
  dni = '';
  socio: any;
  invitado: any;
  user = {
    dni: '',
    nombres: '',
    correo: '',
    edad: '',
    telefono: ''
  };
  fechaCaducidad: any;
  editarInvitacion = false;
  @ViewChild('content', {static: false}) content: ElementRef;
  position = [-2.2058400, -79.9079500];
  constructor(@Inject(DOCUMENT) private document: Document,
              public requestServ: RequestService,
              private modalService: NgbModal) { }

  ngOnInit() {
    this.document.body.classList.add('single-column');
    this.document.body.classList.remove('mini-sidebar');
  }

  async buscarSocio() {
    this.dni = this.dni.trim();
    const body = new FormData();
    body.append('texto', this.dni);
    const response = await this.requestServ.buscarSocio(body);
    if (response[0] && response[1].tipo.id_tipo === 1) {
        this.socio = response[1];
    } else {
      this.socio = null;
      Swal.fire('El número de cédula no es válido', 'Verifique nuevamente', 'info');
    }
  }

  realizarInvitar() {
    Swal.fire({
      title: 'Ingrese el número de cédula o pasaporte del invitado',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'Buscar',
      showLoaderOnConfirm: true,
    }).then((result) => {
      if (result.value) {
        this.buscarInvitado(result.value);
      }
    });
  }

  async buscarInvitado(invitado: string) {
    const body = new FormData();
    body.append('texto', invitado);
    const response = await this.requestServ.buscarSocio(body);
    if (response[0]) {
      this.invitado = response[1];
    } else {
      this.crearInvitado(invitado);
    }
  }

  crearInvitado(dni: string) {
    Swal.fire({
      title: '¿Desea crear un invitado nuevo?',
      text: 'El usuario no aparece en la base de datos',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#343a40',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.user.dni = dni.trim();
        this.modalService.open(this.content);
      }
    });
  }

  async gestionInvitado(id: number = 0) {
    let response: any;
    const fechaSeleccionada = moment(this.fechaCaducidad).format('YYYY-MM-DD');
    if (this.editarInvitacion) {
      const body = `id_invitado=${this.invitado.id_usuario}&fecha_caducidad=${fechaSeleccionada}`;
      response = await this.requestServ.editarInvitacion(id, body);
    } else {
      const body = new FormData();
      body.append('id_invitado', this.invitado.id_usuario);
      body.append('id_autorizacion', this.socio.id_usuario);
      body.append('fecha_caducidad', fechaSeleccionada);
      response = await this.requestServ.guardarInvitacion(body);
    }

    if (response) {
      this.socio = null;
      this.invitado = null;
      this.fechaCaducidad = null;
      this.editarInvitacion = false;
    }
  }

  deleteInvitacion(id: number) {
    Swal.fire({
      title: '¿Seguro desea eliminar esta invitación?',
      text: 'Estos cambios no se pueden reversar',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#343a40',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.value) {
        this.borrarInvitacion(id);
      }
    });
  }

  async borrarInvitacion(id: number) {
    const response = await this.requestServ.borrarInvitacion(id);
    if (response) {
      this.socio = null;
      this.invitado = null;
      this.fechaCaducidad = null;
      this.editarInvitacion = false;
    }
  }

  async createInvitado() {
    const body = new FormData();
    body.append('dni', this.user.dni);
    body.append('nombres', this.user.nombres);
    body.append('edad', (this.user.edad) ? this.user.edad : '');
    body.append('correo', (this.user.correo) ? this.user.correo : '');
    body.append('telefono', (this.user.telefono) ? this.user.telefono : '');
    const response = await this.requestServ.createUser(body);
    if (response[0]) {
      this.invitado = response[1];
      this.modalService.dismissAll();
    }
  }
}
