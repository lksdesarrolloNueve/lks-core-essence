import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdministracionAvisosComponent } from "./modal-avisos/admin-avisos.component";

@Component({
    selector: 'Avisos',
    moduleId: module.id,
    templateUrl: 'avisos.component.html'
})

/**
 * @autor: Eduardo Romero Haro
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la gestion de avisos
 */

export class AvisosComponent implements OnInit {
    
    //Declaracion de varablies y Controles
    displayedColumns: string[] = ['claveAviso','descripcion','dias','rangoDias','clasificacion','estatus','acciones']
    listaAvisos =[];

    //Imports
    dataSourceAvisos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la calse AvisosComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog){

    }

    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsAvisos();
    }
    /**
     * Metodo que lista los avisos
     */
    spsAvisos(){
        this.service.getListByID(1,'listaAvisos').subscribe(data =>{
            this.listaAvisos = data;
            this.dataSourceAvisos = new MatTableDataSource(this.listaAvisos);
            this.dataSourceAvisos.paginator = this.paginator;
            this.dataSourceAvisos.sort = this.sort;
        },error =>{
            this.service.showNotification('top','right',4, error.message)
        }); 
    }

    /**
     * Metodo para filtrar la tabla
     */

     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceAvisos.filter = filterValue.trim().toLowerCase();

        if(this.dataSourceAvisos.paginator){
            this.dataSourceAvisos.paginator.firstPage();
        }
    }

    /**
     * Metodo para dar de baja un Aviso
     */
     crudAvisos(elemento: any, datos: any) {
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
        this.service.registrarBYID(datos, tipoAccion, 'crudAvisos').subscribe(
        result => {
            this.blockUI.stop();
            if(result[0][0] === '0'){

                 datos.estatus = elemento;
                 this.service.showNotification('top','right', 2, result[0][1])
            }  else{                    
                  this.service.showNotification('top','right', 3, result[0][1])
                }
          
        }, error => {
            this.spsAvisos();
            this.blockUI.stop();
            this.service.showNotification('top','right',4, error.message)


        }
        )

    }
    /**
     * 
     * @param accion 
     */
    abrirAdminAvisos(elemento, accion){
        let titulo = 'REGISTRAR'
        if(accion !==1){
            titulo = 'EDITAR'
        }
       const dialogoRef = this.dialog.open(AdministracionAvisosComponent,{
            data:{
                accion : accion,
                titulo : titulo,
                aviso: elemento
            }
        })
        //Este se usa para que cuando cerramos
        dialogoRef.afterClosed().subscribe(result=>{
        this.spsAvisos();
        });
    }
    


}