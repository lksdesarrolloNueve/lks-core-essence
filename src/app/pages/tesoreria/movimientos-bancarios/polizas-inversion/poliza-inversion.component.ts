import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { environment } from '../../../../../environments/environment';
import { map, startWith } from "rxjs/operators";
import { MatSort } from "@angular/material/sort";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";
import * as moment from "moment";
import { MatTabChangeEvent } from "@angular/material/tabs";


@Component({
    selector: 'polizas-inversion',
    moduleId: module.id,
    templateUrl: 'poliza-inversion.component.html'

})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 22/09/2022
 * @descripcion: Componente para la gestion de polizas inversiones
 */
export class PolizaInversionComponent implements OnInit {
    /**Declaracion de variables y componentes */
    @BlockUI() blockUI: NgBlockUI

    polizaInvId: number = 0;
    polizaId: number = 0;
    monto: number = 0;
    cveCuentaB: string = '';
    usuarioID: string = '';
    dias = new UntypedFormControl('0');
    fechaIn = new UntypedFormControl('', [Validators.required]);
    fechaFin=new UntypedFormControl('', [Validators.required])
    cuentaBancOri = new UntypedFormControl('', [Validators.required]);
    //Forms
    formPInv: UntypedFormGroup;
    //autocomplete
    listaTipoValor: any = [];
    opcionesTipoValor: Observable<string[]>;
    listaClasificacion: any = [];
    opcionesClasificacion: Observable<string[]>;
    //combos
    listFormaAdq: any = [];
    listInstrumento: any = [];
    listDeuda: any = [];

    //tabla 
    listaPolIn: any = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['emisora', 'inversion', 'fecha', 'tasa',
        'monto', 'deuda', 'instrumento'];
    dataSourcePolInv: MatTableDataSource<any>;
    listaCuentasBancarias: any = [];
    opcionesCuenta: Observable<string[]>;

    accion :number = 1;
    tabIndex: number=0;
    botonGA:string = 'Registrar';
    /**
    * Constructor del componente PolizaInversionComponent
    * @param service - Service para el acceso a datos
    */
    constructor(private service: GestionGenericaService,
        private servicePermisos: PermisosService,
        private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public infPoliza: any, public ventana: MatDialogRef<PolizaInversionComponent>) {
        this.polizaId = infPoliza.idPol;
        this.monto = infPoliza.cantidad;
        this.cveCuentaB = infPoliza.cveCuenta;
        this.formPInv = this.formBuilder.group({
            emisora: new UntypedFormControl('', [Validators.required]),
            usuario: new UntypedFormControl(''),
            noTitulo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            costAdq: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            tasa: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*\.?[0-9]*')]),
            plazo: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            fecha: new UntypedFormControl('', [Validators.required]),
            adquisicion: new UntypedFormControl('', [Validators.required]),
            instrumento: new UntypedFormControl('', [Validators.required]),
            valor: new UntypedFormControl('', [Validators.required]),
            deuda: new UntypedFormControl('', [Validators.required]),
            clasificacion: new UntypedFormControl('', [Validators.required]),
            concepto: new UntypedFormControl('', [Validators.required]),
            monto: new UntypedFormControl(''),
        });
        this.usuarioID=servicePermisos.usuario.id;
        this.formPInv.get('concepto').setValue(infPoliza.concepto);
        this.formPInv.get('monto').setValue(this.monto);
        this.formPInv.get('usuario').setValue(servicePermisos.usuario.firstName + ' ' + servicePermisos.usuario.lastName);
    }
    /**Inicializacion de componentes */
    ngOnInit() {
        this.spsTipoDeuda();
        this.spsTipoInstrumento();
        this.spsFormaAdquisicion();
        this.spsTipoValor();
        this.spsCuentaBancaria();
        this.spsInversiones();
        this.spsClasificacion();
    }
    /**
            * Metodo para listar los  tipos de deudas para inversiones manuales 
            * por la clave de la categoria
            * @param tipoDeuda
            */
    spsTipoDeuda(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.tipoDeuda, 'listaGeneralCategoria').subscribe(data => {
            this.listDeuda = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
            * Metodo para listar los tipo de instrumentos  para inversiones manuales 
            * por la clave de la categoria
            * @param tipoDeuda
            */
    spsTipoInstrumento(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.tipoInstrumento, 'listaGeneralCategoria').subscribe(data => {
            this.listInstrumento = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
            * Metodo para listar las formas de adquisicion para inversiones manuales 
            * por la clave de la categoria
            * @param tipoDeuda
            */
    spsFormaAdquisicion(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.formaAdquisicion, 'listaGeneralCategoria').subscribe(data => {
            this.listFormaAdq = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
        * Listar tipo valor  por la clave de categoria
        * @param tipoValor
        */
    spsTipoValor() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.tipoValor, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoValor = data;
            this.opcionesTipoValor = this.formPInv.get('valor').valueChanges.pipe(
                startWith(''),
                map(value => this._filterTipoValor(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Muestra la descripcion del tipo valor
    * @param option --pais seleccionada
    * @returns --nombre del pais
    */
    mostrarTipoValor(option: any): any {
        return option ? option.descripcion : undefined;
    }

    /**
    * Filtra los valores de la lista listaTipoValor
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterTipoValor(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaTipoValor.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }

    /**
        * Listar tipo valor  por la clave de categoria
        * @param tipoValor
        */
    spsClasificacion() {
        this.blockUI.start('Cargando datos...');
        this.service.getList('spsClasificacionInv').subscribe(data => {
            this.listaClasificacion = data;
            this.opcionesClasificacion = this.formPInv.get('clasificacion').valueChanges.pipe(
                startWith(''),
                map(value => this._filterClasificacion(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Muestra la descripcion del tipo valor
    * @param option --pais seleccionada
    * @returns --nombre del pais
    */
    mostrarClasificacion(option: any): any {
        return option ? option.nombreContable : undefined;
    }

    /**
    * Filtra los valores de la lista listaTipoValor
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterClasificacion(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaClasificacion.filter(option => option.nombreContable.toLowerCase().includes(filterValue));
    }
    /**
   * Busca cuenta bancarias.
   */
    spsCuentaBancaria() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCuentaBancariaTsr').subscribe(
            (data: any) => {
                this.listaCuentasBancarias = data;
                this.opcionesCuenta = this.cuentaBancOri.valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterCuenta(value))
                );

                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });
    }
    /**
   * Filtra los valores de la lista listaCuentasBancarias
   * @param value --texto de entrada
   * @returns la opcion u opciones que coincidan con la busqueda
   */
    private _filterCuenta(value: any): any {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentasBancarias.filter(option => option.claveCuenta.toLowerCase().includes(filterValue));
    }
    /**
     * Muestra la clave de la cuenta bancaria
     * @param option texto ingresado
     * @returns cuenta bancaria que coincide
     */
    displayCuentaBancOri(option: any): any {
        return option ? option.claveCuenta : undefined;

    }
 /**
   * Metodo para invocar la lista de generales y que se actualice la lista
   * al dar de baja o alta la categoria
   * 0 lista, 1 formulario
   * */
  tabSeleccionada(changeEvent: MatTabChangeEvent) {
        this.tabIndex = changeEvent.index;
  }
    /**
     * Obtiene los datos del registro a Editar
     * @param inf - Infomacion del registro seleccionado
     */
    obtenerRegistro(inf: any) {
        this.polizaInvId=inf.pol_inver_id;
        this.polizaId=inf.poliza_id;
        this.formPInv.get('emisora').setValue(inf.emisora);
        this.usuarioID=inf.usuario_id;
        this.formPInv.get('usuario').setValue(inf.usuario);
        this.formPInv.get('noTitulo').setValue(inf.num_titulos);
        this.formPInv.get('costAdq').setValue(inf.costo_adq);
        this.formPInv.get('tasa').setValue(inf.tasa);
        this.formPInv.get('plazo').setValue(inf.plazo);
        this.formPInv.get('fecha').setValue(inf.fecha_inver+ 'T00:00:00');
        let forAd= this.listFormaAdq.find(f=>f.cveGeneral===inf.cve_forma_adq);
        this.formPInv.get('adquisicion').setValue(forAd);
        let inst=this.listInstrumento.find(i => i.cveGeneral===inf.cve_instrumento);
        this.formPInv.get('instrumento').setValue(inst);
        let valor=this.listaTipoValor.find(v => v.cveGeneral===inf.cve_operacion);
        this.formPInv.get('valor').setValue(valor);
        let deuda=this.listDeuda.find(d => d.cveGeneral===inf.cve_deuda);
        this.formPInv.get('deuda').setValue(deuda);
       let clas= this.listaClasificacion.find(c => c.numContable == inf.clas_contable);
        this.formPInv.get('clasificacion').setValue(clas);
        this.formPInv.get('concepto').setValue(inf.inversion);
        this.formPInv.get('monto').setValue(inf.monto);
        this.accion=2;
        this.tabIndex = 1;
        this.botonGA='Actualizar';

    }
    /**
     * CRUD Inversion PolizaInversion
     * Se asocia la inversioncon la poliza seleccionada
     */
    crudPolizaInversion() {
        this.blockUI.start('Cargando datos...')
        if (this.formPInv.invalid) {
            this.validateAllFormFields(this.formPInv);
            this.blockUI.stop();
            return;
        }
        let jsonDatos = {
            "datos": [
                this.polizaInvId,
                this.polizaId,
                this.formPInv.get('plazo').value,
                this.formPInv.get('deuda').value.generalesId,
                this.formPInv.get('tasa').value,
                this.formPInv.get('concepto').value,
                this.monto,//monto
                0,//remanente
                this.formPInv.get('emisora').value,
                this.formPInv.get('noTitulo').value,
                this.formPInv.get('costAdq').value,
                this.formPInv.get('instrumento').value.generalesId,
                this.formPInv.get('fecha').value,
                this.formPInv.get('clasificacion').value.numContable,
                this.usuarioID,
                this.formPInv.get('valor').value.generalesId,
                this.formPInv.get('adquisicion').value.generalesId,



            ],
            "accion": this.accion
        }
        this.service.registrar(jsonDatos, 'crudPolInversion').subscribe(
            result => {
                if (result[0][0] === '0') {
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                    this.ventana.close();
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
                }
                this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            }
        );


    }
    /**Metod que valida se hayan selececcionado por campos antes de realizar 
     * una busquedad de inversion con parametros*/
    validarBusqueda() {
        if (this.cuentaBancOri.invalid) {
            if (this.cuentaBancOri instanceof UntypedFormControl) {
                this.cuentaBancOri.markAsTouched({ onlySelf: true });
            }
            return;
        }
        if (this.fechaIn.invalid) {
            if (this.fechaIn instanceof UntypedFormControl) {
                this.fechaIn.markAsTouched({ onlySelf: true });
            }
            return;
        }
        this.spsInversiones();
    }
    /**
     * Lista los registro de inversiones polizas
     */
    spsInversiones() {
        let claveCuen = '';
        let fecha = '';
        let fechaFin = '';
        let params = '';
        if (!this.vacio(this.cuentaBancOri.value.claveCuenta)) {
            claveCuen = this.cuentaBancOri.value.claveCuenta;
        }
        if (!this.vacio(this.fechaIn.value)) {
            fecha = moment(this.fechaIn.value).format("YYYY-MM-DD");
           
        }
        if(!this.vacio(this.fechaFin.value)){
            fechaFin = moment(this.fechaFin.value).format("YYYY-MM-DD");
            params = claveCuen + '/' + this.dias.value + '/' + fecha+'/'+fechaFin;
        }

        this.service.getListByArregloIDs(params, 'spsPolInversion').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaPolIn = JSON.parse(data);
                this.dataSourcePolInv = new MatTableDataSource(this.listaPolIn);
                this.dataSourcePolInv.paginator = this.paginator;
                this.dataSourcePolInv.sort = this.sort;
            } else {
                this.service.showNotification('top', 'right', 3, 'No se encontraron movimientos.');
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Metodo para filtrar movimientos
    * @param event --evento a filtrar
    */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourcePolInv.filter = filterValue.trim().toLowerCase();
        if (this.dataSourcePolInv.paginator) {
            this.dataSourcePolInv.paginator.firstPage();
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
    /**
    * Metodo que contine todos los mensajes de las validaciones de los formularios
    */
    validaciones = {

        'cuentaBancOri': [
            { type: 'required', message: 'Campo requerido.' }],
        'fechaIn': [
            { type: 'required', message: 'Campo requerido.' }],
        'emisora': [
            { type: 'required', message: 'Campo requerido.' }],
        'noTitulo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo numeros.' }],
        'costAdq': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo numeros.' }],
        'tasa': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo numeros.' }],
        'plazo': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo numeros.' }],
        'fecha': [
            { type: 'required', message: 'Campo requerido.' }],
        'adquisicion': [
            { type: 'required', message: 'Campo requerido.' }],
        'instrumento': [
            { type: 'required', message: 'Campo requerido.' }],
        'valor': [
            { type: 'required', message: 'Campo requerido.' }],
        'deuda': [
            { type: 'required', message: 'Campo requerido.' }],
        'clasificacion': [
            { type: 'required', message: 'Campo requerido.' }],
        'concepto': [
            { type: 'required', message: 'Campo requerido.' }],
    }
}