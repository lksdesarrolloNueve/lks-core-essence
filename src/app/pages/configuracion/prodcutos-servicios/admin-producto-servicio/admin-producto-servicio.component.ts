import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { EncryptDataService } from "../../../../shared/service/encryptdata";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";

/**
 * @autor: María Guadalupe Santana Olalde
 * @descripcion: Componente para la gestión de listas de productos/servicios
 * @fecha: 12/09/2022
 * @version: 1.0.0
 */
@Component({
    selector: 'admin-producto',
    moduleId: module.id,
    templateUrl: 'admin-producto-servicio.component.html'

})

export class AdminProductoServicioComponent {

    //Declaración de variables y componentes 
    titulo: string;
    accion: number;
    idProducto: number = 0;
    datosProduc: any = [];
    formProducto: UntypedFormGroup;

    //lista de los cargos 
    listaProductos = [];

    @BlockUI() blockUI: NgBlockUI;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private cifrar: EncryptDataService
    ) {

        this.titulo = data.titulo;
        this.accion = data.accion;

        this.formProducto = this.formBuilder.group({

            idProducto: new UntypedFormControl(''),
            producto: new UntypedFormControl('', [Validators.required]),
            codigo: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            dv: new UntypedFormControl('', [Validators.required]),
            comision: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            bonificacion: new UntypedFormControl('', [Validators.required, Validators.pattern("[0-9]*")]),
            imagenRecibo: new UntypedFormControl(''),
            estatus: new UntypedFormControl(true)

        });

        if (this.accion === 2) {
            this.datosProduc = data.datos;
            this.idProducto = data.datos.idProducto;
            this.formProducto.get('idProducto').setValue(data.datos.idProducto);
            this.formProducto.get('producto').setValue(data.datos.producto);
            this.formProducto.get('codigo').setValue(data.datos.codigo);
            this.formProducto.get('dv').setValue(data.datos.dv);
            this.formProducto.get('comision').setValue(data.datos.comision);
            this.formProducto.get('bonificacion').setValue(data.datos.bonificacion);
            this.formProducto.get('imagenRecibo').setValue(data.datos.imagenRecibo);
            this.formProducto.get('estatus').setValue(data.datos.estatus);

        }
    }

        /**
        * Método tipo crud para guardar y editar los datos de Servicios
        */
        crudProductoServicios() {
            if (this.formProducto.invalid) {
                this.validateAllFormFields(this.formProducto);
                return;
            }
            if (this.accion === 1) {
                this.blockUI.start('Guardando...');
            } else {
                this.blockUI.start('Editando...');
            }


            let jsonProduct = {
                datos: [
                    this.idProducto,
                    this.formProducto.get('producto').value,
                    this.formProducto.get('codigo').value,
                    this.formProducto.get('dv').value,
                    this.formProducto.get('comision').value,
                    this.formProducto.get('bonificacion').value,
                    this.formProducto.get('imagenRecibo').value,
                    this.formProducto.get('estatus').value
                ],
                accion: this.accion
            };

            this.service.registrar(jsonProduct, 'crudProductoServicios').subscribe(
                result => {
                    this.blockUI.stop();
                    if (result[0][0] === '0') {

                        this.formProducto.reset();

                        this.service.showNotification('top', 'right', 2, result[0][1])
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
     * Lista de validaciones del formulario SMS
     */
     listaValidaciones = {
        "producto": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan letras' }
        ],
        "codigo": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números' }
        ],
        "comision": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números' }
        ],
        "bonificacion": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números' }
        ]
    };

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


