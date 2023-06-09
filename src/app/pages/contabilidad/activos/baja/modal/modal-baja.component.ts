import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";
import { ModalIncpComponent } from "../../depreciable/modal/modal-incp.component";

@Component({
    selector: 'modal-baja',
    moduleId: module.id,
    templateUrl: 'modal-baja.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 15/12/2022
 * @descripcion: Componente para la gestion de Activo bajo
 */
export class ModalActivoBajaComponent implements OnInit {

    //Declaracion de variables y componentes
    encabezado: string = '';
    formBaja: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;
    listaParam: any = [];
    //tipo de activos
    listaTipoAct: any = [];
    opcionesTipoAct: Observable<string[]>;
    // Activos filtrados
    listaActivos: any = [];
    opcionesAct: Observable<string[]>;
    //lista de tipo de bajas
    listaBaja: any = [];
    opcionesBaja: Observable<string[]>;
    listaINPC: any = [];
    opcionesIncp: Observable<string[]>;

    sucursalId: number = 0;
    usuarioId: number = 0;
    bajaID: number = 0;
    venta: number = 0;

    /**
  * Constructor de la clase ModalDepreciableComponent
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, private modal: MatDialogRef<ModalActivoBajaComponent>, private permisosService: PermisosService, public dialog: MatDialog) {
        this.encabezado = data.titulo;
        this.formBaja = this.formbuilder.group({
            usuario: new UntypedFormControl(''),
            sucursal: new UntypedFormControl(''),
            tpActivo: new UntypedFormControl('', Validators.required),
            activo: new UntypedFormControl('', Validators.required),
            concepto: new UntypedFormControl(''),
            actSuc: new UntypedFormControl(''),
            factura: new UntypedFormControl(''),
            consecutivo: new UntypedFormControl(''),
            unidad: new UntypedFormControl(''),
            moi: new UntypedFormControl(''),
            fDepreciar: new UntypedFormControl(''),
            dAcumulada: new UntypedFormControl(''),
            saldoDepreciar: new UntypedFormControl(''),
            inpcIni: new UntypedFormControl(''),
            descripcionR: new UntypedFormControl(''),
            baja: new UntypedFormControl('', Validators.required),
            venta: new UntypedFormControl(''),
            vendido: new UntypedFormControl(''),
            iva: new UntypedFormControl(''),
            porcentaje: new UntypedFormControl(false),
            fventa: new UntypedFormControl('', Validators.required),
            inpcFin: new UntypedFormControl(''),
            descripcionBaja: new UntypedFormControl('', Validators.required),

        });
        this.sucursalId = this.permisosService.sucursalSeleccionada.sucursalid;
        this.formBaja.get('sucursal').setValue(this.permisosService.sucursalSeleccionada.cveSucursal);
        if (this.data.accion == 2) {
            this.usuarioId = data.datos.usuario_id;
            this.bajaID = data.datos.activo_baja_id;
            this.editarDatos();

        } else {
            this.usuarioId = this.permisosService.usuario.id;
            this.formBaja.get('usuario').setValue(this.permisosService.usuario.firstName + ' ' + this.permisosService.usuario.lastName);
        }

    }
    ngOnInit() {
        this.spsTipoActivos();
        this.spsTipoBaja();
        this.spslistaInpc();
        this.spsParamActivos();
    }
    /**
           * Método que en lista todos los tipos de activos
           * accion 1 muestra todos los activos
           */
    spsTipoActivos() {

        this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoAct = JSON.parse(data);
                // Se setean TIPO ACTIVOS para el autocomplete
                this.opcionesTipoAct = this.formBaja.get('tpActivo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterTA(value)));
                if (this.data.accion == 2) {
                    let activo;
                    activo = this.listaTipoAct.find(ta => ta.tipo_activo_id == this.data.datos.tipoactivo_id);
                    this.formBaja.get('tpActivo').setValue(activo);
                    this.spsActivos();
                }
            }

        });
    }
    /**
        * Filtra el tipo de credito
        * @param value --texto de entrada
        * @returns la opcion u opciones que coincidan con la busqueda
        */
    private _filterTA(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaTipoAct.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
    }
    displayTA(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }

    /**
     * Activo Seleccionado
     * @param tActi TipoActivo seleccionado
     */
    tActivoSeleccionado(tActi) {
        this.spsActivos();
    }
    /**
    * Método que en lista todos activos no depreciables y depreciables
    * tipoActivo seleccionado
    * accion 1 muestra todos los activos que no estan dados de baja o cancelados
    */
    spsActivos() {
        let path = this.sucursalId + '/' + this.formBaja.get('tpActivo').value.tipo_activo_id + '/1';
        this.listaActivos = [];
        this.service.getListByID(path, 'spsActivoDepreciable').subscribe(data => {

            if (!this.vacio(data)) {
                this.listaActivos = JSON.parse(data);
                // Se setean TIPO ACTIVOS para el autocomplete
                this.opcionesAct = this.formBaja.get('activo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterActivo(value)));
                if (this.data.accion == 2) {
                    let activo;
                    activo = this.listaActivos.find(ta => ta.activo_id == this.data.datos.activo_id);
                    this.formBaja.get('activo').setValue(activo);
                }
            } else {
                this.service.showNotification('top', 'right', 2, 'No se encontraron activos.');
            }
        });
    }
    /**
     * Filtra el tipo de credito
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterActivo(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaActivos.filter(option => option.nombre.toLowerCase().trim().includes(filterValue) || option.clave.toLowerCase().trim().includes(filterValue));
    }
    displayActivo(option: any): any {
        return option ? option.concepto.trim() : undefined;

    }
    /**
     * Activo seleccionado
     * @param activo 
     */
    activoSeleccionado(activo) {
        let clave = activo.option.value.clave.split("-", 6);
        this.formBaja.get('actSuc').setValue(clave[0] + '-' + clave[1]);
        this.formBaja.get('factura').setValue(clave[2]);
        this.formBaja.get('consecutivo').setValue(clave[3] + '-' + clave[4]);
        this.formBaja.get('unidad').setValue(clave[5]);
        this.formBaja.get('concepto').setValue(activo.option.value.concepto);
        this.formBaja.get('moi').setValue(activo.option.value.moi);
        this.formBaja.get('fDepreciar').setValue(activo.option.value.fecha_depreciar);
        this.formBaja.get('dAcumulada').setValue(activo.option.value.dacumulada);
        this.formBaja.get('saldoDepreciar').setValue(activo.option.value.saldo_depreciar);
        this.formBaja.get('inpcIni').setValue(activo.option.value.inpc);
        this.formBaja.get('descripcionR').setValue(activo.option.value.descripcion);

    }

    /**
        * Método que en lista todos activos no depreciables y depreciables
        * tipoActivo seleccionado
        * accion 1 muestra todos los activos que no estan dados de baja o cancelados
        */
    spsTipoBaja() {
        this.service.getListByID(1, 'spsTipoBajaActivo').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaBaja = JSON.parse(data);
                // Se setean TIPO ACTIVOS para el autocomplete
                this.opcionesBaja = this.formBaja.get('baja').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterBaja(value)));
                if (this.data.accion == 2) {
                    let baja;
                    baja = this.listaBaja.find(ta => ta.tipo_baja_id == this.data.datos.tipo_baja_id);
                    this.formBaja.get('baja').setValue(baja);
                }
            }
        });
    }
    /**
     * Filtra el tipo de credito
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterBaja(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaBaja.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
    }
    displayBaja(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }

    /**
  * Metodo para listar parametros spsParametros
  */
    spsParamActivos() {
        this.service.getListByID(1, 'spsParametros').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaParam = JSON.parse(data);
            }
        });
    }
    /**
     * Calcula el costo venta e iva 
     */

    calculariVA() {
        let venta = this.formBaja.get('venta').value;
        if (this.formBaja.get('porcentaje').value) {
            let iva = this.listaParam.find(p => p.nombre.trim() === 'IVA');
            let total = this.formBaja.get('venta').value / iva.valor;
            this.formBaja.get('venta').setValue(total.toFixed(2));
            let sinIva = venta - total;
            this.formBaja.get('iva').setValue(sinIva.toFixed(2));
            this.venta = sinIva + total;
        } else {
            this.formBaja.get('venta').setValue(this.venta);
            this.formBaja.get('iva').setValue('');
        }
    }
    /**
 * Metodo para abrir ventana modal agregar Indice Nacional de precios
 *
 */
    agregarINCP() {
        let titulo = "Agregar Indice Nacional de Precios al Consumidor";

        //se abre el modal
        const dialogRef = this.dialog.open(ModalIncpComponent, {
            disableClose: true,
            data: {
                titulo: titulo
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            //cargar lista  para autocomplete
            this.spslistaInpc();
        });
    }
    /**
     * Carga el Valor de INPC acorde a la fecha venta
     * @param fecha venta
     */
    verINPC(fecha) {
        let incpFecha = fecha.getFullYear() + '-' + (fecha.getMonth() + 1) + '-01';
        let incpValor = this.listaINPC.find(i => i.fecha === incpFecha);
        if (this.vacio(incpValor)) {
            this.service.showNotification('top', 'right', 2, 'No se encontro INPC registrado para la fecha 01-' + (fecha.getMonth() + 1) + '-' + fecha.getFullYear());
        } else {
            this.formBaja.get('inpcFin').setValue(incpValor);
        }
    }
    /**
            * Metodo que lista los registros de inpc
            */

    spslistaInpc() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaINPC').subscribe(
            (data: any) => {
                this.listaINPC = data;
                this.opcionesIncp = this.formBaja.get('inpcFin').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterIncp(value)));

                if (this.data.accion == 2) {
                    let inpc;
                    inpc = this.listaINPC.find(i => i.inpcid == this.data.datos.inpc_id);
                    this.formBaja.get('inpcFin').setValue(inpc);
                }
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }
    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterIncp(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaINPC.filter(option => option.cvinpc.includes(filterValue));
    }
    displayIncp(option: any): any {
        return option ? option.inpcD : undefined;

    }
    /**
     * Metodo crud BAJA Activo 
     */
    crudBajActivo(accion) {
        this.blockUI.start('Cargando datos...');
        if (this.formBaja.invalid) {
            this.validateAllFormFields(this.formBaja);
            return this.blockUI.stop();
        }

        let jsonData = {
            "datos": [this.bajaID,
            this.formBaja.get('baja').value.tipo_baja_id,
            this.formBaja.get('activo').value.activo_id,
            moment(this.formBaja.get('fventa').value).format("YYYY-MM-DD"),
            this.formBaja.get('venta').value,
            this.formBaja.get('iva').value,
            this.formBaja.get('vendido').value,
            this.formBaja.get('inpcFin').value.inpcid,
            this.usuarioId,
            this.formBaja.get('descripcionBaja').value
            ], "accion": accion
        };
        this.service.registrar(jsonData, 'crudActivoBaja').subscribe(result => {
            if (result[0][0] === '0') {
                let actF = this.listaParam.find(pa => pa.nombre == 'REGISTRO ACTIVO FIJO');
                if (this.formBaja.get('moi').value > actF) {
                    //genera poliza
                    this.polizaAcvtivo();
                }
                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
            }
            //CERRAR modal 
            this.modal.close();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        });

    }
    /**
     * Metodo para mostrar los datos a editar
     */
    editarDatos() {
        this.formBaja.get('usuario').setValue(this.data.datos.usuario);
        //Clave
        let clave = this.data.datos.clave.split("-", 6);
        this.formBaja.get('actSuc').setValue(clave[0] + '-' + clave[1]);
        this.formBaja.get('factura').setValue(clave[2]);
        this.formBaja.get('consecutivo').setValue(clave[3] + '-' + clave[4]);
        this.formBaja.get('unidad').setValue(clave[5] === '' ? '00' : clave[5]);

        this.formBaja.get('concepto').setValue(this.data.datos.concepto);
        this.formBaja.get('descripcionR').setValue(this.data.datos.descripcion);
        this.formBaja.get('moi').setValue(this.data.datos.moi);
        this.formBaja.get('fDepreciar').setValue(this.data.datos.fecha_depreciar + 'T00:00:00');
        this.formBaja.get('dAcumulada').setValue(this.data.datos.dacumulada);
        this.formBaja.get('saldoDepreciar').setValue(this.data.datos.saldo_depreciar);
        this.formBaja.get('inpcIni').setValue(this.data.datos.inpcini);
        this.formBaja.get('descripcionBaja').setValue(this.data.datos.descbaja);
        this.formBaja.get('venta').setValue(this.data.datos.importe_venta);
        this.formBaja.get('iva').setValue(this.data.datos.iva);
        this.formBaja.get('vendido').setValue(this.data.datos.vendidoa);
        this.formBaja.get('fventa').setValue(this.data.datos.fecha_baja + 'T00:00:00');
        this.formBaja.get('porcentaje').setValue(this.data.datos.iva > 0 ? true : false);
    }
/**
 * Metodo que genera la poliza del activo que sobrepasa el parametro
 */
    polizaAcvtivo() {
        let jsonData = {
            "datos": [
                this.formBaja.get('activo').value.activo_id,
                this.permisosService.sucursalSeleccionada.cveSucursal,
                this.usuarioId
            ],
            "accion": 1
        }
        this.service.registrar(jsonData, 'crudPolActivo').subscribe(result => {
            if (result[0][0] === '0') {

                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
            }
            //CERRAR modal 
            this.modal.close();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        });
    }

    /**
     * Validaciones del formulario
     */
    validaciones = {
        'tpActivo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'activo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'baja': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'descripcionBaja': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'fventa': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    }
    /**
       * Valida Cada atributo del formulario
       * @param formGroup - Recibe cualquier tipo de FormGroup
       */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);             //3
            if (control instanceof UntypedFormControl) {             //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //5
                this.validateAllFormFields(control);            //6
            }
        });
    }
    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}