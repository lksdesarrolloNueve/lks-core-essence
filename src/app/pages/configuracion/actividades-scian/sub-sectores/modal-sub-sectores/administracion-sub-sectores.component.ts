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
 * @descripcion: Componente para la administración de Sub Sectores SCIAN
 */
@Component({
  selector: 'administracion-sub-sectores',
  moduleId: module.id,
  templateUrl: 'administracion-sub-sectores.component.html'
})

export class AdministracionSubSectoresComponent implements OnInit {

  //Declaracion de variables y componentes
  isChecked = true;
  titulo = 'Subsector';
  encabezado: string;
  accion: number;
  color: ThemePalette = 'primary';
  listaSector: any[];
  opcionesSector: Observable<string[]>;

  subSectorID: number;

  @BlockUI() blockUI: NgBlockUI;

  formSubSectores: UntypedFormGroup;




  /**
  * Constructor de la clase
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    //Se setean los datos de titulos
    this.encabezado = data.titulo + ' ' + this.titulo;
    this.accion = data.accion;


    this.formSubSectores = this.formBuilder.group(
      {
        codSubSector: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]*')]),
        descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
        sector: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required]}),
        estatus: new UntypedFormControl(true)
      });

    //Si la accion es 2 seteamos los datos para editar
    if (this.accion === 2) {
      this.subSectorID = data.subSector.subSectorId;
      this.formSubSectores.get('codSubSector').setValue(data.subSector.codSubSector);
      this.formSubSectores.get('descripcion').setValue(data.subSector.descripcion);
      this.formSubSectores.get('sector').setValue(data.subSector.sector);
      this.formSubSectores.get('estatus').setValue(data.subSector.estatus);

    }

  }

  /**
   * Metodo OnInit de la clase
   */
  ngOnInit() {

    this.spsSector();
  
  }


  /**
   * Metodo que consulta los Sectores
   */
  spsSector() {

    this.blockUI.start('Cargando datos...');

    this.service.getListByID(2, 'listaSectores').subscribe(data => {
      this.blockUI.stop();


      this.listaSector = data;

      this.opcionesSector = this.formSubSectores.get('sector').valueChanges.pipe(
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

    return this.listaSector.filter(option => option.codSector.toString().includes(filterValue)
      || option.descripcion.toLowerCase().includes(filterValue));
  }

  /**
   * Muestra la descripcion de la cuenta 
   * @param option --cuenta seleccionada
   * @returns -- cuenta
   */
  displayFn(option: any): any {
    return option ? option.codSector + ' / ' + option.descripcion : undefined;
  }

  /**
   * Método para guardar un sub sector.
   */
  guardarSubSector() {

    if (this.formSubSectores.invalid) {
      this.validateAllFormFields(this.formSubSectores);
      return;
    }

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "subSectorId": 0,
      "codSubSector": this.formSubSectores.get('codSubSector').value,
      "descripcion": this.formSubSectores.get('descripcion').value,
      "sector": this.formSubSectores.get('sector').value,
      "estatus": this.formSubSectores.get('estatus').value
    };

    this.service.registrarBYID(data, 1, 'crudSubSectores').subscribe(
      result => {

        //se cierrra el loader
        this.blockUI.stop();

        //Se condiciona resultado
        if (result[0][0] === '0') {
          this.formSubSectores.reset();
          this.formSubSectores.get('estatus').setValue(true);
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
  editarSubSector() {
    if (this.formSubSectores.invalid) {
      this.validateAllFormFields(this.formSubSectores);
      return;
    }

  

    this.blockUI.start('Guardando ...');

    //areglo que contiene los datos para dar de alta
    const data = {
      "subSectorId": this.subSectorID,
      "codSubSector": this.formSubSectores.get('codSubSector').value,
      "descripcion": this.formSubSectores.get('descripcion').value,
      "sector": this.formSubSectores.get('sector').value,
      "estatus": this.formSubSectores.get('estatus').value
    };

    this.service.registrarBYID(data, 2, 'crudSubSectores').subscribe(
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
  * Valida que el texto ingresado pertenezca a un sector
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
    'codSubSector': [
      { type: 'required', message: 'Código requerido.' },
      { type: 'pattern',  message: 'El campo solo acepta números enteros.' }
     ],
    'descripcion':[ 
      { type: 'required',   message: 'Descripción requerida.' },
      { type: 'maxlength',  message: 'El tamaño máximo es de 255 caracteres.' }
    ],
    'sector':[ 
      { type: 'required',   message: 'Sector requerido.' },
      { type: 'invalidAutocompleteObject',   message: 'El sector no pertenece a la lista, elija otro sector.' }
    ]
  }

}