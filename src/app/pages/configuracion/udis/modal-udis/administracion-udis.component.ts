import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";


@Component({
    selector: 'administracion-udis',
    moduleId: module.id,
    templateUrl: 'administracion-udis.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 17/09/2021
 * @descripcion: Componente para la gestion de las udis
 */


export class AdministracionUdiComponent implements OnInit {

    /***
     * Se declaran variables
     */
    titulo = 'Udi';
    encabezado: string;
    accion: number;

    color: ThemePalette = 'primary';
    udiId: number;
    formUdis: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

      /* 
    *Metodo para validar campos
    */
    validaciones = {
        'valor': [
            { type: 'required', message: 'Campo requerido' }
        ]
    };


    /**
    * Constructor de la clase
    * @param service   - Servicio de acceso a datos
    * @param dialog  - Gestion de dialogos
    */
    constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject (MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion

        this.formUdis = this.formbuilder.group({
            valor: new UntypedFormControl('', [Validators.required]),
            estatus: new UntypedFormControl(true)
        });

        // Si es 2 se setean los valores para editar
        if (this.accion === 2) {
            this.formUdis.get('valor').setValue(data.udi.valor);
            this.formUdis.get('estatus').setValue(data.udi.estatus);
            this.udiId = data.udi.udiId;
        }
    }



    /**
    * Metodo OnInit de la clase
    */
    ngOnInit() {

    }


    /**
     * Metodo para guardar un registro en la lista d las udis
     * @returns -retorna un valor
     */
    guardarUdi(){
        if (this.formUdis.invalid) {
            this.validateAllFormFields(this.formUdis);
            return;
        }
        this.blockUI.start('Guardando ...');

    const data = {
        "udiId": 0,
        "valor" : this.formUdis.get('valor').value,
        "estatus": this.formUdis.get('estatus').value

    };

    this.service.registrarBYID(data,1,'crudUdis').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.service.showNotification('top', 'right',2,result[0][1])
            }else{
                this.service.showNotification('top', 'right',3,result[0][1])
            }

        },error =>{
            this.blockUI.stop();
            this.service.showNotification('top', 'right',4,error.error+'<br>'+error.trace)
        }
    )
        
    }


    /**
     * Metodo para Editar un registro de las Udis
     * @returns 
     */
    editarUdi(){
        if (this.formUdis.invalid) {
            this.validateAllFormFields(this.formUdis);
            return;
        }
        this.blockUI.start('Editando...');

    const data = {
        "udiId": this.udiId,
        "valor" : this.formUdis.get('valor').value,
        "estatus": this.formUdis.get('estatus').value

    };

    this.service.registrarBYID(data,2,'crudUdis').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.service.showNotification('top', 'right',2,result[0][1])
            }else{
                this.service.showNotification('top', 'right',3,result[0][1])
            }

        },error =>{
            this.blockUI.stop();
            this.service.showNotification('top', 'right',4,error.error+'<br>'+error.trace)
        }
    )

    }

          /**
 * Valida Cada atributo del formulario
 * @param formGroup - Recibe cualquier tipo de FormGroup
 */
           validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
            Object.keys(formGroup.controls).forEach(field => {  //{2}
                const control = formGroup.get(field);             //{3}
                if (control instanceof UntypedFormControl) {             //{4}
                    control.markAsTouched({ onlySelf: true });
                } else if (control instanceof UntypedFormGroup) {        //{5}
                    this.validateAllFormFields(control);            //{6}
                }
            });
        }


}