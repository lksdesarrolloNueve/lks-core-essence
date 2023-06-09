import { Component, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatDialog } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, FormGroupDirective, NgForm, ValidationErrors, ValidatorFn, Validators } from "@angular/forms";
import { MatSelectionListChange } from "@angular/material/list";
import { verificacionModalComponent } from "../../../../pages/modales/verificacion-modal/verificacion-modal.component";
import { ErrorStateMatcher } from "@angular/material/core";
import { AdministracionRolesComponent } from "./modal-roles/admin-roles.component";
import { HttpHeaders } from "@angular/common/http";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import * as moment from "moment";
import { map, startWith } from "rxjs/operators";


@Component({
    selector: 'admin-usuarios',
    moduleId: module.id,
    templateUrl: 'admin-usuarios.component.html'
})

/**
 * @autor: Manuel Loza
 * @version: 1.0.0
 * @fecha: 19/11/2021
 * @descripcion: Componente para la gestion de Usuarios
 */
export class AdminUsuariosComponent implements OnInit {

    /**
     * Declaracion de variables y controles
     */
    @BlockUI() blockUI: NgBlockUI;
    filteredSucursales: Observable<string[]>;
    matcher = new MyErrorStateMatcher();

    estatus = new UntypedFormControl(false);
    aplicaCaducidad = new UntypedFormControl(false);

    // Creamos las columnas de la tabla
    displayedColumns: string[] = ['ipAddress', 'start', 'lastAccess', 'acciones']

    //Declaracion de Controles
    dataSourceSesiones: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    sucursales = new UntypedFormControl([]);
    listSucursales: any[];
    listaAgregaSucursales: any[] = [];
    listaUsuarios: any[] = [];
    listaRolesOriginal: any[] = [];
    listaRolesUsuario: any[];
    listaRoles: any[];
    listaRolesUsuario2: any[];
    nombreUsuario: any;
    formUsuarios: UntypedFormGroup;
    hide = true;
    hide2 = true;
    matchPassword: boolean;
    matrizSucursales: any[] = [];
    listaRolesSeleccionados: any[] = [];
    listaSesiones: any[] = [];

    allSelectedSuc: boolean;
    allSelectedRol: boolean;
    editar: boolean = false;
    rolNuevo: boolean = false;

//  lista de Permisos de usuarios a cuentas bancarias 

    opcionesCuentaBancoOri: Observable<string[]>;
    showPPrueba = false;
    formPermisosUsiarios: UntypedFormGroup;
    formFechas: UntypedFormGroup;
    listaCuentasBancarias: any = [];
    matrizCuentaBancaria: any = [];
    listaPermisosUsuariosAgregadas = [];


/**
 * Validaciones de permisos de Caducidad en cuentas , fechas de inicio y fin 
 */
    validacionesPeriodoPruebas = {
        'cuentaBancOri':[
            { type: 'required', message: 'Cuenta requerida.'},
            { type: 'invalidAutocompleteObject', message: 'La cuenta origen no pertenece a la lista, elija otra cuenta.'}

        ],
        'fechainicio': [
            { type: 'matStartDateInvalid', message: 'Fecha incio erronea.' },
            { type: 'required', message: 'Fecha inicial requerida.' }
        ],
        'fechadetermino': [
            { type: 'matEndDateInvalid', message: 'Fecha final erronea.' },
            { type: 'required', message: 'Fecha final requerida.' }
        ]
    };

    /**
     * 
     *Validaciones de permisos de cuenta 
     */





    /**
     * Constructor de la clase AdminUsuariosComponent
     * @param service  service para el acceso a datos
     */
    constructor(private service: GestionGenericaService, private fomrBuilder: UntypedFormBuilder, public dialog: MatDialog) {

        this.listaAgregaSucursales = [];
        this.listaRolesUsuario = [];
        this.listaRolesUsuario2 = [];
        this.matrizSucursales = [];
        this.matrizCuentaBancaria = [];
    
        this.formUsuarios = this.fomrBuilder.group({
            id: new UntypedFormControl(''),
            username: new UntypedFormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3)]),
            email: new UntypedFormControl('', [Validators.required, Validators.maxLength(255), Validators.pattern("[a-zA-Z0-9!#$%&'*_+-]([\.]?[a-zA-Z0-9!#$%&'*_+-])+@[a-zA-Z0-9]([^@&%$\/()=?¿!.,:;]|\d)+[a-zA-Z0-9][\.][a-zA-Z]{2,4}([\.][a-zA-Z]{2})?")]),
            firstName: new UntypedFormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), Validators.pattern('[a-zA-Z ]{3,255}')]),
            lastName: new UntypedFormControl('', [Validators.required, Validators.maxLength(255), Validators.minLength(3), Validators.pattern('[a-zA-Z ]{3,255}')]),
            enabled: new UntypedFormControl(false),
            emailVerified: new UntypedFormControl(false),
            password: new UntypedFormControl(''),
            confPassword: new UntypedFormControl(''),
            temporary: new UntypedFormControl(false)

        }, { validators: this.checkPasswords });

        //  Constructor de formular los permisos de usuarios para cuentas bancarias
        this.formPermisosUsiarios = this.fomrBuilder.group({
            cuentaBancOri: new UntypedFormControl('',
             { validators: [this.autocompleteObjectValidator, Validators.required] })
        });
        
        

       // Constructor de formular los permisos de usuarios para cuentas bancarias por fechas 
        this.formFechas = this.fomrBuilder.group({
            fechainicio: new UntypedFormControl('', [Validators.required]),
            fechadetermino: new UntypedFormControl('', [Validators.required])
        });
    }
    /**
     * metodo OnInit de la clase AdminUsuariosComponent para iniciar las listas
     */
    ngOnInit() {
        this.spsUsuarios();
        //this.nuevoUsuario();
        this.activarSlideToggle();
        this.spsSucurales();
        this.spsRoles();
    }



    /**
 * Metodo para obtener la lista sucursales
 */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            // Se declara la lista para mostrar la información en vacia
            this.listSucursales = [];
            // Se forma el objeto de sucursales para agregarle el atributo seleccionado
            data.forEach(result => {
                let jsonLineal = {
                    "sucursalid": result.sucursalid,
                    "cveSucursal": result.cveSucursal,
                    "nombreSucursal": result.nombreSucursal,
                    "seleccionado": false,
                }
                this.listSucursales.push(jsonLineal)
            });
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo que consulta los Usuarios
     */
    spsUsuarios() {
        this.blockUI.start('Cargando datos...');
        this.service.getList('crudUsuario').subscribe(data => {
            this.blockUI.stop();
            this.listaUsuarios = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }


    /**
     * Metodo que consulta los roles que existen
     */
    spsRoles() {
        this.blockUI.start('Cargando datos...');
        this.service.getList('crudRol').subscribe(data => {
            // Guardamos los roles en la listaRolesOriginal
            this.listaRolesOriginal = data;
            // Se declara la lista para mostrar la información en vacia
            this.listaRoles = [];
            // Recorremos data para formar el objeto de roles con seleccionado en false.
            data.forEach(result => {
                if (result.name !== "offline_access" && result.name !== "default-roles-lks-core" && result.name !== "uma_authorization") {
                    let rol = {
                        "id": result.id,
                        "name": result.name,
                        "composite": result.composite,
                        "clientRole": result.clientRole,
                        "containerId": result.containerId,
                        "seleccionado": false
                    }
                    this.listaRoles.push(rol)
                }
            });
            // Se usa para cuando cerramos el modal de admin rol
            if (this.rolNuevo) {
                // Se declara una lista temporal
                let rolesTemp = [];
                // Guardamos la lista de roles en la lista temporal
                rolesTemp = this.listaRoles;
                // Recorremos la lista para dejar los que ya se tenian seleccionados
                // y actualizar la lista con los nuevos roles o roles eliminados.
                for (let x of rolesTemp) {
                    for (let i of this.listaRolesUsuario2) {
                        if (x.id === i.id) {
                            x.seleccionado = i.seleccionado;
                        }
                    }
                }
                this.listaRolesUsuario2 = [];
                this.listaRolesUsuario2 = rolesTemp;
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para editar o guardar un sujeto
     */
    crudUsuario(accion: any): void {
 
        //valida los campos del formulario
        if (this.formUsuarios.invalid) {
            this.validateAllFormFields(this.formUsuarios);
            return;
        }
        // Variable para guardar la peticion Guardar o Editar
        let peticion;
        // Variable para guardar el id del usuario
        let idUsuario;
        // Se forma el objeto y la peticion
        if (accion === 1) { // GUARDAR
            // Se valida que no vaya la contraseña vacia cuando se guardara un usuario.
            if (this.vacio(this.formUsuarios.get('password').value)) {
                this.service.showNotification('top', 'right', 4, 'Debe ingresar una contraseña.');
                return;
            } else {
                // Creamos el objeto
                this.blockUI.start('Guardando ...');
                const data = {
                    "username": this.formUsuarios.get('username').value,
                    "enabled": this.formUsuarios.get('enabled').value,
                    "emailVerified": this.formUsuarios.get('emailVerified').value,
                    "firstName": this.formUsuarios.get('firstName').value,
                    "lastName": this.formUsuarios.get('lastName').value,
                    "email": this.formUsuarios.get('email').value,
                    "access": {
                        "manageGroupMembership": true,
                        "view": true,
                        "mapRoles": true,
                        "impersonate": true,
                        "manage": true
                    },
                    "credentials": [
                        {
                            "type": "password",
                            "value": this.formUsuarios.get('password').value,
                            "temporary": this.formUsuarios.get('temporary').value
                        }
                    ]
                };
                // Peticion para guardar
                peticion = this.service.registrar(data, 'crudUsuario');
            }
        } else { // EDITAR
            // Validamos que se selecciono al menos un rol y una sucursal.
            if (!this.seleccionada(this.listaRolesUsuario2)) {
                this.service.showNotification('top', 'right', 4, 'Selecciona al menos un Rol.');
                return;
            } else if (!this.seleccionada(this.listaAgregaSucursales)) {
                this.service.showNotification('top', 'right', 4, 'Selecciona al menos una Sucursal.');
                return;
            }

            this.blockUI.start('Editando ...');
            // Obtenemos el id del usuario en la variable.
            idUsuario = this.formUsuarios.get('id').value;
            // Variable para guardar el objeto.
            let data: any;
            // Si no se va a actualizar la contraseña
            if (!this.vacio(this.formUsuarios.get('password').value)) {
                // Creamos el objeto del usuario con password
                data = {
                    "id": idUsuario,
                    "username": this.formUsuarios.get('username').value,
                    "enabled": this.formUsuarios.get('enabled').value,
                    "emailVerified": this.formUsuarios.get('emailVerified').value,
                    "firstName": this.formUsuarios.get('firstName').value,
                    "lastName": this.formUsuarios.get('lastName').value,
                    "email": this.formUsuarios.get('email').value,
                    "access": {
                        "manageGroupMembership": true,
                        "view": true,
                        "mapRoles": true,
                        "impersonate": true,
                        "manage": true
                    },
                    "credentials": [
                        {
                            "type": "password",
                            "value": this.formUsuarios.get('password').value,
                            "temporary": this.formUsuarios.get('temporary').value
                        }
                    ]
                };
            } else {
                // No se actualiza la contraseña
                // Creamos el objeto del usuario sin password
                data = {
                    "id": idUsuario,
                    "username": this.formUsuarios.get('username').value,
                    "enabled": this.formUsuarios.get('enabled').value,
                    "emailVerified": this.formUsuarios.get('emailVerified').value,
                    "firstName": this.formUsuarios.get('firstName').value,
                    "lastName": this.formUsuarios.get('lastName').value,
                    "email": this.formUsuarios.get('email').value,
                    "access": {
                        "manageGroupMembership": true,
                        "view": true,
                        "mapRoles": true,
                        "impersonate": true,
                        "manage": true
                    }
                };
            }
            // Peticion para Editar
            peticion = this.service.actualizar(idUsuario, data, 'crudUsuario');
        }
        // Se manda guardar o editar el usuario
        peticion.subscribe(result => {
            if (accion === 1) { // Guardar
                this.nuevoUsuario();
                this.spsUsuarios();
                this.service.showNotification('top', 'right', 2, 'El Usuario se a agregado con exito.');
                this.blockUI.stop();
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.errorMessage);
        });
        // Metodo que se manda llamar para guardar los permios de usuario por cuenta bancaria
        this.guardarPermisosCuentas();

        if (accion !== 1) { // Editar
            // Mandamos llamar los metodos para relacionar el usuario con sucursales y roles.
            this.relacionarSucursalesUsuario(idUsuario);
            this.relacionarRolesUsuario(idUsuario);
        }
    }

    /**
     * Metodo para relacionar el usuario con las sucursales
     * @param idUsuario id del usuario
     */
    relacionarSucursalesUsuario(idUsuario: any) {

        // Recorre las listas agregando los ID de la sucursales y el seleccionado
        this.matrizSucursales = [];
        for (let x of this.listaAgregaSucursales) {
            if (x.seleccionado) {
                this.matrizSucursales.push([x.sucursalid, x.seleccionado]);
            }
        }

        // Creamos objeto para relacionar el usuario con las sucursales
        const sucursales = {
            "id": idUsuario,
            "matrizSucursales": this.matrizSucursales
        };
        // Consumimos api.
        this.service.registrar(sucursales, 'relacionarUsuarioSucu').subscribe(data => {
            this.service.showNotification('top', 'right', 2, data[0][1])
        }, errorUsuarioSuc => {
            this.service.showNotification('top', 'rigth', 4, errorUsuarioSuc.Message);
        });
    }

    /**
     * Metodo para relacionar el usuario con los roles
     * @param idUsuario id del usuario
     */
    relacionarRolesUsuario(idUsuario: any) {
        // Limpiamos listas
        this.listaRolesSeleccionados = [];
        // Recorremos la listaRolesUsuario2 para regresar al estado normal el objeto
        // quitandole el atributo seleccionado
        this.listaRolesUsuario2.forEach(element => {
            let rol = {
                "id": element.id,
                "name": element.name,
                "composite": element.composite,
                "clientRole": element.clientRole,
                "containerId": element.containerId
            }
            // Obtenemos solamente los roles seleccionados
            if (element.seleccionado === true) {
                this.listaRolesSeleccionados.push(rol);
            }
        });

        // Extraemos el rol default-roles-lks-core de listaRolesOriginal
        // y la agregamos a la listaRolesSeleccionados
        this.listaRolesOriginal.forEach(element => {
            if (element.name === "default-roles-lks-core") {
                this.listaRolesSeleccionados.push(element);
            }
        });

        // Formamos el pathURL
        let path = idUsuario + "/role-mappings/realm";

        // Si la lista listaRolesSeleccionados se encuentra llena.
        // Agregamos Roles.
        if (!this.vacio(this.listaRolesSeleccionados)) {
            this.listaRolesSeleccionados.forEach(objeto => {
                this.service.registrarConAtributos([objeto], 'crudUsuario', path).subscribe(data => {
                    if(!this.vacio(data)){
                    this.service.showNotification('top', 'right', 2, data[0][1])
                    }
                }, error => {
                    this.service.showNotification('top', 'right', 4, error);
                });
            });
            // Mandamos mensaje y limpiamos.
            this.service.showNotification('top', 'right', 2, 'El Usuario se a actualizado con exito.');
            this.nuevoUsuario();
            this.spsUsuarios();
            this.blockUI.stop();
        }
    }

    /**
     * Metodo que elimina el rol del usuario.
     * @param rol Objeto rol
     */
    eliminarRol(rol) {
        let idUsuario = this.formUsuarios.get('id').value;
        let path = idUsuario + "/role-mappings/realm";
        let objetoDes = {
            "id": rol.id,
            "name": rol.name,
            "composite": rol.composite,
            "clientRole": rol.clientRole,
            "containerId": rol.containerId
        }
        const options = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json'
            }),
            objetoDes
        }
        this.service.eliminarConObjeto(options, 'crudUsuario', path).subscribe(data => {
            this.service.showNotification('top', 'right', 4, 'Rol eliminado del usuario. Edita el usuario.');
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Filtrado de  Usuarios por clave.
     * Mostrar la info en vista.
     * @param elemento objeto del usuario
     */
    spsUsuarioByUsername(elemento: any) {
        this.nuevoUsuario();
        this.blockUI.start('Cargando datos ...');
        this.editar = true;
        this.nombreUsuario = elemento.username;
        this.formUsuarios.get('id').setValue(elemento.id);
        this.formUsuarios.get('username').setValue(elemento.username);
        this.formUsuarios.get('email').setValue(elemento.email);
        this.formUsuarios.get('firstName').setValue(elemento.firstName);
        this.formUsuarios.get('lastName').setValue(elemento.lastName);
        this.formUsuarios.get('enabled').setValue(elemento.enabled);
        this.formUsuarios.get('emailVerified').setValue(elemento.emailVerified);
        this.spsRolesUsuario(elemento);
        this.spsSucursalesUsuario(elemento.username);
        this.spsSesiones(elemento.id);
        this.listaPermisosCtasUsuario(elemento.id,1);
        this.blockUI.stop();
    }

    /**
     * Metodo que consulta los roles del Usuario.
     * @param elemento objeto del usuario
     */
    spsRolesUsuario(elemento: any) {
        this.blockUI.start('Cargando datos...');
        this.listaRolesUsuario2 = this.listaRoles;
        let path = elemento.id + '/role-mappings/realm';
        this.service.getListByID(path, 'crudUsuario').subscribe(data => {
            this.listaRolesUsuario = data;
            // Recorremos la lista listaRolesUsuario y en la listaRolesUsuario2 
            // seleccionamos los que se encuentren en listaRolesUsuario.
            for (let x of this.listaRolesUsuario) {
                for (let i of this.listaRolesUsuario2) {
                    if (x.id === i.id) {
                        i.seleccionado = true;
                    }
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
     * Selecciona o deselecciona los roles
     * @param event 
     */
    seleccionarRoles(event: MatSelectionListChange) {

        /** 
         * editar = false Nuevo registro
         * editar = true Registro a editar
         * Se verifica si editar = false para agregarle a mi 
         * lista listaRolesUsuario los roles de listaRoles
         * para trabajar sobre ella, ya sea seleccionar o deseleccionar un rol
        */
        if (this.editar === false || this.listaRolesUsuario2.length === 0) {
            this.listaRolesUsuario2 = this.listaRoles;
        }

        /** 
         * Recorremos la lista listaRolesUsuario 
         * para seleccionar o deseleccionar el rol
        */
        for (let x of this.listaRolesUsuario2) {
            /** Si el id del rol que manda el evento es igual a la de la lista
             * Realiza la accion 
             */
        
            if (event.options[0].value != -1) {
                if (x.id === event.options[0].value.id) {
                    x.seleccionado = event.options[0].selected;
                    // Si se deselecciona, mandamos a eliminar.
                    if (!event.options[0].selected) {
                        this.eliminarRol(event.options[0].value);
                        this.service.showNotification('top', 'rigth', 4, "Rol eliminado del usuario. Edita el usuario.");
                    }
                }
            } else {
                x.seleccionado = event.options[0].selected;
            }
        }
    }

    /**
     * Metodo que selecciona o deselecciona todos los roles
     */
    seleccionarTodosRoles() {
        this.allSelectedRol = !this.allSelectedRol;

        if (this.listaRolesUsuario2.length === 0) {
            this.listaRolesUsuario2 = this.listaRoles;
        }

        if (this.allSelectedRol) {
            this.listaRolesUsuario2.forEach(lista => {
                lista.seleccionado = true;
            });
        } else {
            this.listaRolesUsuario2.forEach(lista => {
                lista.seleccionado = false;
            });
        }
    }


    /**
     * Metodo para agregar roles
     */
    agregarRol() {
        this.rolNuevo = false;
        /**
         * Se manda llamar el modal pasandole los datos.
         */
        const dialogRef = this.dialog.open(AdministracionRolesComponent,
            {
                // Tamaño del modal
                width: '40%',
                // Arreglo de datos que recibira el modal
                data: {}
            }
        );
        /**
         * Despues de cerrar el modal, 
         * se ejecuta el metodo que enlista los roles. 
        */
        dialogRef.afterClosed().subscribe(result => {
            this.rolNuevo = true;
            this.spsRoles();
        })
    }

    /**
     * Metodo que consulta las sucursales del Usuario.
     * @param username username del usuario. 
     */
    spsSucursalesUsuario(username: any) {
        this.blockUI.start('Cargando datos...');
        this.listaAgregaSucursales = this.listSucursales;
        let path = 1 + '/' + username.trim();
        this.service.getListByID(path, 'listaUsuariosInformacion').subscribe(data => {
            this.blockUI.stop();
            let listaSucursalesUsuarios = [];
            // Parceamos la lista a JSON y guardamos en listaSucursalesUsuarios.
            listaSucursalesUsuarios = JSON.parse(data[0].sucursales);
            // Si listaSucursalesUsuarios no se encuentra vacia.
            if (!this.vacio(listaSucursalesUsuarios)) {
                // Recorremos listaSucursalesUsuarios y ponemos activas las sucursales 
                // de la lista listaAgregaSucursales.
                for (let x of listaSucursalesUsuarios) {
                    for (let i of this.listaAgregaSucursales) {
                        if (x.sucursalid === i.sucursalid) {
                            // Metodo que manda llamar  spsCuentasBancarias  por sucurdadid
                            this.spsCuentasBancarias(x.sucursalid, '');
                            i.seleccionado = true;
                        }
                    }
                }
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Selecciona o deselecciona las sucursales
     * @param event 
     */
    mostrarSucursal(event: MatSelectionListChange) {

        /** 
         * editar = false Nuevo registro
         * editar = true Registro a editar
         * Se verifica si editar es false para agregarle a mi 
         * lista listaAgregaSucursales las sucursales de listSucursales 
         * para trabajar sobre ella, ya sea seleccionar o deseleccionar una sucursal
        */
        if (this.editar === false || this.listaAgregaSucursales.length === 0) {
            this.listaAgregaSucursales = this.listSucursales;
        }

        /** 
         * Recorremos la lista listaAgregaSucursales 
         * para seleccionar o deseleccionar la sucursal
        */
        for (let x of this.listaAgregaSucursales) {
            /** Si el id de la sucursal que manda el evento es igual a la de la lista lista
             * Realiza la accion 
             */
            
            if (event.options[0].value != -1) {
                if (x.sucursalid === event.options[0].value.sucursalid) {
                    x.seleccionado = event.options[0].selected;
                
                    if (event.options[0].value.seleccionado === true) {
                        this.spsCuentasBancarias(event.options[0].value.sucursalid, '');
                    } else {
                        let cuentas = this.listaCuentasBancarias.filter(c => c.extencionCuentaBancaria.sucursal.sucursalid === event.options[0].value.sucursalid);
                        for (let cuenta of cuentas) {
                            let index = this.listaCuentasBancarias.findIndex(c => c.cuentaBancariaID === cuenta.cuentaBancariaID);
                            this.listaCuentasBancarias.splice(index, 1);
                         
                        }

                    }
                }
            } else {
                x.seleccionado = event.options[0].selected;
            }
        }
    }

    /**
     * Metodo que selecciona o deselecciona todas las sucursales
     */
    seleccionaTodasSuc() {
        this.allSelectedSuc = !this.allSelectedSuc;

        if (this.allSelectedSuc) {
            this.listSucursales.forEach(lista => {
                lista.seleccionado = true;
            })
        } else {
            this.listSucursales.forEach(lista => {
                lista.seleccionado = false;
            })
        }
    }

    /**
    * Metodo que accede los permisos de los usuarios  por aplicaCaducidadd
    */

    aplicaCaducidadd(event: any) {
       
        if (event === true) {
            this.showPPrueba = true;
        } else {
            this.showPPrueba = false;
        }
    }

    /**
     * Metodo que muestra las sesiones de un usuario.
     * @param idUsuario id del usuario
     */
    spsSesiones(idUsuario) {
        this.blockUI.start('Cargando la información...');
        let path = idUsuario + '/sessions';
        this.listaSesiones = [];
        this.service.getListByID(path, 'crudUsuario').subscribe(data => {
            data.forEach(result => {
                let objetoSesion = {
                    "id": result.id,
                    "username": result.username,
                    "userId": result.userId,
                    "ipAddress": result.ipAddress,
                    "start": moment(result.start).format('LLLL'),
                    "lastAccess": moment(result.lastAccess).format('LLLL')
                }
                this.listaSesiones.push(objetoSesion);
            });

            this.dataSourceSesiones = new MatTableDataSource(this.listaSesiones);
            this.dataSourceSesiones.paginator = this.paginator;
            this.dataSourceSesiones.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
        });
    }

    /**
     * Metodo que cierra la sesion de un usuario.
     * @param sesion sesion a cerrar
     * @param accion 1 = cerrar 1 sesion, 2 = cerrar todas las sesiones
     */
    cerrarSesion(sesion, accion) {
        this.blockUI.start('Cerrando la sesión ...');
        let idUsuario = this.formUsuarios.get('id').value;
        if (accion === 1) { // Cerramos una sesión
            this.service.eliminar(sesion.id, 'cerrarSesion').subscribe(data => {
                this.spsSesiones(idUsuario);
                this.service.showNotification('top', 'right', 2, 'Se ha cerrado la sesión del usuario.');
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
            });
        } else { // Cerramos todas las sesiones
            let objeto = {
                "realm": "lks-core",
                "user": idUsuario
            };
            let path = idUsuario + '/logout';
            this.service.registrarConAtributos(objeto, 'crudUsuario', path).subscribe(data => {
                this.spsSesiones(idUsuario);
                this.service.showNotification('top', 'right', 2, 'Se han cerrado todas las sesiones del usuario.');
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
            });
        }

    }

    /**
    * Bloque de Validaciones
    */
    validaciones = {
        'username': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
            { type: 'minlength', message: 'Campo minimo 3 dígitos.' }
        ],
        'email': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
            { type: 'pattern', message: 'No es el formato correcto, ejemplo: ejemplo@gmail.com.' }
        ],
        'firstName': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
            { type: 'minlength', message: 'Campo minimo 3 dígitos.' },
            { type: 'pattern', message: 'Campo solo letras.' }
        ],
        'lastName': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
            { type: 'minlength', message: 'Campo minimo 3 dígitos.' },
            { type: 'pattern', message: 'Campo solo letras.' }
        ]
    };

    /**
     * Metodo que verifica que las contraseñas coincidan.
     * @returns true or false
     */
    checkPasswords: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
        let pass = group.get('password').value;
        let confirmPass = group.get('confPassword').value
        return pass === confirmPass ? null : { notSame: true }
    }

    /**
     * Abrir ventana modal de confirmacion para dar de baja o alta el usuario
     * @param event estatus del usuario
    * */
    abrirAdvertencia(event: any) {
        const estatus = event.checked;
        var encabezado = "";
        var body = "";
        if (estatus) {
            encabezado = "Usuario";
            body = '¿Esta seguro de dar de alta el Usuario?';
        } else {
            encabezado = "Usuario";
            body = '¿Esta seguro de dar de baja el Usuario?';
        }

        if (this.seleccionada(this.listaRolesUsuario2) && this.seleccionada(this.listaAgregaSucursales)) {
            const dialogRef = this.dialog.open(verificacionModalComponent, {
                data: {
                    titulo: encabezado,
                    body: body
                }
            });
            //Cerrar ventana
            dialogRef.afterClosed().subscribe(result => {
                if (result === 1) {//aceptar y va a Activar
                    if (estatus) {
                        this.formUsuarios.get('enabled').setValue(false);
                    } else {
                        this.formUsuarios.get('enabled').setValue(true);
                    }

                }
            });
        } else {
            this.service.showNotification('top', 'right', 4, 'Selecciona al menos una Sucursal o un Rol.');
            this.formUsuarios.get('enabled').setValue(false);
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
     * Activa los interruptores en el formulario
     */
    activarSlideToggle() {
        this.formUsuarios.get('enabled').setValue(false);
        this.formUsuarios.get('emailVerified').setValue(false);
    }

    /**
     * Carga todos los combos y resetea el form
     */
    nuevoUsuario() {
        this.spsSucurales();
        this.spsRoles();
        this.activarSlideToggle();
        this.listaAgregaSucursales = [];
        this.listaRolesUsuario = [];
        this.listaRolesUsuario2 = [];
        this.matrizSucursales = [];
        this.listaRolesSeleccionados = [];
        this.allSelectedSuc = false;
        this.editar = false;
        this.allSelectedRol = false;
        this.formUsuarios.reset();
        // Metodo que lista los permisos de usuarios por cuenta bancaria
        this.listaPermisosUsuariosAgregadas = [];
        this.formPermisosUsiarios.reset();
        this.formFechas.reset();
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
     * Metodo que verifica que al menos un objeto de la lista se encuentre seleccionado.
     * @param lista recibe una lista.
    */
    seleccionada(lista) {
        let attSeleccionado;
        for (let x of lista) {
            if (x.seleccionado === true) {
                attSeleccionado = true;
                break;
            } else {
                attSeleccionado = false
            }
        }
        return attSeleccionado;
    }

    /**
 * Metodo para cargar tabla de cuentas bancarias
 */
    spsCuentasBancarias(sucursal: number, tipocuenta: string) {
        this.blockUI.start('Cargando...');
        let path = '?sucursalId=' + sucursal + '&' + 'tipoCuenta=' + tipocuenta;
        this.service.getListByID(path, 'listaCuentaBancariaSuc').subscribe(
            data => {
                this.blockUI.stop();
                let res = data;
                this.listaCuentasBancarias = res;
                this.formPermisosUsiarios.get('cuentaBancOri').setValidators([this.autocompleteObjectValidator()])
                this.formPermisosUsiarios.get('cuentaBancOri').updateValueAndValidity();
                // Metodo donde nos muestra las cuentas bancarias por usuario
                this.opcionesCuentaBancoOri = this.formPermisosUsiarios.get('cuentaBancOri').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCuentaBanco(value))
                );
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        )

    }

    /**
    * Metodo que agrega los permisos de los usuarios  por cuenta bancaria en una lista
    */
    agregarPermisosUsuarios() {
        let permiso_cat_id = 0;

        



        if (this.formPermisosUsiarios.invalid) {
            this.validateAllFormFields(this.formPermisosUsiarios);
            return;

        }

        if (this.aplicaCaducidad.value === true) {
            if (this.formFechas.invalid) {
                this.validateAllFormFields(this.formFechas);
                return;
            }

        }

        let index = this.listaPermisosUsuariosAgregadas.findIndex(res => res[1] ===
            this.formPermisosUsiarios.get('cuentaBancOri').value.cuentaBancariaID);

        if (index !== -1) {
            permiso_cat_id = this.listaPermisosUsuariosAgregadas[index][0];
            this.service.showNotification('top', 'right', 1, 'Se actualizo los permisos.');
            this.listaPermisosUsuariosAgregadas.splice(index, 1);
        }

        this.listaPermisosUsuariosAgregadas.push([
            permiso_cat_id,
            this.formPermisosUsiarios.get('cuentaBancOri').value.cuentaBancariaID,
            this.estatus.value,
            this.aplicaCaducidad.value,
            this.formFechas.get('fechainicio').value,
            this.formFechas.get('fechadetermino').value,
            this.formPermisosUsiarios.get('cuentaBancOri').value.claveCuenta,
            this.formPermisosUsiarios.get('cuentaBancOri').value.descripcionCuenta

        ]);



        this.formPermisosUsiarios.reset();
        this.formFechas.reset();
        this.estatus.setValue(false);
        this.aplicaCaducidad.setValue(false);
    }

    /**
     * Metodo que lista los permisos del usuario
     * @param usuarioid - usuario id a consultar
     * @param accion - accion a realizar
     */
    listaPermisosCtasUsuario(usuarioid, accion){

        this.service.getListByID(usuarioid+'/'+accion,'listaCtasPermisos').subscribe(data => {

            for(let permiso of data){

                let cuenta = JSON.parse(permiso.cuenta);
                this.listaPermisosUsuariosAgregadas.push([
                    permiso.permisoCatid,
                    cuenta[0].cuenta_bancaria_id,
                    permiso.estatus, permiso.aplicaCaducidad,
                    permiso.fechaInicio, permiso.fechaTermino,
                    cuenta[0].clave_cuenta,
                    cuenta[0].descripcion_cuenta
                ]);
              
            }
        });

    }

    /**
   * Metodo que elimina los permisos de los usuarios
   * @param detallePermisosUsu - permisos de usuarios a eliminar
   */
    eliminarPermisosUsuarios(usuarioid) {
        let index = this.listaPermisosUsuariosAgregadas.findIndex(res => res[2] === usuarioid[2])
        this.listaPermisosUsuariosAgregadas.splice(index, 1)
    }

    /** Metodo para guardar/actualizar */
    guardarPermisosCuentas() {
        this.blockUI.start('Guardando ...')
        // se guarda

        let jsonPermisos = {
            "usuarioid": this.formUsuarios.get('id').value,
            "matrizCuentaBancaria": this.listaPermisosUsuariosAgregadas,
        }

        this.service.registrar(jsonPermisos,'crudCtasPermisos').subscribe(result => {
            this.blockUI.stop();
            if (result[0][0] === '0') {
                this.listaPermisosUsuariosAgregadas = [];
                this.service.showNotification('top', 'right', 2, result[0][1])
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message)
        });



    }

    /** Metodo que muestra el registro seleccionado de la lista */
    registroSeleccionado(permisos: any) {
        this.blockUI.start('Cargando datos...')
        this.nombreUsuario()
        this.editar = true
        let vpermisosbanco = JSON.parse(permisos.permisosUsu);
        this.listaPermisosUsuariosAgregadas = [];
        for (let permisosItem of vpermisosbanco) {
            this.listaPermisosUsuariosAgregadas.push([
                permisosItem.cuentaBancOri,
                permisosItem.estatus,
                permisosItem.aplicaCaducidad,
                permisosItem.fechainicio,
                permisosItem.fechadetermino
            ]);

        }
        this.formFechas.reset();
        let vaplicaCaducidad = JSON.parse(permisos.aplicaCaducidad);
        if (this.vacio(vaplicaCaducidad)) {
            this.formFechas.get('fechainicio').setValue(vaplicaCaducidad[0].fecha_inicio + 'T00:00:00');
            this.formFechas.get('fechadetermino').setValue(vaplicaCaducidad[0].fechfecha_fin + 'T00:00:00');
        }
    }
    /**
    * Filtra la cuenta bancaria
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterCuentaBanco(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentasBancarias.filter(cuentaBO => cuentaBO.claveCuenta.toLowerCase().includes(filterValue));
    }

    /**
 * Muestra clave cuenta banco
 * @param cuentaBanco --tipo cuenta seleccionada
 * @returns -- descripcion del tipo de cuenta
 */
    displayCuentaBancOri(cuentaBanco: any): any {
        return cuentaBanco ? cuentaBanco.claveCuenta : undefined;
    }

    activarDesactivarPermisosUsuario(event) {

        let encabezado
        let body
        if (event.checked === true) {
            encabezado = "Permisos de Usuarios";
            body = '¿Esta seguro de dar de alta el Permiso?';
        } else {
            encabezado = "Permisos de Usuarios";
            body = '¿Esta seguro de dar de baja el Permiso?';
        }

        const dialogRef = this.dialog.open(verificacionModalComponent, {
            data: {
                titulo: encabezado,
                body: body
            }
        });
        //Cerrar ventana
        dialogRef.afterClosed().subscribe(result => {
            if (result === 1) {//aceptar y va a Activar
                this.estatus.setValue(!event.checked);
            } else {
                this.estatus.setValue(event.checked);

            }
        });

    }
     /**
          * Valida que el texto ingresado pertenezca a un estado
          * @returns mensaje de error.
          */
      autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null  /* valid option selected */
        }
    }
}

/**
 * Valida dos control, que sean iguales su contenido
 */
export class MyErrorStateMatcher implements ErrorStateMatcher {
    isErrorState(control: UntypedFormControl | null, form: FormGroupDirective | NgForm | null): boolean {
        const invalidCtrl = !!(control.invalid && control?.parent.get('password').dirty);
        const invalidParent = !!(control?.parent?.invalid && control?.parent.get('confPassword').dirty);

        return invalidCtrl || invalidParent;
    }
}
