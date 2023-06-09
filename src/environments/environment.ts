// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
import keycloakConfig from './keycloak.config';
import categorias from './categorias.config';
import generales from './generales.config';
import globales from './globales.config';
import tesoreria from './tesoreria.config';
import contabilidad from './contabilidad.config';
import curp from './curp';


export const environment = {
  production: false,
  config: 'config.json',
  keycloak: keycloakConfig,
  categorias: categorias,
  generales: generales,
  globales: globales,
  tesoreria: tesoreria,
  contabilidad: contabilidad,
  curp:curp,
   firebaseConfig : {
    apiKey: "AIzaSyD33m29DdjTkUdm7ovfonn6_IutI-KmW5M",
    authDomain: "erp-lks.firebaseapp.com",
    projectId: "erp-lks",
    storageBucket: "erp-lks.appspot.com",
    messagingSenderId: "836696846830",
    appId: "1:836696846830:web:8ccfd525b3eb974fbc5eff",
    measurementId: "G-T1T5KBV9EG"
  }
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
