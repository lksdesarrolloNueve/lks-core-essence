import { Component, Inject, OnInit } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { GestionGenericaService } from '../../../../../shared/service/gestion';
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { ThemePalette } from "@angular/material/core";
import { T } from "@angular/cdk/keycodes";




/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 30/09/2021
 * @descripcion: Componente para la administración de Sectores SCIAN
 */
@Component({
  selector: 'administracion-sectores',
  moduleId: module.id,
  templateUrl: 'administracion-sectores.component.html'
})

export class AdministracionSectoresComponent implements OnInit {

  //Declaracion de variables y componentes
  isChecked = true;
  titulo = 'Sector';
  encabezado: string;
  accion: number;
  color: ThemePalette = 'primary';
  listaNivel: any[];
  listaClasificacion: any[];

  sectorID: number;

  @BlockUI() blockUI: NgBlockUI;

  formSectores: UntypedFormGroup;
  formNivel = new UntypedFormControl('', [Validators.required]);
  formClasificacion = new UntypedFormControl('', [Validators.required]);



  /**
  * Constructor de la clase
  * @param service - Instancia de acceso a datos
  * @param data - Datos recibidos desde el padre
  */
  constructor(private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
    //Se setean los datos de titulos
    this.encabezado = data.titulo + ' ' + this.titulo;
    this.accion = data.accion;
    this.spsNivel();
    this.spsClasificacion();

    this.formSectores = this.formBuilder.group(
      {
        codSector: new UntypedFormControl('', [Validators.required,Validators.pattern('[0-9]*')]),
        descripcion: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
        nivel: this.formNivel,
        clasificacion: this.formClasificacion,
        estatus: new UntypedFormControl(true)
      });


    //Si la accion es 2 seteamos los datos para editar
    if (this.accion === 2) {
      this.sectorID = data.sector.sectorId;
      this.formSectores.get('codSector').setValue(data.sector.codSector);
      this.formSectores.get('descripcion').setValue(data.sector.descripcion);
      this.formSectores.get('estatus').setValue(data.sector.estatus);

    }

  }

  /**
   * Metodo OnInit de la clase
   */
  ngOnInit() {

  }

  /**
   * Lista los tipos de Nivel.
   */
  spsNivel() {
    this.blockUI.start('Cargando datos...');

    this.service.getListByID('06RS', 'listaGeneralCategoria').subscribe(data => {
      this.blockUI.stop();
      this.listaNivel = data;
      //Si la accion es 2 seteamos los datos para editar
      if (this.accion === 2) {
        let indexNivel = this.listaNivel.findIndex(i => i.generalesId === this.data.sector.nivel.generalesId);
        this.formSectores.get('nivel').setValue(this.listaNivel[indexNivel]);
      }
      
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    }
    );
  }


  /**
   * Lista los tipos de Clasificacion.
   */
  spsClasificacion() {
    this.blockUI.start('Cargando datos...');

    this.service.getListByID('05CS', 'listaGeneralCategoria').subscribe(data => {
      this.blockUI.stop();
      this.listaClasificacion = data;
      //Si la accion es 2 seteamos los datos para editar
      if (this.accion === 2) {
        let indexClas = this.listaClasificacion.findIndex(i => i.generalesId === this.data.sector.clasificacion.generalesId);
        this.formSectores.get('clasificacion').setValue(this.listaClasificacion[indexClas]);
      }

    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error.Message);
    }
    );



  }


  /**
   * Método para guardar un sector.
   */
  guardarSector(){

    if (this.formSectores.invalid) {
      this.validateAllFormFields(this.formSectores);
      return;
    }

     this.blockUI.start('Guardando ...');
    
     //areglo que contiene los datos para dar de alta
        const data = {
          "sectorId": 0,
          "codSector": this.formSectores.get('codSector').value,
          "descripcion": this.formSectores.get('descripcion').value,
          "nivel": this.formSectores.get('nivel').value,
          "clasificacion": this.formSectores.get('clasificacion').value,
          "estatus": this.formSectores.get('estatus').value
      };

      this.service.registrarBYID(data, 1, 'crudSectores').subscribe(
          result => {

              //se cierrra el loader
              this.blockUI.stop();

              //Se condiciona resultado
              if (result[0][0] === '0') {
                  this.formSectores.reset();
                  this.formSectores.get('estatus').setValue(true);
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
   * Método para editar un sector.
   */
  editarSector(){
    if (this.formSectores.invalid) {
      this.validateAllFormFields(this.formSectores);
      return;
    }

     this.blockUI.start('Guardando ...');
    
     //areglo que contiene los datos para dar de alta
        const data = {
          "sectorId": this.sectorID,
          "codSector": this.formSectores.get('codSector').value,
          "descripcion": this.formSectores.get('descripcion').value,
          "nivel": this.formSectores.get('nivel').value,
          "clasificacion": this.formSectores.get('clasificacion').value,
          "estatus": this.formSectores.get('estatus').value
      };

      this.service.registrarBYID(data, 2, 'crudSectores').subscribe(
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
   * Método para validar los mensajes.
   */
  public validacion_msj = {
    'codSector': [
      { type: 'required', message: 'Código requerido.' },
      { type: 'pattern',  message: 'El campo solo acepta números enteros.' }
     ],
    'descripcion':[ 
      { type: 'required',   message: 'Descripción requerida.' },
      { type: 'maxlength',  message: 'El tamaño máximo es de 255 caracteres.' }
    ],
    'nivel':[ 
      { type: 'required',   message: 'Nivel requerido.' }
    ],
    'clasificacion':[ 
      { type: 'required',   message: 'Clasificación requerida.' }
    ]
  }

}
