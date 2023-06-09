import { Component, OnInit, ViewChild } from "@angular/core";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AdminClienteCitatoriosComponent } from "../clientes-morosos/modal-cliente-morosos/admin-cliente-citatorio.component";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { formatDate } from "@angular/common";
import { environment } from "../../../../../../environments/environment";
import globales from "../../../../../../environments/globales.config";



@Component({
    selector: 'citatorio',
    moduleId: module.id,
    templateUrl: 'citatorio.component.html',
})

/**
 * @autor: Fatima Bolaños Duran
 * version: 1.0.
 * @fecha: 22/06/2022
 * @description: Componente para la gestion de medios de Citatorios
 * 
 */

export class CitatoriosComponent implements OnInit {
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    @BlockUI() blockUI: NgBlockUI;
    lblCliente: string = globales.ente;

    displayedColumns: string[] = ['numero_cliente', 'referencia', 'monto_credito', 'saldo_credito', 'dias', 'fechacreacion', 'fechacontestar', 'aviso', 'licenciado', 'acciones'];
    dataSourceGeneral: MatTableDataSource<any>;
    listaCitarios: any;
    accion: number;
    titulo: string;
    formFechas: UntypedFormGroup;

    /**
        * Constructor  de la clase Admin interface
        * @param data  --Recibe los datos  del padre
        * @param service  -- Instancia de acceso a datos
        * @param formBuilder  -- Instancia  de construcion de formulario
        * @param dialog -Servicio para la gestion  
        */
    constructor(private service: GestionGenericaService, public dialog: MatDialog, private fomrBuilder: UntypedFormBuilder
    ) {
        // Formuario de fechas de inico y termino
        this.formFechas = this.fomrBuilder.group({
            fechainicio: new UntypedFormControl('', [Validators.required]),
            fechadetermino: new UntypedFormControl('', [Validators.required])
        });
    }


    /**
    * Metodo OnInit de la clase
    */
    ngOnInit() {
        this.spsExtrajudicialCitatorio();

    }

    /**
    * Método que en lista los tipos de Citatorios
    */
    spsExtrajudicialCitatorio() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(1, 'spsExtrajudicialCitatorio').subscribe(data => {
            this.blockUI.stop();
            this.listaCitarios = data;
            this.dataSourceGeneral = new MatTableDataSource(this.listaCitarios);
            this.dataSourceGeneral.paginator = this.paginator;
            this.dataSourceGeneral.sort = this.sort;
            //Fin set predicate

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Metodo para filtrar 
     * @param event --evento a filtrar
     */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceGeneral.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceGeneral.paginator) {
            this.dataSourceGeneral.paginator.firstPage();
        }
    }

    /**
    * Método que en lista los tipos de Fechas de incio y termno de los citatorios
    */
    spsExtrajudicialCitatorioPorfecha() {
        if (this.formFechas.invalid) {
            this.validateAllFormFields(this.formFechas);
            return;
        }
        this.listaCitarios = [];
        this.blockUI.start('Cargando datos...');
        // Formato de la fecha de inicio
        let fechaInicicio = formatDate(this.formFechas.get('fechainicio').value, 'yyyy-MM-dd', 'en-ES');
        // Formato de la fecha de termino
        let fechaTermino = formatDate(this.formFechas.get('fechadetermino').value, 'yyyy-MM-dd', 'en-ES');
        this.service.getListByID(fechaInicicio + '/' + fechaTermino + '/' + 2, 'spsExtrajudicialCitatorio').subscribe(data => {
            this.blockUI.stop();
            this.listaCitarios = data;
            this.dataSourceGeneral = new MatTableDataSource(this.listaCitarios);
            this.dataSourceGeneral.paginator = this.paginator;
            this.dataSourceGeneral.sort = this.sort;
            //Fin set predicate
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Metodo que abre una ventana modal
    * para la Administracion para los cientes morosos y relisar el citatorio
    * @param accion --1 Registrar , 2 . Editar
    * @param elemento - elemento a editar
    */
    abrirDialogoClientesMorososCitatorio(accion: any, elemento: any) {
        let titulo = '';
        //Si la accion es igual a 0 el titulo se llamara Registrar si no Editar
        if (accion === 1) {

            titulo = "registrar";
        } else {
            titulo = 'Editar';
        }

        // Se abre el modal y setean valores
        const dialogRef = this.dialog.open(AdminClienteCitatoriosComponent, {
            width: '50%',

            data: {
                accion: accion,
                titulo: titulo,
                datos: elemento

            },
        });
        dialogRef.afterClosed().subscribe(result => {

            if (!this.vacio(this.formFechas.get('fechainicio').value)) {
                this.spsExtrajudicialCitatorioPorfecha();
            } else {
                this.spsExtrajudicialCitatorio();
            }
        });
    }


    /**
     * Validaciones de los citatorios, fechas de inicio y fin 
     */
    validacionesPeriodoPruebas = {
        'fechainicio': [
            { type: 'matStartDateInvalid', message: 'Fecha incio erronea.' },
            { type: 'required', message: 'Fecha inicial requerida.' }
        ],
        'fechadetermino': [
            { type: 'matEndDateInvalid', message: 'Fecha final erronea.' },
            { type: 'required', message: 'Fecha final requerida.' }
        ]
    };

    /**
    * Método que imprime los  tipos de reportes que tiene el citatorio
    */
    imprimirCitatorio(citatorio: any) {
        // se relisa un json parse para estraer los datos de aviso
        let jsonCitatorio = JSON.parse(citatorio.aviso);
        let cveCitatorio = jsonCitatorio[0];
        switch (cveCitatorio.cveGeneral) {
            case environment.generales.extrajudicial1:
                break;
            case environment.generales.extrajudicial2:
                break;
            case environment.generales.extrajudicial3:
                break;
            case environment.generales.extrajudicialAdi:
                break;
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
        return (!value || value == undefined || value == null || value == "" || value.length == 0);
    }

}