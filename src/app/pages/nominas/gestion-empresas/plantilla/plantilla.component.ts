import { Component, ViewChild } from '@angular/core';
import { UntypedFormBuilder, UntypedFormControl, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import FuzzySearch from 'fuzzy-search';
import { ModalEmpleadoComponent } from '../empleados/modal-empleado.component';
import { environment } from '../../../../../environments/environment';
import Swal from 'sweetalert2';

@Component({
    selector: 'plantilla',
    moduleId: module.id,
    templateUrl: 'plantilla.component.html',
})

/**
 * @autor: Jasmin
 * @version: 1.0.0
 * @fecha: 19/10/2022
 * @descripcion: Componente para la administracion de dispersion de nomina acorde a plazos
 */
export class PlantillaComponent {
    //Declaracion de variables
    @BlockUI() blockUI: NgBlockUI;
    boton: string = 'Registrar';
    listaPeriodos: any = [];
    listaEstNomina: any = [];
    listaEmpresa: any = [];
    opcionesEmpresa: Observable<string[]>;
    numEmpresa: string = '';
    //tabla
    listaPlantilla: any = [];
    searcher: any;
    public searchText: string;
    public plantillaRes: [];

    listaNomina: any = [];
    displayedColumns: string[] = ['noCuenta', 'nombre', 'sueldo', 'periodo', 'plantilla']
    dataSourceNomina: MatTableDataSource<any>;

    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;
    plantillaID: number = 0;
    plantilla = new UntypedFormControl('', [Validators.required]);
    numeroCuenta = new UntypedFormControl('', [Validators.required]);
    plazo = new UntypedFormControl('', [Validators.required]);
    estatus = new UntypedFormControl('');
   

    /**
      * Constructor de la clase PlantillaComponent
      * @param service -Service para el acceso a datos 
      */
    constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, private dialog: MatDialog) {
        this.spsEmpresasNomina();
        this.spsPeriodo();
        this.spsEstatusNomina();
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
                this.opcionesEmpresa = this.numeroCuenta.valueChanges.pipe(
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
 * Metodo para cargar los plazos
 */
    spsPeriodo() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaTipoPlazo').subscribe(plazo => {
            this.listaPeriodos = plazo;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
    * Metodo para listar los estatus de nomina
    * en generales por la clave de la categoria
    * @param catEstatusNomina
    */
    spsEstatusNomina(): any {
        this.service.getListByID(environment.categorias.catEstatusNomina, 'listaGeneralCategoria').subscribe(estatus => {
            this.listaEstNomina = estatus;
          
            let estatusAlta = this.listaEstNomina.find(e => e.cveGeneral === environment.generales.cveAltaNomina);
            this.estatus.setValue(estatusAlta);
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * Lista las plantilla
     */
    spsPlantillas() {
        this.blockUI.start('Cargando datos...');
        this.listaPlantilla = [];
        this.service.getListByID(this.numEmpresa, 'spsPlantillas').subscribe(plantilla => {
            if (!this.vacio(plantilla)) {
                this.listaPlantilla = JSON.parse(plantilla);
                this.searcher = new FuzzySearch(this.listaPlantilla, ['numero_cliente', 'nombre'], {
                    caseSensitive: false,
                });
            }
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
     * 
     * @param emp Muestra informacion de la empresa seleccionada
     */
    empresaSeleccionada(emp) {
        if (!this.vacio(emp)) {
            this.numEmpresa = emp.value.numero_cliente;
            this.spsNomina('');
            this.spsPlantillas();
        }
        this.plantilla.setValue('');
        this.plazo.setValue('');
        this.boton = 'Agregar';
    }
    /**
  * Lisa las empresas con servicio de nomina
  */
    spsNomina(nombre) {
        this.blockUI.start('Cargando datos...');
        let plantilla='';
        if(!this.vacio(nombre)){
            plantilla='/'+nombre;
        }
        
        this.listaNomina = [];
        this.service.getListByID(this.numEmpresa+plantilla, 'spsEmpleadosNomina').subscribe(nomina => {

            if (!this.vacio(nomina)) {
                this.listaNomina = JSON.parse(nomina);
            }
            this.dataSourceNomina = new MatTableDataSource(this.listaNomina);
            this.dataSourceNomina.paginator = this.paginator;
            this.dataSourceNomina.sort = this.sort;
            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }
    /**
 * Metodo para filtrar empleados nomina
 * @param event --evento a filtrar
 */
    applyFilter(event: Event) {
        const filterValue = (event.target as HTMLInputElement).value;
        this.dataSourceNomina.filter = filterValue.trim().toLowerCase();
        if (this.dataSourceNomina.paginator) {
            this.dataSourceNomina.paginator.firstPage();
        }
    }
    /**
     * Metodo para editar el empleado
     */
    getRecord(registro) {
        const dialogRef = this.dialog.open(ModalEmpleadoComponent, {
            disableClose: true,
            data: {
                titulo: 'Editar empleado',
                accion: 2,
                empresa: registro,
                plantilla: registro

            }
        });
        //Se usa para cuando cerramos, carga la lista de empleados
        dialogRef.afterClosed().subscribe(result => {

            if (result != 1) {
                this.spsNomina('');
            }

        });
    }
    /**
     * Metodo utilizado para agreagr o actualizar la plantilla
     */
    agregarPlantilla() {
        let accion = 3;//agregar plantilla
        this.blockUI.start('Cargando datos...');
        if (this.plantilla.invalid) {
            if (this.numeroCuenta instanceof UntypedFormControl) {
                this.numeroCuenta.markAsTouched({ onlySelf: true });
            }
            this.blockUI.stop();
            return;
        }
        if (this.plantilla.invalid) {
            if (this.plantilla instanceof UntypedFormControl) {
                this.plantilla.markAsTouched({ onlySelf: true });

            } this.blockUI.stop();
            return;
        }
        //Se edita la plantilla

        if (this.plantillaID > 0) {
            accion = 4;
        }
        let json = {
            "accion": accion,
            "datos": [
                this.numeroCuenta.value.empresa_nomina_id,
                this.plantillaID,
                this.plantilla.value,
                this.plazo.value.tipoPlazoId,
                this.estatus.value.generalesId
            ],
            "comisiones": [[]]
        };


        this.service.registrar(json, 'crudEmpresasNomina').subscribe(plantilla => {

            if (plantilla[0][0] === '0') {
                this.service.showNotification('top', 'right', 2, plantilla[0][1])
            } else {
                this.service.showNotification('top', 'right', 3, plantilla[0][1])
            }
            this.spsPlantillas();
            this.limpiarCampos();

            this.blockUI.stop();
        }, error => {

            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.message);
        }
        );
    }
    /**
     * Carga la lista de plantillas con las que coinciden en la busqueda
     */
    buscarPlantilla() {
        this.plantillaRes = this.searcher.search(this.searchText);
        this.listaPlantilla = this.plantillaRes;
    }
    /**
     * Se muestra la inofmacionde la plantilla en el formulario 
     * @param plantilla - Infomacion del plantilla seleccionada
     */
    editarPlantilla(plantilla) {
        this.boton = 'Actualizar';
        let empresa = this.listaEmpresa.find(el => el.numero_cliente == plantilla.numero_cliente);
        this.numeroCuenta.setValue(empresa);
        this.plantillaID = plantilla.plantilla_id;
        this.plantilla.setValue(plantilla.nombre);
        let periodo = this.listaPeriodos.find(p => p.clavePlazo == plantilla.clave_plazo)
        this.plazo.setValue(periodo);
        let estatusN = this.listaEstNomina.find(e => e.cveGeneral === plantilla.cve_estatus);
        this.estatus.setValue(estatusN);

    }
    /**
     * 
     */
    cambioStatus() {

        if(this.estatus.value.cveGeneral!='85AL'){
        Swal.fire({
            title: '¿Esta seguro?',
            text: "¡Se dara de baja los empleados que pertenecen a la plantilla!",
            icon: 'warning',
            allowOutsideClick: false,
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Continuar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (!result.isConfirmed) {
                //Accion a realizar si no se acepta
                this.spsEstatusNomina();
            }
        })
    }
    }
    /**
     * Metod que vacia la infomacion de los campos de texto
     */
    limpiarCampos() {
        this.boton = 'Agregar';
        this.plantillaID = 0;
        this.plantilla.setValue('');
        this.plazo.setValue('');
    }
    /**
       * Metodo que valida si va vacio.
       * @param value 
       * @returns 
       */
    vacio(value) {
        return (!value || value == undefined || value == "" || value.length == 0);
    }
    // Inicia Validaciones del formulario de empleado
    validaciones = {
        'numeroCuenta': [
            { type: 'required', message: 'Campo requerido.' }],
        'plantilla': [{ type: 'required', message: 'Campo requerido.' }],
        'plazo': [{ type: 'required', message: 'Campo requerido.' }]
    }
}