import { Component, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialog } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { ModalEmpleadoComponent } from "./modal-empleado.component";
import * as XLSX from 'xlsx';
import { MatTableDataSource } from "@angular/material/table";
import { MatPaginator } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import Swal from 'sweetalert2';

@Component({
    selector: 'empleados',
    moduleId: module.id,
    templateUrl: 'empleados.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 20/10/2022
 * @descripcion: Componente para la administracion de empleados de nomina
 */
export class EmpleadosComponent implements OnInit {
    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;

    formEmpleado: UntypedFormGroup;
    listaEmpresa: any = [];
    opcionesEmpresa: Observable<string[]>;

    listaPlantilla: any = [];
    datos: any = [];

    listaErrores: any = [];
    displayedColumns: string[] = ['fila', 'dato', 'error'];
    dataSourceError: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    correcto: boolean = false;
    //lista empleados
    listaEmpleados: any = [];
    displayedColumnsE: string[] = ['cuenta', 'clave', 'beneficiario', 'rfc', 'fecha', 'sueldo'];
    dataSourceEmple: MatTableDataSource<any>;
    @ViewChild(MatPaginator) paginatorE: MatPaginator;
    @ViewChild(MatSort) sortE: MatSort;

    listaNomina:any=[];
    listaClaveBanco:any=[];
    /**
     * Constructor de la clase PlantillaComponent
     * @param service -Service para el acceso a datos 
     */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, private dialog: MatDialog) {

        this.formEmpleado = this.formBuilder.group({
            numeroCuenta: new UntypedFormControl('', [Validators.required]),
            plantilla: new UntypedFormControl('', [Validators.required])

        });

    }
    /**
     * Inicio de valores
     */
    ngOnInit() {
        this.spsEmpresasNomina();
    this.spsCatalogsMEAPI();
    }
    /**
    * Lisa las empresas con servicio de nomina
    */
    spsEmpresasNomina() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID('', 'spsEmpresasNomina').subscribe(empresa => {

            if (!this.vacio(empresa)) {
                this.listaEmpresa = JSON.parse(empresa);
                // Se setean los creditos para el autocomplete
                this.opcionesEmpresa = this.formEmpleado.get('numeroCuenta').valueChanges.pipe(
                    startWith(''),
                    map(value => this._filterEmpresaN(value)));

            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
        * Filtra el tipo de credito
        * @param value --texto de entrada
        * @returns la opcion u opciones que coincidan con la busqueda
        */
    private _filterEmpresaN(value: any): any[] {
        let filterValue = value;
        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaEmpresa.filter(option => option.nombre.toLowerCase().trim().includes(filterValue)
            || option.numero_cliente.toLowerCase().trim().includes(filterValue));
    }
    displayEmpresa(option: any): any {
        return option ? option.nombre.trim() : undefined;

    }
    /**
     * Cargar plantillas de la empresa seleccionda
     */
    empresaSeleccionada() {

        this.spsPlantilla(this.formEmpleado.get('numeroCuenta').value.numero_cliente);
       
    }
      /**
    * Lista de claves de banco
    */
       spsCatalogsMEAPI() {
        this.listaClaveBanco = [];
        this.blockUI.start('Cargando datos...');
        this.service.getList( 'getCatalogosMEAPI').subscribe(listas => {

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
    spsPlantilla(numCliente) {
        this.blockUI.start('Cargando datos...');
        this.listaPlantilla = [];
        this.service.getListByID(numCliente, 'spsPlantillas').subscribe(plant => {

            if (!this.vacio(plant)) {
                this.listaPlantilla = JSON.parse(plant);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Cargar los empleados de 
     * esa empresa que pertenencen a esa plantilla
     */
    cargarEmpleados(){
        this.blockUI.start('Cargando datos...');
        this.listaNomina = [];
        this.service.getListByID(this.formEmpleado.get('plantilla').value.numero_cliente, 'spsEmpleadosNomina').subscribe(nomina => {

            if (!this.vacio(nomina)) {
                this.listaNomina = JSON.parse(nomina);
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para carga masiva
     */
    seleccionMasiva(event) {
        if (this.formEmpleado.invalid) {
            this.validateAllFormFields(this.formEmpleado);
            this.service.showNotification('top', 'right', 3, "Completa los datos.");

            return;
        }
        const target: DataTransfer = <DataTransfer>(event.target);
        if (target.files.length !== 1) throw new Error('Cannot use multiple files');
        const reader: FileReader = new FileReader();
        reader.onload = (e: any) => {
            /* read workbook */
            const bstr: string = e.target.result;
            const wb: XLSX.WorkBook = XLSX.read(bstr, { type: 'binary', cellText: true, cellNF: false });
            /* grab first sheet */
            const wsname: string = wb.SheetNames[0];
            const ws: XLSX.WorkSheet = wb.Sheets[wsname];

            this.datos = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, dateNF: 'DD-MM-YYYY' });
            this.datos.splice(0, 1);
            this.validarCarga();
        };
        reader.readAsBinaryString(target.files[0]);


    }
    /**
     * Metodo que valida la infomación del archivo cumpla con los requisitos para procesar la infomacion a BD.
     * @returns listaErrores
     */
    validarCarga() {
        let i = 0;
        this.listaErrores = [];
        for (let emp of this.datos) {
            for(let n of  this.listaNomina){
                if(n.numero_cuenta===emp[0] || n.empleado===emp[2]){
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': n.numero_cuenta +' '+ n.empleado , 'error': 'El beneficiario ya se encuntra registrado.' });
                }
            }

            if (emp.length != 6) {
                let fila = i + 2;
                this.listaErrores.push({'fila':fila, 'dato':'Cantidad de columnas '+emp.length,'error':"La fila no contiene el total de columnas requeridas."});
            } else {

                if (emp[0].length != 16 && (emp[0].length != 18)) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[0], 'error': 'La columna Cuenta debe contener 16 dígitos si es número de tarjeta,\n\n si es la CLABE interbancaria a  18 dígitos.' });
                }

                if (this.vacio(this.listaClaveBanco.find(cvb => cvb.clave === emp[1]))) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[1], 'error': 'La columna Clave_banco no es valida.' });
                }
                if (emp[2] == '') {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[2], 'error': 'La columna Beneficiario esta vacia.' });
                }
                if (this.vacio(emp[3])) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[3], 'error': 'La colimna RFC_CURP esta vacia.' });
                } else if (emp[3].length > 18) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[3], 'error': 'Campo de 18 dígitos.' });
                }

                if (this.vacio(emp[4])) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[4], 'error': 'La columna Inicio a laborar esta vacia.' });
                }
                let monto = parseFloat(emp[5]);
                if (isNaN(monto)) {
                    let fila = i + 2;
                    this.listaErrores.push({ 'fila': fila, 'dato': emp[5], 'error': "La columna Monto, no contiene Formato Numerico válido \n\n (Ejemplo 5000, 1500.50, 100000.00, 1000000.00)." });
                } else if (!this.vacio(monto)) {
                    if (monto <= 0) {
                        let fila = i + 2;
                        this.listaErrores.push({ 'fila': fila, 'dato': emp[5], 'error': "La columna Monto, contiene monto negativo." });
                    }
                }
            }
            i++
        }
        if (this.listaErrores.length > 0) {
            this.correcto = false;
            this.spsErrores();
            this.service.showNotification('top', 'right', 3, 'Se encontraron errores en el Archivo.');
        } else {
            //modal para confirma el registro de empleados
            this.correcto = true;
            this.spsEmpleados();

        }

    }

    /**
   * Lisa las errore empleados
   */
    spsErrores() {
        this.blockUI.start('Cargando datos...');
        this.dataSourceError = new MatTableDataSource(this.listaErrores);
        this.dataSourceError.paginator = this.paginator;
        this.dataSourceError.sort = this.sort;
        this.blockUI.stop();

    }

    /**
* Lisa las empleados con servicio de nomina
*/
    spsEmpleados() {
        this.blockUI.start('Cargando datos...');
        this.dataSourceEmple = new MatTableDataSource(this.datos);
        this.dataSourceEmple.paginator = this.paginatorE;
        this.dataSourceEmple.sort = this.sortE;
        this.blockUI.stop();

    }
    /**
     * Confirmar si se quiere procesar la infomacion cargada
     */
    confirmarProceso() {
        Swal.fire({
            title: '¿Deseas continuar con el registro?',
            text: "¡Se procesaran los datos, cargados!",
            icon: 'warning',
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {

            if (result.isConfirmed) {
                //Accion a realizar si no se acepta
                this.altaEmpleadosMasiva();
            } else {
                //limpiar listas
                this.limpiar();
            }
        })
    }
    /**
         * Metodo para la gestion crud de empleado
         */
    altaEmpleadosMasiva() {
        this.blockUI.start('Cargando datos...');

        let empleados: any = [];
        for (let empleado of this.datos) {
            empleados.push([0, empleado[1], empleado[0], empleado[2],
                empleado[3], empleado[5], empleado[4],
                this.formEmpleado.get('plantilla').value.plantilla_id,
                this.formEmpleado.get('numeroCuenta').value.empresa_nomina_id
            ]);
        }
        let json = {
            "accion": 1,
            "datos": empleados
        };

        this.service.registrar(json, 'crudEmpleadosNomina').subscribe(servicio => {

            if (servicio[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, servicio[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, servicio[0][1])
            }
            this.limpiar();
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Metodo para abrir ventana modal resgitrasr actualizar empleado
     */
    modalEmpleado() {

        //valida que este seleccinado la empresa y plantilla 
        if (this.formEmpleado.invalid) {
            this.validateAllFormFields(this.formEmpleado);
            this.service.showNotification('top', 'right', 3, "Completa los datos.");

            return;
        }
        const dialogRef = this.dialog.open(ModalEmpleadoComponent, {
            disableClose: true,
            data: {
                titulo: 'Registrar empleado',
                empresa: this.formEmpleado.get('numeroCuenta').value,
                plantilla: this.formEmpleado.get('plantilla').value

            }
        });
        //Se usa para cuando cerramos
        dialogRef.afterClosed().subscribe(result => {

        });

    }
    /**
     * Limpiar listas y variables
     */
    limpiar() {
        this.datos = [];
        this.listaErrores = [];
        this.correcto = false;
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
    }
}