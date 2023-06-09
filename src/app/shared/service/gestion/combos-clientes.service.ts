import { Injectable } from "@angular/core";
import { UntypedFormGroup } from "@angular/forms";
import { environment } from "../../../../environments/environment";
import { BlockUI, NgBlockUI } from "ng-block-ui";
import { GestionGenericaService } from "../gestion";



@Injectable()
export class CombosClienteService {
    @BlockUI() blockUI: NgBlockUI;
    //Forms
    formDatosG: UntypedFormGroup;//Datos generales del cliente
    formDomicilioCl: UntypedFormGroup;//Domicilios del cliente
    formPerfilTransacional: UntypedFormGroup;//Perfil transaccional del cliente
    formReferencias: UntypedFormGroup;//Datos generales Referencia
    formDomicilioRefe: UntypedFormGroup;//Domicilio referencia
    formDigitalizacion: UntypedFormGroup;
    //Combos
    listaGenero: any = [];
    listaJerarquia: any = [];
    listaIdentificacion: any = [];
    listaCalidadExt: any = [];
    listaParentesco: any = [];
    listaTipoReferencia: any = [];
    listaEstCivil: any = [];
    listaTiempoArraigo: any = [];
    listaContrato: any = [];
    /**PERFIL */
    listaNivelEscolar: any = [];
    listaRegimenMatrimonial: any = [];
    listaTipoVivienda: any = [];
    listaActividadRealiza: any = [];
    listaMedioDifusion: any = [];
    listaVinculosA: any = [];
    listaTipoBien: any = [];
    listaTipoServicio: any = [];
    listaManejoCtas: any = [];
    listaFinalidadCta: any = [];
    listaTipoIngreso: any = [];
    listaTipoPlazo: any = [];
    listaTipoEgreso: any = [];
    listaOrigenIngresos: any = [];
    listaTipoSocios: any = [];

    constructor(private service: GestionGenericaService) {

        this.spsGenero();
        this.spsTiempoArraigo();
        this.spsJerquiaDom();
        this.spsTipoIdentificacion();
        this.spsCalidadExt();
        this.spsTipoReferencia();
        this.spsParentesco();
        this.spsTipoContrato();
        this.spsEstCivil();
        this.spsListaNivelEscolar();
        this.spsListaRegimenMatrimonial();
        this.spsListaTipoVivienda();
        this.spsListaActividadRealiza();
        this.spsTipoPlazos();
        this.spsListaMedioDifusion();
        this.spsListaVinculosA();
        this.spsBienesMateriales();
        this.spsTipoServicio();
        this.spsManejaCta();
        this.spsFinalidadCta();
        this.spsTipoIngresos();
        this.spsOrigenIngresos();
        this.spsTipoEgresos();
        this.spsTipoSocios();

    }


    /**
        * Metodo para listar los  generos registrados 
        * en generales por la clave de la categoria
        * @param catGenero
        */
    spsGenero(): any {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catGenero, 'listaGeneralCategoria').subscribe(data => {
            this.listaGenero = data;
            this.blockUI.stop();
            return this.listaGenero;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }
    /**
     * Método para consultar y listar los tiempos de arraigo
     * por clave de categoria
     * @paramcatArraigo
     */
    spsTiempoArraigo() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catArraigo, 'listaGeneralCategoria').subscribe(data => {
            this.listaTiempoArraigo = data;
            this.blockUI.stop();
            return this.listaTiempoArraigo;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
     * Método para consultar y listar jeraquias de domicilio
     * por la clave de categoria
     *  @param catJerarquia
     */
    spsJerquiaDom() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catJerarquia, 'listaGeneralCategoria').subscribe(data => {
            this.listaJerarquia = data;
            this.blockUI.stop();
            return this.listaJerarquia;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
    * Método para listar os tipos de indentificaciones 
    * por clave de categoria
     @param catIdentificacion
    */
    spsTipoIdentificacion() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catIdentificacion, 'listaGeneralCategoria').subscribe(data => {
            this.listaIdentificacion = data;
            this.blockUI.stop();
            return this.listaIdentificacion;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
    * Método para consultar y listar calidad extranjero
    * @param 2 activos
    */
    spsCalidadExt() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'spsCalidadesExtranjeros').subscribe(data => {
            this.listaCalidadExt = data;
            this.blockUI.stop();
            return this.listaCalidadExt;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
    * Método para consultar y listar tipos de refencias
    * @param catReferencia
    */
    spsTipoReferencia() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catReferencia, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoReferencia = data;
            this.blockUI.stop();
            return this.listaTipoReferencia;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
    * Método para  listar los tipos de parentescos
    por clave de categoria
    @param catParentesco
    */
    spsParentesco() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catParentesco, 'listaGeneralCategoria').subscribe(data => {
            this.listaParentesco = data;
            this.blockUI.stop();
            return this.listaParentesco;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
     * Metodo para listar los tipos de contrato por clave de categoria
     * @param catTipoContrato
     */
    spsTipoContrato() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catTipoContrato, 'listaGeneralCategoria').subscribe(data => {
            this.listaContrato = data;
            this.blockUI.stop();
            return this.listaContrato;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**
    * Método para consultar y lista de estado civil
    * @param catEstCivil categoria
    */
    spsEstCivil() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catEstCivil, 'listaGeneralCategoria').subscribe(data => {
            this.listaEstCivil = data;
            this.blockUI.stop();
            return this.listaEstCivil;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }
    /**PERFIL TRANSACCIONAL */
    /**
             * Metodo para listar los Nivel Escolares
             * @param catNivelEscolar
             */
    spsListaNivelEscolar() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catNivelEscolar, 'listaGeneralCategoria').subscribe(data => {
            this.listaNivelEscolar = data;
            this.blockUI.stop();
            return this.listaNivelEscolar;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }

    /**
    * Metodo para listar Regimen Matrimonial
    @param catRegimenMatrimonial
    */
    spsListaRegimenMatrimonial() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catRegimenMatrimonial, 'listaGeneralCategoria').subscribe(data => {
            this.listaRegimenMatrimonial = data;
            this.blockUI.stop();
            return this.listaRegimenMatrimonial;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }
    /**
    * Metodo para lista de Tipos de vivienda
    @param catTipoVivienda
    */
    spsListaTipoVivienda() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catTipoVivienda, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoVivienda = data;
            this.blockUI.stop();
            return this.listaTipoVivienda;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }
    /**
     * Metodo para lista de Actividad que realiza
     * @param catActividadRealiza
     */
    spsListaActividadRealiza() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catActividadRealiza, 'listaGeneralCategoria').subscribe(data => {
            this.listaActividadRealiza = data;
            this.blockUI.stop();
            return this.listaActividadRealiza;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }

    /**
    * Metodo para obtener la lista Tipo de Plazos
    *  @param 2 activos 
    */
    spsTipoPlazos() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaTipoPlazo').subscribe(data => {
            this.blockUI.stop();
            this.listaTipoPlazo = data;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
        });
    }
    /**
    * Metodo para lista de Medios de Difusión
    @param catMediosDifusion
    */
    spsListaMedioDifusion() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catMediosDifusion, 'listaGeneralCategoria').subscribe(data => {
            this.listaMedioDifusion = data;
            this.blockUI.stop();
            return this.listaMedioDifusion;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }

    /**
     * Metodo para lista vinculos adicionales
     * @param catVinculoAdi
     */
    spsListaVinculosA() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catVinculoAdi, 'listaGeneralCategoria').subscribe(data => {
            this.listaVinculosA = data;
            this.blockUI.stop();
            return this.listaVinculosA;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }

    /**
    * Metodo para obtener la lista Bienes Materiales
    *  @param catBienMaterial
    */
    spsBienesMateriales() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catBienMaterial, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoBien = data;
            this.blockUI.stop();
            return this.listaTipoBien;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }

    /**
    * Metodo para obtener la lista Tipos de servicios(agua,luz,drenaje)
    * @param catTipoServicio
    */
    spsTipoServicio() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catTipoServicio, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoServicio = data;
            this.blockUI.stop();
            return this.listaTipoServicio;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
        }
        );
    }

    /**
   * Metodo para obtener la lista Manejo de cuentas bancarias
   *  @param catManejoCuenta
   */
    spsManejaCta() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(environment.categorias.catManejoCuenta, 'listaGeneralCategoria').subscribe(data => {
            this.listaManejoCtas = data;
            this.blockUI.stop();
            return this.listaManejoCtas;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }

    /**
   * Metodo para obtener la lista Finalidades de la cuenta
   *  @param catFinalidadCuenta
   */
    spsFinalidadCta() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catFinalidadCuenta, 'listaGeneralCategoria').subscribe(data => {
            this.listaFinalidadCta = data;
            this.blockUI.stop();
            return this.listaFinalidadCta;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }


    /**
   * Metodo para obtener la lista Tipo Ingresos
   *  
   */
    spsTipoIngresos() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catTipoIngreso, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoIngreso = data;
            this.blockUI.stop();
            return this.listaTipoIngreso;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }
    /**
     * Metodo para obtener la lista Tipo Egresos
     * @param catTipoEgreso 
     */
    spsTipoEgresos() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catTipoEgreso, 'listaGeneralCategoria').subscribe(data => {
            this.listaTipoEgreso = data;
            this.blockUI.stop();
            return this.listaTipoEgreso;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }
    /**
* Metodo para obtener la lista del origen de los ingresos
* @param catOrigening
*/
    spsOrigenIngresos() {
        this.blockUI.start('Cargando datos...');

        this.service.getListByID(environment.categorias.catOrigening, 'listaGeneralCategoria').subscribe(data => {
            this.listaOrigenIngresos = data;
            this.blockUI.stop();
            return this.listaOrigenIngresos;

        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error.Message);
            return;
        }
        );
    }
    /**
    * Metodo para obtener la lista Tipo S
    *  @param 2 activos 
    */
    spsTipoSocios() {
        this.blockUI.start('Cargando datos...');
        this.service.getListByID(2, 'listaTipoSocio').subscribe(data => {
            this.listaTipoSocios = data;
            this.blockUI.stop();
            return this.listaTipoSocios;
        }, error => {
            this.blockUI.stop();
            this.service.showNotification('top', 'right', 4, error);
            return;
        });
    }

}