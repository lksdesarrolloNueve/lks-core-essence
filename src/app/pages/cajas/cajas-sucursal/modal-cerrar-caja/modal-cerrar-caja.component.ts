import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { PermisosService } from "../../../../shared/service/permisos.service";
import { Router } from "@angular/router";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { environment } from '../../../../../environments/environment';


////Constantes//////
//Forma de pago
const cFormaEfecti = environment.tesoreria.formaEfecti; //: '01', Efectivo

@Component({
    selector: 'modal-cerrar-caja',
    moduleId: module.id,
    templateUrl: 'modal-cerrar-caja.component.html',
    styleUrls: ['./modal-cerrar-caja.component.css']
})

/**
 * @autor: Josué Roberto Gallegos
 * @version: 1.0.0
 * @fecha: 01/02/2022
 * @descripcion: Componente para el cierre de caja
 */
export class ModalCerrarCajaComponent implements OnInit {

    @BlockUI() blockUI: NgBlockUI;

    // GESTION DE CORTES DE CAJAS MEDIANTE POSTGRES
    formCierreCajaPg: UntypedFormGroup;
    listaSesionesPg: any[] = [];
    listaSaldosPg: any[] = [];
    saldoInicialSistemaPg: number = 0.00;
    saldoInicialCajeroPg: number = 0.00;
    saldoFinalCajaPg: number = 0.00;
    cveCajaPg: string;
    fechaApPg: string;
    diferenciaPg: number = 0.00;
    saldoFinalSistemaPg: number = 0.00;
    isDiferenciaCheckedPg: boolean;
    depDinElec: any = 0;
    depEfectivoPg: any = 0;
    depTarjetaPg: any = 0;
    retEfectivoPg: any = 0;
    trasOutPg: any = 0;
    trasInPg: any = 0;
    sesionId: any = 0;
    nombreUsuario: any;
    usuarioId: any;

    /**
     * Constructor de lcomponente.
     * @param formBuilder 
     * @param data 
     * @param service 
     * @param dialogRef 
     * @param router 
     * @param servicePermisos 
     */
    constructor(
        private formBuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private dialogRef: MatDialogRef<ModalCerrarCajaComponent>,
        private router: Router,
        private servicePermisos: PermisosService
    ) {

        this.sesionId = data.cajas.sesionid;
        this.saldoInicialSistemaPg = data.cajas.saldo_inicial_sistema;
        this.saldoInicialCajeroPg = data.cajas.saldo_inicial_cajero;
        this.fechaApPg = data.cajas.fecha_apertura;
        this.cveCajaPg = data.cajas.cve_caja;
        this.usuarioId = data.cajas.id;

        this.formCierreCajaPg = this.formBuilder.group({
            totalCajero: new UntypedFormControl('', [Validators.required]),
            comentario: new UntypedFormControl('', [Validators.required]),
            botonD: new UntypedFormControl({ value: '', disabled: true }),
        });


        this.nombreUsuario = this.servicePermisos.usuario.username;
        this.isDiferenciaCheckedPg = false;
    }


    /**
     * Método init.
     */
    ngOnInit() {
        this.spsSaldosPosterioresPg();
    }

    /**
     * Método que cierra la caja por medio de Postgres
     */
    cerrarCajaPg() {


        if (this.formCierreCajaPg.invalid) {
            this.validateAllFormFields(this.formCierreCajaPg);
            return;
        }


        let data = {
            "accion": 2,
            "datos": [
                String(false),
                this.usuarioId,
                null,
                null,
                null,
                this.formCierreCajaPg.get('comentario').value,
                null,
                null,
                String(this.saldoFinalSistemaPg),
                this.formCierreCajaPg.get('totalCajero').value,
                this.diferenciaPg,
                this.cveCajaPg,
                this.sesionId //Sesion id.
            ]
        }

        this.blockUI.start('Cargando datos...');
        // Se agregan los datos de cierre al historial
        this.service.registrar(data, 'crudSesionesCajasPg').subscribe(() => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 2, 'La caja se cerró correctamente');
            this.dialogRef.close();
            this.router.navigate(['/cajas-sucursal']);
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Funcion que obtiene los saldos posteriores a la apertura de la caja
     */
    spsSaldosPosterioresPg() {

        let data: {};
        // 1. Saldos posteriores a apertura de caja. 2. Saldos posteriores por cuenta contable/poliza.
        // 3. Saldos anteriores. 4. Saldos anteriores por poliza
        data = {
            "accion": 1,
            "cveCaja": this.cveCajaPg,
            "sesionId": this.sesionId
        }

        this.blockUI.start('Cargando datos...');
        this.service.getListByObjet(data, 'listaSaldoCajaMov').subscribe(result => {

            this.blockUI.stop();
            this.listaSaldosPg = result;

            // Calcula saldo totales
            for (let item of this.listaSaldosPg) {
                if (item.cveFormaPago === cFormaEfecti) {
                    this.saldoFinalSistemaPg = this.saldoFinalSistemaPg + item.monto;
                    this.saldoFinalCajaPg = this.saldoFinalCajaPg + item.monto;

                }
            }

            this.saldoFinalSistemaPg = this.saldoInicialSistemaPg + this.saldoFinalSistemaPg;
            this.saldoFinalCajaPg = this.saldoInicialCajeroPg + this.saldoFinalCajaPg;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Método que calcula la diferencia entre el saldo final del sistema y el del cajero
     */
    calcularDiferenciaPg() {
        this.diferenciaPg = this.formCierreCajaPg.get('totalCajero').value - this.saldoFinalSistemaPg;

    }

    /**
     * Activa o desactiva el boton de cierre de caja segun el caso,
     * si hay una diferencia en saldos finales, el boton de cierre se activa hasta que se acepte la diferencia
     */
    activarBotonesPg() {
        this.isDiferenciaCheckedPg = !this.isDiferenciaCheckedPg;
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
    * Validacion para los campos
    */
    validaciones = {
        'totalCajero': [
            { type: 'required', message: 'Campo requerido.' },

        ],
        'comentario': [
            { type: 'required', message: 'Campo requerido.' },
        ],
    }




}
