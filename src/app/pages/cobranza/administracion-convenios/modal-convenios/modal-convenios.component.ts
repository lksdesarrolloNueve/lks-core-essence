import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import globales from "../../../../../environments/globales.config";
import { BuscarClientesComponent } from "../../../../pages/modales/clientes-modal/buscar-clientes.component";
import { map, startWith } from "rxjs/operators";
import { Router } from "@angular/router";
import { PermisosService } from "../../../../shared/service/permisos.service";

/**
 * @autor: Josué Roberto Gallegos
 * version: 1.0.
 * @fecha: 16/06/2022
 * @description: Componente para el crud de convenios
 * 
 */
@Component({
    selector: 'modal-convenios',
    moduleId: module.id,
    templateUrl: 'modal-convenios.component.html',
    styleUrls: ['modal-convenios.component.css']
})

export class ModalConveniosComponent implements OnInit {
    @BlockUI() blockUI: NgBlockUI;
    formNuevo: UntypedFormGroup;
    formUpdate: UntypedFormGroup;
    numeroCliente = new UntypedFormControl();
    numeroClienteUpdate = new UntypedFormControl();
    clienteId: any;
    lblCliente: string = globales.ente;
    lblClientes: string = globales.entes;
    listaCreditos: any;
    listaConvenios: any;
    listaSolicitantes: any;
    opcionesCredito: Observable<string[]>;
    opcionesSolicitante: Observable<string[]>;
    opcionesEntrega: Observable<string[]>;
    diasInteres = 0;
    diasVencido = 0;
    amortizaciones = 0;
    montoCredito = 0;
    montoVencido = 0;
    moratorio = 0;
    listaEntrega = [
        { nombre: "Presencial" },
        { nombre: "Por correo" },
    ];


    validaciones = {
        'validacionGenerica': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'invalidAutocompleteObject', message: 'Opción no valida.' },
        ],
    }


    constructor(
        @Inject(MAT_DIALOG_DATA) public data: any,
        public dialog: MatDialog,
        public formBuilder: UntypedFormBuilder,
        private service: GestionGenericaService,
        private dialogRef: MatDialogRef<ModalConveniosComponent>,
        private router: Router,
        private servicePermisos: PermisosService,
    ) {
        const today = new Date();
        const day = today.getDate();
        const month = today.getMonth();
        const year = today.getFullYear();

        this.formNuevo = this.formBuilder.group({
            credito: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            maneraEntrega: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            solicitante: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            fechaAlta: new UntypedFormControl(new Date(year, month, day), [Validators.required]),
            fechaVigencia: new UntypedFormControl('', [Validators.required]),
            monto: new UntypedFormControl('', [Validators.required]),
            comentario: new UntypedFormControl('', [Validators.required]),
        });
        this.formUpdate = this.formBuilder.group({
            credito: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            maneraEntrega: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            solicitante: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            fechaAlta: new UntypedFormControl('', [Validators.required]),
            fechaVigencia: new UntypedFormControl('', [Validators.required]),
            monto: new UntypedFormControl('', [Validators.required]),
            comentario: new UntypedFormControl('', [Validators.required]),
        });

    }

    ngOnInit() {
        if (this.data.accion == 2) {
            this.diasInteres = this.data.convenio.extConvenio.diasInteres;
            this.diasVencido = this.data.convenio.extConvenio.diasVencido;
            this.amortizaciones = this.data.convenio.extConvenio.amortizaciones;
            this.montoCredito = this.data.convenio.extConvenio.montoCredito;
            this.montoVencido = this.data.convenio.extConvenio.montoVencido;
            this.moratorio = this.data.convenio.extConvenio.moratorio;
            this.spsCredCliente(this.data.convenio.extConvenio.numeroCliente);
        }
    }


    /**
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier tipo de FormGroup
     */
    validateAllFormFields(formGroup: UntypedFormGroup) {           //1
        Object.keys(formGroup.controls).forEach(field => {  //2
            const control = formGroup.get(field);           //3
            if (control instanceof UntypedFormControl) {           //4
                control.markAsTouched({ onlySelf: true });
            } else if (control instanceof UntypedFormGroup) {
                this.validateAllFormFields(control);
            }
        });
    }


    /**
     * Funcion que aplica la validacion generica del formGroup
     */
    validar() {
        if (this.data.accion == 1) {
            if (this.formNuevo.invalid) {
                this.validateAllFormFields(this.formNuevo);
                this.service.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
                return;
            }
        } else if (this.data.accion == 2) {
            if (this.formUpdate.invalid) {
                this.validateAllFormFields(this.formUpdate);
                this.service.showNotification('top', 'right', 3, 'Completa los campos que faltan.');
                return;
            }
        }
    }


    /**
     * Limpia los campos necesarios en caso de cambiar el cliente
     */
    limpiarCampos() {
        if (this.data.accion == 1) {
            this.formNuevo.get("credito").setValue("");
        } else if (this.data.accion == 2) {
            this.formUpdate.get("credito").setValue("");
        }
    }


    /**
     * Metodo que consulta las empresas en BD
     */
    spsCredCliente(numCliente) {
        this.blockUI.start('Cargando...');

        let path = numCliente + "/" + 3

        this.service.getListByID(path, 'listaCredCliente').subscribe(data => {
            this.listaCreditos = [];
            this.listaCreditos = data;

            this.opcionesCredito = this.formNuevo.get('credito').valueChanges.pipe(
                startWith(''),
                map(value => this._filterCreditos(value))
            );

            this.spsGenerales();

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Método que consulta datos extra referentes al credito seleccionado
     */
    spsDatosCredito(credito) {
        this.blockUI.start('Cargando...');

        let path = `${credito}/3/0/0`;

        this.service.getListByID(path, 'listaConvenios').subscribe(data => {

            this.diasInteres = data[0].extConvenio.diasInteres;
            this.diasVencido = data[0].extConvenio.diasVencido;
            this.amortizaciones = data[0].extConvenio.amortizaciones;
            this.montoCredito = data[0].extConvenio.montoCredito;
            this.montoVencido = data[0].extConvenio.montoVencido;
            this.moratorio = data[0].extConvenio.moratorio;

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Método que consulta los convenios correspondientes a un credito de un cliente
     */
    spsConvenios(clienteId) {
        this.blockUI.start('Cargando...');

        let path = `${clienteId}/2/0/10`;
        this.service.getListByID(path, 'listaConvenios').subscribe(data => {
            this.listaConvenios = [];
            this.listaConvenios = data;

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Metodo para obtener la lista de garantias
     */
    spsGenerales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'listaGenerales').subscribe(data => {
            this.blockUI.stop();
            this.listaSolicitantes = [];

            // Se agregan las primeras opciones de solicitantes, que no vienen incluidas en la consulta de listaGenerales
            this.listaSolicitantes.push(
                { descripcion: "Cliente" },
                { descripcion: "Aval" }
            );
            // Se filtran solo las opciones de familiares y se agregan a la lista de solicitantes
            let familiares = data.filter(x => x.categoria.categoriaId === 37);
            familiares.forEach(element => {
                this.listaSolicitantes.push(element);
            });
            // Se agregan una ultima opcion (Nadie)
            this.listaSolicitantes.push(
                { descripcion: "Nadie" }
            );

            // Se filtran las opciones de los auto-complete
            if (this.data.accion == 1) {
                this.opcionesSolicitante = this.formNuevo.get('solicitante').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterSolicitantes(value))
                );
                this.opcionesEntrega = this.formNuevo.get('maneraEntrega').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEntrega(value))
                );
            } else {
                this.opcionesSolicitante = this.formUpdate.get('solicitante').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterSolicitantes(value))
                );
                this.opcionesEntrega = this.formUpdate.get('maneraEntrega').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEntrega(value))
                );
            }


            if (this.data.accion == 2) this.asignarValores();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
     * Se asignan los valores correspondientes a cada input si se hara una actualizacion.
     */
    asignarValores() {
        let referencia = this.listaCreditos.find(c => c.refCredito === this.data.convenio.extConvenio.referencia);
        let maneraEntrega = this.listaEntrega.find(m => m.nombre === this.data.convenio.maneraEntrega);
        let solicitante = this.listaSolicitantes.find(s => s.descripcion === this.data.convenio.solicitante);

        this.numeroClienteUpdate.setValue(`${this.data.convenio.extConvenio.numeroCliente} - ${this.data.convenio.extConvenio.nombreCliente}`);
        this.formUpdate.get("credito").setValue(referencia);
        this.formUpdate.get("maneraEntrega").setValue(maneraEntrega);
        this.formUpdate.get("solicitante").setValue(solicitante);
        this.formUpdate.get("fechaAlta").setValue(this.data.convenio.fechaAlta + 'T00:00:00');
        this.formUpdate.get("fechaVigencia").setValue(this.data.convenio.fechaVigencia + 'T00:00:00');
        this.formUpdate.get("monto").setValue(this.data.convenio.monto);
        this.formUpdate.get("comentario").setValue(this.data.convenio.comentario);
    }


    /**
     * Metodo para Abrir ventana modal de clientes
     */
    modalClientes() {
        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente'
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {
            this.limpiarCampos();

            if (result != 1) {
                if (result.tipoPersona == 'F') {
                    this.numeroCliente.setValue(`${result.datosCl.numero_cliente.trim()} - ${result.datosCl.nombre_cl} ${result.datosCl.paterno_cl} ${result.datosCl.materno_cl}`);
                } else {
                    this.numeroCliente.setValue(`${result.datosCl.numero_cliente.trim()} - ${result.datosCl.nombre_comercial}`);
                }
                this.clienteId = result.datosCl.cliente_id;
                this.spsCredCliente(result.datosCl.numero_cliente);
            }
            if (result == 1) {
                this.numeroCliente.setValue('');
            }
        });
    }

    /* Valida que el texto ingresado pertenezca a la lista 
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
     * Funcion para el despliegue del valor del autocomplete de creditos
     */
    displayCredito = (option: any) => {
        return option ? option.refCredito : undefined;
    }


    /**
     * Funcion para el despliegue del valor del autocomplete de metodos de entrega
     */
    displayEntrega = (option: any) => {
        return option ? option.nombre : undefined;
    }


    /**
     * Funcion para el despliegue del valor del autocomplete de solicitantes
     */
    displaySolicitante = (option: any) => {
        return option ? option.descripcion : undefined;
    }


    /**
     * Funcion que filtra las opciones del auto-complete de sujetos
     */
    private _filterCreditos(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaCreditos.filter(option => option.refCredito.toLowerCase().includes(filterValue));
    }


    /**
     * Funcion que filtra las opciones del auto-complete de solicitantes
     */
    private _filterSolicitantes(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaSolicitantes.filter(option => option.descripcion.toLowerCase().includes(filterValue));
    }


    /**
     * Funcion que filtra las opciones del auto-complete de solicitantes
     */
    private _filterEntrega(value: any): any[] {

        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }

        return this.listaEntrega.filter(option => option.nombre.toLowerCase().includes(filterValue));
    }


    /**
     * Se insertan o actualizan datos segun la accion correspondiente.
     * 1. Agregar 2. Actualizar o Eliminar (Cambiar estatus a false)
     */
    crud(accion) {
        // Validacion
        if (this.data.accion == 1) {
            if (this.formNuevo.invalid) return;
        }
        if (this.data.accion == 2) {
            if (this.formUpdate.invalid) return;
        }

        let notificacion = (this.data.accion == 1) ? "Se agregó el registro correctamente" : "Se actualizó el registro correctamente";
        let clienteId = null;
        let creditoId = null;
        let maneraEntrega = null;
        let solicitante = null;
        let monto = null;
        let fechaVigencia = null;
        let comentario = null;
        const sucursal = this.servicePermisos.sucursalSeleccionada.sucursalid;

        if (accion == 1) {
            clienteId = this.clienteId;
            creditoId = this.formNuevo.get('credito').value.creditoID;
            maneraEntrega = this.formNuevo.get('maneraEntrega').value.nombre;
            solicitante = this.formNuevo.get('solicitante').value.descripcion;
            monto = this.formNuevo.get('monto').value;
            fechaVigencia = this.formNuevo.get('fechaVigencia').value;
            comentario = this.formNuevo.get('comentario').value;
        }
        if (accion == 2) {
            clienteId = this.data.convenio.clienteId;
            creditoId = this.data.convenio.creditoId
            maneraEntrega = this.formUpdate.get('maneraEntrega').value.nombre;
            solicitante = this.formUpdate.get('solicitante').value.descripcion;
            monto = this.formUpdate.get('monto').value;
            fechaVigencia = this.formUpdate.get('fechaVigencia').value;
            comentario = this.formUpdate.get('comentario').value;
        }

        let datos = {
            "accion": accion,
            "datos": [
                clienteId,
                creditoId,
                maneraEntrega,
                solicitante,
                monto,
                fechaVigencia,
                comentario,
                null,
                sucursal
            ]
        }

        this.blockUI.start('Cargando datos...');
        this.service.registrar(datos, "crudConvenios").subscribe(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, notificacion);
            this.dialogRef.close();
            this.router.navigate(['/admin-convenios']);
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

}