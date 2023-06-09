import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionDivisionComponent } from "./modal-division/administracion-division.component";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";

@Component({
    selector: 'division',
    moduleId: module.id,
    templateUrl: 'division.component.html'

})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 29/09/2021
 * @descripcion: Componente para la gestion de actividades sinco
 */
export class DivisionComponent implements OnInit {
    //declaracion de Variables y componentes
    displayedColumns: string[] = ['cveD', 'division', 'clasificacion', 'estatus', 'acciones'];
    dataSourceDivision: MatTableDataSource<any>;
    listaDivision: any;
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
        this.spsDivision();
    }

    /**
    * Metodo para filtrar division
    * @param event --evento a filtrar
    */
    buscarDivision(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceDivision.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceDivision.paginator) {
            this.dataSourceDivision.paginator.firstPage();
        }
    }

    /**
    * Metodo para obtener la lista de division
    * 
    */
    spsDivision() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaDivision').subscribe(data => {
            this.blockUI.stop();
            this.listaDivision = data;
            this.dataSourceDivision = new MatTableDataSource(this.listaDivision);
            this.dataSourceDivision.paginator = this.paginator;
            this.dataSourceDivision.sort = this.sort;
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
        const dialogRef = this.dialog.open(AdministracionDivisionComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                division: data
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsDivision();//se refresque la tabla 
        });
    }


    /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos de Division
     */
    bajaDivision(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "divisionId": elemento.divisionId,
            "cveDivision": elemento.cveDivision,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "clasificacion": elemento.clasificacion
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudDivision').subscribe(resultado => {
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
    * Metodo para dar de alta Division
    * @param element --Lista con los datos de Division
    */
    reingresoDivision(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "divisionId": elemento.divisionId,
            "cveDivision": elemento.cveDivision,
            "descripcion": elemento.descripcion,
            "estatus": true,
            "clasificacion": elemento.clasificacion
        };

        this.service.registrarBYID(data, 4, 'crudDivision').subscribe(
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

    /**
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         * @param element --Lista con los datos de division
         */
    cambiaEstatus(element: any) {
        if (element.estatus === false) {
            this.abrirAdvertencia(element, 1);//activar 
        } else if (element.estatus === true) {
            this.abrirAdvertencia(element, 0);//desactivar
        }
    }
    /**
   * Abrir ventana modal de confirmacion
   * @param element datos division
   * @param accion 1:Activar, 0: Desactivar
   * */
    abrirAdvertencia(elemento: any, accion: number) {
        var encabezado = "";
        var body = "";
        if (accion === 1) {
            encabezado = "Activar división";
            body = 'La división ' + elemento.descripcion + ' contiene grupos,subgrupos que se activaran.';
        } else {
            encabezado = "Desactivar división";
            body = 'La división ' + elemento.descripcion + ' contiene grupos,subgrupos que se desactivaran.'
        }
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0 && accion === 1) {//aceptar y va a Activar
                this.reingresoDivision(elemento);
            } else if (result === 0 && accion === 0) {//aceptar y va a desactivar                
                this.bajaDivision(elemento);
            }
            else {//se refresca
                this.spsDivision();
            }
        });
    }
}