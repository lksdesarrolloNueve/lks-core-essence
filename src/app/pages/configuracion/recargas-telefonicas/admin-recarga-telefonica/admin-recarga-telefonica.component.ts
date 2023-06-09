import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { verificacionModalComponent } from "../../../modales/verificacion-modal/verificacion-modal.component";

/**
 * @autor: María Guadalupe Santana Olalde
 * @descripcion: Componente para la gestión de listas de productos/servicios
 * @fecha: 10/09/2022
 * @version: 1.0.0
 */
@Component({
    selector: 'admin-recarga',
    moduleId: module.id,
    templateUrl: 'admin-recarga-telefonica.component.html'

})

export class AdminRecargaTelefonicaComponent {

    //Declaración de variables y componentes 
    titulo: string;
    accion: number;
    idCompania: number = 0;
    datosRecarga: any = [];
    formRecarga: UntypedFormGroup;
    listaRecarga: any = [];

    //lista de los montos 
    listaMontoAgregado: any = [];
    listaMontoTabla: any = [];
    listaMontosJson: any = [];
    idMonto: number = 0;

    //Agregar montos
    esEditar = false;

    @BlockUI() blockUI: NgBlockUI;

    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        public dialog: MatDialog, public modal: MatDialogRef<AdminRecargaTelefonicaComponent>
    ) {
        this.titulo = data.titulo;
        this.accion = data.accion;

        this.formRecarga = this.formBuilder.group({

            idCompania: new UntypedFormControl(''),
            compania: new UntypedFormControl('', [Validators.required, Validators.pattern("[A-Za-z-&]*")]),
            urlImagen: new UntypedFormControl('', [Validators.required]),
            estatus: new UntypedFormControl(true),
            monto: new UntypedFormControl('', [Validators.pattern("[0-9]*")]),
            codigo: new UntypedFormControl('', [Validators.pattern("[0-9]*")])


        });

        if (this.accion === 2) {
            this.datosRecarga = data.datos;
            this.idCompania = data.datos.idCompania;
            this.formRecarga.get('compania').setValue(data.datos.compania);
            this.formRecarga.get('urlImagen').setValue(data.datos.urlimagen);

            let listaMontosJson = JSON.parse(data.datos.montos)
            listaMontosJson.forEach(result => {
                let objeto = [
                    result.id_monto,
                    result.monto,
                    result.codigo,
                    result.id_compania

                ]
                this.listaMontoAgregado.push(objeto)
            });
        }

    }

    /**
     * Método para agregar los montos para recarga
     */
    agregarRegistro() {
        if (this.esEditar === false) {
            this.idMonto=0;
            let monto = this.formRecarga.get('monto').value
            let codigo = this.formRecarga.get('codigo').value
            if (codigo !== "" && monto !== "") {
                let objeto = [
                    this.idMonto,
                    monto,
                    codigo,
                    this.idCompania
                ]

                let existeCodigo = this.listaMontoAgregado.find(resultado => { return resultado[2] === codigo })
                let existeMonto = this.listaMontoAgregado.find(resultado => { return resultado[1] === monto })

                if ((existeCodigo !== undefined) && (existeMonto !== undefined)) {
                    this.service.showNotification('top', 'right', 4, "Ya existe un registro con el mismo codigo y monto")
                    this.formRecarga.get('monto').setValue('')
                    this.formRecarga.get('codigo').setValue('')
                    return
                } else {

                    if (existeMonto !== undefined) {
                        this.service.showNotification('top', 'right', 4, "Ya existe un registro con la misma descripción")
                        this.formRecarga.get('monto').setValue('')
                        this.formRecarga.get('codigo').setValue('')
                        return
                    }
                }

                this.listaMontoAgregado.push(objeto);
            }
            //se limpia para nuevo rregistro
            this.idMonto=0;
            this.formRecarga.get('monto').setValue('');
            this.formRecarga.get('codigo').setValue('');
           

        } else {
            let monto = this.formRecarga.get('monto').value;
            let codigo = this.formRecarga.get('codigo').value;
            this.listaMontoAgregado.forEach(resultado => {
                if (resultado[0] === this.idMonto) {
                    resultado[1] = monto
                    resultado[2] = codigo
                    resultado[3] = this.idCompania
                }
            })
            this.service.showNotification('top', 'right', 2, "Monto Actualizado...")

            this.esEditar = false
        }
    }


    registroSeleccionado(seleccionado) {
        this.idMonto=seleccionado[0];
        this.idCompania=seleccionado[3];
        this.formRecarga.get('monto').setValue(seleccionado[1])
        this.formRecarga.get('codigo').setValue(seleccionado[2])
        this.esEditar = true;
    }


    /**
     * Abrir ventana modal de confirmacion
     * @param element datos monto
     * */
    abrirAdvertenciaEliminar(elemento: any) {

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: "Eliminar Monto.",
                body: "Se eliminará el registro " + elemento[2] + " de la tabla."
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar
                this.eliminar(elemento);
            }
        });

    }

    /***
    * metodo para remover datos de la lista de activos
    */
    eliminar(valor: any) {
        if(this.accion === 1){
            let index = this.listaMontoAgregado.findIndex(res => res.idCompania === valor[0]);
            this.listaMontoAgregado.splice(index, 1);
        } else {
            let jsonProduct = {
                compania: [0
                ],
                montos: [[
                    valor[0]]
                ]
                
                ,
                accion: 5
            };
            this.blockUI.start("Eliminando ...");
            this.service.registrar(jsonProduct,'crudRecargaTelefonica').subscribe(result => {
                let index = this.listaMontoAgregado.findIndex(res => res.idCompania === valor[0]);
                this.listaMontoAgregado.splice(index, 1);
                this.blockUI.stop();
                if (result[0][0] === '0') {
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
        
    }

    /**
     * 
     */
    crudRecarga() {
        if (this.formRecarga.invalid) {
            this.validateAllFormFields(this.formRecarga);
            return;
        }
        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }


        let jsonProduct = {
            compania: [
                this.idCompania,
                this.formRecarga.get('compania').value,
                this.formRecarga.get('urlImagen').value,
                this.formRecarga.get('estatus').value
            ],
            montos:
                this.listaMontoAgregado
            ,
            accion: this.accion
        };

//return  this.blockUI.stop();
        this.service.registrar(jsonProduct, 'crudRecargaTelefonica').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    this.formRecarga.reset();
                    this.modal.close();
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

        /**
     * Lista de validaciones del formulario SMS
     */
         listaValidaciones = {
            "compania": [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'pattern', message: 'Solo se aceptan letras' }
            ],
            "urlImagen": [
                { type: 'required', message: 'Campo requerido.' }
            ],
            "monto": [
                { type: 'pattern', message: 'Solo se aceptan números' }
            ],
            "codigo": [
                { type: 'pattern', message: 'Solo se aceptan números' }
            ]
        };


}