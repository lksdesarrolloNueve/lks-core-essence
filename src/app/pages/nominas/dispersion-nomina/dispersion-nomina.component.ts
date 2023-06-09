import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { Observable } from "rxjs";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { UntypedFormControl, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import * as XLSX from 'xlsx';
import Swal from 'sweetalert2';
import { PermisosService } from "../../../shared/service/permisos.service";
import * as moment from "moment";

@Component({
    selector: 'dispersion-nomina',
    moduleId: module.id,
    templateUrl: 'dispersion-nomina.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 31/10/2022
 * @descripcion: Componente para la administracion de dispersion de nomina
 */
export class DispersionNominaComponent implements OnInit {
    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;
    listaEmpresa: any = [];
    opcionesEmpresa: Observable<string[]>;
    empresa = new UntypedFormControl('', Validators.required);

    listaPlantilla: any = [];
    listaNomina: any = [];
    plantilla = new UntypedFormControl('', Validators.required);
    listaDipsersion:any=[];

    datos: any = [];
    displayedColumns: string[] = ['noCuenta', 'clave', 'nombre', 'curp_rfc', 'concepto', 'sueldo']
    dataSourceNomina: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    numCliente: string = '';
    listaExcel: any = [];
    correcto: boolean = false;

    listaErrores: any = [];
    displayedColumnsErr: string[] = ['fila', 'dato', 'error'];
    dataSourceError: MatTableDataSource<any>;
    now = new Date();

    listaClaveBanco: any = [];
    listaParticipante: any = [];
    listaReceptor: any = [];
    listaTipoPago: any = [];
    listaSaldo: any = [];
    listaCuentaEmisor: any = [];
    claveParticipanteEmisor: string = '';


    /**
    * Constructor de la clase DispersionNominaComponent
    * @param service -Service para el acceso a datos 
    */
    constructor(private service: GestionGenericaService, private permisos: PermisosService) {

    }
    ngOnInit() {
        this.isActivoMEAPI();
        this.spsEmpresasNomina();
        this.spsCatalogsMEAPI();
        this.cambioHora();
        //isActivoMEAPI para ver si esta activo
    }
    /**
     * Lisa las empresas con servicio de nomina
     */
    spsEmpresasNomina() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('', 'spsEmpresasNomina').subscribe(empresa => {
            if (!this.vacio(empresa)) {
                this.listaEmpresa = JSON.parse(empresa);
                // Se setean los creditos para el autocomplete
                this.opcionesEmpresa = this.empresa.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEmpresaN(value)));

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterEmpresaN(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEmpresa.filter(option => option.nombre.toLowerCase().trim().includes(filterValue)
            || option.numero_cliente.toLowerCase().trim().includes(filterValue));
    }
    /**
     * Muestar el nombre del cliente seleccionado
     * @param option  nombre del cliente seleccionado
     * @returns nombre del cliente
     */
    displayEmpresa(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    /**
    * 
    * @param emp Muestra informacion de la empresa seleccionada
    */
    empresaSeleccionada(emp) {
        if (!this.vacio(emp)) {
            this.numCliente = emp.value.numero_cliente;
            this.cuentaCliente();

        }
    }
    /**
     * Metodo para saber si el cliente meapi
     * esta activo
     */
    isActivoMEAPI() {

        this.service.getList('isActivoMEAPI').subscribe(meapi => {
            if(meapi.estadoMensaje!=0){
                this.service.showNotification('top', 'right', 3, meapi.estadoDescripcion);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }
    /**
     * MEAPI catalogos
     */
    spsCatalogsMEAPI() {

        this.blockUI.start('Cargando datos...');
        this.listaPlantilla = [];
        this.service.getList('getCatalogosMEAPI').subscribe(plantilla => {
            if (!this.vacio(plantilla.datos)) {
                this.listaPlantilla = JSON.parse(plantilla.datos);
                this.listaClaveBanco = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 6).lCatalogo;
                this.listaTipoPago = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 1).lCatalogo;
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }
    /**
 * Metodo para cargar la cuenta del cliente
 */
    cuentaCliente() {
        this.service.getListByID(this.numCliente, 'spsClabeCuentaCliente').subscribe(cuenta => {
            if (cuenta.estatus) {
                this.claveParticipanteEmisor = cuenta.cuentas[0].claveParticipanteEmisor;
                this.spsCargaCuentasSaldo();
            } else {
                this.service.showNotification('top', 'right', 3, cuenta.mensaje);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
         * Carga los saldos de los movimientos del cliente.
         * @return informacion del saldo en cuuentas
         */
    spsCargaCuentasSaldo() {
        const ids = this.numCliente + "/" + 1;
        this.service.getListByArregloIDs(ids, 'listaSaldoMovimientoByCliente').subscribe((cuenta: any) => {
            this.listaSaldo = cuenta;
            if(this.vacio(this.listaSaldo)){
                this.service.showNotification('top', 'right', 3,'La cuenta asigna no tiene saldo.');
            }
        }, error => {
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }
    /**
     * Metodo para carga masiva de pagos
     */
    cargaMasiva(event) {
        if (this.empresa.invalid) {
            this.empresa.markAsTouched({ onlySelf: true });
            return;
        }
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellText: true, cellNF: false });
            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];
            this.datos = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'DD-MM-YYYY' });
            this.datos.splice(0, 1)
            this.validarCarga();
        };
        reader.readAsBinaryString(target.files[0]);


    }

    /**
     * Validar los datos que se suben en el archivo
     */
    validarCarga() {
        let i = 0;
        let suma = 0;
        this.listaErrores = [];
        if(this.vacio(this.listaSaldo)){
            this.service.showNotification('top', 'right', 3,'La cuenta asigna no tiene saldo.');
            return;
        }
        for (let emp of this.datos) {

            let monto = parseFloat(emp[5]);
            if (this.numCliente != emp[6]) {
                let fila = i + 2;
                this.listaErrores.push({ 'fila': fila, 'dato': emp[6], 'error': "La columna Empresa no pertenece a la empresa seleccionada, " + this.numCliente });
            } else {
                if (emp.length != 7) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp.length, 'error': "La fila no contiene el total de columnas requeridas." });
                } else {

                    if (emp[0].length != 18 && emp[0].length != 16) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[0], 'error': 'La columna Cuenta debe contener 16 dígitos si es numero de tarjeta,\n\n  si es la CLABE interbancaria a  18 dígitos.' });
                    }

                    if (this.vacio(this.listaClaveBanco.find(cvb => cvb.clave === emp[1]))) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[1], 'error': 'La columna Clave_banco no es valida.' });
                    }
                    if (this.vacio(emp[2])) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[2], 'error': 'La columna Beneficiario esta vacia.' });
                    }
                    if (this.vacio(emp[3])) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[3], 'error': 'La columna RFC_CURP esta vacia.' });
                    } else if (emp[3].length > 18) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[3], 'error': 'La columna RFC_CURP longitud mayor a  18 dígitos.' });
                    }

                    if (this.vacio(emp[4])) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[4], 'error': 'La columna Concepto esta vacia.' });
                    }

                    if (isNaN(monto)) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[5], 'error': "La columna Monto, no contiene Formato Numerico válido \n\n (Ejemplo 5000, 1500.50, 100000.00, 1000000.00)." });
                    } else if (!this.vacio(monto)) {
                        if (monto <= 0) {
                            let fila = i + 2;
                            this.listaErrores.push({ 'fila': fila, 'dato': emp[5], 'error': "La columna Monto, contiene monto negativo." });
                        }
                    }
                }

            }
            i++
            suma = suma + monto;
        }
        this.listaCuentaEmisor = this.listaSaldo.find(s => s.movimientoID == this.empresa.value.mov_caja_id);
        if (this.vacio(this.listaCuentaEmisor)) {
            this.service.showNotification('top', 'right', 3, 'No hay una cuenta clabe asignada, solicita se asigue la cuenta');
            this.limpiar();
            return;
        }
        if (this.listaCuentaEmisor.saldo < suma) {
            this.service.showNotification('top', 'right', 3, 'El saldo de la cuenta (' + this.listaCuentaEmisor.saldo + ') no es suficiente para la dispersión\n Saldo a dispersar ' + suma.toFixed(2));
        } else {
            if (this.listaErrores.length > 0) {
                this.correcto = false;
                this.spsErrores();
                this.service.showNotification('top', 'right', 3, 'Se encontraron errores en el Archivo.');
            } else {
                //modal para confirma el registro de empleados
                this.correcto = true;
                this.spsEmpleados();

            }
        }
    }

    /**
   * Lisa las errore empleados
   */
    spsErrores() {
        this.blockUI.start('Cargando datos...');
        this.dataSourceError = new MatTableDataSource(this.listaErrores);
        this.dataSourceError.paginator = this.paginator;
        this.dataSourceError.sort = this.sort;
        this.blockUI.stop();

    }

    /**
* Lisa las empleados con servicio de nomina
*/
    spsEmpleados() {
        this.blockUI.start('Cargando datos...');
        this.dataSourceNomina = new MatTableDataSource(this.datos);
        this.dataSourceNomina.paginator = this.paginator;
        this.dataSourceNomina.sort = this.sort;
        this.blockUI.stop();
    }
    /**
     * Metodo que cambia el valor de now 
     */
    cambioHora() {
        setInterval(() => {
            this.now = new Date();
        }, 1000);

    }
    /**
      * Confirmar si se quiere procesar la infomacion cargada
      */
    confirmarProceso() {
        Swal.fire({
            title: '¿Deseas continuar con la dispersión?',
            text: "¡Se procesaran los datos, cargados!",
            icon: 'warning',
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                //Accion a realizar si  se acepta
                this.dispersar();
            } else {
                //limpiar listas
                this.limpiar();
            }
        })
    }

    /**
     * Mandar los datos a procesar los pagos
     */
    dispersar() {
        this.listaDipsersion = [];
        for (let pago of this.datos) {
            this.listaDipsersion.push([0,//v_bit_pago_id
                pago[0], //v_cuenta
                pago[1], //v_clabe
                pago[2], //v_beneficiario
                pago[4],//concepto
                pago[3], //v_rfc_curp
                pago[5], //v_monto
                this.permisos.usuario.id, moment(this.now).format('YYYY-MM-DD HH:mm:ss'),
                this.empresa.value.cliente_id,
                this.permisos.sucursalSeleccionada.cveSucursal,
                this.generaRastreo(pago[0]),
                moment(this.now).format('YYYY-MM-DD')]);
        }

        let json = {
            'datos': this.listaDipsersion,
            'accion': 1
        };
        
        this.service.registrar(json, 'crudBitacoraPagoSPEI').subscribe(bita => {
            if (bita[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, bita[0][1]);
                this.limpiar();
            } else {
                this.service.showNotification('top', 'right', 3, bita[0][1])
            }
            this.enviarPagos();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para enviar pagos SPEI
     */
    enviarPagos() {
        let lOrden = [];

        for (let pago of this.listaDipsersion) {
            lOrden.push({
                "claveParticipanteEmisor": this.claveParticipanteEmisor,
                "claveParticipanteReceptor": pago[1],
                "fecha": moment(this.now).format('YYYY-MM-DD'),
                "claveRastreo": pago[11],
                "claveTipoPago": 1,//this.listaTipoPago.find(t => t.clave == 1).clave,
                "monto": pago[5],
                "informacionAdicional": "NOMBRE ORDENANTE~" + this.empresa.value.numero_cliente + "~CUENTA EMISOR~" + this.empresa.value.clabe +
                    "~NOMBRE BENEFICIARIO~" + pago[2] + "~CUENTA~" + pago[0] + "~RFC/CURP~" + pago[3] + "~CONCEPTO~" + pago[4]
            });
        }

        let json = {
            "lOrden": lOrden

        }
       this.service.registrar(json, 'enviarOrdenesMEAPI').subscribe(orden => {
            this.service.showNotification('top', 'right', 2, orden.estadoDescripcion);
            this.limpiar();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para generar la clave de Rastreo
     * @param cuenta - numero de cuenta
     * @returns result - clave de Rastreo
     */
    generaRastreo(cuenta) {
        let result = '';
        const characters = cuenta + 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for (let i = 0; i < 30; i++) {
            result += characters.charAt(Math.floor(Math.random() * 30));
        }

        return result;
    }
    /**
     * limpiar listas y variables
     */
    limpiar() {
        this.correcto = false;
        this.listaErrores = [];
        this.datos = [];
    }
    /**
    * Metodo que valida si va vacio.
    * @param value 
    * @returns 
    */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    validaciones = {
        'empresa': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'plantilla': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    }
}