import { Component, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { AdministracionNacionalidadesComponent } from "./modal-nacionalidades/administracion-nacionalidades.component";



@Component({
    selector: 'nacionalidades',
    moduleId: module.id,
    templateUrl: 'nacionalidades.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 08/09/2021
 * @descripcion: Componente para la gestion de nacionalidades
 */
export class NacionalidadesComponent  {
    //Declaracion de variable y componentes

    displayedColumns: string[] = ['consecutivo','nombreNacionalidad', 'pais', 'cveSit', 'tipo', 'codPLD', 'estatus', 'acciones'];
    dataSourceNacionalidades: MatTableDataSource<any>;
    listaNacionalidades: any;
    accion: number;
    titulo: string;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * Constructor del componente nacionalidades
     * @param service -- Instancia de acceso a datos
     * @param dialog -- Componente para crear diálogos modales en Angular Material 
     */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsNacionalidades();
    }

    /**
     * Metodo para obtener la lista de nacionalidades
     */
    spsNacionalidades() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaNacionalidades').subscribe(data => {
            this.blockUI.stop();
            this.listaNacionalidades = data;
            this.dataSourceNacionalidades = new MatTableDataSource(this.listaNacionalidades);
            this.dataSourceNacionalidades.paginator = this.paginator;
            this.dataSourceNacionalidades.sort = this.sort;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
     * Metodo para filtrar nacionalidades
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceNacionalidades.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceNacionalidades.paginator) {
            this.dataSourceNacionalidades.paginator.firstPage();
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
        const dialogRef = this.dialog.open(AdministracionNacionalidadesComponent, {
            data: {
                titulo: this.titulo,
                accion: this.accion,
                nacionalidad: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsNacionalidades();//se refresque la tabla y se vea la nueva nacionalidad
        });
    }
    /**
     * Metodo para dar de baja
     * @param elemento --Lista con los datos de Nacionalidad
     */
    bajaNacionalidad(elemento: any) {
        //areglo que contiene los datos para baja
        const data = {
            "nacionalidadid": elemento.nacionalidadid,
            "nacion": elemento.nacion,
            "pais": elemento.pais,
            "clavesit": elemento.clavesit,
            "tipo": elemento.tipo,
            "codigopld": elemento.codigopld,
            "estatus": false
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudCatNacionalidad').subscribe(resultado => {
            this.blockUI.start('Procesando baja ...');
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();
                elemento.estatus=false;
                this.service.showNotification('top', 'right', 2, resultado[0][1]);
            } else {//error 
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, resultado[0][1]);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }
    /**
     * Metodo para dar de alta Nacionalidad
     * @param element --Lista con los datos de Nacionalidad
     */
    reingresoNacionalidad(elemento: any) {

        const data = {
            "nacionalidadid": elemento.nacionalidadid,
            "nacion": elemento.nacion,
            "pais": elemento.pais,
            "clavesit": elemento.clavesit,
            "tipo": elemento.tipo,
            "codigopld": elemento.codigopld,
            "estatus": true
        };

        this.service.registrarBYID(data, 4, 'crudCatNacionalidad').subscribe(
            result => {
                this.blockUI.start('Procesando reingreso ...');
                //Se condiciona resultado
                if (result[0][0] === '0') {
                    //se cierrra el loader
                    this.blockUI.stop();
                    elemento.estatus=true;
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.blockUI.stop();
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
         * @param element --Lista con los datos de Nacionalidad
         */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaNacionalidad(element);
        } else {
            this.reingresoNacionalidad(element);
        }
    }

}