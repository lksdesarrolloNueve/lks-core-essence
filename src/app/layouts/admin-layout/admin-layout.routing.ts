import { Routes } from '@angular/router';


//Rutas para CATALOGOS
import { SucursalesComponent } from '../../pages/configuracion/sucursales/sucursales.component';
import { TipoSociosComponent } from '../../pages/configuracion/tipos-socios/tipos-socios.component';
import { NacionalidadesComponent } from '../../pages/configuracion/nacionalidades/nacionanalidades.component';
import { CalidadExtranjeroComponent } from '../../pages/configuracion/calidad-extranjeros/calidad-extranjeros.component';
import { ActividadesPLDComponent } from '../../pages/configuracion/actividades-pld/actividades-pld.component';
import { BancosSatComponent } from '../../pages/configuracion/bancos-sat/bancos-sat.component';
import { ClasificacionCredComponent } from '../../pages/configuracion/clasificacion-cred/clasificacion-cred.component';
import { FinalidadCreditoComponent } from '../../pages/configuracion/finalidades-creditos/finalidades-creditos.component';
import { MonedasSATComponent } from '../../pages/configuracion/monedas-sat/monedas-sat.component';
import { GarantiasComponent } from '../../pages/configuracion/garantias/garantias.component';
import { EstadoCredComponent } from '../../pages/configuracion/estado-cred/estado-cred.component';
import { UdisComponent } from '../../pages/configuracion/udis/udis.component';
import { TipoAmortizacionComponent } from '../../pages/configuracion/tipos-amortizaciones/tipos-amortizaciones.component';
import { ServidoresComponent } from '../../pages/configuracion/servidores/servidores.component';
import { CiudadesComponent } from '../../pages/configuracion/ciudades/ciudades.component';
import { EstadosComponent } from '../../pages/configuracion/estados/estados.component';
import { DiaInhabilComponent } from '../../pages/configuracion/dia-inhabil/dia-inhabil.component';
import { ActividadesVulnerablesComponent } from '../../pages/configuracion/actividades-vulnerables/actividades-vul.component';
import { LocalidadesComponent } from '../../pages/configuracion/localidades/localidades.component';
import { CuentasContablesComponent } from '../../pages/configuracion/cuentas-contables/cuentas-contables.component';
import { ColoniaComponent } from '../../pages/configuracion/colonias/colonias.component';
import { ActividadesSCIANComponent } from '../../pages/configuracion/actividades-scian/actividades-scian.component';
import { ActividadesSincoComponent } from '../../pages/configuracion/actividades-sinco/actividades-sinco.component';
import { CategoriaGeneralesComponent } from '../../pages/configuracion/categorias-generales/categoria-general.component';
import { FormasPagoComponent } from '../../pages/configuracion/formas-pago/formas-pago.component';
import { BancosSitiComponent } from '../../pages/configuracion/bancos-siti/bancos-siti.component';
import { CuentaBancariaComponent } from '../../pages/configuracion/cuentas-bancarias/cuentas-bancarias.component';
import { InversionesComponent } from '../../pages/configuracion/inversiones/inversiones.component';
import { AvisosComponent } from '../../pages/configuracion/avisos/avisos.component';
import { InpcComponent } from '../../pages/configuracion/inpc/inpc.component';
import { BovedaComponent } from '../../pages/configuracion/bovedas/bovedas.component';
import { IsrComponent } from '../../pages/configuracion/isr/isr.component';
import { CajasComponent } from '../../pages/configuracion/cajas/cajas.component';
import { TipoPlazoComponent } from '../../pages/configuracion/tipo-plazo/tipo-plazo.component';
import { TipoDocumentoComponent } from '../../pages/digitalizacion/tipo-documento/tipo-documento.component';
import { AsignaDocumentoComponent } from '../../pages/digitalizacion/asigna-documento/asigna-documento.component';
import { DocumentoCodificadoComponent } from '../../pages/digitalizacion/documento-codificado/documento-codificado.component';
import { MenusComponent } from '../../pages/configuracion/rol-menu/menus/menus.component';
import { AltaPermisosComponent } from '../../pages/configuracion/rol-menu/alta-permisos/alta-permisos.component';
import { RangoInversionesComponent } from '../../pages/configuracion/rango-inversiones/rango-inversiones.component';
import { MovimientosCajaComponent } from '../../pages/configuracion/movimientos-caja/movimientos-caja.component';
import { ProveedorComponent } from '../../pages/configuracion/proveedores/proveedores.component';
import { DepreciacionesComponent } from '../../pages/configuracion/depreciaciones/depreciaciones.component';
import { CreditosComponent } from '../../pages/configuracion/creditos/creditos.component';
import { CargosComponent } from '../../pages/configuracion/cargos/cargos.component';
import { CalificacionCarteraComponent } from '../../pages/configuracion/calificacion-cartera/calificacion-cartera.component';
import { CuentasContablesAnexo24Component } from '../../pages/configuracion/cuentas-cont-anexo24/cuentas-cont-anexo24.component';
import { IndicehhComponent } from '../../pages/configuracion/indicehh/indice-hh.component';
import { CreditoRelacionadoComponent } from '../../pages/configuracion/credito-relacionado/credito-relacionado.component';
import { AdminUsuariosComponent } from '../../pages/configuracion/rol-menu/admin-usuarios/admin-usuarios.component';
import { EntidadesComponent } from '../../pages/configuracion/entidades/entidades.component';
import { DirecFuncionariosComponent } from '../../pages/configuracion/direc-funcionarios/direc-funcionarios.component';
import { CierrePeriodoComponent } from '../../pages/contabilidad/cierre-mensual/cierre-periodo/cierre-periodo.component';
import { AmortizacionComponent } from '../../pages/configuracion/amortizacion/amortizacion.component';
import { CorreoComponent } from '../../pages/configuracion/correos/correo.component';
import { SMSComponent } from '../../pages/configuracion/sms/sms.component';
import { UmaComponent } from '../../pages/configuracion/valor-uma/valor-uma.component';
import { LogoComponent } from '../../pages/configuracion/logo/logo.component';
import { DirecFuncFamiliaresComponent } from '../../pages/configuracion/direc-funcionarios-familiares/direc-funcionarios-familiares.component';
import { FondeoBancarioComponent } from '../../pages/configuracion/fondeo-bancario/fondeo-bancario.component';
import { VolatilidadComponent } from '../../pages/configuracion/volatilidad/volatilidad.component';
import { ProdcutosServiciosComponent } from '../../pages/configuracion/prodcutos-servicios/productos-servicios.component';
import { AdminProductoServicioComponent } from '../../pages/configuracion/prodcutos-servicios/admin-producto-servicio/admin-producto-servicio.component';
import { RecargaTelefonicaComponent } from '../../pages/configuracion/recargas-telefonicas/recarga-telefonica.component';
import { AdminRecargaTelefonicaComponent } from '../../pages/configuracion/recargas-telefonicas/admin-recarga-telefonica/admin-recarga-telefonica.component';
import { GastosComponent } from '../../pages/configuracion/gastos/gastos.component';
import { TipoActivosComponent } from '../../pages/configuracion/tipo-activos/activos/tipo-activos.component';
import { TipoBajasComponent } from '../../pages/configuracion/tipo-activos/bajas/tipo-bajas.component';
import { ParametrosComponent } from '../../pages/configuracion/tipo-activos/parametros/parametros.component';
import { EstablecimientoMTCenterComponent } from '../../pages/configuracion/establecimientos-mtcenter/establecimiento-mtcenter.component';
import { RecargasMTCenterComponent } from '../../pages/mtcenter/bitacora-recargas/recargas.component';
import { ServiciosMTCenterComponent } from '../../pages/mtcenter/bitacora-servicios/servicios.component';



//RUTAS PARA CLIENTES
import { DomiciliosComponent } from '../../pages/clientes/domicilios/domicilios.component';
import { ClientesAComponent } from '../../pages/clientes/administracion-clientes/clientes.component';
import { SujetosComponent } from '../../pages/clientes/administracion-sujetos/sujetos.component';
import { AvisosClientesComponent } from '../../pages/clientes/notificaciones/notificaciones-clientes/avisos-clientes/avisos-clientes.component';
import { NotGloClientesComponent } from '../../pages/clientes/notificaciones/notificaciones-globales/noti-globales-cli.component';
import { BloqueoClientesComponent } from '../../pages/clientes/notificaciones/not-bloqueo-clientes/bloqueo-clientes.component'
import { GruposComponent } from '../../pages/clientes/grupos/grupos.component';
import { EmpresaComponent } from '../../pages/clientes/empresa/empresa.component';
import { ClientesMComponent } from '../../pages/clientes/administracion-clientes/clientes-morales.component';
import { EstatusCliComponent } from '../../pages/clientes/estatus-clientes/estatus-clientes.component';
import { TresSesentaFisicosComponent } from '../../pages/clientes/360-fisicos/tres-sesenta-fisicos.component';
import { BloqueoClienteComponent } from '../../pages/clientes/bloqueos-cliente/bloqueo-cliente.component';
import { SolicitudActualizacionComponent } from '../../pages/clientes/solicitudes/solicitud-actualizacion.component';
import { ClabesClienteComponent } from '../../pages/clientes/clabes-cliente/clabes-cliente.component';



//RUTAS PARA CRÉDITOS
import { AdminCreditosComponent } from '../../pages/creditos/admin-creditos/admin-creditos.component';
import { ComiteComponent } from '../../pages/configuracion/comite-credito/comite.component';
import { GestionSolicitudesCredComponent } from '../../pages/creditos/solicitudes/solicitudes.component';
import { SolicitudesAprobadas } from '../../pages/creditos/solicitudes/solicitudes-aprobadas/solicitudes-aprobadas.component';
import { AdminCreditosGrupalesComponent } from '../../pages/creditos/admin-grupales/admin-grupales.component';


//RUTAS PARA CONTABILIDAD
import { PolizasComponent } from '../../pages/contabilidad/polizas/polizas.component';
import { MovimientoPolizasComponent } from '../../pages/contabilidad/movimientos/movimientoPoliza.component';
import { DevInversionesComponent } from '../../pages/contabilidad/cierre-mensual/dev-inversiones/dev-inversiones.component';
import { DevAhorroComponent } from '../../pages/contabilidad/cierre-mensual/dev-ahorro/dev-ahorro.component';
import { CierreDiaComponent } from '../../pages/contabilidad/cierre-diario/cierre-dia/cierre-dia.component';
import { MayorGeneralComponent } from '../../pages/contabilidad/reportes/financieros/mayor-general/mayor-general.component';
import { CapitalNetoComponent } from '../../pages/contabilidad/cierre-mensual/capital-neto/capital-neto.component'
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
import { ActivoNoDepreciableComponent } from '../../pages/contabilidad/activos/no-depreciable/no-depreciable.component';
import { DetalleActivoComponent } from '../../pages/contabilidad/activos/detalle/detalle-activo.component';
import { ActivoBajaComponent } from '../../pages/contabilidad/activos/baja/activo-baja.component';
import { CuentasBajasComponent } from '../../pages/configuracion/tipo-activos/cuenta-bajas/cuenta-bajas.component';
import { ReporteActivosComponent } from '../../pages/contabilidad/activos/reportes/reporte-activos.component';



//RUTAS PARA TESORERIA
import { MovimientosBancariosComponent } from '../../pages/tesoreria/movimientos-bancarios/movimientos-bancarios.component';
import { ConciliacionBancariaComponent } from '../../pages/tesoreria/conciliacion-bancaria/conciliacion-bancaria.component';
import { MonitorCuentasComponent } from '../../pages/tesoreria/monitor-cuentas/monitor-cuentas.component';

//RUTAS PARA CAJAS
import { CajaMovimientosComponent } from '../../pages/cajas/caja-movimientos/caja-movimientos.component';
import { CajasSucursalComponent } from '../../pages/cajas/cajas-sucursal/cajas-sucursal.component';
import { CortesCajaComponent } from '../../pages/cajas/cortes-caja/cortes-caja.component';
import { PuntoDeVentaComponent } from '../../pages/cajas/punto-de-venta/punto-de-venta.component';
import { FondoCajasComponent } from '../../pages/cajas/fondo-cajas/fondo-cajas.component';


//RUTAS para Inversiones
import { InversionComponent } from '../../pages/inversiones/inversion/inversion.component';
import { CotizadorInversionComponent } from '../../pages/inversiones/cotizador/cotizador-inversion.component';

//RUTAS PARA PLD
import { HistoricoMovComponent } from '../../pages/pld/historico-movimientos/historico-movimientos.components';
import { OpintPreocupante } from '../../pages/pld/op-int-preocupante/opint-preocupante.component';
import { PepComponent } from '../../pages/configuracion/peps/peps.component';
import { AdminPepsComponent } from '../../pages/configuracion/peps/modal-peps/admin-peps.component';
import { MatrizRiesgosComponent } from '../../pages/pld/matriz-riesgos/matriz-riesgos.component';
import { RiesgosClienteComponent } from '../../pages/pld/riesgos-cliente/riesgos-cliente.component';
import { OpinusualComponent } from '../../pages/pld/op-inusual/op-inusual.component';

import { OpRelevanteComponent } from '../../pages/pld/op-relevante/op-relevante.component';
import { ReportePldComponent } from '../../pages/pld/reportes/reporte-pld.component';

import { AuthGuard } from '../../auth/auth.guard';
import { TipoFondosComponent } from '../../pages/configuracion/tipo-fondo/tipo-fondo.component';
import { RiesgoComunComponent } from '../../pages/riesgos/riesgo-comun/riesgo-comun.component';
import { PbaComponent } from '../../pages/configuracion/pba/pba.component';
import { RiesgoCreditoComponent } from '../../pages/riesgos/riesgos-credito/riesgo-credito.component';
import { PersonasRelacionadasComponent } from '../../pages/riesgos/personas-relacionadas/personas-relacionadas.component';
import { RiesgoMercadoComponent } from '../../pages/riesgos/riesgo-mercado/riesgo-mercado.component';
import { RiesgoLiquidezComponent } from '../../pages/riesgos/riesgo-liquidez/riesgo-liquidez.component';


//Rutas para Cobranza
//Componentes para cobranza
import { HistorialCrediticioComponent } from '../../pages/cobranza/historial-crediticio/historial-crediticio.component';
import { AdminConveniosComponent } from '../../pages/cobranza/administracion-convenios/admin-convenios.component';


import { AdministracionAvisosMoratorioComponent } from '../../pages/cobranza/administracion-avisos/administracion-avisos-moratorio.component';
import { ExtraclimoCitaroriosComponent } from '../../pages/cobranza/historial-crediticio/extrajudicial/extra-climo-citatorios.component';
import { ClaCarteraComponent } from '../../pages/cobranza/clasificacion-cartera/cla-cartera.component';
import { HistorialCobranzaComponet } from '../../pages/cobranza/historial-cobranza/historial-cobranza.component';
import { FraccionParamComponent } from '../../pages/configuracion/fraccion-param/fraccion-param.component';

//Nominas
import { NominaComponent } from '../../pages/nominas/gestion-empresas/nominas.component';
import { DispersionNominaComponent } from '../../pages/nominas/dispersion-nomina/dispersion-nomina.component';
import { ArchivoComponent } from '../../pages/nominas/archivo-nomina/archivo.component';

//SPEI
import { SpeiOutComponent } from '../../pages/spei/spei-out/spei-out.component';
import { SpeiInComponent } from '../../pages/spei/spei-in/spei-in.component';
import { SaldoServiciosComponent } from '../../pages/mtcenter/saldos/saldo-servicios/saldo-servicios.component';
import { SaldoTaeComponent } from '../../pages/mtcenter/saldos/saldo-tae/saldo-tae.component';

//BANCA 
import { FiltroBEComponent } from '../../pages/servicio-be/filtro-cliente-be/filtro-cliente-be.component';
import { BajaClienteComponent } from '../../pages/servicio-be/baja-cliente/baja-cliente.component';
import { AltaClienteComponent } from '../../pages/servicio-be/alta-cliente/alta-cliente.component';
import { ClienteBEComponent } from '../../pages/servicio-be/cliente-be/cliente-be.component';

//ONBOARDING
import { SolicitudesOnboardingComponent } from '../../pages/onboarding/solicitudes/solicitudes.component';

export const AdminLayoutRoutes: Routes = [
  { path: 'sol-onboarding', component: SolicitudesOnboardingComponent, canActivate: [AuthGuard] },
  { path: 'be-alta-cliente', component: AltaClienteComponent, canActivate: [AuthGuard] },
  { path: 'be-baja-cliente', component: BajaClienteComponent, canActivate: [AuthGuard] },
  { path: 'filtro-cliente-be', component: FiltroBEComponent, canActivate: [AuthGuard] },
  { path: 'be-clientes', component: ClienteBEComponent, canActivate: [AuthGuard] },
  { path: 'saldo-servicios', component: SaldoServiciosComponent, canActivate: [AuthGuard] },
  { path: 'saldo-tae', component: SaldoTaeComponent, canActivate: [AuthGuard] },
  { path: 'sucursales', component: SucursalesComponent, canActivate: [AuthGuard] },
  { path: 'tiposocio', component: TipoSociosComponent, canActivate: [AuthGuard] },
  { path: 'nacionalidades', component: NacionalidadesComponent, canActivate: [AuthGuard] },
  { path: 'calidadextranjero', component: CalidadExtranjeroComponent, canActivate: [AuthGuard] },
  { path: 'actividadesPLD', component: ActividadesPLDComponent, canActivate: [AuthGuard] },
  { path: 'bancosat', component: BancosSatComponent, canActivate: [AuthGuard] },
  { path: 'clasificacionCred', component: ClasificacionCredComponent, canActivate: [AuthGuard] },
  { path: 'finalidadcred', component: FinalidadCreditoComponent, canActivate: [AuthGuard] },
  { path: 'monedassat', component: MonedasSATComponent, canActivate: [AuthGuard] },
  { path: 'garantias', component: GarantiasComponent, canActivate: [AuthGuard] },
  { path: 'estadoCred', component: EstadoCredComponent, canActivate: [AuthGuard] },
  { path: 'categorias', component: CategoriaGeneralesComponent, canActivate: [AuthGuard] },
  { path: 'monedassat', component: MonedasSATComponent, canActivate: [AuthGuard] },
  { path: 'garantias', component: GarantiasComponent, canActivate: [AuthGuard] },
  { path: 'estadoCred', component: EstadoCredComponent, canActivate: [AuthGuard] },
  { path: 'udis', component: UdisComponent, canActivate: [AuthGuard] },
  { path: 'tipoAmort', component: TipoAmortizacionComponent, canActivate: [AuthGuard] },
  { path: 'servidores', component: ServidoresComponent, canActivate: [AuthGuard] },
  { path: 'diasinhabiles', component: DiaInhabilComponent, canActivate: [AuthGuard] },
  { path: "localidades", component: LocalidadesComponent, canActivate: [AuthGuard] },
  { path: 'ciudades', component: CiudadesComponent, canActivate: [AuthGuard] },
  { path: 'estados', component: EstadosComponent, canActivate: [AuthGuard] },
  { path: 'diasinhabiles', component: DiaInhabilComponent, canActivate: [AuthGuard] },
  { path: 'actividadesVul', component: ActividadesVulnerablesComponent, canActivate: [AuthGuard] },
  { path: 'cuentas-contables', component: CuentasContablesComponent, canActivate: [AuthGuard] },
  { path: 'colonias', component: ColoniaComponent, canActivate: [AuthGuard] },
  { path: 'actividades-scian', component: ActividadesSCIANComponent, canActivate: [AuthGuard] },
  { path: 'actividades-sinco', component: ActividadesSincoComponent, canActivate: [AuthGuard] },
  { path: 'formas-pagos', component: FormasPagoComponent, canActivate: [AuthGuard] },
  { path: 'bancositi', component: BancosSitiComponent, canActivate: [AuthGuard] },
  { path: 'cuentas-bancarias', component: CuentaBancariaComponent, canActivate: [AuthGuard] },
  { path: 'bancositi', component: BancosSitiComponent, canActivate: [AuthGuard] },
  { path: 'inversiones', component: InversionesComponent, canActivate: [AuthGuard] },
  { path: 'bancositi', component: BancosSitiComponent, canActivate: [AuthGuard] },
  { path: 'avisos', component: AvisosComponent, canActivate: [AuthGuard] },
  { path: 'inpc', component: InpcComponent, canActivate: [AuthGuard] },
  { path: 'bovedas', component: BovedaComponent, canActivate: [AuthGuard] },
  { path: 'isr', component: IsrComponent, canActivate: [AuthGuard] },
  { path: 'cajas', component: CajasComponent, canActivate: [AuthGuard] },
  { path: 'tipo-plazo', component: TipoPlazoComponent, canActivate: [AuthGuard] },
  { path: 'movimientos-caja', component: MovimientosCajaComponent, canActivate: [AuthGuard] },
  { path: 'domicilios', component: DomiciliosComponent, canActivate: [AuthGuard] },
  { path: 'tipo-documento', component: TipoDocumentoComponent, canActivate: [AuthGuard] },
  { path: 'menus', component: MenusComponent, canActivate: [AuthGuard] },
  { path: 'permisos', component: AltaPermisosComponent, canActivate: [AuthGuard] },
  { path: 'rango-inversiones', component: RangoInversionesComponent, canActivate: [AuthGuard] },
  { path: 'asigna-documento', component: AsignaDocumentoComponent, canActivate: [AuthGuard] },
  { path: 'documento-codificado', component: DocumentoCodificadoComponent, canActivate: [AuthGuard] },
  { path: 'catalogo-creditos', component: CreditosComponent, canActivate: [AuthGuard] },
  { path: 'clientesA', component: ClientesAComponent, canActivate: [AuthGuard] },
  { path: 'clientesM', component: ClientesMComponent, canActivate: [AuthGuard] },
  { path: 'depreciaciones', component: DepreciacionesComponent, canActivate: [AuthGuard] },
  { path: 'sujetos', component: SujetosComponent, canActivate: [AuthGuard] },
  { path: 'proveedores', component: ProveedorComponent, canActivate: [AuthGuard] },
  { path: 'calificacion-cartera', component: CalificacionCarteraComponent, canActivate: [AuthGuard] },
  { path: 'proveedores', component: ProveedorComponent, canActivate: [AuthGuard] },
  { path: 'calificacion-cartera', component: CalificacionCarteraComponent, canActivate: [AuthGuard] },
  { path: 'avisos-clientes', component: AvisosClientesComponent, canActivate: [AuthGuard] },
  { path: 'noti-globales', component: NotGloClientesComponent, canActivate: [AuthGuard] },
  { path: 'bloqueo-cliente', component: BloqueoClientesComponent, canActivate: [AuthGuard] },
  { path: 'grupos', component: GruposComponent, canActivate: [AuthGuard] },
  { path: 'proveedores', component: ProveedorComponent, canActivate: [AuthGuard] },
  { path: 'calificacion-cartera', component: CalificacionCarteraComponent, canActivate: [AuthGuard] },
  { path: 'cuentas-cont-anexo24', component: CuentasContablesAnexo24Component, canActivate: [AuthGuard] },
  { path: 'indiceshh', component: IndicehhComponent },
  { path: 'calificacion-cartera', component: CalificacionCarteraComponent },
  { path: 'cargos', component: CargosComponent },
  { path: 'polizas', component: PolizasComponent },

  { path: 'calificacion-cartera', component: CalificacionCarteraComponent, canActivate: [AuthGuard] },
  { path: 'cargos', component: CargosComponent, canActivate: [AuthGuard] },
  { path: 'creditorelacionado', component: CreditoRelacionadoComponent, canActivate: [AuthGuard] },
  { path: 'conciliacionbancaria', component: ConciliacionBancariaComponent, canActivate: [AuthGuard] },
  { path: 'admin-creditos', component: AdminCreditosComponent, canActivate: [AuthGuard] },
  { path: 'admin-usuarios', component: AdminUsuariosComponent, canActivate: [AuthGuard] },
  { path: 'entidades', component: EntidadesComponent, canActivate: [AuthGuard] },
  { path: 'admin-bancarias', component: MovimientosBancariosComponent, canActivate: [AuthGuard] },
  { path: 'direc-funcionarios', component: DirecFuncionariosComponent, canActivate: [AuthGuard] },
  { path: 'direct-func-fam', component: DirecFuncFamiliaresComponent, canActivate: [AuthGuard] },
  { path: 'admin-bancarias', component: MovimientosBancariosComponent, canActivate: [AuthGuard] },
  { path: 'empresa', component: EmpresaComponent, canActivate: [AuthGuard] },
  { path: 'admin-bancarias', component: MovimientosBancariosComponent, canActivate: [AuthGuard] },
  { path: 'periodo', component: CierrePeriodoComponent, canActivate: [AuthGuard] },
  { path: 'estatus-clientes', component: EstatusCliComponent, canActivate: [AuthGuard] },
  { path: 'monitor-cuentas', component: MonitorCuentasComponent, canActivate: [AuthGuard] },
  { path: 'tres-sesenta-fisicos', component: TresSesentaFisicosComponent, canActivate: [AuthGuard] },
  { path: 'tipo-fondos', component: TipoFondosComponent, canActivate: [AuthGuard] },

  { path: 'caja-movimientos', component: CajaMovimientosComponent },
  { path: 'cajas-sucursal', component: CajasSucursalComponent, canActivate: [AuthGuard] },
  { path: 'cortes-cajas', component: CortesCajaComponent, canActivate: [AuthGuard] },
  { path: 'puntoVenta', component: PuntoDeVentaComponent, canActivate: [AuthGuard] },
  { path: 'fondo-caja', component: FondoCajasComponent, canActivate: [AuthGuard] },




  //{ path: 'tres-sesenta-fisicos', component: TresSesentaFisicosComponent , canActivate: [AuthGuard]},
  { path: 'tipo-fondos', component: TipoFondosComponent, canActivate: [AuthGuard] },
  { path: 'comite', component: ComiteComponent, canActivate: [AuthGuard] },
  { path: 'correos', component: CorreoComponent, canActivate: [AuthGuard] },
  { path: 'sms', component: SMSComponent, canActivate: [AuthGuard] },


  { path: 'comite', component: ComiteComponent, canActivate: [AuthGuard] },
  { path: 'amortizacion', component: AmortizacionComponent, canActivate: [AuthGuard] },
  { path: 'solicitudes', component: GestionSolicitudesCredComponent, canActivate: [AuthGuard] },
  { path: 'correos', component: CorreoComponent, canActivate: [AuthGuard] },
  { path: 'sms', component: SMSComponent, canActivate: [AuthGuard] },
  { path: 'valor-uma', component: UmaComponent, canActivate: [AuthGuard] },
  { path: 'solicitudes-aprobadas', component: SolicitudesAprobadas },

  { path: 'galeria', component: LogoComponent, canActivate: [AuthGuard] },

  { path: 'inversion', component: InversionComponent, canActivate: [AuthGuard] },
  { path: 'cot-inversion', component: CotizadorInversionComponent, canActivate: [AuthGuard] },


  { path: 'histor-movimientos', component: HistoricoMovComponent, canActivate: [AuthGuard] },
  { path: 'matriz-riesgos', component: MatrizRiesgosComponent, canActivate: [AuthGuard] },
  { path: 'riesgos-cliente', component: RiesgosClienteComponent, canActivate: [AuthGuard] },


  { path: 'bloqueo-clientes', component: BloqueoClienteComponent, canActivate: [AuthGuard] },
  { path: 'op-relevante', component: OpRelevanteComponent, canActivate: [AuthGuard] },
  { path: 'reporte-pld', component: ReportePldComponent, canActivate: [AuthGuard] },
  { path: 'opint-preocupante', component: OpintPreocupante, canActivate: [AuthGuard] },
  { path: 'pep', component: PepComponent, canActivate: [AuthGuard] },
  { path: 'admin-peps', component: AdminPepsComponent, canActivate: [AuthGuard] },
  { path: 'pba', component: PbaComponent, canActivate: [AuthGuard] },
  { path: 'op-inusual', component: OpinusualComponent, canActivate: [AuthGuard] },

  { path: 'op-relevante', component: OpRelevanteComponent, canActivate: [AuthGuard] },

  { path: 'riesgo-comun', component: RiesgoComunComponent, canActivate: [AuthGuard] },
  { path: 'riesgo-credito', component: RiesgoCreditoComponent, canActivate: [AuthGuard] },
  { path: 'op-relevante', component: OpRelevanteComponent, canActivate: [AuthGuard] },
  { path: 'reporte-pld', component: ReportePldComponent, canActivate: [AuthGuard] },
  { path: 'opint-preocupante', component: OpintPreocupante, canActivate: [AuthGuard] },
  { path: 'pep', component: PepComponent, canActivate: [AuthGuard] },
  { path: 'admin-peps', component: AdminPepsComponent, canActivate: [AuthGuard] },
  { path: 'pba', component: PbaComponent, canActivate: [AuthGuard] },
  { path: 'op-inusual', component: OpinusualComponent, canActivate: [AuthGuard] },
  { path: 'sol-actualizacion', component: SolicitudActualizacionComponent, canActivate: [AuthGuard] },
  { path: 'op-relevante', component: OpRelevanteComponent, canActivate: [AuthGuard] },

  { path: 'riesgo-comun', component: RiesgoComunComponent, canActivate: [AuthGuard] },
  { path: 'personas-relacion', component: PersonasRelacionadasComponent, canActivate: [AuthGuard] },


  { path: 'cobranza', component: HistorialCrediticioComponent, canActivate: [AuthGuard] },
  { path: 'admin-convenios', component: AdminConveniosComponent, canActivate: [AuthGuard] },
  { path: 'cla-cartera', component: ClaCarteraComponent, canActivate: [AuthGuard] },
  { path: 'hist-cob', component: HistorialCobranzaComponet, canActivate: [AuthGuard] },
  { path: 'avisos-moratorio', component: AdministracionAvisosMoratorioComponent, canActivate: [AuthGuard] },
  { path: 'citatorios', component: ExtraclimoCitaroriosComponent, canActivate: [AuthGuard] },
  { path: 'cla-cartera', component: ClaCarteraComponent, canActivate: [AuthGuard] },

  { path: 'cla-cartera', component: ClaCarteraComponent, canActivate: [AuthGuard] },
  { path: 'mov-poliza', component: MovimientoPolizasComponent, canActivate: [AuthGuard] },
  { path: 'dev-inversion', component: DevInversionesComponent, canActivate: [AuthGuard] },
  { path: 'dev-ahorro', component: DevAhorroComponent, canActivate: [AuthGuard] },
  { path: 'mayor-general', component: MayorGeneralComponent, canActivate: [AuthGuard] },
  { path: 'capital-neto', component: CapitalNetoComponent, canActivate: [AuthGuard] },
  { path: 'cierre-dia', component: CierreDiaComponent, canActivate: [AuthGuard] },
  { path: 'mayor-general', component: MayorGeneralComponent, canActivate: [AuthGuard] },
  { path: 'balance', component: BalanceComponent, canActivate: [AuthGuard] },
  { path: 'estados-resultados', component: EstadoResultadosComponent, canActivate: [AuthGuard] },
  { path: 'origen-aplicacion', component: OrigenAplicacionComponent, canActivate: [AuthGuard] },
  { path: 'balanza', component: BalanzaComponent, canActivate: [AuthGuard] },
  { path: 'origen-aplicacion', component: OrigenAplicacionComponent, canActivate: [AuthGuard] },
  { path: 'cuenta-contable-xml', component: CuentaContableXmlComponent, canActivate: [AuthGuard] },
  { path: 'cambio-capital', component: CambioCapitalComponent, canActivate: [AuthGuard] },
  { path: 'polizas-auxiliares', component: PolizasAuxiliaresSatComponent, canActivate: [AuthGuard] },
  { path: 'report-razones-fin', component: ReportrazonesFinComponent, canActivate: [AuthGuard] },
  { path: 'dev-creditos', component: DevCreditosComponent, canActivate: [AuthGuard] },
  { path: 'com-cartera', component: ArchivoCarteraComponent, canActivate: [AuthGuard] },
  { path: 'admin-grupales', component: AdminCreditosGrupalesComponent, canActivate: [AuthGuard] },
  { path: 'precierre', component: PrecierreComponent, canActivate: [AuthGuard] },
  { path: 'fondeo-ban', component: FondeoBancarioComponent, canActivate: [AuthGuard] },
  { path: 'volatilidad', component: VolatilidadComponent, canActivate: [AuthGuard] },
  { path: 'fraccion-param', component: FraccionParamComponent, canActivate: [AuthGuard] },


  { path: 'servicios', component: ProdcutosServiciosComponent, canActivate: [AuthGuard] },
  { path: 'admin-productos', component: AdminProductoServicioComponent, canActivate: [AuthGuard] },
  { path: 'tae', component: RecargaTelefonicaComponent, canActivate: [AuthGuard] },
  { path: 'admin-recarga', component: AdminRecargaTelefonicaComponent, canActivate: [AuthGuard] },
  { path: 'rsgmercado', component: RiesgoMercadoComponent, canActivate: [AuthGuard] },
  { path: 'repor_liqui', component: RiesgoLiquidezComponent, canActivate: [AuthGuard] },

  { path: 'gastos', component: GastosComponent, canActivate: [AuthGuard] },
  { path: 'nominas', component: NominaComponent, canActivate: [AuthGuard] },
  { path: 'disp-nomina', component: DispersionNominaComponent, canActivate: [AuthGuard] },
  { path: 'archivo-nomina', component: ArchivoComponent, canActivate: [AuthGuard] },
  { path: 'clabes-cliente', component: ClabesClienteComponent, canActivate: [AuthGuard] },

  { path: 'spei-out', component: SpeiOutComponent, canActivate: [AuthGuard] },
  { path: 'spei-in', component: SpeiInComponent, canActivate: [AuthGuard] },

  { path: 'tipo-activo', component: TipoActivosComponent, canActivate: [AuthGuard] },
  { path: 'tipo-baja', component: TipoBajasComponent, canActivate: [AuthGuard] },
  { path: 'parametros', component: ParametrosComponent, canActivate: [AuthGuard] },
  { path: 'actdepreciable', component: ActivoDepreciableComponent, canActivate: [AuthGuard] },
  { path: 'actnodepreciable', component: ActivoNoDepreciableComponent, canActivate: [AuthGuard] },
  { path: 'detalleActivo', component: DetalleActivoComponent, canActivate: [AuthGuard] },
  { path: 'bajaActivo', component: ActivoBajaComponent, canActivate: [AuthGuard] },
  { path: 'cuentaBaja', component: CuentasBajasComponent, canActivate: [AuthGuard] },
  { path: 'reporteActivo', component: ReporteActivosComponent, canActivate: [AuthGuard] },
  { path: 'sucMTCenter', component: EstablecimientoMTCenterComponent, canActivate: [AuthGuard] },
  { path: 'serMTCenter', component: ServiciosMTCenterComponent, canActivate: [AuthGuard] },
  { path: 'recMTCenter', component: RecargasMTCenterComponent, canActivate: [AuthGuard] },
];
