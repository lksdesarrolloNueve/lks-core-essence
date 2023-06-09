import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { CrudInversionComponent } from "./m-inversion/m-inversion.component";
import { globales } from '../../../.././environments/globales.config';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { verificacionModalComponent } from "../../../pages/modales/verificacion-modal/verificacion-modal.component";

@Component({
    moduleId: module.id,
    selector: 'inversion',
    templateUrl: 'inversion.component.html'
})

export class InversionComponent {

    //Declaracion de variables
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    titulo: string = '';
    accion: number = 0;
    datosCliente: any;
    tipoPersona: any;

    numSocio: any;
    nombreSocio: any;
    sucursal: any;

    listaInversiones = [];

    @BlockUI() blockUI: NgBlockUI;

    displayedColumns: string[] = ['numPagare', 'plazo', 'monto', 'fechaVencimiento', 'instruccion', 'acciones']
    dataSourceInversiones: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    constructor(private service: GestionGenericaService, private dialog: MatDialog) {

    }

    abrirCrudInversion() {

        this.dialog.open(CrudInversionComponent);

    }

    /**
     * Metodo para abrir ventana modal
     * @param ventana -- 0 Cliente 1 Empresa 2 Refencia
     */
    abrirDialog(accion) {

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

            if (result !== undefined) {

                this.datosCliente = result.datosCl;
                this.tipoPersona = result.tipoPersona;

                this.numSocio = result.datosCl.numero_cliente;
                this.sucursal = result.datosCl.nombre_sucursal;

                this.spsInvCliente(result.datosCl.numero_cliente);


                if (result.tipoPersona === 'F') {
                    this.nombreSocio = result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl
                } else {
                    this.nombreSocio = result.datosCl.razon_social
                }

                if (accion === 1) {
                    const modalIn = this.dialog.open(CrudInversionComponent, {
                        data: {
                            datosCliente: this.datosCliente,
                            tipoPersona: this.tipoPersona,
                            origen: 1
                        }
                    });

                    modalIn.afterClosed().subscribe(result => {
                        this.spsInvCliente(this.numSocio);
                    });

                }
            } else {
                //cancelar
                this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente.');
            }
        });

    }

    nuevaInversion() {
        if (this.datosCliente === undefined) {
            this.abrirDialog(1);
        } else {
            const dialog = this.dialog.open(CrudInversionComponent, {
                data: {
                    datosCliente: this.datosCliente,
                    tipoPersona: this.tipoPersona,
                    origen: 1
                }
            });

            dialog.afterClosed().subscribe(result => {
                this.spsInvCliente(this.numSocio);
            });
        }
    }

    /**
     * Metodo que obtiene las inversiones por filtro de cliente
     * @param numCliente - Numero del cliente/socio
     */
    spsInvCliente(numCliente: any) {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(numCliente + '/2', 'spsInvCliente').subscribe(inversiones => {
            this.blockUI.stop();
            this.listaInversiones = inversiones;
            this.dataSourceInversiones = new MatTableDataSource(this.listaInversiones);
            this.dataSourceInversiones.sort = this.sort;
            setTimeout(() => this.dataSourceInversiones.paginator = this.paginator);
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }

    /**
     * Metodo para reembolsar inversiones
     * @param inversion -  Informacion de la inversion
     */
    reembolsar(inversion) {

        console.log(inversion.extencionInv.instruccion);

        const tipoInstruccion = JSON.parse(inversion.extencionInv.instruccion);

        if (tipoInstruccion.cve_instruccion !== '65RT') {
            this.service.showNotification('top', 'right', 3, 'Acción no permitida.');
            return;
        }

            let dialogRef = this.dialog.open(verificacionModalComponent, {
                data: {
                    titulo: "Confirmación.",
                    body: "¿Desea realizar el movimiento?"
                }
            });


            //Cerrar ventana
            dialogRef.afterClosed().subscribe(result => {
                if (result === 0) {//aceptar
                    this.blockUI.start('Procesando petición...');

                    this.service.registrarBYParametro(inversion.inversionID, 'reembolsoInversion').subscribe(response => {
                        this.blockUI.stop();
                        if (response[0] === '0') {
                            this.service.showNotification('top', 'right', 2, response[1]);
                        } else {
                            this.service.showNotification('top', 'right', 3, response[1]);
                        }
                        this.spsInvCliente(this.numSocio);
                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message);
                    });


                }

            });
        
    }

}