//Declaracion de variables para variables globales estaticas
export const globales = {

//DECLARACIÓN DE VARIABLES GLOBALES PARA Liquidez
mayorPagoLiquidez: 'Mayor al Pago',
igualPagoLiquidez: 'Igual al Pago',
menorPagoLiquidez: 'Menor al Pago',

//DECLARACIÓN DE VARIABLES GLOBALES PARA CAPACIDAD DE PAGO
capPagoMuyAlta: 'Muy Alta',
capPagoAlta: 'Alta',
capPagoMedia: 'Media',
capPagoBaja: 'Baja',
capPagoMuyBaja: 'Muy Baja',

//FILTRAR POR PRINCIPAL
principal: 'Principal',
//Para digitalización
    cveSocioMoral: '04',
    cveSocioFisico: '02', /*para directivos/funcionarios*/
    cveFoto: 'FO01',
    cveFirma: 'FIR01',

//CLAVES MODULO GARANTIAS
cveGarLiq: 'GL',
cveGarHipa: 'HI',
cveGarInversion: 'IN',
cveGarPrenda: 'PD',
cveGarAval:'AV',

//Clasificacion Creditos
cveClaReprogramado: '002', //"RENOVADO"/Reprogramado 
​cveClaNuevo: '001', //Nuevo
cveClaRefinanciado: '003', //Reestructurado/Refinanciado cuando tiene mora

// claves tipo notificacion
cveNotiSocio: '63NS',  // clave para socio
cveNotiEmpleado: '63NE', // clave para empleado

ente: 'cliente',
entes:'clientes',
entesMayuscula: 'Clientes',
enteMayuscula: 'Cliente',


// Timer para el cierre de sesion en caja
cajaTimeout: 3600, //Segundos. 300

// Datos para tener el emisosr de notificasiones

cveSucursal: 'LKS',
tipoNotificacionPld :'63NP',
receptorPLD:'faty23duran@hotmail.com',
//Claves para MTCENTER
cveRecargas:'0006',
cveServicios:'0005',

//Periodos amortizaciones
quincenal: '002',
mensual: '003'

}


export default globales;