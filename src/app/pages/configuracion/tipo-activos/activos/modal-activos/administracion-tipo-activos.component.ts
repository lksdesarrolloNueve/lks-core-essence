import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../../shared/service/gestion";

@Component({
  selector: 'administracion-tipo-activos',
  moduleId: module.id,
  templateUrl: 'administracion-tipo-activos.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 24/11/2022
 * @descripcion: Componente para la gestion crud de tipos de activos
 */
export class AdministrarTipoActivosComponent implements OnInit {
  //Declaracion de variables y componentes
  encabezado: string = '';
  formTipoActivo: UntypedFormGroup;
  @BlockUI() blockUI: NgBlockUI;


  listaCuentaC: any = [];
  opcionesCuentaH: Observable<string[]>;
  opcionesCuentaD: Observable<string[]>;

  tipoActivoID: number = 0;
  userID: string = "";

  /**
* Constructor de la clase
* @param service - Instancia de acceso a datos
* @param data - Datos recibidos desde el padre
*/
  constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private permisosService: PermisosService,private modTipoAct: MatDialogRef<AdministrarTipoActivosComponent>) {

    this.encabezado = data.titulo;
    this.formTipoActivo = this.formbuilder.group({
      nombre: new UntypedFormControl('', Validators.required),
      usuario: new UntypedFormControl(''),
      porcentaje: new UntypedFormControl('', Validators.required),
      meses: new UntypedFormControl(''),
      cuentaDebe: new UntypedFormControl('', Validators.required),
      cuentaHaber: new UntypedFormControl('', Validators.required),
      estatus: new UntypedFormControl(true)
    });

    this.userID = this.permisosService.usuario.id;
    this.formTipoActivo.get('usuario').setValue(this.permisosService.usuario.firstName+' '+this.permisosService.usuario.lastName);
    //Accion Editar
    if (this.data.accion == 2) {
      this.userID = this.data.datos.usuario_id;//?? el usuario cambia al editar
      this.formTipoActivo.get('usuario').setValue(this.data.datos.usuario);
      this.tipoActivoID = this.data.datos.tipo_activo_id;
      this.formTipoActivo.get('nombre').setValue(this.data.datos.nombre);
      this.formTipoActivo.get('porcentaje').setValue(this.data.datos.porcentaje);
      this.formTipoActivo.get('meses').setValue(this.data.datos.meses_por_depreciar);
      this.formTipoActivo.get('estatus').setValue(this.data.datos.estatus);
    }
  }
  ngOnInit() {
    this.spsCuentasContables();
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
      this.opcionesCuentaD = this.formTipoActivo.get('cuentaDebe').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuentaC(value)));

      this.opcionesCuentaH = this.formTipoActivo.get('cuentaHaber').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuentaC(value)));
      if (this.data.accion == 2) {
        let findH = this.listaCuentaC.find(h => h.cuentaid == this.data.datos.cuenta_haber_id);
        this.formTipoActivo.get('cuentaHaber').setValue(findH);
        let findD = this.listaCuentaC.find(d => d.cuentaid == this.data.datos.cuenta_debe_id);
        this.formTipoActivo.get('cuentaDebe').setValue(findD);
      }
      this.blockUI.stop();

    }, error => { // Cacheo de errores al momento del consumo de la api.
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    });
  }
  /**
     * Filtra el tipo de credito
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
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
  displayCuentaH(option: any): any {
    return option ? option.nombre.trim() : undefined;

  }

  displayCuentaD(option: any): any {
    return option ? option.nombre.trim() : undefined;

  }
  /**
   * Metodo CRUD tipo de activos
   *  
   */
  crudTipoActivos() {
    this.blockUI.start('Cargando datos...');
    if (this.formTipoActivo.invalid) {
      this.validateAllFormFields(this.formTipoActivo);
      return this.blockUI.stop();
  }
    let jsonData = {
      "datos": [this.tipoActivoID,
      this.formTipoActivo.get('nombre').value,
      this.formTipoActivo.get('porcentaje').value,
      this.formTipoActivo.get('meses').value,
      this.userID,
      this.formTipoActivo.get('cuentaDebe').value.cuentaid,
      this.formTipoActivo.get('cuentaHaber').value.cuentaid,
      this.formTipoActivo.get('estatus').value
      ], "accion": this.data.accion
    };

    this.blockUI.stop();
    this.service.registrar(jsonData, 'crudTipoActivos').subscribe(result => {
      if (result[0][0] === '0') {

        this.service.showNotification('top', 'right', 2, result[0][1]);
        this.blockUI.stop();
      } else {
        this.service.showNotification('top', 'right', 3, result[0][1]);
        this.blockUI.stop();
      }
      //CERRAR modal 
      this.modTipoAct.close();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
    });
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
     * Validaciones del formulario
     */
  validaciones = {
    'nombre': [
      { type: 'required', message: 'Campo requerido.' }],

    'porcentaje': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'meses': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'cuentaDebe': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'cuentaHaber': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  }

}