import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";

@Component({
    selector: 'modal-detalle',
    moduleId: module.id,
    templateUrl: 'modal-detalle.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 09/12/2022
 * @descripcion: Componente para la gestion de Detalle ActivoComponent
 */
export class ModalDetalleActivoComponent implements OnInit {

    //Declaracion de variables y componentes
    encabezado: string = '';
    formDetalle: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;

    listDepPersona: any = [];
    opcionesPersonaDep: Observable<string[]>;
    opcionesDep: Observable<string[]>;
    listaParam: any = [];
    listaTipoAct: any = [];
    opcionesTipoAct: Observable<string[]>;

    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;

    sucursalId: number = 0;
    usuarioId: number = 0;
    activoID: number = 0;
    detalleID: number = 0;
    clave: string = "";
    isfRecibe: boolean = false;
    isfEntrega: boolean = true;
    /**
  * Constructor de la clase ModalDepreciableComponent
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, private modal: MatDialogRef<ModalDetalleActivoComponent>, private permisosService: PermisosService, public dialog: MatDialog) {

        this.encabezado = data.titulo;
        this.formDetalle = this.formbuilder.group({
            usuario: new UntypedFormControl(''),
            tpActivo: new UntypedFormControl('', Validators.required),
            sucursal: new UntypedFormControl('', Validators.required),
            actSuc: new UntypedFormControl(''),
            factura: new UntypedFormControl(''),
            consecutivo: new UntypedFormControl(''),
            unidad: new UntypedFormControl(''),
            concepto: new UntypedFormControl(''),
            frecibe: new UntypedFormControl('',Validators.required),
            fentrega: new UntypedFormControl(''),
            departamento: new UntypedFormControl('', Validators.required),
            persona: new UntypedFormControl('', Validators.required),
            nombreP: new UntypedFormControl(''),
            departamentoA: new UntypedFormControl(''),
            descripcionR: new UntypedFormControl('', Validators.required),
            descripcionE: new UntypedFormControl(''),
        });
        if (this.data.accion == 2) {
            this.detalleID = data.datos.activo_detalle_id;
            this.sucursalId = data.datos.sucursalid;
            this.usuarioId = data.datos.usuario_id;
            this.activoID = data.datos.activo_id;
            this.editarDatos();

        } else {
            this.usuarioId = this.permisosService.usuario.id;
            this.formDetalle.get('sucursal').setValue(this.permisosService.sucursalSeleccionada.cveSucursal);
            this.formDetalle.get('usuario').setValue(this.permisosService.usuario.firstName + ' ' + this.permisosService.usuario.lastName);
        }
    }
    ngOnInit() {
        this.spsActivos();
        this.spsSucursal();
        this.spsDepPersona();
    }
    /**
     * Lista de sucursales activas
     */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.formDetalle.get('sucursal').setValue(this.listaSucursales);
            this.opcionesSucursal = this.formDetalle.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this.filterSuc(value))
            );
            if (this.data.accion == 2) {
                let suc;
                suc = this.listaSucursales.find(su => su.sucursalid == this.sucursalId);
                this.formDetalle.get('sucursal').setValue(suc);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
 * Filtra la sucursal
 * @param value --texto de entrada
 * @returns la opcion u opciones que coincidan con la busqueda
 */
    private filterSuc(value: any): any {

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
    * @param option --sucursal seleccionado
    * @returns --nombre de sucursal
    */
    displayFnSuc(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }
    /**
    * Método que en lista todos activos no depreciables y depreciables
    * accion 1 muestra todos los activos que no estan dados de baja o cancelados
    */
    spsActivos() {
        this.service.getListByID(1, 'spsActivoDepreciable').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoAct = JSON.parse(data);
                // Se setean TIPO ACTIVOS para el autocomplete
                this.opcionesTipoAct = this.formDetalle.get('tpActivo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterTA(value)));
                if (this.data.accion == 2) {
                    let activo;
                    activo = this.listaTipoAct.find(ta => ta.tipo_activo_id == this.data.datos.tipo_activo_id);
                    this.formDetalle.get('tpActivo').setValue(activo);
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
        return this.listaTipoAct.filter(option => option.nombre.toLowerCase().trim().includes(filterValue) || option.concepto.toLowerCase().trim().includes(filterValue));
    }
    displayTA(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }


    /**
    * Método que en lista los departamentos y personas en detalle de activos
    * accion 3 muestra todas las personas o departamentos
    */
    spsDepPersona() {
        this.service.getListByID(3, 'spsDetalleActivo').subscribe(data => {

            if (!this.vacio(data)) {
                this.listDepPersona = JSON.parse(data);
                this.opcionesPersonaDep = this.formDetalle.get('nombreP').valueChanges.pipe(startWith(''),
                    map(value => this._filterPD(value)))
                this.opcionesDep = this.formDetalle.get('departamentoA').valueChanges.pipe(startWith(''),
                    map(value => this._filterPD(value)))
            }

        });
    }

    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterPD(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listDepPersona.filter(option => option.nombre_persona.toLowerCase().trim().includes(filterValue)
            || option.departamento.toLowerCase().trim().includes(filterValue));
    }
    displayFnNomP(option: any): any {
        return option ? option.nombre_persona.trim() : undefined;
    }
    displayFnDeparta(option: any): any {
        return option ? option.departamento.trim() : undefined;

    }
    /**
     * Metodo para obtener la seleccion del empleado
     */
    nombreSeleccion(persona) {
        this.formDetalle.get('persona').setValue(persona.nombre_persona);

    }
    /**
    * Metodo para obtener la seleccion del departamento
    */
    depaSeleccion(depa) {
        this.formDetalle.get('departamento').setValue(depa.departamento);

    }
    /**
     * Activo Seleccionado
     * @param tActi TipoActivo seleccionado
     */
    tActivoSeleccionado(tActi) {

        this.activoID = tActi.option.value.activo_id;
        this.clave = tActi.option.value.clave;
        let clave = tActi.option.value.clave.split("-", 6);
        this.formDetalle.get('actSuc').setValue(clave[0] + '-' + clave[1]);
        this.formDetalle.get('factura').setValue(clave[2]);
        this.formDetalle.get('consecutivo').setValue(clave[3] + '-' + clave[4]);
        this.formDetalle.get('unidad').setValue(clave[5] === '' ? '00' : clave[5]);
        this.formDetalle.get('concepto').setValue(tActi.option.value.concepto);

    }


    /**
     * Metodo crud Detalle Activo 
     */
    crudDetalleActivo() {
        this.blockUI.start('Cargando datos...');
        if (this.formDetalle.invalid) {
            this.validateAllFormFields(this.formDetalle);
            return this.blockUI.stop();
        }

        let entrega = this.formDetalle.get('fentrega').value === '' ? null : moment(this.formDetalle.get('fentrega').value).format("YYYY-MM-DD");
        if (this.data.accion == 2) {

            if (moment(this.formDetalle.get('fentrega').value).format("YYYY-MM-DD") <= moment(this.formDetalle.get('frecibe').value).format("YYYY-MM-DD")) {

                this.service.showNotification('top', 'right', 2, 'La fecha de entrega es menor o igual a la fecha de recibido.');
                return this.blockUI.stop();
            }
        }
        let jsonData = {
            "datos": [this.detalleID,
            this.activoID,
            this.formDetalle.get('sucursal').value.sucursalid,
            this.formDetalle.get('departamento').value,
            this.formDetalle.get('persona').value,
            moment(this.formDetalle.get('frecibe').value).format("YYYY-MM-DD"),
                entrega,
            this.formDetalle.get('descripcionE').value,
            this.formDetalle.get('descripcionR').value,
            this.usuarioId
            ], "accion": this.data.accion
        };


        this.service.registrar(jsonData, 'crudActivoDetalle').subscribe(result => {
            if (result[0][0] === '0') {

                this.service.showNotification('top', 'right', 2, result[0][1]);
                this.blockUI.stop();
            } else {
                this.service.showNotification('top', 'right', 3, result[0][1]);
                this.blockUI.stop();
            }
            //CERRAR modal 
            this.modal.close({ tActivoId: this.formDetalle.get('tpActivo').value.tipo_activo_id, sucursalId: this.formDetalle.get('sucursal').value.sucursalid });
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
        });

    }
    /**
     * Metodo para mostrar los datos a editar
     */
    editarDatos() {
        this.isfRecibe = true;
        this.isfEntrega = false;
        this.formDetalle.get('usuario').setValue(this.data.datos.username);
        //Clave
        let clave = this.data.datos.clave.split("-", 6);

        this.formDetalle.get('actSuc').setValue(clave[0] + '-' + clave[1]);
        this.formDetalle.get('factura').setValue(clave[2]);
        this.formDetalle.get('consecutivo').setValue(clave[3] + '-' + clave[4]);

        this.formDetalle.get('unidad').setValue(clave[5] === '' ? '00' : clave[5]);
        this.formDetalle.get('concepto').setValue(this.data.datos.concepto);
        this.formDetalle.get('frecibe').setValue(this.data.datos.fecha_recibe + 'T00:00:00');
        this.formDetalle.get('fentrega').setValue(this.data.datos.fecha_entrega===null ?'': this.data.datos.fecha_entrega+'T00:00:00');
        this.formDetalle.get('persona').setValue(this.data.datos.nombre_persona);
        this.formDetalle.get('departamento').setValue(this.data.datos.departamento);
        this.formDetalle.get('descripcionR').setValue(this.data.datos.descripcionr);
        this.formDetalle.get('descripcionE').setValue(this.data.datos.descripcione);
    }
    /**
     * Validaciones del formulario
     */
    validaciones = {
        'tpActivo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'descripcionR': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'frecibe': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'persona': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'departamento': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'sucursal': [
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
            if (control instanceof UntypedFormControl) {     
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