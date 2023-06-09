import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { globales } from '../../../../../environments/globales.config';



@Component({
    selector: 'admin-asigna-documento',
    moduleId: module.id,
    templateUrl: 'admin-asigna-documento.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 15/10/2021
 * @descripcion: Componente para la gestion de asignacion de documentos
 */

export class AdminAsignaDocumentoComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    asignaDocumentoID: number = 0;
    @BlockUI() blockUI: NgBlockUI;
    listaTipoSocio : any;
    listaTipoDocumento : any;
    tipoDocumentoControl     = new UntypedFormControl('',[Validators.required])
    tipoSocioControl     = new UntypedFormControl('',[Validators.required])
    formAsignaDocumento : UntypedFormGroup;


    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;
    


    //Creación del arreglo para implementar las validaciones
    //en el modal de admin-asigna-documento.component.html
    validaciones = {
        'claveAsignaDocumento': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo máximo 4 carácteres.' },
        ],
        'estatus': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'tipoDocumentoID': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'tipoSocioID': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
         @Inject(MAT_DIALOG_DATA) public data: any){
        
        this.titulo = data.titulo+' Asigna Documento';
        this.accion= data.accion;
        this.formAsignaDocumento = this.formBuilder.group({
            claveAsignaDocumento        : new UntypedFormControl('',[Validators.required, Validators.maxLength(4)]),
            estatus           : new UntypedFormControl(true),
            tipoDocumentoID     : this.tipoDocumentoControl,
            tipoSocioID    : this.tipoSocioControl
        });
        

        //Se obtienen los valores para poder pintarlos en el modal.
        if(this.accion === 2){
            this.asignaDocumentoID = data.asignaDocumento.asignaDocumentoID
            this.formAsignaDocumento.get('claveAsignaDocumento').setValue(data.asignaDocumento.claveAsignaDocumento);
            this.formAsignaDocumento.get('estatus').setValue(data.asignaDocumento.estatus);
            this.formAsignaDocumento.get('tipoDocumentoID').setValue(data.asignaDocumento.tipoDocumentoID);
            this.formAsignaDocumento.get('tipoSocioID').setValue(data.asignaDocumento.tipoSocioID);
        }

    }
    
    /**
     * Metodo que abre un modal para la gestion de Inversion
     */

    ngOnInit() {
        this.spsTipoDocumento();
        this.spsTipoSocio();
    }
    
    /**
     * Metodo que guarda y edita asigna Documento
     */
     crudAsignaDocumento() {

        /**
         * Validacion complementaria para la validacion de guardado de datos en el formulario formAsignaDocumento
         */
        
        if(this.formAsignaDocumento.invalid){
            this.validateAllFormFields(this.formAsignaDocumento);
            return;
        }

        /**
         * Se estructura y se setean los datos al JSON 
         */
        const data ={
            "asignaDocumentoID":     this.asignaDocumentoID,
            "claveAsignaDocumento":  this.formAsignaDocumento.get('claveAsignaDocumento').value,
            "estatus":     this.formAsignaDocumento.get('estatus').value,
            "tipoDocumentoID":this.formAsignaDocumento.get('tipoDocumentoID').value,
            "tipoSocioID":this.formAsignaDocumento.get('tipoSocioID').value
        }

       /**
        * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
        * de acuerdo al asigna de accion al que pertenezca.
        */
        if(this.accion === 2){
            this.blockUI.start('Editando ...');
        }else{
            this.blockUI.start('Guardando ...');
        }      

        this.service.registrarBYID(data, this.accion, 'crudAsignaDocumento').subscribe(
        result => {
            this.blockUI.stop();
            if(result[0][0] === '0'){
                if(this.accion !==2){
                    this.formAsignaDocumento.reset();
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
     * Metodo para listar los asigna de documentos y poder llamarlo dentro del combo 
     * en el modal principal.
     * @param general
     */
   spsTipoDocumento() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(2 ,'listaTipoDocumento').subscribe(data => {
      this.listaTipoDocumento = data;    
      
      if(this.accion == 2){
        let index=this.listaTipoDocumento.findIndex(x => x.tipoDocumentoID === this.data.asignaDocumento.tipoDocumentoID.tipoDocumentoID);
        this.formAsignaDocumento.get('tipoDocumentoID').setValue(this.listaTipoDocumento[index]);
      }
      
        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
}


/**
     * Metodo para listar los asigna de documentos y poder llamarlo dentro del combo 
     * en el modal principal.
     * @param general
     */
 spsTipoSocio() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(2,'listaTipoSocio').subscribe(data => {
      this.listaTipoSocio = data;    
      
      if(this.accion === 2){
        let index=this.listaTipoSocio.findIndex(x => x.tipoSocioid === this.data.asignaDocumento.tipoSocioID.tipoSocioid);
        this.formAsignaDocumento.get('tipoSocioID').setValue(this.listaTipoSocio[index]);
      }
      
        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
}
     
    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier asigna de FormGroup
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