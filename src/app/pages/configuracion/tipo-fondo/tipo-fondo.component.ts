import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionFondos } from "./modal-tipo-fondos/administracion-fondos.component";






@Component({
    selector: 'tipo-fondos',
    moduleId: module.id,
    templateUrl: 'tipo-fondo.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 12/Enero/2022
 * @descripcion: Componente para la gestion de tipo de fondos
 */

 export class TipoFondosComponent implements OnInit {

        //Declaracion de Variables y Componentes
        displayedColumns: string[] = ['cvetfondo', 'descripcion', 'montolimite', 'estatus','acciones'];
        dataSourceTipoFondo: MatTableDataSource<any>;
        listaTipoFondos: any;
        accion: number;
        titulo: string;

        @ViewChild(MatPaginator) paginator: MatPaginator;
        @ViewChild(MatSort) sort: MatSort;
        @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente tipo fondos
    * @param service -- Instancia de acceso a datos
    * @param dialog -- Componente para crear diálogos modales en Angular Material 
    */
     constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }


     /**
     * Metodo ngOnInit de la clase
     */
      ngOnInit() {
        this.spsTipoFondos();
    }

     /**
    * Metodo para listar tipo de fondos
    * Se lista 1.- muestra todos, 2.- muestra activos , 3.- muestra inactivos
    */
   spsTipoFondos(){
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(1, 'listaTipoFondos').subscribe(data => {
        this.blockUI.stop();
        this.listaTipoFondos = data;
        this.dataSourceTipoFondo = new MatTableDataSource(this.listaTipoFondos);
        this.dataSourceTipoFondo.paginator = this.paginator;
        this.dataSourceTipoFondo.sort = this.sort;
    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });
   }

    /**
    * Metodo para filtrar tipo fondo
    * @param event --evento a filtrar
    */
     applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceTipoFondo.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceTipoFondo.paginator) {
            this.dataSourceTipoFondo.paginator.firstPage();
        }
    }


    /**
    * Metodo para dar de baja
    * @param elemento --Lista 
    */
     bajaTipoFondo(elemento: any) {
        this.blockUI.start('Procesando baja ...');
        //areglo que contiene los datos para baja
        const data = {
            "tipofondoid": elemento.tipofondoid,
            "descripcion": elemento.descripcion,
            "montolimite": elemento.montolimite,
            "estatus": false,
           
        };
        //se manda llamar el metodo para dar de baja
        //crudTipoFondos
        this.service.registrarBYID(data, 3, 'crudTipoFondos').subscribe(resultado => {
           
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error 
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

     /**
   * Metodo para dar de alta un tipo de fondo
   * @param element --Lista con los datos de tipo de fondos
   */
      reingresoTipoFondo(elemento: any) {
        this.blockUI.start('Procesando reingreso ...');
        //areglo que contiene los datos para dar reingreso
        const data = {
            "tipofondoid": elemento.tipofondoid,
            "descripcion": elemento.descripcion,
            "montolimite": elemento.montolimite,
            "estatus": false,
        };
        this.service.registrarBYID(data, 4, 'crudTipoFondos').subscribe(
            result => {
                
                //Se condiciona resultado
                if (result[0][0] === '0') {
                    //se cierrra el loader
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
     openDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }

         //Se abre el modal
         const dialogRef = this.dialog.open(AdministracionFondos,{
            data: {
                titulo: this.titulo,
                accion: this.accion,
                fondo: data
            }
        });

        //Este se usa para que cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsTipoFondos();
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
                this.spsTipoFondos();//se refresque la tabla y se vea lel nuevo fondo que se agrego.      
            }
        });

    }


     /**
        * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
        * @param element --Lista con los datos tipo de fondos
        */
      cambiaEstatus(element: any) {
        if (element.estatus) {
            this.blockUI.stop();
           this.bajaTipoFondo(element);
        } else {
            this.blockUI.stop();
            this.reingresoTipoFondo(element);
        }
    }

 }