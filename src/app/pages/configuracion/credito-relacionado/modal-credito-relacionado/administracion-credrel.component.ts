import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";




@Component({
    selector: 'administracion-credrel',
    moduleId: module.id,
    templateUrl: 'administracion-credrel.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 10/11/2021
 * @descripcion: Componente para la gestion de indices hh
 */

export class AdministracionCredRelComponent {
    /***
     * Se declaran variables
     */
    titulo = 'PARAMETRO CRÉDITO RELACIONADO';
    encabezado : string;
    accion : number;
    formCredRel: UntypedFormGroup;
    isChecked  = true;
    parametroId: number = 0;

    color: ThemePalette = 'primary';
    @BlockUI() blockUI: NgBlockUI;
    

     /**
     * Constructor de la clase
     * @param service   - Servicio de acceso a datos
     * @param dialog  - Gestion de dialogos
     */
      constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado= data.titulo+' '+this.titulo;
        this.accion = data.accion

        this.formCredRel = this.formBuilder.group({
            descripcion: new UntypedFormControl('', [Validators.required,Validators.maxLength(100)]),
            claveParametro: new UntypedFormControl('', [Validators.required,Validators.maxLength(3)]),
            valor: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            estatus: new UntypedFormControl(true),
        });

        // Si es 2 se setean los valores para editar
        if(this.accion ===2){
            this.parametroId = data.parametroCred.parametroId;
            this.formCredRel.get('descripcion').setValue(data.parametroCred.descripcion);
            this.formCredRel.get('claveParametro').setValue(data.parametroCred.claveParametro);
            this.formCredRel.get('valor').setValue(data.parametroCred.valor);
            this.formCredRel.get('estatus').setValue(data.parametroCred.estatus);
           
        }
      
    }


    /**
     * Metodo para Guardar indice hh
     * @returns 
     */
    guardarParametro(){
        if (this.formCredRel.invalid) {
            this.validateAllFormFields(this.formCredRel);
            return;
        }
        this.blockUI.start('Guardando ...');

    const data = {
        "parametroId": this.parametroId,
        "claveParametro":  this.formCredRel.get('claveParametro').value,
        "valor":  this.formCredRel.get('valor').value,
        "descripcion": this.formCredRel.get('descripcion').value,
        "estatus": this.formCredRel.get('estatus').value,
    };

    this.service.registrarBYID(data,1,'CrudCreditoRelacionado').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.formCredRel.reset();
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
     * Metodo para editar el parametro
     */
    actualizarParametro(){
        if (this.formCredRel.invalid) {
            this.validateAllFormFields(this.formCredRel);
            return;
        }
        this.blockUI.start('Editando ...');

    const data = {
        "parametroId": this.parametroId,
        "claveParametro":  this.formCredRel.get('claveParametro').value,
        "valor":  this.formCredRel.get('valor').value,
        "descripcion": this.formCredRel.get('descripcion').value,
        "estatus": this.formCredRel.get('estatus').value,
    };

    this.service.registrarBYID(data,2,'CrudCreditoRelacionado').subscribe (
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
     * Validacion para los campos
     */
 validaciones = {
    'descripcion': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'maxlength', message: 'Campo maximo 100 dígitos.' },
    ],
    
    'claveParametro': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'maxlength', message: 'Campo maximo 3 dígitos.' },
    ],

    'valor': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Campo solo números o decimales.' }
    ],

    'estatus': [
        { type: 'required', message: 'Campo requerido.' },
    ],
};

}