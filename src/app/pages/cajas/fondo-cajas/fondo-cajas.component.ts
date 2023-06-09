import { DatePipe } from "@angular/common";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { PermisosService } from "../../../shared/service/permisos.service";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatTableDataSource } from "@angular/material/table";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";


@Component({
    selector: 'fondo-cajas',
    moduleId: module.id,
    templateUrl: 'fondo-cajas.component.html',
    styleUrls: ['fondo-cajas.component.css']
})

/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 1.0.0
 * @fecha: 11/10/2022
 * @descripcion: Componente para la gestión de fonde a cajas.
 */
export class FondoCajasComponent implements OnInit {

    //Formulario. 
    formFondoCaja: UntypedFormGroup;

    vFecha = new Date();
    vCurrentDate = this.datePipe.transform(this.vFecha, 'dd/MM/yyyy');
    vSucursal = this.servicePermisos.sucursalSeleccionada.nombreSucursal;
    vSaldoBov = 0;
    vSaldoCaja = 0;

    //Listas iniciales
    vListaTipoMovimiento: any = [];
    vListaBovedas: any = [];
    vListaCajas: any = [];

    //Declaracion de Variables y Componentes
    displayedColumns: string[] = ['concepto', 'hora', 'descTM', 'operacion', 'monto', 'destino'];
    dataSourceMvDot: MatTableDataSource<any>;
    listaMvDot: any = [];
    mostrar: boolean;
    isLoadingResults = false;
    isResultado = false;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    //Wait
    @BlockUI() blockUI: NgBlockUI;


    constructor(private service: GestionGenericaService,
        private datePipe: DatePipe,
        private servicePermisos: PermisosService,
        private formBuilder: UntypedFormBuilder

    ) {

        //validacion de campos requeridos
        this.formFondoCaja = this.formBuilder.group({
            operacion: new UntypedFormControl('', { validators: [Validators.required] }),
            boveda: new UntypedFormControl('', { validators: [Validators.required] }),
            caja: new UntypedFormControl('', { validators: [Validators.required] }),
            monto: new UntypedFormControl('', { validators: [Validators.required] }),
            concepto: new UntypedFormControl('', { validators: [Validators.required, Validators.maxLength(256)] })
        });


    }

    ngOnInit() {
        this.spsTiposMovimientos();
        this.spsBovedasSucursal(this.servicePermisos.sucursalSeleccionada.cveSucursal);
    }


    /**
     * Metodo que lista bovedas
     */
    spsBovedasSucursal(cveSucursal: any) {
        this.blockUI.start('Cargando datos...');

        let path = cveSucursal + '/' + 2;

        this.service.getListByID(path, 'listaBovedaSuc').subscribe(dataBoveda => {
            this.blockUI.stop();

            this.vListaBovedas = dataBoveda;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);

        });
    }


    /**
     * Lista los tipos movimientos bancarios
     */
    spsTiposMovimientos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(4, 'spsTiposMovimientosTsr').subscribe(data => {
            this.blockUI.stop();
            this.vListaTipoMovimiento = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Opción seleccionada boveda.
     * @param evento 
     */
    opcionSeleccionadaBoveda(evento: any) {
        this.listaDetMovDotacion(evento.clave);
        this.vListaCajas = JSON.parse(evento.cajas);
        this.spsSaldoBoveda(evento.catCuentaBancaria.claveCuenta);
    }


    /**
     * Obtiene saldo de la cuenta bancaria destiono
     */
    spsSaldoBoveda(cveCuenta: any) {
        this.blockUI.start('Cargando datos...');
        this.vSaldoBov = 0;
        this.vSaldoCaja = 0;

        //Consulta el saldo en efectivo de la boveda
        this.service.getListByID(1 + '/' + cveCuenta, 'spsSaldoCuentaTsr').subscribe(data => {

            this.blockUI.stop();

            this.vSaldoBov = data[0].saldo;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
      * Opción seleccionada caja.
      * @param evento 
      */
    opcionSeleccionadaCaja(evento: any) {
        this.spsSaldoCaja(evento.clave_cuenta);
    }


    /**
     * Obtiene saldo de la cuenta bancaria destiono
     */
    spsSaldoCaja(cveCuenta: any) {
        this.blockUI.start('Cargando datos...');
        this.vSaldoCaja = 0;

        //Consulta el saldo en efectivo de la boveda
        this.service.getListByID(1 + '/' + cveCuenta, 'spsSaldoCuentaTsr').subscribe(data => {

            this.blockUI.stop();

            this.vSaldoCaja = data[0].saldo;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Obtiene los movimientos de la boveda dotación
     * @param cveBoveda 
     */
    listaDetMovDotacion(cveBoveda: any) {
        this.isLoadingResults = true;
        this.isResultado = false;
        this.listaMvDot = [];
        this.dataSourceMvDot = new MatTableDataSource(this.listaMvDot);

        let json = {
            'datos': [cveBoveda],
            'accion': 1
        }

        this.blockUI.start('Cargando datos...');

        this.service.getListByObjet(json, 'spsDotacionesCaja').subscribe(data => {
            this.blockUI.stop();

            if (data === null) {
                this.isResultado = true;
                this.isLoadingResults = false;
                return;
            } else if (data.length === 0) {
                this.isResultado = true;
            }

            this.listaMvDot = data;
            this.dataSourceMvDot = new MatTableDataSource(this.listaMvDot);


            //set a new filterPredicate function
            this.dataSourceMvDot.filterPredicate = (data, filter: string) => {
                const accumulator = (currentTerm, key) => {
                    return this.comprobacionFiltroAnidado(currentTerm, data, key);
                };

                const dataStr = Object.keys(data).reduce(accumulator, '').toLowerCase();

                // Transform the filter by converting it to lowercase and removing whitespace.
                const transformedFilter = filter.trim().toLowerCase();

                return dataStr.indexOf(transformedFilter) !== -1;
            }

            this.dataSourceMvDot.paginator = this.paginator;
            this.dataSourceMvDot.sort = this.sort;

            this.isLoadingResults = false;

        }, error => {

            this.isLoadingResults = false;
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Guardar movimiento
     */
    guardarEditarDialog() {

        if (this.formFondoCaja.invalid) {
            this.validateAllFormFields(this.formFondoCaja);
            return;
        }

        this.blockUI.start('Procesando movimiento...');

        /*
            1.cve_t_mov  (Clave tipo movimiento)
            2.cve_boveda (Clave boveda)
            3.cve_caja   (Clave caja)
            4.monto      (Monto de la transacción).
            5.descripcion (Descripción de la operación).
            6.cve_sucursal (Clave sucursal)
            7.usuario_id (Usuario)
        */

        let jsonDotacionC = {
            datos: [

                this.formFondoCaja.get('operacion').value.claveTipoMov,
                this.formFondoCaja.get('boveda').value.clave,
                this.formFondoCaja.get('caja').value.cve_caja,
                this.formFondoCaja.get('monto').value,
                this.formFondoCaja.get('concepto').value,
                this.servicePermisos.sucursalSeleccionada.cveSucursal,
                this.servicePermisos.usuario.id

            ],
            accion: 1
        };

        this.service.registrar(jsonDotacionC, 'crudDotacionesCaja').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {

                    this.service.showNotification('top', 'right', 2, result[0][1])
                    this.limpiarFormGeneral();

                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );

    }

    /**
     * Metodo para filtrar movimientos
     * @param event --evento a filtrar
     */
     applyFilter(event: Event) {

        const filterValue = (event.target as HTMLInputElement).value;

        this.dataSourceMvDot.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceMvDot.paginator) {
            this.dataSourceMvDot.paginator.firstPage();

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

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {
        Object.keys(formGroup.controls).forEach(field => {
            const control = formGroup.get(field);
            if (control instanceof UntypedFormControl) {
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }

    /**
     * Limpiar form general.
     */
    limpiarFormGeneral() {
        this.formFondoCaja.reset();
        this.vSaldoBov = 0;
        this.vSaldoCaja = 0;
        this.vListaCajas = [];
        this.listaMvDot = [];
        this.dataSourceMvDot = new MatTableDataSource(this.listaMvDot);

    }

    //Arreglo de mensajes a mostrar al validar formulario
    validacion_msj = {
        'operacion': [
            { type: 'required', message: 'Campo requerido.' },
        ],

        'boveda': [
            { type: 'required', message: 'Campo requerido.' },
        ],

        'caja': [
            { type: 'required', message: 'Campo requerido.' },
        ],

        'monto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números o decimales.' }
        ],

        'concepto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLength', message: 'Máximo 256 carácteres.' }
        ]


    }

}