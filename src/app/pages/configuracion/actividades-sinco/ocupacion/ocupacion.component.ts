import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionOcupacionComponent } from "./modal-ocupacion/administracion-ocupacion.component";

@Component({
    selector: 'ocupacion',
    moduleId: module.id,
    templateUrl: 'ocupacion.component.html'
    
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 04/10/2021
 * @descripcion: Componente para la gestion de Ocupaciones SINCO
 */
export class OcupacionComponent implements OnInit {

    displayedColumns: string[] = ['cveOcu', 'descripcion', 'sueldo','codPld','scian','riesgo','vulnerable','unitario', 'estatus', 'acciones'];
    dataSourceOcupaciones: MatTableDataSource<any>;
    listaOcupaciones: any;
    
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

     /**
     * Constructor del componente 
     * @param service -- Instancia de acceso a datos
     * @param dialog -- Componente para crear diálogos modales en Angular Material 
     */
  constructor(private service: GestionGenericaService, public dialog: MatDialog) {
   
}
     /**
     * Metodo OnInit de la clase
     */
      ngOnInit() {
this.spsOcupaciones();
    }

     /**
     * Metodo para filtrar ciudades
     * @param event --evento a filtrar
     */
      buscarOcupacion(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceOcupaciones.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceOcupaciones.paginator) {
            this.dataSourceOcupaciones.paginator.firstPage();
        }
    }

     /**
     * Metodo para obtener la lista de ocupaciones
     *  
     */
      spsOcupaciones() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaOcupacionesSinco').subscribe(data => {
            this.blockUI.stop();
            this.listaOcupaciones = data;
            this.dataSourceOcupaciones = new MatTableDataSource(this.listaOcupaciones);
            this.dataSourceOcupaciones.paginator = this.paginator;
            this.dataSourceOcupaciones.sort = this.sort;            
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
     abrirDialog(data) {
         //Si es 0 es Registrar si es diferente es actualizar
         if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionOcupacionComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                ocupacion: data
            }
        });
           //Se usa para cuando cerramos
           dialogRef.afterClosed().subscribe(result => {
            this.spsOcupaciones();//se refresque la tabla 

        });
    }
      /**
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         * @param element --Lista con los datos de division
         */
       cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaOcupacion(element);
        } else {
            this.reingresoOcupacion(element);
        }
    }

     /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos de Ocupaciones
     */
      bajaOcupacion(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "ocupacionId": elemento.ocupacionId,
            "cveOcupacion": elemento.cveOcupacion,
            "descripcion": elemento.descripcion,
            "sueldoMensual":elemento.sueldoMensual,
            "codPld":elemento.codPld,
            "codScian":elemento.codScian,
            "estatus": false,
            "nivelRiesgo": elemento.nivelRiesgo,
            "actVulnerable":elemento.actVulnerable,
            "unitario":elemento.unitario
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudOcupacion').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();//se cierra el loader
                elemento.estatus = false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error             
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    /**
    * Metodo para dar de alta Ocupacion
    * @param element --Lista con los datos de Ocupacion
    */
     reingresoOcupacion(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "ocupacionId": elemento.ocupacionId,
            "cveOcupacion": elemento.cveOcupacion,
            "descripcion": elemento.descripcion,
            "sueldoMensual":elemento.sueldoMensual,
            "codPld":elemento.codPld,
            "codScian":elemento.codScian,
            "estatus": false,
            "nivelRiesgo": elemento.nivelRiesgo,
            "actVulnerable":elemento.actVulnerable,
            "unitario":elemento.unitario
        };

        this.service.registrarBYID(data, 4, 'crudOcupacion').subscribe(
            result => {

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    elemento.estatus = true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            }
        );

    }
}