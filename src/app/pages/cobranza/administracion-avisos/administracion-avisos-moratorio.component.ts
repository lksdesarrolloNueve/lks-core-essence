import { Component, ViewChild } from '@angular/core';
import { UntypedFormControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { BuscarClientesComponent } from '../../../pages/modales/clientes-modal/buscar-clientes.component';
import { GestionGenericaService } from '../../../shared/service/gestion';
import { PermisosService } from '../../../shared/service/permisos.service';
import { environment } from '../../../../environments/environment';
import globales from '../../../../environments/globales.config';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { connectableObservableDescriptor } from 'rxjs/internal/observable/ConnectableObservable';

@Component({
    selector: 'administracion-avisos-moratorio',
    moduleId: module.id,
    templateUrl: 'administracion-avisos-moratorio.component.html'
})
/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 17/06/2022
 * @descripcion: Componente para la gestion de avisos moratorios
 */
export class AdministracionAvisosMoratorioComponent {
    //Declaracion de Variables y Componentes
    @BlockUI() blockUI: NgBlockUI;
    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;

    cliente = new UntypedFormControl();
    avisos = new UntypedFormControl();

    numeroCl: string = "";
    listaAvisos: any = [];//combo

    listaMoratorios: any = [];
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['numeroCliente', 'nombre', 'fecha', 'descripcion',
        'dias', 'monto'];
    dataSource: MatTableDataSource<any>;
    //Datos para generar reportes
    listReporte: any = [];

    constructor(private service: GestionGenericaService, private servicePermisos: PermisosService, public dialog: MatDialog) {
        this.spsAvisos();
        this.spsAvisosMoratorios(1);
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
                    this.numeroCl = result.datosCl.numero_cliente.trim();
                    this.cliente.setValue(result.datosCl.nombre_cl + ' ' + result.datosCl.paterno_cl + ' ' + result.datosCl.materno_cl)
                } else {
                    //Moral
                    this.numeroCl = result.datosCl.numero_cliente.trim();
                    this.cliente.setValue(result.datosCl.razon_social)
                }
            }
            if (result == 1) {
                this.numeroCl = "";
                this.cliente.setValue('');
            }

        });

    }
    /**
      * Metodo para listar los  avisos registrados 
      * en generales por la clave de la categoria
      * @param catAvisosMoratorio
      */
    spsAvisos(): any {

        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catAvisosMoratorio, 'listaGeneralCategoria').subscribe(data => {
            this.listaAvisos = data;
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
       * Metodo para consultar los  avisos moratorios
       * registrados 
       * 
       */
    spsAvisosMoratorios(accion): any {
        this.blockUI.start('Cargando datos...');
        //Se genera el Arreglo para consultar
        this.listaMoratorios = [];
        let cveAviso = '';
        if (accion === 2) {
            //verifica que se halla seleccionado un cliente o un tipo de aviso 
            if (this.vacio(this.numeroCl) && this.vacio(this.avisos.value)) {
                this.service.showNotification('top', 'right', 3, 'No se ha seleccionado un cliente o tipo de aviso.');
                accion = 1;
            }
            if (!this.vacio(this.avisos.value)) {
                cveAviso = this.avisos.value.cveGeneral
            }
        }
        let arreglo = {
            "datos": [this.numeroCl, cveAviso],
            "accion": accion
        };

        this.service.getListByObjet(arreglo, 'avisosMoratorio').subscribe(data => {
            if (!this.vacio(data)) {
                this.listaMoratorios = JSON.parse(data);
                this.dataSource = new MatTableDataSource(this.listaMoratorios);
                this.dataSource.paginator = this.paginator;
                this.dataSource.sort = this.sort;
            } else {
                this.dataSource = new MatTableDataSource(this.listaMoratorios);
            }
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
* Metodo para filtrar de avisos moratorios
* @param event --evento a filtrar
*/
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSource.filter = filterValue.trim().toLowerCase();
        if (this.dataSource.paginator) {
            this.dataSource.paginator.firstPage();
        }
    }
    /**
     * Metodo para llene la lista del reporte en excel
     */
    reporte() {
        this.blockUI.start('Cargando datos...');
        this.listReporte = [];
        let cveAviso = '';
        if (!this.vacio(this.avisos.value)) {
            cveAviso = this.avisos.value.cveGeneral;
        }
        let arreglo = {
            "datos": [this.numeroCl, cveAviso],
            "accion": 3
        };
        this.service.getListByObjet(arreglo, 'avisosMoratorio').subscribe(data => {
            if (!this.vacio(data)) {
                let datosReporte = JSON.parse(data);
                this.creandoListaExcel(datosReporte);
            } else {
                this.listReporte = [];
            }
            this.blockUI.stop();

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**Metodo para ir llenando la lista a generar el archivo excel */
    creandoListaExcel(reporte){
        for (let report of reporte) {
            let paterno = this.vacio(report.apellido_paterno) ? '' : report.apellido_paterno;
            let materno = this.vacio(report.apellido_materno) ? '' : report.apellido_materno;
            let cliente = '';
            cliente = report.nombre + " " + paterno + " " + materno;
            let domicilio = JSON.parse(report.domicilio);
            let telCl = '', correoCl = '';
            let tel = '', correo = '';
            let credito = JSON.parse(report.debe);
            let aval, domicilioAv;
            let nombreAv = '';
            if (!this.vacio(report.avales)) {
                let domAv;
                aval = JSON.parse(report.avales);
                let paternoAv = this.vacio(aval[0].apellido_paternoav) ? '' : aval[0].apellido_paternoav;
                let maternoAv = this.vacio(aval[0].apellido_maternoav) ? '' : aval[0].apellido_maternoav;
                domAv = JSON.parse(aval[0].domicilios);
                    tel = report.telefono.trim();
                    correo = report.correo.trim();
                nombreAv = aval[0].nombresav + " " + paternoAv + " " + maternoAv;
                domicilioAv = domAv[0].calle + " No. " + domAv[0].numero_exterior + " ,C.P." + domAv[0].cp + " ,Colonia" + domicilio[0].nombre_colonia
            } else {
                    telCl = report.telefono.trim();
                    correoCl = report.correo.trim();
            }
            //lista JSON  con los datos del reporte
            this.listReporte.push({
                'AVISO': report.num_aviso, 'SUCURSAL': report.nombre_sucursal, 'NO. CLIENTE': report.numero_cliente,
                'CLIENTE': cliente, 'DOMICILIO': domicilio[0].calle + " No. " + domicilio[0].numero_exterior + " ,C.P." + domicilio[0].cp + " ,Colonia" + domicilio[0].nombre_colonia,
                'NO. CELULAR': telCl, 'CORREO': correoCl,
                'OTORGAMIENTO DE CREDITO': report.fecha_entrega,
                'REFERENCIA': report.referencia, 'MONTO CREDITO': credito[0].monto,
                'SALDO': credito[0].saldo_credito, 'MONTO VENCIDO': credito[0].monto_vencido,
                'INTERES A PAGAR': credito[0].interes, 'INTERES MORATORIO': credito[0].moratorio,
                'IVA': credito[0].iva, 'TOTAL A PAGAR': credito[0].total, 'DIAS DE MORA': credito[0].diasmora,
                'ULTIMO ABONO': report.ultimo_pago, 'PROXIMO PAGO': report.siguiente_pago, 'SALDO AHORRO': report.saldo_ahorro,
                'AVAL': nombreAv, 'DOMICILIO AVAL': domicilioAv,
                'TELEFONO': tel, 'CORREO AVAL': correo,
                'CONVENIOS': '', 'ANTECEDENTES': '', 'PROMESAS': '', 'LLAMADAS': '',
                'ABOGADO': ''
            });
        }

        this.generarExcel();
    }
    /**
     * Método para asignar los parametros necesarios para generar un excel en base al json que se proporcione
     */
    generarExcel() {
        let json = this.listReporte; // JSON que se convertira a excel
        let nombreExcel = "Reporte Avisos"; // Nombre que tendra el excel
        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'avisos_moratorios': worksheet }, SheetNames: ['avisos_moratorios'] };
        const excelBuffer: any = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        this.descargarExcel(excelBuffer, nombreExcel);
    }

    /**
     * Método para descargar el excel generado
     * @param buffer 
     * @param fileName 
     */
    descargarExcel(buffer: any, fileName: string) {
        const EXCEL_TYPE = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
        const EXCEL_EXTENSION = '.xlsx';
        const data: Blob = new Blob([buffer], { type: EXCEL_TYPE });
        FileSaver.saveAs(data, fileName + "_" + new Date().toLocaleDateString() + EXCEL_EXTENSION); // Se completa el nombre del excel con informacion adicional
    }
    /**
     * Metodo para generar los pdf
     */
    avisosAutomaticos() {
        this.blockUI.start('Generando Avisos');
        this.service.getList('avisosMoaratorioAuto').subscribe(data => {
            if (data[0] === '0') {
                const linkSource = 'data:application/pdf;base64,' + data[1] + '\n';
                const fileName = 'Avisos_Moratorios.pdf';
                window.open(linkSource, fileName);

            } else {
                this.service.showNotification('top', 'right', 4, data[1])
            }
            //se craga la tabla de avisos nuevamente
            this.spsAvisosMoratorios(1);
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
}