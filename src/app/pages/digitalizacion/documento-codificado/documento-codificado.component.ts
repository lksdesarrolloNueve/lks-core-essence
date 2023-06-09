import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";
import { MatTableDataSource } from "@angular/material/table";
import { data } from "jquery";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdminDocumentoCodificadoComponent } from "./modal-documento-codificado/admin-documento-codificado.component";
import { AdminPdfComponent } from "./modal-pdf/admin-pdf.component";

@Component({
    selector: 'documento-codificado',
    moduleId: module.id,
    templateUrl: 'documento-codificado.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 01/11/2021
 * @descripcion: Componente para la gestion de documentos codificados
 */

export class DocumentoCodificadoComponent implements OnInit {
    
    //Declaracion de varablies y Controles
    displayedColumns: string[] = ['fechaAlta','tipoDocumentoID','acciones', 'ver']
    listaDocumentoCodificado =[];


   // Visualizador
   name = 'prueba';
   url: string = "https://angular.io/api/router/RouterLink";
   urlSafe: SafeResourceUrl;

   
    //Imports
    dataSourceDocumentoCodificado: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la clase AsignaDocumentoComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog, private sanitizer: DomSanitizer,){
        
    }

    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsDocumentoCodificado();
        this.urlSafe= this.sanitizer.bypassSecurityTrustResourceUrl(this.url);
    }

    







    /**
     * Metodo que lista los Asigna documentos
     */
     spsDocumentoCodificado(){
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaDocumentoCodificado').subscribe(data =>{
          
            this.blockUI.stop();
            this.listaDocumentoCodificado = data;
            this.dataSourceDocumentoCodificado = new MatTableDataSource(this.listaDocumentoCodificado);
            this.dataSourceDocumentoCodificado.paginator = this.paginator;
            this.dataSourceDocumentoCodificado.sort = this.sort;
        },error =>{
            this.blockUI.stop();

        }); 
    }

    /**
     * Metodo para filtrar la tabla
     */

     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceDocumentoCodificado.filter = filterValue.trim().toLowerCase();

        if(this.dataSourceDocumentoCodificado.paginator){
            this.dataSourceDocumentoCodificado.paginator.firstPage();
        }
    }

    /**
     * Metodo para dar de baja documento
     */
     crudAsignaDocumento(elemento: any, datos: any) {
        let  tipoAccion = 3;

        /**
         * Validacion de acuerdo al asigna de accion arroje un 
         * cuadro de diálogo dependiendo si es un registro de
         * baja o de alta.
         */
        if(elemento === false){
            tipoAccion = 3;//Baja
              this.blockUI.start('Procesando Baja...');
        }else{
            tipoAccion = 4;//Alta
            this.blockUI.start('Procesando Alta...');
        }
      
        /**
         * Consume el api de la parte de base de datos de acuerdo al tipo
         * de accion que se le mande
         * Param: datos,tipoAccion, variable en el que se guardo el API.
         */
        this.service.registrarBYID(datos, tipoAccion, 'crudAsignaDocumento').subscribe(
        result => {
            this.blockUI.stop();
            if(result[0][0] === '0'){
                 datos.estatus = elemento;
                 this.service.showNotification('top','right', 2, result[0][1])
            }  else{                    
                  this.service.showNotification('top','right', 3, result[0][1])
                }
          
        }, error => {
            this.spsDocumentoCodificado();
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.message)


        }
        )

    }
    /**
     * 
     * @param accion 
     */
    abrirAdminDocumentoCodificado(elemento, accion){
        let titulo = 'REGISTRAR'
        if(accion !==1){
            titulo = 'EDITAR'
        }
       const dialogoRef = this.dialog.open(AdminDocumentoCodificadoComponent,{
            width: '40%',
            data:{
                accion : accion,
                titulo : titulo,
                documentoCodificado: elemento
               
            }
        })
        //Este se usa para que cuando cerramos
        dialogoRef.afterClosed().subscribe(result=>{
        this.spsDocumentoCodificado();
        });
    }
    
 /**
     * 
     * @param accion 
     */
  abrirAdminPdf(elemento){
   
    
   const dialogoRef = this.dialog.open(AdminPdfComponent,{
        width: '40%',
        data:{
            documentoCodificado: elemento
           
        }
    })
    //Este se usa para que cuando cerramos
    dialogoRef.afterClosed().subscribe(result=>{
    this.spsDocumentoCodificado();
    });
}


}