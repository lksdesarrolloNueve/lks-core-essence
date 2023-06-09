import { Component, Inject, OnInit} from "@angular/core";
import { AbstractControl, ValidatorFn, UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators} from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { environment } from '../../../../../environments/environment';


//Cuenta afectable.
const cAfectable  = environment.contabilidad.afectable; //Clave fectable
const cCargo      = environment.contabilidad.cargo;

/**
 * @autor: Horacio Abraham Picón Galván
 * @version: 1.0.0
 * @fecha: 1/12/2021
 * @descripcion: Movimientos cuentas contables.
 */
@Component({
    selector: 'mov-cuenta-cont',
    moduleId: module.id,
    templateUrl: 'mov-cuenta-cont.component.html'
})

export class MovCuentaCont implements OnInit {
    //Formulario. 
    formCtasContDetalle: UntypedFormGroup;

    listaCuentasContables: any;
    opcionesCuentasContables: Observable<string[]>;

    encabezado: string;
    cuerpo: string;
    listaCtas: any;
    accion: any;
    cuentaCont: any;
    cuentaContable: any;
    msjAccion = '';

    //Wait
    @BlockUI() blockUI: NgBlockUI;

 

    /**
     * Constructor
     */
    constructor(private service: GestionGenericaService,
        private dialog: MatDialogRef<MovCuentaCont>,
        @Inject(MAT_DIALOG_DATA) public data: any, private formBuilder: UntypedFormBuilder
    ) {


        this.encabezado = data.titulo;
        this.listaCtas = data.listMov;
        this.accion    = data.accion;
        this.cuentaCont = data.movimiento;

        
        this.msjAccion = 'Agregar';
        //validacion de campos requeridos
        this.formCtasContDetalle = this.formBuilder.group({
            cuentaContable: new UntypedFormControl('', { validators: [this.autocompleteObjectValidator(), Validators.required] }),
            referencia: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            concepto: new UntypedFormControl('', [Validators.required, Validators.maxLength(250)]),
            debe: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')]),
            haber: new UntypedFormControl('', [Validators.required, Validators.pattern('[0-9]+(\\.[0-9]{1,2})?$')])
        });

        //Desabilita inputs debe o haber
        if(data.listMov[0].cveTipoMov === cCargo){
            this.formCtasContDetalle.controls['debe'].disable({onlySelf: true});
            this.formCtasContDetalle.get('debe').setValue(0);
        }else{
            this.formCtasContDetalle.controls['haber'].disable({onlySelf: true});
            this.formCtasContDetalle.get('haber').setValue(0);
        }

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.msjAccion = 'Editar';
            this.formCtasContDetalle.get('cuentaContable').disable();
            this.formCtasContDetalle.get('referencia').setValue(data.movimiento.ref);
            this.formCtasContDetalle.get('concepto').setValue(data.movimiento.concepto);
            this.formCtasContDetalle.get('debe').setValue(data.movimiento.debe);
            this.formCtasContDetalle.get('haber').setValue(data.movimiento.haber);
        }

    }

    ngOnInit(): void {
        this.spsCuentasContables();
    }

    /**
     * Metodo para listar cuentas contables 
     * 
     */
    spsCuentasContables() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCtasContTsr').subscribe(data => {
            
            this.listaCuentasContables = data;

            let start = '';

            if(this.accion === 2){
            
                this.cuentaContable = data.filter((result: any) => result.cuenta === this.cuentaCont.cuentaContable);

                this.formCtasContDetalle.get('cuentaContable').setValue(this.cuentaContable[0]);
                start = this.cuentaContable[0];
            }
            
            this.opcionesCuentasContables = this.formCtasContDetalle.get('cuentaContable').valueChanges.pipe(
                
                startWith(start),

                map(value => this._filter(value))
            );


            

            this.blockUI.stop();
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }

    /**
     * Filtra cuenta contable
     * @param value --texto de entrada
     * @returns la opcion u opciones que coincidan con la busqueda
     */
    private _filter(value: any): any[] {
        let filterValue = value;

        if (value === null || value === undefined) {
            value = '';
        }
        if (!value[0]) {
            filterValue = value;
        } else {
            filterValue = value.toLowerCase();
        }
        return this.listaCuentasContables.filter(option => option.cuenta.toLowerCase().includes(filterValue)+ option.nombre.toLowerCase().includes(filterValue));// 
    }

    /**
    * Muestra cuentas contables 
    * @param option --Sucursal
    * @returns --nombre sucursal
    */
     displayCuentaContable(option: any): any {
        return option ? option.cuenta+ "  /  " + option.nombre : undefined;//
    }
    /**
     * Agregar la cuenta contable con su detalles para
    */
    agregarCtaCont() {

        //Validaciones personalizadas
        this.validaciones();
        
        //Valida formulario
        if (this.formCtasContDetalle.invalid) {
            this.validateAllFormFields(this.formCtasContDetalle);
            return;
        }

        let data = {
            "cuentaContableId": this.formCtasContDetalle.get('cuentaContable').value.cuentaContableId,
            "cuentaContable": this.formCtasContDetalle.get('cuentaContable').value.cuenta,
            "ref": this.formCtasContDetalle.get('referencia').value,
            "concepto": this.formCtasContDetalle.get('concepto').value,
            "cveTipoMov": "A",
            "debe": Number(this.formCtasContDetalle.get('debe').value,),
            "haber": Number(this.formCtasContDetalle.get('haber').value,)
        }

        this.dialog.close(data);

    }



    /**
     * Valida que el texto ingresado pertenezca a la lista
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
     * Validaciones personalizadas
     */
    validaciones(){

        //valida cuenta existente.
        let index = this.listaCtas.findIndex(res => res.cuentaContableId === this.formCtasContDetalle.get('cuentaContable').value.cuentaContableId);
    
        if(index > -1){
            this.formCtasContDetalle.controls['cuentaContable'].setErrors({incluida:true});
        }

        //Acepta solo cuentas afectables 
        if(this.formCtasContDetalle.get('cuentaContable').value.claveTipo != cAfectable){
            this.formCtasContDetalle.controls['cuentaContable'].setErrors({acumulable:true});   
        }

        //Valida que no se acepte valores en 0
        if(Number(this.formCtasContDetalle.get('debe').value <= 0)){
            this.formCtasContDetalle.controls['debe'].setErrors({debeMayor0:true}); 
        }

        if(Number(this.formCtasContDetalle.get('haber').value <= 0)){
            this.formCtasContDetalle.controls['haber'].setErrors({haberMayor0:true}); 
        }


        //Total cargo
        let totalCargo = 0;
        let totalAbono = 0;
        
        if(this.accion === 1){

            this.listaCtas.forEach((res: any) => {
                totalCargo = totalCargo + res.debe;
                totalAbono = totalAbono + res.haber;
            });

        }else{

            this.listaCtas.forEach((res: any) => {

                if(res.cuentaContableId != this.formCtasContDetalle.get('cuentaContable').value.cuentaContableId){
                    totalCargo = totalCargo + res.debe;
                    totalAbono = totalAbono + res.haber;
                }

            })

        }



        totalCargo =  Number(this.formCtasContDetalle.get('debe').value) + totalCargo;
        totalAbono =  Number(this.formCtasContDetalle.get('haber').value) + totalAbono;

        //Validar que el abono no sea mayor al cargo.
        if(this.listaCtas[0].cveTipoMov === cCargo && 
           totalAbono > this.listaCtas[0].debe){
                
            this.formCtasContDetalle.controls['haber'].setErrors({cantidadHaber:true}); 

        }else if(totalCargo > this.listaCtas[0].haber){
         
            this.formCtasContDetalle.controls['debe'].setErrors({cantidadDebe:true}); 
       
        }

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
     * Metodo para validar los mensajes.
     */
    public validacion_msj = {
        'cuentaContable': [
            { type: 'required', message: 'Cuenta contable requerida.' },
            { type: 'invalidAutocompleteObject', message: 'La cuenta contable no pertenece a la lista, elija otra cuenta.' },
            { type: 'incluida', message: 'La cuenta contable ya fue seleccionada, elija otra.' },
            { type: 'acumulable', message: 'Seleccione una cuenta contable afectable.' }
        ],
        'referencia': [
            { type: 'required', message: 'Referencia requerida.' },
            { type: 'maxlength', message: 'El tamaño máximo es de 255 caracteres.' }
        ],
        'concepto': [
            { type: 'required', message: 'Concepto requerido.' },
            { type: 'maxlength', message: 'El tamaño máximo es de 255 caracteres.' }
        ],
        'debe': [
            { type: 'required', message: 'Cantidad debe requerida.' },
            { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' },
            { type: 'cantidadDebe', message: 'El cargo no puede ser mayor que el abono.' },
            { type: 'debeMayor0', message: 'El cargo debe ser mayor a 0.' }
        ],
        'haber': [
            { type: 'required', message: 'Cantidad haber requerida.' },
            { type: 'pattern', message: 'El campo solo acepta números con dos decimales.' },
            { type: 'cantidadHaber', message: 'El abono no puede ser mayor que el cargo.' },
            { type: 'haberMayor0', message: 'El abono debe ser mayor a 0.' }
        ]
    }

}