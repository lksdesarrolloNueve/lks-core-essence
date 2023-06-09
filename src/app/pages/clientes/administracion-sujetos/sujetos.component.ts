import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { AdministracionSujetosComponent } from './modal-sujetos/admin-sujetos.component';

@Component({
    selector: 'sujetos',
    moduleId: module.id,
    templateUrl: 'sujetos.component.html'
})
/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de sujetos
 */
export class SujetosComponent implements OnInit {

    //Declaracion de variables
    listaSujetos = [];
    listaMostrar = [];
    listaIdentificaciones = [];

    // Creamos las columnas de la tabla
    displayedColumns: string[] = ['nombres', 'rfc', 'curp', 'nacionalidad', 'estadoNac', 'ciudadNac',
        'telefono', 'correoElectronico', 'estatus', 'acciones']

    //Declaracion de Controles
    dataSourceSujetos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    /**
     * Constructor de la clase SujetosComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsSujetos();
    }

    /**
     * Metodo que enlista los sujetos
     */
    spsSujetos() {
        this.blockUI.start('Cargando la información...');
        this.service.getListByID(1, 'listaSujetos').subscribe(data => {

            // se declara la lista para mostrar la información en vacia
            this.listaMostrar = []

            //Se crea forEach para agregar la información del JSON de forma lineal
            data.forEach(result => {
                let jsonLineal = {
                    "sujetoId": result.sujeto.sujetoId,
                    "nombres": result.sujeto.nombres + ' ' + result.sujeto.apellidoPaterno + ' ' + result.sujeto.apellidoMaterno,
                    "fechaNacimiento": result.sujeto.fechaNacimiento,
                    "genero": result.sujeto.generoId.descripcion,
                    "nacionalida": result.sujeto.nacionalidaId.nacion,
                    "rfc": result.sujeto.rfc,
                    "curp": result.sujeto.curp,
                    "estadoCivil": result.sujeto.extSujeto.estadoCivilId.descripcion,
                    "estadoNac": result.sujeto.extSujeto.paisNacId.nombreEstado,
                    "ciudadNac": result.sujeto.extSujeto.ciudadNacId.nombre,
                    "telefono": result.agenda.telefono,
                    "correoElectronico": result.agenda.correoElectronico,
                    "estatus": result.estatus,
                }
                this.listaMostrar.push(jsonLineal)
            });

            this.listaSujetos = data;
            this.dataSourceSujetos = new MatTableDataSource(this.listaMostrar);
            this.dataSourceSujetos.paginator = this.paginator;
            this.dataSourceSujetos.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
        });
    }

    /**
     * Metodo para realizar el crud de sujetos
     * @param element 
     */
    crudSujetos(element: any, estatus) {
        let tipoAccion = 0;
        if (estatus) {
            tipoAccion = 4; //REEINGRESO
            this.blockUI.start('Procesando alta...');
        } else {
            tipoAccion = 3; //BAJA
            this.blockUI.start('Procesando baja...');
        }

        // Se declara variable local para guardar la estructura original del JSON
        let datos: any

        //Busca la información de la lista original por la clave
        datos = this.listaSujetos.find((listaSujetos: any) => {
            return listaSujetos.sujeto.sujetoId === element.sujetoId;
        });

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
         * Baja y Reeingreso
        */
        this.service.registrarBYID(datos, tipoAccion, 'crudSujetos').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if (result[0][0] === '0') {
                    // Al interruptor de estatus se le setea el estatus.
                    element.estatus = estatus;
                    // Se muestra el mensaje al front
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    // Hubo un error al momento de realizar la petición
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => { // Cacheo de errores al momento del consumo de la api.
                this.spsSujetos();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )
    }

    /**
     * Metodo que abre un modal para la gestion de sujetos
     * @param elemento 
     * @param accion 
     */
    abrirAdminSujetos(elemento: any, accion: any) {

        // Declaracion de variable
        let titulo = 'REGISTRAR';

        // Si accion es diferente a 1 = Editar
        if (accion !== 1) {
            titulo = 'EDITAR';
        }

        // Se declara variable local para guardar la estructura original del JSON
        let datos: any

        //Busca la información de la lista original por la clave
        datos = this.listaSujetos.find((listaSujetos: any) => {
            return listaSujetos.sujeto.sujetoId === elemento.sujetoId;
        });

        /**
         * Se manda llamar el modal pasandole los datos.
         */
        const dialogRef = this.dialog.open(AdministracionSujetosComponent,
            {
                // Arreglo de datos que recibira el modal
                data: {
                    accion: accion,
                    titulo: titulo,
                    sujeto: datos
                }
            }

        );

        /**
         * Despues de cerrar el modal, 
         * se ejecuta el metodo que enlista los sujetos en la tabla. 
        */
        dialogRef.afterClosed().subscribe(result => {
            this.spsSujetos();
        });
    }

    /**
     * Metodo para filtrar la tabla
     * @param event - evento a filtrar
     */
    applyFilterSujetos(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceSujetos.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceSujetos.paginator) {
            this.dataSourceSujetos.paginator.firstPage();
        }
    }
}