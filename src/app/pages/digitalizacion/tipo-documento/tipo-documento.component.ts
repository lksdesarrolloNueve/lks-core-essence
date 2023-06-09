import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { data } from "jquery";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdminTipoDocumentoComponent } from "./modal-tipo-documento/admin-tipo-documento.component";

@Component({
    selector: 'tipo-documento',
    moduleId: module.id,
    templateUrl: 'tipo-documento.component.html'
})

/**
 * @autor: Juan Manuel Rincon Ortega
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la gestion de tipo de documentos
 */

export class TipoDocumentoComponent implements OnInit {
    
    //Declaracion de varablies y Controles
    displayedColumns: string[] = ['claveTipoDocumento','nombreDoc','limiteMB','estatus','acciones']
    listaTipoDocumento =[];
    

    //Imports
    dataSourceTipoDocumento: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la calse TipoDocumentoComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog){

    }

    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsTipoDocumento();
    }
    /**
     * Metodo que lista los tipo documentos
     */
     spsTipoDocumento(){
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaTipoDocumento').subscribe(data =>{
            this.blockUI.stop();
            this.listaTipoDocumento = data;
            this.dataSourceTipoDocumento = new MatTableDataSource(this.listaTipoDocumento);
            this.dataSourceTipoDocumento.paginator = this.paginator;
            this.dataSourceTipoDocumento.sort = this.sort;
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
        this.dataSourceTipoDocumento.filter = filterValue.trim().toLowerCase();

        if(this.dataSourceTipoDocumento.paginator){
            this.dataSourceTipoDocumento.paginator.firstPage();
        }
    }

    /**
     * Metodo para dar de baja un tipo documento
     */
     crudTipoDocumento(elemento: any, datos: any) {
        let  tipoAccion = 0;

        /**
         * Validacion de acuerdo al tipo de accion arroje un 
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

         let headerPath = 0 + '/' + 0 + '/'+ tipoAccion;
        this.service.registrarBYID(datos, headerPath, 'crudTipoDocumento').subscribe(
        result => {
            this.blockUI.stop();
            if(result[0][0] === '0'){
                
                 datos.estatus = elemento;
                 this.service.showNotification('top','right', 2, result[0][1])
            }  else{                    
                  this.service.showNotification('top','right', 3, result[0][1])
                }
          
        }, error => {
            this.spsTipoDocumento();
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.message)


        }
        )

    }

    
    /**
     * 
     * @param accion 
     */
    abrirAdminTipoDocumento(elemento, accion){
        let titulo = 'REGISTRAR'
        if(accion !==1){
            titulo = 'EDITAR'
        }
       const dialogoRef = this.dialog.open(AdminTipoDocumentoComponent,{
            data:{
                accion : accion,
                titulo : titulo,
                tipoDocumento: elemento
            }
            
        });

        //Este se usa para que cuando cerramos
        dialogoRef.afterClosed().subscribe(result=>{
        this.spsTipoDocumento();
        });
    }
    


}