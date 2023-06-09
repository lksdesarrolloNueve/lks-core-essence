import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, FormControlDirective, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { environment } from '../../../../../environments/environment';
import { BuscarClientesComponent } from '../../../modales/clientes-modal/buscar-clientes.component';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import moment from 'moment';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import Swal from 'sweetalert2';

@Component({
    selector: 'modal-servicio',
    moduleId: module.id,
    templateUrl: 'modal-servicio.component.html',
})
/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 18/10/2022
 * @descripcion: Componente para la Administración alta de empresas con servicios de dispersion de nomina
 */
export class ModalServicioComponent implements OnInit {

    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;
    boton: string = 'Agregar';
    formSerivicio: UntypedFormGroup;
    empresa: string = '';
    moralID: number = 0;


    listaServicios: any = [];
    listaComisones: any = [];
    listaEstatusNomina: any = [];
    empresaNomina: number = 0;
    //llegan datos 
    encabezado: string = '';
    accion: number = 0;
    datos: any = [];
    //multiple 
    aplComi: boolean = false;
    comisionSeleccionada: any = [];
    listaComisiones: any = [];
    jsonComisiones: any = [];
    //cuenta
    cuentaID: number = 0;
    listaClabes: any = [];
    opcionesClabes: Observable<string[]>;

    listaCuentaC: any = [];
    opcionesCuentaC: Observable<string[]>;
    opcionesCuentaD: Observable<string[]>;
    opcionesCuentaIva: Observable<string[]>;
    aplIva: boolean = false;


    /**
    * Constructor de la clase ServicioComponent
    * @param service -Service para el acceso a datos 
    */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, public dialog: MatDialog,
        @Inject(MAT_DIALOG_DATA) public info: any, private modServicio: MatDialogRef<ModalServicioComponent>) {
        this.formSerivicio = this.formBuilder.group({
            numeroCuenta: new UntypedFormControl('', Validators.required),
            fecha: new UntypedFormControl({ value: new Date().toLocaleString("es-MX", { year: 'numeric', month: 'long', day: 'numeric' }), disabled: false }),
            tipoServicio: new UntypedFormControl('', Validators.required),
            estatus: new UntypedFormControl(''),
            aplComision: new UntypedFormControl(false),
            comision: new UntypedFormControl(''),
            ccontable: new UntypedFormControl(''),
            iva: new UntypedFormControl(false),
            cuenta: new UntypedFormControl(''),
            monto: new UntypedFormControl(''),
            icontable: new UntypedFormControl(''),
            porcentaje: new UntypedFormControl(''),
            ccontableD: new UntypedFormControl('', Validators.required),
        });
        this.encabezado = info.titulo;
        this.accion = info.accion;
        if (this.accion == 2) {
            this.boton = 'Actualizar';
            this.datos = info.datos;
            this.mostrarServicio(info.datos);
        }
    }
    ngOnInit() {
        this.spsServicio();
        this.spsComisioNomina();
        this.spsEstatusNomina();
        this.spsCuentasComision();
    }
    /**Metodo para bir ventana modal de clientes */
    modalClientes() {
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            data: {
                titulo: 'Busqueda de cliente',
                cliente: ''
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result != 1) {
                if (result.tipoPersona == 'M') {
                    this.moralID = result.datosCl.cliente_id;
                    this.formSerivicio.get('numeroCuenta').setValue(result.datosCl.numero_cliente.trim())
                    this.empresa = result.datosCl.razon_social.trim()
                } else {
                    this.moralID = result.datosCl.cliente_id;
                    this.formSerivicio.get('numeroCuenta').setValue(result.datosCl.numero_cliente.trim())
                    this.empresa = result.datosCl.nombre_cl.trim() + ' ' + result.datosCl.paterno_cl.trim() + ' ' + result.datosCl.materno_cl.trim();
                }
                this.cuentaCliente();
            }
            if (result == 1) {
                this.formSerivicio.get('numeroCuenta').setValue('');
                this.empresa = '';
                this.moralID = 0;
            }

        });
    }
    /**
     * Metodo para cargar la cuenta del cliente
     */
    cuentaCliente() {
        this.service.getListByID(this.formSerivicio.get('numeroCuenta').value, 'spsClabeCuentaCliente').subscribe(cuenta => {
            if (cuenta.estatus) {
                this.listaClabes = cuenta.cuentas;
                this.opcionesClabes = this.formSerivicio.get('cuenta').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterClabes(value)));
                if (this.accion == 2) {
                    let clabe = this.listaClabes.find(cl => cl.clabe == this.datos.clabe)

                    this.formSerivicio.get('cuenta').setValue(clabe);
                }

            } else {
                this.formSerivicio.get('cuenta').setValue('');
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
    * Filtra clabes de clientes
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterClabes(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaClabes.filter(option => option.clabe.toLowerCase().trim().includes(filterValue)
            || option.cuenta.toLowerCase().trim().includes(filterValue));
    }
    displayClabe(option: any): any {
        return option ? option.clabe.trim() : undefined;

    }
    /**
     * Si aplica comison se muestran las comisiones
     */
    aplicaComision() {
        if (this.formSerivicio.get('aplComision').value) {
            this.aplComi = true;

            this.formSerivicio.get('comision').setValidators(Validators.required);
            this.formSerivicio.get('comision').updateValueAndValidity();
            this.formSerivicio.get('monto').setValidators(Validators.required);
            this.formSerivicio.get('ccontable').setValidators(Validators.required);
            this.formSerivicio.get('monto').updateValueAndValidity();
            this.formSerivicio.get('ccontable').updateValueAndValidity();
        } else {
            //se vacia la lista de comision
            this.formSerivicio.get('aplComision').setValue('');
            this.aplComi = false;
            this.listaComisiones = [];
            this.comisionSeleccionada = [];
            this.formSerivicio.get('comision').setValue('');
            this.formSerivicio.get('monto').setValue('');
            this.formSerivicio.get('ccontable').setValue('');
            //se limpian validaciones
            this.formSerivicio.get('comision').setValidators([]);
            this.formSerivicio.get('comision').updateValueAndValidity();
            this.formSerivicio.get('monto').setValidators([]);
            this.formSerivicio.get('ccontable').setValidators([]);
            this.formSerivicio.get('monto').updateValueAndValidity();
            this.formSerivicio.get('ccontable').updateValueAndValidity();

        }
    }
    aplicaIva() {
        if (this.formSerivicio.get('iva').value) {
            this.aplIva = true;
            this.formSerivicio.get('icontable').setValidators(Validators.required);
            this.formSerivicio.get('porcentaje').setValidators(Validators.required);
            this.formSerivicio.get('icontable').updateValueAndValidity();
            this.formSerivicio.get('porcentaje').updateValueAndValidity();
        } else {
            this.aplIva = false;
            this.formSerivicio.get('icontable').setValue('');
            this.formSerivicio.get('porcentaje').setValue('');
            // Se limpia las validaciones
            this.formSerivicio.get('icontable').setValidators([]);
            this.formSerivicio.get('porcentaje').setValidators([]);
            this.formSerivicio.get('icontable').updateValueAndValidity();
            this.formSerivicio.get('porcentaje').updateValueAndValidity();
        }
    }
     
    /**
  * Lisa cuentas contables para comision
  */
    spsCuentasComision() {
        this.blockUI.start('Cargando datos...');
        // Consumo de api para obtener las cuentas contables
        this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
            //obtiene las cuentas contables filtrandolas por afectables
            this.listaCuentaC = data.filter((result) => result.extencionCuentaContable.tipoCuenta.descripcion === 'AFECTABLE');
            // Se setean las cuentas para el autocomplete
            this.opcionesCuentaC = this.formSerivicio.get('ccontable').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaC(value)));

            this.opcionesCuentaIva = this.formSerivicio.get('icontable').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaC(value)));

            this.opcionesCuentaD = this.formSerivicio.get('ccontableD').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCuentaC(value)));

            if (this.accion == 2) {
                let com = this.listaCuentaC.find(c => c.cuentaid == this.datos.cuenta_destino_id);
                this.formSerivicio.get('ccontableD').setValue(com);
            }

        }, error => { // Cacheo de errores al momento del consumo de la api.
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaC(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentaC.filter(option => option.nombre.toLowerCase().trim().includes(filterValue)
            || option.cuenta.toLowerCase().trim().includes(filterValue));
    }
    displayCuenta(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }

    displayCuentaIva(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    displayCuentaD(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    /**
     * Metodo para agregar las comiosnes correspondientes
     */
    agregarComision() {
        this.aplicaIva();
        this.aplicaComision();
        if (!this.vacio(this.formSerivicio.get('comision').value)) {


            let encontro = this.comisionSeleccionada.find(cs => cs.tipoComision.trim() == this.formSerivicio.get('comision').value.descripcion.trim());
            if (!this.vacio(encontro)) {
                Swal.fire({
                    title: '¿Esta seguro?',
                    text: "¡Se actualizara la lista con " + encontro.tipoComision + "!",
                    icon: 'warning',
                    allowOutsideClick: false,
                    showCancelButton: true,
                    confirmButtonColor: '#3085d6',
                    cancelButtonColor: '#d33',
                    confirmButtonText: 'Continuar',
                    cancelButtonText: 'Cancelar'
                }).then((result) => {
                    if (result.isConfirmed) {
                        //Accion a realizar si no se acepta
                        this.comisionSeleccionada.splice(encontro, 1);
                        this.comisionSeleccionada.push({
                            "idComision": this.formSerivicio.get('comision').value.generalesId,
                            "tipoComision": this.formSerivicio.get('comision').value.descripcion,
                            "monto": this.formSerivicio.get('monto').value,
                            "cuentaCID": this.formSerivicio.get('ccontable').value.cuentaid,
                            "ivaCuentaID": this.formSerivicio.get('icontable').value.cuentaid,
                            "porcentaje": this.formSerivicio.get('porcentaje').value
                        });
                        //lIMPIAR CAJAS DE TEXTO
                        this.formSerivicio.get('comision').setValue('');
                        this.formSerivicio.get('monto').setValue('');
                        this.formSerivicio.get('ccontable').setValue('');
                        this.formSerivicio.get('icontable').setValue('');
                        this.formSerivicio.get('porcentaje').setValue('');
                    }
                })

            }

        }

    }
    /**
     * Editar valores de la comision seleccionda
     */
    editarComision(comision: any) {
        let tpC = this.listaComisones.find(t => t.generalesId == comision.idComision);
        this.formSerivicio.get('comision').setValue(tpC);
        let com = this.listaCuentaC.find(c => c.cuentaid == comision.cuentaCID);
        this.formSerivicio.get('ccontable').setValue(com);
        let iva = this.listaCuentaC.find(c => c.cuentaid == comision.ivaCuentaID);
        this.formSerivicio.get('icontable').setValue(iva);
        this.formSerivicio.get('monto').setValue(comision.monto);
        this.formSerivicio.get('porcentaje').setValue(comision.porcentaje);
        //quitar de la lista
        this.comisionSeleccionada.splice(comision, 1);
    }
    /**
     * Metodo que elimina la comision de la lista
     * @param index pocision del elemento en la lista
     */
    eliminarComisiones(index) {
        this.comisionSeleccionada.splice(index, 1);
    }
    /**
       * Metodo para listar los medios de dispersion
       * en generales por la clave de la categoria
       * @param catMedioDisper
       */
    spsServicio(): any {
        this.service.getListByID(environment.categorias.catMedioDisper, 'listaGeneralCategoria').subscribe(medio => {
            this.listaServicios = medio;
            if (this.accion == 2) {
                let medioD = this.listaServicios.find(s => s.cveGeneral === this.datos.cve_medio);
                this.formSerivicio.get('tipoServicio').setValue(medioD);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para listar los estatus de nomina
     * en generales por la clave de la categoria
     * @param catEstatusNomina
     */
    spsEstatusNomina(): any {
        this.service.getListByID(environment.categorias.catEstatusNomina, 'listaGeneralCategoria').subscribe(estatus => {
            this.listaEstatusNomina = estatus;
            let estatusAlta = this.listaEstatusNomina.find(e => e.cveGeneral === environment.generales.cveAltaNomina);
            this.formSerivicio.get('estatus').setValue(estatusAlta);
            if (this.accion == 2) {
                let estatusN = this.listaEstatusNomina.find(e => e.cveGeneral === this.datos.cve_estatus);
                this.formSerivicio.get('estatus').setValue(estatusN);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
       * Metodo para listar las comisiones de nomina
       * en generales por la clave de la categoria
       * @param catEstatusNomina
       */
    spsComisioNomina(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catComisionNomina, 'listaGeneralCategoria').subscribe(comision => {
            this.listaComisones = comision;
            if (!this.vacio(this.info.datos.comisiones)) {
                this.jsonComisiones = JSON.parse(this.info.datos.comisiones);

                for (let c of this.jsonComisiones) {
                    let tipoCom = comision.find(com => com.generalesId === c.tipo_comision_id);
                    this.comisionSeleccionada.push({
                        "idComision": tipoCom.generalesId,
                        "tipoComision": tipoCom.descripcion,
                        "monto": c.monto,
                        "cuentaCID": c.com_cuenta_id,
                        "ivaCuentaID": c.iva_cuenta_id,
                        "porcentaje": c.porcentaje
                    });
                }
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Se muestran los datos con los que de dio de alta la empresa
     */
    mostrarServicio(empresa) {
        this.empresaNomina = empresa.empresa_nomina_id;
        this.formSerivicio.get('fecha').setValue(moment(empresa.fecha_alta).locale('es').format('DD-MMMM-YYYY'));
        this.formSerivicio.get('numeroCuenta').setValue(empresa.numero_cliente);
        this.empresa = empresa.nombre;
        this.formSerivicio.get('iva').setValue(empresa.aplica_iva);
        this.formSerivicio.get('aplComision').setValue(empresa.aplica_comision);
        this.moralID = empresa.cliente_id;
        this.aplComi = empresa.aplica_comision;
        this.aplIva = empresa.aplica_iva;
        this.cuentaCliente();

    }
    /**
     * Alta de servicio dispersion de nomina 
     */
    altaServicio() {
        this.blockUI.start('Cargando datos...');
        if (this.formSerivicio.get('aplComision').value) {
            if (this.comisionSeleccionada.length > 0) {
                //se limpian las validaciones
                this.limpiarValidacionesComisiones();
            } else {
                this.service.showNotification('top', 'right', 3, 'No se agregado la comisión ó IVA.');
                return this.blockUI.stop();
            }
        }
        if (this.formSerivicio.invalid) {
            this.validateAllFormFields(this.formSerivicio);
            return this.blockUI.stop();
        }
        this.listaComisiones = [];
        for (let i of this.comisionSeleccionada) {
            this.listaComisiones.push([i.idComision, parseFloat(i.monto), i.cuentaCID, i.ivaCuentaID, parseFloat(i.porcentaje)]);
        }
        let json = {
            "accion": this.accion,
            "datos": [
                this.empresaNomina,
                this.formSerivicio.get('numeroCuenta').value,
                this.formSerivicio.get('iva').value,
                this.moralID,
                this.formSerivicio.get('tipoServicio').value.generalesId,
                this.formSerivicio.get('estatus').value.generalesId,
                this.formSerivicio.get('cuenta').value.clabe_cliente_id,
                this.formSerivicio.get('aplComision').value,
                this.formSerivicio.get('ccontableD').value.cuentaid
            ],
            "comisiones": this.listaComisiones
        };
        this.service.registrar(json, 'crudEmpresasNomina').subscribe(servicio => {
            if (servicio[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, servicio[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, servicio[0][1])
            }
            this.modServicio.close();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para limpiar las validaciones al aplicar comisones o iva
     */
    limpiarValidacionesComisiones() {
        this.formSerivicio.get('comision').setValidators([]);
        this.formSerivicio.get('comision').updateValueAndValidity();
        this.formSerivicio.get('monto').setValidators([]);
        this.formSerivicio.get('ccontable').setValidators([]);
        this.formSerivicio.get('monto').updateValueAndValidity();
        this.formSerivicio.get('ccontable').updateValueAndValidity();
        this.formSerivicio.get('icontable').setValidators([]);
        this.formSerivicio.get('porcentaje').setValidators([]);
        this.formSerivicio.get('icontable').updateValueAndValidity();
        this.formSerivicio.get('porcentaje').updateValueAndValidity();
    }
    /**
       * Metodo que valida si va vacio.
       * @param value 
       * @returns 
       */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    //Arreglo de mensajes a mostrar al validar formulario
    validaciones = {
        'numeroCuenta': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'tipoServicio': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'ccontableD': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'comision': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'ccontable': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'icontable': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'porcentaje': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    }

    
    /**
     * Valida los controles de los montos
     * @param name control a validar
     * @param error 
     * @returns 
     */

    onCtrlValidate(name: any, error: any): FormControlDirective {
        return <FormControlDirective>this.formSerivicio.controls[name].errors?.[error]
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
}