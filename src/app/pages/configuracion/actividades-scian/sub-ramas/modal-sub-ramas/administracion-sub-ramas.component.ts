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
 * @fecha: 1/09/2021
 * @descripcion: Componente para la administración de Sub Ramas SCIAN
 */
@Component({
  selector: 'administracion-sub-ramas',
  moduleId: module.id,
  templateUrl: 'administracion-sub-ramas.component.html'
})

export class AdministracionSubRamasComponent implements OnInit {

  //Declaracion de variables y componentes
  isChecked = true;
  titulo = 'Subrama';
  encabezado: string;
  accion: number;
  color: ThemePalette = 'primary';
  listaRama: any[];
  opcionesRama: Observable<string[]>;

  subRamaId: number;

  @BlockUI() blockUI: NgBlockUI;

  formSubRamas: UntypedFormGroup;




  /**
  * Constructor de la clase
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    //Se setean los datos de titulos
    this.encabezado = data.titulo + ' ' + this.titulo;
    this.accion = data.accion;

    this.formSubRamas = this.formBuilder.group(
      {
        codSubRama: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
        descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
        rama: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
        estatus: new UntypedFormControl(true)
      });

    //Si la accion es 2 seteamos los datos para editar
    if (this.accion === 2) {
      this.subRamaId = data.subRama.subRamaId;
      this.formSubRamas.get('codSubRama').setValue(data.subRama.codSubRama);
      this.formSubRamas.get('descripcion').setValue(data.subRama.descripcion);
      this.formSubRamas.get('rama').setValue(data.subRama.rama);
      this.formSubRamas.get('estatus').setValue(data.subRama.estatus);

    }

  }

  /**
   * Metodo OnInit de la clase
   */
  ngOnInit() {
    
    this.spsRama();

  }


  /**
   * Metodo que consulta las Ramas
   */
  spsRama() {

    this.blockUI.start('Cargando datos...');

    this.service.getListByID(2, 'listaRamas').subscribe(data => {
      this.blockUI.stop();


      this.listaRama = data;

      this.opcionesRama = this.formSubRamas.get('rama').valueChanges.pipe(
        startWith(''),
        map(value => this._filterRama(value))
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
  private _filterRama(value: any): any[] {

    let filterValue = value;
    if (value === null || value === undefined) {
      value = '';
    }

    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }

    return this.listaRama.filter(option => option.codigoRama.toString().includes(filterValue)
      || option.descripcion.toLowerCase().includes(filterValue));
  }

  /**
   * Muestra la descripcion de la rama 
   * @param option --rama seleccionada
   * @returns -- rama
   */
  displayFn(option: any): any {
    return option ? option.codigoRama + ' / ' + option.descripcion : undefined;
  }

  /**
   * Método para guardar una Rama SCIAN.
   */
  guardarRama() {

    if (this.formSubRamas.invalid) {
      this.validateAllFormFields(this.formSubRamas);
      return;
    }

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "subRamaId": 0,
      "codSubRama": this.formSubRamas.get('codSubRama').value,
      "descripcion": this.formSubRamas.get('descripcion').value,
      "rama": this.formSubRamas.get('rama').value,
      "estatus": this.formSubRamas.get('estatus').value
    };

    this.service.registrarBYID(data, 1, 'crudSubRamas').subscribe(
      result => {

        //se cierrra el loader
        this.blockUI.stop();

        //Se condiciona resultado
        if (result[0][0] === '0') {
          this.formSubRamas.reset();
          this.formSubRamas.get('estatus').setValue(true);
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
   * Método para editar un sub sector.
   */
  editarRama() {
    if (this.formSubRamas.invalid) {
      this.validateAllFormFields(this.formSubRamas);
      return;
    }


    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "subRamaId": this.subRamaId,
      "codSubRama": this.formSubRamas.get('codSubRama').value,
      "descripcion": this.formSubRamas.get('descripcion').value,
      "rama": this.formSubRamas.get('rama').value,
      "estatus": this.formSubRamas.get('estatus').value
    };

    this.service.registrarBYID(data, 2, 'crudSubRamas').subscribe(
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
  * Valida que el texto ingresado pertenezca a una rama
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
    'codSubRama': [
      { type: 'required', message: 'Código requerido.' },
      { type: 'pattern', message: 'El campo solo acepta números enteros.' }
    ],
    'descripcion': [
      { type: 'required', message: 'Descripción requerida.' },
      { type: 'maxlength', message: 'El tamaño máximo es de 255 caracteres.' }
    ],
    'rama': [
      { type: 'required', message: 'Rama requerida.' },
      { type: 'invalidAutocompleteObject', message: 'La rama no pertenece a la lista, elija otra rama.' }
    ]
  }

}