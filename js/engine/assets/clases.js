(function(){
    var inicializando = false, pruebaFin = /xyz/.test(function(){xyz;}) ? /\b super\b/ : /.*/;
    this.Class = function(){};
    
    Class.extend = function(prop){
        var _super = this.prototype; 

        inicializando = true; 
        var prototype = new this(); 
        inicializando = false; 

        for(var nombre in prop){
            prototype[nombre] = typeof prop[nombre] == "function" && typeof _super[nombre] == "function" && pruebaFn.test(prop[nombre]) ? (function(nombre, fn){
                return function(){
                    var tmp = this._super; 
                    this._super = _super[nombre];

                    var ret = fn.apply(this, arguments); 
                    this._super = tmp; 
                    return ret;
                }; 
            }) (nombre, prop[nombre]) : prop[nombre]; 
        }
        function Class(){}
        Class.prototype = prototype; 
        Class.prototype.constructor = Class; 
        Class.extend = arguments.callee; 
        return Class;
    };
})();