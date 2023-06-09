import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';


/**
* @autor: Horacio Abraham Picón Galván
* @version: 1.0.0
* @fecha: 09/09/2021
* @descripcion: Componente para la gestion de clasificaciones económicas.
*/
@Component({
    selector: 'administracion-clas-cred',
    moduleId: module.id,
    templateUrl: 'administracion-clas-cred.component.html',
})
export class AdministracionClasificacionCred implements OnInit {

    //Declaracion de variables y componentes
    isChecked = true;
    titulo = 'Clasificación';
    encabezado: string;
    accion: number;
    clave = new UntypedFormControl();
    descripcion = new UntypedFormControl();
    color: ThemePalette = 'primary';

    clasificacionID: number;

    formClasCredito: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase
     * @param service - Instancia de acceso a datos
     * @param data - Datos recibidos desde el padre
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formClasCredito = this.formBuilder.group(
            {
                clave: new UntypedFormControl('', [Validators.required, Validators.maxLength(5)]),
                descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
                estatus: new UntypedFormControl(true)
            });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.clasificacionID = data.clasificacion.clasificacionID;
            this.formClasCredito.get('clave').setValue(data.clasificacion.cveClasificacion);
            this.formClasCredito.get('descripcion').setValue(data.clasificacion.descripcion);
            this.formClasCredito.get('estatus').setValue(data.clasificacion.estatus);
        }

    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

    }

    /**
     * Metodo para guardar clasificaciones económicas.
     * @returns notificacion de resultadi
     */
    guardarClasificacion() {

        if (this.formClasCredito.invalid) {
            this.validateAllFormFields(this.formClasCredito);
            return;
        }

        this.blockUI.start('Guardando...');

        const data = {
            "clasificacionID": 0,
            "cveClasificacion": this.formClasCredito.get('clave').value,
            "descripcion": this.formClasCredito.get('descripcion').value,
            "estatus": this.formClasCredito.get('estatus').value
        };


        this.service.registrarBYID(data, 1, 'crudClasificacionCred').subscribe(
            result => {

                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.formClasCredito.reset();
                    this.formClasCredito.get('estatus').setValue(true);
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
     * Metodo para editar informacion de clasificaciones económicas.
     */
    editarClasificacion() {

        if (this.formClasCredito.invalid) {
            this.validateAllFormFields(this.formClasCredito);
            return;
        }

        this.blockUI.start('Editando...');

        //se setean los datos en el array
        const data = {
            "clasificacionID": this.clasificacionID,
            "cveClasificacion": this.formClasCredito.get('clave').value,
            "descripcion": this.formClasCredito.get('descripcion').value,
            "estatus": this.formClasCredito.get('estatus').value
        };




        this.service.registrarBYID(data, 2, 'crudClasificacionCred').subscribe(
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
        { type: 'maxlength',message: 'El tamaño máximo es de 5 caracteres.' }
        ],
        'descripcion':[ 
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