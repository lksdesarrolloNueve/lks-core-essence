export default class Utils {

    static listaMeses = [];

       /**
     * Metodo que agrega el formato a una lista de meses
     */
    public static formatoMeses(meses) : any {
        this.listaMeses = [];

            for (let mes of meses) {
    
                switch (mes) {
                    case 1:
                        this.listaMeses.push({ mes: 1, nombre: 'Enero' });
                        break;
                    case 2:
                        this.listaMeses.push({ mes: 2, nombre: 'Febrero' });
                        break;
                    case 3:
                        this.listaMeses.push({ mes: 3, nombre: 'Marzo' });
                        break;
                    case 4:
                        this.listaMeses.push({ mes: 4, nombre: 'Abril' });
                        break;
                    case 5:
                        this.listaMeses.push({ mes: 5, nombre: 'Mayo' });
                        break;
                    case 6:
                        this.listaMeses.push({ mes: 6, nombre: 'Junio' });
                        break;
                    case 7:
                        this.listaMeses.push({ mes: 7, nombre: 'Julio' });
                        break;
                    case 8:
                        this.listaMeses.push({ mes: 8, nombre: 'Agosto' });
                        break;
                    case 9:
                        this.listaMeses.push({ mes: 9, nombre: 'Septiembre' });
                        break;
                    case 10:
                        this.listaMeses.push({ mes: 10, nombre: 'Octubre' });
                        break;
                    case 11:
                        this.listaMeses.push({ mes: 11, nombre: 'Noviembre' });
                        break;
                    case 12:
                        this.listaMeses.push({ mes: 12, nombre: 'Diciembre' });
                        break;
    
                }
    
            }

            return this.listaMeses;
    
        }


          /**
     * 
     * @param val Check for null Object
     */
    public static isObject(val) {
        if (val === null) { 
            return false; 
        }
        return ((typeof val === 'function') || (typeof val === 'object'));
    }

    /**
     * Parse JSON string
     */
    public static parseJSON(data) {
        data = data || "";
        return JSON.parse(data);
    }

    /**
     * Check empty object
     */
    public static checkEmptyObject(obj) {
        for (var key in obj) {
            if (obj.hasOwnProperty(key))
                return false;
        }
        return true;
    }

    /**
     * Check if the string is empty or null
     */
    public static checkNotNullAndNotEmpty(data) {
        if (data !== null && data !== '') {
            return true;
        }
        return false;
    }

    /**
      * Check if the variable is undefined
      */
    public static isUndefined(data) {

        if (data === "undefined") {
            return true;
        }
        return false;
    }


    /**
      * Searches for a given substring
      */
    public static contains(str, substring, fromIndex) {
        return str.indexOf(substring, fromIndex) !== -1;
    }

    /**
      * "Safer" String.toLowerCase()
      */
     public static lowerCase(str) {
        return str.toLowerCase();
    }

    /**
     * "Safer" String.toUpperCase()
     */
    public static upperCase(str) {
        return str.toUpperCase();
    }

    /**
     * UPPERCASE first char of each word.
     */
    public static properCase(str) {
        return this.lowerCase(str).replace(/^\w|\s\w/g, this.upperCase);
    }

    /**
     * UPPERCASE first char of each sentence and lowercase other chars.
     */
    public static sentenceCase(str) {
        // Replace first char of each sentence (new line or after '.\s+') to
        // UPPERCASE
        return this.lowerCase(str).replace(/(^\w)|\.\s+(\w)/gm, this.upperCase);
    }

}