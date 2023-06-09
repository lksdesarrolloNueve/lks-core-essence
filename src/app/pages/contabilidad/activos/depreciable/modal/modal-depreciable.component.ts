import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import * as moment from "moment";
import { ModalIncpComponent } from "./modal-incp.component";


@Component({
    selector: 'modal-depreciable',
    moduleId: module.id,
    templateUrl: 'modal-depreciable.component.html',

})

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 29/11/2022
 * @descripcion: Componente para la gestion de Activo Fijo Depreciable
 */
export class ModalDepreciableComponent implements OnInit {

    //Declaracion de variables y componentes
    encabezado: string = '';
    formDepreciable: UntypedFormGroup;
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
    incpValor:any = [];

    /**
  * Constructor de la clase ModalDepreciableComponent
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any, private modal: MatDialogRef<ModalDepreciableComponent>, private permisosService: PermisosService, public dialog: MatDialog) {

        this.encabezado = data.titulo;
        this.formDepreciable = this.formbuilder.group({
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
            tasa: new UntypedFormControl(''),
            mdepreciar: new UntypedFormControl(''),
            ffactura: new UntypedFormControl('',Validators.required),
            fdepreciar: new UntypedFormControl(''),
            inpc: new UntypedFormControl('',Validators.required),
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
        this.formDepreciable.get('sucursal').setValue(this.permisosService.sucursalSeleccionada.cveSucursal);
        this.formDepreciable.get('usuario').setValue(this.permisosService.usuario.firstName + ' ' + this.permisosService.usuario.lastName);
        }
    }
    ngOnInit() {
        this.spsTipoActivos();
        this.spslistaInpc();
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
                this.opcionesTipoAct = this.formDepreciable.get('tpActivo').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterTA(value)));
                    if(this.data.accion==2){
                        let activo;
                       activo= this.listaTipoAct.find(ta=>ta.tipo_activo_id==this.data.datos.tipo_activo_id);
                       this.formDepreciable.get('tpActivo').setValue(activo);
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

        this.formDepreciable.get('tasa').setValue(tActi.option.value.porcentaje);
        this.formDepreciable.get('mdepreciar').setValue(tActi.option.value.meses_por_depreciar);
        this.formDepreciable.get('actSuc').setValue(this.formDepreciable.get('sucursal').value + '-' + tActi.option.value.clave);
        
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
            path = this.sucursalId + "/" + this.formDepreciable.get('tpActivo').value.tipo_activo_id + "/" + 3;
        }
        this.service.getListByID(path, 'spsActivoDepreciable').subscribe(data => {
            consecutivo = JSON.parse(data);
            if (!this.vacio(consecutivo[0].consecutivo)) {
                this.consecutivo = consecutivo[0].consecutivo;
                this.unidad = consecutivo[0].unidad;
                if(this.data.accion==2){
                    this.formDepreciable.get('consecutivo').setValue(moment(this.formDepreciable.get('ffactura').value).format("YY")+'-' + this.consecutivo);
                }else{
                    this.formDepreciable.get('consecutivo').setValue('00-' + this.consecutivo);  
                }
                this.formDepreciable.get('unidad').setValue('-' +  this.unidad);
            } else {//no hay resgistros
                this.formDepreciable.get('consecutivo').setValue('00-' + '00001');
                this.formDepreciable.get('unidad').setValue('-00');
            }
        }

        );
    }
    /**
     * Metodo encargado de tomar los ultimos digitos del año
     * @param $event 
     */
    cambioFecha(fecha) {
        let incpFecha=fecha.getFullYear()+'-'+(fecha.getMonth()+1)+'-01';
        this.incpValor= this.listaINPC.find(i =>i.fecha ===incpFecha);
        this.formDepreciable.get('inpc').setValue(this.incpValor);

        let primerDia = new Date(fecha.getFullYear(), fecha.getMonth(), 1);
        this.formDepreciable.get('fdepreciar').setValue(primerDia);

        if(!this.vacio(this.consecutivo)){
            this.formDepreciable.get('consecutivo').setValue(moment(fecha).format("YY") + '-' + this.consecutivo);
            this.formDepreciable.get('unidad').setValue('-' + this.unidad);
        }else{
            this.formDepreciable.get('consecutivo').setValue(moment(fecha).format("YY") + '-00001');
            this.formDepreciable.get('unidad').setValue('-00');
        }
        this.selectInpc();
    }
    /**
        * Metodo que lista los registros de inpc
        */

    spslistaInpc() {
        this.blockUI.start('Cargando...');
        this.service.getListByID(1, 'listaINPC').subscribe(
            (data: any) => {
                this.listaINPC = data;
                this.opcionesIncp = this.formDepreciable.get('inpc').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterIncp(value)));
                  
                    if(this.data.accion==2){
                        let inpc;
                       inpc= this.listaINPC.find(i=>i.inpcid==this.data.datos.inpc_id);
                       this.formDepreciable.get('inpc').setValue(inpc);
                    }
                    this.blockUI.stop();
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    }
    /**
    * Filtra el tipo de credito
    * @param value --texto de entrada
    * @returns la opcion u opciones que coincidan con la busqueda
    */
    private _filterIncp(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaINPC.filter(option => option.cvinpc.includes(filterValue));
    }
    displayIncp(option: any): any {
        return option ? option.inpcD : undefined;

    }

    /**
* Metodo para abrir ventana modal agregar Indice Nacional de precios
*
*/
    agregarINCP() {
        let titulo = "Agregar Indice Nacional de Precios al Consumidor";

        //se abre el modal
        const dialogRef = this.dialog.open(ModalIncpComponent, {
            disableClose: true,
            data: {
                titulo: titulo
            }
        });
        dialogRef.afterClosed().subscribe(result => {
            //cargar lista  para autocomplete
            this.spslistaInpc();
        });
    }
    /**
     * Cambio en la cantidad de unidades
     */
    cambioUnidades() {
       if(this.formDepreciable.get('comUnidad').value){
        this.isUnidad = false;
       }else{
        this.isUnidad = true;
        this.formDepreciable.get('unidades').setValue(1);
       }
    }
    /**
     * Seleccion de INPrecio al Consumidor
     */
    selectInpc(){

        this.formDepreciable.get('total').setValue(this.formDepreciable.get('moi').value*this.formDepreciable.get('unidades').value);
    }
    /**
     * Metodo crud Activo depreciables
     */
    crudActivo() {
        this.blockUI.start('Cargando datos...');
        if (this.formDepreciable.invalid) {
            this.validateAllFormFields(this.formDepreciable);
            return this.blockUI.stop();
        }
        //actualizar el total
        this.selectInpc();
        //Valida moi < al activoFijo de parametros
        
        let clave;
        clave= this.formDepreciable.get('actSuc').value+'-'+this.formDepreciable.get('factura').value+'-'+this.formDepreciable.get('consecutivo').value;
        let jsonData = {
            "datos": [this.activoID, clave,
            this.formDepreciable.get('concepto').value,
            this.formDepreciable.get('moi').value,
            this.sucursalId,
            this.formDepreciable.get('tpActivo').value.tipo_activo_id,
            moment(this.formDepreciable.get('ffactura').value).format("YYYY-MM-DD"),
            moment(this.formDepreciable.get('fdepreciar').value).format("YYYY-MM-DD"),
            this.formDepreciable.get('vigente').value,
            this.formDepreciable.get('descripcion').value,
            this.formDepreciable.get('inpc').value.inpcid,
            this.usuarioId, 
            this.formDepreciable.get('unidades').value,
            this.formDepreciable.get('total').value,
            this.formDepreciable.get('mdepreciar').value,
            this.formDepreciable.get('tasa').value

            ], "accion": this.data.accion
        };
        
         this.service.registrar(jsonData, 'crudActivoDepreciable').subscribe(result => {
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
    this.formDepreciable.get('sucursal').setValue(this.data.datos.cve_sucursal);
            this.formDepreciable.get('usuario').setValue(this.data.datos.username);
            this.formDepreciable.get('unidades').setValue(this.data.datos.unidad);
            //no se modifican la cantidad de unidades
            this.isCheck=true;
            if(this.data.datos.unidades>1){
                this.formDepreciable.get('comUnidad').setValue(true);
                this.isUnidad = false;
            }else{
                this.formDepreciable.get('comUnidad').setValue(false);
                this.isUnidad = true;
            }
            this.formDepreciable.get('tasa').setValue(this.data.datos.porcentaje);
            this.formDepreciable.get('mdepreciar').setValue(this.data.datos.meses);
            //Clave
            let clave = this.data.datos.clave.split("-", 6); 
            this.formDepreciable.get('actSuc').setValue(clave[0]+'-'+clave[1]);
            this.formDepreciable.get('factura').setValue(clave[2]);
            this.formDepreciable.get('consecutivo').setValue(clave[3]+'-'+clave[4]);
            this.formDepreciable.get('unidad').setValue(clave[5]);

            this.formDepreciable.get('concepto').setValue(this.data.datos.concepto);
            this.formDepreciable.get('moi').setValue(this.data.datos.moi);
            this.formDepreciable.get('total').setValue(this.data.datos.costo_total);
            this.formDepreciable.get('tasa').setValue(this.data.datos.porcentaje);
            this.formDepreciable.get('fdepreciar').setValue(this.data.datos.fecha_depreciar+'T00:00:00');
            this.formDepreciable.get('ffactura').setValue(this.data.datos.fecha_factura+'T00:00:00');
            this.formDepreciable.get('descripcion').setValue(this.data.datos.descripcion);
            this.formDepreciable.get('vigente').setValue(this.data.datos.vigencia);
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
        ],
        'inpc': [
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