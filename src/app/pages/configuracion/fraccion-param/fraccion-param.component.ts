import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ModalFraccionParametros } from "./modal-fraccion-param/modal-fraccion-param.component";

@Component({
    selector: 'fraccion-param',
    moduleId: module.id,
    templateUrl: 'fraccion-param.component.html'
})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 13/09/2022
 * @descripcion: Componente para la gestion de fraccion parametros
 */

export class FraccionParamComponent {
    /**Inicializacion y declaracion de variables */
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    displayedColumns: string[] = ['descripcion', 'cuentaPri', 'principal', 'cuentaGrupal', 'grupal', 'acciones'];
    dataSourceFracc: MatTableDataSource<any>;
    listaFraccParam: any = [];
    /**
       * Constructor del componente Fraccion prametros
       * @param dialog -- Componente para crear diálogos modales en Angular Material 
       * @param service -- Instancia de acceso a datos
       */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
        * Metodo OnInit de la clase
        */
    ngOnInit() {
        this.spsFraccParam();
    }

    /**
     * Metodo para obtener la lista de monedas
     */
    spsFraccParam() {
        this.blockUI.start('Cargando datos...');
        this.service.getList('spsFraccParam').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaFraccParam = JSON.parse(data);
                this.dataSourceFracc = new MatTableDataSource(this.listaFraccParam);
                this.dataSourceFracc.paginator = this.paginator;
                this.dataSourceFracc.sort = this.sort;
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
         * Metodo que filtra la tabla fracciones parametros
         * @param event -Dato a filtrar
         */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceFracc.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceFracc.paginator) {
            this.dataSourceFracc.paginator.firstPage();
        }
    }
    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    openDialog(data) {
        //Si es 1 es Registrar si es diferente es actualizar
        if (data === 1) {
            this.titulo = "Registrar parámetro fracción";
            this.accion = 1;
        } else {
            this.titulo = "Editar parámetro fracción"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(ModalFraccionParametros, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                param: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsFraccParam();
        });
    }
    /**
      * Metodo que valida si va vacio.
      * @param value 
      * @returns 
      */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}