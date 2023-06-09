import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionIndicehhComponent } from "./modal-indicehh/administracion-indicehh.component";


@Component({
    selector: 'indice-hh',
    moduleId: module.id,
    templateUrl: 'indice-hh.component.html'

})

/**
 * @autor:Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de bancos siti
 */

export class IndicehhComponent implements OnInit {


    //Declaracion de variables y compoenentes
    listaIndicehh: any[];
    displayedColumns: string[] = ['claveIndice', 'indiceInicial','indiceFinal','descripcion','estatus', 'acciones'];
    dataSourceIndicehh: MatTableDataSource<any>;
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
        this.spsIndiceshh();
    }


    /**
     * Metodo para cargar la tabla de indices hh
     */
    spsIndiceshh() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaIndicehh').subscribe(data => {
            this.blockUI.stop();
            this.listaIndicehh = data;
            this.dataSourceIndicehh = new MatTableDataSource(this.listaIndicehh);
            this.dataSourceIndicehh.paginator = this.paginator;
            this.dataSourceIndicehh.sort = this.sort;

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
        this.dataSourceIndicehh.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceIndicehh.paginator) {
            this.dataSourceIndicehh.paginator.firstPage();
        }
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
        const dialogRef = this.dialog.open(AdministracionIndicehhComponent, {
            width: '50%',
            data: {

                accion: this.accion,
                titulo: this.titulo,
                indicehh: data
            }
        }
        );

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsIndiceshh();
        });

    }



/**
 * Metodo para dar de baja
 * @param elemento --Lista con los datos de Bancos Sat
 */
    bajaIndice(elemento: any) {
          //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "ihhId": elemento.ihhId,
            "claveIndice": elemento.claveIndice,
            "indiceInicial": elemento.indiceInicial,
            "indiceFinal" : elemento.indiceFinal,
            "descripcion": elemento.descripcion,
            "estatus": false
        };

         //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudIndicehh').subscribe(
            result => {

                elemento.estatus= false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spsIndiceshh();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );
    }

    /**
     * SE agrega metodo para dar reingreso a un banco 
     * @param elemento 
     */
    reingresoIndice(elemento: any) {
        this.blockUI.start('Procesando Reingreso...');
        const data = {
            "ihhId": elemento.ihhId,
            "claveIndice": elemento.claveIndice,
            "indiceInicial": elemento.indiceInicial,
            "indiceFinal" : elemento.indiceFinal,
            "descripcion": elemento.descripcion,
            "estatus": true
        };


        this.service.registrarBYID(data, 4, 'crudIndicehh').subscribe(
            result => {
                elemento.estatus= true;
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {

                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.spsIndiceshh();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorReingreso.error + '<br>' + errorReingreso.trace)
            }
        );
    }

    /**
  * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
  */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaIndice(element);
        } else {
            this.reingresoIndice(element);
        }

    }


}