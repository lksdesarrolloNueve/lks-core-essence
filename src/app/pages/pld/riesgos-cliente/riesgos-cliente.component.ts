import { Component, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { globales } from "../../../../environments/globales.config";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

@Component({
    selector: 'riesgos-cliente',
    moduleId: module.id,
    templateUrl: 'riesgos-cliente.component.html',
    styleUrls: ['riesgos-cliente.component.css']
})
/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 16/05/2022
 * @descripcion: Componente para la gestion de la matriz de riesgos en base al cliente
 */
export class RiesgosClienteComponent {
    displayedColumns: string[] = ['numero', 'elementoRiesgo', 'indicadoresRiesgo', 'definicionTeorica',
        'definicionOperativa', 'criterioRiesgoAlto', 'puntajeRiesgoAlto', 'criterioRiesgoBajo', 'puntajeRiesgoBajo',
        'ponderador', 'ponderacion', 'valoracion'];
    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    dataSourceMatriz = new MatTableDataSource();
    lblCliente: string = globales.ente;
    lblClientes: string = globales.entes;
    numeroCliente = new UntypedFormControl();
    datosCliente: any;
    idCliente: any;
    nombreCliente: string;
    estatusColor: string;
    clasificacion: any;
    ponderacionAcumulada: any;
    porcentajeAcumulado: any;
    listaValoraciones: any;
    listaMatriz: any;

    constructor(
        public dialog: MatDialog,
        private service: GestionGenericaService,
    ) {
    }


    /**
     * Metodo para abrir ventana modal de clientes
     */
    modalClientes() {
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente',
                cliente: ''
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result != 1) {
                if (result.tipoPersona == 'F') {
                    this.datosCliente = result.datosCl;
                    this.idCliente = this.datosCliente.cliente_id;
                    this.nombreCliente = this.datosCliente.nombre_cl + " " + this.datosCliente.paterno_cl + " " + this.datosCliente.materno_cl;
                    this.numeroCliente.setValue(result.datosCl.numero_cliente.trim())

                    this.spsMatriz();
                } else {
                    //Moral
                }
            }
            if (result == 1) {
                this.numeroCliente.setValue('');
            }

        });
    }

    /**
     * Se consulta la matriz de riesgos para vaciar su contenido en una tabla
     */
    spsMatriz() {
        this.blockUI.start('Cargando...');

        this.service.getList('spsMatrizRiesgos').subscribe(data => {
            this.blockUI.stop();

            this.listaMatriz = data;

            this.spsValoracionRiesgos();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo que consulta las valoraciones de riesgos por cliente
     */
    spsValoracionRiesgos() {
        this.ponderacionAcumulada = 0;
        this.porcentajeAcumulado = 0;
        this.blockUI.start('Cargando...');

        this.service.getListByID(this.idCliente, 'spsValoracionRiesgos').subscribe(data => {
            this.blockUI.stop();

            this.listaValoraciones = data;

            this.listaMatriz.forEach((element, i) => {

                // Se agrega la ponderacion a cada elemento de la matriz
                element.ponderacion = this.listaValoraciones[i].valoracion;

                // Se asigna un valor para cambiar de color la casilla de la tabla segun la valoracion
                // Tambien se suma el porcentaje de riesgos segun el caso (riesgo alto o bajo)
                switch (this.listaValoraciones[i].valoracion) {
                    case element.ponderacionAlta:
                        this.porcentajeAcumulado += element.ponderacionAlta;
                        element.cellColor = "cell-red";
                        break;
                    case element.ponderacionBaja:
                        this.porcentajeAcumulado += element.ponderacionBaja;
                        element.cellColor = "cell-green";
                        break;
                    default:
                        this.porcentajeAcumulado += element.ponderacionBaja;
                        element.cellColor = "cell-orange";
                        break;
                }

                // Se obtienen la ponderacion general
                this.ponderacionAcumulada += element.ponderacion;
            });

            // Se asigna la clasificacion y el color correspondiente segun la ponderacion acumulada de riesgos
            if (this.porcentajeAcumulado > 50) {
                this.clasificacion = "RIESGO ALTO";
                this.estatusColor = "red";
            } else {
                this.clasificacion = "RIESGO BAJO";
                this.estatusColor = "green";
            }

            this.dataSourceMatriz.data = this.listaMatriz;
            this.dataSourceMatriz.paginator = this.paginator;
            this.dataSourceMatriz.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

}