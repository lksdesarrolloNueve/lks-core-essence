import { Component, OnInit, ViewChild } from "@angular/core";
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from "@angular/material/sort";
import { MatDialog } from "@angular/material/dialog";
import { AdminCuentaBComponent } from "./modal-cuentas-bancarias/administracion-cuentas-bancarias.component";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { AbstractControl, UntypedFormControl, ValidatorFn, Validators } from "@angular/forms";
import { map, startWith } from "rxjs/operators";


@Component({
    selector: 'cuentas-bancarias',
    moduleId: module.id,
    templateUrl: 'cuentas-bancarias.component.html'
})


/**
 * @autor: Juan Gerardo Rayas Mata
 * @version: 1.0.0
 * @fecha: 27/09/2021
 * @descripcion: Componente para la gestion de cuentas bancarias 
 */
export class CuentaBancariaComponent implements OnInit {

    //Declaracion de variables y componentes
    displayedColumns: string[] = ['clave_cuenta','descripcion_cuenta','cheque_cuenta',
    'monto_minimo','monto_maximo','monto_excedente','nombre_banco_sat','nombre_banco_siti',
    'nombre_cuenta_contable','nombre_sucursal','tipo_cuenta','estatus','acciones'];
    dataSourceCuentaBancaria: MatTableDataSource<any>;
    listaCuentaBancaria: any;
    accion: number;
    titulo: string;
    mostrar:boolean =false;
    selectedId: number;
    selectedIdTC: number;
    
    /**Controles sucursales*/
    listaSucursales: any;
    opcionesSucursal: Observable<string[]>;
    sucursal = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });

    /**Controles tipoCuenta*/
    listaTipoCuenta: any;
    opcionesTCuenta: Observable<string[]>;
    tipocuenta = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });



    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;

    /**
     * 
     * @param service service para el acceso de datos 
     */

    constructor(private service: GestionGenericaService, public dialog: MatDialog) {
        this.spsCuentasBancarias_sf();
    }
    ngOnInit() {
        this.spsSucursales();
        this.spsTipoCuenta();

        
    }

    
/**
 * Metodo para cargar tabla de cuentas bancarias
 */
    spsCuentasBancarias(sucursal: number,tipocuenta: string){
        this.blockUI.start('Cargando...');
        let path = '?sucursalId=' + sucursal + '&' + 'tipoCuenta=' + tipocuenta;
        this.service.getListByID(path,'listaCuentaBancariaSuc').subscribe(
        //this.service.getListByID(path,'listaCuentaBancariaID').subscribe(
            data => {
                this.blockUI.stop();
                this.listaCuentaBancaria = data;
                if(this.listaCuentaBancaria.length > 0){
                this.dataSourceCuentaBancaria = new MatTableDataSource(this.listaCuentaBancaria);
                this.dataSourceCuentaBancaria.paginator = this.paginator;
                this.dataSourceCuentaBancaria.sort = this.sort;
                 //MUESTRA LA TABLA
            this.mostrar = true;
                }
            }, error => {
                this.mostrar = false;
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

    }

    /**
     * Metodo para cargar tabla de cuentas bancarias sin filtro
     */
     spsCuentasBancarias_sf() { 
        this.service.getListByID(1,'listaCuentaBancaria').subscribe(
            dataCuenta => {
                this.blockUI.stop();
                this.listaCuentaBancaria = dataCuenta;
                this.dataSourceCuentaBancaria = new MatTableDataSource(this.listaCuentaBancaria);
                this.dataSourceCuentaBancaria.paginator = this.paginator;
                this.dataSourceCuentaBancaria.sort = this.sort;
            //MUESTRA LA TABLA
            this.mostrar = true;
            }, errorCuentaSF => {
                this.mostrar = false;
                //se detiene el loader
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, errorCuentaSF.Message);
            }
        )

    }

    
    /**
    * Metodo para listar las sucursales
    * 
    */
     spsSucursales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

        /**
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
         private _filter(value: any): any[] {
            let filterValue = value;
            if (!value[0]) {
                filterValue = value;
            } else {
                filterValue = value.toLowerCase();
            }
            this.mostrar = false;
            return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
        }

    //metodo para filtrar en el listado obtenido de base de datos
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceCuentaBancaria.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceCuentaBancaria.paginator) {
            this.dataSourceCuentaBancaria.paginator.firstPage();
        }
    }

    //obtiene el id de la sucursal selecionada
    opcionSeleccionada(event) {
        this.selectedId = event.option.value.sucursalid;
        this.spsCuentasBancarias(this.selectedId,'');

    }
       /**
        * Muestra la descripcion de la sucursal
        * @param option --estado seleccionada
        * @returns --nombre sucursal
        */
        displayFn(option: any): any {
            return option ? option.nombreSucursal : undefined;
        }

    /**
    * Metodo para listar los tipos de cuenta
    * 
    */
     spsTipoCuenta() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('07CB', 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoCuenta = data;
            this.opcionesTCuenta = this.tipocuenta.valueChanges.pipe(
                startWith(''),
                map(value => this._filterTCuenta(value))
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

        /**
    * Filta la categoria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
         private _filterTCuenta(value: any): any[] {
            let filterValue = value;
            if (!value[0]) {
                filterValue = value;
            } else {
                filterValue = value.toLowerCase();
            }
            this.mostrar = false;
            return this.listaTipoCuenta.filter(option => option.descripcion.toLowerCase().includes(filterValue));
        }

    //obtiene el id del tipo cuenta
    opcionSeleccionadaTCuenta(event) {

        let sucursalId = 0;
        let tipoCuenta='';

        if(this.sucursal.value){
            sucursalId = this.sucursal.value.sucursalid;
        }

        if(this.tipocuenta.value){
            tipoCuenta = this.tipocuenta.value.cveGeneral;
        }

        this.spsCuentasBancarias(sucursalId,tipoCuenta);

    }

       /**
        * Muestra la descripcion de los tipos de cuenta
        * @param option --tipo cuenta seleccionada
        * @returns -- descripcion del tipo de cuenta
        */
        displayFnTCuenta(option: any): any {
            return option ? option.descripcion : undefined;
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
        const dialogRef = this.dialog.open(AdminCuentaBComponent, {
            data: {
                accion: this.accion,
                titulo: this.titulo,
                cuentab: data
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result != undefined) {
                this.spsCuentasBancarias_sf();//se refresque la tabla y se vea la nueva ciudad         
            }
        });
    }

    /**
     * metodo para dar de baja cuenta bancaria
     * @param elemento - Id a dar de baja
     *      
     * */
    bajaregistroTCuenta(elemento: any) {
        //areglo que contiene los datos para baja
        this.blockUI.start('Procesando baja...');
        const data = {
            "cuentaBancariaID": elemento.cuentaBancariaID,
            "claveCuenta": elemento.claveCuenta,
            "descripcionCuenta": elemento.descripcionCuenta,
            "chequeCuenta": elemento.chequeCuenta,
            "extencionCuentaBancaria":  elemento.extencionCuentaBancaria,
            "montoMinimo": elemento.montoMinimo,
            "montoMaximo": elemento.montoMaximo,
            "montoExcedente": elemento.montoExcedente,
            "estatus": false
        };

        this.service.registrarBYID(data, 3, 'crudCuentaBancaria').subscribe(
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
     * metodo para dar de alta colonia
     * @param elemento 
     *      
     * */
    altaRegistroTCuenta(elemento: any) {
        //areglo que contiene los datos para reingreso
        this.blockUI.start('Procesando reingreso...');
        const data = {
            "cuentaBancariaID": elemento.cuentaBancariaID,
            "claveCuenta": elemento.claveCuenta,
            "descripcionCuenta": elemento.descripcionCuenta,
            "chequeCuenta": elemento.chequeCuenta,
            "extencionCuentaBancaria":  elemento.extencionCuentaBancaria,
            "montoMinimo": elemento.montoMinimo,
            "montoMaximo": elemento.montoMaximo,
            "montoExcedente": elemento.montoExcedente,
            
            "estatus": true
        };
        this.service.registrarBYID(data, 4, 'crudCuentaBancaria').subscribe(
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
     * Metodo para cambiar estatus si es activo desactivo y si esta desactivado activa.
     */
    cambiaEstatus(element: any) {
        if (element.estatus) {
            this.bajaregistroTCuenta(element);
        } else {
            this.altaRegistroTCuenta(element);
        }
    }

        /**
         * Valida que el texto ingresado pertenezca a un estado
         * @returns mensaje de error.
         */
         autocompleteObjectValidator(): ValidatorFn {
            return (control: AbstractControl): { [key: string]: any } | null => {
                if (typeof control.value === 'string') {
                    return { 'invalidAutocompleteObject': { value: control.value } }
                }
                return null  /* valid option selected */
            }
        }

}

