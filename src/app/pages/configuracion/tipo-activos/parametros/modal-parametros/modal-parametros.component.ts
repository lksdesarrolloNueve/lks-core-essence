import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";


@Component({
  selector: 'modal-parametros',
  moduleId: module.id,
  templateUrl: 'modal-parametros.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 28/11/2022
 * @descripcion: Componente para la gestion de parametros
 */
export class ModalParametrosComponent {
  //Declaracion de variables y componentes
  encabezado: string = '';
  formParametros: UntypedFormGroup;
  @BlockUI() blockUI: NgBlockUI;
  parametroID: number = 0;


  /**
* Constructor de la clase
* @param service - Instancia de acceso a datos
* @param data - Datos recibidos desde el padre
*/
  constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
    @Inject(MAT_DIALOG_DATA) public data: any, private modal: MatDialogRef<ModalParametrosComponent>) {

    this.encabezado = data.titulo;
    this.formParametros = this.formbuilder.group({
      nombre: new UntypedFormControl('', Validators.required),
      descripcion: new UntypedFormControl('', Validators.required),
      valor: new UntypedFormControl('', Validators.required),
      estatus: new UntypedFormControl(true)
    });
    //Actualizar
    if (this.data.accion == 2) {
      this.parametroID = this.data.datos.parametros_id;
      this.formParametros.get('nombre').setValue(this.data.datos.nombre);
      this.formParametros.get('descripcion').setValue(this.data.datos.descripcion);
      this.formParametros.get('valor').setValue(this.data.datos.valor);
      this.formParametros.get('estatus').setValue(this.data.datos.estatus);
    }
  }


  /**
     * Metodo CRUD parametros
     *  
     */
  crudParametros() {
    this.blockUI.start('Cargando datos...');
    if (this.formParametros.invalid) {
      this.validateAllFormFields(this.formParametros);
      return this.blockUI.stop();
    }
    let jsonData = {
      "datos": [this.parametroID,
      this.formParametros.get('nombre').value,
      this.formParametros.get('descripcion').value,
      this.formParametros.get('valor').value,
      this.formParametros.get('estatus').value
      ], "accion": this.data.accion
    };

    this.blockUI.stop();
    this.service.registrar(jsonData, 'crudParametros').subscribe(result => {
      if (result[0][0] === '0') {

        this.service.showNotification('top', 'right', 2, result[0][1]);
        this.blockUI.stop();
      } else {
        this.service.showNotification('top', 'right', 3, result[0][1]);
        this.blockUI.stop();
      }
      //CERRAR modal 
      this.modal.close();
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

    'descripcion': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'valor': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  }
}