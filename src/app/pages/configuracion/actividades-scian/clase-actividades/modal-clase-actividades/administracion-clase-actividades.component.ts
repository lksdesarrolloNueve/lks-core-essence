import { Component, Inject, OnInit } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators, ValidatorFn } from "@angular/forms";
import { GestionGenericaService } from '../../../../../shared/service/gestion';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ThemePalette } from "@angular/material/core";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";




/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 05/10/2021
 * @descripcion: Componente para la administración de Clase Actividades SCIAN
 */
@Component({
  selector: 'administracion-clase-actividades',
  moduleId: module.id,
  templateUrl: 'administracion-clase-actividades.component.html'
})

export class AdministracionClaseActividadesComponent implements OnInit {

  //Declaracion de variables y componentes
  isChecked = true;
  titulo = 'Clase actividad';
  encabezado: string;
  accion: number;
  color: ThemePalette = 'primary';

  listaActividadPLD: any[];
  opcionesActividadPLD: Observable<string[]>;

  listaSubRama: any[];
  opcionesSubrama: Observable<string[]>;


  cActividadID: number;

  @BlockUI() blockUI: NgBlockUI;

  formClaseActividades: UntypedFormGroup;




  /**
  * Constructor de la clase
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    //Se setean los datos de titulos
    this.encabezado = data.titulo + ' ' + this.titulo;
    this.accion = data.accion;


    this.formClaseActividades = this.formBuilder.group(
      {
        codCActividad: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
        descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
        sueldoMesAprox: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
        actividadPLD: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator()]}),
        subRama: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
        estatus: new UntypedFormControl(true)
      });

      //Si la accion es 2 seteamos los datos para editar
      if (this.accion === 2) {
        this.cActividadID = data.claseActividad.cActividadId;
        this.formClaseActividades.get('codCActividad').setValue(data.claseActividad.codCActividad);
        this.formClaseActividades.get('descripcion').setValue(data.claseActividad.descripcion);
        this.formClaseActividades.get('sueldoMesAprox').setValue(data.claseActividad.sueldoMesAprox);
        this.formClaseActividades.get('actividadPLD').setValue(data.claseActividad.actividadPLD);
        this.formClaseActividades.get('subRama').setValue(data.claseActividad.subRama);
        this.formClaseActividades.get('estatus').setValue(data.claseActividad.estatus);
      }

  }

  /**
   * Metodo OnInit de la clase
   */
  ngOnInit() {
    this.spsActividadPLD();
    this.spsSubRamas();
  }

  ////////////////////////////ACTIVIDADES PLD ////////////////////////////////
  /**
   * Metodo que consulta los Sub Sectores
   */
  spsActividadPLD() {

    this.blockUI.start('Cargando datos...');

    this.service.getListByID(2, 'spsActividadesPLD').subscribe(data => {
      this.blockUI.stop();

      this.listaActividadPLD = data;

      this.opcionesActividadPLD = this.formClaseActividades.get('actividadPLD').valueChanges.pipe(
        startWith(''),
        map(value => this._filterActividadPLD(value))
      );

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    }
    );

  }

  /**
  * Filta la Sector
  * @param value --texto de entrada
  * @returns la opcion u opciones que coincidan con la busqueda
  */
  private _filterActividadPLD(value: any): any[] {

    let filterValue = value;
    if (value === null || value === undefined) {
      value = '';
    }

    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }

    return this.listaActividadPLD.filter(option => option.cvePLD.toString().includes(filterValue)
      || option.actividadEco.toLowerCase().includes(filterValue));
  }

  /**
   * Muestra la descripcion de la cuenta 
   * @param option --cuenta seleccionada
   * @returns -- cuenta
   */
  displayFn(option: any): any {
    return option ? option.cvePLD + ' / ' + option.actividadEco : undefined;
  }
  ////////////////////////////ACTIVIDADES PLD ////////////////////////////////


  ////////////////////////////SUB RAMAS //////////////////////////////////////
  /**
   * Metodo que consulta los Sub Ramas
   */
  spsSubRamas() {

    this.blockUI.start('Cargando datos...');

    this.service.getListByID(2, 'listaSubRamas').subscribe(data => {
      this.blockUI.stop();


      this.listaSubRama = data;

      this.opcionesSubrama = this.formClaseActividades.get('subRama').valueChanges.pipe(
        startWith(''),
        map(value => this._filterSubRama(value))
      );

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    }
    );

  }

  /**
  * Filta la Sector
  * @param value --texto de entrada
  * @returns la opcion u opciones que coincidan con la busqueda
  */
  private _filterSubRama(value: any): any[] {

    let filterValue = value;
    if (value === null || value === undefined) {
      value = '';
    }

    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }

    return this.listaSubRama.filter(option1 => option1.codSubRama.toString().includes(filterValue)
      || option1.descripcion.toLowerCase().includes(filterValue));
  }

  /**
   * Muestra la descripcion de la rama 
   * @param option --rama seleccionada
   * @returns -- rama
   */
  displayFnS(option1: any): any {
    return option1 ? option1.codSubRama + ' / ' + option1.descripcion : undefined;
  }
  ////////////////////////////SUB RAMAS //////////////////////////////////////

  /**
   * Método para guardar actividad.
   */
   guardarActividad() {

    if (this.formClaseActividades.invalid) {
      this.validateAllFormFields(this.formClaseActividades);
      return;
    }

    let actividadId = 0;

    if (this.formClaseActividades.get('actividadPLD').value) {
        actividadId = this.formClaseActividades.get('actividadPLD').value.actividadId;
    }

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "cActividadId": 0,
      "codCActividad": this.formClaseActividades.get('codCActividad').value,
      "descripcion": this.formClaseActividades.get('descripcion').value,
      "sueldoMesAprox": this.formClaseActividades.get('sueldoMesAprox').value,
      "actividadPLD": { "actividadId"  : actividadId},
      "subRama": this.formClaseActividades.get('subRama').value,
      "estatus": this.formClaseActividades.get('estatus').value
    };

    
    this.service.registrarBYID(data, 1, 'crudClaseActividades').subscribe(
      result => {

        //se cierrra el loader
        this.blockUI.stop();

        //Se condiciona resultado
        if (result[0][0] === '0') {
          this.formClaseActividades.reset();
          this.formClaseActividades.get('estatus').setValue(true);
          this.service.showNotification('top', 'right', 2, result[0][1]);
        } else {
          this.service.showNotification('top', 'right', 3, result[0][1]);
        }

      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      }
    );

  }

  /**
   * Método para editar una Rama
   */
  editarActividad() {
    if (this.formClaseActividades.invalid) {
      this.validateAllFormFields(this.formClaseActividades);
      return;
    }

    let actividadId = 0;

    if (this.formClaseActividades.get('actividadPLD').value) {
        actividadId = this.formClaseActividades.get('actividadPLD').value.actividadId;
    }
  

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "cActividadId": this.cActividadID,
      "codCActividad": this.formClaseActividades.get('codCActividad').value,
      "descripcion": this.formClaseActividades.get('descripcion').value,
      "sueldoMesAprox": this.formClaseActividades.get('sueldoMesAprox').value,
      "actividadPLD": { "actividadId"  : actividadId},
      "subRama": this.formClaseActividades.get('subRama').value,
      "estatus": this.formClaseActividades.get('estatus').value
    };



    this.service.registrarBYID(data, 2, 'crudClaseActividades').subscribe(
      result => {

        //se cierrra el loader
        this.blockUI.stop();

        //Se condiciona resultado
        if (result[0][0] === '0') {
          this.service.showNotification('top', 'right', 2, result[0][1]);
        } else {
          this.service.showNotification('top', 'right', 3, result[0][1]);
        }

      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message);
      }
    );

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

  /**
  * Valida que el texto ingresado pertenezca a un subramas
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
   * Método para validar los mensajes.
   */
  public validacion_msj = {
    'codCActividad': [
      { type: 'required', message: 'Código requerido.' },
      { type: 'pattern',  message: 'El campo solo acepta números enteros.' }
     ],
    'descripcion':[ 
      { type: 'required',   message: 'Descripción requerida.' },
      { type: 'maxlength',  message: 'El tamaño máximo es de 255 caracteres.' }
    ],
    'sueldoMesAprox':[ 
      { type: 'required',   message: 'Sueldo requerido.' },
      { type: 'pattern',  message: 'El campo solo acepta números decimales (0.00).' }
    ],
    'actividadPLD':[ 
      { type: 'invalidAutocompleteObject',   message: 'La actividad PLD no pertenece a la lista, elija otra actividad PLD.' }
    ],
    'subRama':[ 
      { type: 'required',   message: 'Subrama requerida.' },
      { type: 'invalidAutocompleteObject',   message: 'La subrama no pertenece a la lista, elija otra subrama.' }
    ]

  }

}