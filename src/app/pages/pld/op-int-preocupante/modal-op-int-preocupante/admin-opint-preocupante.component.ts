
import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BuscarClientesComponent } from "../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { globales } from "../../../../../environments/globales.config";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatTableDataSource } from "@angular/material/table";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { EncryptDataService } from "../../../../shared/service/encryptdata";


/**
 * @autor: Fatima Bolaños Duran
 * version: 1.0.
 * @fecha: 12/05/2022
 * @description: Componente para la gestion de medios de Operaciones internas preocupantes
 * 
 */
@Component({
    selector: 'admin-opint-preocupante',
    moduleId: module.id,
    templateUrl: 'admin-opint-preocupante.component.html',
})


export class AdminOpintPreocupanteComponent implements OnInit {

    dataSourceUsuario: MatTableDataSource<any>;
    listaSocios: any = [];
    @BlockUI() blockUI: NgBlockUI;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    // Declaraciones de variables y componentes

    titulo: string;
    accion: number;
    opintpreocupanteID: number = 0;
    disabled = false;

    formOpintpreocupante: UntypedFormGroup;
    // variables de usuario
    formUsuarios: UntypedFormGroup;
    opcionesUsuarios: Observable<string[]>;
    listaUsuarios: any[] = [];
    showUSuarios: boolean = true;

    // variables denunciate
    opcionesDenunciante: Observable<string[]>;
    anonimo = new UntypedFormControl(false);
    showanonimo = true;

    // variables  de cliente
    selectedItems: string[];
    showCliente: boolean = true;
    idCliente: number = 0;


    // Variables para hoy tener la fecha de envio de notificacion
    today = new Date();
    fechaIn = new UntypedFormControl(this.today);

    listaEmisorCorreo: any = [];

    lblNombre = "";

    /**
     * Constructor  de la clase Admin interface
     * @param data  --Recibe los datos  del padre
     * @param service  -- Instancia de acceso a datos
     * @param formBuilder  -- Instancia  de construcion de formulario
     * @param encripta  -- Service para la encriptacion de datos
     * 
     * @param dialog -Servicio para la gestion  
     */
    constructor(
        public dialogRef: MatDialogRef<AdminOpintPreocupanteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService, public dialog: MatDialog,
        private formBuilder: UntypedFormBuilder,
        private encripta: EncryptDataService,
        private session: PermisosService
    ) {

        this.titulo = data.titulo;
        this.accion = data.accion;

        this.formOpintpreocupante = this.formBuilder.group({
            opintpreocupanteid: new UntypedFormControl(''),
            cliente: new UntypedFormControl(''),
            sucursal: new UntypedFormControl(''),
            usuario: new UntypedFormControl(''),
            descripcion: new UntypedFormControl('', [Validators.required]),
            denunciante: new UntypedFormControl('', [Validators.required]),
            fecha: new UntypedFormControl(''),
            motivo: new UntypedFormControl('')

        });

        if (this.accion === 2) {

            this.formOpintpreocupante.get('motivo').setValidators([Validators.required]);
            this.formOpintpreocupante.get('motivo').updateValueAndValidity();
            this.opintpreocupanteID = data.datos.opintpreocupanteid;
            let infoamcionCl = JSON.parse(data.datos.cliente);
            if (!this.vacio(infoamcionCl.cliente_id)) {
                this.idCliente = infoamcionCl.cliente_id;
                this.formOpintpreocupante.get('cliente').setValue(infoamcionCl.nombre);
                this.lblNombre = infoamcionCl.nombre;
                //cajas de texto de cliente e usuario
                this.showCliente = false;
                this.showUSuarios = true;
                // validaciones de cliente e usuario
                this.formOpintpreocupante.get('cliente').setValidators([Validators.required]);
                this.formOpintpreocupante.get('cliente').updateValueAndValidity();
                this.formOpintpreocupante.get('usuario').setValidators([]);
                this.formOpintpreocupante.get('usuario').updateValueAndValidity();
            } else {
                this.showCliente = true;
                this.showUSuarios = false;
                this.formOpintpreocupante.get('usuario').setValidators([Validators.required]);
                this.formOpintpreocupante.get('usuario').updateValueAndValidity();
                this.formOpintpreocupante.get('cliente').setValidators([]);
                this.formOpintpreocupante.get('cliente').updateValueAndValidity();

            }
            this.formOpintpreocupante.get('sucursal').setValue(data.datos.sucursal);
            this.formOpintpreocupante.get('descripcion').setValue(data.datos.descripcion);
        }

    }

    /**
     * Metodo tipo CRUD para gurdar y editar las opereciones internas preocupantes 
     */
    crearOpintpreocupantes() {

        if (this.formOpintpreocupante.invalid) {
            this.validateAllFormFields(this.formOpintpreocupante);
            return;
        }
        let denunciante = null;
        if (this.anonimo.value === false) {
            denunciante = this.formOpintpreocupante.get('denunciante').value.id;
        }
        if (this.accion == 1) {
            this.blockUI.start('Guardando ...');
        } else {
            this.blockUI.start('Editando...')
        }

        let data = {};
        let usuarioId = null;
        if (!this.vacio(this.formOpintpreocupante.get('usuario').value)) {
            usuarioId = this.formOpintpreocupante.get('usuario').value.id;
        }

        if (this.showUSuarios === false) {
            this.idCliente = null;
        }

        data = {
            "datos": [
                this.opintpreocupanteID,
                this.idCliente,
                this.session.sucursalSeleccionada.sucursalid,
                usuarioId,
                this.formOpintpreocupante.get('descripcion').value,
                denunciante,
                this.formOpintpreocupante.get('fecha').value
            ],
            "accion": this.accion

        };



        this.service.registrar(data, 'crudOpIntPreocupante').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.enviarNotificacion(result[0][2]);
                    if (this.accion !== 1) {
                        this.formOpintpreocupante.reset();
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'left', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );

    }

    /**
     * Metodo que envia notificasion de opreciones internas preocupantes
     */
    enviarNotificacion(fecha: string) {

        /// validaciones de los daatos para la tabla de html en operaciones internas preocupantes
        let v_usuario = this.vacio(this.formOpintpreocupante.get('usuario').value) ? "" : (this.formOpintpreocupante.get('usuario').value.firstName + ' ' + this.formOpintpreocupante.get('usuario').value.lastName);
        let v_denunciante = this.vacio(this.formOpintpreocupante.get('denunciante').value) ? "" : (this.formOpintpreocupante.get('denunciante').value.firstName + ' ' + this.formOpintpreocupante.get('denunciante').value.lastName);
        let motivo = this.accion === 2 ? "<td>" + this.formOpintpreocupante.get('motivo').value + "</td>" : "";
        let detMotivo = this.accion === 2 ? "<th>Motivo de modificacion</th>" : "";

        /// let  muestra los datos que se van amostrar en la tabla para la notificaion de operaciones preocupantes
        let datosHTLML = '<td>' + this.lblNombre + '</td>' + '<td>' + this.session.sucursalSeleccionada.nombreSucursal + '</td><td>' + v_usuario + '</td><td>' + this.formOpintpreocupante.get('descripcion').value + '</td><td>' + v_denunciante + '</td><td>' + fecha + '</td>' + motivo;
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
            "receptores": [globales.receptorPLD],
            "asunto": 'OPERACIONES INTERNAS PREOCUPANTES',
            "cuerpoMensaje":
                "<head>" + "    <style>" + "        table {"
                + "          font-family: Arial, Helvetica, sans-serif;" + "          border-collapse: collapse;"
                + "          margin-left: auto;" + "          margin-right: auto;" + "}" + "        td, th {"
                + "          padding: 1em;" + "}" + "        "
                + "        tr:nth-child(even){background-color: #f2f2f2;}" + "        " + "        th {"
                + "          padding-top: 12px;" + "          padding-bottom: 12px;" + "          text-align: center;"
                + "          background-color: rgb(32, 101, 210);" + "          color: white;" + "        }"
                + "        #valor {" + "            color: rgb(220, 0, 0);" + "        }" + "        </style>"
                + "</head>" + "<body>" + "    <h1> ¡¡¡ OPERACIONES INTERNAS PREOCUPANTES!!! " + fecha + "</h1>" + "<table id=\"tabla\">" + "  <tr>"
                + "    <th>Cliente</th>" + "    <th>Sucursal</th>" + "    <th>Usuario</th>" + "    <th>Descripcion</th>" + "    <th>Denunciante</th>"
                + "    <th>Fecha</th>" + detMotivo
                + '</tr><tr>' + datosHTLML + '</tr></table></body>'

        }
        this.service.registrar(data, 'enviarCorreoHTML').subscribe();

    }


    /**
      * Carga datos de emisor de correo
      * @param  
      */
    spsDatosCorreo() {
        const path = globales.tipoNotificacionPld + "/" + globales.cveSucursal;
        this.service.getListByArregloIDs(path, 'spsCorreosBYCves').subscribe(
            (data: any) => {
                this.listaEmisorCorreo = data;
            }, error => {
                this.service.showNotification('top', 'right', 4, error.Message);
            });

    }


    /**
     * metodo OnInit de la clase Adminopintpreocpantes para iniciar los metodos
     */
    ngOnInit() {
        this.spsUsuarios();
        this.spsDatosCorreo();
    }


    /**Metodo para abrir ventana modal de clientes */
    modalClientes() {
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente',
                cliente: ''
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            if (result != 1) {
                this.idCliente = result.datosCl.cliente_id;
                if (result.tipoPersona == 'F') {

                    this.formOpintpreocupante.get('cliente').setValue(result.datosCl.numero_cliente.trim() + ' - ' + result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl);
                    this.lblNombre = result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl;
                } else {
                    //Moral
                    this.formOpintpreocupante.get('cliente').setValue(result.datosCl.numero_cliente.trim() + ' - ' + result.datosCl.razon_social);
                    this.lblNombre = result.datosCl.razon_social;
                }
            }
            if (result == 1) {
                this.formOpintpreocupante.get('cliente').setValue('');
            }

        });

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
       * Metodo que accede amandar la denuncia en anonimo
       */
    anonimoopint(event: any) {

        if (event === false) {
            this.showanonimo = true;
            // validaciones de denunciante
            this.formOpintpreocupante.get('denunciante').setValidators([Validators.required]);
            this.formOpintpreocupante.get('denunciante').updateValueAndValidity();
        } else {
            this.showanonimo = false;
            this.formOpintpreocupante.get('denunciante').setValidators([]);
            this.formOpintpreocupante.get('denunciante').updateValueAndValidity();
        }
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
     * Metodo que consulta los Usuarios
     */
    spsUsuarios() {
        this.blockUI.start('Cargando datos...');
        this.service.getList('crudUsuario').subscribe(data => {
            this.listaUsuarios = [];
            this.listaUsuarios = data;
            this.opcionesUsuarios = this.formOpintpreocupante.get('usuario').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))
            );

            this.opcionesDenunciante = this.formOpintpreocupante.get('denunciante').valueChanges.pipe(
                startWith(''),
                map(value => this._filter(value))

            );
            if (this.accion === 2) {

                let infoamcionCl = JSON.parse(this.data.datos.cliente);

                if (this.vacio(infoamcionCl.cliente_id)) {
                    let jsonUser = JSON.parse(this.data.datos.usuario);
                    let findUsuarios = this.listaUsuarios.find(u => u.id === jsonUser.user_id);
                    this.formOpintpreocupante.get('usuario').setValue(findUsuarios);
                }

                let jsonDen = JSON.parse(this.data.datos.denunciante);
                if (!this.vacio(jsonDen.denunciate_id)) {
                    let findDen = this.listaUsuarios.find(u => u.id === jsonDen.denunciate_id);
                    this.formOpintpreocupante.get('denunciante').setValue(findDen);
                    this.formOpintpreocupante.get('denunciante').setValidators([Validators.required]);
                    this.formOpintpreocupante.get('denunciante').updateValueAndValidity();

                } else {
                    this.anonimo.setValue(true);
                    this.showanonimo = false;
                }
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    private _filter(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaUsuarios.filter(option => option.username.toLowerCase().includes(filterValue));
    }

    /**
    * Muestra usuario
    * @param username --usuario seleccionado
    * @returns -- descripcion del usuario
    */
    displayUsuario(user: any): any {
        return user ? user.username + ' - ' + user.firstName + ' ' + user.lastName : undefined;
    }

    /**
     * Muestra el denunciate del usuario
     * @param firstName ---- denunciate selecionado
     * @returns -- descripcion del denunciate al usuario
     */
    displayDenunciate(denuciate: any): any {
        return denuciate ? denuciate.firstName + ' ' + denuciate.lastName : undefined;
    }

    /**
     * Metodo para habilitar componentes de busqueda
     * @param event - accion a realizar
     */
    showFiltro(event) {
        this.lblNombre = "";
        if (event === '1') {
            this.showCliente = false;
            this.showUSuarios = true;
            this.formOpintpreocupante.get('usuario').setValue(null);
            this.formOpintpreocupante.get('cliente').setValidators([Validators.required]);
            this.formOpintpreocupante.get('cliente').updateValueAndValidity();
            this.formOpintpreocupante.get('usuario').setValidators([]);
            this.formOpintpreocupante.get('usuario').updateValueAndValidity();
        } else {
            this.formOpintpreocupante.get('cliente').setValue(null);
            this.formOpintpreocupante.get('usuario').setValidators([Validators.required]);
            this.formOpintpreocupante.get('usuario').updateValueAndValidity();
            this.formOpintpreocupante.get('cliente').setValidators([]);
            this.formOpintpreocupante.get('cliente').updateValueAndValidity();
            this.showCliente = true;
            this.showUSuarios = false;
        }
    }

    /**
     * Validaciones de los datos de opreciones preocupantes 
     */
    validacionesOintPreocupantes = {
        'cliente': [
            { type: 'required', message: 'Cliente requerido.' },
            { type: 'invalidAutocompleteObject', message: '' }
        ],
        'usuario': [
            { type: 'required', message: 'Usuario requerido.' }
        ],
        'descripcion': [
            { type: 'required', message: 'Descripción requerida.' },
            { type: 'pattern', message: 'Campo solo letras.' }
        ],
        'denunciante': [
            { type: 'required', message: 'Denunciante requerido.' }
        ],
        'motivo': [
            { type: 'required', message: 'Motivo requerido.' }
        ]
    }
}


