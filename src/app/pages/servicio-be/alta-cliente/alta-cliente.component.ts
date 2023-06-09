//Funciones para tabla Clientes
import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { BlockUI, NgBlockUI } from 'ng-block-ui';
import {
  FormGroup,
  FormControl,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import Swal from 'sweetalert2';
import { GestionGenericaService } from '../../../shared/service/gestion/gestion.service';
import { environment } from '../../../../environments/environment';

/**
 * @autor: Juan Jesus Ricardo Gloria Gloria
 * @version: 1.0.0
 * @fecha: 05/06/2023
 * @descripcion: Vista de Buscador de clientes
 */

@Component({
  selector: 'alta-cliente',
  moduleId: module.id,
  templateUrl: 'alta-cliente.component.html',
  styleUrls: ['alta-cliente.component.css'],
})
export class AltaClienteComponent {
  title = 'estadias';

  //Variables
  titulo: string;
  accion: number;

  lblResultado: String = '';
  lblClientes = environment.globales.enteMayuscula;

  listaCliente: any = [];
  tablaCliente: any = [];
  resultadoCRUD: any = [];

  selectedValue: string;

  //columnas de la tabla
  displayedColumns: string[] = [
    'numero_cliente',
    'nombres',
    'nombre_sucursal',
    'estatus',
    'descripcion',
    'genero',
    'acciones',
  ];

  //datos que mustra la  tabla al encontrar cliente
  dataSourceClientes: MatTableDataSource<any>;

  //filtro por persona  juridica
  listaCatalogoClientes: any;

  formGetCliente: FormGroup;

  @ViewChild(MatPaginator) paginator: MatPaginator; //paginas de la tabla
  @ViewChild(MatSort) sort: MatSort; //elementros a mostrar por hoja
  @BlockUI() blockUI: NgBlockUI; //animacion de carga al tardar peticion

  listaTipoPersona: any;

  /**
   * Constructor de variables y componentes
   * @param servcice -Service para el acceso de datos
   */
  constructor(
    private http: HttpClient,
    private router: Router,
    public dialog: MatDialog,
    private formBuilder: FormBuilder,
    private activedRoute: ActivatedRoute,
    private service: GestionGenericaService
  ) {
    this.spstipoCliente();
    this.formGetCliente = this.formBuilder.group({
      filtro: new FormControl('', [Validators.required]),
      cvesocio: new FormControl('', [Validators.required]),
    });
  }

  /* Metodo OnInit de la clase */
  ngOnInit(): void {}

  /**
   * Metodo para filtrar clientes con persona juridica
   */
  spsClientes() {
    // Variable para el filtro
    this.formGetCliente.get('cvesocio').value;

    this.blockUI.start('Cargando datos ...');

    // Consulta de clientes para la base de datos mediante los filtros, se espera un resultado
    const json = {
      datos: {
        filtro: this.formGetCliente.get('filtro').value,
        cvesocio: this.formGetCliente.get('cvesocio').value,
      },
      // Opción a realizar en la base de datos
      accion: 1,
    };

    // Llamar al servicio para obtener la lista de clientes usando el objeto json
    this.service.getListByObjet(json, 'listaClientesBE').subscribe(
      (resultado) => {
        this.blockUI.stop();

        if (resultado.codigo !== '0') {
          this.service.showNotification('top', 'rigth', 3, resultado.mensaje);
          return;
        }

        this.listaCliente = resultado; // Guardar el resultado en una variable
        this.tablaCliente = this.listaCliente.info; // Variable para los datos a mostrar en la tabla
        this.dataSourceClientes = new MatTableDataSource(this.tablaCliente); // Mostrar en la tabla
        setTimeout(() =>this.dataSourceClientes.paginator = this.paginator);
        this.dataSourceClientes.sort = this.sort;

        this.lblResultado = this.listaCliente.mensaje; // Actualizar la etiqueta de resultado con el mensaje del resultado
      },
      (error) => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message); // Mostrar una notificación de error en caso de fallo
      }
    );
  }

  /**
   * Metodo para filtrar los clientes
   * @param event - evento a filtrar
   */
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSourceClientes.filter = filterValue.trim().toLocaleLowerCase();

    if (this.dataSourceClientes.paginator) {
      this.dataSourceClientes.paginator.firstPage();
    }
  }

  // Método para buscar
  buscar() {
    // Verificar si el formulario "formGetCliente" es inválido
    if (this.formGetCliente.invalid) {
      // Si es inválido, se llama al método "validateAllFormFields" para validar y resaltar los campos no válidos
      this.validateAllFormFields(this.formGetCliente);
      return; // Detener la ejecución del método
    }
    // Si el formulario es válido, llamar al método "spsClientes" para realizar alguna acción relacionada con la obtención de los clientes
    this.spsClientes();
  }

  /**
   * Valida cada atributo del formulario
   * @params formGroup - Recibe cualquier tipo de FormGroup
   */
  validateAllFormFields(formGroup: FormGroup) {
    Object.keys(formGroup.controls).forEach((field) => {
      const control = formGroup.get(field);
      if (control instanceof FormControl) {
        control.markAsTouched({ onlySelf: true });
      } else if (control instanceof FormGroup) {
        this.validateAllFormFields(control);
      }
    });
  }

  /**
   * Metodo para listar los tipo de cliente
   *
   */
  spstipoCliente() {
    this.service
      .getListByID(environment.categorias.catJuridica, 'listaGeneralCategoria')
      .subscribe(
        (data) => {
          this.listaTipoPersona = data;
          this.listaCatalogoClientes = this.listaTipoPersona;
        },
        (error) => {
          this.blockUI.stop();
          this.service.showNotification('top', 'right', 4, error.Message);
        }
      );
  }

  /**
   * Metodo que redirecciona a alta cliente BE
   * @param cliente - Cliente para dar de alta
   */
  altaCliente(cliente) {
    const navigationExtras: NavigationExtras = {
      state: {
        accion: 2,
        cliente: cliente,
      },
    };
    this.router.navigate(['/filtro-cliente-be'], navigationExtras);
  }
}
