import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn, AbstractControl } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";




@Component({
    selector: 'administracion-indicehh',
    moduleId: module.id,
    templateUrl: 'administracion-indicehh.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 09/11/2021
 * @descripcion: Componente para la gestion de indices hh
 */

export class AdministracionIndicehhComponent implements OnInit {
    /***
     * Se declaran variables
     */
    titulo = 'ÍNDICE HH';
    encabezado : string;
    accion : number;
    formIndicehh: UntypedFormGroup;
    isChecked  = true;
    IndicehhID: number = 0;

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

        this.formIndicehh = this.formBuilder.group({
            descripcion: new UntypedFormControl('', [Validators.required,Validators.maxLength(100)]),
            claveIndice: new UntypedFormControl('', [Validators.required,Validators.maxLength(3)]),
            indiceInicial: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            indiceFinal: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            estatus: new UntypedFormControl(true),
        });

        // Si es 2 se setean los valores para editar
        if(this.accion ===2){
            this.IndicehhID = data.indicehh.ihhId;
            this.formIndicehh.get('descripcion').setValue(data.indicehh.descripcion);
            this.formIndicehh.get('claveIndice').setValue(data.indicehh.claveIndice);
            this.formIndicehh.get('indiceInicial').setValue(data.indicehh.indiceInicial);
            this.formIndicehh.get('indiceFinal').setValue(data.indicehh.indiceFinal);
            this.formIndicehh.get('estatus').setValue(data.indicehh.estatus);
           
        }
      
    }


    /**
     * Metodo OnInit de la clase
     */
    ngOnInit(){
        
    }

    /**
     * Metodo para Guardar indice hh
     * @returns 
     */

    guardarIndice(){
        if (this.formIndicehh.invalid) {
            this.validateAllFormFields(this.formIndicehh);
            return;
        }
        this.blockUI.start('Guardando ...');

    const data = {
        "ihhId": this.IndicehhID,
        "claveIndice":this.formIndicehh.get('claveIndice').value,
        "indiceInicial":this.formIndicehh.get('indiceInicial').value,
        "indiceFinal":this.formIndicehh.get('indiceFinal').value,
        "descripcion":this.formIndicehh.get('descripcion').value,
        "estatus": this.formIndicehh.get('estatus').value,
    };

    this.service.registrarBYID(data,1,'crudIndicehh').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.formIndicehh.reset();
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
     * Metodo para editar el indice hh
     * @returns 
     */
    editarIndice(){
        if (this.formIndicehh.invalid) {
            this.validateAllFormFields(this.formIndicehh);
            return;
        }
        this.blockUI.start('Editando ...');

    const data = {
        "ihhId": this.IndicehhID,
        "claveIndice":this.formIndicehh.get('claveIndice').value,
        "indiceInicial":this.formIndicehh.get('indiceInicial').value,
        "indiceFinal":this.formIndicehh.get('indiceFinal').value,
        "descripcion":this.formIndicehh.get('descripcion').value,
        "estatus": this.formIndicehh.get('estatus').value,
    };

    this.service.registrarBYID(data,2,'crudIndicehh').subscribe (
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
    'claveIndice': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'maxlength', message: 'Campo maximo 3 dígitos.' },
    ],

    'indiceInicial': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Campo solo números o decimales.' }
    ],

    'indiceFinal': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Campo solo números o decimales.' }
    ],

    'estatus': [
        { type: 'required', message: 'Campo requerido.' },
    ],
};

}