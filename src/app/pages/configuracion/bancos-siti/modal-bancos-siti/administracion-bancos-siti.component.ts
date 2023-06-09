import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'administracion-bancos-siti',
    moduleId: module.id,
    templateUrl: 'administracion-bancos-siti.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de bancos siti
 */

export class AdministracionBancoSitiComponent implements OnInit {
    /***
     * Se declaran variables
     */
    titulo = 'Banco Siti';
    encabezado : string;
    accion : number;
    formBancoS: UntypedFormGroup;
    isChecked  = true;
    bancositid: number;

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

        this.formBancoS = this.formBuilder.group({
            nombreBanco: new UntypedFormControl('', [Validators.required,Validators.maxLength(250)]),
            clavebanco: new UntypedFormControl('', [Validators.required,Validators.maxLength(15), Validators.pattern('[0-9]*')]),
            estatus: new UntypedFormControl(true),
        });

        // Si es 2 se setean los valores para editar
        if(this.accion ===2){
            this.bancositid = data.bancositi.bancositiId;
            this.formBancoS.get('clavebanco').setValue(data.bancositi.cveSiti);
            this.formBancoS.get('nombreBanco').setValue(data.bancositi.nombreBanco);
            this.formBancoS.get('estatus').setValue(data.bancositi.estatus);
           
        }
      
    }


    /**
     * Metodo OnInit de la clase
     */
    ngOnInit(){
        
    }

    /**
     * Metodo para Guardar Banco Siti
     * @returns 
     */

    guardarbancoSiti(){
        if (this.formBancoS.invalid) {
            this.validateAllFormFields(this.formBancoS);
            return;
        }
        this.blockUI.start('Guardando ...');

    const data = {
        "bancositiId": 0,
        "cveSiti" :  this.formBancoS.get('clavebanco').value,
        "nombreBanco": this.formBancoS.get('nombreBanco').value,
        "estatus": this.formBancoS.get('estatus').value,

    };

    this.service.registrarBYID(data,1,'crudBancoSiti').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.formBancoS.reset();
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
     * Metodo para editar Banco Siti
     * @returns 
     */
    editarbancoSiti(){
        if (this.formBancoS.invalid) {
            this.validateAllFormFields(this.formBancoS);
            return;
        }
        this.blockUI.start('Editando ...');

    const data = {
        "bancositiId": this.bancositid,
        "cveSiti" :  this.formBancoS.get('clavebanco').value,
        "nombreBanco": this.formBancoS.get('nombreBanco').value,
        "estatus": this.formBancoS.get('estatus').value,

    };

    this.service.registrarBYID(data,2,'crudBancoSiti').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.formBancoS.reset();
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

    validaciones = {
        'clavebanco': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 15 dígitos' },
        ],
        'nombreBanco': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 250 dígitos' },
        ],
    };


}