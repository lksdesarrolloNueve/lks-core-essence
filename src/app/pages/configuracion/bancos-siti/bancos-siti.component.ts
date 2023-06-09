import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionBancoSitiComponent } from "./modal-bancos-siti/administracion-bancos-siti.component";



@Component({
    selector: 'bancos-siti',
    moduleId: module.id,
    templateUrl: 'bancos-siti.component.html'

})

/**
 * @autor:Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de bancos siti
 */

export class BancosSitiComponent implements OnInit {


    //Declaracion de variables y compoenentes
    listaBancoSiti: any[];
    displayedColumns: string[] = ['clave_siti', 'nombre_banco', 'estatus', 'acciones'];
    dataSourceBancoSiti: MatTableDataSource<any>;
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
        this.spsBancoSiti();
    }


    /**
     * Metodo para cargar en tabla de bancos siti
     */
    spsBancoSiti() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaBancoSiti').subscribe(data => {
            this.blockUI.stop();
            this.listaBancoSiti = data;
            this.dataSourceBancoSiti = new MatTableDataSource(this.listaBancoSiti);
            this.dataSourceBancoSiti.paginator = this.paginator;
            this.dataSourceBancoSiti.sort = this.sort;

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
        this.dataSourceBancoSiti.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceBancoSiti.paginator) {
            this.dataSourceBancoSiti.paginator.firstPage();
        }
    }

    /**
     * Metodo para abrir ventana modal
     * @param data 
     */
    abrirDialogoBancoSiti(data) {
        /** si la accion es igual*/

        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.titulo = 'Editar';
            this.accion = 2;
        }

        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionBancoSitiComponent, {
            data: {

                accion: this.accion,
                titulo: this.titulo,
                bancositi: data
            }
        }
        );

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsBancoSiti();
        });

    }


/**
 * Metodo para dar de baja
 * @param elemento --Lista con los datos de Bancos Sat
 */
    bajaBancoSiti(elemento: any) {
          //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "bancositiId": elemento.bancositiId,
            "clave_siti": elemento.cveSiti,
            "nombre_banco": elemento.nombreBanco,
            "estatus": false
        };

         //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudBancoSiti').subscribe(
            result => {

                elemento.estatus= false;
                this.blockUI.stop();

                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.spsBancoSiti();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace)
            }
        );
    }

    /**
     * SE agrega metodo para dar reingreso a un banco 
     * @param elemento 
     */
    reingresoBancoSiti(elemento: any) {
        this.blockUI.start('Procesando Reingreso...');
        const data = {
            "bancositiId": elemento.bancositiId,
            "clave_siti": elemento.cveSiti,
            "nombre_banco": elemento.nombreBanco,
            "estatus": true

        };


        this.service.registrarBYID(data, 4, 'crudBancoSiti').subscribe(
            result => {
                elemento.estatus= true;
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {

                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, errorReingreso => {
                this.spsBancoSiti();
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
            this.bajaBancoSiti(element);
        } else {
            this.reingresoBancoSiti(element);
        }

    }


}