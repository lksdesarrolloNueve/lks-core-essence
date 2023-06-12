import { Component, Inject } from "@angular/core";
import { UntypedFormGroup, UntypedFormControl, UntypedFormBuilder } from "@angular/forms";
import { MAT_DIALOG_DATA } from "@angular/material/dialog";
import { GestionGenericaService } from '../../../../shared/service/gestion';
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { MatExpansionModule } from '@angular/material/expansion';


@Component({
    selector: 'expediente-solicitudes',
    moduleId: module.id,
    templateUrl: 'expediente-solicitudes.component.html',
})
/**
 * @autor: Juan Pablo Jimenez Jaime
 * @version: 1.0.0
 * @fecha: 31/05/2023
 * @descripcion: Modal para mostrar el expediente del cliente
 */
export class ExpedienteSolicitudesComponent {

    clienteId: number;

    flagFoto: boolean = false;
    flagFrontalIne: boolean = false;
    flagReversoIne: boolean = false;
    flagComprobanteDomicilio: boolean = false;

    foto: string = '';
    frontalIne: string = '';
    reversoIne: string = '';
    comprobanteDomicilio: string = '';

    formExpediente: UntypedFormGroup;
    @BlockUI() blockUI: NgBlockUI;
    listExpedientes: any;

    panelOpenState: boolean = false;
    calisfoto: string;
    listImagenes: any;

    constructor(private service: GestionGenericaService, private formbuilder: UntypedFormBuilder, @Inject(MAT_DIALOG_DATA) public data: any) {
        this.formExpediente = this.formbuilder.group({
            clienteId: new UntypedFormControl(''),
            nombreCliente: new UntypedFormControl(''),
            selfie: new UntypedFormControl(''),
            frontalIne: new UntypedFormControl(''),
            reversoIne: new UntypedFormControl(''),
        });

        // this.formExpediente.get('clienteId').setValue(data.expediente.cliente_id);
        this.formExpediente.get('nombreCliente').setValue(data.expediente.nombre_cliente);

        this.clienteId = data.expediente.cliente_id;

        this.spsExpediente();
    }

    spsExpediente() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByObjet({ "datos": { "clienteId": this.clienteId }, "accion": 2 }, 'listaDocumentosOnboarding').subscribe(data => {
            this.blockUI.stop();
            this.listExpedientes = data.info;

            console.log(this.listExpedientes);

            for (let exp of this.listExpedientes) {
                console.log(exp);
                switch (exp.cv_tipodoc) {
                    case 'D0001':
                        this.flagFoto = true;
                        break;
                    case 'D0002':
                        this.flagFrontalIne = true;
                        break;
                    case 'D0003':
                        this.flagReversoIne = true;
                        break;
                    case 'D0004':
                        this.flagComprobanteDomicilio = true;
                        break;
                    default:
                        break;
                }
            }
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'rigth', 4, error.Message);
        }
        );
    }

    /**
     * Metodo para cargar en tabla las sucursales
     */
    spsImagenesOnboarding(accion: number) {
        switch (accion) {
            case 1:
                if (this.foto == '') {
                    this.blockUI.start('Cargando datos...');

                    this.service.getListByObjet({ "datos": { "clienteId": this.clienteId }, "accion": accion }, 'listaImagenesOnboarding').subscribe(data => {
                        this.blockUI.stop();
                        this.listImagenes = data.info;
                        this.foto = this.listImagenes[0].documento;

                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'rigth', 4, error.Message);
                    }
                    );
                }
                break;

            case 2:
                if (this.frontalIne == '') {
                    this.blockUI.start('Cargando datos...');

                    this.service.getListByObjet({ "datos": { "clienteId": this.clienteId }, "accion": accion }, 'listaImagenesOnboarding').subscribe(data => {
                        this.blockUI.stop();
                        this.listImagenes = data.info;
                        this.frontalIne = this.listImagenes[0].documento;

                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'rigth', 4, error.Message);
                    }
                    );
                }
                break;

            case 3:
                if (this.reversoIne == '') {
                    this.blockUI.start('Cargando datos...');

                    this.service.getListByObjet({ "datos": { "clienteId": this.clienteId }, "accion": accion }, 'listaImagenesOnboarding').subscribe(data => {
                        this.blockUI.stop();
                        this.listImagenes = data.info;
                        this.reversoIne = this.listImagenes[0].documento;

                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'rigth', 4, error.Message);
                    }
                    );
                }
                break;
            case 4:
                if (this.comprobanteDomicilio == '') {
                    this.blockUI.start('Cargando datos...');

                    this.service.getListByObjet({ "datos": { "clienteId": this.clienteId }, "accion": accion }, 'listaImagenesOnboarding').subscribe(data => {
                        this.blockUI.stop();
                        this.listImagenes = data.info;
                        this.comprobanteDomicilio = this.listImagenes[0].documento;

                    }, error => {
                        this.blockUI.stop();
                        this.service.showNotification('top', 'rigth', 4, error.Message);
                    }
                    );
                }
                break;
        }
    }
}