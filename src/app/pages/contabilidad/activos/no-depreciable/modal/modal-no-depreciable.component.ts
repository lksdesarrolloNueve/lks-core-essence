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
    selector: 'modal-no-depreciable',
    moduleId: module.id,
    templateUrl: 'modal-no-depreciable.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 09/12/2022
 * @descripcion: Componente para la gestion de Activo Fijo No Depreciable
 */
export class ModalNoDepreciableComponent implements OnInit {

    //Declaracion de variables y componentes
    encabezado: string = '';
    formNoDepreciable: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;
    listaParam:any=[];
    listaTipoAct: any = [];
    opcionesTipoAct: Observable<string[]>;

    listaINPC: any = [];
    opcionesIncp: Observable<string[]>;
    isCheck:boolean=false;
    isUnidad: boolean = true;
    sucursalId: number = 0;
    usuarioId: number = 0;
    consecutivo: string = '';
    unidad: string = '';

    activoID: number = 0;

    /**
  * Constructor de la clase ModalDepreciableComponent
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, private modal: MatDialogRef<ModalNoDepreciableComponent>, private permisosService: PermisosService, public dialog: MatDialog) {

        this.encabezado = data.titulo;
        this.formNoDepreciable = this.formbuilder.group({
            usuario: new UntypedFormControl(''),
            vigente: new UntypedFormControl(true),
            tpActivo: new UntypedFormControl('', Validators.required),
            sucursal: new UntypedFormControl(''),
            comUnidad: new UntypedFormControl(false),
            unidades: new UntypedFormControl('1'),
            actSuc: new UntypedFormControl(''),
            factura: new UntypedFormControl('', [Validators.required, Validators.pattern("^[0-9A-Za-z]*$"), Validators.maxLength(9)]),
            consecutivo: new UntypedFormControl(''),
            unidad:new UntypedFormControl('00'),
            concepto: new UntypedFormControl('',Validators.required),
            moi: new UntypedFormControl('',[Validators.required,Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            total: new UntypedFormControl(''),
            ffactura: new UntypedFormControl('',Validators.required),
            descripcion: new UntypedFormControl(''),
        });

        if(this.data.accion==2){
            this.sucursalId = data.datos.sucursalid;
            this.usuarioId = data.datos.usuario_id;
            this.activoID=data.datos.activo_id;
            this.editarDatos();
            

        }else{
        this.sucursalId = this.permisosService.sucursalSeleccionada.sucursalid;
        this.usuarioId = this.permisosService.usuario.id;
        this.formNoDepreciable.get('sucursal').setValue(this.permisosService.sucursalSeleccionada.cveSucursal);
        this.formNoDepreciable.get('usuario').setValue(this.permisosService.usuario.firstName + ' ' + this.permisosService.usuario.lastName);
        }
    }
    ngOnInit() {
        this.spsTipoActivos();
        this.spsParamActivos();
    }
    /**
     * Metodo para listar parametros spsParametros
     */
    spsParamActivos(){
        this.service.getListByID(1, 'spsParametros').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaParam = JSON.parse(data);
            }
        });
    }
    /**
    * Método que en lista todos los tipos de activos
    * accion 1 muestra todos los activos
    */
    spsTipoActivos() {
        this.service.getListByID(1, 'spsTipoActivos').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaTipoAct = JSON.parse(data);
                // Se setean TIPO ACTIVOS para el autocomplete
                this.opcionesTipoAct = this.formNoDepreciable.get('tpActivo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterTA(value)));
                    if(this.data.accion==2){
                        let activo;
                       activo= this.listaTipoAct.find(ta=>ta.tipo_activo_id==this.data.datos.tipo_activo_id);
                       this.formNoDepreciable.get('tpActivo').setValue(activo);
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
        return this.listaTipoAct.filter(option => option.nombre.toLowerCase().trim().includes(filterValue));
    }
    displayTA(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    /**
     * Activo Seleccionado
     * @param tActi TipoActivo seleccionado
     */
    tActivoSeleccionado(tActi) {
       this.formNoDepreciable.get('actSuc').setValue(this.formNoDepreciable.get('sucursal').value + '-' + tActi.option.value.clave); 
       this.spsActivoConsecutivo();
    }
    /**
         * Método para obtener el consecutivo
         * accion 3 muestra el consecutivo del tipo de activo seleccionado
         */
    spsActivoConsecutivo() {

        let path;
        let consecutivo;
        if (this.sucursalId > 0) {
            path = this.sucursalId + "/" + this.formNoDepreciable.get('tpActivo').value.tipo_activo_id + "/" + 3;
        }
        this.service.getListByID(path, 'spsActivoDepreciable').subscribe(data => {
            consecutivo = JSON.parse(data);
            if (!this.vacio(consecutivo[0].consecutivo)) {

                this.consecutivo = consecutivo[0].consecutivo;
                this.unidad = consecutivo[0].unidad;
                if(this.data.accion==2){
                    this.formNoDepreciable.get('consecutivo').setValue(moment(this.formNoDepreciable.get('ffactura').value).format("YY")+'-' + this.consecutivo);
                }else{
                    this.formNoDepreciable.get('consecutivo').setValue('00-' + this.consecutivo);  
                }
                this.formNoDepreciable.get('unidad').setValue('-' +  this.unidad);
            } else {//no hay resgistros
                this.formNoDepreciable.get('consecutivo').setValue('00-' + '00001');
                this.formNoDepreciable.get('unidad').setValue('-00');
            }
        }

        );
    }
    /**
     * Metodo encargado de tomar los ultimos digitos del año
     * @param fecha 
     */
    cambioFecha(fecha) {

        if(!this.vacio(this.consecutivo)){
            this.formNoDepreciable.get('consecutivo').setValue(moment(fecha).format("YY") + '-' + this.consecutivo);
            this.formNoDepreciable.get('unidad').setValue('-' + this.unidad);
        }else{
            this.formNoDepreciable.get('consecutivo').setValue(moment(fecha).format("YY") + '-00001');
            this.formNoDepreciable.get('unidad').setValue('-00');
        }
        this.formNoDepreciable.get('total').setValue(this.formNoDepreciable.get('moi').value*this.formNoDepreciable.get('unidades').value);
   
    }
 

  
    /**
     * Cambio en la cantidad de unidades
     */
    cambioUnidades() {
       if(this.formNoDepreciable.get('comUnidad').value){
        this.isUnidad = false;
       }else{
        this.isUnidad = true;
        this.formNoDepreciable.get('unidades').setValue(1);
       }
    }
  
    /**
     * Metodo crud Activo depreciables
     */
    crudActivo() {
        this.blockUI.start('Cargando datos...');
        if (this.formNoDepreciable.invalid) {
            this.validateAllFormFields(this.formNoDepreciable);
            return this.blockUI.stop();
        }
        //Valida moi < al activoFijo de parametros
       
        let clave;
        clave= this.formNoDepreciable.get('actSuc').value+'-'+this.formNoDepreciable.get('factura').value+'-'+this.formNoDepreciable.get('consecutivo').value;
        let jsonData = {
            "datos": [this.activoID, clave,
            this.formNoDepreciable.get('concepto').value,
            this.formNoDepreciable.get('moi').value,
            this.sucursalId,
            this.formNoDepreciable.get('tpActivo').value.tipo_activo_id,
            moment(this.formNoDepreciable.get('ffactura').value).format("YYYY-MM-DD"),
            this.formNoDepreciable.get('vigente').value,
            this.formNoDepreciable.get('descripcion').value,
            this.usuarioId, 
            this.formNoDepreciable.get('unidades').value,
            this.formNoDepreciable.get('total').value

            ], "accion": this.data.accion
        };
        
         this.service.registrar(jsonData, 'crudActNoDepreciable').subscribe(result => {
           if (result[0][0] === '0') {
     
             this.service.showNotification('top', 'right', 2, result[0][1]);
             this.blockUI.stop();
           } else {
             this.service.showNotification('top', 'right', 3, result[0][1]);
             this.blockUI.stop();
           }
           //CERRAR modal 
           this.modal.close();
         }, error => {
           this.blockUI.stop();
           this.service.showNotification('top', 'right', 4, error.error + '<br>' + error.trace);
         });
       
    }
    /**
     * Metodo para mostrar los datos a editar
     */
    editarDatos(){
    this.formNoDepreciable.get('sucursal').setValue(this.data.datos.cve_sucursal);
            this.formNoDepreciable.get('usuario').setValue(this.data.datos.username);
            this.formNoDepreciable.get('unidades').setValue(this.data.datos.unidad);
            //no se modifican la cantidad de unidades
            this.isCheck=true;
            if(this.data.datos.unidades>1){
                this.formNoDepreciable.get('comUnidad').setValue(true);
                this.isUnidad = false;
            }else{
                this.formNoDepreciable.get('comUnidad').setValue(false);
                this.isUnidad = true;
            }
            //Clave
            let clave = this.data.datos.clave.split("-", 6); 
            this.formNoDepreciable.get('actSuc').setValue(clave[0]+'-'+clave[1]);
            this.formNoDepreciable.get('factura').setValue(clave[2]);
            this.formNoDepreciable.get('consecutivo').setValue(clave[3]+'-'+clave[4]);
            this.formNoDepreciable.get('unidad').setValue(clave[5]);

            this.formNoDepreciable.get('concepto').setValue(this.data.datos.concepto);
            this.formNoDepreciable.get('moi').setValue(this.data.datos.moi);
            this.formNoDepreciable.get('total').setValue(this.data.datos.costo_total);
            this.formNoDepreciable.get('ffactura').setValue(this.data.datos.fecha_factura+'T00:00:00');
            this.formNoDepreciable.get('descripcion').setValue(this.data.datos.descripcion);
            this.formNoDepreciable.get('vigente').setValue(this.data.datos.vigencia);
}
    /**
     * Validaciones del formulario
     */
    validaciones = {
        'tpActivo': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'factura': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Máximo 7 caracteres.' }
        ],
        'concepto': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'moi': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'ffactura': [
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
            if (control instanceof UntypedFormControl) {             //4
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