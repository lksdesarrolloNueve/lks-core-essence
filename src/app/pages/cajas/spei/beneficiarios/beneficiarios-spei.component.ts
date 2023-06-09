import { Component, ViewChild } from "@angular/core";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";

@Component({
    selector: 'beneficiarios-spei',
    templateUrl: './beneficiarios-spei.component.html'
})
export class BeneficiariosSPEIComponent {

    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;

    listaPlantilla: any = [];
    listaBancos: any = [];
    listaTipoPago: any = [];
    listaTipoCuentas: any = [];
    listaBeneficiarios: any = [];

    formBeneficiario: UntypedFormGroup;
    beneficiarioID = 0;

    displayedColumns: string[] = ['cuenta', 'beneficiario', 'rfccurp', 'estatus', 'acciones']
    dataSourceBeneficiarios: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    inputFiltro = new UntypedFormControl();

    constructor(private service: GestionGenericaService,
        private dialogRef: MatDialogRef<BeneficiariosSPEIComponent>,
        private formBuilder: UntypedFormBuilder
    ) {

        this.formBeneficiario = this.formBuilder.group({
            cuenta: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
            claveTipoCuenta: new UntypedFormControl('', Validators.required),
            beneficiario: new UntypedFormControl('', Validators.required),
            rfcCurp: new UntypedFormControl('', Validators.required),
            claveBancoReceptor: new UntypedFormControl('', Validators.required),
            estatus: new UntypedFormControl(true)
        });

        this.spsCatalogsMEAPI();
        this.listaBeneficiariosSPEI(1);
    }




    /**
     * MEAPI catalogos
     */
    spsCatalogsMEAPI() {

        this.blockUI.start('Cargando datos...');
        this.listaPlantilla = [];
        this.service.getList('getCatalogosMEAPI').subscribe(cat => {

            if (!this.vacio(cat.cuerpo)) {
                this.listaPlantilla = JSON.parse(cat.cuerpo);

                this.listaTipoPago = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 1).lCatalogo;
                this.listaTipoCuentas = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 2).lCatalogo;
                this.listaBancos = this.listaPlantilla.lTipoCatalogo.find(c => c.clave === 6).lCatalogo;

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    crudBeneficiariosSPEI() {

        if (this.formBeneficiario.invalid) {
            this.validateAllFormFields(this.formBeneficiario);
            return;
        }


        let accion = 1;
        let datos = [];


        if (this.beneficiarioID > 0) {
            accion = 2;
            datos = [[
                this.beneficiarioID,
                this.formBeneficiario.get('cuenta').value,
                this.formBeneficiario.get('claveTipoCuenta').value,
                this.formBeneficiario.get('beneficiario').value,
                this.formBeneficiario.get('rfcCurp').value,
                this.formBeneficiario.get('claveBancoReceptor').value,
                this.formBeneficiario.get('estatus').value
            ]];
        } else {
            datos = [[
                this.formBeneficiario.get('cuenta').value,
                this.formBeneficiario.get('claveTipoCuenta').value,
                this.formBeneficiario.get('beneficiario').value,
                this.formBeneficiario.get('rfcCurp').value,
                this.formBeneficiario.get('claveBancoReceptor').value,
                this.formBeneficiario.get('estatus').value
            ]];
        }

        let jsonRequest = {
            datos: datos,
            accion: accion
        };

        this.blockUI.start('Buscando datos...');

        this.service.registrar(jsonRequest, 'crudBeneficiariosSPEI').subscribe(respBeneficiarios => {
            this.blockUI.stop();

            if (respBeneficiarios.codigo === "0") {
                this.service.showNotification('top', 'right', 2, respBeneficiarios.mensaje);
                this.listaBeneficiariosSPEI(3);
                this.beneficiarioID = 0;
                this.formBeneficiario.reset();
            } else {
                this.service.showNotification('top', 'right', 3, respBeneficiarios.mensaje);
            }


        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });



    }

    listaBeneficiariosSPEI(accion) {

        let filtros = [];
        if (accion === 3) {
            filtros = [this.formBeneficiario.get('cuenta').value];
        }

        let jsonRequest = {
            datos: filtros,
            accion: accion
        };

        this.blockUI.start('Buscando datos...');

        this.service.getListByObjet(jsonRequest, 'listaBeneficiariosSPEI').subscribe(respGetBeneficiarios => {
            this.blockUI.stop();

            if (respGetBeneficiarios.codigo === "0") {
                this.listaBeneficiarios = respGetBeneficiarios.lista;
                this.dataSourceBeneficiarios = new MatTableDataSource(this.listaBeneficiarios);
                this.dataSourceBeneficiarios.sort = this.sort;
                setTimeout(() => this.dataSourceBeneficiarios.paginator = this.paginator);
            } else {
                this.service.showNotification('top', 'right', 1, respGetBeneficiarios.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });

    }


    buscarBeneficiario() {
        let jsonRequest = {
            datos: [this.inputFiltro.value],
            accion: 3
        };

        this.blockUI.start('Buscando datos...');

        this.service.getListByObjet(jsonRequest, 'listaBeneficiariosSPEI').subscribe(respGetBeneficiarios => {
            this.blockUI.stop();

            if (respGetBeneficiarios.codigo === "0") {
                this.listaBeneficiarios = respGetBeneficiarios.lista;
                this.dataSourceBeneficiarios = new MatTableDataSource(this.listaBeneficiarios);
                this.dataSourceBeneficiarios.sort = this.sort;
                setTimeout(() => this.dataSourceBeneficiarios.paginator = this.paginator);
            } else {
                this.service.showNotification('top', 'right', 1, respGetBeneficiarios.mensaje);
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo que permite editar la Info de un Beneficiario
     * @param beneficiario - Beneficiaio a Editar info
     */
    editarBeneficiario(beneficiario: any) {

        this.beneficiarioID = beneficiario.beneficiarioID;
        this.formBeneficiario.get('cuenta').setValue(beneficiario.cuenta);
        this.formBeneficiario.get('claveTipoCuenta').setValue(beneficiario.claveTipoCuenta);
        this.formBeneficiario.get('beneficiario').setValue(beneficiario.beneficiario);
        this.formBeneficiario.get('rfcCurp').setValue(beneficiario.rfcCurp);
        this.formBeneficiario.get('claveBancoReceptor').setValue(beneficiario.claveBancoReceptor);
        this.formBeneficiario.get('estatus').setValue(beneficiario.estatus);

        this.validacionesPersonalizadas();
    }

    setBeneficiario(beneficiario: any) {
        this.dialogRef.close(beneficiario);
    }

    /**
     * Limpia el formulario y variables
     */
    nuevo() {
        this.beneficiarioID = 0;
        this.formBeneficiario.reset();
    }

    /**
     * Metodo que nos permite validar las 
     * longitudes por tipo de Cuenta
     */
    validacionesPersonalizadas() {


        if (this.formBeneficiario.get('claveTipoCuenta').value === "3") {

            this.formBeneficiario.get('cuenta').setValidators([Validators.required,
            Validators.maxLength(16), Validators.minLength(16), Validators.pattern('[0-9]*')])
            this.formBeneficiario.get('cuenta').updateValueAndValidity();

                this.validacion_msj['cuenta'] = [
                    { type: 'required', message: 'Campo requerido.' },
                    { type: 'pattern', message: 'El campo solo acepta números enteros' },
                    { type: 'maxlength', message: 'El tamaño máximo es de 16 caracteres.' },
                    { type: 'minlength', message: 'El tamaño mínimo es de 16 caracteres.' }
                ];
            
        }

        if (this.formBeneficiario.get('claveTipoCuenta').value === "40") {

            this.formBeneficiario.get('cuenta').setValidators([Validators.required,
                Validators.maxLength(18), Validators.minLength(18), Validators.pattern('[0-9]*')])
                this.formBeneficiario.get('cuenta').updateValueAndValidity();

                this.validacion_msj['cuenta'] = [
                    { type: 'required', message: 'Campo requerido.' },
                    { type: 'pattern', message: 'El campo solo acepta números enteros' },
                    { type: 'maxlength', message: 'El tamaño máximo es de 18 caracteres.' },
                    { type: 'minlength', message: 'El tamaño mínimo es de 18 caracteres.' }
                ];
                this.formBeneficiario.controls['cuenta'].setErrors({ maxlength: true, minlength: true });
  
        }

        if (this.formBeneficiario.get('claveTipoCuenta').value === "10") {

            this.formBeneficiario.get('cuenta').setValidators([Validators.required,
                Validators.maxLength(10), Validators.minLength(10), Validators.pattern('[0-9]*')])
                this.formBeneficiario.get('cuenta').updateValueAndValidity();

                this.validacion_msj['cuenta'] = [
                    { type: 'required', message: 'Campo requerido.' },
                    { type: 'pattern', message: 'El campo solo acepta números enteros' },
                    { type: 'maxlength', message: 'El tamaño máximo es de 10 caracteres.' },
                    { type: 'minlength', message: 'El tamaño mínimo es de 10 caracteres.' }
                ];
                this.formBeneficiario.controls['cuenta'].setErrors({ maxlength: true, minlength: true });
        }


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
    * Metodo que valida si va vacio.
    * @param value 
    * @returns 
    */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }

    /** Lista de validaciones*/
    validacion_msj = {
        'claveTipoCuenta': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'claveBancoReceptor': [
            { type: 'required', message: 'Campo requerido.' }
        ],
        'cuenta': [{ type: 'required', message: 'Campo requerido.' },
        { type: 'pattern', message: 'El campo solo acepta números enteros' }
        ],
        'beneficiario': [{ type: 'required', message: 'Campo requerido.' }],
        'rfcCurp': [{ type: 'required', message: 'Campo requerido.' }]

    }

}