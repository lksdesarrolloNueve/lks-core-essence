import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'administracion-bancos-sat',
    moduleId: module.id,
    templateUrl: 'administracion-bancos-sat.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 10/09/2021
 * @descripcion: Componente para la gestion de bancos del sat
 */

export class AdministracionBancoSatComponent implements OnInit {
    /***
     * Se declaran variables
     */
     titulo = 'Banco Sat';
    encabezado : string;
    accion : number;

    color: ThemePalette = 'primary';
    
    bancosatid: number;
    formBancosSat: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    /* 
    *Metodo para validar campos
    */
    validaciones = {
        'clavebanco': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 4 dígitos' },
        ],
        'nombreBanco': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 300 dígitos' },
        ],
    };

     /**
     * Constructor de la clase
     * @param service   - Servicio de acceso a datos
     * @param dialog  - Gestion de dialogos
     */
      constructor(private service: GestionGenericaService,
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado= data.titulo+' '+this.titulo;
        this.accion = data.accion

        this.formBancosSat = this.formbuilder.group({
            clavebanco: new UntypedFormControl('', [Validators.required, Validators.maxLength(4)]),
            nombreBanco: new UntypedFormControl('', [Validators.required, Validators.maxLength(300)]),
            estatus: new UntypedFormControl(true)
        });

        // Si es 2 se setean los valores para editar
        if(this.accion ===2){
            this.formBancosSat.get('clavebanco').setValue(data.bancosat.cveBanco);
            this.formBancosSat.get('nombreBanco').setValue(data.bancosat.nombreBanco);
            this.formBancosSat.get('estatus').setValue(data.bancosat.estatus);
            this.bancosatid = data.bancosat.bancosatId;

        }
      
    }


    /**
     * Metodo OnInit de la clase
     */
    ngOnInit(){
        
    }

    /**
     * Metodo para Guardar bancos con validaciones para insertar
     * @returns 
     */

    guardarbancoSat(){

        if (this.formBancosSat.invalid) {
            this.validateAllFormFields(this.formBancosSat);
            return;
        }
        this.blockUI.start('Guardando ...');
    const data = {
        "bancosatId": 0,
        "cveBanco" : this.formBancosSat.get('clavebanco').value,
        "nombreBanco": this.formBancosSat.get('nombreBanco').value,
        "estatus": this.formBancosSat.get('estatus').value

    };

    this.service.registrarBYID(data,1,'crudBancoSat').subscribe (
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
     * Metodo para editar una lista de estados
     * @returns 
     */
    editarbancoSat(){
        if (this.formBancosSat.invalid) {
            this.validateAllFormFields(this.formBancosSat);
            return;
        }
        this.blockUI.start('Editando ...');
       
    const data = {
        "bancosatId": this.bancosatid,
        "cveBanco" : this.formBancosSat.get('clavebanco').value,
        "nombreBanco": this.formBancosSat.get('nombreBanco').value,
        "estatus": this.formBancosSat.get('estatus').value


    };

    this.service.registrarBYID(data,2,'crudBancoSat').subscribe (
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