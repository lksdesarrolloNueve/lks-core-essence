import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatSort } from "@angular/material/sort";
import { MatTableDataSource } from "@angular/material/table";
import { GestionGenericaService } from "../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { environment } from "../../../../environments/environment";
import { globales } from '../../../../environments/globales.config';

/**
* @autor: Jasmin Santana
* @version: 1.0.0
* @fecha: 23/11/2021
* @descripcion: Componente para la busqueda  de clientes
*/
@Component({
    selector: 'buscar-clientes',
    moduleId: module.id,
    templateUrl: 'buscar-clientes.component.html'
})

export class BuscarClientesComponent implements OnInit {

    //Declaracion de variables y componentes
    totalRows = 0;
    pageSize = 10;
    currentPage = 0;
    pageSizeOptions: number[] = [10, 25, 50, 100];

    @BlockUI() blockUI: NgBlockUI;
    @ViewChild(MatPaginator) paginator: MatPaginator;
    @ViewChild(MatSort) sort: MatSort;


    lblClientes: string = globales.entes;
    lblCliente: string = globales.ente;
    // nbcliente : string = globales.placeholderNo;
    placeholderNo = 'Número ' + globales.ente;

    //Clientes 
    listaClientes: any = [];
    listaTipoPersona: any = [];
    listaGeneral: any = [];
    listaMoral: any = [];
    displayedColumns: string[] = ['noCliente', 'nombre', 'tipoCliente', 'sucursal', 'estado'];
    dataSourceCliente: MatTableDataSource<any>;

    //filtro = new UntypedFormControl('');//Cadena de texto
    //personalidad = new UntypedFormControl('');
    encabezado: string;
    seleccionado: any;

    formBuscaCliente: UntypedFormGroup;
    /**
           * Constructor del componente 
           * @param service -- Instancia de acceso a datos
           * @data --Envio de datos al modal dialogo
           */
    constructor(private formBuilder: UntypedFormBuilder,
        private dialog: MatDialogRef<BuscarClientesComponent>,
        private service: GestionGenericaService,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        this.encabezado = data.titulo;

        this.formBuscaCliente =  this.formBuilder.group({

            filtro: new UntypedFormControl('', Validators.required),
            personalidad: new UntypedFormControl('', Validators.required)

        });
    }
    /**
     * Metodo OnInit de la clase
     */
    ngOnInit() {
        this.spstipoCliente();

    }
    /**
     * Metodo para buscar un cliente
     *  
     */
    buscarCliente() {

        //Valida fomrulario
        if (this.formBuscaCliente.invalid) {
            this.validateAllFormFields(this.formBuscaCliente);
            return;
        }
  
        let path: any;
        if(this.vacio(this.formBuscaCliente.get('filtro').value)){
            path =  this.formBuscaCliente.get('personalidad').value.cveGeneral+'/'+1+'/'+this.currentPage+'/'+this.pageSize;
        }else{
            path = this.formBuscaCliente.get('filtro').value+'/'+this.formBuscaCliente.get('personalidad').value.cveGeneral+'/'+1+'/'+this.currentPage+'/'+this.pageSize;
        }
        
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(path, 'listaClientes').subscribe(data => {
            this.blockUI.stop();

            if(this.vacio(data)){
                this.service.showNotification('top', 'right', 3, 'No se encontraron coincidencias.');
                return;
            }
            this.dataSourceCliente = new MatTableDataSource(data);
            this.dataSourceCliente.paginator = this.paginator;
            this.dataSourceCliente.sort = this.sort;

            setTimeout(() => {
                this.paginator.pageIndex = this.currentPage;
                this.paginator.length = Number(data[0].total);
            });
        
            
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
    * Metodo para listar los tipo de cliente
    *  
    */
    spstipoCliente() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catJuridica, 'listaGeneralCategoria').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoPersona = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    /**
     * Metodo para saber el tipo de personalidad elejida y buscar el cliente
     */
    opcionTpersona() {
        this.buscarCliente();
    }

    /**Metodo para obtener la información del cliente selecionado */
    getRecord(dato) {
        this.seleccionado = dato.cliente.cveCliente;
        this.spsClientes();
    }

    spsClientes() {
        let path;
        path = this.seleccionado + '/' + this.formBuscaCliente.get('personalidad').value.generalesId;
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(path, 'listaClientesFM').subscribe(data => {
            this.blockUI.stop();
            let persona;
            this.listaClientes = [];//se vacia la lista para cada busqueda
            if (data[0].personaFisica !== null && data[0].personaMoral === "") {
                if (data[0].personaFisica.length > 0) {
                    this.listaClientes = JSON.parse(data[0].personaFisica);
                    persona = 'F';
                }
            } else {
                if (data[0].personaMoral != null && data[0].personaMoral.length > 0) {
                    this.listaClientes = JSON.parse(data[0].personaMoral);
                    persona = 'M';
                }

            }
            
            this.dialog.close({ datosCl: this.listaClientes[0], tipoPersona: persona });

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        });
    }

    //Metodo para cargar los datos por pagina
    pageChanged(event: PageEvent) {
        this.pageSize = event.pageSize;
        this.currentPage = event.pageIndex;
        this.buscarCliente();
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


    /*Validaciones de los campos del formulario.
   * Se crean los mensajes de validación.
   */
    validaciones = {
        'personalidad': [
            { type: 'required', message: 'Campo requerido.' }
         ],
        'filtro': [
            { type: 'required', message: 'Campo requerido.' }
        ]
    };



}