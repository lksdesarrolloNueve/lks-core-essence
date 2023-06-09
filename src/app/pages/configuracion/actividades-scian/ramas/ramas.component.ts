import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionRamasComponent } from "./modal-ramas/administracion-ramas.component";
import { verificacionModalComponent } from '../../../../pages/modales/verificacion-modal/verificacion-modal.component';

@Component({
    selector: 'ramas-',
    moduleId: module.id,
    templateUrl: 'ramas.component.html',

})

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la gestion de Ramas SCIAN
 */
export class RamasComponent implements OnInit {
    displayedColumns: string[] = ['codigoRama', 'descripcion', 'subSector', 'estatus', 'acciones'];
    dataSourceRamas: MatTableDataSource<any>;
    listaRamas: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    /**
     * Constructor del componente Ramas SCIAN Component
     * @param service - Service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {

    }

    /**
     * Metodo onInit de la clase
     */
    ngOnInit() {
        this.spsRamas();
    }

    /**
     * Metodo para obtener la lista de Ramas
     * 
     */
    spsRamas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaRamas').subscribe(data => {
            this.blockUI.stop();
            this.listaRamas = data;
            this.dataSourceRamas = new MatTableDataSource(this.listaRamas);
            this.dataSourceRamas.paginator = this.paginator;
            this.dataSourceRamas.sort = this.sort;


            //set a new filterPredicate function
            this.dataSourceRamas.filterPredicate = (dataRama, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, data, key);
                };
                const dataStr = Object.keys(dataRama).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para filtrar Ramas
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceRamas.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceRamas.paginator) {
            this.dataSourceRamas.paginator.firstPage();
        }
    }
    /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
    openDialog(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {
            this.titulo = "Registrar";
            this.accion = 1;
        } else {
            this.titulo = "Editar"
            this.accion = 2;
        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionRamasComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                rama: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result.subSectorId != undefined) {
                this.spsRamas();//se refresque la tabla      
            }
        });

    }

    /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos Sector
     */
    bajaRama(elemento: any) {
        this.blockUI.start('Procesando baja...');
        //areglo que contiene los datos para dar de alta
        const data = {
            "ramaId": elemento.ramaId,
            "codigoRama": elemento.codigoRama,
            "descripcion": elemento.descripcion,
            "subSector": elemento.subSector,
            "estatus": false
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudRamas').subscribe(resultado => {
            elemento.estatus = false;
            this.blockUI.stop();


            if (resultado[0][0] === '0') {//exito
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error 
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }


    /**
     * Metodo para dar de alta rama
     * @param element --Lista con los datos de Ramas
     */
    reingresoRama(elemento: any) {
        this.blockUI.start('Procesando reingreso...');
        //areglo que contiene los datos para dar de alta
        const data = {
            "ramaId": elemento.ramaId,
            "codigoRama": elemento.codigoRama,
            "descripcion": elemento.descripcion,
            "subSector": elemento.subSector,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudRamas').subscribe(
            result => {

                //se cierrra el loader
                this.blockUI.stop();
                elemento.estatus = true;

                //Se condiciona resultado
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }

    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     * @param element --Lista con los datos de la rama
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.abrirAdvertencia(element, 0);//desactivar
        } else {
            this.abrirAdvertencia(element, 1);//activar
        }
    }

    /**
     * Abrir ventana modal de confirmacion
     * @param element datos de la rama
     * @param accion 1:Activar, 0: Desactivar
     * */
    abrirAdvertencia(elemento: any, accion: number) {
        var encabezado = "";
        var body = "";
        if (accion === 1) {
            encabezado = "Activar rama";
            body = 'La rama ' + elemento.descripcion + ' contiene registros relacionados que se activaran.';
        } else {
            encabezado = "Desactivar rama";
            body = 'La rama ' + elemento.descripcion + ' contiene registros relacionados que se desactivaran.'
        }
        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0 && accion === 1) {//aceptar y va a Activar
                this.reingresoRama(elemento);
            } else if (result === 0 && accion === 0) {//aceptar y va a desactivar                
                this.bajaRama(elemento);
            }
            else {//se refresca
                this.spsRamas();//se refresque la tabla. 
            }
        });

    }

    //also add this nestedFilterCheck class function
    comprobacionFiltroAnidado(search, data, key) {
        if (typeof data[key] === 'object') {
            for (const k in data[key]) {
                if (data[key][k] !== null) {
                    search = this.comprobacionFiltroAnidado(search, data[key], k);
                }
            }
        } else {
            search += data[key];
        }
        return search;
    }

}