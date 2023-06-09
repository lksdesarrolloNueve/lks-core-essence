import { Component, Inject, OnInit } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { verificacionModalComponent } from '../../../../../app/pages/modales/verificacion-modal/verificacion-modal.component';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from '../../../../shared/service/permisos.service';
import { environment } from '../../../../../environments/environment';
import { EncryptDataService } from "../../../../shared/service/encryptdata";
import { formatCurrency, formatDate, getCurrencySymbol } from '@angular/common';
import { globales } from "../../../../../environments/globales.config";
import { ModalPldComponent } from '../../../../pages/clientes/administracion-clientes/modal-pld/modal-pld.component';

////Constantes//////
//Tipo movimiento.
const cDeposito = environment.tesoreria.deposito;// 001 'Depostio' = 'I'
const cRetiro = environment.tesoreria.retiro;// 002 'Retiro'   =  'E'
// Tipo Notificacion ///
const cNotiSocio = environment.globales.cveNotiSocio;

//Forma de pago
const cFormaEfecti = environment.tesoreria.formaEfecti; //: '01', Efectivo 


@Component({
    selector: 'admin-movimiento',
    moduleId: module.id,
    templateUrl: 'admin-movimiento.component.html',
    styleUrls: ['admin-movimiento.component.css']
})

/**
 * @autor: Horacio Abraham Picón Galván.
 * @version: 2.0.0
 * @fecha: 23/01/2022
 * @descripcion: Componente para la Administración de Movimiento
 */
export class AdministracionMovimientoComponent implements OnInit {

    //Clave sucursal sesión.
    vCveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

    //Correo y SMS
    claveCliente = '';
    numeroLada = '';
    nombreCli = '';
    correoCli = '';
    isLoadingResults: boolean = false;
    isResultado: boolean = false;
    listaEmisor = [];
    listaEmisorCorreo = [];
    activa: boolean = false;

    //Usuario id y sucursal id.
    vUsuarioId = this.servicePermisos.usuario.id;
    //Clave caja
    vCveCaja: any;
    //Clave de la cuenta bancaria asociada a la caja
    cveCuentaCaja: any;

    //Declaracion de variables, constantes, listas 
    formAdminMovimiento: UntypedFormGroup;
    listaRoles = [];
    titulo: string = "";
    accion: number = 0;
    listaFormasPago: any = [];
    listaFormasPagoSelec: any = [];
    nomCliente: string = "";
    cveCliente: string = "";
    metodoPagoSelec: string = "";
    mps: boolean = true;

    totalDep: number = 0.0;
    totalRet: number = 0.0;
    total: number = 0.0;
    totalCambio: number = 0.0;

    @BlockUI() blockUI: NgBlockUI;
    val1: any;
    val2: any;
    val3: any;
    cant1: any;
    cant2: any;
    oper: any;
    resu: any;

    listaMovimientos: any = [];
    listaSaldosPg: any = [];
    saldoInicialCajeroPg: number = 0.00;

    // Lista de formas de pago de todos los movimientos
    listaMovimientosFP: any = [];
    // Lista de formas de pago compartidas entre movimientos
    listaFPCompartidas: any;

    //Saldo de la cuenta
    saldo: number = 0.0;
    lblCliente: string = globales.ente;

    lblPoliza: string = "";

    /**
     * Constructor de la clase AdministracionRolesComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        private servicePermisos: PermisosService,
        private encripta: EncryptDataService,
        public dialogConfirm: MatDialog,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialogRef<AdministracionMovimientoComponent>,) {

        // Seteamos los datos que se pasan desde InversionesComponent.
        this.titulo = data.titulo;
        this.accion = data.accion;
        this.nomCliente = data.nomCliente;
        this.cveCliente = data.cveCliente;
        this.totalDep = data.totalDep;
        this.totalRet = data.totalRet;
        this.total = data.total;
        this.vCveCaja = data.cveCaja;
        this.cveCuentaCaja = data.cveCuentaCaja;

        //SMS Y CORREO
        this.claveCliente = data.cveCliente;
        this.numeroLada = data.numerolada;
        this.nombreCli = data.nomCliente;
        this.correoCli = data.correoCliente;


        this.saldoInicialCajeroPg = data.cajas.saldo_inicial_cajero;

        // Se llena una lista con las formas de pago validas de cada transaccion
        data.listaTransacciones.forEach((transaccion: any) => this.spsFPagoMovCaja(transaccion));

        // Creamos las validaciones de los campos.
        this.formAdminMovimiento = this.formBuilder.group({

            formaPago: new UntypedFormControl('', [Validators.required]),
            cantidad: new UntypedFormControl('', [Validators.required, Validators.pattern('^[0-9]{1,100}$|^[0-9]{1,100}\.[0-9]{1,100}$')])

        });

    }

    /** 
     * Metodo que ejecuta cualquier metodo o variable 
     * que se ponga dentro de esté al abrir el modal.
    */
    ngOnInit() {
        this.spsFormasPago();

        //Consultar saldo de la cuenta ligada a la caja
        this.spsSaldoCuenta();

        //Notificaciones SMS y Email
        this.spsDatosEmisor();
        this.spsDatosCorreo();

        //Valida retiros para no dejar ingresar dinero en retiros
        if (this.total < 0) {
            this.formAdminMovimiento.get('cantidad').setValue(0);
            this.activa = true;
            this.acutalizaCambio();
        }


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



    limpiarCampos() {
        this.formAdminMovimiento.get('cantidad').setValue('');
        this.metodoPagoSelec = '';
        this.mps = true;
    }


    /**
     * Actualiza el saldo de cambio.
     */
    acutalizaCambio() {

        this.totalCambio = this.formAdminMovimiento.get('cantidad').value - this.total;

    }

    /**
     * Modal para aceptar el págo.
     */
    modalAceptarPago() {
        //Valida formulario
        if (this.formAdminMovimiento.invalid) {
            this.validateAllFormFields(this.formAdminMovimiento);
            return;
        }

        //Validaciones perosnalizadas
        if (this.validacionesPersonalizadas()) {
            return;
        }

        // Se filtran las formas de pago compartidas entre todas las transacciones
        // Se agrega un contador de las veces que aparece una forma de pago en listaMovimientosFP
        // Las formas de pago que aparezcan el mismo numero de veces que el numero de transacciones son validas,
        // pues significa que todas las transacciones cuentan con esa forma de pago
        let contadorFP = {}; // Contador de las formas de pago
        this.listaFPCompartidas = [];

        // Se cuentan las veces que aparece una forma de pago
        this.listaMovimientosFP.forEach((mov: any) => {
            contadorFP[mov.fpagoid] = (contadorFP[mov.fpagoid] || 0) + 1;
        });

        // Se llena un arreglo solo con las formas de pago vaildas (compartidas entre transacciones)
        (<any>Object).entries(contadorFP).forEach(([key, value]) => {
            if (value == this.data.listaTransacciones.length) this.listaFPCompartidas.push(parseInt(key));
        });


        // Las formas de pago compartidas entre los movimientos son validas, el resto no
        // Si se escoge un tipo de pago que no comparten todas las transacciones, se envia un mensaje
        if (!this.listaFPCompartidas.includes(this.formAdminMovimiento.get('formaPago').value[0].fpagoid)) {

            let movConcat: any = '';
            let movDel: any = '';

            this.listaFPCompartidas.forEach((cp: any) => {
                this.listaFormasPago.forEach((fp: any) => {
                    if (cp === fp.fpagoid) {
                        movConcat = movConcat + fp.nombrefpago + ', ';
                    }
                })

            });

            movDel = movConcat.slice(0, -2);

            const dialogAlert = this.dialogConfirm.open(verificacionModalComponent, {
                data: {
                    titulo: "Alerta",
                    body: "Forma de pago no valida, solo se acepta (" + movDel + "). Realiza las transacciones de forma individual"
                }
            });

            //Cerrar ventana
            dialogAlert.afterClosed().subscribe(result => {
                if (result === 0) {//aceptar
                    this.dialog.close();
                }
            });

            return;
        }

        const dialogRef = this.dialogConfirm.open(verificacionModalComponent, {
            data: {
                titulo: "Confirmación.",
                body: "¿Desea realizar el movimiento?"
            }
        });

        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 0) {//aceptar
                if (this.data.listaTransacciones[0].cveMovimiento.trim() === '0006') {
                    this.ventaRecarga();
                } else if (this.data.listaTransacciones[0].cveMovimiento.trim() === '0005') {
                    this.ventaServicio();
                } else {
                    this.pagar();
                }

            }
        });

    }

    /**
     * Realiza el pago
     */
    pagar() {


        this.blockUI.start('Cargando datos...');

        ////////Evalua totales
        for (var i = 0; i < this.data.listaTransacciones.length; i++) {

            this.listaMovimientos[i] = [this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
            this.data.listaTransacciones[i].cveTipoMov,
            this.data.listaTransacciones[i].cveMovimiento,
            this.data.listaTransacciones[i].monto,
            this.data.listaTransacciones[i].cveCredito,
            this.data.listaTransacciones[i].cobrosID
            ]

        }


        const data = {
            "cveCliente": this.cveCliente,
            "usuario": this.vUsuarioId,
            "cveSucursal": this.vCveSucursal,
            "cveCaja": this.vCveCaja,
            "movimientos": this.listaMovimientos//[["01","001","AA","100"],["01","002","AA","70"]]
        };

        this.service.registrar(data, 'generaPago').subscribe(
            result => {
          
                this.blockUI.stop();
                console.log(result);
                this.service.showNotification('top', 'right', 2, result[0][1]);

                this.lblPoliza = result[0][4];


                //!!!!!!!!!!!!!!!!!!!!!!!!!!!CONTEMPLAR CONFIGURAR EN CAT. MOVIMIENTOS EN CAJA SI ENVIA SMS Y EMAIL.
                //el tipo de movimiento genera una operacion inusual o relevante
                for (let mov of this.listaMovimientos) {
                    if (mov[2] == "AA" || mov[2] == "00" || mov[2] == "CU" || mov[2] == "INV") {
                        this.spsFrecuenciaOperaciones();//Consulta la frecuencia de operaciones y montos
                    }
                }

                this.dialog.close(result);
                //Enviar notificaciones.
                if (this.listaEmisor.length > 0) this.enviaNotificacionSMS(); // Se manda llamar metodo para envio de sms
                if (this.listaEmisorCorreo.length > 0) this.EnvioNotiEmail(); // se manda llamar metodo para envio de email

            }, error => {

                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );

    }


    /**Indica si los moviminetos del mes han superado el perfil transaccional del cliente */
    spsFrecuenciaOperaciones() {
        this.service.getListByID(this.cveCliente, 'spsFrecunciaOperaciones').subscribe(
            frecuencia => {

                if (frecuencia[0][0] != "1") {//se rebaso el perfil transaccional
                    this.dialogConfirm.open(ModalPldComponent, {
                        data: {
                            titulo: "Frecuencia de operaciones",
                            perfil: '',
                            contenido: frecuencia[0][2] + '<br> <h4>Nota:</h4><h5>Se notifica al Oficial de Cumplimiento,<br> por correo.</h5>',
                            color: 'orange'
                        }
                    });
                    //envio de correo inusual 
                    let fecha = formatDate(new Date(), 'dd-MM-yyyy', 'en-US');
                    let cuerpoTbl = '';
                    for (let inu of frecuencia) {
                        cuerpoTbl += "<tr>" + "<td>" + this.cveCliente + inu[1] + "</td> <td>" + fecha + "</td>"
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

                        "receptores": [this.correoCli],
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
            "datos": [this.cveCliente],
            "accion": 1
        };
        this.service.getListByObjet(arreglo, 'spsOpRelevante').subscribe(rel => {
            if (!this.vacio(rel)) {
                let relev = JSON.parse(rel);

                this.dialogConfirm.open(ModalPldComponent, {
                    data: {
                        titulo: "Operación Relevante",
                        perfil: '',
                        contenido: 'Se ha superado el monto de $7500 dolar en pesos.' + '<br> <h4>Nota:</h4><h5>Se notifica al Oficial de Cumplimiento,<br> por correo.</h5>',
                        color: 'orange'
                    }
                });
                let fecha = formatDate(new Date(), 'dd-MM-yyyy', 'en-US');
                //se hace el correo de relevantes
                let cuerpoTbl = '';
                for (let rel of relev) {
                    cuerpoTbl += "<tr>" + "<td>" + rel.numero_cliente + " " + rel.nombres
                        + " " + rel.apellido_paterno + " " + rel.apellido_materno
                        + "</td> <td>" + fecha + "</td>   <td id=\"valor\">" + formatCurrency(rel.monto, 'en-US', getCurrencySymbol('MXN', 'wide'))
                        + "</td>" + "<td>" + rel.descripcion + "</td>" + "</tr>";
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
                    "receptores": [this.correoCli],
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
     * Funcion que obtiene los saldos posteriores a la apertura de la caja
     */
    spsSaldoCuenta() {

        /*
        let data: {};

        // 5. saldo de la caja al momento de la transaccion.
        data = {
            "accion": 5,
            "cveCaja": this.vCveCaja,
            "sesionId": 0
        }

        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(data, 'listaSaldoCajaMov').subscribe(result => {

            this.blockUI.stop();
            this.saldo = result[0].monto;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });*/

        let data: {};

        // 1. Saldos posteriores a apertura de caja. 2. Saldos posteriores por cuenta contable/poliza.
        // 3. Saldos anteriores. 4. Saldos anteriores por poliza

        data = {
            "accion": 1,
            "cveCaja": this.vCveCaja,
            "sesionId": this.data.cajas.sesionid
        }

        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(data, 'listaSaldoCajaMov').subscribe(result => {

            this.blockUI.stop();
            this.listaSaldosPg = result;

            // Calcula saldo totales
            for (let item of this.listaSaldosPg) {

                if (item.cveFormaPago === cFormaEfecti) {
                    this.saldo = this.saldo + item.monto;
                }

            }

            this.saldo = this.saldoInicialCajeroPg + this.saldo;

        }, error => {

            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    /**
     * Validaciones personalizadas
     */
    validacionesPersonalizadas() {

        let convierteTotal: number = 0.00;

        //Valida si la cantidad ingresada es menor al total
        if (this.formAdminMovimiento.controls['cantidad'].value < this.total && this.total > 0) {
            this.service.showNotification('top', 'right', 3, 'La cantidad ingresada es menor a la requerida. ');
            return true;
        }


        //Si el total es menor a cero es un retiro
        if (this.total < 0) {
            //Convierte el total positivo
            convierteTotal = (this.total * -1);

            if (this.saldo < convierteTotal) {
                this.service.showNotification('top', 'right', 3, 'La caja no cuenta con saldo suficiente para realizar la transacción. ');
                return true;
            }
        }

        return false;

    }



    /**
    * Carga datos de emisor para notificaciones SMS
    * @param  
    */
    spsDatosEmisor() {

        this.isLoadingResults = true;
        this.isResultado = false;
        let cveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

        const path = cNotiSocio + "/" + cveSucursal;

        this.service.getListByArregloIDs(path, 'spsSMSByCves').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;

                this.listaEmisor = data;

                this.isLoadingResults = false;

            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }

    //Metodo para enviar notificacion SMS
    enviaNotificacionSMS() {
        let tipomov: string;
        let monto: number;

        for (let mov of this.listaMovimientos) {
            let ve = mov[1];

            if (ve == cDeposito) {
                tipomov = 'Deposito'
                monto = this.totalDep;
            }

            if (ve == cRetiro) {
                tipomov = 'Retiro'
                monto = this.totalRet;
            }

            let fecha = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');

            let mensajeSMS = 'Estimado(a) ' + this.nomCliente + ' ha realizado un ' + tipomov + ' de $' + monto + ' el día ' + fecha;
            const data = {
                "emisor": {
                    "smsID": 0,
                    "cveSms": this.listaEmisor[0].cveSms,
                    "numero": this.listaEmisor[0].numero,
                    "lada": this.listaEmisor[0].lada,
                    "usuario": this.encripta.desencriptar(this.listaEmisor[0].usuario),
                    "contrasenia": this.encripta.desencriptar(this.listaEmisor[0].contrasenia),
                    "servidor": this.listaEmisor[0].servidor,
                    "puerto": this.listaEmisor[0].puerto,
                    "tipoNotificacionId": "",
                    "estatus": true,
                    "notificaciones": "",
                    "sucursales": ""
                },
                "receptor": [this.numeroLada],
                "mensaje": mensajeSMS,
            }

            this.service.registrar(data, 'enviaSMS').subscribe();

        }

    }


    /**
      * Carga datos de emisor de correo
      * @param  
      */
    spsDatosCorreo() {

        this.isLoadingResults = true;
        this.isResultado = false;
        let cveSucursal = this.servicePermisos.sucursalSeleccionada.cveSucursal;

        const path = cNotiSocio + "/" + cveSucursal;

        this.service.getListByArregloIDs(path, 'spsCorreosBYCves').subscribe(
            (data: any) => {

                this.isResultado = data.length === 0;

                this.listaEmisorCorreo = data;

                this.isLoadingResults = false;

            }, error => {
                this.isLoadingResults = false;
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }

    //Metodo para enviar notificacion EMAIL
    EnvioNotiEmail() {
        let tipomov: string;
        let monto: number;

        for (let mov of this.listaMovimientos) {
            let ve = mov[1];

            if (ve == cDeposito) {
                tipomov = 'Deposito'
                monto = this.totalDep;
            }

            if (ve == cRetiro) {
                tipomov = 'Retiro'
                monto = this.totalRet;
            }

            let fecha = formatDate(new Date(), 'yyyy-MM-dd HH:mm:ss', 'en-US');

            let notiEmail = 'Estimado(a) ' + this.nomCliente + ' ha realizado un ' + tipomov + ' de $' + monto + ' el día ' + fecha;

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

                "receptores": [this.correoCli],
                "asunto": 'Notificacion LKS CORE',
                "cuerpoMensaje": notiEmail,
            }

            this.service.registrar(data, 'enviarCorreo').subscribe();

        }

    }


    /**
     * Metodo que consulta las Formas de Pago del Movimiento Cajas
     */
    spsFPagoMovCaja(elemento: any) {
        this.blockUI.start('Cargando datos...');
        let path = elemento.cveMovimiento + '/' + 1;


        let contcat: any;

        this.service.getListByID(path, 'listaFormaPagoMovCaja').subscribe(data => {
            this.blockUI.stop();

            data.forEach((element: any) => {
                contcat = { ...element, ...elemento };
                this.listaMovimientosFP.push(contcat);
            });

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }




    ventaRecarga() {

        let jsonLogin = {
            "cadena": 5000,
            "establecimiento": 11678,
            "terminal": 32424,
            "cajero": 39326,
            "clave": "F#(/G0@dwZ",
            //"cajero": this.data.listaTransacciones[0].servicio.recarga.usuario,
            //"clave": this.data.listaTransacciones[0].servicio.recarga.contrasenia
        };


        this.blockUI.start('Procesando petición...');

        this.service.registrar(jsonLogin, 'loginMTC').subscribe(respLogin => {
            this.blockUI.stop();
            if (respLogin.codigoRespuesta === 0) {

                let jsonReqUno = {
                    "datos": {
                        "telefono": this.data.listaTransacciones[0].servicio.recarga.numero,
                        "sku": this.data.listaTransacciones[0].servicio.recarga.montoRecarga.codigo,
                        "cve_estado": this.data.listaTransacciones[0].servicio.recarga.estado.cve_inegi,
                        "monto": this.data.listaTransacciones[0].servicio.recarga.montoRecarga.monto,
                        "forma_pago": this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
                        "cve_sucursal": this.vCveSucursal,
                        "cve_caja": this.vCveCaja,
                        "cve_origen": environment.generales.origenMov,
                        "usuario": this.vUsuarioId,
                        "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim()

                    },
                    "accion": 1
                }
                this.blockUI.start('Procesando petición...');
                this.service.registrar(jsonReqUno, 'bitacoraMTC').subscribe(respBitUno => {
                    this.blockUI.stop();
                    if (respBitUno.codigo === 0) {

                        let jsonVTAE = {
                            "token": respLogin.token,
                            "tokenType": respLogin.token_type,
                            "tae": {
                                "telefono": this.data.listaTransacciones[0].servicio.recarga.numero,
                                "sku": this.data.listaTransacciones[0].servicio.recarga.montoRecarga.codigo,
                                "no_transaccion": respBitUno.no_transaccion,
                                "fecha_hora": respBitUno.fecha_hora,
                                "cve_estado": this.data.listaTransacciones[0].servicio.recarga.estado.cve_inegi
                            },
                            "movimiento": ""
                        }

                        // Timeout de 60 segundos
                        const timeoutIdTAE = setTimeout(() => {
                            this.reversoTAE(respLogin,jsonReqUno ,respBitUno);
                        }, 70000);
                        this.blockUI.start('Procesando petición...');
                        this.service.registrar(jsonVTAE, 'vtae').subscribe(respVTAE => {
                            this.blockUI.stop();
                            clearTimeout(timeoutIdTAE);
                            if (respVTAE.codigo_respuesta === 0) {
                                //this.pagar();
                                ////////Evalua totales
                                for (var i = 0; i < this.data.listaTransacciones.length; i++) {

                                    this.listaMovimientos[i] = [this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
                                    this.data.listaTransacciones[i].cveTipoMov,
                                    this.data.listaTransacciones[i].cveMovimiento,
                                    this.data.listaTransacciones[i].monto,
                                    this.data.listaTransacciones[i].cveCredito,
                                    this.data.listaTransacciones[i].cobrosID
                                    ]

                                }


                                const data = {
                                    "cveCliente": this.cveCliente,
                                    "usuario": this.vUsuarioId,
                                    "cveSucursal": this.vCveSucursal,
                                    "cveCaja": this.vCveCaja,
                                    "movimientos": this.listaMovimientos//[["01","001","AA","100"],["01","002","AA","70"]]
                                };
                                this.blockUI.start('Procesando petición...');
                                this.service.registrar(data, 'generaPago').subscribe(
                                    result => {
                                   
                                        this.blockUI.stop();

                                        this.service.showNotification('top', 'right', 2, result[0][1]);

                                        let lblPoliza = result[0][4];

                                        let jsonReqDos = {
                                            "datos": {
                                                "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                                "no_transaccion": respBitUno.no_transaccion,
                                                "codigo_respuesta": respVTAE.codigo_respuesta,
                                                "descripcion_respuesta": respVTAE.descripcion_respuesta,
                                                "no_autorizacion": respVTAE.no_autorizacion,
                                                "instruccion1": respVTAE.instruccion1,
                                                "instruccion2": respVTAE.instruccion2,
                                                "fecha_hora_solicitud": respVTAE.fecha_hora_solicitud,
                                                "fecha_hora_respuesta": respVTAE.fecha_hora_respuesta,
                                                "country_code": respVTAE.country_code,
                                                "mobile_country_code": respVTAE.mobile_country_code,
                                                "ref_movimiento": lblPoliza
                                            },
                                            "accion": 2
                                        };
                                        this.blockUI.start('Procesando petición...');
                                        this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe(respBitDos => {
                                            this.blockUI.stop();
                                            if (respBitDos.codigo !== 0) {
                                                //Reverso
                                            }

                                        }, error => {
                                            this.blockUI.stop();
                                            this.service.showNotification('top', 'right', 4, error.Message);
                                        });
                                        this.dialog.close(result);

                                    }, error => {

                                        this.blockUI.stop();
                                        this.service.showNotification('top', 'right', 4, error.Message);
                                    }
                                );



                            } else {

                                if (respVTAE.codigo_respuesta === 71 || respVTAE.codigo_respuesta === -600) {

                                    let compania = this.data.listaTransacciones[0].servicio.recarga.compania.compania;
                                   
                                    if (compania === 'TELCEL TAE' || compania === 'TELCEL INTERNET' || compania === 'TELCEL AMIGO SIN LÍMITE') {
                                        // Código a ejecutar si el valor de "compania" coincide con uno de los valores del arreglo
                                        let jsonReqDos = {
                                            "datos": {
                                                "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                                "no_transaccion": respBitUno.no_transaccion,
                                                "codigo_respuesta": respVTAE.codigo_respuesta,
                                                "descripcion_respuesta": respVTAE.descripcion_respuesta,
                                                "no_autorizacion": respVTAE.no_autorizacion,
                                                "instruccion1": respVTAE.instruccion1,
                                                "instruccion2": respVTAE.instruccion2,
                                                "fecha_hora_solicitud": respVTAE.fecha_hora_solicitud,
                                                "fecha_hora_respuesta": respVTAE.fecha_hora_respuesta,
                                                "country_code": respVTAE.country_code,
                                                "mobile_country_code": respVTAE.mobile_country_code,
                                                "ref_movimiento": ''
                                            },
                                            "accion": 2
                                        };
                                        this.blockUI.start('Procesando petición...');
                                        this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe();
                                        this.blockUI.stop();
                                        //Ejecutar reverso
                                        this.service.showNotification('top', 'right', 3, respVTAE.descripcion_respuesta);
                                        this.dialog.close();
                                        return;
                                    }

                                    this.reversoTAE(respLogin,jsonReqUno,respBitUno);

                                } else {

                                    let jsonReqDos = {
                                        "datos": {
                                            "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                            "no_transaccion": respBitUno.no_transaccion,
                                            "codigo_respuesta": respVTAE.codigo_respuesta,
                                            "descripcion_respuesta": respVTAE.descripcion_respuesta,
                                            "no_autorizacion": respVTAE.no_autorizacion,
                                            "instruccion1": respVTAE.instruccion1,
                                            "instruccion2": respVTAE.instruccion2,
                                            "fecha_hora_solicitud": respVTAE.fecha_hora_solicitud,
                                            "fecha_hora_respuesta": respVTAE.fecha_hora_respuesta,
                                            "country_code": respVTAE.country_code,
                                            "mobile_country_code": respVTAE.mobile_country_code,
                                            "ref_movimiento": ''
                                        },
                                        "accion": 2
                                    };
                                    this.blockUI.start('Procesando petición...');
                                    this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe();
                                    this.blockUI.stop();
                                    //Ejecutar reverso
                                    this.service.showNotification('top', 'right', 3, respVTAE.descripcion_respuesta);
                                    this.dialog.close();
                                }

                            }

                        }, error => {
                            this.blockUI.stop();
                            this.service.showNotification('top', 'right', 4, error.Message);
                        });



                    } else {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 3, respBitUno.mensaje);
                    }

                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.Message);
                });


            } else {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, respLogin.mensajeRespuesta);
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


    }

    reversoTAE(respLogin: any, jsonReqUno: any, respBitUno: any) {


        this.blockUI.start('Procesando petición...');
        this.service.registrar(jsonReqUno, 'bitacoraMTC').subscribe(respBitREUno => {
            this.blockUI.stop();

            if (respBitREUno.codigo !== 0) {
                this.service.showNotification('top', 'right', 3, respBitREUno.mensaje);
                this.dialog.close();
                return
            }

            let jsonReversoTae = {
                "token": respLogin.token,
                "tokenType": respLogin.token_type,
                "reversoTAE": {
                    "telefono": jsonReqUno.datos.telefono,
                    "sku": jsonReqUno.datos.sku,
                    "no_transaccion_recarga": respBitUno.no_transaccion,
                    "fecha_hora_recarga": respBitUno.fecha_hora,
                    "no_transaccion": respBitREUno.no_transaccion,
                    "fecha_hora": respBitREUno.fecha_hora
                }
            }

            this.blockUI.start('Procesando petición...');
            this.service.registrar(jsonReversoTae, 'reversoTAE').subscribe(respREUno => {
                this.blockUI.stop();

                if (respREUno.codigo_respuesta !== 0) {
                    this.service.showNotification('top', 'right', 3, respREUno.descripcion_respuesta);

                    let jsonReqDos = {
                        "datos": {
                            "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                            "no_transaccion": respREUno.no_transaccion,
                            "codigo_respuesta": respREUno.codigo_respuesta,
                            "descripcion_respuesta": respREUno.descripcion_respuesta,
                            "no_autorizacion": respREUno.no_autorizacion,
                            "instruccion1": respREUno.instruccion1,
                            "instruccion2": respREUno.instruccion2,
                            "fecha_hora_solicitud": respREUno.fecha_hora_solicitud,
                            "fecha_hora_respuesta": respREUno.fecha_hora_respuesta,
                            "country_code": '',
                            "mobile_country_code": '',
                            "ref_movimiento": ''
                        },
                        "accion": 2
                    };
                    this.blockUI.start('Procesando petición...');
                    this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe();
                    this.dialog.close();
                    return
                }

                /**
                 {
    "telefono": "4181298125",
    "sku": "SL500",
    "no_transaccion": 1,
    "fecha_hora": "10/04/2023 13:33:55",
    "codigo_respuesta": 25,
    "descripcion_respuesta": "Recarga no realizada",
    "no_autorizacion": 0,
    "instruccion1": "",
    "instruccion2": "",
    "fecha_hora_solicitud": "",
    "fecha_hora_respuesta": ""
}
                 */

                ////////Evalua totales
                for (var i = 0; i < this.data.listaTransacciones.length; i++) {

                    this.listaMovimientos[i] = [this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
                    this.data.listaTransacciones[i].cveTipoMov,
                    this.data.listaTransacciones[i].cveMovimiento,
                    this.data.listaTransacciones[i].monto,
                    this.data.listaTransacciones[i].cveCredito,
                    this.data.listaTransacciones[i].cobrosID
                    ]

                }


                const data = {
                    "cveCliente": this.cveCliente,
                    "usuario": this.vUsuarioId,
                    "cveSucursal": this.vCveSucursal,
                    "cveCaja": this.vCveCaja,
                    "movimientos": this.listaMovimientos//[["01","001","AA","100"],["01","002","AA","70"]]
                };
                this.blockUI.start('Procesando petición...');
                this.service.registrar(data, 'generaPago').subscribe(result => {
              
                        this.blockUI.stop();

                        this.service.showNotification('top', 'right', 2, result[0][1]);

                        let lblPoliza = result[0][4];

                        let jsonReqDos = {
                            "datos": {
                                "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                "no_transaccion": respBitUno.no_transaccion,
                                "codigo_respuesta": respREUno.codigo_respuesta,
                                "descripcion_respuesta": respREUno.descripcion_respuesta,
                                "no_autorizacion": respREUno.no_autorizacion,
                                "instruccion1": respREUno.instruccion1,
                                "instruccion2": respREUno.instruccion2,
                                "fecha_hora_solicitud": respREUno.fecha_hora_solicitud,
                                "fecha_hora_respuesta": respREUno.fecha_hora_respuesta,
                                "country_code": '',
                                "mobile_country_code": '',
                                "ref_movimiento": lblPoliza
                            },
                            "accion": 2
                        };
                        this.blockUI.start('Procesando petición...');
                        this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe();
                        this.blockUI.stop();
                        this.dialog.close(result);

                    }, error => {

                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message);
                    }
                );


            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });




    }



    /************************************************************************************************
     *              GESTION DE VENTA DE SERVICIOS
     ************************************************************************************************/

    ventaServicio(): any {
        let jsonLogin = {
            "cadena": 5000,
            "establecimiento": 11678,
            "terminal": 32424,
            "cajero": 39326,
            "clave": "F#(/G0@dwZ",
            //"cajero": this.data.listaTransacciones[0].servicio.recarga.usuario,
            //"clave": this.data.listaTransacciones[0].servicio.recarga.contrasenia
        };

        //let respLogin = this.loginMTC(jsonLogin);
        //console.log('respLogin', respLogin);

        this.blockUI.start('Procesando petición...');

        this.service.registrar(jsonLogin, 'loginMTC').subscribe(respLogin => {
            this.blockUI.stop();
            if (respLogin.codigoRespuesta === 0) {

                let jsonReqUno =
                {
                    "datos": {
                        "referencia1": this.data.listaTransacciones[0].servicio.servicio.referencia,
                        "referencia2": this.data.listaTransacciones[0].servicio.servicio.digitoVerif,
                        "sku": this.data.listaTransacciones[0].servicio.servicio.servicio.codigo,
                        "monto": this.data.listaTransacciones[0].servicio.servicio.monto,
                        "forma_pago": this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
                        "cve_sucursal": this.vCveSucursal,
                        "cve_caja": this.vCveCaja,
                        "cve_origen": environment.generales.origenMov,
                        "usuario": this.vUsuarioId,
                        "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim()
                    },
                    "accion": 1
                }
                this.blockUI.start('Procesando petición...');
                this.service.registrar(jsonReqUno, 'bitacoraMTC').subscribe(respBitUno => {
                    this.blockUI.stop();
                    if (respBitUno.codigo === 0) {

                        let jsonVServicio = {
                            "token": respLogin.token,
                            "tokenType": respLogin.token_type,
                            "servicio": {
                                "referencia1": this.data.listaTransacciones[0].servicio.servicio.referencia,
                                "referencia2": this.data.listaTransacciones[0].servicio.servicio.digitoVerif,
                                "sku": this.data.listaTransacciones[0].servicio.servicio.servicio.codigo,
                                "no_transaccion": respBitUno.no_transaccion,
                                "fecha_hora": respBitUno.fecha_hora,
                                "monto": this.data.listaTransacciones[0].servicio.servicio.monto
                            }
                        }
                        // Timeout de 60 segundos
                        const timeoutId = setTimeout(() => {
                            this.reversoServicio(respLogin, respBitUno);
                        }, 70000);
                        this.blockUI.start('Procesando petición...');
                        this.service.registrar(jsonVServicio, 'vservicio').subscribe(respVSer => {
                            this.blockUI.stop();
                            // Detener el timeout antes de tiempo
                            clearTimeout(timeoutId);
                            if (respVSer.codigo_respuesta === 0) {
                                //this.pagar();

                                this.blockUI.start('Procesando petición...');

                                ////////Evalua totales
                                for (var i = 0; i < this.data.listaTransacciones.length; i++) {

                                    this.listaMovimientos[i] = [this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
                                    this.data.listaTransacciones[i].cveTipoMov,
                                    this.data.listaTransacciones[i].cveMovimiento,
                                    this.data.listaTransacciones[i].monto,
                                    this.data.listaTransacciones[i].cveCredito,
                                    this.data.listaTransacciones[i].cobrosID
                                    ]

                                }


                                const data = {
                                    "cveCliente": this.cveCliente,
                                    "usuario": this.vUsuarioId,
                                    "cveSucursal": this.vCveSucursal,
                                    "cveCaja": this.vCveCaja,
                                    "movimientos": this.listaMovimientos//[["01","001","AA","100"],["01","002","AA","70"]]
                                };

                                this.service.registrar(data, 'generaPago').subscribe(
                                    result => {
                                  
                                        this.blockUI.stop();

                                        this.service.showNotification('top', 'right', 2, result[0][1]);

                                        let lblPoliza = result[0][4];

                                        let jsonReqDos =
                                        {
                                            "datos": {
                                                "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                                "no_transaccion": respBitUno.no_transaccion,
                                                "codigo_respuesta": respVSer.codigo_respuesta,
                                                "descripcion_respuesta": respVSer.descripcion_respuesta,
                                                "no_autorizacion": respVSer.no_autorizacion,
                                                "instruccion1": respVSer.instruccion1,
                                                "instruccion2": respVSer.instruccion2,
                                                "fecha_hora_solicitud": respVSer.fecha_hora_solicitud,
                                                "fecha_hora_respuesta": respVSer.fecha_hora_respuesta,
                                                "ref_movimiento": lblPoliza
                                            },
                                            "accion": 2
                                        };

                                        this.blockUI.start('Procesando petición...');
                                        this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe(respBitDos => {
                                            this.blockUI.stop();
                                            if (respBitDos.codigo !== 0) {
                                                //Reverso
                                            }

                                        }, error => {
                                            this.blockUI.stop();
                                            this.service.showNotification('top', 'right', 4, error.Message);
                                        });

                                        this.dialog.close(result);

                                    }, error => {

                                        this.blockUI.stop();
                                        this.service.showNotification('top', 'right', 4, error.Message);
                                    }
                                );


                            } else {

                                if (respVSer.codigo_respuesta === 71 || respVSer.codigo_respuesta === -600) {

                                    this.reversoServicio(respLogin, respBitUno);

                                } else {

                                    let jsonReqDos =
                                    {
                                        "datos": {
                                            "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                            "no_transaccion": respBitUno.no_transaccion,
                                            "codigo_respuesta": respVSer.codigo_respuesta,
                                            "descripcion_respuesta": respVSer.descripcion_respuesta,
                                            "no_autorizacion": respVSer.no_autorizacion,
                                            "instruccion1": respVSer.instruccion1,
                                            "instruccion2": respVSer.instruccion2,
                                            "fecha_hora_solicitud": respVSer.fecha_hora_solicitud,
                                            "fecha_hora_respuesta": respVSer.fecha_hora_respuesta,
                                            "ref_movimiento": "NA"
                                        },
                                        "accion": 2
                                    };

                                    this.blockUI.start('Procesando petición...');
                                    this.service.registrar(jsonReqDos, 'bitacoraMTC').subscribe(respBitDos => {
                                        this.blockUI.stop();
                                        this.service.showNotification('top', 'right', 3, respVSer.descripcion_respuesta);
                                        this.dialog.close();
                                        return;
                                    }, error => {
                                        this.blockUI.stop();
                                        this.service.showNotification('top', 'right', 4, error.Message);
                                    });

                                    this.blockUI.stop();
                                    //Ejecutar reverso
                                    this.service.showNotification('top', 'right', 3, respVSer.descripcion_respuesta);
                                }
                            }

                        }, error => {
                            this.blockUI.stop();
                            this.service.showNotification('top', 'right', 4, error.Message);
                        });

                    } else {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 3, respBitUno.mensaje);
                    }
                }, error => {
                    this.blockUI.stop();
                    this.service.showNotification('top', 'right', 4, error.Message);
                });
            } else {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 3, respLogin.mensajeRespuesta);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    reversoServicio(respLogin: any, respBitUno: any) {
        let jsonVReverso = {
            "token": respLogin.token,
            "tokenType": respLogin.token_type,
            "reverso": {
                "referencia1": this.data.listaTransacciones[0].servicio.servicio.referencia,
                "sku": this.data.listaTransacciones[0].servicio.servicio.servicio.codigo,
                "no_transaccion": respBitUno.no_transaccion,
                "fecha_hora": respBitUno.fecha_hora
            }
        }
        this.blockUI.start('Procesando petición...');
        this.service.registrar(jsonVReverso, 'reversoServicio').subscribe(respRevSer => {
            this.blockUI.stop();
            if (respRevSer.codigo_respuesta === 0) {

                this.blockUI.start('Procesando petición...');

                ////////Evalua totales
                for (var i = 0; i < this.data.listaTransacciones.length; i++) {

                    this.listaMovimientos[i] = [this.formAdminMovimiento.get('formaPago').value[0].cvefpago,
                    this.data.listaTransacciones[i].cveTipoMov,
                    this.data.listaTransacciones[i].cveMovimiento,
                    this.data.listaTransacciones[i].monto,
                    this.data.listaTransacciones[i].cveCredito,
                    this.data.listaTransacciones[i].cobrosID
                    ]

                }


                const data = {
                    "cveCliente": this.cveCliente,
                    "usuario": this.vUsuarioId,
                    "cveSucursal": this.vCveSucursal,
                    "cveCaja": this.vCveCaja,
                    "movimientos": this.listaMovimientos//[["01","001","AA","100"],["01","002","AA","70"]]
                };

                this.service.registrar(data, 'generaPago').subscribe(
                    result => {
                       
                        this.blockUI.stop();

                        this.service.showNotification('top', 'right', 2, result[0][1]);

                        let lblPolizas = result[0][4];

                        let jsonReqDosReve =
                        {
                            "datos": {
                                "cve_movimiento": this.data.listaTransacciones[0].cveMovimiento.trim(),
                                "no_transaccion": respBitUno.no_transaccion,
                                "codigo_respuesta": respRevSer.codigo_respuesta,
                                "descripcion_respuesta": respRevSer.descripcion_respuesta,
                                "no_autorizacion": respRevSer.no_autorizacion,
                                "instruccion1": respRevSer.instruccion1,
                                "instruccion2": respRevSer.instruccion2,
                                "fecha_hora_solicitud": respRevSer.fecha_hora_solicitud,
                                "fecha_hora_respuesta": respRevSer.fecha_hora_respuesta,
                                "ref_movimiento": lblPolizas
                            },
                            "accion": 2
                        };

                        this.blockUI.start('Procesando petición...');
                        this.service.registrar(jsonReqDosReve, 'bitacoraMTC').subscribe(respBitDos => {
                            this.blockUI.stop();
                        }, error => {
                            this.blockUI.stop();
                            this.service.showNotification('top', 'right', 4, error.Message);
                        });

                        this.dialog.close(result);

                    }, error => {

                        this.blockUI.stop();
                        this.service.showNotification('top', 'right', 4, error.Message);
                    }
                );


            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /************************************************************************************************
     *              FIN GESTION DE VENTA DE SERVICIOS
     ************************************************************************************************/

    /** 
     * Validaciones de los campos del formulario.
     * Se crean los mensajes de validación.
     */
    validaciones = {
        'formaPago': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'El movimiento no pertenece a la lista, elija otro movimiento.' }
        ],
        'cantidad': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Campo solo números enteros o decimales.' },
            { type: 'saldoInsuficiente', message: 'La caja no cuenta con saldo suficiente para realizar la transacción. ' },
            { type: 'faltaPago', message: 'La cantidad ingresada es menor a la requerida. ' }
        ]
    };


}


