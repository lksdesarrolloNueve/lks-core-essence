import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import categorias from "../../../../environments/categorias.config";
import globales from "../../../../environments/globales.config";


@Component({
    selector: 'admin-bloqueo-cliente',
    moduleId: module.id,
    templateUrl: 'admin-bloqueo-cliente.component.html',

})
/**
 * @autor: Fatima Bolaños Duran
 * @version: 1.0.0
 * @fecha: 21/04/2022
 * @descripcion: Componente para la gestion de bloqueo de clientes en tiempo real
 */
export class AdminBloqueoClienteComponent {

    //Declaracion de variables y componentes
    titulo = 'BLOQUEO CLIENTE';
    encabezado: string;
    accion: number;
    formAviso: UntypedFormGroup;
    color: ThemePalette = 'primary';
    nombreSocio: string = '';
    sucursal: string = '';
    numSocio: string = '';
    bloqueoID: any;
    clienteID: any;

    lblClientes: string = globales.entes; comentarios
    lblCliente: string = globales.ente;

    listaMotivos: any = [];

    formBloqueo: UntypedFormGroup;

    @BlockUI() blockUI: NgBlockUI;

    /**
     * Validaciones para los campos de bloqueo de clientes
     */
    validaciones = {
        'comentarios': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxlength', message: 'Campo maximo 255 dígitos.' },
        ],
        "motivo": [
            { type: 'required', message: 'Campo requerido.' },
        ]
    }

    /**
     * Constructor  de la clase Admin interface
     * @param data  --Recibe los datos  del padre
     * @param service  -- Instancia de acceso a datos
     * @param formBuilder  -- Instancia  de construcion de formulario
     */
    constructor(
        public dialogRef: MatDialogRef<AdminBloqueoClienteComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
    ) {


        this.formBloqueo = this.formBuilder.group({
            comentarios: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            motivo: new UntypedFormControl('', [Validators.required]),
            estatus: new UntypedFormControl(true)
        });

        this.accion = data.accion;
        if (data.accion === 1) {
            this.nombreSocio = data.socio.nombre_cl + ' ' +
                data.socio.paterno_cl + ' ' + data.socio.materno_cl;
            this.sucursal = data.socio.nombre_sucursal;
            this.numSocio = data.socio.numero_cliente;
            this.clienteID = data.socio.cliente_id;
        } else {
            let cliente = JSON.parse(data.socio.cliente);
            this.bloqueoID = data.socio.bitBloqueoClienteId;
            this.nombreSocio = cliente.nombre;
            this.sucursal = cliente.sucursal;
            this.numSocio = cliente.numero_cliente;
            this.formBloqueo.get('comentarios').setValue(data.socio.comentarios);
            this.formBloqueo.get('estatus').setValue(data.socio.estatus);
            this.clienteID = cliente.cliente_id;

        }

    }

    /**
     * 
     * Metodo tipo CRUD para guardar y editar los bloqueos de clientes
     */
    crearBloqueos() {

        if (this.formBloqueo.invalid) {
            this.validateAllFormFields(this.formBloqueo);
            return;
        }
        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }

        let data = {};

        if (this.accion === 1) {
            data = {
                "datos": [this.clienteID, this.formBloqueo.get('motivo').value.generalesId,
                this.formBloqueo.get('comentarios').value, this.formBloqueo.get('estatus').value],
                "accion": this.accion
            };
        } else {
            data = {
                "datos": [this.bloqueoID, this.clienteID, this.formBloqueo.get('motivo').value.generalesId,
                this.formBloqueo.get('comentarios').value, this.formBloqueo.get('estatus').value],
                "accion": this.accion
            };
        }
        this.service.registrar(data, 'crudBloqueoCliente').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (this.accion === 1) {
                        this.formBloqueo.reset();
                    }
                    this.service.showNotification('top', 'right', 2, result[0][1])
                } else {
                    this.service.showNotification('top', 'right', 3, result[0][1])
                }
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message)

            }
        );
    }

    /**
     * Metodo OnInit de la clase BloqueoclienteComponent
     */
    ngOnInit() {
        this.spsBloqueoClientes();
    }

    /**
     * 
     * Metodo que consuslta los bloqueos de cliente 
     */
    spsBloqueoClientes() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(categorias.catMotBajaCli, 'listaGeneralCategoria').subscribe(result => {
            this.listaMotivos = result;

            if (this.accion === 2) {
                let mov = JSON.parse(this.data.socio.motivo);
                let motivo = this.listaMotivos.find(m => m.generalesId === mov.generales_id);
                this.formBloqueo.get('motivo').setValue(motivo);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
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

    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}