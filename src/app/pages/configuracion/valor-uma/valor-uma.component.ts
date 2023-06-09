import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionUmaComponent } from "./modal-uma/administracion-uma.component";


@Component({
    selector: 'valor-uma',
    moduleId: module.id,
    templateUrl: 'valor-uma.component.html'

})

/**
 * @autor:Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 03/02/2022
 * @descripcion: Componente para la gestion de valores de uma
 */

export class UmaComponent implements OnInit {


    //Declaracion de variables y compoenentes
    listaValorUma: any[];
    displayedColumns: string[] = ['consecutivo','anio', 'valorDiario','valorMensual','valorAnual','estatus', 'acciones'];
    dataSourceUma: MatTableDataSource<any>;
    accion: number;
    titulo: String;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;


    /**
       * Constructor de variables y componentes
       * @param servcice -Service para el acceso de datos
       */
    constructor(private service: GestionGenericaService, public dialog: MatDialog
    ) {


    }

    /**
   * Metodo OnInit de la clase
   */

    ngOnInit() {
        this.spsvalorUma();
    }


    /**
     * Metodo para cargar la tabla de valores de uma
     */
    spsvalorUma() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listavalorUma').subscribe(data => {
            this.blockUI.stop();
            this.listaValorUma = data;
            this.dataSourceUma = new MatTableDataSource(this.listaValorUma);
            this.dataSourceUma.paginator = this.paginator;
            this.dataSourceUma.sort = this.sort;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para filtrar la tabla
     * @param event - Dato a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceUma.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceUma.paginator) {
            this.dataSourceUma.paginator.firstPage();
        }
    }

/**
 * Metodo para dar de baja
 * @param elemento --Lista con los datos 
 */
    bajaUma(elemento: any) {
          //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "umaId": elemento.umaId,
            "anio": elemento.anio,
            "valorDiario": elemento.valorDiario,
            "valorMensual" : elemento.valorMensual,
            "valorAnual": elemento.valorAnual,
            "estatus": false
        };

         //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudUma').subscribe(
            result => {

                elemento.estatus= false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spsvalorUma();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );
    }

    /**
     * SE agrega metodo para dar reingreso  
     * @param elemento 
     */
    reingresoUma(elemento: any) {
        this.blockUI.start('Procesando Reingreso...');
        const data = {
            "umaId": elemento.umaId,
            "anio": elemento.anio,
            "valorDiario": elemento.valorDiario,
            "valorMensual" : elemento.valorMensual,
            "valorAnual": elemento.valorAnual,
            "estatus": true
        };


        this.service.registrarBYID(data, 4, 'crudUma').subscribe(
            result => {
                elemento.estatus= true;
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {

                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.spsvalorUma();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorReingreso.error + '<br>' + errorReingreso.trace)
            }
        );
    }

 /**
     * Metodo para abrir ventana modal
     * @param data 
     */
  abrirDialogoIndice(data) {
    /** si la accion es igual*/

    if (data === 0) {
        this.titulo = 'Registrar';
        this.accion = 1;
    } else {
        this.titulo = 'Editar';
        this.accion = 2;
    }

    //se abre el modal
    const dialogRef = this.dialog.open(AdministracionUmaComponent, {
        data: {

            accion: this.accion,
            titulo: this.titulo,
            uma: data
        }
    }
    );

    //Se usa para cuando cerramos
    dialogRef.afterClosed().subscribe(result => {
        this.spsvalorUma();
    });

}

    /**
  * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
  */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaUma(element);
        } else {
            this.reingresoUma(element);
        }

    }


}