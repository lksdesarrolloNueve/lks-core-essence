import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import * as XLSX from 'xlsx';
import * as FileSaver from 'file-saver';
import { GestionGenericaService } from "../../../shared/service/gestion";

/**
 * Node for to-do item
 */
export class TodoItemNode {
    children: TodoItemNode[];
    cuenta_id: number;
    nombre: string;
    cuenta: string;
    level: number;
}

/** Flat node with expandable and level information */
export class CuentaNode {
    expandable: boolean;
    cuenta_id: number;
    nombre: string;
    cuenta: string;
    level: number;
}

@Component({
    selector: 'mov-poliza',
    moduleId: module.id,
    templateUrl: 'movimientoPoliza.component.html'
})

/**
 * @autor: Fatima Bolaños Duran 
 * @version: 1.0.0
 * @fecha: 12/07/2022
 * @descripcion: Componente para la gestion  los movimientos de polizas por cuentas sucursales y consolidado 
 */
export class MovimientoPolizasComponent implements OnInit {

    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;

    //Declaracion de Variables arbol
    arbolcuentas: any;
    cuentasid: any = [];

    //Declracion de varialbles y componentes
    formFilfros: UntypedFormGroup;

    // Sucursal 
    sucursal = new UntypedFormControl('', [Validators.required]);
    acoumualdo = new UntypedFormControl(false, [Validators.required]);
    listaSucursales: any = [];
    idSucursal: number = 0;

    // Fechas de inicio y fin
    mesIn = new UntypedFormControl('', [Validators.required]);
    mesFin = new UntypedFormControl('', [Validators.required]);

    // listas 
    listaMovimientosPoliza: any = [];
    listaTipoCuenta: any[];
    listaCuentasContables: any[];
    // Reporte 
    today = new Date();
    listIns: any = [];
    listRel: any = [];
    listReporte: any = [];
    //radiobutons
    opciones: any = [{ id: 1, nombre: 'Sucursal' }, { id: 2, nombre: 'Consolidado' }];
    mostrarSucursal: boolean = false;
    consolidado: boolean = false;
    porSucursal: boolean = false;



    //### Configuracion Arbol MenusComponent
    /** Arbol Servidores */
    /** Map from flat node to nested node. This helps us finding the nested node to be modified */
    flatNodeMap = new Map<CuentaNode, TodoItemNode>();
    /** Map from nested node to flattened node. This helps us to keep the same object for selection */
    nestedNodeMap = new Map<TodoItemNode, CuentaNode>();

    treeControl: FlatTreeControl<CuentaNode>;

    treeFlattener: MatTreeFlattener<TodoItemNode, CuentaNode>;
    dataSourceCuentas: MatTreeFlatDataSource<TodoItemNode, CuentaNode>;

    /** The selection for checklist */
    checklistSelection = new SelectionModel<CuentaNode>(true /* multiple */);

    // Tabla de movimientos de polizas
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    displayedColumns: string[] = ['cuenta', 'nombre', 'concepto',
        'saldo_inicial', 'debe', 'haber', 'saldofinal', 'sucursal', 'fecha'];
    dataSourceMovimientos: MatTableDataSource<any>;

    /**
    * Constructor de la clase PeriodoComponent
    * @param service --Service para el acceso a datos
    * @param dialog - Gestion de acceso a datos
    */
    constructor(private service:
        GestionGenericaService, public dialog: MatDialog, private fomrBuilder: UntypedFormBuilder) {

        this.treeFlattener = new MatTreeFlattener(this.transformer, this.getLevel,
            this.isExpandable, this.getChildren);
        this.treeControl = new FlatTreeControl<CuentaNode>(this.getLevel, this.isExpandable);
        this.dataSourceCuentas = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

        /// Metodo que estrae los datos de la lista de cuentas contables 
        this.service.getList('listaJsonCuentas').subscribe(data => {
            this.blockUI.stop();
            const res = JSON.parse(data);
            this.treeControl = new FlatTreeControl<CuentaNode>(this.getLevel, this.isExpandable);
            this.dataSourceCuentas = new MatTreeFlatDataSource(this.treeControl, this.treeFlattener);

            this.dataSourceCuentas.data = res;
            this.arbolcuentas = res;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
        this.formFilfros = this.fomrBuilder.group({
            sucursal: this.sucursal,
            cuentas: this.cuentasid
        });
    }
    getLevel = (node: CuentaNode) => node.level;
    isExpandable = (node: CuentaNode) => node.expandable;

    getChildren = (node: TodoItemNode): TodoItemNode[] => node.children;

    hasChild = (_: number, _nodeData: CuentaNode) => _nodeData.expandable;

    hasNoContent = (_: number, _nodeData: CuentaNode) => _nodeData.cuenta === '';

    /**
    * Transformer to convert nested node to flat node. Record the nodes in maps for later use.
    */
    transformer = (node: TodoItemNode, level: number) => {
        const existingNode = this.nestedNodeMap.get(node);
        const flatNode = existingNode && existingNode.cuenta === node.cuenta
            ? existingNode
            : new CuentaNode();
        flatNode.cuenta_id = node.cuenta_id;
        flatNode.nombre = node.nombre;
        flatNode.cuenta = node.cuenta;
        flatNode.level = level;
        flatNode.expandable = !!node.children?.length;
        this.flatNodeMap.set(flatNode, node);
        this.nestedNodeMap.set(node, flatNode);
        return flatNode;
    }

    /** Metodo de OnInit */
    ngOnInit(): void {
        this.spsSucursal();

    }

    /** Whether all the descendants of the node are selected. */
    descendantsAllSelected(node: CuentaNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.length > 0 && descendants.every(child => {
            return this.checklistSelection.isSelected(child);
        });
        return descAllSelected;
    }

    /** Whether part of the descendants are selected */
    descendantsPartiallySelected(node: CuentaNode): boolean {
        const descendants = this.treeControl.getDescendants(node);
        const result = descendants.some(child => this.checklistSelection.isSelected(child));
        return result && !this.descendantsAllSelected(node);
    }

    /** Toggle the to-do item selection. Select/deselect all the descendants node */
    todoItemSelectionToggle(node: CuentaNode): void {
        this.checklistSelection.toggle(node);
        const descendants = this.treeControl.getDescendants(node);
        this.checklistSelection.isSelected(node)
            ? this.checklistSelection.select(...descendants)
            : this.checklistSelection.deselect(...descendants);

        // Force update for the parent
        descendants.forEach(child => this.checklistSelection.isSelected(child));
        this.checkAllParentsSelection(node);

    }

    /** Toggle a leaf to-do item selection. Check all the parents to see if they changed */
    todoLeafItemSelectionToggle(node: CuentaNode): void {
        this.checklistSelection.toggle(node);
        this.checkAllParentsSelection(node);
    }

    /* Checks all the parents when a leaf node is selected/unselected */
    checkAllParentsSelection(node: CuentaNode): void {
        let parent: CuentaNode | null = this.getParentNode(node);
        while (parent) {
            this.checkRootNodeSelection(parent);
            parent = this.getParentNode(parent);
        }
    }

    /** Check root node checked state and change it accordingly */
    checkRootNodeSelection(node: CuentaNode): void {
        const nodeSelected = this.checklistSelection.isSelected(node);
        const descendants = this.treeControl.getDescendants(node);
        const descAllSelected = descendants.length > 0 && descendants.every(child => {
            return this.checklistSelection.isSelected(child);
        });
        if (nodeSelected && !descAllSelected) {
            this.checklistSelection.deselect(node);
        } else if (!nodeSelected && descAllSelected) {
            this.checklistSelection.select(node);
        }
    }

    /* Get the parent node of a node */
    getParentNode(node: CuentaNode): CuentaNode | null {
        const currentLevel = this.getLevel(node);

        if (currentLevel < 1) {
            return null;
        }

        const startIndex = this.treeControl.dataNodes.indexOf(node) - 1;

        for (let i = startIndex; i >= 0; i--) {
            const currentNode = this.treeControl.dataNodes[i];

            if (this.getLevel(currentNode) < currentLevel) {
                return currentNode;
            }
        }
        return null;
    }

    /**
     * Metodo para la lista de Movimientos de polizas 
    */
    spsMovimientospolizas() {
        this.blockUI.start('Cargando datos...');
        /// Esta vacia la caja de texto sucursal es reporte consolidado
        if (this.mostrarSucursal) {
            //Se valida la sucursal
            this.sucursal.setValidators([Validators.required]);
            this.sucursal.updateValueAndValidity();
            if (this.sucursal.invalid) {
                if (this.sucursal instanceof UntypedFormControl) {
                    this.sucursal.markAsTouched({ onlySelf: true });
                }
                this.blockUI.stop();
                return;
            }
        } else {
            this.sucursal.setValidators([]);
            this.sucursal.updateValueAndValidity();
        }
        //Obtener las sucursales 
        let listSuc = [];
        for (let su of this.formFilfros.get('sucursal').value) {
            listSuc.push(su.sucursalid);
        }
        //Se obtiene las cuentas seleccionadas
        this.cuentasid = [];
        if (this.checklistSelection.selected.length > 0) {
            for (let cuenta of this.checklistSelection.selected) {
                this.cuentasid.push(cuenta.cuenta_id);
            }
        } else {
            this.service.showNotification('top', 'right', 3, "Deves Selecionar una cuenta contable");
            this.blockUI.stop();
            return;
        }
        // Se genrea el arreglo para consultar los movientos de polizas
        let movi = {
            "datos": [
                this.mesIn.value,
                this.mesFin.value,
                this.acoumualdo.value,
                this.consolidado,
                this.porSucursal


            ],
            "cuentas": this.cuentasid,
            "sucursales": listSuc,

        };
        this.service.getListByObjet(movi, 'spsMovimientospolizas').subscribe(reportemovimiento => {
            if (!this.vacio(reportemovimiento)) {
                this.listaMovimientosPoliza = reportemovimiento;
                this.dataSourceMovimientos = new MatTableDataSource(this.listaMovimientosPoliza);
                this.dataSourceMovimientos.paginator = this.paginator;
                this.dataSourceMovimientos.sort = this.sort;
                this.creandoListaExcel(this.listaMovimientosPoliza);
            } else {
                this.service.showNotification('top', 'right', 3, 'No hay movimientos poliza en esta sucursal.');
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
    * Seleccion radio group
    * @param dato infomarmacion de la opcion seleccionada
    */
    cambioRadio(dato) {
        if (dato.id == 1) {
            this.mostrarSucursal = true;
            this.porSucursal = true;
            this.consolidado = false;
        } else {
            //se oculata y limpia la caja de texto
            this.mostrarSucursal = false;
            this.porSucursal = false;
            this.consolidado = true;
            this.sucursal.setValue('');
            this.sucursal.setValidators(null);
            this.sucursal.updateValueAndValidity();
        }

    }
    /**
      * Metodo que valida si va vacio.
      * @param value 
      * @returns 
      */
    vacio(value) {
        return (!value || value == undefined || value == null || value == "" || value.length == 0);
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

    // pass mat input string to recursive function and return data
    filterTree(filterText: string) {
        // use filter input text, return filtered TREE_DATA, use the 'name' object value
        this.dataSourceCuentas.data = this.filterRecursive(filterText, this.arbolcuentas, 'nombre');
    }

    // filter string from mat input filter
    applyFilter(filterText: string) {
        this.filterTree(filterText);
        // show / hide based on state of filter string
        if (filterText) {
            this.treeControl.expandAll();
        } else {
            this.treeControl.collapseAll();
        }
    }


    // filter recursively on a text string using property object value
    filterRecursive(filterText: string, array: any[], property: string) {
        let filteredData;

        //make a copy of the data so we don't mutate the original
        function copy(o: any) {
            return Object.assign({}, o);
        }

        // has string
        if (filterText) {
            // need the string to match the property value
            filterText = filterText.toLowerCase();
            // copy obj so we don't mutate it and filter
            filteredData = array.map(copy).filter(function x(y) {
                if (y[property].toLowerCase().includes(filterText)) {
                    return true;
                }
                // if children match
                if (y.children) {
                    return (y.children = y.children.map(copy).filter(x)).length;
                }
            });
            // no string, return whole array
        } else {
            filteredData = array;
        }

        return filteredData;
    }

    /**
     * Metodo para consultar Sucursales
     * accion 2 activas
     */
    spsSucursal() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaSucursales').subscribe(data => {
            this.listaSucursales = data;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }


    /**
    * metodo para filtrar en el listado obtenido de base de datos
    * @param event - evento a filtrar
    */
    applyFilter1(event: Event) {
        const filterAviso = (event.target as HTMLInputElement).value;
        this.dataSourceMovimientos.filter = filterAviso.trim().toLowerCase();
        if (this.dataSourceMovimientos.paginator) {
            this.dataSourceMovimientos.paginator.firstPage();
        }

    }
    /**
     * Validaciones de los datos de movimientos de polizas
     */
    validaciones = {
        'sucursal': [
            { type: 'required', message: 'Sucursal requerida.' }
        ],
        'cuenta': [
            { type: 'required', message: 'Cuentas requeridas.' }
        ],
        'mesIn': [
            { type: 'required', message: 'Fecha Inicial requerida.' }
        ],
        'mesFin': [
            { type: 'required', message: 'Fecha Final requerida.' }
        ]
    }



    /**Metodo para ir llenando la lista a generar el archivo excel */
    creandoListaExcel(listaMovimientosPoliza) {
        this.listReporte = [];
        for (let report of listaMovimientosPoliza) {

            //lista JSON  con los datos del reporte
            this.listReporte.push({
                'CUENTA': report.cuenta, 'NOMBRE': report.nombre, 'FECHA': report.detalleMovPoliza.fecha,
                'DESCRIPCION': report.detalleMovPoliza.concepto, 'SALDO INICIAL': report.detalleMovPoliza.saldoInicial,
                'DEBE': report.detalleMovPoliza.debe, 'HABER': report.detalleMovPoliza.haber,
                'SALDO FINAL': report.detalleMovPoliza.saldofinal, 'SUCURSAL': report.detalleMovPoliza.nombresucursal
            });
        }

        this.generarExcel();
    }
    /**
        * Método para asignar los parametros necesarios para generar un excel en base al json que se proporcione
        */
    generarExcel() {
        let json = this.listReporte; // JSON que se convertira a excel
        let nombreExcel = "Reporte Movimientos Polizas"; // Nombre que tendra el excel

        const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(json);
        const workbook: XLSX.WorkBook = { Sheets: { 'movimientos_polizas': worksheet }, SheetNames: ['movimientos_polizas'] };
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

}
