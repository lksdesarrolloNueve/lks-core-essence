import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatTableDataSource } from "@angular/material/table";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { BuscarClientesComponent } from "../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { map, startWith } from "rxjs/operators";
import { PermisosService } from "../../../../shared/service/permisos.service";

@Component({
    selector: 'admin-grupos',
    moduleId: module.id,
    templateUrl: 'admin-grupos.component.html'
})


/**
* @autor: Victor Daniel Loza Cruz
* @version: 1.0.0
* @fecha: 08/11/2021
* @descripcion: Componente  Admin para la gestion de grupos
*/
export class AdminGrupoComponent implements OnInit {

    // Declaracion de variables y controladores
    titulo: string;
    accion: number;
    grupoId: number = 0;
    selectedId: number;
    mostrar: boolean = false;
    panelOpenState: boolean = false;
    accionEditar: boolean = false;

    displayedColumns: string[] = ['nombreSocio', 'sucursal', 'tipoSocio', 'acciones']
    condicion: UntypedFormControl = new UntypedFormControl;
    formGrupos: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    listaSucursales: any[];
    opcionesSucursales: Observable<string[]>;

    //Variables AutoComplete 
    opcionesGenerales: Observable<string[]>;
    filteredGenerales: Observable<string[]>;

    dataSourceClientes: MatTableDataSource<any>;
    dataSourceGrupos: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    //declaracion de listas
    listaClientes = [];
    listaRoles: any[];
    listaIntegrantesGrupo: any[];
    listaClientesSeleccionados = [];

    arrayIdsInGr: any[] = [];

    //Valida que el rol sea requerido [Validators.required]
    rolesControl = new UntypedFormControl('')

    //validacion de campos 
    validaciones = {
        'cveGrupo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Máximo 10 caracteres.' }],
        'nombreGrupo': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Máximo 255 caracteres.' }],
        'catGenerales': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        "sucursal": [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'La sucursal no existe.' }
        ]
    };

    constructor(private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        private servicePermisos: PermisosService) {
        this.titulo = data.titulo + " grupos";
        this.accion = data.accion;

        this.formGrupos = this.formBuilder.group({
            cveGrupo: new UntypedFormControl('', [Validators.required, Validators.maxLength(10)]),
            nombreGrupo: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            estatus: new UntypedFormControl(true),
            sucursal: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catGenerales: this.rolesControl
        });

        if (this.accion === 2) {
            this.grupoId = data.grupos.grupoId
            this.formGrupos.get('cveGrupo').setValue(data.grupos.cveGrupo);
            this.formGrupos.get('nombreGrupo').setValue(data.grupos.nombreGrupo);
            this.formGrupos.get('estatus').setValue(data.grupos.estatus);
            this.formGrupos.get('catGenerales').setValue(data.integrantesGrupo.catGenerales);

            this.spsIntegrantesGrupo(data.grupos.cveGrupo);

        }
    }

    /**
     * Método OnInit para iniciar los metodos  
     */
    ngOnInit() {
        this.spsRoles();
        this.spsListaSucursales();
    }

    /**
    * Metodo para obtener los integrantes del grupo
    */
    spsIntegrantesGrupo(elemento: any) {
        this.blockUI.start('Cargando datos...');
        let path = elemento.trim()

        this.service.getListByID(path, 'listaIntegrantesGrupo').subscribe(data => {
            this.blockUI.stop();

            // se declara la lista para mostrar la información en vacia
            this.listaIntegrantesGrupo = []

            //Se crea forEach para agregar la información del JSON de forma lineal
            data.forEach(result => {
                let jsonLineal = {
                    "catCliente": {
                        "cliente": {
                            "clienteId": result.integrante.catCliente.clienteId,
                            "numeroCliente": result.integrante.catCliente.numeroCliente,
                            "sujeto": {
                                "apellidoMaterno": result.integrante.apellidoMaterno,
                                "apellidoPaterno": result.integrante.catCliente.apellidoPaterno,
                                "nombres": result.integrante.nombreCliente
                            }
                        }
                    },
                    "catGenerales": {
                        "generalesId": result.integrante.catGenerales.generalesId,
                        "cveGeneral": result.integrante.catGenerales.cveGeneral,
                        "descripcion": result.integrante.catGenerales.descripcion
                    }

                }
                this.listaIntegrantesGrupo.push(jsonLineal)
            })

            this.listaClientesSeleccionados = this.listaIntegrantesGrupo
            this.agregarIntegranteGrupo(this.listaClientesSeleccionados, this.accionEditar)

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
      * Metodo para abrir ventana modal para buscar al cliente
      * @param data -- Objecto o valor a condicionar
      */
    abrirDialogCliente(data) {
        //Si es 0 es Registrar si es diferente es actualizar
        if (data === 0) {//clientes
            this.titulo = "Lista clientes";
            let opcion = 1;

            //se abre el modal
            const dialogRef = this.dialog.open(BuscarClientesComponent, {
                // height: '500px',
                width: '600px',
                data: {
                    titulo: this.titulo,
                    accion: opcion,
                    cliente: data
                }
            });
            //Se usa para cuando cerramos
            dialogRef.afterClosed().subscribe(result => {
                if (result.tipoPersona == 'F') {
                    this.spsClientes(result.datosCl);
                } else {
                    //cancelar
                    this.service.showNotification('top', 'right', 3, 'NO se ha seleccionado un cliente Físico o extranjero.');

                }
            });
        }

    }

    /**
    * Metodo para obtener la lista clientes
  */
    spsClientes(data) {

        this.blockUI.start('Cargando datos...');
        this.listaClientes = data;

        let jsonLineal = {

            "cliente": {
                "clienteId": data.cliente_id,
                "numeroCliente": data.numero_cliente,
                "sujeto": {
                    "nombres": data.nombre_cl,
                    "apellidoPaterno": data.paterno_cl,
                    "apellidoMaterno": data.materno_cl
                }
            }

        }

        this.agregarIntegranteGrupo(jsonLineal, true);

        if (!$.isEmptyObject(this.listaClientes.length)) {
            this.mostrar = true;
        }

        this.blockUI.stop();

    }
    /**
     * Metodo que lista roles del catalogo general
     */
    spsRoles() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('41IG', 'listaGeneralCategoria').subscribe(data => {
            this.listaRoles = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método crud para gestionar a los grupos
     * @param elemento 
     * @param estatus 
     */
    crudGrupos() {

        //valida los campos del formulario
        if (this.formGrupos.invalid) {
            this.validateAllFormFields(this.formGrupos);
            return;
        }

        //recorre las listas agregando los ID del cliente y el rol
        for (let x of this.listaClientesSeleccionados) {
            this.arrayIdsInGr.push([x.catCliente.cliente.clienteId, x.catGenerales.generalesId])
        }

        //Se crea forEach para agregar la información del JSON de forma lineal

        let jsonLineal = {
            "grupo": {
                "grupoId": this.grupoId,
                "cveGrupo": this.formGrupos.get('cveGrupo').value,
                "nombreGrupo": this.formGrupos.get('nombreGrupo').value,
                "estatus": this.formGrupos.get('estatus').value

            },
            "integrantesGrupo": this.arrayIdsInGr,
            "cveSucursal": this.formGrupos.get('sucursal').value.cveSucursal

        }

        if (this.accion === 2) {
            this.blockUI.start('Editando...'); //Se inicia el loader
        } else {
            this.blockUI.start('Guardando...'); //Se inicia el loader

        }
        this.service.registrarBYID(jsonLineal, this.accion, 'crudGrupos').subscribe(
            result => {
                this.blockUI.stop(); //se cierra el loader
                if (result[0][0] === '0') {
                    if (this.accion !== 2) {
                        this.formGrupos.reset(); //para recetear los valores del form
                        this.listaClientesSeleccionados = [];
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
            }, error => {
                this.formGrupos.reset(); //para recetear los valores del form
                this.listaClientesSeleccionados = [];
                this.blockUI.stop(); //se cierra el loader
                this.service.showNotification('top', 'right', 4, error.Message);
            }

        );

    }

    /***
    * metodo para remover datos de la lista de Integrante Grupo
    */
    eliminarIntegranteGrupo(valor: any) {

        let index = this.listaClientesSeleccionados.findIndex(res => res.catCliente.cliente.clienteId === valor.catCliente.cliente.clienteId)
        this.listaClientesSeleccionados.splice(index, 1)
    }

    /**
   * Metodo para agregar datos a la lista de Integrante Grupo
   */
    agregarIntegranteGrupo(element: any, accion) {
        //Obtiene la información del combo y del autocomplete
        let rol: any
        rol = this.formGrupos.get('catGenerales').value
        let cliente: any
        cliente = element

        //valida que el rol y el cliente no vallan vacios
        if ((rol !== '' && rol !== null && rol != undefined) &&
            (cliente !== '' && cliente !== null && cliente != undefined)) {

            //valida que la lista valla vacía, si es así agrega el ro y el cliente en la lista para mostrarla en la tabla
            if (this.listaClientesSeleccionados.length <= 0) {
                //limpia el combo, el filtrer y la tabla
                this.formGrupos.get('catGenerales').setValue('');
                this.condicion.setValue('');
                this.mostrar = false;
                this.panelOpenState = false;

                let integrantesGrupo = {
                    catCliente: cliente,
                    catGenerales: rol,
                }
                this.listaClientesSeleccionados.push(integrantesGrupo)
            } else {
                //busca el indice del clinte que se va a agregar a la lista de seleccionados
                let indiceDos = this.listaClientesSeleccionados.findIndex(i2 => i2.catCliente.cliente.clienteId === cliente.cliente.clienteId)
                //itera la informacion del la lista para verificar que no exista un Tesorero o Presidente ya agregado en la lista
                for (let x of this.listaClientesSeleccionados) {
                    if (x.catGenerales.descripcion === 'Tesoreros') {
                        if (x.catGenerales.descripcion === rol.descripcion) {
                            this.service.showNotification('top', 'right', 1, "El Rol " + x.catGenerales.descripcion + " ya se encuentra seleccionado")
                            return;
                        }
                    }
                    if (x.catGenerales.descripcion === 'Presidente') {
                        if (x.catGenerales.descripcion === rol.descripcion) {
                            this.service.showNotification('top', 'right', 1, "El Rol " + x.catGenerales.descripcion + " ya se encuentra seleccionado")
                            return;
                        }
                    }
                }
                //si el indice es -1 significa que no existe el cliente y lo agrega a la lista
                if (indiceDos === -1) {
                    let integrantesGrupo = {
                        catCliente: cliente,
                        catGenerales: rol,
                    }
                    this.listaClientesSeleccionados.push(integrantesGrupo)
                    //limpia el combo, el filtrer y la tabla
                    this.formGrupos.get('catGenerales').setValue('');
                    this.condicion.setValue('');
                    this.mostrar = false;

                } else {
                    this.service.showNotification('top', 'right', 1, "El Cliente " + cliente.sujeto.nombres + " " + cliente.sujeto.apellidoPaterno + " " + cliente.sujeto.apellidoMaterno + " ya se encuentra seleccionado")
                }
            }
        } else {
            if (accion) {
                this.service.showNotification('top', 'right', 1, "El rol no puede ir vacío");
            }
        }
    }

    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //1
        Object.keys(formGroup.controls).forEach(field => { //2
            const control = formGroup.get(field);         //3
            if (control instanceof UntypedFormControl) {          //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {     //5
                this.validateAllFormFields(control);       //6
            }
        });
    }

    /**
    * Valida que el texto ingresado pertenezca a un subramas
    * @returns mensaje de error.
    */
    autocompleteObjectValidator(): ValidatorFn {
        return (control: AbstractControl): { [key: string]: any } | null => {
            if (typeof control.value === 'string' && control.value.length > 0) {
                return { 'invalidAutocompleteObject': { value: control.value } }
            }
            return null;
        }

    }



    /**
   * Obtener sucursales
   */
    spsListaSucursales() {

        this.blockUI.start();

        this.listaSucursales = this.servicePermisos.sucursales;


        this.opcionesSucursales = this.formGrupos.get('sucursal').valueChanges.pipe(
            startWith(''),
            map(value => this._filterSucursales(value))
        );

        if(this.accion === 2){
            let sucursal = this.listaSucursales.find(s => s.sucursalid === this.data.grupos.sucursalID);
            if(sucursal !== undefined){
                this.formGrupos.get('sucursal').setValue(sucursal);
            }
            
        }

        this.blockUI.stop();


    }

    /**
    * Filtra la categoria de sucursales
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterSucursales(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));

    }


    /**
   * Muestra la descripcion de la sucursal
   * @param option --muestra el nombre de la sucursal seleccionada
   * @returns --nombre de la sucursal
   */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

}