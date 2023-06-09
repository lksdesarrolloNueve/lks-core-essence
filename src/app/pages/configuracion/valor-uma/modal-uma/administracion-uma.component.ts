import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";




@Component({
    selector: 'administracion-uma',
    moduleId: module.id,
    templateUrl: 'administracion-uma.component.html'
})

/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 03/02/2022
 * @descripcion: Componente para la gestion de valores de uma
 */

export class AdministracionUmaComponent {
    /***
     * Se declaran variables
     */
    titulo = 'Valores UMA';
    encabezado : string;
    accion : number;
    formUma: UntypedFormGroup;
    isChecked  = true;
    umaID: number = 0;

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

        this.formUma = this.formBuilder.group({
            anio: new UntypedFormControl('', [Validators.required,Validators.maxLength(10),Validators.pattern("^[0-9]*$")]),
            valorDiario: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            valorMensual: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            valorAnual: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            estatus: new UntypedFormControl(true),
        });

        // Si es 2 se setean los valores para editar
        if(this.accion ===2){
            this.umaID = data.uma.umaId;
            this.formUma.get('anio').setValue(data.uma.anio);
            this.formUma.get('valorDiario').setValue(data.uma.valorDiario);
            this.formUma.get('valorMensual').setValue(data.uma.valorMensual);
            this.formUma.get('valorAnual').setValue(data.uma.valorAnual);
            this.formUma.get('estatus').setValue(data.uma.estatus);
            this.formUma.get('anio').disable();
           
        }
      
    }


    /**
     * Metodo para Guardar el valor de UMA
     * @returns 
     */

    guardarUma(){
        if (this.formUma.invalid) {
            this.validateAllFormFields(this.formUma);
            return;
        }
        this.blockUI.start('Guardando ...');

    const data = {
        "umaId": this.umaID,
        "anio": this.formUma.get('anio').value,
        "valorDiario":  this.formUma.get('valorDiario').value,
        "valorMensual":   this.formUma.get('valorMensual').value,
        "valorAnual": this.formUma.get('valorAnual').value,
        "estatus": this.formUma.get('estatus').value,
    };

    this.service.registrarBYID(data,1,'crudUma').subscribe (
        result =>{
            this.blockUI.stop();
            if(result[0][0]=== '0'){
                this.formUma.reset();
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
     * Metodo para editar los valores de UMA
     * @returns 
     */
    editarUma(){
        if (this.formUma.invalid) {
            this.validateAllFormFields(this.formUma);
            return;
        }
        this.blockUI.start('Editando ...');

    const data = {
        "umaId": this.umaID,
        "anio": this.formUma.get('anio').value,
        "valorDiario":  this.formUma.get('valorDiario').value,
        "valorMensual":   this.formUma.get('valorMensual').value,
        "valorAnual": this.formUma.get('valorAnual').value,
        "estatus": this.formUma.get('estatus').value,
    };

    this.service.registrarBYID(data,2,'crudUma').subscribe (
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
    'anio': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'maxlength', message: 'Campo maximo 10 dígitos.' },
        { type: 'pattern', message: 'Solo números.' }
    ],
    'valorDiario': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Campo solo números o decimales.' }
    ],

    'valorMensual': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Campo solo números o decimales.' }
    ],

    'valorAnual': [
        { type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Campo solo números o decimales.' }
    ],

    'estatus': [
        { type: 'required', message: 'Campo requerido.' },
    ],
};

}