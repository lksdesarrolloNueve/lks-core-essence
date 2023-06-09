import { Component, ElementRef, Inject, OnInit, ViewChild } from "@angular/core";
import { GestionGenericaService } from '../../../shared/service/gestion';
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { map, startWith } from "rxjs/operators";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { Observable } from "rxjs";
import { ThemePalette } from "@angular/material/core";

/**
* @autor: Juan Gerardo Rayas Mata
* @version: 1.0.0
* @fecha: 25/11/2021
* @descripcion: Componente para la busqueda  de cuentas contables
*/
@Component({
  selector: 'buscar-cuentacontable',
  moduleId: module.id,
  templateUrl: 'buscar-cuentacontable.component.html'
})


export class CuentaContableModalComponent implements OnInit{
  formCuentaConta: UntypedFormGroup;
  /**controles ctas contables*/
  cuentaconta = new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] });
  listaCuentaC: any;
  opcionesCuentaC: Observable<string[]>;
  selectedIdCuentaC: number;
  cuentaSelect : any;

  /**fin */
  @BlockUI() blockUI: NgBlockUI;

  constructor( private dialog: MatDialogRef<CuentaContableModalComponent>,private service: GestionGenericaService, private formBuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {

    //validacion de campos requeridos
    this.formCuentaConta = this.formBuilder.group({
        CuentaContable: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
    });


  }
  /**
    * Metodo OnInit de la clase
    */
  ngOnInit() {
  this.spsCuentaConta();
  }


  /**
* Metodo para consultar ctas contables
*/
  spsCuentaConta() {
    this.blockUI.start('Cargando datos...');//cabiara  ala de estados
    this.service.getListByID(2, 'spsCuentasContables').subscribe(data => {
      this.listaCuentaC = data;

      this.opcionesCuentaC = this.formCuentaConta.get('CuentaContable').valueChanges.pipe(
        startWith(''),
        map(value => this._filterCuentaC(value))
      );
      this.blockUI.stop();
    }, error => {
      this.blockUI.stop();
      this.service.showNotification('top', 'right', 4, error);
    });
  }

  /**
* Muestra la descripcion del estado
* @param option --estado seleccionado
* @returns --nombre de estado
*/
  displayFnCuentaConta(option: any): any {
    return option ? option.cuenta + "  /  " + option.nombre : undefined;
  }


  /**
* Filtra el estado
* @param value --texto de entrada
* @returns la opcion u opciones que coincidan con la busqueda
*/
  private _filterCuentaC(value: any): any {

    let filterValue = value;

    if (value === null || value === undefined) {
      value = '';
    }

    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }

    return this.listaCuentaC.filter(option => option.cuenta.toLowerCase().includes(filterValue)+ option.nombre.toLowerCase().includes(filterValue));
  }

  /**
   * MEtodo para setear el id a filtrar
   * @param event  - Evento a setear
   */
  opcionSeleccionCuentaC(event) {
    this.selectedIdCuentaC = event.option.value.cuentaid;

    if(this.data.idCuenta==this.selectedIdCuentaC){
      this.formCuentaConta.controls['CuentaContable'].setErrors({cuentaConta:true}); 
    }
    
    //Igualamos la cuenta
    this.cuentaSelect = event.option.value;


  }

  /**
   * Cerrar dialog
   */
  cerrarDialog(){

      //Validamos el formulario
      if (this.formCuentaConta.invalid) {
        this.validateAllFormFields(this.formCuentaConta);
        return;
    }

    //cerrar y generar poliza
    this.dialog.close(this.cuentaSelect);

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
        * Valida que el texto ingresado pertenezca a un estado
        * @returns mensaje de error.
        */
  autocompleteObjectValidator(): ValidatorFn {
    return (control: AbstractControl): { [key: string]: any } | null => {
      if (typeof control.value === 'string') {
        return { 'invalidAutocompleteObject': { value: control.value } }
      }
      return null  /* valid option selected */
    }
  }
    /**
     * Método para validar los mensajes.
     */
     public validaciones = {
      'CuentaContable': [
          { type: 'required', message: 'Cuenta contable requerida.' },
          { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra cuenta.' },
          { type: 'cuentaConta', message: 'La cuenta contable ya fue seleccionada, elija otra.' },
      ],
  }
}