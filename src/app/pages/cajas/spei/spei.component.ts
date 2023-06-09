import { Component, Inject, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BeneficiariosSPEIComponent } from "./beneficiarios/beneficiarios-spei.component";
import { environment } from '../../../../environments/environment';
import { PermisosService } from "../../../shared/service/permisos.service";
import { MatTabChangeEvent } from "@angular/material/tabs";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

//Origen
const cOrigenMov = environment.generales.origenMov;// "51EL" Origen movimiento

@Component({
    selector: 'spei',
    templateUrl: './spei.component.html'
})
export class SpeiComponent {

    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;

    vFechaOperacion: string="";

    listaClabeCuenta: any = [];
    listaBeneficiarios: any = [];
    opcionesBeneficiarios: Observable<string[]>;

    listaPlantilla: any = [];
    listaBancos: any = [];
    listaTipoPago: any = [];
    listaTipoCuentas: any = [];
    listaTiposCuenta: any = [];

    //Clave sucursal sesión.
    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;
    vCveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

    listaMovCuenta: any = [];

    showBotonEnviar = true;

    formSPEI: UntypedFormGroup;

    // INICIO VARIABLES TABLA PAGOS
    listaPagos = [];
    columnsPagos: string[] = ['beneficiario',
        'cuenta','cveRastreo','fecha', 'monto','estatus'];
    dataSourcePagos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginatorPagos: MatPaginator;
    @ViewChild(MatSort) sortPagos: MatSort;
    // FIN VAR PAGOS

    constructor(private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) private data: any,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        private dialog: MatDialog) {

        this.getClaveSPEI();
        this.listaMovCuenta = data.listaMovCuenta;

        this.formSPEI = this.formBuilder.group({
            cuentaRetiro: new UntypedFormControl('', Validators.required),
            nombreEmisor: new UntypedFormControl(''),
            rfcCurpEmisor: new UntypedFormControl(''),
            clabeEmisor: new UntypedFormControl(''),
            beneficiario: new UntypedFormControl('', Validators.required),
            rfcCurpBeneficiario: new UntypedFormControl(''),
            cuentaBeneficiario: new UntypedFormControl(''),
            tipoCuenta: new UntypedFormControl(''),
            bancoReceptor: new UntypedFormControl(''),
            concepto: new UntypedFormControl('', Validators.required),
            monto: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')])
        });

        //this.spsClabeCuentaCliente(data.datosCliente.numero_cliente);
        this.spsListaTiposDepositos(this.vCveSucursal, data.datosCliente.numero_cliente, 2)
        this.setDatosEmisor(data.datosCliente);
        this.listaBeneficiariosSPEI(1);
        this.spsCatalogsMEAPI();
        this.getFechaOperacion();
        this.spsPagoSPEI(data.datosCliente.numero_cliente);
    }

    enviarPago() {

        if (this.formSPEI.invalid) {
            this.validateAllFormFields(this.formSPEI);
            return;
        }

        if(this.vFechaOperacion === ''){
            this.getFechaOperacion();
        }

  
        let jsonRequestPago = {
            datosEmisor: [
                this.data.datosCliente.numero_cliente,
                this.formSPEI.get('cuentaRetiro').value.cveMovimiento,
                this.vUsuarioId,
                cOrigenMov
            ],
            detalleEnvio: [
                this.formSPEI.get('beneficiario').value.cuenta,
                this.formSPEI.get('beneficiario').value.claveBancoReceptor,
                this.formSPEI.get('beneficiario').value.beneficiario,
                this.formSPEI.get('rfcCurpBeneficiario').value,
                this.formSPEI.get('monto').value,
                this.vFechaOperacion,
                "CVE-RASTREO3424",
                this.formSPEI.get('concepto').value
            ],
            accion: 1
        };

        this.service.registrar(jsonRequestPago, 'crudPagoSPEI').subscribe(respPago => {
            this.blockUI.stop();

            if (respPago.codigo === "0") {
                this.formSPEI.reset();
                this.spsPagoSPEI(this.data.datosCliente.numero_cliente);
                this.service.showNotification('top', 'right', 2, respPago.mensaje);
            } else {
                this.service.showNotification('top', 'right', 1, respPago.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }

    spsPagoSPEI(numeroCliente: any){

        let jsonRequest = {
            datos: [numeroCliente],
            accion: 2
        };

        this.blockUI.start('Buscando datos...');

        this.service.getListByObjet(jsonRequest, 'spsPagoSPEI').subscribe(respGetPagos => {
            this.blockUI.stop();

            if (respGetPagos.codigo === "0") {
                this.listaPagos = respGetPagos.lista;
                this.dataSourcePagos = new MatTableDataSource(this.listaPagos);
                setTimeout(() => this.dataSourcePagos.paginator = this.paginatorPagos);
                this.dataSourcePagos.sort = this.sortPagos;
            }else{
                this.service.showNotification('top', 'right', 1, respGetPagos.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    /**
     * Metodo para abrir el dialogo de cierre caja.
     */
    abrirGestionBeneficiariosSPEI() {

        const dialogBene = this.dialog.open(BeneficiariosSPEIComponent, {
            width: '100%',
            disableClose: true
        });

        dialogBene.afterClosed().subscribe(result => {

            if (!this.vacio(result)) {
                this.cargarInformacionBeneficiario(result);
                this.formSPEI.get('beneficiario').setValue(result);
            }

        });

    }

    getFechaOperacion(){
        this.blockUI.start('Cargando datos...');
        this.service.getList('getFechaOperacion').subscribe(respFecha => {
            this.blockUI.stop();
            if (respFecha.estadoMensaje === 0) {
                this.vFechaOperacion = JSON.parse(respFecha.cuerpo).fechaOperacion;
            } else {
                this.service.showNotification('top', 'right', 3, respFecha.estadoDescripcion);
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    getClaveSPEI(){
        this.blockUI.start('Cargando datos...');
        this.service.getList('getClaveSPEI').subscribe(respClave => {
            this.blockUI.stop();
            if (respClave.estadoMensaje !== 0) {
                this.service.showNotification('top', 'right', 3, respClave.estadoDescripcion);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para cargar la cuenta del cliente
     */
    spsClabeCuentaCliente(numCliente: any) {
        this.listaClabeCuenta = [];
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(numCliente, 'spsClabeCuentaCliente').subscribe(cuenta => {
            this.blockUI.stop();
            if (cuenta.estatus) {
                this.listaClabeCuenta = cuenta.cuentas;
            } else {
                this.service.showNotification('top', 'right', 3, cuenta.mensaje);
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Metodo para tipos depositos
     * 
     */
    spsListaTiposDepositos(cveSucursal: any, cveCliente: any, accion: any) {
        this.blockUI.start('Cargando datos...');

        const ids = cveSucursal + "/" + cveCliente + "/" + accion;

        this.service.getListByArregloIDs(ids, 'listTipoMovDR').subscribe(data => {
            //Sucursales
            this.listaTiposCuenta = data;

            this.listaClabeCuenta = [];
            this.service.getListByID(cveCliente, 'spsClabeCuentaCliente').subscribe(cuenta => {
                if (cuenta.estatus) {

                    for (let mov of this.listaTiposCuenta) {
                        let findCuenta = cuenta.cuentas.find(cuenta => cuenta.cveMovimiento.trim() === mov.cveMovCaja.trim());

                        if (findCuenta) {
                            this.listaClabeCuenta.push(findCuenta);
                        }

                    }

                } else {
                    this.service.showNotification('top', 'right', 3, cuenta.mensaje);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
            );

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    listaBeneficiariosSPEI(accion) {


        let jsonRequest = {
            datos: [],
            accion: accion
        };

        this.blockUI.start('Buscando datos...');

        this.service.getListByObjet(jsonRequest, 'listaBeneficiariosSPEI').subscribe(respGetBeneficiarios => {
            this.blockUI.stop();

            if (respGetBeneficiarios.codigo === "0") {
                this.listaBeneficiarios = respGetBeneficiarios.lista;

                // Se setean los datos de categorias para el autocomplete
                this.opcionesBeneficiarios = this.formSPEI.get('beneficiario').valueChanges.pipe(
                    startWith(''),
                    map(value => this.filterBeneficiarios(value)));
            } else {
                this.service.showNotification('top', 'right', 1, respGetBeneficiarios.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    /**
    * Filtra el tipo de beneficiarios
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private filterBeneficiarios(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaBeneficiarios.filter(option => option.beneficiario.toLowerCase().trim().includes(filterValue)
            || option.cuenta.toLowerCase().trim().includes(filterValue));
    }


    /**
     * Muestra la descripcion del tipo de Categorias
     * @param option --tipo producto seleccionado
     * @returns -- tipo producto
     */
    displayStBeneficiario(option: any): any {
        return option ? option.beneficiario.trim() : undefined;
    }


    /**
     * MEAPI catalogos
     */
    spsCatalogsMEAPI() {

        this.blockUI.start('Cargando datos...');
        this.listaPlantilla = [];
        this.service.getList('getCatalogosMEAPI').subscribe(cat => {

            if (!this.vacio(cat.cuerpo)) {
                this.listaPlantilla = JSON.parse(cat.cuerpo);

                this.listaTipoPago = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 1).lCatalogo;
                this.listaTipoCuentas = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 2).lCatalogo;
                this.listaBancos = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 6).lCatalogo;

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    setDatosEmisor(cliente) {

        if (cliente.cve_socio === environment.globales.cveSocioFisico) {
            let nombreCompleto = cliente?.nombre_cl + ' ' + cliente?.paterno_cl + ' ' + cliente?.materno_cl;
            this.formSPEI.get('nombreEmisor').setValue(nombreCompleto.toUpperCase());
            this.formSPEI.get('rfcCurpEmisor').setValue(cliente.curp);
        }

        if (cliente.cve_socio === environment.globales.cveSocioMoral) {
            this.formSPEI.get('nombreEmisor').setValue(cliente?.razon_social.toUpperCase());
            this.formSPEI.get('rfcCurpEmisor').setValue(cliente.rfc);
        }

    }


    setClabeEmisor() {
        this.formSPEI.get('clabeEmisor').setValue(this.formSPEI.get('cuentaRetiro').value.clabe);
    }

    cargarInformacionBeneficiario(beneficiario: any) {

        this.formSPEI.get('rfcCurpBeneficiario').setValue(beneficiario.rfcCurp);
        this.formSPEI.get('cuentaBeneficiario').setValue(beneficiario.cuenta);

        let getTipoCuenta = this.listaTipoCuentas.find(cuenta => cuenta.clave === beneficiario.claveTipoCuenta);
        this.formSPEI.get('tipoCuenta').setValue(getTipoCuenta.descripcion);

        let getBancoReceptor = this.listaBancos.find(banco => banco.clave === beneficiario.claveBancoReceptor);
        this.formSPEI.get('bancoReceptor').setValue(getBancoReceptor.descripcion);
    }

    tabSeleccionada(changeEvent: MatTabChangeEvent) {
        if (changeEvent.index == 0) {
            this.showBotonEnviar = true;
        } else {
            this.showBotonEnviar = false;
        }
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
    * Metodo que valida si va vacio.
    * @param value 
    * @returns 
    */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    /** Lista de validaciones*/
    validacion_msj = {
        'cuentaRetiro': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'concepto': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'beneficiario': [{ type: 'required', message: 'Campo requerido.' }],
        'monto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' }
        ]

    }

}