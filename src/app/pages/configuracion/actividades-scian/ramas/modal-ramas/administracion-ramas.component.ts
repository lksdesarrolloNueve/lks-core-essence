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
 * @fecha: 05/09/2021
 * @descripcion: Componente para la administración de Ramas SCIAN
 */
@Component({
  selector: 'administracion-ramas',
  moduleId: module.id,
  templateUrl: 'administracion-ramas.component.html'
})

export class AdministracionRamasComponent implements OnInit {

  //Declaracion de variables y componentes
  isChecked = true;
  titulo = 'Rama';
  encabezado: string;
  accion: number;
  color: ThemePalette = 'primary';
  listaSubSector: any[];
  opcionesSubSector: Observable<string[]>;

  ramaID: number;

  @BlockUI() blockUI: NgBlockUI;

  formRamas: UntypedFormGroup;




  /**
  * Constructor de la clase
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    //Se setean los datos de titulos
    this.encabezado = data.titulo + ' ' + this.titulo;
    this.accion = data.accion;

    this.formRamas = this.formBuilder.group(
      {
        codigoRama: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
        descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
        subSector: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
        estatus: new UntypedFormControl(true)
      });

    //Si la accion es 2 seteamos los datos para editar
    if (this.accion === 2) {
      this.ramaID = data.rama.ramaId;
      this.formRamas.get('codigoRama').setValue(data.rama.codigoRama);
      this.formRamas.get('descripcion').setValue(data.rama.descripcion);
      this.formRamas.get('subSector').setValue(data.rama.subSector);
      this.formRamas.get('estatus').setValue(data.rama.estatus);
    }

  }

  /**
   * Metodo OnInit de la clase
   */
  ngOnInit() {

    this.spsSubSector();
  
  }


  /**
   * Metodo que consulta los Sub Sectores
   */
  spsSubSector() {

    this.blockUI.start('Cargando datos...');

    this.service.getListByID(2, 'listaSubSectores').subscribe(data => {
      this.blockUI.stop();

      this.listaSubSector = data;

      this.opcionesSubSector = this.formRamas.get('subSector').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuenta(value))
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
  private _filterCuenta(value: any): any[] {

    let filterValue = value;
    if (value === null || value === undefined) {
      value = '';
    }

    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }

    return this.listaSubSector.filter(option => option.codSubSector.toString().includes(filterValue)
      || option.descripcion.toLowerCase().includes(filterValue));
  }

  /**
   * Muestra la descripcion de la cuenta 
   * @param option --cuenta seleccionada
   * @returns -- cuenta
   */
  displayFn(option: any): any {
    return option ? option.codSubSector + ' / ' + option.descripcion : undefined;
  }

  /**
   * Método para guardar una Rama.
   */
   guardarRama() {

    if (this.formRamas.invalid) {
      this.validateAllFormFields(this.formRamas);
      return;
    }

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "ramaId": 0,
      "codigoRama": this.formRamas.get('codigoRama').value,
      "descripcion": this.formRamas.get('descripcion').value,
      "subSector": this.formRamas.get('subSector').value,
      "estatus": this.formRamas.get('estatus').value
    };

    this.service.registrarBYID(data, 1, 'crudRamas').subscribe(
      result => {

        //se cierrra el loader
        this.blockUI.stop();

        //Se condiciona resultado
        if (result[0][0] === '0') {
          this.formRamas.reset();
          this.formRamas.get('estatus').setValue(true);
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
  editarRama() {
    if (this.formRamas.invalid) {
      this.validateAllFormFields(this.formRamas);
      return;
    }

  

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "ramaId": this.ramaID,
      "codigoRama": this.formRamas.get('codigoRama').value,
      "descripcion": this.formRamas.get('descripcion').value,
      "subSector": this.formRamas.get('subSector').value,
      "estatus": this.formRamas.get('estatus').value
    };

    this.service.registrarBYID(data, 2, 'crudRamas').subscribe(
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
  * Valida que el texto ingresado pertenezca a un subsector
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
    'codigoRama': [
      { type: 'required', message: 'Código requerido.' },
      { type: 'pattern',  message: 'El campo solo acepta números enteros.' }
     ],
    'descripcion':[ 
      { type: 'required',   message: 'Descripción requerida.' },
      { type: 'maxlength',  message: 'El tamaño máximo es de 255 caracteres.' }
    ],
    'subSector':[ 
      { type: 'required',   message: 'Subsector requerido.' },
      { type: 'invalidAutocompleteObject',   message: 'El subsector no pertenece a la lista, elija otro subsector.' }
    ]
  }

}