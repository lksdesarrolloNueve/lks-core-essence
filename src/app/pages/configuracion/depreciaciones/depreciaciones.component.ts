import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { AdministracionDepreciacionesComponent } from './modal-depreciaciones/admin-depreciaciones.component';

@Component({
    selector: 'depreciaciones',
    moduleId: module.id,
    templateUrl: 'depreciaciones.component.html'
})
/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 03/11/2021
 * @descripcion: Componente para la gestion de depreciaciones
 */
export class DepreciacionesComponent implements OnInit {
    
    //Declaracion de variables
    listaDepreciaciones = [];
    listaMostrar = [];

    // Creamos las columnas de la tabla
    displayedColumns: string[] = ['cveDepreciacion', 'descripcion', 'tasaContable', 'tasaFiscal', 'maximoDeducible', 'porcentaje',
    'cuentaActivo', 'cuentaDepreciacion', 'cuentaGastos', 'cuentaBaja', 'estatus', 'acciones']

    //Declaracion de Controles
    dataSourceDepreciaciones: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    /**
     * Constructor de la clase DepreciacionesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog){

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsDepreciaciones();
    }

    /**
     * Metodo que enlista las depreciaciones
     */
    spsDepreciaciones() {
        this.blockUI.start('Cargando la información...');
        this.service.getListByID(1, 'listaDepreciaciones').subscribe(data =>{

            // se declara la lista para mostrar la información en vacia
            this.listaMostrar = []

            //Se crea forEach para agregar la información del JSON de forma lineal
            data.forEach(result => {
                let jsonLineal = {
                    "depreciacionId": result.depreciacionId,
                    "cveDepreciacion": result.cveDepreciacion,
                    "descripcion": result.descripcion,
                    "tasaContable": result.tasaContable,
                    "tasaFiscal": result.tasaFiscal,
                    "maximoDeducible": result.maximoDeducible,
                    "porcentaje": result.porcentaje,
                    "cuentaActivo": result.cuentaActivo.nombre,
                    "cuentaDepreciacion": result.cuentaDepreciacion.nombre,
                    "cuentaGastos": result.extensionDepreciacion.cuentaGastos.nombre,
                    "cuentaBaja": result.extensionDepreciacion.cuentaBaja.nombre,
                    "estatus": result.estatus,
                }
                this.listaMostrar.push(jsonLineal)
            });

                this.listaDepreciaciones = data;
                this.dataSourceDepreciaciones = new MatTableDataSource(this.listaMostrar);
                this.dataSourceDepreciaciones.paginator = this.paginator;
                this.dataSourceDepreciaciones.sort = this.sort;
                this.blockUI.stop();
            }, error =>{
                this.blockUI.stop();
            });
    }

    /**
     * Metodo para filtrar la tabla
     * @param event - evento a filtrar
     */
    applyFilterDepreciaciones(event: Event){
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceDepreciaciones.filter = filterValue.trim().toLowerCase();
        
        if(this.dataSourceDepreciaciones.paginator){
            this.dataSourceDepreciaciones.paginator.firstPage();
        }
    }

    /**
     * Metodo para realizar el crud de depreciaciones
     * @param element 
     */
     crudDepreciaciones(element: any, estatus){
        let tipoAccion = 0;
        if(estatus){
            tipoAccion = 4; //REEINGRESO
            this.blockUI.start('Procesando alta...');
        } else {
            tipoAccion = 3; //BAJA
            this.blockUI.start('Procesando baja...');
        }

        // Se declara variable local para guardar la estructura original del JSON
        let datos: any

        //Busca la información de la lista original por la clave
        datos = this.listaDepreciaciones.find((listaDepreciaciones: any) => {
            return listaDepreciaciones.cveDepreciacion === element.cveDepreciacion;
        });

        /** 
         * Metodo que realiza la gestión a base de datos.
         * Se consume la api para dicha gestión.
         * Baja y Reeingreso
        */
        this.service.registrarBYID(datos, tipoAccion, 'crudDepreciaciones').subscribe(
            result => {
                // Desbloqueamos pantalla
                this.blockUI.stop();
                // Si el resultado que retorna la api = 0, fue correcta la petición
                if(result[0][0] === '0'){
                    // Al interruptor de estatus se le setea el estatus.
                    element.estatus = estatus;
                    // Se muestra el mensaje al front
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    // Hubo un error al momento de realizar la petición
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => { // Cacheo de errores al momento del consumo de la api.
                this.spsDepreciaciones();
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )
    }

    /**
     * Metodo que abre un modal para la gestion de depreciaciones
     * @param elemento 
     * @param accion 
     */
    abrirAdminDepreciacion(elemento : any, accion : any) {
        
        // Declaracion de variable
        let titulo = 'REGISTRAR';

        // Si accion es diferente a 1 = Editar
        if(accion !== 1){
            titulo = 'EDITAR';
        }

        // Se declara variable local para guardar la estructura original del JSON
        let datos: any

        //Busca la información de la lista original por la clave
        datos = this.listaDepreciaciones.find((listaDepreciaciones: any) => {
            return listaDepreciaciones.cveDepreciacion === elemento.cveDepreciacion;
        });

        /**
         * Se manda llamar el modal pasandole los datos.
         */
        const dialogRef = this.dialog.open(AdministracionDepreciacionesComponent, 
            {
                // Arreglo de datos que recibira el modal
                data : {
                    accion: accion,
                    titulo: titulo,
                    depreciacion: datos
                }
            }

        );

        /**
         * Despues de cerrar el modal, 
         * se ejecuta el metodo que enlista las depreciaciones en la tabla. 
        */
        dialogRef.afterClosed().subscribe(result => {
            this.spsDepreciaciones();
        });
    }
}