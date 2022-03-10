var gd = gd || {}; 

gd.plantilla = {
    Entidad: Class.extend({
        type: 0,
        x: 0,
        y: 0, 
        z:0,
        zoom: -80,
        posicion: function(){
            return [this.x, this.y, this.z, this.zoom];
        },
        width: 0, 
        height: 0, 
        actualizar: function(){},
        colision: function(){
            this.matar();
        },
        matar: function(){
            gd.principal.cementerio.almacen.push(this);
        },
        rotate: {
            angulo: 0, 
            ejes: false
        },
        figura: function(vertices){
            this.shapeStorage = gd.gl.createBuffer(); 
            gd.gl.bindBuffer(gd.gl.ARRAY_BUFFER, this.shapeStorage);
            gd.gl.bufferData(gd.gl.ARRAY_BUFFER, 
                new Float32Array(vertices), gd.gl.STATIC_DRAW);
                this.shapeColumns = 3; 
                this.shapeRows = vertices.length / this.shapeColumns;
        },
        color: function(vertices){
            this.colorStorage = gd.gl.createBuffer(); 
            if(typeof vertices[0] === 'object'){
                var nuevoColor = []; 
                for(var v = 0; v < vertices.length; v++){
                    var colorLinea = vertices[v]; 
                    for(var c = 0; c < 4; c++){
                        nuevoColor = nuevoColor.concat(colorLinea); 
                    }
                }
                vertices = nuevoColor; 
            }
            gd.gl.bindBuffer(gd.gl.ARRAY_BUFFER, this.colorStorage); 
            gd.gl.bufferData(gd.gl.ARRAY_BUFFER, 
                new Float32Array(vertices), gd.gl.STATIC_DRAW); 
            this.colorColumns = 4;
            this.colorRows = vertices.length / this.colorColumns; 
        }, 
        indices: function(vertices){
            this.indicesStorage = gd.gl.createBuffer(); 
            gd.gl.bindBuffer(gd.gl.ELEMENT_ARRAY_BUFFER, 
                this.indicesStorage);
            gd.gl.bufferData(gd.gl.ELEMENT_ARRAY_BUFFER,
                new Uint16Array(vertices), gd.gl.STATIC_DRAW); 
                this.indicesCount = vertices.length;  
        }

    })
}; 