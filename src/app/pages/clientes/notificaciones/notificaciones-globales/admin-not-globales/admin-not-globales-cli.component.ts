import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { FiresbaseService } from "../../../../../shared/service/service-firebase/firebase.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { globales } from '../../../../../../environments/globales.config';


//https://stackoverflow.com/questions/53478860/how-to-encrypt-and-decrypt-in-angular-6/53478984
//https://www.npmjs.com/package/crypto-js
//https://www.npmjs.com/package/crypto-es

@Component({
    selector: 'admin-not-globales-cli',
    moduleId: module.id,
    templateUrl: 'admin-not-globales-cli.component.html',

})

/**
 * @autor: Juan Eric Juarez
 * @version: 1.0.0
 * @fecha: 08/11/2021
 * @descripcion: Componente para la gestion de avisos para clientes de manera global
 */
export class AdminNotGloClientesComponent implements OnInit {

    //Declaracion de variables y componentes
    titulo = 'NOTIFICACIÓN';
    encabezado: string;
    accion: number;
    formAviso: UntypedFormGroup;
    color: ThemePalette = 'primary';
    sucursal: string = '';
    tipoSocio: string = '';
    descTipoSocio: string = '';
    notificacionID: any;
    avisoID: any;


    listaTipoSocio: any = [];
    listSucursales: any = [];


    opcionesSucursal: Observable<string[]>;

    formNotificacion: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    lblClientes: string =globales.entes;
    lblCliente: string= globales.ente;

    /**
     * Validacion para los campos
     */
    validaciones = {
        'aviso': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
        ],
        'sucursal': [{ type: 'invalidAutocompleteObject', message: 'La sucursal no existe.' },
                     { type: 'required', message: 'Campo requerido.' },
        ],
        'tipoSocio': [
            { type: 'required', message: 'Campo requerido.' },
        ],
        'vigencia': [
            { type: 'required', message: 'Campo requerido.' },
        ]
    }


    constructor(private firebase: FiresbaseService,
        private formbuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formNotificacion = this.formbuilder.group({
            aviso: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            tipoSocio: new UntypedFormControl('', [Validators.required]),
            sucursal: new UntypedFormControl('', {validators: [this.autocompleteObjectValidator()]}),
            vigencia: new UntypedFormControl('', []),
            estatus: new UntypedFormControl(true)
        });

        if(data.accion === 2){
            this.avisoID = data.notificacion.id;
            this.formNotificacion.get('aviso').setValue(data.notificacion.aviso);
            const [day, month, year] = data.notificacion.vigencia.split('/');
            this.formNotificacion.get('vigencia').setValue(new Date(year+'/'+month+'/'+day));
            this.formNotificacion.get('estatus').setValue(data.notificacion.estatus);
        }


    }

    /**
     * 
     */
    ngOnInit() {
        this.spsTipoSocios();
        this.spsSucurales();
    }



    gestionAvisos() {

        if (this.accion === 0) {
            this.crearAviso();
        } else {
            this.modifcarAviso();
        }
    }

    /**
     * Crear un aviso
     * @returns 
     */
    crearAviso() {

        if (this.formNotificacion.invalid) {
            this.validateAllFormFields(this.formNotificacion);
            return;
        }

        let fecha = this.formNotificacion.get('vigencia').value;
        let cveSuc = this.formNotificacion.get('sucursal').value.cveSucursal;
        let sucDes = this.formNotificacion.get('sucursal').value.nombreSucursal;

        if (!this.vacio(fecha)) {
            fecha = this.formNotificacion.get('vigencia').value.toLocaleDateString();
        } else {
            fecha = '';
        }

        if (!this.vacio(cveSuc)) {
            cveSuc = this.formNotificacion.get('sucursal').value.cveSucursal;
            sucDes = this.formNotificacion.get('sucursal').value.nombreSucursal;
        } else {
            cveSuc = null;
            sucDes = null;
        }


        this.blockUI.start('Guardando ...');

        this.firebase.insertar("avisos_globales_socios", {
            aviso: this.formNotificacion.get('aviso').value,
            vigencia: fecha,
            cveSucursal: cveSuc, 
            sucursal: sucDes,  
            tiposocio: this.formNotificacion.get('tipoSocio').value.cveSocio,
            descTipoSocio: this.formNotificacion.get('tipoSocio').value.descripcion,
            estatus: this.formNotificacion.get('estatus').value

        }).then(() => {
            this.formNotificacion.reset();
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El aviso se registro correctamente');
        }, (error) => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });


    }

    /**
     * Modificar aviso.
     * @returns 
     */
    modifcarAviso() {

        if (this.formNotificacion.invalid) {
            this.validateAllFormFields(this.formNotificacion);
            return;
        }

        let fecha = this.formNotificacion.get('vigencia').value;
        let cveSuc = this.formNotificacion.get('sucursal').value.cveSucursal;
        let sucDes = this.formNotificacion.get('sucursal').value.nombreSucursal;

        if (!this.vacio(fecha)) {
            fecha = this.formNotificacion.get('vigencia').value.toLocaleDateString();
        } else {
            fecha = '';
        }

        if (!this.vacio(cveSuc)) {
            cveSuc = this.formNotificacion.get('sucursal').value.cveSucursal;
            sucDes = this.formNotificacion.get('sucursal').value.nombreSucursal;
        } else {
            cveSuc = null;
            sucDes = null;
        }

        this.blockUI.start('Editando ...');

        this.firebase.actualiza("avisos_globales_socios", this.avisoID, {
            aviso: this.formNotificacion.get('aviso').value,
            vigencia: fecha,
            cveSucursal: cveSuc,
            sucursal: sucDes,
            tiposocio: this.formNotificacion.get('tipoSocio').value.cveSocio,
            descTipoSocio: this.formNotificacion.get('tipoSocio').value.descripcion,
            estatus: this.formNotificacion.get('estatus').value
        }).then(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'El aviso se modifico correctamente');
        }, (error) => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }




    /**
     * Metodo para cargar en tabla de tipo socios
     */
    spsTipoSocios() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaTipoSocio').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoSocio = data;

            if(this.data.accion === 2){
                data.forEach((element:any) => {          
                    if(this.data.notificacion.tiposocio === element.cveSocio){
                        this.formNotificacion.get('tipoSocio').setValue(element);
                    }
                });
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listSucursales = data;
            this.opcionesSucursal = this.formNotificacion.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))

                    
            );

            if(this.data.accion === 2){
                data.forEach((element:any) => {                    
                    if(this.data.notificacion.cveSucursal === element.cveSucursal){
                        this.formNotificacion.get('sucursal').setValue(element);
                    }
                });
            }

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }


    /**
     * Filta la categoria
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filterSucursal(value: any): any[] {

        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }

        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listSucursales.filter(option => option.cveSucursal.toLowerCase().includes(filterValue)
            || option.nombreSucursal.toLowerCase().includes(filterValue));
    }


    /**
     * Muestra la descripcion de la cuenta 
     * @param option --cuenta seleccionada
     * @returns -- sucursal
     */
    displayFn(option: any): any {
        return option ? option.cveSucursal + ' / ' + option.nombreSucursal : undefined;
    }


    /**
  * Valida Cada atributo del formulario
  * @param formGroup - Recibe cualquier tipo de FormGroup
  */
    validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
        Object.keys(formGroup.controls).forEach(field => {  //{2}
            const control = formGroup.get(field);             //{3}
            if (control instanceof UntypedFormControl) {             //{4}
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {        //{5}
                this.validateAllFormFields(control);            //{6}
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



    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

}