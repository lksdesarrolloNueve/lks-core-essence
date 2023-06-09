import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'admin-avisos',
    moduleId: module.id,
    templateUrl: 'admin-avisos.component.html'
})

/**
 * @autor: Eduardo Romero Haro
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la gestion de bancos del sat
 */

export class AdministracionAvisosComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    avisoID: number=0;
    @BlockUI() blockUI: NgBlockUI;
    listaTipoAvisos : any;
    clasificacionControl     = new UntypedFormControl('',[Validators.required])
    formAviso : UntypedFormGroup;

    //Creación del arreglo para implementar las validaciones
    //en el modal de admin-avisos.component.html
    validaciones = {
        'claveAviso': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 4 carácteres.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'descripcion': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 254 carácteres.' },
        ],
        'dias': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números enteros.' },
        ],
        'rangoDias': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo se aceptan números enteros.' },
        ],
        'clasificacion': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
         @Inject(MAT_DIALOG_DATA) public data: any){
        
        this.titulo = data.titulo+' avisos';
        this.accion= data.accion;
        this.formAviso = this.formBuilder.group({
            claveAviso        : new UntypedFormControl('',[Validators.required, Validators.maxLength(4)]),
            estatus           : new UntypedFormControl(true),
            descripcion       : new UntypedFormControl('',[Validators.required, Validators.maxLength(244)]),
            dias              : new UntypedFormControl('',[Validators.required, Validators.pattern('[0-9]*')]),
            rangoDias         : new UntypedFormControl('',[Validators.required, Validators.pattern('[0-9]*')]),
            clasificacion     : this.clasificacionControl
        });
        

        //Se obtienen los valores para poder pintarlos en el modal.
        if(this.accion === 2){

            this.avisoID = data.aviso.avisoID
            this.formAviso.get('claveAviso').setValue(data.aviso.claveAviso);
            this.formAviso.get('estatus').setValue(data.aviso.estatus);
            this.formAviso.get('descripcion').setValue(data.aviso.descripcion);
            this.formAviso.get('dias').setValue(data.aviso.dias);
            this.formAviso.get('rangoDias').setValue(data.aviso.rangoDias);
          
        }

    }
    
    /**
     * Metodo que abre un modal para la gestion de Inversion
     */

    ngOnInit() {
        this.spsTiposAvisos();
    }
    
    /**
     * Metodo que guarda y edita avisos
     */
     crudAvisos() {

        /**
         * Validacion complementaria para la validacion de guardado de datos en el formulario formAviso
         */
        
        if(this.formAviso.invalid){
            this.validateAllFormFields(this.formAviso);
           // this.service.showNotification('top','right',3, "Completa los datos del formulario");
            return;
        }

        /**
         * Se estructura y se setean los datos al JSON 
         */
        const data ={
            "avisoID":     this.avisoID,
            "claveAviso":  this.formAviso.get('claveAviso').value,
            "estatus":     this.formAviso.get('estatus').value,
            "descripcion": this.formAviso.get('descripcion').value,
            "dias":        this.formAviso.get('dias').value,
            "rangoDias":   this.formAviso.get('rangoDias').value,
            "clasificacion":this.formAviso.get('clasificacion').value,
        }

       /**
        * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
        * de acuerdo al tipo de accion al que pertenezca.
        */
        if(this.accion === 2){
            this.blockUI.start('Editando ...');
        }else{
            this.blockUI.start('Guardando ...');
        }      

        this.service.registrarBYID(data, this.accion, 'crudAvisos').subscribe(
        result => {
            this.blockUI.stop();
            if(result[0][0] === '0'){
                if(this.accion !==2){
                    this.formAviso.reset();
                }

                 this.service.showNotification('top','right', 2, result[0][1])
            }  else{                    
                  this.service.showNotification('top','right', 3, result[0][1])
                }
          
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.message)


        }
        )

    }

    /**
     * Metodo para listar los tipos de avisoy poder llamarlo dentro del combo 
     * en el modal principal.
     * @param general
     */
   spsTiposAvisos() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID('08AC','listaGeneralCategoria').subscribe(data => {
      this.listaTipoAvisos= data;    
      
      if(this.accion == 2){
        let index=this.listaTipoAvisos.findIndex(x => x.generalesId === this.data.aviso.clasificacion.generalesId);
        this.formAviso.get('clasificacion').setValue(this.listaTipoAvisos[index]);
      }
      
        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
}
     
    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {           //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);           //{3}
            if (control instanceof UntypedFormControl) {           //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {      //{5}
                this.validateAllFormFields(control);        //{6}
            }
        });
    }


}