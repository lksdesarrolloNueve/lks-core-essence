import { Component } from "@angular/core";
import { AbstractControl, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, ValidatorFn, Validators } from "@angular/forms";
import { MatDialogRef } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
interface Pago {
  num_pago: number;
  fecha_pago: string;
  monto_pago: number;
  interes: number;
  iva: number;
  pago_total: number;
  saldo_restante: number;
}


@Component({
  selector: 'referencia-mtc',
  moduleId: module.id,
  templateUrl: 'referencia-mtc.component.html'
})
export class ReferenciaMTCComponent {

  //Declaracion de variables
  formServicios: UntypedFormGroup;
  @BlockUI() blockUI: NgBlockUI;
  listaServicios: any = [];
  opcionesServicios: Observable<string[]>;

  lblCantidad: number = 0.0;

  constructor(
    private formBuilder: UntypedFormBuilder,
    private service: GestionGenericaService,
    private dialog: MatDialogRef<ReferenciaMTCComponent>) {

    this.formServicios = this.formBuilder.group({
      servicio: new UntypedFormControl('', [Validators.required, this.autocompleteObjectValidator()]),
      referencia: new UntypedFormControl('', Validators.required),
      usuario: new UntypedFormControl('', [Validators.required, Validators.maxLength(6), Validators.pattern('[0-9]*')]),
      contrasenia: new UntypedFormControl('', Validators.required)
    });

    this.spsServicios();

    // Ejemplo de uso
    const monto_prestamo = 10000;
    const tasa_interes_mensual = 0.03;
    const iva = 0.16;
    const num_amortizaciones = 12;
    const fecha_entrega = '2023-05-19';

    const pagos = this.calcularPagosMetodoAleman(monto_prestamo, tasa_interes_mensual, iva, num_amortizaciones, fecha_entrega);

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


  calcularPagosMetodoAleman(
    monto_prestamo: number,
    tasa_interes_mensual: number,
    iva: number,
    num_amortizaciones: number,
    fecha_entrega: string
  ): Pago[] {
    const pagos: Pago[] = [];
    const monto_pago = Math.ceil(monto_prestamo / num_amortizaciones);
    let saldo_restante = monto_prestamo;

    const fecha_entrega_obj = new Date(fecha_entrega);
    let fecha_pago = new Date(fecha_entrega_obj);

    for (let i = 1; i <= num_amortizaciones; i++) {
      const num_pago = i;
      fecha_pago = new Date(fecha_pago.setMonth(fecha_pago.getMonth() + 1));
      const fecha_pago_str = fecha_pago.toISOString().split('T')[0];

      const interes = saldo_restante * tasa_interes_mensual;
      //const interes = saldo_restante * (tasa_interes_mensual/30)*31;
      const iva_pago = interes * iva;
      let pago_total = Math.round(monto_pago + interes + iva_pago);

      if (i === num_amortizaciones) {
        // Ajustar el último pago si es negativo o mayor a saldo_restante
        pago_total = Math.min(saldo_restante, Math.max(0, saldo_restante + interes + iva_pago));
      }

      saldo_restante -= monto_pago;

      const pago: Pago = {
        num_pago,
        fecha_pago: fecha_pago_str,
        monto_pago,
        interes,
        iva: iva_pago,
        pago_total,
        saldo_restante
      };

      pagos.push(pago);
    }

    return pagos;
  }


  /**
     * Registro de servicio pagado
     */
  consultaReferencia() {

   
    //Valida fomrulario
    if (this.formServicios.invalid) {
        this.validateAllFormFields(this.formServicios);
        return;
    }



    let jsonLogin = {
        "cadena": 5000,
        "establecimiento": 11678,
        "terminal": 32424,
        "cajero": 39326,
        "clave": "F#(/G0@dwZ",
        //"cajero":this.formRecargas.get('usuario').value,
        //"clave": this.formRecargas.get('contrasenia').value
    };


    this.blockUI.start('Validando datos...');
    this.service.registrar(jsonLogin, 'loginMTC').subscribe(respLogin => {
        this.blockUI.stop();

        if (respLogin.codigoRespuesta === 0) {
            let reqSaldo = {
                token: respLogin.token,
                tokenType: respLogin.token_type,
                referencia1:this.formServicios.get('referencia').value,
                sku:this.formServicios.get('servicio').value.codigo
            }
            this.blockUI.start('Validando datos...');
            this.service.registrar(reqSaldo, 'consultaReferencia').subscribe(respCantidad => {
                this.blockUI.stop();
                if (respCantidad.codigo_respuesta === 0) {
                   
                    this.lblCantidad = respCantidad.cantidadAPagar;

                } else {
                    this.service.showNotification('top', 'right', 3, respCantidad.descripcion_respuesta);
                }

            }, error => {
                this.blockUI.stop();
                this.service.showNotification('top', 'right', 4, error);
            });

        } else {
            this.service.showNotification('top', 'right', 3, respLogin.mensajeRespuesta);
        }

    }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error);
    });


}


  /**
     * Filtro de Servicios
     */
  spsServicios() {
    this.blockUI.start('Cargando datos...');
    this.service.getListByID(1, 'spsProductosServicios').subscribe(
      data => {
        this.blockUI.stop();
        this.listaServicios = data;
        this.opcionesServicios = this.formServicios.get('servicio').valueChanges.pipe(
          startWith(''),
          map(value => this._filterServicios(value))
        );
        this.blockUI.stop();
      }, error => {
        this.blockUI.stop();
        this.service.showNotification('top', 'right', 4, error.Message)
      }
    );
  }


  /**
  * Muestra la descripcion del Servicio
  * @param option --servicio seleccionada
  * @returns --nombre de la servicio
  */
  displayFnServicios(option: any): any {
    return option ? option.producto : undefined;
  }

  /**
   * Metodo para filtrar por sucursal
  */
  opcionSelectServicio(event) {


  }

  /**
  * Filtra la servicio
  * @param value --texto de entrada
  * @returns la opcion u opciones que coincidan con la busqueda
  */
  private _filterServicios(value: any): any {

    let filterValue = value;

    if (value === null || value === undefined) {
      value = '';
    }
    if (!value[0]) {
      filterValue = value;
    } else {
      filterValue = value.toLowerCase();
    }
    return this.listaServicios.filter(option => option.producto.toLowerCase().includes(filterValue));
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
    'servicio': [
      { type: 'required', message: 'Campo requerido.' },
      { type: 'invalidAutocompleteObject', message: 'El servicio no pertenece a la lista, elija otro servicio.' }
    ],
    'referencia': [
      { type: 'required', message: 'Campo requerido.' }
    ],
    'usuario': [
      { type: 'required', message: 'Campo requerido.' },
      { type: 'maxlength', message: 'Campo máximo de 6 dígitos.' },
      { type: 'pattern', message: 'Solo números enteros.' }
    ],
    'contrasenia': [
      { type: 'required', message: 'Campo requerido.' }
    ]
  };




}