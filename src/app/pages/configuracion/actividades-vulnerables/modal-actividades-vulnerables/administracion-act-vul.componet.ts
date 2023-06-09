import { Component ,Inject,OnInit} from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { ThemePalette } from "@angular/material/core";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from "../../../../../app/shared/service/gestion";
import { BlockUI, NgBlockUI } from "ng-block-ui";



/**
* @autor: Guillermo Juárez Jaramillo
* @version: 1.0.0
* @fecha: 24/09/2021
* @descripcion: Componente para la gestion de actividades vulnerables
*/
@Component({
    selector: 'administracion-act-vul',
    moduleId: module.id,
    templateUrl: 'administracion-act-vul.component.html',
})

export class AdministracionActividadesVul implements OnInit {

     //Declaracion de variables y componentes
    
     titulo = 'Actividades Vul';
     color: ThemePalette = 'primary';
     encabezado: string;
     accion: number;

     
     actvid : number;
     formActVulnerables: UntypedFormGroup;
   

     @BlockUI() blockUI: NgBlockUI;

     /*
     *Validaciones para todos los campos agregados
     */
     validaciones = {
        'concepto': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 255 dígitos' },
        ],
        'detalle': [
            { type: 'required', message: 'Campo requerido' },
            { type: 'maxlength', message: 'Campo máximo 255 dígitos' },
        ]
    };

      /**
     * Constructor de la clase
     * @param service - Instancia de acceso a datos
     * @param data - Datos recibidos 
     */
       constructor(private service: GestionGenericaService, 
        private formbuilder: UntypedFormBuilder,
        @Inject(MAT_DIALOG_DATA) public data: any) {
        //Se setean los datos de titulos
        this.encabezado = data.titulo + ' ' + this.titulo;
        this.accion = data.accion;
        
        this.formActVulnerables = this.formbuilder.group({
            concepto: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            detalle: new UntypedFormControl('', [Validators.required, Validators.maxLength(255)]),
            estatus: new UntypedFormControl(true)
        });

        //Si la accion es 2 seteamos los datos para editar
        if (this.accion === 2) {
            this.actvid = data.actividad.actVId;
            this.formActVulnerables.get('concepto').setValue(data.actividad.concepto);
            this.formActVulnerables.get('detalle').setValue(data.actividad.detalle);
            this.formActVulnerables.get('estatus').setValue(data.actividad.estatus);
        }

    }

    /**
     * Metodo ngOnInit de la clase
     */
    ngOnInit() {

    }

     /**
     * Método para limpiar los campos.
     */
      limpiarCampos() {


        this.formActVulnerables.get('oncepto').setValue(null);
        this.formActVulnerables.get('detalle').setValue(null);

    };

    /**
     * Metodo para guardar actividades vulnerables
     * @returns notificacion de resultado
     */
     guardarActividadVul() {
        if (this.formActVulnerables.invalid) {
            this.validateAllFormFields(this.formActVulnerables);
            return;
        }
        this.blockUI.start('Guardando Datos...');
        const data = {
            "actVId": 0,
            "concepto": this.formActVulnerables.get('concepto').value,
            "detalle": this.formActVulnerables.get('detalle').value,
            "estatus": this.formActVulnerables.get('estatus').value,
        };
        this.service.registrarBYID(data, 1, 'crudActividadesVul').subscribe(
            result => {

                this.blockUI.stop();

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
     * Metodo para editar informacion de actividades vulnerables
     */
      editarActividadvul() {
        if (this.formActVulnerables.invalid) {
            this.validateAllFormFields(this.formActVulnerables);
            return;
        }
        this.blockUI.start('Editando...');

        //se setean los datos en el array
        const data = {
            "actVId": this.actvid ,
            "concepto": this.formActVulnerables.get('concepto').value,
            "detalle": this.formActVulnerables.get('detalle').value,
            "estatus": this.formActVulnerables.get('estatus').value
        };

        this.service.registrarBYID(data, 2, 'crudActividadesVul').subscribe(
            result => {

                this.blockUI.stop();

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
          validateAllFormFields(formGroup: UntypedFormGroup) {         //{1}
            Object.keys(formGroup.controls).forEach(field => {  //{2}
                const control = formGroup.get(field);             //{3}
                if (control instanceof UntypedFormControl) {             //{4}
                    control.markAsTouched({ onlySelf: true });
                } else if (control instanceof UntypedFormGroup) {        //{5}
                    this.validateAllFormFields(control);            //{6}
                }
            });
        }
    



}
