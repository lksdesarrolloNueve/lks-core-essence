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
  FormBuilder,
  FormControl,
  UntypedFormGroup,
  UntypedFormBuilder,
  UntypedFormControl,
  Validators,
  ValidatorFn,
  AbstractControl,
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
  
  myForm: FormGroup;
  valorRespuesta: any;
  resultadoCrud: any;
  cveEstatus: any; // Clave del estatus de los generales
  cveEstatusCliente: any; // Clave del estatus del cliente
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
    private formBuilder: UntypedFormBuilder,
    private service: GestionGenericaService,
    private servicePermisos: PermisosService
  ) {
    this.origenID = environment.generales.origenMov;
    this.cveEstatus = environment.generales.cveEstatusBEAC;

    const navigation = this.router.getCurrentNavigation();

    if (navigation.extras.state !== undefined) {
      const cliente = navigation.extras.state.cliente;
      this.valorRespuesta = cliente;

      console.log(this.valorRespuesta);

      this.estatus = this.valorRespuesta.estatusId;
      this.cveEstatusCliente = this.valorRespuesta.claveEstatus;
      console.log(this.cveEstatus);
      console.log(this.cveEstatusCliente);
      console.log(this.cveEstatusCliente === this.cveEstatus);
      console.log(this.cveEstatusCliente !== this.cveEstatus);
    }

    this.getUser();
    this.spsEstatus();
    this.spsMotivos();

    this.myForm = this.formBuilder.group({
      nombreCliente: new FormControl(''), //valor del campo de id cliente en el html
      persona_juridica_id: new FormControl(''),
      sucursal_id: new FormControl(''), //valor del campo usuario id en el html
      rol: new FormControl(''),
      estatus: new FormControl(''),
      motivoBaja: new FormControl(''), // Establecer el valor inicial como falso (false) en el slider
      comentarios: new UntypedFormControl('', [Validators.maxLength(255)]),
      telefono: new UntypedFormControl('', [Validators.maxLength(10),Validators.pattern(/^[0-9]+$/)]),
      correo: new UntypedFormControl('', [Validators.email]),
    });
  }

  /* Metodo OnInit de la clase */
  ngOnInit(): void {}

  insertClienteBE(opcion: number) {
    // Se valida el formulario
    if (this.myForm.invalid) {
      this.validateAllFormFields(this.myForm);
      return;
    }
        

    const JSONGuardar = {
      // Datos a insertar de los form controls
      datos: {
        id_cliente_be: this.valorRespuesta.clienteBEId,
        cliente_id: this.valorRespuesta.clienteID,
        usuario_alta_id: this.vUsuarioId,
        origen_id: this.origenID,
        estatus_id: this.myForm.get('estatus').value,
        motivos_id: this.myForm.get('motivoBaja').value,
        comentarios: this.myForm.get('comentarios').value,
        correo: this.myForm.get('correo').value,
        telefono: this.myForm.get('telefono').value,
      },
        // Accion a realizar
        accion: opcion,
      };
      console.log(JSONGuardar);
      this.blockUI.start('Guardando ...');

      this.service.registrar(JSONGuardar, 'crudClientesBe').subscribe(
      (resultado) => {
        this.blockUI.stop();
        this.resultadoCrud = resultado;

        if (this.resultadoCrud.codigo !== '0') {
          this.service.showNotification('top', 'rigth', 3, this.resultadoCrud.mensaje);
          return;
        }

        this.service.showNotification('top','right',2,this.resultadoCrud.mensaje);
        this.myForm.reset();

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


  //obtiener el usuario con sesion activa
  getUser() {
    //Usuario id y sucursal id.
    this.vUsuarioId = this.servicePermisos.usuario.id;
  }

      /**
   * Valida Cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
      validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach((field) => {
          const control = formGroup.get(field);
          if (control instanceof UntypedFormControl) {
            control.markAsTouched({ onlySelf: true });
          } else if (control instanceof UntypedFormGroup) {
            this.validateAllFormFields(control);
          }
        });
      }

    /**
   * Validacion para los campos
   */
    validaciones = {
      telefono: [
        {type: 'maxlength', message: 'Campo maximo 10 dígitos.'},
        {type: 'pattern', message: 'Campo solo acepta numeros'}
      ],
      correo: [{type: 'email', message: 'Email inválido.'}],
      comentarios: [{
        type: 'maxlength', message: 'Campo maximo 255 dígitos.'
      }],
    };
}
