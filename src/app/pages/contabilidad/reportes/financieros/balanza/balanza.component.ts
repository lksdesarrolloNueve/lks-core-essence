import { SelectionModel } from "@angular/cdk/collections";
import { FlatTreeControl } from "@angular/cdk/tree";
import { formatDate } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatTreeFlatDataSource, MatTreeFlattener } from "@angular/material/tree";
import { PermisosService } from "../../../../../shared/service/permisos.service";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../../../../../shared/service/gestion";
import { TableUtil } from "../../../../../shared/Util/tableUtil";

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

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 02/08/2022
 * @descripcion: Componente para la gestion balanza de comprobación.
 */


@Component({
    selector: 'balanza',
    moduleId: module.id,
    templateUrl: 'balanza.component.html'
})

export class BalanzaComponent implements OnInit {

    //Declaracion de variables y componentes
    @BlockUI() blockUI: NgBlockUI;

    listaSucursales: any = [];
    listaTipoCuenta: any[];
    arbolcuentas: any;
    vacio : boolean = false;

    formFiltros: UntypedFormGroup;

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

    /**
     * Constructor de la clase
     * @param service - Service para el acceso a datos
     * @param formBuilder - Gestion de fomularios
     */
    constructor(private service: GestionGenericaService, 
                private formBuilder: UntypedFormBuilder,
                private servicePermisos: PermisosService
    ) {

        this.formFiltros = this.formBuilder.group({
            sucursal: new UntypedFormControl(),
            fecha: new UntypedFormControl('', Validators.required),
            acumulado: new UntypedFormControl(false),
            movimientos: new UntypedFormControl(false),
            consolidado: new UntypedFormControl(true),
            csv: new UntypedFormControl(false),
            trece: new UntypedFormControl(false)
        });

    }

    /**
     * Metodo de Inicio
     */
    ngOnInit() {
        this.spsSucurales();
        this.spsTipoCuenta();
        this.spsCuentas();
    }

    /**
     * Carga cuentas contables para arbol
     */
    spsCuentas(){
        this.blockUI.start('Cargando datos...');
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
    }

    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsSucurales() {
        this.blockUI.start('Cargando datos...');

        this.listaSucursales = this.servicePermisos.sucursales;

        this.blockUI.stop();
    }


    /**
     * Lista los tipos de cuentas
     */
     spsTipoCuenta() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(2, 'listaTipoCuenta').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoCuenta = data;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para generar el reporte balanza de comprobación.
     */
    generarBalanza() {

        
        if(this.formFiltros.get('consolidado').value === false){
            this.formFiltros.get('sucursal').setValidators([Validators.required]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        }else{
            this.formFiltros.get('sucursal').setValidators([]);
            this.formFiltros.get('sucursal').updateValueAndValidity();
        }
        
        let cuentasid = [];

        //Validacion de Cuentas
        if (this.checklistSelection.selected.length > 0) {
            this.vacio = false;
            for (let cuenta of this.checklistSelection.selected) {
                cuentasid.push(cuenta.cuenta_id);
            }
        }else{
            this.vacio = true;
            return;
        }

        //Valida formulario
        if (this.formFiltros.invalid) {
            this.validateAllFormFields(this.formFiltros);
            return;
        }

        let fecha =  formatDate(this.formFiltros.get('fecha').value, 'dd/MM/yyyy', 'en-US');
        let fechaCompara =  formatDate(this.formFiltros.get('fecha').value, 'yyyy', 'en-US');

        //Valida ultimo dia de año para periodo trece.
        if(this.formFiltros.get('trece').value){
            if(fecha !== ('31/12/'+ fechaCompara)){
                this.formFiltros.controls['fecha'].setErrors({ ultimoDia: true });
                return;
            }
        }

        let sucursalCve = '';
        let sucursalNombre = '';
        if(this.formFiltros.get('consolidado').value === false){
            sucursalCve = this.formFiltros.get('sucursal').value.cveSucursal;
            sucursalNombre = this.formFiltros.get('sucursal').value.nombreSucursal;
        }

       
        let json = {
            "cveSucursal": sucursalCve,
            "nombreSucursal": sucursalNombre,
            "cuentasId":   cuentasid,
            "fecha":       fecha,
            "acumulado":   this.formFiltros.get('acumulado').value,
            "movimientos": this.formFiltros.get('movimientos').value,
            "consolida":   this.formFiltros.get('consolidado').value,
            "periodoTrece": this.formFiltros.get('trece').value
        };

        this.blockUI.start('Generando Reporte...');

        if (this.formFiltros.get('csv').value === false) {

            this.service.registrar(json,'spsBalanza').subscribe(data => {
                this.blockUI.stop();
    
                if (data[0] === '0') {
                    this.service.showNotification('top', 'right', 2, data[1]);
                    const linkSource = 'data:application/pdf;base64,' + data[2] + '\n';
                    const downloadLink = document.createElement("a");
                    const fileName = 'Balanza de comprobacion' + '.pdf';
    
                    downloadLink.href = linkSource;
                    downloadLink.download = fileName;
                    downloadLink.click();
    
                } else {
                    this.service.showNotification('top', 'right', 3, data[1]);
                }
    
            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });
    

        }else{

            this.service.registrar(json,'spsBalanzaCSV').subscribe(csvResponse => {
                this.blockUI.stop();
                
                let reporteCSV = [];
                let json2:any;
                let tipoCuentaFilter : any;
                

                //Recorremos la lista par pintar el reporte
                csvResponse.forEach((respuesta : any)=> {
                    
                    tipoCuentaFilter =  this.listaTipoCuenta.filter(tipoC => tipoC.tipoCuentaId === respuesta.cuentaContable.tipoCuentaId);

                    json2 = {
                        'Cuenta':        respuesta.cuentaContable.cuenta,
                        'Nombre_Cuenta': respuesta.cuentaContable.nombre,
                        'Tipo':          tipoCuentaFilter[0]?.descripcion,
                        'Saldo_Inicial': respuesta.saldoInicial,
                        'Debe':          respuesta.cargos,
                        'Haber':         respuesta.abonos,
                        'Saldo_Final':   respuesta.saldoFinal, 
                    }

                   reporteCSV.push(json2);
                });

                let fechaTitle =  formatDate(this.formFiltros.get('fecha').value, 'dd MMMM yyyy', 'es-MX');
                
                if(reporteCSV.length > 1) {
                    TableUtil.exportArrayToExcel(reporteCSV,'Balanza '+fechaTitle+' ')
                }else{
                    this.service.showNotification('top', 'right', 3, 'No se encontraron datos.');
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error.Message);
            });

        }

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
     * Valida Cada atributo del formulario
     * @param formGroup - Recibe cualquier asigna de FormGroup
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
    * Validaciones de los datos de movimientos de polizas
    */
     listaValidaciones = {
        'sucursal': [
            { type: 'required', message: 'Sucursal requerida.' }
        ],
        'cuenta': [
            { type: 'required', message: 'Cuentas requeridas.' }
        ],
        'fecha': [
            { type: 'required', message: 'Fecha requerida.' },
            { type: 'ultimoDia', message: 'Para generar la balanza periodo trece, seleccione el último día del año.' },
        ]
    }

}