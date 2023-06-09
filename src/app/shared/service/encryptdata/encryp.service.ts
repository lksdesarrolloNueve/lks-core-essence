import { Injectable } from "@angular/core";
import { privateKey, publicKey } from '../../../../environments/rsa-keys.config';
import { JSEncrypt } from 'jsencrypt';

@Injectable()
export class EncryptDataService {

    //Declaracion de variables
    cypherText: any = [];
    jsencrypt: any;

    /**
     * Constructor de la clase
     */
    constructor() {
        this.jsencrypt = new JSEncrypt();
    }

    /**
    * Metodo para encriptar datos
    * @param data - Dato a encriptar
    **/
    encriptar(data: string): any {
        this.jsencrypt.setPublicKey(publicKey);
        this.cypherText = this.jsencrypt.encrypt(data);
        return this.cypherText;
    }

    /**
    * Metodo para desencriptar datos
    * @param data - Dato a desencriptar
    **/
    desencriptar(data: any): any {
        this.jsencrypt.setPrivateKey(privateKey);
        return  this.jsencrypt.decrypt(data);
    }


}