import { Component } from '@angular/core';
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
import { HttpClient } from '@angular/common/http';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipEditedEvent, MatChipInputEvent } from '@angular/material/chips';
import { ActivatedRoute, Params } from '@angular/router';
import { data, param } from 'jquery';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { KeycloakAuthGuard, KeycloakService } from 'keycloak-angular';
import { environment } from '../../../../environments/environment';
import { PermisosService } from '../../../shared/service/permisos.service';
import { Router } from '@angular/router';

/**
 * @autor: Julio Samuel Torres Reyes
 * @version: 1.0.0
 * @fecha: 05/06/2023
 * @descripcion: Vista de formulario para dar de alta un cliente en banca electronica
 */

@Component({
  selector: 'filtro-cliente-be',
  moduleId: module.id,
  templateUrl: 'filtro-cliente-be.component.html',
  styleUrls: ['filtro-cliente-be.component.css'],
})
export class FiltroBEComponent {
  //variables
  title = 'alta-cliente';
  
  telefono: number;
  correo: any;
  estatus: any; // Estatus del cliente BE (por defecto es ACTIVO - 438)
  resultadoCrud: any; //mesaje de inserccion
  myForm: FormGroup; // datos del formulario
  valorRespuesta: any; //id del rol por numero
  vUsuarioId: any; // Variable que guarda el id del usuario actual
  origenID: any; // id de origen de inseccion del cliente be

  @BlockUI() blockUI: NgBlockUI; //animacion de cargando al tarda peticion

  responseCliente: Object;
  iblResultado: any;


  //contructos condatos el formulario y http
  constructor(
    private router: Router,
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private activedRoute: ActivatedRoute,
    private service: GestionGenericaService,
    private servicePermisos: PermisosService
  ) {
    this.origenID = environment.generales.origenMov; // Origen del movimiento
    this.estatus = environment.generales.cveEstatusBEAC;

    const navigation = this.router.getCurrentNavigation();

    if (navigation.extras.state !== undefined) {
      const cliente = navigation.extras.state.cliente;
      this.valorRespuesta = cliente;
    }


    //obtener valores del formulario en el html
    this.myForm = this.formBuilder.group({
      nombreCliente: new FormControl(''), //valor del campo de id cliente en el html
      persona_juridica_id: new FormControl(''),
      sucursal_id: new FormControl(''), //valor del campo usuario id en el html
      telefono: new UntypedFormControl('', [Validators.maxLength(10),Validators.pattern(/^[0-9]+$/)]),
      correo: new UntypedFormControl('', [Validators.email]),
      estatus: new FormControl(''),
    });

    this.getUser();
  }

  /**
   * metodo para insertar un cliente en la tabla cliente_be resive como parametro un numero que
   * realiza la accion dentro de la funcion en la base de datos
   * @param  opcion - evento a filtrar
   */

  insertClienteBE(opcion: number) {
    //archivo a insertar en la base de datos
    const JSONGuardar = {
      //datos a insertar de los form controls
      datos: {
        cliente_id: this.valorRespuesta.cliente_id,
        usuario_alta_id: this.vUsuarioId,
        tipo_cliente: this.valorRespuesta.persona_juridica,
        origen_id: this.origenID,
        telefono: this.myForm.get('telefono').value,
        correo: this.myForm.get('correo').value,
        estatus: this.estatus,
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
        if (this.resultadoCrud.codigo !== '0') {
          this.service.showNotification('top', 'rigth', 3, this.resultadoCrud.mensaje);
          return;
        }

        this.service.showNotification('top','right',2,this.resultadoCrud.mensaje);
        this.myForm.reset();
        
        setTimeout(() => this.router.navigate(['/be-clientes']));
      },
      (error) => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      }
    );
   
  }

  //metodo para canselar accion y redireccionar a alta clientes
  cancelar() {
    this.router.navigate(['/be-alta-cliente']);
  }

  //metodo al cargar pagina que nos devuelve el id usuario que esta iniciando secion en ese momento
  getUser() {
    //Usuario id y sucursal id.
    this.vUsuarioId = this.servicePermisos.usuario.id;
  }

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
