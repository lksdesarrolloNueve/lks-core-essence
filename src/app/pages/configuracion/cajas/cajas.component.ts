import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdministracionCajasComponent } from "./modal-cajas/administracion-cajas.component";
import { FormControl } from "@angular/forms";



@Component({
    selector: 'cajas',
    moduleId: module.id,
    templateUrl: 'cajas.component.html'
})

/**
 * @autor: Guillermo Juárez Jaramillo
 * @version: 1.0.0
 * @fecha: 04/10/2021
 * @descripcion: Componente para la gestion de cajas
 */

export class CajasComponent implements OnInit {

    //Declaracion de Variables y Componentes
    displayedColumns: string[] = ['cveCaja','desCaja','cveCuentaBan','desCuentaBan','cveCuentaSuc','nombreSucursal','estatusCuentaBan','estatus','acciones'];
    dataSourceCajas: MatTableDataSource<any>;
    dataSourceSucursales:MatTableDataSource<any>;
    listaCajas: any;
    accion: number;
    titulo: string;
    disabled = true;




    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;


    /**
 * Constructor del componente cajas
 * @param service -- Instancia de acceso a datos
 * @param dialog -- Componente para crear diálogos modales en Angular Material 
 */
    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        
    }

    /**
     * Metodo ngOnInit de la clase
     */
    ngOnInit() {
        this.spsCajas();

    }

   /**
     * Metodo para listar cajas 
     * Se lista 1.- muestra todos, 2.- muestra activos , 3.- muestra inactivos
     */
    spsCajas() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaCajas').subscribe(data => {
            this.blockUI.stop();
            this.listaCajas = data;

            this.dataSourceCajas = new MatTableDataSource(this.listaCajas);
            this.dataSourceCajas.paginator = this.paginator;
            this.dataSourceCajas.sort = this.sort;
            //set a new filterPredicate function
            this.dataSourceCajas.filterPredicate = (data, filter: string) => {
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
            this.service.showNotification('top', 'right', 4, error);
        });
    }

     /**
     * Metodo para filtrar cajas
     * @param event --evento a filtrar
     */
      applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
  
        this.dataSourceCajas.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCajas.paginator) {
            this.dataSourceCajas.paginator.firstPage();
        
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
        //Se abre el modal
        const dialogRef = this.dialog.open(AdministracionCajasComponent,{
            data: {
                titulo: this.titulo,
                accion: this.accion,
                caja: data
            }
        });

        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.spsCajas();//se refresque la tabla y se vea la nueva caja
        });
        }
    


    /**
   * Metodo para dar de baja
   * @param elemento --Lista con los datos de cajas
   */

    bajaCaja(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja ...');
        const data = {
            "cajaid": elemento.cajaid,
            "cvecaja": elemento.cvecaja,
            "descripcion": elemento.descripcion,
            "estatus": false,
            "sucursal": elemento.sucursal,
            "cuentabancaria": elemento.cuentabancaria,
            "saldoCierre": 0,
            "cuentaSobranteID":0,
            "cuentaFaltanteID":0
        };
        //se manda llamar el metodo para dar de baja
        this.service.registrarBYID(data, 3, 'crudCaja').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();
                elemento.estatus = false;
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
  * Metodo para dar de alta una Caja
  * @param element --Lista con los datos de Caja
  */
    reingresoCaja(elemento: any) {

        this.blockUI.start('Procesando reingreso ...');
        //areglo que contiene los datos para reingresar
        const data = {
            "cajaid": elemento.cajaid,
            "cvecaja": elemento.cvecaja,
            "descripcion": elemento.descripcion,
            "estatus": true,
            "sucursal": elemento.sucursal,
            "cuentabancaria": elemento.cuentabancaria,
            "saldoCierre": 0,
            "cuentaSobranteID":0,
            "cuentaFaltanteID":0
        };
        //se manda llamar el metodo para hacer el reingreso
        this.service.registrarBYID(data, 4, 'crudCaja').subscribe(resultado => {
            if (resultado[0][0] === '0') {//exito
                this.blockUI.stop();
                elemento.estatus = true;
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
         * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
         * @param element --Lista con los datos de cajas
         */
      cambiaEstatus(element: any) {
        this.blockUI.start('Cambiando Estatus ...');
        if (element.estatus) {
            this.blockUI.stop();
            this.bajaCaja(element);
        } else {
            this.blockUI.stop();
            this.reingresoCaja(element);
        }
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



