import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormControl } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../shared/service/gestion";
import globales from "../../../../environments/globales.config";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import * as moment from 'moment';
import { PermisosService } from "../../../shared/service/permisos.service";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { BuscarClientesComponent } from "../../../pages/modales/clientes-modal/buscar-clientes.component";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { formatCurrency, getCurrencySymbol } from "@angular/common";

@Component({
    selector: 'op-relevante',
    moduleId: module.id,
    templateUrl: 'op-relevante.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 11/05/2022
 * @descripcion: Componente para la gestion de operaciones relevantes
 */
export class OpRelevanteComponent implements OnInit {
    //Declaracion de Variables y Componentes
    @BlockUI() blockUI: NgBlockUI;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    today = new Date();
    /**Controles para filtrar los op relevantes */
    fechaIn = new UntypedFormControl(this.today);
    fechaFin = new UntypedFormControl();
    numeroCliente = new UntypedFormControl();
    sucursal = new UntypedFormControl();
    dolar = new UntypedFormControl();
    limite:number = 7500;
    comparacion = new UntypedFormControl(formatCurrency(this.limite, 'en-US', getCurrencySymbol('USD', 'wide')));
    pesos = new UntypedFormControl();

    //Tabla operaciones relavantes
    listaRelevante: any = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre', 'fecha', 'descripcion',
        'monto', 'montoMax'];
    dataSourceRelevantes: MatTableDataSource<any>;
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;
    idSucursal: number = 0;

    constructor(private service: GestionGenericaService, private servicePermisos: PermisosService, public dialog: MatDialog) {

    }
    /**
   * metodo OnInit de la clase AdminCreditos para iniciar los metodos
   */
    ngOnInit() {
        this.spsRelevante();
        this.spsSucursal();
        this.spsValorDolar();
    }
    /**metodo que lista el valor del dolar consulatdo del día*/
    spsValorDolar() {
        let hoy = moment(this.fechaIn.value).format("YYYY-MM-DD");
        this.service.getListByID(hoy, 'spsValorDolar').subscribe(data => {
            if (!this.vacio(data)) {
                let datosDolar = JSON.parse(data);
                
                this.dolar.setValue(formatCurrency(datosDolar[0].dato, 'en-US', getCurrencySymbol('USD', 'wide')));
                //CONVERISON DE DOLARES A PESOS MEXICANOS
                let vPesos = datosDolar[0].dato * this.limite;
                this.pesos.setValue(formatCurrency(vPesos,'en-US',getCurrencySymbol('MXN', 'wide')));
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**Lista las operaciones relavantes del dia y la sucursal en session */
    spsRelevante() {
        this.blockUI.start('Cargando datos...');
        this.listaRelevante = [];
        let fechaI = moment(this.fechaIn.value).format("YYYY-MM-DD");
        let fechaF = ''
        if (!this.vacio(this.fechaFin.value)) {
            fechaF = moment(this.fechaFin.value).format("YYYY-MM-DD");
        }
        let numCliente = '';
        if (!this.vacio(this.numeroCliente.value)) {
            numCliente = this.numeroCliente.value;
        }
        if (this.idSucursal == 0) {
            this.idSucursal = this.servicePermisos.sucursalSeleccionada.sucursalid;
        }
        //Se genera el Arreglo para consultar operaciones relevantes
        let arreglo = {
            "datos": [fechaI, fechaF, this.idSucursal, numCliente],
            "accion": 2
        };
        this.service.getListByObjet(arreglo, 'spsOpRelevante').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaRelevante = JSON.parse(data);
                this.dataSourceRelevantes = new MatTableDataSource(this.listaRelevante);
                this.dataSourceRelevantes.paginator = this.paginator;
                this.dataSourceRelevantes.sort = this.sort;
            } else {
                this.dataSourceRelevantes = this.listaRelevante;
                this.service.showNotification('top', 'right', 3, 'No se encontraron operaciones.');
            }

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
* Metodo para filtrar OP. RELEVANTES
* @param event --evento a filtrar
*/
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceRelevantes.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceRelevantes.paginator) {
            this.dataSourceRelevantes.paginator.firstPage();
        }
    }
    /**
     * Metodo para Abrir ventana modal de clientes */
    modalClientes() {

        const dialogRef = this.dialog.open(BuscarClientesComponent, {
            width: '50%',
            data: {
                titulo: 'Busqueda de cliente'
            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

            if (result != 1) {
                if (result.tipoPersona == 'F') {
                    this.numeroCliente.setValue(result.datosCl.numero_cliente.trim())
                } else {
                    //Moral
                }
            }
            if (result == 1) {
                this.numeroCliente.setValue('');
            }

        });

    }
    /**
   * Metodo para consultar Sucursales
   * accion 2 activas
   */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            let idSucursal = this.listaSucursales.find(sucursal => sucursal.sucursalid === this.servicePermisos.sucursalSeleccionada.sucursalid);
            this.sucursal.setValue(idSucursal);
            this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this.filterSuc(value))
            );
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
* Filtra la sucursal
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
    private filterSuc(value: any): any {

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
 * @param option --sucursal seleccionado
 * @returns --nombre de sucursal
 */
    displayFnSuc(option: any): any {
        return option ? option.nombreSucursal : undefined;
    }
    /**
 * Metodo para setear el id a filtrar
 * @param event  - Evento a setear
 */
    opcionSeleccionSuc(event) {
        this.idSucursal = event.option.value.sucursalid;
    }
    /**
        * Metodo que valida si va vacio.
        * @param value 
        * @returns 
        */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
}