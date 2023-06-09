import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { AdministracionServidoresComponent } from "./modal-servidores/admin-servidores.component";
import { FiresbaseService } from '../../../shared/service/service-firebase/firebase.service';


@Component({
    selector: 'servidores',
    moduleId: module.id,
    templateUrl: 'servidores.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 17/09/2021
 * @descripcion: Componente para la gestion de servidores
 */
export class ServidoresComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['nombreServidor', 'ip', 'nombrebd', 'puerto', 'estatus', 'acciones'];
    dataSourceServidores: MatTableDataSource<any>;
    listaServidores: any;

    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;




    /**
    * Constructor del componente ServidoresComponent
    * @param service - Service para el acceso a datos
    * @param dialog - Servicio para la gestion de Dialogos Tipo Modal
    */
    constructor(private service: GestionGenericaService, 
        private firebase: FiresbaseService,
        public dialog: MatDialog) {
     
    }


    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsServidores();

    }

    /**
     * Metodo para cargar en tabla los servidores
     */
    spsServidores() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1,'listaServidores').subscribe(data => {
            this.blockUI.stop();
            this.listaServidores = data;
            this.dataSourceServidores = new MatTableDataSource(this.listaServidores);
            this.dataSourceServidores.paginator = this.paginator;
            this.dataSourceServidores.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para filtrar sucursales
     * @param event - evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceServidores.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceServidores.paginator) {
            this.dataSourceServidores.paginator.firstPage();
        }
    }

    /**
      * Metodo para dar de baja servidores
      * @returns notificacion de resultado
      */
    bajaServidor(elemento: any) {


        this.blockUI.start('Procesando baja...');

        const data = {

            "servidorId": elemento.servidorId,
            "nombreServidor": "",
            "ip": "",
            "nombrebd": "",
            "puerto": 0,
            "usuario": "",
            "contrasenia": "",
            "estatus": false
        };


        let headerPath = 0 + '/' + 3;

        this.service.registrarBYID(data, headerPath, 'crudServidores').subscribe(
            result => {
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    elemento.estatus = false;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.spsServidores();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }

    /**
    * Metodo para dar de baja servidores
    * @returns notificacion de resultado
    */
    reingresoServidor(elemento: any) {


        this.blockUI.start('Procesando reingreso...');

        const data = {

            "servidorId": elemento.servidorId,
            "nombreServidor": "",
            "ip": "",
            "nombrebd": "",
            "puerto": 0,
            "usuario": "",
            "contrasenia": "",
            "estatus": true
        };


        let headerPath = 0 + '/' + 4;

        this.service.registrarBYID(data, headerPath, 'crudServidores').subscribe(
            result => {
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, errorReingreso => {
                this.spsServidores();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorReingreso.Message);
            }
        );
    }

        /**
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         */
         cambiaEstatus(element: any){
            if(element.estatus){
                this.bajaServidor(element);
            }else{
                this.reingresoServidor(element);
            }
        }
    


    /**
     * Metodo que me abre un modal para la gestion de servidores (REgistar, EDitar)
     * @param data - Objecto o valor a condicionar
     */
    abrirDialogoServidores(data) {

        //Si la accion es igual a 0 el titulo se llamara Registrar Si no Editar
        if (data === 0) {
            this.titulo = "registrar";
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = "Editar";
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdministracionServidoresComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                servidor: data
            }
        });


        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsServidores();
        });
    }


}