import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";


@Component({
    selector: 'modal-traspaso-boveda',
    moduleId: module.id,
    templateUrl: 'modal-traspaso-boveda.component.html'
})


/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 15 nov. 2022
 * @descripcion: Componente para la gestion de traspaso a boveda
 */
export class ModalTrBovedaComponent {

    //Formulario. 
    formTrBoveda: UntypedFormGroup;

    //Wait
    @BlockUI() blockUI: NgBlockUI;


    /**
     * Constructor de la clase
     * @param formBuilder 
     * @param data 
     * @param service 
     * @param servicePermisos 
     */
    constructor(
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialogRef<ModalTrBovedaComponent>,
        private service: GestionGenericaService,
        private servicePermisos: PermisosService
    ) {


        //validacion de campos requeridos
        this.formTrBoveda = this.formBuilder.group({
            monto: new UntypedFormControl('', { validators: [Validators.required] }),
            concepto: new UntypedFormControl('', { validators: [Validators.required, Validators.maxLength(256)] })
        });


    }

    /**
     * Guardar movimiento
     */
     guardarEditarDialog() {

        if (this.formTrBoveda.invalid) {
            this.validateAllFormFields(this.formTrBoveda);
            return;
        }

        this.blockUI.start('Procesando movimiento...');

        /*
            1.cve_t_mov  (Clave tipo movimiento)
            2.cve_boveda (Clave boveda)
            3.cve_caja   (Clave caja)
            4.monto      (Monto de la transacción).
            5.descripcion (Descripción de la operación).
            6.cve_sucursal (Clave sucursal)
            7.usuario_id (Usuario)
        */
        let jsonTB = {
            datos: [
                null,
                null,
                this.data.cajas.cve_caja,
                this.formTrBoveda.get('monto').value,
                this.formTrBoveda.get('concepto').value,
                this.servicePermisos.sucursalSeleccionada.cveSucursal,
                this.servicePermisos.usuario.id
            ],
            accion: 2
        };

        this.service.registrar(jsonTB, 'crudDotacionesCaja').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    this.service.showNotification('top', 'right', 2, result[0][1])
                    this.dialog.close('');

                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );

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

    //Arreglo de mensajes a mostrar al validar formulario
    validacion_msj = {

        'monto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' }
        ],

        'concepto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 256 carácteres.' }
        ]


    }

}