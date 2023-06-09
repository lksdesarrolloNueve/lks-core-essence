import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable, Subscriber } from "rxjs";
import { GestionGenericaService } from "../../../../shared/service/gestion";



@Component({
    selector: 'admin-pdf',
    moduleId: module.id,
    templateUrl: 'admin-pdf.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 01/11/2021
 * @descripcion: Componente para la gestion de documentos codificados
 */

export class AdminPdfComponent implements OnInit {


    //Declaracion de variables
    titulo: string;
    accion: number;
    documentoCodificadoID: number = 0;
    @BlockUI() blockUI: NgBlockUI;
    fileReader = new FileReader();

    listaTipoDocumento: any;
    tipoDocumentoControl = new UntypedFormControl('', [Validators.required])
    tipoSocioControl = new UntypedFormControl('', [Validators.required])
    formPdf: UntypedFormGroup;


    // Visualizador
    name = 'prueba';
    url: string;
    urlSafe: SafeResourceUrl;

    myimage: Observable<any>;
    public archivos: any = [];
    public previsualizacion: string;
    public loading: boolean;
    archivoCapturado: any;
    imagen: any;




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
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.titulo = data.titulo + ' Documento';
        this.accion = data.accion;
        this.formPdf = this.formBuilder.group({
            tipoDocumentoID: this.tipoDocumentoControl
        });
       

        //Se obtienen los valores para poder pintarlos en el modal.
        if (this.accion === 2) {

            this.documentoCodificadoID = data.documentoCodificado.documentoCodificadoID
            this.previsualizacion = (data.documentoCodificado.docCodificadoBase64);
            this.formPdf.get('tipoDocumentoID').setValue(data.documentoCodificado.tipoDocumentoID);
        }

    }

    /**
     * Metodo que abre un modal para la gestion de Inversion
     */

    ngOnInit() {
        this.spsTipoDocumento();
        this.generarPdf();
    }


    /**
* Metodo para listar los tipo de documentos y poder llamarlo dentro del combo 
* en el modal principal.
* @param general
*/
    spsTipoDocumento() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaTipoDocumento').subscribe(data => {
            this.listaTipoDocumento = data;

            if (this.accion == 2) {
                let index = this.listaTipoDocumento.findIndex(x => x.tipoDocumentoID === this.data.documentoCodificado.tipoDocumentoID.tipoDocumentoID);
                this.formPdf.get('tipoDocumentoID').setValue(this.listaTipoDocumento[index]);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo para descargar archivos
     */
    download(base64String, fileName) {
        base64String = this.data.documentoCodificado.docCodificadoBase64;
        const source = `${base64String}`;
        const link = document.createElement("a");
        link.href = source;
        //  Condicion para obtener caracteres del base 64 y validar si es .jpg/png o pdf
        if (base64String.indexOf('data:application/pdf;base64') !== -1) {
            this.blockUI.start('Procesando Descarga...');
            link.download = `${fileName}.pdf`
            this.blockUI.stop();
        } else {
            this.blockUI.start('Procesando Descarga...');
            link.download = `${fileName}.jpg`
            this.blockUI.stop();
        }

        link.click();
    }
    onClickDownload() {

        let base64String = "your-base64-string";
        this.download(base64String, 'Documento');

    }



    /**Metodo para visualizar los archivos en el Iframe */
    generarPdf() {
        this.spsTipoDocumento();
        this.url = this.data.documentoCodificado.docCodificadoBase64;
        this.urlSafe = this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    }


    //Metodo para conversion en base 64 
    capturarFile(event): any {
        this.archivoCapturado = event.target.files[0];
        this.extraerBase64(this.archivoCapturado).then((imagen: any) => {
            this.imagen = imagen.image
            this.previsualizacion = imagen.base;
        })
        this.archivos.push(this.archivoCapturado)
    }
    // Metodo para la extracion de la BASE 64 del archivo
    extraerBase64 = async ($event: any) => new Promise((resolve, reject) => {
        try {
            const unsafeImg = window.URL.createObjectURL($event);
            const image = this.sanitizer.bypassSecurityTrustUrl(unsafeImg);
            const reader = new FileReader();
            reader.readAsDataURL($event);

            reader.onload = () => {
                resolve({
                    blob: $event,
                    image,
                    base: reader.result
                });
            };
            reader.onerror = error => {
                resolve({
                    base: null
                });
            };
        } catch (e) {
            return null;
        }
    });


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