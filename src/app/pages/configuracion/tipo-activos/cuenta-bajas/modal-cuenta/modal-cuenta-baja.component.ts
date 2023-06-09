import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";

@Component({
  selector: 'modal-cuenta-baja',
  moduleId: module.id,
  templateUrl: 'modal-cuenta-baja.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 21/12/2022
 * @descripcion: Componente para la gestion de Cuentas Activo bajo
 */
export class ModalCuentaActivoBajaComponent implements OnInit {

  //Declaracion de variables y componentes
  encabezado: string = '';
  formCuentaTipoActivo: UntypedFormGroup;
  @BlockUI() blockUI: NgBlockUI;

  //tipo de activos
  listaTipoAct: any = [];
  opcionesTipoAct: Observable<string[]>;

  listaCuentaC: any = [];
  opcionesCuentaD: Observable<string[]>;

  tipoCuentaID: number = 0;
  sucursalId: number = 0;

  /**
* Constructor de la clase ModalDepreciableComponent
* @param service - Instancia de acceso a datos
* @param data - Datos recibidos desde el padre
*/
  constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private modal: MatDialogRef<ModalCuentaActivoBajaComponent>, private permisosService: PermisosService, public dialog: MatDialog) {

    this.encabezado = data.titulo;
    this.formCuentaTipoActivo = this.formbuilder.group({
      tActivo: new UntypedFormControl('', Validators.required),
      sucursal: new UntypedFormControl(''),
      cuenta: new UntypedFormControl('', Validators.required),
      estatus: new UntypedFormControl(true)

    });
    this.sucursalId = this.permisosService.sucursalSeleccionada.sucursalid;
    this.formCuentaTipoActivo.get('sucursal').setValue(this.permisosService.sucursalSeleccionada.nombreSucursal);
    if (this.data.accion == 2) {
      this.tipoCuentaID = this.data.datos.cuenta_tipo_baja_id;
      this.sucursalId = this.data.datos.sucursalid;
      this.formCuentaTipoActivo.get('sucursal').setValue(this.data.datos.nombre_sucursal);

    }
  }
  ngOnInit() {
    this.spsCuentasContables();
    this.spsTipoActivos();
  }
  /**
* Lisa cuentas contables para comision
*/
  spsCuentasContables() {
    this.blockUI.start('Cargando datos...');
    // Consumo de api para obtener las cuentas contables
    this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
      //obtiene las cuentas contables filtrandolas por afectables
      this.listaCuentaC = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');

      // Se setean las cuentas para el autocomplete
      this.opcionesCuentaD = this.formCuentaTipoActivo.get('cuenta').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuentaC(value)));
      if (this.data.accion == 2) {
        let cuenta = this.listaCuentaC.find(cu => cu.cuentaid == this.data.datos.cuenta_id);

        this.formCuentaTipoActivo.get('cuenta').setValue(cuenta);
      }
      this.blockUI.stop();

    }, error => { // Cacheo de errores al momento del consumo de la api.
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });
  }
  private _filterCuentaC(value: any): any[] {
    let filterValue = value;
    if (value === null || value === undefined) {
      value = '';
    }
    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listaCuentaC.filter(option => option.nombre.toLowerCase().trim().includes(filterValue)
      || option.cuenta.toLowerCase().trim().includes(filterValue));
  }

  displayCuentaD(option: any): any {
    return option ? option.nombre.trim() : undefined;

  }

  /**
  * Método que en lista todos los tipos de activos
  * accion 1 muestra todos los activos
  */
  spsTipoActivos() {
    this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
      if (!this.vacio(data)) {
        this.listaTipoAct = JSON.parse(data);
        // Se setean las cuentas para el autocomplete
        this.opcionesTipoAct = this.formCuentaTipoActivo.get('tActivo').valueChanges.pipe(startWith(''),
          map(value => this._filterTipoAct(value)));
        if (this.data.accion == 2) {
          let activo = this.listaTipoAct.find(a => a.tipo_activo_id === this.data.datos.tipo_activo_id);

          this.formCuentaTipoActivo.get('tActivo').setValue(activo);
        }
      }
    });

  }
  private _filterTipoAct(value: any): any[] {
    let filterValue = value;
    if (value === null || value === undefined) {
      value = '';
    }
    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listaTipoAct.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
  }

  displayActivo(option: any): any {
    return option ? option.nombre.trim() : undefined;

  }
  /**
* Metodo CRUD Cuenta tipo de activos
*  
*/
  crudCuentaTipoActivos() {
    this.blockUI.start('Cargando datos...');
    if (this.formCuentaTipoActivo.invalid) {
      this.validateAllFormFields(this.formCuentaTipoActivo);
      return this.blockUI.stop();
    }
    let jsonData = {
      "datos": [this.tipoCuentaID,
      this.formCuentaTipoActivo.get('tActivo').value.tipo_activo_id,
      this.sucursalId,
      this.formCuentaTipoActivo.get('cuenta').value.cuentaid,

      ], "accion": this.data.accion
    };
    this.service.registrar(jsonData, 'crudTipoCuentaBaja').subscribe(result => {
      if (result[0][0] === '0') {

        this.service.showNotification('top', 'right', 2, result[0][1]);
        this.blockUI.stop();
      } else {
        this.service.showNotification('top', 'right', 3, result[0][1]);
        this.blockUI.stop();
      }
      //CERRAR modal 
      this.modal.close(this.formCuentaTipoActivo.get('tActivo').value.tipo_activo_id);
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
    });
  }
  /**
   * Validaciones del formulario
   */
  validaciones = {
    'tActivo': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'cuenta': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  }
  /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
  validateAllFormFields(formGroup: UntypedFormGroup) {         //1
    Object.keys(formGroup.controls).forEach(field => {  //2
      const control = formGroup.get(field);             //3
      if (control instanceof UntypedFormControl) {             //4
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {        //5
        this.validateAllFormFields(control);            //6
      }
    });
  }
  /**
      * Metodo que valida si va vacio.
      * @param value 
      * @returns 
      */
  vacio(value) {
    return (!value || value == undefined || value == "" || value.length == 0);
  }
}