import { Component, ViewChild } from "@angular/core";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { UntypedFormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import globales from "../../../../environments/globales.config";
import moment from "moment";

@Component({
    selector: 'recargas',
    moduleId: module.id,
    templateUrl: 'recargas.component.html',

})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 16/05/2022
 * @descripcion: Componente para la gestión de MTCenter
 */
export class RecargasMTCenterComponent {
    //Declaracion de variables y compoenentes
    displayedColumns: string[] = ['fecha', 'telefono', 'monto', 'noAutorizacion','sucursal','codigo','respuesta','movimiento'];
    dataSourceMTCenterR: MatTableDataSource<any>;
    listaRecargas: any = [];

    titulo: string;
    sucursal = new UntypedFormControl();
    fechaI = new UntypedFormControl(new Date());
    fechaF = new UntypedFormControl();
    listaSucursales: any = [];
    opcionesSucursal: Observable<string[]>;

    pfecha = new UntypedFormControl();
    sucursalR = new UntypedFormControl();
    opcionesSucursalR: Observable<string[]>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;

    @BlockUI() blockUI: NgBlockUI;

    /**
    * Constructor del componente ServiciosMTCenterComponent
    * @param service - Service para el acceso a datos
    */
    constructor(private service: GestionGenericaService) {
        this.spsRecargasMtcenter(1);
        this.spsSucurales();
    }

    /**
       * Metodo para cargar en tabla Estado de Créditos.
       */
    spsRecargasMtcenter(accion) {
        this.blockUI.start('Cargando datos...');
        let fechaFin;
        let fechaI;
        let sucursal;
        let pAccion=1;
        if (accion == 1) {
            fechaI = moment(this.fechaI.value).format('DD/MM/YYYY');
            sucursal = this.sucursal.value == null ? null : this.sucursal.value.cveSucursal;
            if (this.vacio(this.fechaF.value)) {
                fechaFin = null;
            } else {
                fechaFin = moment(this.fechaF.value).format('DD/MM/YYYY');
            }
        } else {//reporte
            fechaI = moment(this.pfecha.value).format('DD/MM/YYYY');
            fechaFin = null;
            sucursal = this.sucursalR.value == null ? null : this.sucursalR.value.cveSucursal;
            pAccion=3;
        }

        let json = {
            "data": {
                "cveMovimiento": globales.cveRecargas,
                "fechaInicio": fechaI,
                "fechaFin": fechaFin,
                "cveSucursal": sucursal
            },
            "accion": pAccion
        };
        
        this.service.getListByObjet(json, 'spsVentasMTCenter').subscribe(spsRecarga => {
            this.blockUI.stop();
            if (spsRecarga.codigo == "0") {
                this.listaRecargas = spsRecarga.info;
                console.log(this.listaRecargas);
                if (accion == 2) {
                    this.exportarATXT();
                } else {
                if (!this.vacio(this.listaRecargas)) {
                    
                   
                    this.dataSourceMTCenterR = new MatTableDataSource(this.listaRecargas);
                    this.dataSourceMTCenterR.paginator = this.paginator;
                    this.dataSourceMTCenterR.sort = this.sort;
                    }
                }
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
        * Metodo para filtrar  Recargas MTCenter
        * @param event - evento a filtrar
        */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceMTCenterR.filter = filterValue.trim().toLowerCase();

        if (this.dataSourceMTCenterR.paginator) {
            this.dataSourceMTCenterR.paginator.firstPage();
        }
    }
    /**
         * Metodo para cargar en todas las sucursales
         */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.blockUI.stop();
            this.listaSucursales = data;
            this.opcionesSucursal = this.sucursal.valueChanges.pipe(
                startWith(''),
                map(value => this._filterSucursal(value))
            )
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

    /**Exportar datos JSON a txt
     * @param JSONList lista a procesar 
     * @param fileName nombre del archivo
     */
     exportarATXT() {
         if(!this.vacio(this.listaRecargas)) {
        const valor = (key: string, value: string | null) => value === null ? '' : value;
        const header = Object.keys( this.listaRecargas[0]);
       let csv = this.listaRecargas.map(row => header.map(fieldName => JSON.stringify(row[fieldName], valor).replace(/["',]/g, '')).join(''));
        let data = csv.join('\r\n');// retorno de carro seguido de un salto de línea después de cada fila
        let fecha=moment(this.fechaI.value).format('YYYYMMDD');
        let nombre='MTCCTAE'+this.listaRecargas[0].cadena+this.listaRecargas[0].establecimiento+fecha;
        RecargasMTCenterComponent.downloadFile(nombre, data);
         }else{
            this.service.showNotification('top', 'right', 3, 'No se se encontraron datos para generar el archivo TXT.');
         }
    }
    /**Se define el metodo estatico para ser llamdao solo por la clase 
     * Descarga el archivo TXT
     *@param filename nombre del  archivo
     *@param data infomacion procesada definida con el simbolo ;
    */
    static downloadFile(filename: string, data: string) {
        // the document has to be compatible with Excel, we export in UTF-8
        // previously we saved only using 'text/csv'
        let format = 'text/plain;charset=utf-8';
        // we add the BOF for UTF-8, Excel requires this information to show chars with accents etc.
        let blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), data], { type: format });
        let elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename + '.TXT';
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
    /**
     * Metodo para validar elemento vacio
     * @param value 
     * @returns 
     */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0 || value==null);
    }


}