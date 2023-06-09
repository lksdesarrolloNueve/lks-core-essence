//Funciones para tabla Clientes
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { GestionGenericaService } from '../../../shared/service/gestion/gestion.service';
import { environment } from '../../../../environments/environment';
import { PermisosService } from '../../../shared/service/permisos.service';

/**
 * @autor: Julio Samuel Torres Reyes y Carlos Eduardo Mata Rojas
 * @version: 1.0.0
 * @fecha: 05/06/2023
 * @descripcion: Vista de baja cliente y actualizar cliente en banca electronica
 */

@Component({
  selector: 'baja-cliente',
  moduleId: module.id,
  templateUrl: 'baja-cliente.component.html',
  styleUrls: [],
})
export class BajaClienteComponent {
  title = 'baja';

  @BlockUI() blockUI: NgBlockUI;

  //vaiables
  vUsuarioId: any;
  listaRolesBe: any = [];
  listaPermisos: any = [];
  myForm: FormGroup;
  valorRespuesta: any;
  resultadoCrud: any;
  estatus: any;
  origenID: any;
  selectedRole: any;
  responseCliente: any;
  listaStatusBe: any;
  listaMotivosBe: any;
  motivo: any;

  //constructor
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private service: GestionGenericaService,
    private servicePermisos: PermisosService
  ) {
    this.origenID = environment.generales.origenMov;

    const navigation = this.router.getCurrentNavigation();

    if (navigation.extras.state !== undefined) {
      const cliente = navigation.extras.state.cliente;
      this.valorRespuesta = cliente;

      this.estatus = this.valorRespuesta.estatusId;
    }

    this.getUser();
    this.spsRolesBe();
    this.spsEstatus();
    this.spsMotivos();

    this.myForm = this.formBuilder.group({
      nombreCliente: new FormControl(''), //valor del campo de id cliente en el html
      persona_juridica_id: new FormControl(''),
      sucursal_id: new FormControl(''), //valor del campo usuario id en el html
      rol: new FormControl(''),
      estatus: new FormControl(''),
      motivoBaja: new FormControl(''), // Establecer el valor inicial como falso (false) en el slider
      comentario: new FormControl(''), //valor del check list en el html numerico
      telefono: new FormControl(''),
      correo: new FormControl(''),
    });
  }

  /* Metodo OnInit de la clase */
  ngOnInit(): void {}

  insertClienteBE(opcion: number) {
    //archivo a insertar en la base de datos
    const JSONGuardar = {
      //datos a insertar de los form controls
      datos: {
        id_cliente_be: this.valorRespuesta.clienteBEId,
        cliente_id: this.valorRespuesta.clienteID,
        usuario_alta_id: this.vUsuarioId,
        origen_id: this.origenID,
        estatus_id: this.myForm.get('estatus').value,
        rol_id: this.myForm.get('rol').value,
        motivos_id: this.myForm.get('motivoBaja').value,
        comentarios: this.myForm.get('comentario').value,
        correo: this.myForm.get('correo').value,
        telefono: this.myForm.get('telefono').value,
      },
      // Accion a realizar
      accion: opcion,
    };

    this.blockUI.start('Guardando ...');

    //metodo de inserccion mediante un post y mensaje de proceso realizado con exito o falla
    this.service.registrar(JSONGuardar, 'crudClientesBe').subscribe(
      (resultado) => {
        this.blockUI.stop();
        this.resultadoCrud = resultado;
        if (this.resultadoCrud.codigo === '0') {
          this.service.showNotification(
            'top',
            'right',
            2,
            this.resultadoCrud.mensaje
          );
          this.myForm.reset();
          this.listaPermisos = [];
        } else {
          this.service.showNotification(
            'top',
            'right',
            3,
            this.resultadoCrud.mensaje
          );
        }
        this.router.navigate(['/be-clientes']);
      },
      (error) => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      }
    );
  }

  //metodo para cancelar y redirecionar
  cancelar() {
    this.router.navigate(['/be-clientes']);
  }

  /**
   * Metodo para listar los roles be
   */
  spsRolesBe() {
    this.blockUI.start('Cargando datos...');

    this.service
      .getListByObjet(
        {
          datos: {},
          accion: 1,
        },
        'spsRolesBe'
      )
      .subscribe(
        (data) => {
          this.blockUI.stop();
          this.listaRolesBe = data.info;
        },
        (error) => {
          this.blockUI.stop();
          this.service.showNotification('top', 'right', 4, error.Message);
        }
      );
  }

  //metodo para listar estatus de be
  spsEstatus() {
    this.blockUI.start('Cargando datos...');

    this.service
      .getListByObjet(
        {
          datos: {},
          accion: 1,
        },
        'spsEstatusBe'
      )
      .subscribe(
        (data) => {
          this.blockUI.stop();
          this.listaStatusBe = data.info;
        },
        (error) => {
          this.blockUI.stop();
          this.service.showNotification('top', 'right', 4, error.Message);
        }
      );
  }

  //metodo para listar motivos de be
  spsMotivos() {
    this.blockUI.start('Cargando datos...');

    this.service
      .getListByObjet(
        {
          datos: {},
          accion: 1,
        },
        'spsMotivosBe'
      )
      .subscribe(
        (data) => {
          this.blockUI.stop();
          this.listaMotivosBe = data.info;
        },
        (error) => {
          this.blockUI.stop();
          this.service.showNotification('top', 'right', 4, error.Message);
        }
      );
  }

  /**
   * Metodo para listar permisos del rol seleccionado en el formulario
   * @param rol - evento a filtrar
   */
  listaPermisosRol(rol: any) {
    this.blockUI.start();
    this.service
      .getListByObjet(
        {
          datos: { rolId: rol.generales_id },
          accion: 1,
        },
        'spsPermisosRolBe'
      )
      .subscribe(
        (data) => {
          this.listaPermisos = data.info;
          this.blockUI.stop();
        },
        (error) => {
          this.blockUI.stop();
          this.service.showNotification('top', 'right', 4, error.Message);
        }
      );
  }

  //obtiener el usuario con sesion activa
  getUser() {
    //Usuario id y sucursal id.
    this.vUsuarioId = this.servicePermisos.usuario.id;
  }
}
