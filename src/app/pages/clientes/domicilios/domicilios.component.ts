import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { data } from "jquery";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { AdministracionDomiciliosComponent } from "./modal-domicilios/admin-domicilios.component";

@Component({
    selector: 'Domicilios',
    moduleId: module.id,
    templateUrl: 'domicilios.component.html'
})

/**
 * @autor: Eduardo Romero Haro
 * @version: 1.0.0
 * @fecha: 15/10/2021
 * @descripcion: Componente para la gestion de domicilios
 */

export class DomiciliosComponent implements OnInit {
    
    //Declaracion de variables y Controles
    displayedColumns: string[] = ['calle','numeroExterior','numeroInterior','entreCalle1','entreCalle2',
                                  'referencia','colonia','nacionalidad','resExtranjera',
                                  'tiempoArraigo','acciones']
    listaDomicilios =[];

    //Imports
    dataSourceDomicilios: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor de la calse DomiciliosComponent
     * @param service --Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog){

    }

    /**
     * Metodo que ngOnInit
     */
    ngOnInit() {
        this.spsDomicilios();
    }
    /**
     * Metodo que lista los domicilios
     */
    spsDomicilios(){
        this.service.getListByID(1,'listaDomicilios').subscribe(data =>{
            this.listaDomicilios = data;
            this.dataSourceDomicilios = new MatTableDataSource(this.listaDomicilios);
            this.dataSourceDomicilios.paginator = this.paginator;
            this.dataSourceDomicilios.sort = this.sort;
        },error =>{

        }); 
    }

    /**
     * Metodo para filtrar los datos de la tabla
     */

     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceDomicilios.filter = filterValue.trim().toLowerCase();

        if(this.dataSourceDomicilios.paginator){
            this.dataSourceDomicilios.paginator.firstPage();
        }
    }

    
    /**
     * 
     * @param accion 
     */
    abrirAdminDomicilios(elemento, accion){
        let titulo = 'REGISTRAR'
        if(accion !==1){
            titulo = 'EDITAR'
        }
       const dialogoRef = this.dialog.open(AdministracionDomiciliosComponent,{
            width: '40%',
            data:{
                accion : accion,
                titulo : titulo,
                domicilio: elemento
            }
        })
        //Este se usa para que cuando cerramos
        dialogoRef.afterClosed().subscribe(result=>{
        this.spsDomicilios();
        });
    }
    


}