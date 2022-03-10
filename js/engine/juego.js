var gd = gd || {};

gd.juego = {
    engendrar: function(nombre, params){
        var entidad = new gd.plantilla[nombre];
        entidad.id = gd.principal.id.get(); 

        gd.principal.almacen.all.push(entidad); 
        switch(entidad.type){
            case 'a':
                gd.principal.almacen.a.push(entidad); 
                break; 
            case 'b':
                gd.principal.almacen.b.push(entidad); 
                break;
            default: 
            break; 
        }
        if(arguments.length > 1 && entidad.init){
            var args = [].slice.call(arguments, 1); 
            entidad.init.apply(entidad, args); 
        }else if(entidad.init){
            entidad.init();
        }
    },

    fronteras: function(obj, top, right, bottom, left, offset){
        if(offset === undefined){
            offset = 0; 
        }
        if(obj.x < -this.tamanio.width - offset){
            return left.call(obj);
        }else if(obj.x > this.tamanio.width + offset){
            return right.call(obj); 
        }else if(obj.y < -this.tamanio.height - offset){
            return bottom.call(obj);
        }else if(obj.y > this.tamanio.height + offset){
            return top.call(obj);        }
    },

    rotate: function(obj){
        var tiempoActual = Date.now();
        if(obj.lastUpdate < tiempoActual){
            var delta = tiempoActual - obj.lastUpdate;
            obj.rotate.angulo +=(30 * delta) / obj.rotate.speed;
        }
        obj.lastUpdate = tiempoActual;
    },
    
    aleatorio: {
        polaridad: function() {
            return Math.random() < 0.5 ? -1 : 1
        },
        numero: function(max, min){
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }
}