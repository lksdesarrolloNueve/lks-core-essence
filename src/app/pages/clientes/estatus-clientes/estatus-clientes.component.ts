import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatAccordion } from "@angular/material/expansion";
import { MatStepper } from "@angular/material/stepper";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatSort } from "@angular/material/sort";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { AdministracionEstatusCliComponent } from "./modal-estatus-clientes/admin-estatus-clientes.component";
import { MatPaginator } from "@angular/material/paginator";
import { globales } from '../../../../environments/globales.config';





@Component({
    selector: 'estatus-clientes',
    moduleId: module.id,
    templateUrl: 'estatus-clientes.component.html'

})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 09/12/2021
 * @descripcion: Componente para la gestion de estatus del cliente.
 */

export class EstatusCliComponent implements OnInit {

    @ViewChild(MatAccordion) accordion: MatAccordion;
    @ViewChild('stepper') stepper: MatStepper;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;


    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;


    //Declaración de listas
    listaBitEstatusCli: any[];
    displayedColumns: string[] = ['numero_cliente', 'nombres', 'fecha_hora', 'desc_baja', 'desc_mot_baja', 'sucursal', 'first_name'];
    dataSourceBitEstCliente: MatTableDataSource<any>;
    accion: number;
    titulo: string;

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
   * Metodo OnInit de la clase
   */
    ngOnInit() {
        this.spsBitEstCliente();

    }

    /**
     * Metodo de listar los estatus de los clientes
     */
    spsBitEstCliente() {

        this.blockUI.start('Cargando datos...');
        this.service.getList('listaBitEstatusCli').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaBitEstatusCli = JSON.parse(data);
                this.dataSourceBitEstCliente = new MatTableDataSource(this.listaBitEstatusCli);
                this.dataSourceBitEstCliente.paginator = this.paginator;
                this.dataSourceBitEstCliente.sort = this.sort;
            }
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
     * Metodo para abrir ventana modal
     */
    abrirDialogBusquedaCliente() {

        this.titulo = "Lista clientes";
        this.accion = 1;

        //se abre el modal
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (!this.vacio(result.datosCl) && result.tipoPersona == 'F') {
                if (result.datosCl !== 1) {//Aceptar llenar datos
                    const dialogRefEst = this.dialog.open(AdministracionEstatusCliComponent, {
                        // height: '500px',
                        width: '50%',
                        data: {
                            titulo: 'Solicitud de Baja Cliente',
                            accion: 1,
                            cliente: result.datosCl
                        }
                    });

                    //Se usa para cuando cerramos
                    dialogRefEst.afterClosed().subscribe(respuesta => {
                        this.spsBitEstCliente();
                    });

                }
            }
        });

    }

    /**
    * Metodo para filtrar la tabla
    * @param event - Dato a filtrar
    */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceBitEstCliente.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceBitEstCliente.paginator) {
            this.dataSourceBitEstCliente.paginator.firstPage();
        }
    }

    /**
     * Metodo que valida los datos vacios
     * @param value -valor a validar
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }



}