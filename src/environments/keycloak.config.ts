/**
 * Here you can add the configuration related to keycloak
 * So we can use this common config for diffrent environment
 */
 import { KeycloakConfig } from 'keycloak-js';

 const keycloakConfig: KeycloakConfig = {
   //url: 'http://18.189.217.89:8080/auth/',
   //inmtrec
   //url: 'http://192.168.0.2:8380',
   //toliman
   url: 'http://177.242.201.2:8480',
   realm: 'lks-core',
   clientId: 'lks-core-demo'
 };
 
 export default keycloakConfig;