import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionBancoSatComponent } from "./modal-bancos-sat/administracion-bancos-sat.component";



@Component({
    selector: 'bancos-sat',
    moduleId: module.id,
    templateUrl: 'bancos-sat.component.html'

})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 10/09/2021
 * @descripcion: Componente para la gestion de bancos sat
 */

export class BancosSatComponent implements OnInit {


    //Declaracion de variables y compoenentes
    listaBancoSat: any[];
    displayedColumns: string[] = ['cveBanco', 'nombreBanco', 'estatus', 'acciones'];
    dataSourceBancoSat: MatTableDataSource<any>;
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
        this.spsBancoSat();
    }


    /**
     * Metodo para cargar en tabla de bancos sat
     */
    spsBancoSat() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaBancoSat').subscribe(data => {
            this.blockUI.stop();
            this.listaBancoSat = data;
            this.dataSourceBancoSat = new MatTableDataSource(this.listaBancoSat);
            this.dataSourceBancoSat.paginator = this.paginator;
            this.dataSourceBancoSat.sort = this.sort;

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
        this.dataSourceBancoSat.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceBancoSat.paginator) {
            this.dataSourceBancoSat.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data 
     */
    abrirDialogoBancoSat(data) {
        /** si la accion es igual*/

        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.titulo = 'Editar';
            this.accion = 2;
        }

        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionBancoSatComponent, {

            data: {

                accion: this.accion,
                titulo: this.titulo,
                bancosat: data
            }
        }
        );

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsBancoSat();
        });

    }


/**
 * Metodo para dar de baja
 * @param elemento --Lista con los datos de Bancos Sat
 */
    bajaBancoSat(elemento: any) {
          //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "bancosatId": elemento.bancosatId,
            "cveBanco": elemento.cveBanco,
            "nombreBanco": elemento.nombreBanco,
            "estatus": false
        };

         //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudBancoSat').subscribe(
            result => {

                elemento.estatus= false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spsBancoSat();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );
    }

    /**
     * SE agrega metodo para dar reingreso a un banco 
     * @param elemento 
     */
    reingresoBancoSat(elemento: any) {
        this.blockUI.start('Procesando Reingreso...');
        const data = {
            "bancosatId": elemento.bancosatId,
            "cveBanco": elemento.cveBanco,
            "nombreBanco": elemento.nombreBanco,
            "estatus": true

        };


        this.service.registrarBYID(data, 4, 'crudBancoSat').subscribe(
            result => {
                elemento.estatus= true;
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {

                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.spsBancoSat();
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
            this.bajaBancoSat(element);
        } else {
            this.reingresoBancoSat(element);
        }

    }


}