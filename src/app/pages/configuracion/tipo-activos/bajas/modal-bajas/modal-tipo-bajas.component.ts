import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: 'modal-tipo-bajas',
    moduleId: module.id,
    templateUrl: 'modal-tipo-bajas.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 28/11/2022
 * @descripcion: Componente para la gestion de tipos de bajas 
 */
export class ModalTipoBajasComponent implements OnInit{
      //Declaracion de variables y componentes
  encabezado: string = '';
  formTipoBaja: UntypedFormGroup;
  @BlockUI() blockUI: NgBlockUI;
  tipoBajaID:number=0;

  listaCuentaC: any = [];
  opcionesCuentaH: Observable<string[]>;
  opcionesCuentaD: Observable<string[]>;
  opcionesCuentaI: Observable<string[]>;
  /**
* Constructor de la clase
* @param service - Instancia de acceso a datos
* @param data - Datos recibidos desde el padre
*/
constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any,private modTipoBaj: MatDialogRef<ModalTipoBajasComponent>) {

    this.encabezado = data.titulo;
    this.formTipoBaja = this.formbuilder.group({
      nombre: new UntypedFormControl('', Validators.required),
      venta:new UntypedFormControl(false),
      cuentaDebe: new UntypedFormControl(''),
      cuentaHaber: new UntypedFormControl(''),
      cuentaIva: new UntypedFormControl(''),
      estatus: new UntypedFormControl(true)
    });
    //Actualizar
    if (this.data.accion == 2) {
        this.tipoBajaID = this.data.datos.tipo_baja_id;
      this.formTipoBaja.get('nombre').setValue(this.data.datos.nombre);
      this.formTipoBaja.get('venta').setValue(this.data.datos.ingresos_monetarios);
      this.formTipoBaja.get('estatus').setValue(this.data.datos.estatus);
    }
}
ngOnInit(){
    this.spsCuentasContables();
}
/**
* Lisa cuentas contables 
*/
spsCuentasContables() {
    this.blockUI.start('Cargando datos...');
    // Consumo de api para obtener las cuentas contables
    this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
      //obtiene las cuentas contables filtrandolas por afectables
      this.listaCuentaC = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');

      // Se setean las cuentas para el autocomplete
      this.opcionesCuentaD = this.formTipoBaja.get('cuentaDebe').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuentaC(value)));

      this.opcionesCuentaH = this.formTipoBaja.get('cuentaHaber').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuentaC(value)));

        this.opcionesCuentaI = this.formTipoBaja.get('cuentaIva').valueChanges.pipe(
            startWith(''),
            map(value => this._filterCuentaC(value)));

      if (this.data.accion == 2) {
        let findH = this.listaCuentaC.find(h => h.cuentaid == this.data.datos.haber_cuenta_id);
        this.formTipoBaja.get('cuentaHaber').setValue(findH);
        let findD = this.listaCuentaC.find(d => d.cuentaid == this.data.datos.debe_cuenta_id);
        this.formTipoBaja.get('cuentaDebe').setValue(findD);
        let findI = this.listaCuentaC.find(i => i.cuentaid == this.data.datos.iva_cuenta_id);
        this.formTipoBaja.get('cuentaIva').setValue(findI);
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
  /**
 * Muestra el texto en al uutooComplete al elegir una opcion
 * @param option opcio seleccionada
 * @returns Muestra el nombre de la opcion
 */
  displayCuentaH(option: any): any {
    return option ? option.nombre.trim() : undefined;

  }
/**
 * Muestra el texto en al uutooComplete al elegir una opcion
 * @param option opcio seleccionada
 * @returns Muestra el nombre de la opcion
 */
  displayCuentaD(option: any): any {
    return option ? option.nombre.trim() : undefined;
  }
/**
 * Muestra el texto en al uutooComplete al elegir una opcion
 * @param option opcio seleccionada
 * @returns Muestra el nombre de la opcion
 */
  displayCuentaI(option: any): any {
    return option ? option.nombre.trim() : undefined;
  }
/**
 * Metodo cambio venta pra las validaciones
 * @returns 
 */
 cambioVenta(dato){

if(dato.checked){
this.formTipoBaja.get('cuentaDebe').setValidators(Validators.required);
this.formTipoBaja.get('cuentaIva').setValidators(Validators.required);
this.formTipoBaja.get('cuentaHaber').setValidators(Validators.required);
this.formTipoBaja.get('cuentaDebe').updateValueAndValidity();
this.formTipoBaja.get('cuentaIva').updateValueAndValidity();
this.formTipoBaja.get('cuentaHaber').updateValueAndValidity();
}else{
    this.formTipoBaja.get('cuentaDebe').setValidators([]);
    this.formTipoBaja.get('cuentaIva').setValidators([]);
    this.formTipoBaja.get('cuentaHaber').setValidators([]);
    this.formTipoBaja.get('cuentaDebe').updateValueAndValidity();
    this.formTipoBaja.get('cuentaIva').updateValueAndValidity();
    this.formTipoBaja.get('cuentaHaber').updateValueAndValidity();   
}
 }
/**
   * Metodo CRUD tipo de activos
   *  
   */
 crudTipoBajas() {
    this.blockUI.start('Cargando datos...');
    if (this.formTipoBaja.invalid) {
      this.validateAllFormFields(this.formTipoBaja);
      return this.blockUI.stop();
  }
  let debe=this.formTipoBaja.get('cuentaDebe').value.cuentaid==undefined ? null: this.formTipoBaja.get('cuentaDebe').value.cuentaid;
  let haber=this.formTipoBaja.get('cuentaHaber').value.cuentaid==undefined ? null:this.formTipoBaja.get('cuentaHaber').value.cuentaid;
  let iva= this.formTipoBaja.get('cuentaIva').value.cuentaid==undefined ? null:this.formTipoBaja.get('cuentaIva').value.cuentaid;
    let jsonData = {
      "datos": [this.tipoBajaID,
      this.formTipoBaja.get('nombre').value,
      this.formTipoBaja.get('venta').value,
      debe,
      haber,
      iva,
      this.formTipoBaja.get('estatus').value
      ], "accion": this.data.accion
    };
   
    this.service.registrar(jsonData, 'crudTipoBajaActivo').subscribe(result => {
      if (result[0][0] === '0') {

        this.service.showNotification('top', 'right', 2, result[0][1]);
        this.blockUI.stop();
      } else {
        this.service.showNotification('top', 'right', 3, result[0][1]);
        this.blockUI.stop();
      }
      //CERRAR modal 
     this.modTipoBaj.close();
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

    'cuentaIva': [
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