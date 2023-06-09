import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

@Component({
    selector: 'modal-establecimiento',
    moduleId: module.id,
    templateUrl: 'modal-establecimiento.component.html',

})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 15/05/2022
 * @descripcion: Componente para la gestión de MTCenter
 */
export class ModalEstablecimientoComponent implements OnInit {
    encabezado: string;
    accion: number;

    formEstablecimiento: UntypedFormGroup;
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;
    establecimientoId: number = 0;
    info: any;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente EstablecimientoMTCenterComponent
    * @param service - Service para el acceso a datos
    */
    constructor(private service: GestionGenericaService, private dialog: MatDialogRef<ModalEstablecimientoComponent>,
        private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo;
        this.formEstablecimiento = this.formBuilder.group(
            {
                establecimiento: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(6)]),
                cadena: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(6)]),
                terminal: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*'), Validators.maxLength(6)]),
                sucursal: new UntypedFormControl('', Validators.required),
                estatus: new UntypedFormControl(true)
            });
        this.accion = data.accion;
        if (this.accion == 2) {
            this.info = data.establecimiento;
            this.editarEstabelcimiento(data.establecimiento);

        }

    }

    /**
     * Iniciaizacion de componentes
     */
    ngOnInit() {
        this.spsSucurales();
    }

    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listaSucursales = data;
            this.opcionesSucursal = this.formEstablecimiento.get('sucursal').valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))

            )
            if (this.accion == 2) {
                let suc = this.listaSucursales.find(s => s.sucursalid == this.info.sucursalid);
                this.formEstablecimiento.get('sucursal').setValue(suc);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
    * Filtra las sucursales
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
        return this.listaSucursales.filter(option => option.nombreSucursal.toLowerCase().includes(filterValue));
    }

    /**
        * Muestra la descripcion de la sucursal
        * @param option --sucursal seleccionada
        * @returns --nombre de la sucursal
        */
    mostrarSucursal(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }
    /**Metodo para mostrar los datos en el formulario */
    editarEstabelcimiento(info) {
        this.establecimientoId = info.establecimiento_id;
        this.formEstablecimiento.get('establecimiento').setValue(info.establecimiento);
        this.formEstablecimiento.get('cadena').setValue(info.cadena);
        this.formEstablecimiento.get('terminal').setValue(info.terminal);
        this.formEstablecimiento.get('estatus').setValue(info.estatus);

    }

    /**
     * Metodo CRUD, registrar editar información de un establecimento MTCenter
     * accion 1.- Insert 2.- Editar, 3.- Alta estatus, 4.- Baja Estatus
     */
    crudEstablecimiento() {

        if (this.formEstablecimiento.invalid) {
            this.validateAllFormFields(this.formEstablecimiento);
            return;
        }
        let json = {
            "data": {
                "establecimientoId": this.establecimientoId,
                "establecimiento": this.formEstablecimiento.get('establecimiento').value,
                "cadena": this.formEstablecimiento.get('cadena').value,
                "terminal": this.formEstablecimiento.get('terminal').value,
                "sucursalId": this.formEstablecimiento.get('sucursal').value.sucursalid,
                "estatus": this.formEstablecimiento.get('estatus').value
            },
            "accion": this.accion
        }
        this.service.registrar(json, 'crduEstablecimientosMTCenter').subscribe(
            crudMtcenter => {
                this.blockUI.stop();
                if (crudMtcenter.codigo == "0") {
                    this.service.showNotification('top', 'right', 2, crudMtcenter.mensaje);
                    //cerrar modal
                    this.dialog.close(crudMtcenter.codigo);
                } else {
                    this.service.showNotification('top', 'right', 2, crudMtcenter.mensaje);
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)
            }
        );
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
        * Método para validar los mensajes.
        */
    public validacion = {
        'establecimiento': [{ type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Solo números, 6 dígitos.' }, { type: 'maxLength', message: '6 dígitos.' }],
        'cadena': [{ type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Solo números, 6 dígitos.' }, { type: 'maxLength', message: '6 dígitos.' }
        ],
        'terminal': [{ type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'Solo números, 6 dígitos.' },
        { type: 'maxLength', message: '6 dígitos.' }],
        'sucursal': [{ type: 'required', message: 'Campo requerido.' }]
    }
}