import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionProveedorComponent } from "./modal-proveedores/administracion-proveedor.component";


@Component({
    selector: 'proveedores',
    moduleId: module.id,
    templateUrl: 'proveedores.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 28/10/2021
 * @descripcion: Componente para la gestion de proveedores
 */
export class ProveedorComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['claveProveedor','rfc','nombreProveedor','tipo_proveedor','num_cuenta','sucursal',
    'estatus', 'acciones'];
    dataSourceProveedor: MatTableDataSource<any>;
    listaProveedor: any;
    accion: number;
    titulo: string;
    selectedId: number;
    
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * 
     * @param service service para el acceso de datos 
     */

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
    }

    //metodo OnInit de la clase
    ngOnInit() {
        this.spsProveedor();
    }

    
     /**
     * Metodo para cargar en tabla de proveedores
     */
      spsProveedor() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1,'listaProveedor').subscribe(data => {
            this.blockUI.stop();
            this.listaProveedor = data;
            this.dataSourceProveedor = new MatTableDataSource(this.listaProveedor);
            this.dataSourceProveedor.paginator = this.paginator;
            this.dataSourceProveedor.sort = this.sort;
            //set a new filterPredicate function
            this.dataSourceProveedor.filterPredicate = (listaProveedor, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, data, key);
                };
                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();
                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();
                return dataStr.indexOf(transformedFilter) !== -1;
            }
            //Fin set predicate

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    //metodo para comprobar filtro anidado
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



    //metodo para filtrar en el listado obtenido de base de datos
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
  
        this.dataSourceProveedor.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceProveedor.paginator) {
            this.dataSourceProveedor.paginator.firstPage();
        
        }

    }

    /**
     * metodo para dar de baja el proveedor
     * @param elemento - Id a dar de baja
     *      
     * */
    bajaregistroProv(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "proveedor": elemento,
            "domicilio": elemento.extencionProveedor.domicilio,
            "contactos": [],
            "accion" : 3
        };

        this.service.registrar(data,'crudProveedor').subscribe(
            result => {
                elemento.estatus = false;
                if (result[0][0] === '0') {
                    this.blockUI.stop();//se cierra el loader
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );

    }

    /**
     * metodo para reingresar el proveedor
     * @param elemento 
     *      
     * */
    altaRegistroProv(elemento: any) {
        //areglo que contiene los datos para reingreso
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "proveedor": elemento,
            "domicilio": elemento.extencionProveedor.domicilio,
            "contactos": [],
            "accion" : 4
        };
        this.service.registrar(data,'crudProveedor').subscribe(
            result => {
                elemento.estatus = true;
                if (result[0][0] === '0') {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
            }
        );
    }

      /**
     * Metodo para abrir ventana modal
     * @param data -- Objecto o valor a condicionar
     */
       abrirdialogo(data) {
        /**si la accion es igual a o el titulo se llamara a registrar o editar  */
        if (data === 0) {
            this.titulo = 'Registrar';
            this.accion = 1;
        } else {
            this.accion = 2;
            this.titulo = 'Editar';

        }
        //se abre el modal
        const dialogRef = this.dialog.open(AdministracionProveedorComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                proveedor: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
                this.spsProveedor();//se refresque la tabla y se vea la nueva ciudad         
            }
        });
    }


    /**
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaregistroProv(element);
        } else {
            this.altaRegistroProv(element);
        }

    }

}

