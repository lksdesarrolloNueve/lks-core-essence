import { Component, Inject } from "@angular/core";
import { UntypedFormBuilder, UntypedFormControl, UntypedFormGroup, Validators } from "@angular/forms";
import { MatDialogRef, MAT_DIALOG_DATA } from "@angular/material/dialog";

@Component({
    selector: 'liquida-creditos',
    moduleId: module.id,
    templateUrl: 'liquida-creditos.component.html'
})

export class LiquidaCreditosComponent {
    //Declaracion de variables
    titulo: string='';
    accion: number = 0;


    listaGarantia: any=[];
liquidaID:number = 0;
    formLiquida : UntypedFormGroup;
  

    constructor(private formBuilder: UntypedFormBuilder,
        private dialog: MatDialogRef<LiquidaCreditosComponent>,
        @Inject(MAT_DIALOG_DATA) public data: any) {

        this.accion = data.accion;
        this.titulo = data.titulo;


        this.formLiquida = this.formBuilder.group({
            montoS: new UntypedFormControl({value:data.montoS,disabled:true}),
            liquida: new UntypedFormControl({value:data.tantos,disabled:true}),
            //apagar: new FormControl(''),
            montoG: new UntypedFormControl({value:data.montoS*data.tantos,disabled:true})
        });
    }
    agregarGarantia(){
      let montoG=  this.formLiquida.get('montoG').value;
        this.dialog.close(montoG);
    }
}