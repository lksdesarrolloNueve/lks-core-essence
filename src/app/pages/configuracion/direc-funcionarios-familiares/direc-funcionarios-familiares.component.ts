import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { globales } from "../../../../environments/globales.config";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { Observable } from "rxjs";
import { environment } from "../../../../environments/environment";
import { MatTableDataSource } from "@angular/material/table";
import { BuscarClientesComponent } from "../../../../app/pages/modales/clientes-modal/buscar-clientes.component";
import { PermisosService } from "../../../shared/service/permisos.service";

@Component({
    selector: 'direct-func-fam',
    moduleId: module.id,
    templateUrl: 'direc-funcionarios-familiares.component.html'
})

/**
 * @autor María Guadalupe Santana Olalde
 * @descripcion Componente para la gestión de los familiares de Directivos Funcionarios
 * @fecha 21/07/2022
 * @version 1.0.0
 */
export class DirecFuncFamiliaresComponent implements OnInit {

    formFamiliarDirectivoFuncionario: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;
    titulo: string;
    accion: number;

    //Filtro de Sucursal
    listaSucursal: any[];
    opcionesSucursal: any;
    selectedIdSucursal: number = 0;
    listaFamiliarSujetosSucursal: any[];

    //Filtro de Cliente
    selectedIdSucCliente: number = 0;
    selectedIdCliente: number = 0;
    sucursalId: number;
    nombresS: any;
    apellidoPaternoS: any;
    apellidoMaternoS: any;
    listaCliente: any[];
    opcionesCliente: Observable<string[]>;
    clienteID: number = 0;
    numeroCliente = new UntypedFormControl();

    //Filtro de Fraccion 
    selectedIdFraccion: number = 0;
    listaFraccion: any[];
    opcionesFraccion: Observable<string[]>;
    fraccionId: number;

    //Filtro de Parentescos 
    selectedIdParentesco: number = 0;
    listaParentesco: any[];
    opcionesParentesco: Observable<string[]>;
    parentescoId: number;

    //Filtro de Directivos Funcionarios
    selectedIdDirFun: number = 0;
    listaDirFun: any[];
    opcionesDirFun: Observable<string[]>;
    dirFunId: number;

    dataSourceDirFun: MatTableDataSource<any>;

    //Variables globales para filtro de clientes 
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    //Declaración de variables globales
    direcFunFamID: number = 0;
    sujetoID: number = 0;
    directivo: any;
    fraccion: any;
    parentesco: any;
    observaciones: any;
    paginator: any;
    sort: any;

    catSucursal = new UntypedFormControl('');

    showGuardar : boolean = true;

    /**
     * Constructor de la clase DirectivosFuncionariosFamiliares
     * @param data - Recibe datos del padre
     * @param service - Instancia de acceso a datos
     * @param formBuilder - Instancia de construcción del formulario
     */
    constructor(
        private service: GestionGenericaService,
        public dialog: MatDialog,
        private fomrBuilder: UntypedFormBuilder, private session: PermisosService
    ) {
        this.selectedIdSucCliente = this.session.sucursalSeleccionada.sucursalid;

        this.formFamiliarDirectivoFuncionario = this.fomrBuilder.group({
            //Validators directivos funcionarios Familiares

            numeroClientefiltro: new UntypedFormControl('', [Validators.required]),
            numeroCliente: new UntypedFormControl(''),
            nombres: new UntypedFormControl(''),
            apellidoPaterno: new UntypedFormControl(''),
            apellidoMaterno: new UntypedFormControl(''),
            fechaNacimiento: new UntypedFormControl(''),
            rfc: new UntypedFormControl(''),
            curp: new UntypedFormControl(''),
            catFraccion: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            catParentesco: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            dirFun: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            observaciones: new UntypedFormControl('')
        });

    }


    ngOnInit(): void {
        this.spsSucursal();
        this.spsFraccion();
        this.spsParentesco();
        this.spsDirFun();
        this.spsSujetoSucursal();
    }

    //INICIO AUTOCOMPLETE SUCURSAL
    /**
   * Muestra la descripcion de la Sucursal
   * @param option --Sucursal seleccionada
   * @returns --nombre de la Sucursal
   */
    displayFnSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }

    /**
     * Metodo para filtrar por sucursal
    */
    opcionSelectSucursal(event) {

        this.selectedIdSucursal = event.option.value.nombreSucursal;
        this.selectedIdSucCliente = event.option.value.sucursalid;
        this.spsSujetoSucursal();
    }

    /**
   * Filtra la categoria de Sucursal
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
    private _filterSucursal(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaSucursal.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * Método que filtra las sucursales
     */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();

            this.listaSucursal = data;
            this.opcionesSucursal = this.catSucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo que consulta sujeto por sucursal
    */
    spsSujetoSucursal() {

        if(this.selectedIdCliente){
            
        this.blockUI.start('Cargando datos...');
        this.listaFamiliarSujetosSucursal = [];
        let path = this.selectedIdSucCliente + '/' + 1;



            this.service.getListByID(path, 'listaFamiliarDirFunSucById').subscribe(data => {
                this.blockUI.stop();
                this.listaFamiliarSujetosSucursal = JSON.parse(data);
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
            );
        }

    }

        /**
* Filtrado de  sujetos por id
*/
spsDirectivoSujetoByIdGeneral() {
    this.blockUI.start('Cargando datos...');

    let path = this.nombresS + ' ' + this.apellidoPaternoS + ' ' + this.apellidoMaternoS + '/' + 0 + '/' + 1+ '/' + 0 + '/' + 1;

    this.service.getListByID(path, 'listaClientes').subscribe(
        data => {
            this.blockUI.stop();

            this.sujetoID = data[0].sujeto.sujetoId;
            this.clienteID = data[0].cliente.clienteId;
            // //Datos Directivos funcionarios
            this.formFamiliarDirectivoFuncionario.get('numeroClientefiltro').setValue(data[0].cliente.numeroCliente);
            this.formFamiliarDirectivoFuncionario.get('nombres').setValue(data[0].sujeto.nombres);
            this.formFamiliarDirectivoFuncionario.get('apellidoPaterno').setValue(data[0].sujeto.apellidoPaterno);
            this.formFamiliarDirectivoFuncionario.get('apellidoMaterno').setValue(data[0].sujeto.apellidoMaterno);
            this.formFamiliarDirectivoFuncionario.get('fechaNacimiento').setValue(data[0].sujeto.fechaNacimiento);
            this.formFamiliarDirectivoFuncionario.get('rfc').setValue(data[0].sujeto.rfc);
            this.formFamiliarDirectivoFuncionario.get('curp').setValue(data[0].sujeto.curp);

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
}

    /**
     * Filtrado de sujetos por ID
     */
    spsDirectivoSujetoById(elemento: any) {
        this.blockUI.start('Cargando datos...');
        let path = elemento + '/' + 1;
        this.service.getListByID(path, 'listaDirectivoFamiliarSujetoById').subscribe(
            data => {

                if (!this.vacio(data)) {
                    let dire = JSON.parse(data);

                    this.direcFunFamID = dire[0].direcfunfam_id;
                    this.clienteID = dire[0].cliente_id;
                    this.sujetoID = dire[0].sujetoId;
                    this.directivo = this.listaDirFun.find(d => d.numero_cliente == dire[0].numero_clientedirfun);
                    this.fraccion = this.listaFraccion.find(f => f.cveGeneral == dire[0].cve_fraccion);
                    this.parentesco = this.listaParentesco.find(p => p.cveGeneral == dire[0].cve_parentesco);
                    this.observaciones = this.listaDirFun.find(o => o.observaciones == dire[0].observaciones);

                    // //Datos Directivos funcionarios
                    this.formFamiliarDirectivoFuncionario.get('numeroClientefiltro').setValue(dire[0].numero_cliente);
                    this.formFamiliarDirectivoFuncionario.get('nombres').setValue(dire[0].nombres);
                    this.nombresS = dire[0].nombres;
                    this.formFamiliarDirectivoFuncionario.get('apellidoPaterno').setValue(dire[0].apellido_paterno);
                    this.formFamiliarDirectivoFuncionario.get('apellidoMaterno').setValue(dire[0].apellido_materno);
                    this.formFamiliarDirectivoFuncionario.get('fechaNacimiento').setValue(dire[0].fecha_nacimiento);
                    this.formFamiliarDirectivoFuncionario.get('rfc').setValue(dire[0].rfc);
                    this.formFamiliarDirectivoFuncionario.get('curp').setValue(dire[0].curp);
                    this.formFamiliarDirectivoFuncionario.get('dirFun').setValue(this.directivo);
                    this.formFamiliarDirectivoFuncionario.get('catFraccion').setValue(this.fraccion);
                    this.formFamiliarDirectivoFuncionario.get('catParentesco').setValue(this.parentesco);
                    this.formFamiliarDirectivoFuncionario.get('observaciones').setValue(dire[0].observaciones);

                    this.showGuardar = false;
                }
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }


    /**
        * Metodo para Abrir ventana modal de clientes */
    modalClientes() {

        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente'
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (result != 1) {
                if (result.tipoPersona == 'F') {

                    this.numeroCliente.setValue(result.datosCl.numero_cliente.trim())
                    this.nombresS =result.datosCl.nombre_cl; 
                    this.apellidoPaternoS =result.datosCl.paterno_cl; 
                    this.apellidoMaternoS=result.datosCl.materno_cl;

                    this.spsDirectivoSujetoByIdGeneral();
                } else {
                    //Moral
                }
            }
            if (result == 1) {
                this.numeroCliente.setValue('');
            }

        });

    }

    /**
     * Filtro de Fraccion
     */
    spsFraccion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catFraccion, 'listaGeneralCategoria').subscribe(data => {
            
            this.blockUI.stop();

            this.listaFraccion = data;
            this.opcionesFraccion = this.formFamiliarDirectivoFuncionario.get('catFraccion').valueChanges.pipe(
                startWith(''),
                map(value => this.filtroFraccion(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        })
    }
    private filtroFraccion(value: string): any {
        const filterValue = value;

        return this.listaFraccion.filter(data => data.descripcion.toLowerCase().includes(filterValue));
    }

    displayFn(fraccion: any): string {
        return fraccion && fraccion.descripcion ? fraccion.descripcion : '';
    }

    //Método para filtrar por Fracción
    opcionSelectFraccion(event) {
        this.selectedIdFraccion = event.option.value.generalesId;
    }

    /**
     * Filtro para el parentesco 
     */
    spsParentesco() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catParentesco, 'listaGeneralCategoria').subscribe(data => {
            
            this.blockUI.stop();

            this.listaParentesco = data;
            this.opcionesParentesco = this.formFamiliarDirectivoFuncionario.get('catParentesco').valueChanges.pipe(
                startWith(''),
                map(value => this.filtroParentesco(value))
            );

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        })
    }
    private filtroParentesco(value: string): any {
        const filterValue = value;

        return this.listaParentesco.filter(data => data.descripcion.toLowerCase().includes(filterValue));
    }

    displayFnParentesco(parentesco: any): string {
        return parentesco && parentesco.descripcion ? parentesco.descripcion : '';
    }

    //Método para filtrar por Fracción
    opcionSelectParentesco(event) {
        this.selectedIdParentesco = event.option.value.generalesId;
    }

    /**
     * Filtro de Funcionarios Familiares para relacionarlos a los familiares
     */
    spsDirFun() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(1, 'listaDirectivoFuncionario').subscribe((data) => {

            this.blockUI.stop();

            if(data[0]){
                this.listaDirFun = JSON.parse(data);
                this.opcionesDirFun = this.formFamiliarDirectivoFuncionario.get('dirFun').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterDirFun(value))
                );
            }


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
   * Muestra el nombre del directivo funcionario
   * @param option --directivo seleccionado seleccionada
   * @returns --nombre de la Sucursal
   */
    displayFnDirFun(option: any): any {
        return option && option.nombre ? option.nombre : ''
    }

    /**
     * Metodo para filtrar Directivo Funcionario
    */
    opcionSelectDirFun(event) {
        this.selectedIdDirFun = event.option.value.direc_fun_id;
    }

    /**
    * Filtra al Directivo Funcionario
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterDirFun(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaDirFun.filter(option => option.nombre.toLowerCase().includes(filterValue));
    }

    /**
  * Carga todos los combos y resetea el form
  */
    nuevoRegistro() {
        this.formFamiliarDirectivoFuncionario.reset();
        this.listaFraccion = [];
        this.listaParentesco = [];
        this.listaFraccion = [];
        this.spsParentesco();
        this.spsFraccion();
        this.listaFamiliarSujetosSucursal = [];
        this.showGuardar = true;
        this.nombresS ="";
    }


    /**
     * Metodo para guardar un nuevo cargo
     */
    registrarParentesco(accion): void {
        if (this.formFamiliarDirectivoFuncionario.invalid) {
            this.validateAllFormFields(this.formFamiliarDirectivoFuncionario);
            return;
        }
        this.accion = accion;
        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }

        const data = {
            datos: [
                this.direcFunFamID,
                this.clienteID,
                this.selectedIdFraccion,
                this.selectedIdParentesco,
                this.formFamiliarDirectivoFuncionario.get('observaciones').value,
                this.formFamiliarDirectivoFuncionario.get('dirFun').value.direcfun_id
            ],
            accion: this.accion
        };

        /**
         * Validacion para arrojar la pantalla emergente con su correspondiente mensaje
         * de acuerdo al tipo de accion al que pertenezca.
         */
        this.service.getListByObjet(data, 'crudDirectivoFuncionarioFamiliar').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                    if(this.accion === 1){
                        this.nuevoRegistro();
                        this.spsSujetoSucursal();
                    }
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error)
            }

        )

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

    /**
     * Valida cada atributo del formulario
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
        return (!value || value == undefined || value == "" || value.length == 0 || value == null );
    }


        /**
     * Bloque de Validaciones
     */
        validaciones = {

            //Validación campos relacion de cargos
            'numeroClientefiltro': [
                { type: 'required', message: 'Campo requerido.' }
            ],
            'catParentesco': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'autocompleteObjectValidator', message: 'El parentesco no existe, seleccione otro registro.' }
            ],
            'catFraccion': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'autocompleteObjectValidator', message: 'La fracción no existe, seleccione otro registro.' }
            ],
            'dirFun': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'autocompleteObjectValidator', message: 'La Directivo no existe, seleccione otro registro.' }
            ]
        };
}