import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';


/**
* @autor: Horacio Abraham Picón Galván
* @version: 1.0.0
* @fecha: 09/09/2021
* @descripcion: Componente para la gestion de actividades economicas pld
*/
@Component({
    selector: 'administracion-act-pld',
    moduleId: module.id,
    templateUrl: 'administracion-act-pld.component.html',
})
export class AdministracionActividadesPLD implements OnInit {

    //Declaracion de variables y componentes
    isChecked = true;
    titulo = 'Actividad';
    encabezado: string;
    accion: number;
    clave = new UntypedFormControl();
    actividadPLD = new UntypedFormControl();
    color: ThemePalette = 'primary';

    actividadid: number;

    @BlockUI() blockUI: NgBlockUI;

    formActividadesPLD: UntypedFormGroup;

    /**
     * Constructor de la clase
     * @param service - Instancia de acceso a datos
     * @param data - Datos recibidos desde el padre
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formActividadesPLD = this.formBuilder.group(
            {
                clave: new UntypedFormControl('', [Validators.required, Validators.maxLength(7), Validators.pattern('[0-7]*')]),
                actividadPLD: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
                estatus: new UntypedFormControl(true)
            });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.actividadid = data.actividad.actividadId;
            this.formActividadesPLD.get('clave').setValue(data.actividad.cvePLD);
            this.formActividadesPLD.get('actividadPLD').setValue(data.actividad.actividadEco);
            this.formActividadesPLD.get('estatus').setValue(data.actividad.estatus);
        }

    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

    }

    /**
     * Metodo para guardar actividades pld
     * @returns notificacion de resultadi
     */
    guardarActividad() {

        if (this.formActividadesPLD.invalid) {
            this.validateAllFormFields(this.formActividadesPLD);
            return;
          }

        this.blockUI.start('Guardando...');

        const data = {
            "actividadId": 0,
            "cvePLD": this.formActividadesPLD.get('clave').value,
            "actividadEco": this.formActividadesPLD.get('actividadPLD').value,
            "estatus": this.formActividadesPLD.get('estatus').value
        };

        this.service.registrarBYID(data, 1, 'crudActividadesPLD').subscribe(
            result => {

                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.formActividadesPLD.reset();
                    this.formActividadesPLD.get('estatus').setValue(true);
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {

                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }

    /**
     * Metodo para editar informacion de actividades pld
     */
    editarActividad() {

        if (this.formActividadesPLD.invalid) {
            this.validateAllFormFields(this.formActividadesPLD);
            return;
          }

        this.blockUI.start('Editando...');

        //se setean los datos en el array
        const data = {
            "actividadId": this.actividadid,
            "cvePLD": this.formActividadesPLD.get('clave').value,
            "actividadEco": this.formActividadesPLD.get('actividadPLD').value,
            "estatus": this.formActividadesPLD.get('estatus').value
        };



        this.service.registrarBYID(data, 2, 'crudActividadesPLD').subscribe(
            result => {

                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {

                this.blockUI.stop();

                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }

  /**
   * Método para validar los mensajes.
   */
   public validacion_msj = {
    'clave': [
      { type: 'required', message: 'Clave requerida.' },
      { type: 'pattern',  message: 'El campo solo acepta números enteros.' },
      { type: 'maxlength',message: 'El tamaño máximo es de 7 caracteres.' }
     ],
    'actividadPLD':[ 
      { type: 'required',   message: 'Descripción requerida.' },
      { type: 'maxlength',  message: 'El tamaño máximo es de 255 caracteres.' }
    ]
  }

  /**
   * Valida Cada atributo del formulario
   * @param formGroup - Recibe cualquier tipo de FormGroup
   */
   validateAllFormFields(formGroup: UntypedFormGroup) {
    Object.keys(formGroup.controls).forEach(field => {
      const control = formGroup.get(field);
      if (control instanceof UntypedFormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof UntypedFormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

}