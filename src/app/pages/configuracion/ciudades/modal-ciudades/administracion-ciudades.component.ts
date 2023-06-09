import { Component, Inject, OnInit, ViewChild } from "@angular/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";

/**
 * @autor: Jasmin Santana
 * @version: 1.0.0
 * @fecha: 22/09/2021
 * @descripcion: Componente para la gestion de ciudades
 */

@Component({
  selector: 'administracion-ciudades',
  moduleId: module.id,
  templateUrl: 'administracion-ciudades.component.html'
})
export class AdministracionCiudadesComponent implements OnInit {
  //Declaracion de variables y componentes
  titulo = 'Ciudad';
  encabezado: string;
  accion: number;
  formCiudad: UntypedFormGroup;
  ciudadId: number;
  listaEstados: any;
  listaGenerales: any;
  listaRiesgo: any;
  opcionesEstado: Observable<string[]>;
  estadoid: number;


  @BlockUI() blockUI: NgBlockUI;



  /**
            * Constructor del componente ciudades
            * @param service -- Instancia de acceso a datos
            * @data --Envio de datos al modal dialogo
            */
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    this.formCiudad = this.formBuilder.group(
      {

        ciudad: new UntypedFormControl('', Validators.required),
        poblacion: new UntypedFormControl('', Validators.required),
        nivelMarginacion: new UntypedFormControl('', Validators.required),
        cveMun: new UntypedFormControl('', Validators.required),
        nivelR: new UntypedFormControl('', Validators.required),
        cvePLD: new UntypedFormControl('', [Validators.required, Validators.maxLength(12), Validators.pattern("^[0-9]*$")]),
        estatus: new UntypedFormControl(true),
        estado: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] })
      });

    this.encabezado = data.titulo + ' ' + this.titulo;
    this.accion = data.accion;
    if (this.accion === 2) {
      //se pasan los datos de la tabla al formulario
      this.ciudadId = data.ciudad.ciudaId;
      this.formCiudad.get('ciudad').setValue(data.ciudad.nombre);
      this.formCiudad.get('poblacion').setValue(data.ciudad.poblacion);
      this.formCiudad.get('nivelMarginacion').setValue(data.ciudad.nivelMarginacion.generalesId);
      this.formCiudad.get('cveMun').setValue(data.ciudad.cveMunicipioInegi);
      this.formCiudad.get('nivelR').setValue(data.ciudad.nivelRiesgo.generalesId);
      this.formCiudad.get('cvePLD').setValue(data.ciudad.cvePld);
      this.formCiudad.get('estatus').setValue(data.ciudad.estatus);
      this.formCiudad.get('estado').setValue(data.ciudad.estado);

    }
  }


  /**
  * Metodo OnInit de la clase
  */
  ngOnInit() {
    //combo nivel marginacion
    this.spsMarginacion();
    //combo nivel de riesgo
    this.spsNivelR();
    this.spsEstados();
  }


  /**
     * Metodo para listar las generales por categoria
     * @param '03NM' --Nivel de marginacion
     */
  spsMarginacion() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID('03NM', 'listaGeneralCategoria').subscribe(data => {
      this.listaGenerales = data;
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }

  /**
     * Metodo para listar las generales por categoria
     * @param '02RE' --Nivel de riesgo estado
     */
  spsNivelR() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID('02RE', 'listaGeneralCategoria').subscribe(data => {
      this.listaRiesgo = data;
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }

  /**
    * Metodo para listar las ESTADOS activos
    * 
    */
  spsEstados() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(2, 'listaEstados').subscribe(data => {
      this.listaEstados = data;
      this.opcionesEstado = this.formCiudad.get('estado').valueChanges.pipe(
        startWith(''),
        map(value => this._filter(value))
      );
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }
  /**
    * Muestra la descripcion del estado
    * @param option --estado seleccionada
    * @returns --nombre de estado
    */
  displayFn(option: any): any {
    return option ? option.nombreEstado : undefined;
  }

  /**
  * Filta el nombre estado
  * @param value --texto de entrada
  * @returns la opcion u opciones que coincidan con la busqueda
  */
  private _filter(value: any): any[] {
    let filterValue = value;
    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listaEstados.filter(option => option.nombreEstado.toLowerCase().includes(filterValue));
  }
  /**
       * Valida que el texto ingresado pertenezca a un estado
       * @returns mensaje de error.
       */
  autocompleteObjectValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (typeof control.value === 'string' && control.value.length > 0) {
        return { 'invalidAutocompleteObject': { value: control.value } }
      }
      return null  /* valid option selected */
    }
  }

  /**
       * Metodo para guardar los datos de ciudades
       */
  guardarCiudad() {
    //validar que no vallan vacios
    if (this.formCiudad.invalid) {
      this.validateAllFormFields(this.formCiudad);
      return;
    }
    //areglo que contiene los datos a guardar
    const data = {
      "ciudaId": '0',
      "nombre": this.formCiudad.get('ciudad').value,
      "poblacion": this.formCiudad.get('poblacion').value,
      "nivelMarginacion": {
        "generalesId": this.formCiudad.get('nivelMarginacion').value
      },
      "cveMunicipioInegi": this.formCiudad.get('cveMun').value,
      "nivelRiesgo": {
        "generalesId": this.formCiudad.get('nivelR').value
      },
      "cvePld": this.formCiudad.get('cvePLD').value,
      "estatus": this.formCiudad.get('estatus').value,
      "estado": this.formCiudad.get('estado').value
    };

    //uso del metodo para guardar en base de datos    
    this.service.registrarBYID(data, 1, 'crudCiudades').subscribe(resultado => {
      this.blockUI.start('Guardando ...');
      if (resultado[0][0] === '0') {//exito    
        //pasa el id del estado para usarse al cerrar   
        this.estadoid = this.formCiudad.get('estado').value.estadoid;
        //Uso de metodo limpiarCampos para volver a guardar
        this.limpiarCampos();
        //Se cierra el loader
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 2, resultado[0][1]);
      } else {//error    
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 3, resultado[0][1]);
      }
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }

  /**
        * Metodo para guardar los datos de ciudades
        */
  actualizarCiudad() {
    //Se valida que no esten vacios los datos    
    if (this.formCiudad.invalid) {
      this.validateAllFormFields(this.formCiudad);
      return;
    }

    //areglo que contiene los datos a guardar
    const data = {
      "ciudaId": this.ciudadId,
      "nombre": this.formCiudad.get('ciudad').value,
      "poblacion": this.formCiudad.get('poblacion').value,
      "nivelMarginacion": {
        "generalesId": this.formCiudad.get('nivelMarginacion').value
      },
      "cveMunicipioInegi": this.formCiudad.get('cveMun').value,
      "nivelRiesgo": {
        "generalesId": this.formCiudad.get('nivelR').value
      },
      "cvePld": this.formCiudad.get('cvePLD').value,
      "estatus": this.formCiudad.get('estatus').value,
      "estado": this.formCiudad.get('estado').value
    };
    //uso del metodo para guardar en base de datos    
    this.service.registrarBYID(data, 2, 'crudCiudades').subscribe(resultado => {
      this.blockUI.start('Actalizando ...');
      if (resultado[0][0] === '0') {//exito
        this.estadoid = this.formCiudad.get('estado').value.estadoid;
        //Se cierra el loader
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 2, resultado[0][1]);
      } else {//error    
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 3, resultado[0][1]);
      }
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }



  /**
   * Limpia los campos del formulario :formCiudad
   */
  limpiarCampos() {
    this.formCiudad.get('ciudad').setValue('');
    this.formCiudad.get('poblacion').setValue('');
    this.formCiudad.get('nivelMarginacion').setValue('');
    this.formCiudad.get('cveMun').setValue('');
    this.formCiudad.get('nivelR').setValue('');
    this.formCiudad.get('cvePLD').setValue('');
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
  //Arreglo de mensajes a mostrar al validar formulario
  validaciones = {
    'cvePLD': [
      { type: 'required', message: ' Clave PLD requerida.' },
      { type: 'pattern', message: 'Solo números.' }
    ],
    'poblacion': [
      { type: 'required', message: 'Número de habitantes requerida.' }
    ],
    'ciudad': [
      { type: 'required', message: 'Ciudad requerida.' }
    ],
    'nivelMarginacion': [
      { type: 'required', message: 'Nivel marginación requerida.' }
    ],
    'cveMun': [
      { type: 'required', message: 'Clave municipio requerida.' }
    ],
    'nivelR': [
      { type: 'required', message: 'Nivel de riesgo requerido.' }
    ],
    'estado': [
      { type: 'required', message: 'Estado requerido.' },
      { type: 'autocompleteObjectValidator', message: 'El estado no existe elije otro.' }
    ]
  }
}