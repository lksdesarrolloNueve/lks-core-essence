import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { environment } from "../../../../../../../environments/environment";
import globales from "../../../../../../../environments/globales.config";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from "../../../../../../shared/service/gestion";



@Component({
    selector: 'admin-cliente-citarorios',
    moduleId: module.id,
    templateUrl: 'admin-cliente-citatorio.component.html',
})

/**
 * @autor: Fatima Bolaños Duran
 * version: 1.0.
 * @fecha: 21/06/2022
 * @description: Componente para la gestion de medios de Clientes mososos para citatorios
 * 
 */

export class AdminClienteCitatoriosComponent implements OnInit {

    titulo: string;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    // Variables  y Componentes
    formClieteCitatorios: UntypedFormGroup;
    accion: number;
    avisoId: number = 0;

    //Lista de extrajudiciales
    listaExjudicial: any[];
    opcionesExtrajudicial: Observable<string[]>;
    tipoExtra: string = '';

    // Lista de Abogados 
    listaAbogados: any[];
    opcionesAbogados: Observable<string[]>;
    abogado: string = '';
    idCliente: number = 0; // cliente id
    v_nombre: string; // nobre del cliente
    v_referencia: string; // referencia del credito
    v_monto: number; // moto de cretido
    v_saldo: number; // saldo del credito
    v_dias: number; // dias del citario
    v_creditoid: number; // credito id 


    @BlockUI() blockUI: NgBlockUI;


    /**
        * Constructor  de la clase Admin interface
        * @param data  --Recibe los datos  del padre
        * @param service  -- Instancia de acceso a datos
        * @param formBuilder  -- Instancia  de construcion de formulario
        * @param dialog -Servicio para la gestion  
        */
    constructor(
        public dialogRef: MatDialogRef<AdminClienteCitatoriosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any,
        private service: GestionGenericaService,
        private formBuilder: UntypedFormBuilder,
        public dialog: MatDialog,
    ) {

        // Metodos que manda llamar las accion y el titulo
        this.titulo = data.titulo;
        this.accion = data.accion;

        //  Metodos del formulario de citatorios
        this.formClieteCitatorios = this.formBuilder.group({
            cliente: new UntypedFormControl(''),
            tipoid: new UntypedFormControl('', [Validators.required]),
            fechacontestar: new UntypedFormControl('', [Validators.required]),
            horacontestar: new UntypedFormControl('', [Validators.required]),
            licenciadoid: new UntypedFormControl('', [Validators.required])
        });
        if (this.accion === 1) {
            this.idCliente = data.datos.clienteID;
            this.formClieteCitatorios.get('cliente').setValue(data.datos.numeroCliente + ' - ' + data.datos.nombreCliente);
            this.v_nombre = data.datos.nombreCliente;
            this.v_referencia = data.datos.referencia
            this.v_monto = data.datos.montoCredito;
            this.v_saldo = data.datos.saldoCredito;
            this.v_dias = data.datos.dias;
            this.v_creditoid = data.datos.creditoID;
        } else {
            this.avisoId = data.datos.avisoID;
            this.idCliente = data.datos.clienteID;
            this.formClieteCitatorios.get('cliente').setValue(data.datos.moroso.numeroCliente + ' - ' + data.datos.moroso.nombreCliente);
            this.v_nombre = data.datos.moroso.nombreCliente;
            this.v_referencia = data.datos.moroso.referencia
            this.v_monto = data.datos.moroso.montoCredito;
            this.v_saldo = data.datos.moroso.saldoCredito;
            this.v_dias = data.datos.moroso.dias;
            this.v_creditoid = data.datos.moroso.creditoID;

            this.formClieteCitatorios.get('fechacontestar').setValue(data.datos.fechaContestar);
            this.formClieteCitatorios.get('horacontestar').setValue(data.datos.horaContestar);

        }

    }

    /**
   * Metodo OnInit de la clase
   */
    ngOnInit() {

        this.tipoExtrajudicial();
        this.licenciado();
    }

    /**
    * Metodo  tipo CRUD para guardar y editar los  citatorios
    * */
    crudExtrajudicial() {
        if (this.formClieteCitatorios.invalid) {
            this.validateAllFormFields(this.formClieteCitatorios);
            return;
        }
        if (this.accion === 1) {
            this.blockUI.start('Guardando...');
        } else {
            this.blockUI.start('Editando...');
        }

        let jsonClientes = {

            "datos": [
                this.avisoId,
                this.idCliente,
                this.v_nombre,
                this.v_referencia,
                this.v_monto,
                this.v_saldo,
                this.v_dias,
                this.v_creditoid,
                this.formClieteCitatorios.get('tipoid').value.generalesId,
                this.formClieteCitatorios.get('fechacontestar').value,
                this.formClieteCitatorios.get('horacontestar').value,
                this.formClieteCitatorios.get('licenciadoid').value.generalesId,
            ],
            accion: this.accion

        };
        this.service.registrar(jsonClientes, 'crudExtrajudicial').subscribe(
            result => {
                this.blockUI.stop();
                if (result[0][0] === '0') {
                    if (this.accion === 1) {
                        this.formClieteCitatorios.reset();
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
    * Método que en lista los tipos de extrajudicial
    */
    tipoExtrajudicial() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.tipoExtrajudicial, 'listaGeneralCategoria').subscribe(avi => {
            this.listaExjudicial = avi;
            this.opcionesExtrajudicial = this.formClieteCitatorios.get('tipoid').valueChanges.pipe(
                startWith(''),
                map(value => this.filtroReporte(value))
            );

            if (this.accion === 2) {
                let jsonAviso = JSON.parse(this.data.datos.aviso);
                let findAviso = this.listaExjudicial.find(a => a.generalesId === jsonAviso[0].generalesId);
                this.formClieteCitatorios.get('tipoid').setValue(findAviso);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        }
        );
    }
    private filtroReporte(value: string): any {
        const filterValue = value;

        return this.listaExjudicial.filter(data => data.descripcion.toLowerCase().includes(filterValue));
    }

    displayFnv(tipoid: any): string {
        return tipoid && tipoid.descripcion ? tipoid.descripcion : '';
    }

    /**
    * Método que en lista los tipos de licenciados 
    */
    licenciado() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.licenciado, 'listaGeneralCategoria').subscribe(lic => {
            this.listaAbogados = lic;
            this.opcionesAbogados = this.formClieteCitatorios.get('licenciadoid').valueChanges.pipe(
                startWith(''),
                map(value => this.filtroAbogados(value))
            );

            if (this.accion === 2) {
                let jsonLic = JSON.parse(this.data.datos.licenciado);
                let findLic = this.listaAbogados.find(a => a.generalesId === jsonLic[0].generalesId);
                this.formClieteCitatorios.get('licenciadoid').setValue(findLic);
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        }
        );
    }
    private filtroAbogados(value: string): any {
        const filterValue = value;

        return this.listaAbogados.filter(data => data.descripcion.toLowerCase().includes(filterValue));
    }
    displayFnff(licenciadoid: any): string {
        return licenciadoid && licenciadoid.descripcion ? licenciadoid.descripcion : '';
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
     * Metodo para mostrar los mensajes de validaciones 
     */

    validaciones = {
        'tipoid': [{ type: 'required', message: 'Campo requerido.' }],
        'horacontestar': [{ type: 'required', message: 'Campo requerido.' }],
        'licenciadoid': [{ type: 'required', message: 'Campo requerido.' }],
        'fechacontestar': [{ type: 'required', message: 'Campo requerido.' }]
    }

    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == null || value == "" || value.length == 0);
    }




}
