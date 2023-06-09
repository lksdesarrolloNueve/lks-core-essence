import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdminAsignaDocumentoComponent } from "./modal-asigna-documento/admin-asigna-documento.component";
import { globales } from '../../../../environments/globales.config';


@Component({
    selector: 'asigna-documento',
    moduleId: module.id,
    templateUrl: 'asigna-documento.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 15/10/2021
 * @descripcion: Componente para la gestion de asignacion de documentos
 */

export class AsignaDocumentoComponent implements OnInit {
    
    //Declaracion de varablies y Controles
    displayedColumns: string[] = ['claveAsignaDocumento','tipoDocumentoID','tipoSocioID','estatus','acciones']
    listaAsignaDocumento =[];
   

   
    //Imports
    dataSourceAsignaDocumento: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;
    

    /**
     * Constructor de la clase AsignaDocumentoComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog){
        
    }

    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsAsignaDocumento();
    }
    /**
     * Metodo que lista los Asigna documentos
     */
     spsAsignaDocumento(){
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaAsignaDocumento').subscribe(data =>{
            this.blockUI.stop();
            this.listaAsignaDocumento = data;
            this.dataSourceAsignaDocumento = new MatTableDataSource(this.listaAsignaDocumento);
            this.dataSourceAsignaDocumento.paginator = this.paginator;
            this.dataSourceAsignaDocumento.sort = this.sort;
        },error =>{
            this.blockUI.stop();
            this.service.showNotification('top','right',4,'Ocurrio un error con el servidor.')
        }); 
    }

    /**
     * Metodo para filtrar la tabla
     */

     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceAsignaDocumento.filter = filterValue.trim().toLowerCase();

        if(this.dataSourceAsignaDocumento.paginator){
            this.dataSourceAsignaDocumento.paginator.firstPage();
        }
    }

    /**
     * Metodo para dar de baja un asigna documento
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
            this.spsAsignaDocumento();
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.message)


        }
        )

    }
    /**
     * 
     * @param accion 
     */
    abrirAdminAsignaDocumento(elemento, accion){
        let titulo = 'REGISTRAR'
        if(accion !==1){
            titulo = 'EDITAR'
        }
       const dialogoRef = this.dialog.open(AdminAsignaDocumentoComponent,{
            data:{
                accion : accion,
                titulo : titulo,
                asignaDocumento: elemento
               
            }
        })
        //Este se usa para que cuando cerramos
        dialogoRef.afterClosed().subscribe(result=>{
        this.spsAsignaDocumento();
        });
    }
    


}