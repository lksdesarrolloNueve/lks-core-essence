import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AdminLayoutRoutes } from './admin-layout.routing';


import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ClientesComponent } from '../../pages/clientes/clientes.component';


//Componentes para CATALOGOS
import { SucursalesComponent } from '../../pages/configuracion/sucursales/sucursales.component';
import { AdministracionSucursalesComponent } from '../../pages/configuracion/sucursales/modal-sucursales/administracion-sucursales.component';
import { TipoSociosComponent } from '../../pages/configuracion/tipos-socios/tipos-socios.component';
import { AdministracionTipoSociosComponent } from '../../pages/configuracion/tipos-socios/modal-tipo-socios/administracion-tipos-socios.component';
import { NacionalidadesComponent } from '../../pages/configuracion/nacionalidades/nacionanalidades.component';
import { AdministracionNacionalidadesComponent } from '../../pages/configuracion/nacionalidades/modal-nacionalidades/administracion-nacionalidades.component';
import { CalidadExtranjeroComponent } from '../../pages/configuracion/calidad-extranjeros/calidad-extranjeros.component';
import { AdminCalidadExtranjeroComponent } from '../../pages/configuracion/calidad-extranjeros/modal-calidadextranjero/administracion-calidadextranjero.component';
import { ActividadesPLDComponent } from '../../pages/configuracion/actividades-pld/actividades-pld.component';
import { AdministracionActividadesPLD } from '../../pages/configuracion/actividades-pld/modal-actividades-pld/administracion-act-pld.component';
import { BancosSatComponent } from '../../pages/configuracion/bancos-sat/bancos-sat.component';
import { AdministracionBancoSatComponent } from '../../pages/configuracion/bancos-sat/modal-bancos-sat/administracion-bancos-sat.component';
import { ClasificacionCredComponent } from '../../pages/configuracion/clasificacion-cred/clasificacion-cred.component';
import { AdministracionClasificacionCred } from '../../pages/configuracion/clasificacion-cred/modal-clasificacion-cred/administracion-clas-cred.component';
import { FinalidadCreditoComponent } from '../../pages/configuracion/finalidades-creditos/finalidades-creditos.component';
import { AdminFinalidadCreditoComponent } from '../../pages/configuracion/finalidades-creditos/modal-finalidadcredito/administracion-finalidadcredito.component';
import { MonedasSATComponent } from '../../pages/configuracion/monedas-sat/monedas-sat.component';
import { AdministracionMonedasComponent } from '../../pages/configuracion/monedas-sat/modal-monedas-sat/administracion-monedas-sat.component';
import { GarantiasComponent } from '../../pages/configuracion/garantias/garantias.component';
import { AdministracionGarantiasComponent } from '../../pages/configuracion/garantias/modal-garantias/administracion-garantias.component';
import { EstadoCredComponent } from '../../pages/configuracion/estado-cred/estado-cred.component';
import { AdministracionEstadoCred } from '../../pages/configuracion/estado-cred/modal-estado-cred/administracion-estado-cred.component';
import { CategoriaComponent } from '../../pages/configuracion/categorias-generales/categorias/categorias.component';
import { AdministracionCategoriasComponent } from '../../pages/configuracion/categorias-generales/categorias/modal-categorias/administracion-categorias.component';
import { GeneralesComponent } from '../../pages/configuracion/categorias-generales/generales/generales.component';
import { AdministracionGeneralesComponent } from '../../pages/configuracion/categorias-generales/generales/modal-generales/administracion-generales.component';
import { LocalidadesComponent } from '../../pages/configuracion/localidades/localidades.component';
import { UdisComponent } from '../../pages/configuracion/udis/udis.component';
import { AdministracionUdiComponent } from '../../pages/configuracion/udis/modal-udis/administracion-udis.component';
import { TipoAmortizacionComponent } from '../../pages/configuracion/tipos-amortizaciones/tipos-amortizaciones.component';
import { AdminTipoAmortizacionComponent } from '../../pages/configuracion/tipos-amortizaciones/modal-tipoamortizacion/administracion-tipoamortizacion.component';
import { ServidoresComponent } from '../../pages/configuracion/servidores/servidores.component';
import { AdministracionServidoresComponent } from '../../pages/configuracion/servidores/modal-servidores/admin-servidores.component';
import { CiudadesComponent } from '../../pages/configuracion/ciudades/ciudades.component';
import { AdministracionCiudadesComponent } from '../../pages/configuracion/ciudades/modal-ciudades/administracion-ciudades.component';
import { AdminLocalidadComponent } from '../../pages/configuracion/localidades/admin-localidad/admin-localidad.component';
import { EstadosComponent } from '../../pages/configuracion/estados/estados.component';
import { AdministracionEstadosComponent } from '../../pages/configuracion/estados/modal-estados/administracion-estados.component';
import { DiaInhabilComponent } from '../../pages/configuracion/dia-inhabil/dia-inhabil.component';
import { AdminDiaInhabilComponent } from '../../pages/configuracion/dia-inhabil/modal-diainhabil/administracion-diainhabil.component';
import { verificacionModalComponent } from '../../pages/modales/verificacion-modal/verificacion-modal.component';
import { ActividadesVulnerablesComponent } from '../../pages/configuracion/actividades-vulnerables/actividades-vul.component';
import { AdministracionActividadesVul } from '../../pages/configuracion/actividades-vulnerables/modal-actividades-vulnerables/administracion-act-vul.componet';
import { CuentasContablesComponent } from '../../pages/configuracion/cuentas-contables/cuentas-contables.component';
import { ColoniaComponent } from '../../pages/configuracion/colonias/colonias.component';
import { AdminColoniaComponent } from '../../pages/configuracion/colonias/modal-colonias/administracion-colonias.component';
import { ActividadesSCIANComponent } from '../../pages/configuracion/actividades-scian/actividades-scian.component';
import { SectoresComponent } from '../../pages/configuracion/actividades-scian/sectores/sectores.component';
import { SubSectoresComponent } from '../../pages/configuracion/actividades-scian/sub-sectores/sub-sectores.component';
import { RamasComponent } from '../../pages/configuracion/actividades-scian/ramas/ramas.component';
import { SubRamasComponent } from '../../pages/configuracion/actividades-scian/sub-ramas/sub-ramas.component';
import { ClaseActividadesComponent } from '../../pages/configuracion/actividades-scian/clase-actividades/clase-actividades.component';
import { AdministracionSectoresComponent } from '../../pages/configuracion/actividades-scian/sectores/modal-sectores/administracion-sectores.component';
import { DivisionComponent } from '../../pages/configuracion/actividades-sinco/division/division.component';
import { AdministracionDivisionComponent } from '../../pages/configuracion/actividades-sinco/division/modal-division/administracion-division.component';
import { ActividadesSincoComponent } from '../../pages/configuracion/actividades-sinco/actividades-sinco.component';
import { PrincipalComponent } from '../../pages/configuracion/actividades-sinco/principal/principal.component';
import { AdministracionPrincipalComponent } from '../../pages/configuracion/actividades-sinco/principal/modal-principal/administracion-principal.component';
import { AdministracionSubgrupoComponent } from '../../pages/configuracion/actividades-sinco/subgrupo/modal-subgrupo/administracion-subgrupo.component';
import { SubgrupoComponent } from '../../pages/configuracion/actividades-sinco/subgrupo/subgrupo.component';
import { UnitarioComponent } from '../../pages/configuracion/actividades-sinco/unitario/unitario.component';
import { AdministracionUnitarioComponent } from '../../pages/configuracion/actividades-sinco/unitario/modal-unitario/administracion-unitario.component';
import { OcupacionComponent } from '../../pages/configuracion/actividades-sinco/ocupacion/ocupacion.component';
import { AdministracionOcupacionComponent } from '../../pages/configuracion/actividades-sinco/ocupacion/modal-ocupacion/administracion-ocupacion.component';
import { CategoriaGeneralesComponent } from '../../pages/configuracion/categorias-generales/categoria-general.component';
import { FormasPagoComponent } from '../../pages/configuracion/formas-pago/formas-pago.component';
import { AdministracionFormasPago } from '../../pages/configuracion/formas-pago/modal-formas-pago/administracion-formas-pago.component'
import { BancosSitiComponent } from '../../pages/configuracion/bancos-siti/bancos-siti.component';
import { AdministracionBancoSitiComponent } from '../../pages/configuracion/bancos-siti/modal-bancos-siti/administracion-bancos-siti.component';
import { CuentaBancariaComponent } from '../../pages/configuracion/cuentas-bancarias/cuentas-bancarias.component';
import { AdminCuentaBComponent } from '../../pages/configuracion/cuentas-bancarias/modal-cuentas-bancarias/administracion-cuentas-bancarias.component';
import { AdministracionSubSectoresComponent } from '../../pages/configuracion/actividades-scian/sub-sectores/modal-sub-sectores/administracion-sub-sectores.component';
import { AdministracionRamasComponent } from '../../pages/configuracion/actividades-scian/ramas/modal-ramas/administracion-ramas.component';
import { AdministracionSubRamasComponent } from '../../pages/configuracion/actividades-scian/sub-ramas/modal-sub-ramas/administracion-sub-ramas.component';
import { AdministracionClaseActividadesComponent } from '../../pages/configuracion/actividades-scian/clase-actividades/modal-clase-actividades/administracion-clase-actividades.component';
import { InversionesComponent } from '../../pages/configuracion/inversiones/inversiones.component';
import { AdministracionInversionesComponent } from '../../pages/configuracion/inversiones/modal-inversiones/admin-inversiones.component';
import { AvisosComponent } from '../../pages/configuracion/avisos/avisos.component';
import { AdministracionAvisosComponent } from '../../pages/configuracion/avisos/modal-avisos/admin-avisos.component';
import { InpcComponent } from '../../pages/configuracion/inpc/inpc.component';
import { AdministracionInpcComponent } from '../../pages/configuracion/inpc/modal-inpc/administracion-inpc.component';
import { BovedaComponent } from '../../pages/configuracion/bovedas/bovedas.component';
import { AdminBovedaComponent } from '../../pages/configuracion/bovedas/modal-bovedas/admin-bovedas.component';
import { CajasComponent } from '../../pages/configuracion/cajas/cajas.component';
import { AdministracionCajasComponent } from '../../pages/configuracion/cajas/modal-cajas/administracion-cajas.component';
import { IsrComponent } from '../../pages/configuracion/isr/isr.component';
import { AdministracionIsrComponent } from '../../pages/configuracion/isr/modal-isr/administracion-isr.component';
import { TipoPlazoComponent } from '../../pages/configuracion/tipo-plazo/tipo-plazo.component';
import { AdministracionTipoPlazoComponent } from '../../pages/configuracion/tipo-plazo/modat-tipo-plazo/administracion-tipo-plazo.component';
import { CalificacionCarteraComponent } from '../../pages/configuracion/calificacion-cartera/calificacion-cartera.component';
import { CuentasContablesAnexo24Component } from '../../pages/configuracion/cuentas-cont-anexo24/cuentas-cont-anexo24.component';
import { IndicehhComponent } from '../../pages/configuracion/indicehh/indice-hh.component';
import { AdministracionIndicehhComponent } from '../../pages/configuracion/indicehh/modal-indicehh/administracion-indicehh.component';
import { CreditoRelacionadoComponent } from '../../pages/configuracion/credito-relacionado/credito-relacionado.component';
import { AdministracionCredRelComponent } from '../../pages/configuracion/credito-relacionado/modal-credito-relacionado/administracion-credrel.component';
import { AdminUsuariosComponent } from '../../pages/configuracion/rol-menu/admin-usuarios/admin-usuarios.component';
import { AdministracionRolesComponent } from '../../pages/configuracion/rol-menu/admin-usuarios/modal-roles/admin-roles.component';
import { EntidadesComponent } from '../../pages/configuracion/entidades/entidades.component';
import { SucursalesSocioComponent } from "../../pages/modales/sucursales-socio/sucursales-socio.component";
import { TipoFondosComponent } from '../../pages/configuracion/tipo-fondo/tipo-fondo.component';
import { AdministracionFondos } from '../../pages/configuracion/tipo-fondo/modal-tipo-fondos/administracion-fondos.component';
import { AmortizacionComponent } from '../../pages/configuracion/amortizacion/amortizacion.component';
import { CorreoComponent } from '../../pages/configuracion/correos/correo.component';
import { AdminCorreoComponent } from '../../pages/configuracion/correos/modal-correo/admin-correo.component';
import { SMSComponent } from '../../pages/configuracion/sms/sms.component';
import { AdminSMSComponent } from '../../pages/configuracion/sms/modal-sms/admin-sms.component';
import { UmaComponent } from '../../pages/configuracion/valor-uma/valor-uma.component';
import { AdministracionUmaComponent } from '../../pages/configuracion/valor-uma/modal-uma/administracion-uma.component';
import { MCargaDias } from '../../pages/configuracion/dia-inhabil/m-cm-dias/m-cm-dias.component';
import { MCargaCuentas } from '../../pages/configuracion/cuentas-contables/m-cm-cuentas/m-cm-cuentas.component';
import { LogoComponent } from '../../pages/configuracion/logo/logo.component';
import { CMAnexoComponent } from '../../pages/configuracion/cuentas-cont-anexo24/cm-anexo/cm-anexo.component';
import { DirecFuncFamiliaresComponent } from '../../pages/configuracion/direc-funcionarios-familiares/direc-funcionarios-familiares.component';
import { FondeoBancarioComponent } from '../../pages/configuracion/fondeo-bancario/fondeo-bancario.component';
import { VolatilidadComponent } from '../../pages/configuracion/volatilidad/volatilidad.component';
import { FraccionParamComponent } from '../../pages/configuracion/fraccion-param/fraccion-param.component';
import { ModalFraccionParametros } from '../../pages/configuracion/fraccion-param/modal-fraccion-param/modal-fraccion-param.component';

import { ProdcutosServiciosComponent } from '../../pages/configuracion/prodcutos-servicios/productos-servicios.component';
import { AdminProductoServicioComponent } from '../../pages/configuracion/prodcutos-servicios/admin-producto-servicio/admin-producto-servicio.component';
import { RecargaTelefonicaComponent } from '../../pages/configuracion/recargas-telefonicas/recarga-telefonica.component';
import { AdminRecargaTelefonicaComponent } from '../../pages/configuracion/recargas-telefonicas/admin-recarga-telefonica/admin-recarga-telefonica.component';

import { GastosComponent } from '../../pages/configuracion/gastos/gastos.component';
import { AdministracionGastosComponent } from '../../pages/configuracion/gastos/modal-gastos/administracion-gastos.component';
import { TipoActivosComponent } from '../../pages/configuracion/tipo-activos/activos/tipo-activos.component';
import { AdministrarTipoActivosComponent } from '../../pages/configuracion/tipo-activos/activos/modal-activos/administracion-tipo-activos.component';
import { TipoBajasComponent } from '../../pages/configuracion/tipo-activos/bajas/tipo-bajas.component';
import { ModalTipoBajasComponent } from '../../pages/configuracion/tipo-activos/bajas/modal-bajas/modal-tipo-bajas.component';
import { ParametrosComponent } from '../../pages/configuracion/tipo-activos/parametros/parametros.component';
import { ModalParametrosComponent } from '../../pages/configuracion/tipo-activos/parametros/modal-parametros/modal-parametros.component';
import { CuentasBajasComponent } from '../../pages/configuracion/tipo-activos/cuenta-bajas/cuenta-bajas.component';
import { ModalCuentaActivoBajaComponent } from '../../pages/configuracion/tipo-activos/cuenta-bajas/modal-cuenta/modal-cuenta-baja.component';
import { EstablecimientoMTCenterComponent } from '../../pages/configuracion/establecimientos-mtcenter/establecimiento-mtcenter.component';
import { ModalEstablecimientoComponent } from '../../pages/configuracion/establecimientos-mtcenter/modal-establecimiento/modal-establecimiento.component';
import { RecargasMTCenterComponent } from '../../pages/mtcenter/bitacora-recargas/recargas.component';
import { ServiciosMTCenterComponent } from '../../pages/mtcenter/bitacora-servicios/servicios.component';



//Componentes para DIGITALIZACION
import { TipoDocumentoComponent } from '../../pages/digitalizacion/tipo-documento/tipo-documento.component';
import { AdminTipoDocumentoComponent } from '../../pages/digitalizacion/tipo-documento/modal-tipo-documento/admin-tipo-documento.component';
import { AsignaDocumentoComponent } from '../../pages/digitalizacion/asigna-documento/asigna-documento.component';
import { AdminAsignaDocumentoComponent } from '../../pages/digitalizacion/asigna-documento/modal-asigna-documento/admin-asigna-documento.component';
import { DocumentoCodificadoComponent } from '../../pages/digitalizacion/documento-codificado/documento-codificado.component';
import { AdminDocumentoCodificadoComponent } from '../../pages/digitalizacion/documento-codificado/modal-documento-codificado/admin-documento-codificado.component';
import { AdminPdfComponent } from '../../pages/digitalizacion/documento-codificado/modal-pdf/admin-pdf.component';
import { MenusComponent } from '../../pages/configuracion/rol-menu/menus/menus.component';
import { AltaPermisosComponent } from '../../pages/configuracion/rol-menu/alta-permisos/alta-permisos.component';
import { RangoInversionesComponent } from '../../pages/configuracion/rango-inversiones/rango-inversiones.component';
import { AdministracionRangoInversionesComponent } from '../../pages/configuracion/rango-inversiones/modal-rango-inversiones/admin-rango-inversiones.component';
import { MovimientosCajaComponent } from '../../pages/configuracion/movimientos-caja/movimientos-caja.component';
//import { AdminMapaComponent } from '../../pages/clientes/empresa/modal-mapa/admin-mapa.component';


//Componentes para CLIENTES
import { EmpresaComponent } from '../../pages/clientes/empresa/empresa.component';
import { AdministracionProveedorComponent } from '../../pages/configuracion/proveedores/modal-proveedores/administracion-proveedor.component';
import { ProveedorComponent } from '../../pages/configuracion/proveedores/proveedores.component';
import { DepreciacionesComponent } from '../../pages/configuracion/depreciaciones/depreciaciones.component';
import { AdministracionDepreciacionesComponent } from '../../pages/configuracion/depreciaciones/modal-depreciaciones/admin-depreciaciones.component';
import { CreditosComponent } from '../../pages/configuracion/creditos/creditos.component';
import { CargosComponent } from '../../pages/configuracion/cargos/cargos.component';
import { AdministracionCargosComponent } from '../../pages/configuracion/cargos/modal-cargos/administracion-cargos.component';
import { TresSesentaFisicosComponent } from '../../pages/clientes/360-fisicos/tres-sesenta-fisicos.component';
import { BloqueoClienteComponent } from '../../pages/clientes/bloqueos-cliente/bloqueo-cliente.component';
import { AdminBloqueoClienteComponent } from '../../pages/clientes/bloqueos-cliente/admin-bloqueo-cliente.component';
import { ClabesClienteComponent } from '../../pages/clientes/clabes-cliente/clabes-cliente.component';


//Componentes para CLIENTES
import { DomiciliosComponent } from '../../pages/clientes/domicilios/domicilios.component';
import { AdministracionDomiciliosComponent } from '../../pages/clientes/domicilios/modal-domicilios/admin-domicilios.component';
import { ClientesAComponent } from '../../pages/clientes/administracion-clientes/clientes.component';
import { SujetosComponent } from '../../pages/clientes/administracion-sujetos/sujetos.component';
import { AdministracionSujetosComponent } from '../../pages/clientes/administracion-sujetos/modal-sujetos/admin-sujetos.component';
import { AvisosClientesComponent } from '../../pages/clientes/notificaciones/notificaciones-clientes/avisos-clientes/avisos-clientes.component';
import { AdminAvisosClientesComponent } from '../../pages/clientes/notificaciones/notificaciones-clientes/avisos-clientes/admin-avisos/admin-avisos-clientes.component';
import { NotGloClientesComponent } from '../../pages/clientes/notificaciones/notificaciones-globales/noti-globales-cli.component';
import { AdminNotGloClientesComponent } from '../../pages/clientes/notificaciones/notificaciones-globales/admin-not-globales/admin-not-globales-cli.component';
import { BloqueoClientesComponent } from '../../pages/clientes/notificaciones/not-bloqueo-clientes/bloqueo-clientes.component';
import { AdminBloqueoClientesComponent } from '../../pages/clientes/notificaciones/not-bloqueo-clientes/admin-bloqueo-clientes/admin-bloqueo-clientes.component';
import { GruposComponent } from '../../pages/clientes/grupos/grupos.component';
import { AdminGrupoComponent } from '../../pages/clientes/grupos/modal-grupos/admin-grupos.component';
import { SujetosModalComponent } from '../../pages/modales/sujetos-modal/sujetos-modal.component';
import { ClientesMComponent } from '../../pages/clientes/administracion-clientes/clientes-morales.component';


import { BuscarClientesComponent } from '../../pages/modales/clientes-modal/buscar-clientes.component';
import { BuscarEmpresaComponent } from '../../pages/modales/empresa-modal/buscar-empresa.component';
import { DocumentosModalComponent } from '../../pages/modales/documentos-modal/documentos-modal.component';
import { DirecFuncionariosComponent } from '../../pages/configuracion/direc-funcionarios/direc-funcionarios.component';
import { AdminBajaComponent } from '../../pages/configuracion/direc-funcionarios/modal-baja/admin-baja.component';
import { EstatusCliComponent } from '../../pages/clientes/estatus-clientes/estatus-clientes.component';
import { AdministracionEstatusCliComponent } from '../../pages/clientes/estatus-clientes/modal-estatus-clientes/admin-estatus-clientes.component';
import { SolicitudActualizacionComponent } from '../../pages/clientes/solicitudes/solicitud-actualizacion.component';
import { ModalSolicitudComponent } from '../../pages/clientes/solicitudes/modal-solicitud/modal-solicitud.component';
import { SolicitudModalComponent } from '../../pages/modales/solicitud-modal/solicitud-modal.component';
import { ModalSolicitudSucursalComponent } from '../../pages/clientes/solicitudes/modal-solicitud/modal-solicitud-sucursal.component';
import { ModalPldComponent } from '../../pages/clientes/administracion-clientes/modal-pld/modal-pld.component';




//Componentes para TESORERIA
import { MovimientosBancariosComponent } from '../../pages/tesoreria/movimientos-bancarios/movimientos-bancarios.component';
import { MovCuentaCont } from '../../pages/tesoreria/movimientos-bancarios/modal-mov-cuenta-cont/mov-cuenta-cont.component';
import { BuscarMovimientoComponent } from '../../pages/modales/movimiento-modal/buscar-movimiento.component';
import { ConciliacionBancariaComponent } from '../../pages/tesoreria/conciliacion-bancaria/conciliacion-bancaria.component';
import { CuentaContableModalComponent } from '../../pages/modales/cuentacontable-modal/buscar-cuentacontable.component';
import { MonitorCuentasComponent } from '../../pages/tesoreria/monitor-cuentas/monitor-cuentas.component';
import { PolizaInversionComponent } from '../../pages/tesoreria/movimientos-bancarios/polizas-inversion/poliza-inversion.component';



//Componentes para CONTABILIDAD.
import { CierrePeriodoComponent } from '../../pages/contabilidad/cierre-mensual/cierre-periodo/cierre-periodo.component';
import { PolizasComponent } from '../../pages/contabilidad/polizas/polizas.component';
import { AdministracionPolizasComponent } from '../../pages/contabilidad/polizas/modal-polizas/administracion-polizas.component';
import { MovimientoPolizasComponent } from '../../pages/contabilidad/movimientos/movimientoPoliza.component';
import { DevInversionesComponent } from '../../pages/contabilidad/cierre-mensual/dev-inversiones/dev-inversiones.component';
import { DevAhorroComponent } from '../../pages/contabilidad/cierre-mensual/dev-ahorro/dev-ahorro.component';
import { CierreDiaComponent } from '../../pages/contabilidad/cierre-diario/cierre-dia/cierre-dia.component';
import { ModalCfdiComponent } from '../../pages/contabilidad/polizas/comprobantes/modal-cfdi/modal-cfdi.component';
import { ModalComprobanteComponent } from '../../pages/contabilidad/polizas/comprobantes/modal-comprobante/modal-comprobante.component';
import { MayorGeneralComponent } from '../../pages/contabilidad/reportes/financieros/mayor-general/mayor-general.component';
import { CapitalNetoComponent } from '../../pages/contabilidad/cierre-mensual/capital-neto/capital-neto.component';
import { AdminCapNetoComponent } from '../../pages/contabilidad/cierre-mensual/capital-neto/admin-cap-neto/admin-cap-neto.component';
import { BalanceComponent } from '../../pages/contabilidad/reportes/prudenciales/balance/balance.component';
import { EstadoResultadosComponent } from '../../pages/contabilidad/reportes/prudenciales/estados-resultados/estadosResultados.component';
import { OrigenAplicacionComponent } from '../../pages/contabilidad/reportes/prudenciales/origen-aplicacion/origen-aplicacion.component';
import { BalanzaComponent } from '../../pages/contabilidad/reportes/financieros/balanza/balanza.component';
import { CuentaContableXmlComponent } from '../../pages/contabilidad/reportes/financieros/cuenta-contable-xml/cuenta-contable-xml.component';
import { CambioCapitalComponent } from '../../pages/contabilidad/reportes/prudenciales/cambio-capital/cambio-capital.component';
import { PolizasAuxiliaresSatComponent } from '../../pages/contabilidad/polizas-auxiliares-sat/polizas-auxiliares.component';
import { ReportrazonesFinComponent } from '../../pages/contabilidad/reportes/financieros/razones-financieras/razones-financieras.component';
import { DevCreditosComponent } from '../../pages/contabilidad/cierre-mensual/dev-creditos/dev-creditos.component';
import { ArchivoCarteraComponent } from '../../pages/contabilidad/cartera/archivo-cartera.component';

import { PrecierreComponent } from '../../pages/contabilidad/cierre-mensual/precierre/precierre.component';
import { ActivoDepreciableComponent } from '../../pages/contabilidad/activos/depreciable/depreciable.component';
import { ModalDepreciableComponent } from '../../pages/contabilidad/activos/depreciable/modal/modal-depreciable.component';
import { ModalIncpComponent } from '../../pages/contabilidad/activos/depreciable/modal/modal-incp.component';
import { ActivoNoDepreciableComponent } from '../../pages/contabilidad/activos/no-depreciable/no-depreciable.component';
import { ModalNoDepreciableComponent } from '../../pages/contabilidad/activos/no-depreciable/modal/modal-no-depreciable.component';
import { DetalleActivoComponent } from '../../pages/contabilidad/activos/detalle/detalle-activo.component';
import { ModalDetalleActivoComponent } from '../../pages/contabilidad/activos/detalle/modal/modal-detalle.component';
import { ActivoBajaComponent } from '../../pages/contabilidad/activos/baja/activo-baja.component';
import { ModalActivoBajaComponent } from '../../pages/contabilidad/activos/baja/modal/modal-baja.component';
import { ReporteActivosComponent } from '../../pages/contabilidad/activos/reportes/reporte-activos.component';


//Componentes para CRÉDITOS
import { AdminCreditosComponent } from '../../pages/creditos/admin-creditos/admin-creditos.component';
import { MHipotecasCreditosComponent } from '../../pages/creditos/modal-creditos/hipotecas-creditos/m-hipotecas-creditos.component';
import { MPrendasCreditosComponent } from '../../pages/creditos/modal-creditos/prendas-creditos/m-prendas-creditos.component';
import { MSolicitudCreditosComponent } from '../../pages/creditos/modal-creditos/m-solicitud-creditos/m-solicitud-creditos.component';
import { GestionSolicitudesCredComponent } from '../../pages/creditos/solicitudes/solicitudes.component';
import { AdminAvalesComponent } from '../../pages/creditos/modal-creditos/avales-creditos/admin-avales.component';
import { SolicitudesAprobadas } from '../../pages/creditos/solicitudes/solicitudes-aprobadas/solicitudes-aprobadas.component';
import { AmortizacionesComponent } from '../../pages/modales/amortizaciones-modal/amortizaciones.component';
import { LiquidaCreditosComponent } from '../../pages/creditos/modal-creditos/liquida-creditos/liquida-creditos.component';
import { ModalInversionesComponent } from '../../pages/creditos/modal-creditos/inversiones/inversiones.component';
import { ModalCredRenovadoComponent } from '../../pages/creditos/modal-creditos/credito-renovado/credito-renovado.component';
import { AdminCreditosGrupalesComponent } from '../../pages/creditos/admin-grupales/admin-grupales.component';
import { ModalPerfilComponent } from '../../pages/creditos/admin-grupales/modal-perfil/modal-perfil.component';

//componentes de conciliacion bancaria
import { ComiteComponent } from '../../pages/configuracion/comite-credito/comite.component';

//Componentes para CAJAS
import { CajaMovimientosComponent } from '../../pages/cajas/caja-movimientos/caja-movimientos.component';
import { AdministracionMovimientoComponent } from '../../pages/cajas/caja-movimientos/admin-movimiento/admin-movimiento.component';
import { CajasSucursalComponent } from '../../pages/cajas/cajas-sucursal/cajas-sucursal.component';
import { ModalCajaMovComponent } from '../../pages/cajas/caja-movimientos/modal-caja-movimiento/modal-caja-movimiento.component';
import { ModalCerrarCajaComponent } from '../../pages/cajas/cajas-sucursal/modal-cerrar-caja/modal-cerrar-caja.component';
import { CortesCajaComponent } from '../../pages/cajas/cortes-caja/cortes-caja.component';
import { listaModalComponent } from '../../pages/modales/lista-modal/lista-modal.component';
import { NotificacionesCajaModalComponent } from '../../pages/modales/notificaciones-caja-modal/notificaciones-caja.component';
import { PuntoDeVentaComponent } from '../../pages/cajas/punto-de-venta/punto-de-venta.component';
import { AdminCajasSucursalComponent } from '../../pages/cajas/cajas-sucursal/modal-cajas-sucursal/admin-cajas-sucursal.component';
import { FondoCajasComponent } from '../../pages/cajas/fondo-cajas/fondo-cajas.component';
import { DetalleCierreComponent } from '../../pages/cajas/cortes-caja/detalle-cierre/detalle-cierre.component';
import { ModalTrBovedaComponent } from '../../pages/cajas/caja-movimientos/modal-traspaso-boveda/modal-traspaso-boveda.component';
import { ModalGastosCajaComponent } from '../../pages/cajas/caja-movimientos/modal-gastos-caja/modal-gastos.caja.component';
import { SpeiComponent } from '../../pages/cajas/spei/spei.component';
import { BeneficiariosSPEIComponent } from '../../pages/cajas/spei/beneficiarios/beneficiarios-spei.component';



//Componentes para Inversiones
import { InversionComponent } from '../../pages/inversiones/inversion/inversion.component';
import { CotizadorInversionComponent } from '../../pages/inversiones/cotizador/cotizador-inversion.component';
import { CrudInversionComponent } from '../../pages/inversiones/inversion/m-inversion/m-inversion.component';


//Componentes para pld
import { HistoricoMovComponent } from '../../pages/pld/historico-movimientos/historico-movimientos.components';
import { OpintPreocupante } from '../../pages/pld/op-int-preocupante/opint-preocupante.component';
import { AdminOpintPreocupanteComponent } from '../../pages/pld/op-int-preocupante/modal-op-int-preocupante/admin-opint-preocupante.component';
import { PepComponent } from '../../pages/configuracion/peps/peps.component';
import { AdminPepsComponent } from '../../pages/configuracion/peps/modal-peps/admin-peps.component';
import { PbaComponent } from '../../pages/configuracion/pba/pba.component';
import { ModalPbaComponent } from '../../pages/configuracion/pba/modal-pba/modal-pba.component';
import { MatrizRiesgosComponent } from '../../pages/pld/matriz-riesgos/matriz-riesgos.component';
import { ModalRiesgosComponent } from '../../pages/pld/matriz-riesgos/modal-riesgos/modal-riesgos.component';
import { RiesgosClienteComponent } from '../../pages/pld/riesgos-cliente/riesgos-cliente.component';
import { OpRelevanteComponent } from '../../pages/pld/op-relevante/op-relevante.component';
import { ReportePldComponent } from '../../pages/pld/reportes/reporte-pld.component';
import { OpinusualComponent } from '../../pages/pld/op-inusual/op-inusual.component';

//Riesgos
import { RiesgoComunComponent } from '../../pages/riesgos/riesgo-comun/riesgo-comun.component';
import { RiesgoCreditoComponent } from '../../pages/riesgos/riesgos-credito/riesgo-credito.component';
import { PersonasRelacionadasComponent } from '../../pages/riesgos/personas-relacionadas/personas-relacionadas.component';
import { RiesgoMercadoComponent } from '../../pages/riesgos/riesgo-mercado/riesgo-mercado.component';
import { RiesgoLiquidezComponent } from '../../pages/riesgos/riesgo-liquidez/riesgo-liquidez.component';


//Componentes para cobranza
import { HistorialCrediticioComponent } from '../../pages/cobranza/historial-crediticio/historial-crediticio.component';
import { AdminConveniosComponent } from '../../pages/cobranza/administracion-convenios/admin-convenios.component';
import { ModalConveniosComponent } from '../../pages/cobranza/administracion-convenios/modal-convenios/modal-convenios.component';
import { AdministracionAvisosMoratorioComponent } from '../../pages/cobranza/administracion-avisos/administracion-avisos-moratorio.component';
import { ExtraclimoCitaroriosComponent } from '../../pages/cobranza/historial-crediticio/extrajudicial/extra-climo-citatorios.component';
import { ClientesMorososComponent } from '../../pages/cobranza/historial-crediticio/extrajudicial/clientes-morosos/cliente-moroso.component';
import { AdminClienteCitatoriosComponent } from '../../pages/cobranza/historial-crediticio/extrajudicial/clientes-morosos/modal-cliente-morosos/admin-cliente-citatorio.component';
import { CitatoriosComponent } from '../../pages/cobranza/historial-crediticio/extrajudicial/citatorios/citatorio.component';
import { AdminCarteraComponent } from '../../pages/cobranza/clasificacion-cartera/admin-cartera/admin-cartera.component';
import { ClaCarteraComponent } from '../../pages/cobranza/clasificacion-cartera/cla-cartera.component';
import { HistorialCobranzaComponet } from '../../pages/cobranza/historial-cobranza/historial-cobranza.component'

//Nominas 
import { NominaComponent } from '../../pages/nominas/gestion-empresas/nominas.component';
import { ModalServicioComponent } from '../../pages/nominas/gestion-empresas/servicio/modal-servicio.component';
import { EmpresasNominaComponent } from '../../pages/nominas/gestion-empresas/servicio/empresas-nomina.component';
import { PlantillaComponent } from '../../pages/nominas/gestion-empresas/plantilla/plantilla.component';
import { EmpleadosComponent } from '../../pages/nominas/gestion-empresas/empleados/empleados.component';
import { ModalEmpleadoComponent } from '../../pages/nominas/gestion-empresas/empleados/modal-empleado.component';
import { DispersionNominaComponent } from '../../pages/nominas/dispersion-nomina/dispersion-nomina.component';
import { ArchivoComponent } from '../../pages/nominas/archivo-nomina/archivo.component';

//SPEI
import { SpeiOutComponent } from '../../pages/spei/spei-out/spei-out.component';
import { SpeiInComponent } from '../../pages/spei/spei-in/spei-in.component';

//MTCenter
import { TAEComponent } from '../../pages/cajas/punto-de-venta/tae/tae.component';
import { ServiciosMTCComponent } from '../../pages/cajas/punto-de-venta/servicios/servicios.component';
import { ReferenciaMTCComponent } from '../../pages/cajas/punto-de-venta/referencia/referencia-mtc.component';
import { SaldoServiciosComponent } from '../../pages/mtcenter/saldos/saldo-servicios/saldo-servicios.component';
import { SaldoTaeComponent } from '../../pages/mtcenter/saldos/saldo-tae/saldo-tae.component';

//BANCA
import { FiltroBEComponent } from '../../pages/servicio-be/filtro-cliente-be/filtro-cliente-be.component';
import { BajaClienteComponent } from '../../pages/servicio-be/baja-cliente/baja-cliente.component';
import { AltaClienteComponent } from '../../pages/servicio-be/alta-cliente/alta-cliente.component';
import { ClienteBEComponent } from '../../pages/servicio-be/cliente-be/cliente-be.component';

//ONBOARDING
import { SolicitudesOnboardingComponent } from '../../pages/onboarding/solicitudes/solicitudes.component';
import { AdministracionSolicitudesOnboardingComponent } from '../../pages/onboarding/solicitudes/administracion-solicitudes/administracion-solicitudes-onboarding.component';
import { ExpedienteSolicitudesComponent } from '../../pages/onboarding/solicitudes/expediente-solicitudes/expediente-solicitudes.component';


//Material Disenio
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSliderModule } from '@angular/material/slider';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatMenuModule } from '@angular/material/menu';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatCardModule } from '@angular/material/card';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatNativeDateModule, MatPseudoCheckboxModule } from '@angular/material/core';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTreeModule } from '@angular/material/tree';


//import { GoogleMapsModule } from '@angular/google-maps';
import { JsonParsePipe } from '../../shared/pipes/jsonParse.pipe';
import { NgxMaskModule } from 'ngx-mask';
import { MomentDateModule } from '@angular/material-moment-adapter';


@NgModule({
  imports: [
    CommonModule,
    RouterModule.forChild(AdminLayoutRoutes),
    FormsModule,
    NgbModule,
    ReactiveFormsModule,
    MatSliderModule,
    MatDatepickerModule,
    MomentDateModule,
    MatNativeDateModule,
    MatButtonModule,
    MatInputModule,
    MatAutocompleteModule,
    MatFormFieldModule,
    MatRadioModule,
    MatPseudoCheckboxModule,
    MatCheckboxModule,
    MatSelectModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatMenuModule,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatGridListModule,
    MatCardModule,
    MatStepperModule,
    MatTabsModule,
    MatExpansionModule,
    MatButtonToggleModule,
    MatChipsModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatSnackBarModule,
    MatTableModule,
    MatSortModule,
    MatPaginatorModule,
    MatTreeModule,
    //GoogleMapsModule,
    NgxMaskModule.forRoot()
  ],
  declarations: [
    SolicitudesOnboardingComponent,
    AdministracionSolicitudesOnboardingComponent,
    ExpedienteSolicitudesComponent,
    FiltroBEComponent,
    ClienteBEComponent,
    BajaClienteComponent,
    AltaClienteComponent,
    SaldoServiciosComponent,
    SaldoTaeComponent,
    ClientesComponent,
    CajasComponent,
    SucursalesComponent,
    AdministracionSucursalesComponent,
    TipoSociosComponent,
    AdministracionTipoSociosComponent,
    NacionalidadesComponent,
    AdministracionNacionalidadesComponent,
    CalidadExtranjeroComponent,
    AdminCalidadExtranjeroComponent,
    ActividadesPLDComponent,
    AdministracionActividadesPLD,
    BancosSatComponent,
    AdministracionBancoSatComponent,
    ClasificacionCredComponent,
    AdministracionClasificacionCred,
    FinalidadCreditoComponent,
    AdminFinalidadCreditoComponent,
    MonedasSATComponent,
    AdministracionMonedasComponent,
    GarantiasComponent,
    AdministracionGarantiasComponent,
    EstadoCredComponent,
    AdministracionEstadoCred,
    CategoriaComponent,
    AdministracionCategoriasComponent,
    GeneralesComponent,
    AdministracionGeneralesComponent,
    CategoriaGeneralesComponent,
    UdisComponent,
    AdministracionUdiComponent,
    TipoAmortizacionComponent,
    AdminTipoAmortizacionComponent,
    ServidoresComponent,
    AdministracionServidoresComponent,
    CiudadesComponent,
    AdministracionCiudadesComponent,
    EstadosComponent,
    AdministracionEstadosComponent,
    DiaInhabilComponent,
    AdminDiaInhabilComponent,
    verificacionModalComponent,
    ActividadesVulnerablesComponent,
    AdministracionActividadesVul,
    LocalidadesComponent,
    AdminLocalidadComponent,
    CuentasContablesComponent,
    ColoniaComponent,
    AdminColoniaComponent,
    ActividadesSCIANComponent,
    SectoresComponent,
    SubSectoresComponent,
    RamasComponent,
    SubRamasComponent,
    ClaseActividadesComponent,
    AdministracionSectoresComponent,
    DivisionComponent,
    AdministracionDivisionComponent,
    ActividadesSincoComponent,
    PrincipalComponent,
    AdministracionPrincipalComponent,
    SubgrupoComponent,
    AdministracionSubgrupoComponent,
    UnitarioComponent,
    AdministracionUnitarioComponent,
    OcupacionComponent,
    AdministracionOcupacionComponent,
    FormasPagoComponent,
    AdministracionFormasPago,
    BancosSitiComponent,
    AdministracionBancoSitiComponent,
    CuentaBancariaComponent,
    AdminCuentaBComponent,
    AdministracionSubSectoresComponent,
    AdministracionRamasComponent,
    AdministracionSubRamasComponent,
    AdministracionClaseActividadesComponent,
    InversionesComponent,
    AdministracionInversionesComponent,
    AvisosComponent,
    AdministracionAvisosComponent,
    InpcComponent,
    AdministracionInpcComponent,
    BovedaComponent,
    AdminBovedaComponent,
    IsrComponent,
    AdministracionIsrComponent,
    CajasComponent,
    AdministracionCajasComponent,
    TipoPlazoComponent,
    AdministracionTipoPlazoComponent,
    DomiciliosComponent,
    AdministracionDomiciliosComponent,
    TipoDocumentoComponent,
    AdminTipoDocumentoComponent,
    MovimientosCajaComponent,
    AdministracionProveedorComponent,
    ProveedorComponent,
    AsignaDocumentoComponent,
    AdminAsignaDocumentoComponent,
    DocumentoCodificadoComponent,
    AdminDocumentoCodificadoComponent,
    AdminPdfComponent,
    MenusComponent,
    AltaPermisosComponent,
    RangoInversionesComponent,
    AdministracionRangoInversionesComponent,
    MovimientosCajaComponent,
    EmpresaComponent,
    //AdminMapaComponent,
    ClientesAComponent,
    DepreciacionesComponent,
    AdministracionDepreciacionesComponent,
    CreditosComponent,
    SujetosComponent,
    AdministracionSujetosComponent,
    GruposComponent,
    AdminGrupoComponent,
    CargosComponent,
    CalificacionCarteraComponent,
    AvisosClientesComponent,
    AdminAvisosClientesComponent,
    NotGloClientesComponent,
    AdminNotGloClientesComponent,
    BloqueoClientesComponent,
    AdminBloqueoClientesComponent,
    CuentasContablesAnexo24Component,
    IndicehhComponent,
    AdministracionIndicehhComponent,
    AdministracionCargosComponent,
    PolizasComponent,
    AdministracionPolizasComponent,
    CreditoRelacionadoComponent,
    AdministracionCredRelComponent,
    AdministracionCredRelComponent,
    MovimientosBancariosComponent,
    BuscarClientesComponent,
    BuscarEmpresaComponent,
    DocumentosModalComponent,
    DirecFuncionariosComponent,
    AdminBajaComponent,
    AdministracionCredRelComponent,
    AdminCreditosComponent,
    AdminUsuariosComponent,
    AdministracionRolesComponent,
    EntidadesComponent,
    SujetosModalComponent,
    CierrePeriodoComponent,
    SucursalesSocioComponent,
    BuscarMovimientoComponent,
    CajaMovimientosComponent,
    AdministracionMovimientoComponent,
    ClientesMComponent,
    EstatusCliComponent,
    AdministracionEstatusCliComponent,
    ConciliacionBancariaComponent,
    CuentaContableModalComponent,
    MovCuentaCont,
    MonitorCuentasComponent,
    MHipotecasCreditosComponent,
    MPrendasCreditosComponent,
    MSolicitudCreditosComponent,
    TresSesentaFisicosComponent,
    TipoFondosComponent,
    AdministracionFondos,
    CajasSucursalComponent,
    AdminCajasSucursalComponent,
    ModalCajaMovComponent,
    ComiteComponent,
    ModalCerrarCajaComponent,
    CortesCajaComponent,
    AmortizacionComponent,
    GestionSolicitudesCredComponent,
    CorreoComponent,
    AdminCorreoComponent,
    SMSComponent,
    AdminSMSComponent,
    UmaComponent,
    AdministracionUmaComponent,
    AdminAvalesComponent,
    MCargaDias,
    MCargaCuentas,
    SolicitudesAprobadas,
    AmortizacionesComponent,
    LiquidaCreditosComponent,
    LogoComponent,
    InversionComponent,
    CotizadorInversionComponent,
    HistoricoMovComponent,
    MatrizRiesgosComponent,
    ModalRiesgosComponent,
    RiesgosClienteComponent,
    BloqueoClienteComponent,
    CotizadorInversionComponent,
    JsonParsePipe,
    AdminBloqueoClienteComponent,
    listaModalComponent,
    OpRelevanteComponent,
    ReportePldComponent,
    CrudInversionComponent,
    OpintPreocupante,
    AdminOpintPreocupanteComponent,
    PepComponent,
    AdminPepsComponent,
    OpRelevanteComponent,
    RiesgoComunComponent,
    CMAnexoComponent,
    PbaComponent,
    ModalPbaComponent,
    OpinusualComponent,
    RiesgoCreditoComponent,
    SolicitudActualizacionComponent,
    ModalSolicitudComponent,
    SolicitudModalComponent,
    HistorialCrediticioComponent,
    AdminConveniosComponent,
    ModalConveniosComponent,
    ClaCarteraComponent,
    HistorialCobranzaComponet,
    AdministracionAvisosMoratorioComponent,
    ExtraclimoCitaroriosComponent,
    ClientesMorososComponent,
    AdminClienteCitatoriosComponent,
    CitatoriosComponent,
    ClaCarteraComponent,
    DirecFuncFamiliaresComponent,
    PersonasRelacionadasComponent,

    MovimientoPolizasComponent,
    ModalSolicitudSucursalComponent,
    DevInversionesComponent,
    DevAhorroComponent,
    MayorGeneralComponent,
    CapitalNetoComponent,
    AdminCapNetoComponent,
    CierreDiaComponent,
    ModalCfdiComponent,
    ModalComprobanteComponent,
    MayorGeneralComponent,
    BalanceComponent,
    EstadoResultadosComponent,
    OrigenAplicacionComponent,
    ModalInversionesComponent,
    BalanzaComponent,
    CuentaContableXmlComponent,
    CambioCapitalComponent,
    PolizasAuxiliaresSatComponent,
    CambioCapitalComponent,
    ReportrazonesFinComponent,
    AdminCarteraComponent,
    ModalCredRenovadoComponent,
    DevCreditosComponent,
    AdminCreditosGrupalesComponent,
    ModalPerfilComponent,

    ArchivoCarteraComponent,
    NotificacionesCajaModalComponent,
    DevCreditosComponent,
    AdminCreditosGrupalesComponent,
    PrecierreComponent,
    FondeoBancarioComponent,
    VolatilidadComponent,
    FraccionParamComponent,
    ModalFraccionParametros,
    ProdcutosServiciosComponent,
    AdminProductoServicioComponent,
    RecargaTelefonicaComponent,
    AdminRecargaTelefonicaComponent,
    PuntoDeVentaComponent,
    PolizaInversionComponent,
    RiesgoMercadoComponent,
    RiesgoLiquidezComponent,
    ModalPldComponent,
    FondoCajasComponent,
    GastosComponent,
    AdministracionGastosComponent,
    DetalleCierreComponent,
    ModalTrBovedaComponent,
    ModalGastosCajaComponent,
    NominaComponent,
    ModalServicioComponent,
    EmpresasNominaComponent,
    PlantillaComponent,
    EmpleadosComponent,
    ModalEmpleadoComponent,
    DispersionNominaComponent,
    ArchivoComponent,
    ClabesClienteComponent,
    SpeiComponent,
    BeneficiariosSPEIComponent,
    SpeiOutComponent,
    SpeiInComponent,
    AdministrarTipoActivosComponent,
    TipoActivosComponent,
    TipoBajasComponent,
    ModalTipoBajasComponent,
    ActivoDepreciableComponent,
    ModalDepreciableComponent,
    ModalIncpComponent,
    ActivoNoDepreciableComponent,
    ModalNoDepreciableComponent,
    DetalleActivoComponent,
    ModalDetalleActivoComponent,
    ActivoBajaComponent,
    ModalActivoBajaComponent,
    CuentasBajasComponent,
    ModalCuentaActivoBajaComponent,
    ReporteActivosComponent,
    TAEComponent,
    ServiciosMTCComponent,
    ReferenciaMTCComponent,
    ParametrosComponent,
    ModalParametrosComponent,
    EstablecimientoMTCenterComponent,
    ModalEstablecimientoComponent,
    RecargasMTCenterComponent,
    ServiciosMTCenterComponent



  ]
})

export class AdminLayoutModule { }