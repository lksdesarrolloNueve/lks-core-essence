import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer,SafeResourceUrl } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable, Subscriber } from "rxjs";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'admin-documento-codificado',
    moduleId: module.id,
    templateUrl: 'admin-documento-codificado.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 01/11/2021
 * @descripcion: Componente para la gestion de documentos codificados
 */

export class AdminDocumentoCodificadoComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    documentoCodificadoID: number = 0;
    @BlockUI() blockUI: NgBlockUI;
    fileReader = new FileReader();
   
    listaTipoDocumento : any;
    tipoDocumentoControl     = new UntypedFormControl('',[Validators.required])
    tipoSocioControl     = new UntypedFormControl('',[Validators.required])
    formDocumentoCodificado : UntypedFormGroup;

    // Visualizador
   name = 'prueba';
   url: string;
   urlSafe: SafeResourceUrl;

    myimage: Observable<any>;
    public archivos: any = [];
    public previsualizacion: string;
    public loading: boolean;
    archivoCapturado : any;
    

    

    //Creación del arreglo para implementar las validaciones
    //en el modal de admin-documento-codificado.component.html
    validaciones = {
        'tipoDocumentoID': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    }

    //Constructor para formular las validaciones.
    constructor(private service: GestionGenericaService,
        private sanitizer: DomSanitizer,
        private formBuilder: UntypedFormBuilder,
         @Inject(MAT_DIALOG_DATA) public data: any){
        
        this.titulo = data.titulo+' Documento';
        this.accion= data.accion;
        this.formDocumentoCodificado = this.formBuilder.group({
            tipoDocumentoID     : this.tipoDocumentoControl
        });
        

        //Se obtienen los valores para poder pintarlos en el modal.
        if(this.accion === 2){
            
            this.documentoCodificadoID = data.documentoCodificado.documentoCodificadoID
            this.previsualizacion = (data.documentoCodificado.docCodificadoBase64);
            this.formDocumentoCodificado.get('tipoDocumentoID').setValue(data.documentoCodificado.tipoDocumentoID);
            this.generarPdf();
        }

    }
    
    /**
     * Metodo que abre un modal para la gestion de Inversion
     */

    ngOnInit() {
        this.spsTipoDocumento();
       
        }

        generarPdf(){
            this.url = this.previsualizacion;
            this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
        }

        //Conversion  base 64 2
        capturarFile(event): any{
            this.archivoCapturado = event.target.files[0];
            this.extraerBase64(this.archivoCapturado).then((imagen: any) =>{
            this.previsualizacion = imagen.base;
            })
            this.archivos.push(this.archivoCapturado)
        }

        extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
            try{
                const unsafeImg = window.URL.createObjectURL($event);
                const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
                const reader = new FileReader();
                reader.readAsDataURL($event);
                reader.onload = () => {
                    resolve({
                        base:reader.result
                    });
                };
                reader.onerror = error =>{
                    resolve({
                        base:null
                    });
                };
            }catch(e){
                return null;
            }
        });


    /**
     * Metodo que guarda y edita Documento codificado
     */
     crudDocumentoCodificado() {

        /**
         * Validacion complementaria para la validacion de guardado de datos en el formulario formDocumentoCodificado
         */
        
        if(this.formDocumentoCodificado.invalid){
            this.validateAllFormFields(this.formDocumentoCodificado);
            return;
        }
        this.loading = true;

        /**
         * Se estructura y se setean los datos al JSON 
         */
        const data ={
            "documentoCodificadoID":     this.documentoCodificadoID,
            "docCodificadoBase64":  this.previsualizacion,
            "tipoDocumentoID": this.formDocumentoCodificado.get('tipoDocumentoID').value
        }

       /**
        * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
        * de acuerdo al documento de accion al que pertenezca.
        */
        if(this.accion === 2){
            this.blockUI.start('Editando ...');
        }else{
            this.blockUI.start('Guardando ...');
        }      

        this.service.registrarBYID(data, this.accion, 'crudDocumentoCodificado').subscribe(
        result => {
            this.blockUI.stop();
            if(result[0][0] === '0'){
                if(this.accion === 1){
                    this.nuevoDocumento();
                }
                if(this.accion === 2){
                    this.generarPdf();
                }
                 this.loading = false;
                 this.service.showNotification('top','right', 2, result[0][1])
            }  else{                    
                  this.service.showNotification('top','right', 3, result[0][1])
                }
          
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.message)
            this.loading = false;

        }
        )

    }

    /**
     * Metodo para listar los tipo de documentos y poder llamarlo dentro del combo 
     * en el modal principal.
     * @param general
     */
   spsTipoDocumento() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(2 ,'listaTipoDocumento').subscribe(data => {
      this.listaTipoDocumento = data;    
      
      if(this.accion == 2){
        let index=this.listaTipoDocumento.findIndex(x => x.tipoDocumentoID === this.data.documentoCodificado.tipoDocumentoID.tipoDocumentoID);
        this.formDocumentoCodificado.get('tipoDocumentoID').setValue(this.listaTipoDocumento[index]);
      }
      
        this.blockUI.stop();
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
}

 /**
    * Carga todos los combos y resetea el form
    */
  nuevoDocumento() {
    this.formDocumentoCodificado.reset();
    this.spsTipoDocumento();
    this.previsualizacion = '';
    this.archivoCapturado = '';
    this.archivos = [];
   

}


     
    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier documento de FormGroup
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