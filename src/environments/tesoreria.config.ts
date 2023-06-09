//Declaracion de variables globales estaticas
export const tesoreria = {

    deposito:  '01',// 01 'Depostio' = 'I'
    retiro:    '02',// 02 'Retiro'   =  'E'
    traspasoO: '50',// 50 'Traspaso a otra cuenta' = 'D'
    retiroCh:  '51',// 51 'Retiro cheque' = 'E'
    traspasoD: '52', // 52 'Traspaso de la cuenta' = 'D'

    //Forma de pago
    formaTrans: '03',//Transferencia
    formaTCred: '13',//Tarjetas de crédito
    formaMElect: '14',//Monederos electrónicos
    formaEfecti: '01',//Efectivo
    formaDinElec: '15',//Dinero electrónico
    formaChequeC: '12',//Cheques de caja

     //clave de pago de creditos (CAT MOVS CAJA)
     pagoCredito: 'PCRE'
    
    }
    
    export default tesoreria;


