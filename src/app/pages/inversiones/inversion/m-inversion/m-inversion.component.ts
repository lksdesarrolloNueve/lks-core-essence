import { Component, Inject } from "@angular/core";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { globales } from '../../../.././../environments/globales.config';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { categorias } from "../../../../../environments/categorias.config";
import { CurrencyPipe, formatDate, formatCurrency, getCurrencySymbol } from "@angular/common";
import { generales } from "../../../../../environments/generales.config";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { EncryptDataService } from "../../../../shared/service/encryptdata/encryp.service";

@Component({
    moduleId: module.id,
    selector: 'm-inversion',
    templateUrl: './m-inversion.component.html'
})

export class CrudInversionComponent {

    //Declaracion de variables
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    numSocio: any;
    nombreSocio: any;
    sucursal: any;
    private clienteID: any;

    listaInversiones: any = [];
    listaCuentas: any = [];
    listaInstrucciones: any = [];
    listaFormasPago: any = [];

    formInversion: UntypedFormGroup;

    retieneISR: boolean;
    notificarRetiro: boolean = true;

    showFormaPago: boolean = false;
    showCuentas: boolean = true;
    //lista informacion emmisor para envio de correosa
    listaEmisorCorreo: any = [];
    listaCorreoCl: any = [];
    @BlockUI() blockUI: NgBlockUI;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private currencyPipe: CurrencyPipe,
        private permisos: PermisosService,
        private dialog: MatDialog,
        private encripta: EncryptDataService) {

console.log(data)
        this.formInversion = this.formBuilder.group({
            cuenta: new UntypedFormControl('', Validators.required),
            inversion: new UntypedFormControl('', Validators.required),
            monto: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            tasa: new UntypedFormControl(''),
            isr: new UntypedFormControl(''),
            interes: new UntypedFormControl(''),
            total: new UntypedFormControl(''),
            instruccion: new UntypedFormControl('', [Validators.required]),
            tipoDeposito: new UntypedFormControl('')
        });
        this.numSocio = data.datosCliente.numero_cliente;
        this.sucursal = data.datosCliente.nombre_sucursal;
        this.clienteID = data.datosCliente.cliente_id;
        //Recperacion del(os) correo(s) de cliente
        for (let correo of JSON.parse(data.datosCliente.agendacl)) {
            this.listaCorreoCl.push(correo.correo);
        }
        if (data.tipoPersona === 'F') {
            this.nombreSocio = data.datosCliente.nombre_cl + ' ' + data.datosCliente.paterno_cl + ' ' + data.datosCliente.materno_cl
        } else {
            this.nombreSocio = data.datosCliente.razon_social
        }

        if (data.origen === 1) {
            this.showFormaPago = true;
            this.showCuentas = false;
        } else {
            this.spsFormasPago();
            this.formInversion.get('tipoDeposito').setValidators([Validators.required]);
            this.formInversion.get('tipoDeposito').updateValueAndValidity();
        }

        this.spsDatosCorreo();
        this.spsInversiones();
        this.spsCargaCuentasSaldo(this.numSocio);
        this.spsInstruccionesVencimiento();



    }

    /**
     * Metodo que enlista las inversiones
     */
    spsInversiones() {
        this.blockUI.start('Cargando la información...');
        this.service.getListByID(2, 'listaInversiones').subscribe(
            data => {
                this.listaInversiones = data;
                this.blockUI.stop();
            }, error => {
                this.service.showNotification('top', 'right', 4, error.Message);
                this.blockUI.stop();
            });
    }


    /**
     * Carga los saldos de los movimientos del cliente.
     * @param cveCliente 
     */
    spsCargaCuentasSaldo(cveCliente: any) {

        this.blockUI.start('Cargando datos...');
        const ids = cveCliente + "/" + 1;

        this.service.getListByArregloIDs(ids, 'listaSaldoMovimientoByCliente').subscribe(
            (data: any) => {
                this.blockUI.stop();
                this.listaCuentas = data

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }

    /**
     * Metodo para setear los valores de la inversion
     */
    setDatosInv() {
        this.formInversion.get('tasa').setValue(this.formInversion.get('inversion').value.extensionInversion.tasa)
        this.retieneISR = this.formInversion.get('inversion').value.extensionInversion.retieneIsr;
        this.formInversion.get('interes').setValue('');
        this.formInversion.get('total').setValue('');
        this.formInversion.get('monto').setValue('');
    }


    /**
     * Metodo para calcular el interes de la inversion
     */
    calculaInteres() {

        /*
        let interes = Number(((this.formInversion.get('monto').value * 
        (this.formInversion.get('inversion').value.extensionInversion.tasa / 100)) / 365) *
         this.formInversion.get('inversion').value.plazo);
         */
        
        const interes = ((Math.floor(((Math.floor((this.formInversion.get('monto').value * (this.formInversion.get('inversion').value.extensionInversion.tasa / 100)) * 100)) / 360)) / 100) * this.formInversion.get('inversion').value.plazo).toFixed(2);
        this.formInversion.get('interes').setValue(interes);
        this.formInversion.get('total').setValue((Number(this.formInversion.get('monto').value) +  Number(interes)));
    }


    /**
     * Metodo que consulta los tipos de Acciones al vencimiento
     */
    spsInstruccionesVencimiento() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(categorias.catInstrucciones, 'listaGeneralCategoria').subscribe(data => {
            this.listaInstrucciones = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });

    }

    notificaTermino(val) {
        this.notificarRetiro = val;
    }

    /**
    * Metodo para listar formas de pago
    * Se lista 1.- muestra todos, 2.- muestra activos , 3.- muestra inactivos
    */
    spsFormasPago() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaFormasPago').subscribe(data => {
            this.listaFormasPago = data;

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    procesarInversion() {
        if (this.formInversion.invalid) {
            this.validateAllFormFields(this.formInversion);
            return;
        }

        if (!this.validacionesPersonalizadas()) {
            return;
        }



        let formaPago = '03';
        let cuenta = null;

        if (this.data.origen !== 1) {

            if (this.formInversion.get('tipoDeposito').value.cvefpago.trim() === '01') {
                formaPago = this.formInversion.get('tipoDeposito').value.cvefpago;
                cuenta = this.data.caja.cve_caja;
            } else if (this.formInversion.get('tipoDeposito').value.cvefpago.trim() === '03') {
                formaPago = this.formInversion.get('tipoDeposito').value.cvefpago;
                cuenta = this.formInversion.get('cuenta').value.cveMovimiento;
            } else {
                this.service.showNotification('top', 'right', 3, 'Forma de Pago no Programada.');
                return;
            }

        } else {
            
            cuenta = this.formInversion.get('cuenta').value.cveMovimiento;
        }





        let dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: "Confirmación.",
                body: "¿Desea realizar el movimiento?"
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar
                this.blockUI.start('Procesando petición...');
                let jsonData = {
                    "datos": [
                        this.formInversion.get('inversion').value.inversionId,
                        this.notificarRetiro,
                        this.formInversion.get('monto').value,
                        this.formInversion.get('inversion').value.plazo,
                        this.formInversion.get('tasa').value,
                        this.formInversion.get('inversion').value.extensionInversion.retieneIsr,
                        "FRONT",
                        this.formInversion.get('instruccion').value.generalesId,
                        this.clienteID,
                        this.permisos.usuario.id,
                        this.permisos.sucursalSeleccionada.cveSucursal,
                        formaPago,
                        cuenta,
                        this.numSocio,
                        generales.origenMov,
                        this.permisos.sucursalSeleccionada.sucursalid
                    ],
                    "accion": 1

                }

                this.service.registrar(jsonData, 'crudInversion').subscribe(inv => {
                    this.blockUI.stop();
                    if (inv[0] === '0') {
                        this.spsCargaCuentasSaldo(this.numSocio);
                        //el tipo de movimiento genera una operacion inusual o relevante
                        this.spsFrecuenciaOperaciones();//Consulta la frecuencia de operaciones y montos
                        this.spsOperacionRelevante();//Consulta Operacion relevante 

                        this.formInversion.reset();
                        this.service.showNotification('top', 'right', 2, inv[1]);
                    } else {
                        this.service.showNotification('top', 'right', 3, inv[1]);
                    }
                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.Message);
                });
            }
        });


    }

    /**
     * Método para validaciones personalizadas.
     */
    public validacionesPersonalizadas() {

        //Validacion Saldo insuficiente
        if (this.formInversion.get('monto').value > this.formInversion.get("cuenta")?.value.saldo) {
            this.formInversion.controls['monto'].setErrors({ saldoInsuficiente: true });
            return false;
        }

        if (this.formInversion.get('monto').value < this.formInversion.get("inversion")?.value.extensionInversion.montoInf) {

            this.validacion_msj['monto'] = [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' },
                { type: 'saldoInsuficiente', message: 'No cuenta con saldo suficiente para realizar la transacción.' },
                {
                    type: 'montoInf', message: 'El Monto mínimo es '
                        + this.currencyPipe.transform(this.formInversion.get("inversion")?.value.extensionInversion.montoInf, 'MXN')
                }
            ];
            this.formInversion.controls['monto'].setErrors({ montoInf: true });
            return false;

        }

        if (this.formInversion.get('monto').value > this.formInversion.get("inversion")?.value.extensionInversion.montoSup) {
            this.validacion_msj['monto'] = [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' },
                { type: 'saldoInsuficiente', message: 'No cuenta con saldo suficiente para realizar la transacción.' },
                {
                    type: 'montoSup', message: 'El Monto límite es ' +
                        this.currencyPipe.transform(this.formInversion.get("inversion")?.value.extensionInversion.montoSup, 'MXN')
                }
            ];
            this.formInversion.controls['monto'].setErrors({ montoSup: true });
            return false;

        }


        return true;

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
    * Limpia monto.
    */
    limpiaMonto() {
        this.formInversion.get('monto').setValue(null);
    }


    /** Lista de validaciones*/
    validacion_msj = {
        'cuenta': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'monto': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' },
            { type: 'saldoInsuficiente', message: 'No cuenta con saldo suficiente para realizar la transacción.' }
        ],
        'instruccion': [{ type: 'required', message: 'Campo requerido.' }],
        'inversion': [{ type: 'required', message: 'Campo requerido.' }],
        'tipoDeposito': [{ type: 'required', message: 'Campo requerido.' }]

    }

    /**
     * Metodo para ocultar las formas de pago o retiro de cuentas
     */
    seleccionaForma() {
        if (this.formInversion.get('tipoDeposito').value.cvefpago === '03') {
            this.showCuentas = false;
            this.formInversion.get('cuenta').setValidators([Validators.required]);
            this.formInversion.get('cuenta').updateValueAndValidity();
        } else {
            this.showCuentas = true;
            this.formInversion.get('cuenta').setValidators([]);
            this.formInversion.get('cuenta').updateValueAndValidity();
        }

    }
    /**
     * Consulta la infomacion del emisor de correo acorde a la sucursal en session
     */
    spsDatosCorreo() {

        let cveSucursal = this.permisos.sucursalSeleccionada.cveSucursal;

        const path = globales.cveNotiSocio + "/" + cveSucursal;
        this.service.getListByArregloIDs(path, 'spsCorreosBYCves').subscribe(
            (data: any) => {

                if (!this.vacio(data)) {
                    this.listaEmisorCorreo = data;
                }
            }, error => {
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }
    /**Indica si los moviminetos del mes han superado el perfil transaccional del cliente */
    spsFrecuenciaOperaciones() {
        this.service.getListByID(this.numSocio, 'spsFrecunciaOperaciones').subscribe(
            frecuencia => {
                if (frecuencia[0][0] != "1") {//se rebaso el perfil transaccional
                    this.service.showNotification('top', 'right', 2, frecuencia[0][2]);
                    //envio de correo inusual 
                    let fecha = formatDate(new Date(), 'dd-MM-yyyy', 'en-US');
                    let cuerpoTbl = '';
                    for (let inu of frecuencia) {
                        cuerpoTbl += "<tr>" + "<td>" + this.numSocio + inu[1] + "</td> <td>" + fecha + "</td>"
                            + "<td>" + inu[2] + "</td>" + "</tr>";
                    }
                    const data = {
                        "emisor": {
                            "correoID": 0,
                            "cveCorreo": this.listaEmisorCorreo[0].cveCorreo,
                            "numero": this.listaEmisorCorreo[0].numero,
                            "email": this.listaEmisorCorreo[0].email,
                            "usuario": this.encripta.desencriptar(this.listaEmisorCorreo[0].usuario),
                            "contasena": this.encripta.desencriptar(this.listaEmisorCorreo[0].contasena),
                            "servidor": this.listaEmisorCorreo[0].servidor,
                            "puerto": this.listaEmisorCorreo[0].puerto,
                            "tipoNotificacionId": "",
                            "estatus": true,
                            "notificaciones": "",
                            "sucursales": ""
                        },

                        "receptores": this.listaCorreoCl,
                        "asunto": ' ¡¡¡OPERACION INUSUAL !!! ' + fecha,
                        "cuerpoMensaje": "<head> <style> table {"
                            + "          font-family: Arial, Helvetica, sans-serif;  border-collapse: collapse;"
                            + "          margin-left: auto;  margin-right: auto;}td, th {"
                            + "          padding: 1em;} "
                            + "        tr:nth-child(even){background-color: #f2f2f2;} th {"
                            + "          padding-top: 12px;     padding-bottom: 12px;   text-align: center;"
                            + "          background-color: rgb(32, 101, 210);  color: white;  }"
                            + "         </style>"
                            + "</head>" + "<body> <h1>¡¡¡OPERACION INUSUAL !!! " + fecha + " </h1>"
                            + "<table id=\"tabla\"> <tr> <th>Cliente</th> <th>Fecha</th>"
                            + "<th>Motivo</th> </tr>" + cuerpoTbl + "</table></body>"
                    }

                    //Se envia el correo de la operacion 
                    this.service.registrar(data, 'enviarCorreoHTML').subscribe();

                }
                //el tipo de movimiento genera una operacion relevante
                this.spsOperacionRelevante();

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );
    }
    /**
     * Revisa si se a registrado una operacion relevante acorde a la cantidad de depositos realizados
     */
    spsOperacionRelevante() {
        //Se genera el Arreglo para consultar operaciones relevantes
        let arreglo = {
            "datos": [this.numSocio],
            "accion": 1
        };
        this.service.getListByObjet(arreglo, 'spsOpRelevante').subscribe(rel => {
            if (!this.vacio(rel)) {
                let relev = JSON.parse(rel);
                this.service.showNotification('top', 'right', 3, 'Operaci&oacute;n Relevante');
                let fecha = formatDate(new Date(), 'dd-MM-yyyy', 'en-US');
                //se hace el correo de relevantes
                let cuerpoTbl = '';
                for (let rele of relev) {
                    cuerpoTbl += "<tr>" + "<td>" + rele.numero_cliente + " " + rele.nombres
                        + " " + rele.apellido_paterno + " " + rele.apellido_materno
                        + "</td> <td>" + fecha + "</td>   <td id=\"valor\">" + formatCurrency(rele.monto, 'en-US', getCurrencySymbol('MXN', 'wide'))
                        + "</td>" + "<td>" + rele.descripcion + "</td>" + "</tr>";
                }
                const data = {
                    "emisor": {
                        "correoID": 0,
                        "cveCorreo": this.listaEmisorCorreo[0].cveCorreo,
                        "numero": this.listaEmisorCorreo[0].numero,
                        "email": this.listaEmisorCorreo[0].email,
                        "usuario": this.encripta.desencriptar(this.listaEmisorCorreo[0].usuario),
                        "contasena": this.encripta.desencriptar(this.listaEmisorCorreo[0].contasena),
                        "servidor": this.listaEmisorCorreo[0].servidor,
                        "puerto": this.listaEmisorCorreo[0].puerto,
                        "tipoNotificacionId": "",
                        "estatus": true,
                        "notificaciones": "",
                        "sucursales": ""
                    },
                    "receptores": this.listaCorreoCl,
                    "asunto": ' ¡¡¡OPERACIONES RELEVANTES!!! ' + fecha,
                    "cuerpoMensaje": "<head>" + "    <style>" + "        table {"
                        + "          font-family: Arial, Helvetica, sans-serif;" + "          border-collapse: collapse;"
                        + "          margin-left: auto;" + "          margin-right: auto;" + "}" + "        td, th {"
                        + "          padding: 1em;" + "}" + "        "
                        + "        tr:nth-child(even){background-color: #f2f2f2;}" + "        " + "        th {"
                        + "          padding-top: 12px;" + "          padding-bottom: 12px;" + "          text-align: center;"
                        + "          background-color: rgb(32, 101, 210);" + "          color: white;" + "        }"
                        + "        #valor {" + "            color: rgb(220, 0, 0);" + "        }" + "        </style>"
                        + "</head>" + "<body>" + "    <h1>¡¡¡OPERACIONES RELEVANTES!!! " + fecha + " </h1>"
                        + "<table id=\"tabla\">" + "  <tr>" + "    <th>Cliente</th>" + "    <th>Fecha</th>"
                        + "    <th>Monto</th>" + "    <th>Motivo</th>" + "  </tr>" + cuerpoTbl + "</table>" + "</body>"
                }
                //Se envia el correo de la operacion relevante
                this.service.registrar(data, 'enviarCorreoHTML').subscribe();
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
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