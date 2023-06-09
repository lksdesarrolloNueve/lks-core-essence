import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { environment } from "../../../../../environments/environment";

@Component({
    selector: 'modal-empleado',
    moduleId: module.id,
    templateUrl: 'modal-empleado.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 20/10/2022
 * @descripcion: Componente para la administracion de empleados de nomina
 */
export class ModalEmpleadoComponent implements OnInit {
    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;
    boton: string = 'Agregar';
    encabezado: string = '';
    formEmpleado: UntypedFormGroup;
    listaPlantillas: any = [];
    empleadoID: number = 0;
    plantillaID: number = 0;
    empresaID: number = 0;
    accion: number = 1;
    listaEstatusNomina: any = [];
    listaClaveBanco: any = [];
    /**
     * Constructor de la clase ModalEmpleadoComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public info: any, private modEm: MatDialogRef<ModalEmpleadoComponent>) {

        this.formEmpleado = this.formBuilder.group({
            numeroCuenta: new UntypedFormControl('', Validators.required),
            plantilla: new UntypedFormControl('', Validators.required),
            fecha: new UntypedFormControl('', Validators.required),
            cuenta: new UntypedFormControl('', [Validators.required, Validators.maxLength(18), Validators.minLength(16),Validators.pattern("^[0-9]*$")]),
            clabe: new UntypedFormControl('', [Validators.required,Validators.pattern("^[0-9]*$")]),
            empleado: new UntypedFormControl('', Validators.required),
            rfc: new UntypedFormControl('', [Validators.required, Validators.maxLength(18)]),
            sueldo: new UntypedFormControl('', Validators.required),
            estatus: new UntypedFormControl('')

        });

        if (!this.vacio(this.info)) {
            if (!this.vacio(this.info.accion === 2)) {
                //actualizar 
                this.accion = this.info.accion;
                this.empleadoID = this.info.empresa.empleado_id;
                this.formEmpleado.get('fecha').setValue(this.info.empresa.fecha + 'T00:00:00');
                this.formEmpleado.get('cuenta').setValue(this.info.empresa.numero_cuenta);
                this.formEmpleado.get('clabe').setValue(this.info.empresa.clave_banco);
                this.formEmpleado.get('empleado').setValue(this.info.empresa.empleado);
                this.formEmpleado.get('rfc').setValue(this.info.empresa.rfc_curp);
                this.formEmpleado.get('sueldo').setValue(this.info.empresa.sueldo);
                this.boton = 'Actualizar';
            }
            this.encabezado = info.titulo;
            this.plantillaID = info.plantilla.plantilla_id;
            this.empresaID = info.empresa.empresa_nomina_id;
            this.formEmpleado.get('numeroCuenta').setValue(info.empresa.numero_cliente);
        }

    }
    ngOnInit() {
        this.spsPlantilla();
        this.spsEstatusNomina();
        this.spsCatalogsMEAPI();
    }
    /**
    * Lista de claves de banco
    */
    spsCatalogsMEAPI() {
        this.listaClaveBanco = [];
        this.blockUI.start('Cargando datos...');
        this.service.getList('getCatalogosMEAPI').subscribe(listas => {

            if (!this.vacio(listas.datos)) {
                this.listaClaveBanco = JSON.parse(listas.datos).lTipoCatalogo.find(c => c.clave === 6).lCatalogo;

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }
    /**
        * Lista las plantilla de las empresas
        */
    spsPlantilla() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('', 'spsPlantillas').subscribe(plant => {
            if (!this.vacio(plant)) {
                this.listaPlantillas = JSON.parse(plant);
            }
            if (!this.vacio(this.info)) {
                let pl = this.listaPlantillas.find(p => p.plantilla_id = this.info.plantilla.plantilla_id);
                this.formEmpleado.get('plantilla').setValue(pl);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
  * Metodo para listar los estatus de nomina
  * en generales por la clave de la categoria
  * @param catEstatusNomina
  */
    spsEstatusNomina(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catEstatusNomina, 'listaGeneralCategoria').subscribe(estatus => {
            this.listaEstatusNomina = estatus;
            let estatusAlta = this.listaEstatusNomina.find(e => e.cveGeneral === environment.generales.cveAltaNomina);
            this.formEmpleado.get('estatus').setValue(estatusAlta);
            if (!this.vacio(this.info.accion === 2)) {
                let estatusN = this.listaEstatusNomina.find(e => e.cveGeneral === this.info.empresa.cve_estatus);
                this.formEmpleado.get('estatus').setValue(estatusN);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para la gestion crud de empleado
     */
    altaEmpleado() {
        this.blockUI.start('Cargando datos...');
        if (this.formEmpleado.invalid) {
            this.validateAllFormFields(this.formEmpleado);
            this.service.showNotification('top', 'right', 3, "Completa la información.");
            this.blockUI.stop();
            return;
        }
        let json = {
            "accion": this.accion,
            "datos": [[
                this.empleadoID,
                this.formEmpleado.get('clabe').value,
                this.formEmpleado.get('cuenta').value,
                this.formEmpleado.get('empleado').value,
                this.formEmpleado.get('rfc').value,
                this.formEmpleado.get('sueldo').value,
                this.formEmpleado.get('fecha').value,
                this.plantillaID,
                this.empresaID,
                this.formEmpleado.get('estatus').value.generalesId
            ]
            ]
        };

        this.service.registrar(json, 'crudEmpleadosNomina').subscribe(servicio => {

            if (servicio[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, servicio[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, servicio[0][1])
            }
            this.modEm.close();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
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

    // Inicia Validaciones del formulario de empleado
    validaciones = {
        'numeroCuenta': [
            { type: 'required', message: 'Campo requerido.' }],
        'plantilla': [
            { type: 'required', message: 'Campo requerido.' }],
        'fecha': [
            { type: 'required', message: 'Campo requerido.' }],
        'cuenta': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLenth', message: 'Máximo 18 dígitos.' },
            { type: 'minLength', message: 'Minímo 16 dígitos.' },
            { type: 'pattern', message: 'Solo números enteros,\n 16 dígitos para número de tarjeta,\n 18 para Cuenta bancaria.' }],
        'clabe': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'pattern', message: 'Solo números enteros.' }],
        'empleado': [
            { type: 'required', message: 'Campo requerido.' }],
        'rfc': [
            { type: 'required', message: 'Campo requerido.' },
            { type: 'maxLenth', message: 'Máximo 18 dígitos.' }],
        'sueldo': [
            { type: 'required', message: 'Campo requerido.' }],
    }

}