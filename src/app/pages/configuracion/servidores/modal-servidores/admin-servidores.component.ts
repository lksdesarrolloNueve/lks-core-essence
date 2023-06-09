import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { MatAutocompleteSelectedEvent } from "@angular/material/autocomplete";

/**
* @autor: Juan Eric Juarez
* @version: 1.0.0
* @fecha: 17/09/2021
* @descripcion: Componente para la gestion de servidores
*/
@Component({
    selector: 'admin-servidores',
    moduleId: module.id,
    templateUrl: 'admin-servidores.component.html',
})
export class AdministracionServidoresComponent implements OnInit {

    //Declaracion de variables y componentes
    titulo = 'SERVIDOR';
    encabezado: string;
    accion: number;
    color: ThemePalette = 'primary';

    servidorid: number=0;

    @BlockUI() blockUI: NgBlockUI;

    formServidor: UntypedFormGroup;

    sucursales = new UntypedFormControl();


    //Variables Chips Sucursales
    selectable = true;
    removable = true;
    separatorKeysCodes: number[] = [ENTER, COMMA];

    filteredSucursales: Observable<string[]>;
    listaSucursales: any;
    listaLimpiaSucursales: any[] = [];
    arrayIds: any[] = [];

        /**
         * Validacion para los campos
         */
         validaciones = {
            'nombreServidor': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'maxlength', message: 'Campo maximo 255 dígitos.' }
            ],
            'ip': [
                { type: 'required', message: 'Campo requerido.' },
                { type: 'maxlength', message: 'Campo maximo 255 dígitos.' }
            ],
            'nombrebd' :[
                { type: 'required', message: 'Campo requerido.' }
            ],
            'puerto' :[
                { type: 'required', message: 'Campo requerido.' },
                { type: 'maxlength', message: 'Campo maximo 4 dígitos.' },
                { type: 'pattern', message: 'Solo se aceptan enteros.' }
            ],
            'usuario' :[
                { type: 'required', message: 'Campo requerido.' }
            ],
            'contrasenia' :[
                { type: 'required', message: 'Campo requerido.' }
            ],
            'estatus': [
                { type: 'required', message: 'Campo requerido.' }
            ],
        }


    @ViewChild('sucursalInput') sucursalInput: ElementRef<HTMLInputElement>;

    //Fin variables Chips sucursales

    /**
     * Constructor de la clase
     * @param service - Instancia de acceso a datos
     * @param data - Datos recibidos desde el padre
     */
    constructor(private service: GestionGenericaService,
        private fomrBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.listaLimpiaSucursales = [];

        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;

        this.formServidor = this.fomrBuilder.group({
            nombreServidor: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            ip: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            nombrebd: new UntypedFormControl('', [Validators.required]),
            puerto: new UntypedFormControl('', [Validators.required, Validators.maxLength(4), Validators.pattern('[0-9]*')]),
            usuario: new UntypedFormControl('', [Validators.required]),
            contrasenia: new UntypedFormControl('', [Validators.required]),
            estatus : new UntypedFormControl(true)
        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.servidorid = data.servidor.servidorId;
            this.listaLimpiaSucursales = data.servidor.sucursales;

            this.formServidor.get('nombreServidor').setValue(data.servidor.nombreServidor);
            this.formServidor.get('nombrebd').setValue(data.servidor.nombrebd);
            this.formServidor.get('ip').setValue(data.servidor.ip);
            this.formServidor.get('puerto').setValue(data.servidor.puerto);
            this.formServidor.get('usuario').setValue(data.servidor.usuario);
            this.formServidor.get('contrasenia').setValue(data.servidor.contrasenia);
            this.formServidor.get('estatus').setValue(data.servidor.estatus);
        }


    }

    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {

        this.spsSucurales();

    }

  
    /**
     * Metodo crud para servidore 1. Guarda, 2 Editar
     */
    crudServidor() {

        if(this.formServidor.invalid){
            this.validateAllFormFields(this.formServidor);
            return;
        }


        this.blockUI.start('Editando...');

        const data = {

            "servidorId": this.servidorid,
            "nombreServidor": this.formServidor.get('nombreServidor')?.value,
            "ip": this.formServidor.get('ip')?.value,
            "nombrebd": this.formServidor.get('nombrebd')?.value,
            "puerto": this.formServidor.get('puerto')?.value,
            "usuario": this.formServidor.get('usuario')?.value,
            "contrasenia": this.formServidor.get('contrasenia')?.value,
            "estatus": this.formServidor.get('estatus')?.value,
        };

        for (let ids of this.listaLimpiaSucursales) {
            this.arrayIds.push(ids.sucursalid);
        }


        let headerPath = this.arrayIds + '/' + this.accion;

        this.service.registrarBYID(data, headerPath, 'crudServidores').subscribe(
            result => {

                this.blockUI.stop();
                if (result[0][0] === '0') {
                    this.formServidor.reset();
                    this.listaLimpiaSucursales = [];
                    this.service.showNotification('top', 'right', 2, result[0][1]);
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1]);
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

        this.service.getListByID(1,'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listaSucursales = data;
            this.filteredSucursales = this.sucursales.valueChanges.pipe(
                startWith(null),
                map((sucursal: string | null) => sucursal ? this._filter(sucursal) : this.listaSucursales.slice()));

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Inicio Gestion Sucursales Chips
     */


    remove(fruit: string): void {
        const index = this.listaLimpiaSucursales.indexOf(fruit);

        if (index >= 0) {
            this.listaLimpiaSucursales.splice(index, 1);
        }
    }

    selected(event: MatAutocompleteSelectedEvent): void {

        const index = this.listaLimpiaSucursales.indexOf(event.option.value);


        if (index < 0) {
            this.listaLimpiaSucursales.push(event.option.value);
            this.sucursalInput.nativeElement.value = '';
            this.sucursales.setValue(null);
        }

    }

    private _filter(value: any): any[] {
           
        let filterValue = value;

        if(!value[0]){
            filterValue = value;
        }else{
            filterValue = value.toLowerCase();
        }

        return this.listaSucursales.filter(sucursal => sucursal.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
     * Fin Chips
     */


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

}