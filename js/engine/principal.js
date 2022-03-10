var gd = gd || {}; 

gd.principal = {
    canvas: document.getElementById('canvas'),
    tamanio: function(width, height) {
        this.horizAspect = width / height; 
    },
    id:{
        cuenta: 0,
        get: function(){
            return this.cuenta++;
        }
    },
    almacen: {
        all: [],
        a: [],
        b: []
    },
    cementerio: {
        almacen: [],
        purgar: function(){
            if(this.almacen){
                for(var obj = this.almacen.length; obj--;){
                    this.remover(this.almacen[obj]);
                }
                this.cementerio = []; 
            }
        },
        remover: function(objeto){
            var obj; 
            for(obj=gd.principal.almacen.all.length; obj--;){
                if(gd.principal.almacen.all[obj].id === objeto.id){
                    gd.principal.almacen.all.splice(obj, 1);
                    break;
                }
            }
            switch(objeto.type){
                case 'a': 
                    for(obj = gd.principal.almacen.a.length; obj--;){
                        if(gd.principal.almacen.a[obj].id === objeto.id){
                            gd.principal.almacen.a.splice(obj, 1); 
                            break;
                        }
                    }
                    break;
                case 'b':
                    for(obj = gd.principal.almacen.b.length; obj--;){
                        if(gd.principal.almacen.b[obj].id === objeto.id){
                            gd.principal.almacen.b.splice(obj, 1); 
                            break;
                        }
                    }
                    break;
                default:
                    break; 
            }
            gd.gl.deleteBuffer(objeto.colorStorage); 
            gd.gl.deleteBuffer(objeto.shapeStorage);
        }
    },
    init: function(width, height, ejecuta){
        this.tamanio(width, height); 
        if(!this.canvas.getContext) return alert('Por favor descargue' + 
        ' un navegador que soporte Canvas como Chrome' +
        ' para proceder'); 
        gd.gl = this.canvas.getContext("experimental-webgl");
        if(gd.gl === null || gd.gl === undefined){
            return alert('Su navegador no soporta WebGL. ' +
            ' Descargue Chrome'); 
        }
        gd.gl.clearColor(0.05, 0.05, 0.05, 1.0); 
        gd.gl.enable(gd.gl.DEPTH_TEST); 
        gd.gl.depthFunc(gd.gl.LEQUAL); 
        gd.gl.clear(gd.gl.COLOR_BUFFER_BIT | gd.gl.DEPTH_BUFFER_BIT); 

        this.sombreado.init();
        this.animar(); 
        window.onload = ejecuta; 
    },

    animar: function(){
        requestAnimFrame(gd.principal.animar);
        gd.principal.dibujar(); 
    },

    sombreado: {
        // Shader del dom
        init: function(){
            this.fragments = this.get('shader-fragment');
            this.vertex = this.get('shader-vertex'); 
            this.program = gd.gl.createProgram(); 
            gd.gl.attachShader(this.program, this.vertex); 
            gd.gl.attachShader(this.program, this.fragments);
            gd.gl.linkProgram(this.program);
            if(!gd.gl.getProgramParameter(this.program, gd.gl.LINK_STATUS)){
                return alert('Los shaders han fallado al cargar. '); 
            }
            gd.gl.useProgram(this.program); 
            this.store(); 
            gd.gl.deleteShader(this.fragments); 
            gd.gl.deleteShader(this.vertex); 
            gd.gl.deleteProgram(this.program);
        },
        get: function(id){
            this.script = document.getElementById(id);
            if(!this.script){
                alert('El script shaders solicitado no fue encontrado ' +
                    ' en el DOM. Asegurece que gd.sombreado.get(id)' + 
                    ' este configurado apropiadamente. ');
                return null;
            }

            this.source = ""; 
            this.currentChild = this.script.firstChild;
            while(this.currentChild){
                if(this.currentChild.nodeType === this.currentChild.TEXT_NODE){
                    this.source += this.currentChild.textContent; 
                }
                this.currentChild = this.currentChild.nextSibling;
            }

            if(this.script.type === 'x-shader/x-fragment'){
                this.shader = gd.gl.createShader(gd.gl.FRAGMENT_SHADER); 
            }else if(this.script.type === 'x-shader/x-vertex'){
                this.shader = gd.gl.createShader(gd.gl.VERTEX_SHADER);
            }else{
                return null;
            }

            gd.gl.shaderSource(this.shader, this.source); 
            gd.gl.compileShader(this.shader);
            
            if(!gd.gl.getShaderParameter(this.shader, gd.gl.COMPILE_STATUS)){
                alert('Error de compilacion del shader. ' + 
                    gd.gl.getShaderInfoLog(this.shader));
                    return null;  
            }
            return this.shader; 
        },
        store: function(){
            this.vertexPositionAttribute = gd.gl.getAttribLocation(this.program, "aVertexPosition"); 
            gd.gl.enableVertexAttribArray(this.vertexPositionAttribute);
            this.vertexColorAttribute = gd.gl.getAttribLocation(this.program, "aVertexColor");
            gd.gl.enableVertexAttribArray(this.vertexColorAttribute); 
        },
        
    },

    dibujar: function(){
        gd.gl.clear(gd.gl.COLOR_BUFFER_BIT | gd.gl.DEPTH_BUFFER_BIT); 
        this.perspectiveMatrix = makePerspective(45, this.horizAspect, 0.1, 300.0);

        for(var i in this.almacen.all){
            this.loadIndentity(); 
            this.almacen.all[i].update(); 
            this.mvTranslate(this.almacen.all[i].position);
            this.mvPushMatrix(); 
            if(this.almacen.all[i].rotate.ejes){
                this.mvRotate(
                    this.almacen.all[i].rotate.angulo,
                    this.almacen.all[i].rotate.ejes
                );
            } 
        //}
            gd.gl.bindBuffer(
                gd.gl.ARRAY_BUFFER, 
                this.almacen.all[i].shapeStorage); 
            
            gd.gl.vertexAttribPointer(
                this.shader.vertexPositionAttribute, 
                this.almacen.all[i].shapeColumns,
                gd.gl.FLOAT, 
                false, 0, 0
            ); 

            gd.gl.bindBuffer(
                gd.gl.ARRAY_BUFFER, 
                this.almacen.all[i].colorStorage
            );

            gd.gl.vertexAttribPointer(
                this.shader.vertexColorAttribute, 
                this.almacen.all[i].colorColumns,
                gd.gl.FLOAT, 
                false, 0, 0
            ); 

            this.setMatrixUniforms(); 

            // Evalua el uso de los indices
            if(this.almacen.all[i].indicesStorage){
                gd.gl.drawElements(
                    gd.gl.TRIANGLES, 
                    this.almacen.all[i].indicesCount,
                    gd.gl.UNSIGNED_SHORT,
                    0
                );
            }else{
                gd.gl.drawArrays(
                    gd.gl.TRIANGLE_STRIP,
                    0,
                    this.almacen.all[i].shapeRows
                );
            }

            // Saca un elemento de la pila de la matriz actual cuando existe una colision
            this.mvPopMatrix(); 

            if(this.almacen.all[i].type === 'a'){
                for(var en = this.almacen.b.length; en--;){
                    if(this.traslape(
                        this.almacen.all[i].x, 
                        this.almacen.all[i].y,
                        this.almacen.all[i].width,
                        this.almacen.all[i].height, 
                        this.almacen.b[en].x,
                        this.almacen.b[en].y,
                        this.almacen.b[en].width,
                        this.almacen.b[en].height,
                    )){
                        this.almacen.all[i].colision(this.almacen.b[en]); 
                        this.almacen.b[en].colision(this.almacen.all[i]);
                    }
                }
            }
        }
        this.cementerio.purgar(); 
    },

    loadIndentity: function(){
        mvMatrix = Matrix.I(4); 
    },

    multMatrix: function(m){
        mvMatrix = mvMatrix.x(m); 
    },

    mvTranslate: function(v){
        this.multMatrix(Matrix.Translation($V([v[0], v[1], v[2]])).ensure4x4()); 
    },

    setMatrixUniforms: function(){
        var pUniform = gd.gl.getUniformLocation(this.sombreado.program, 'uPMatrix'); 
        gd.gl.uniformMatrix4fv(pUniform, false , new Float32Array(this.perspectiveMatrix.flatten()));

        var mvUniform = gd.gl.getUniformLocation(this.sombreado.program, 'uMVMatrix'); 
        gd.gl.uniformMatrix4fv(mvUniform, false, new Float32Array(mvMatrix.flatten()));   
    },

    traslape: function(
        x1, y1, width1, height1, 
        x2, y2, width2, height2       
    ){
        x1 = x1-(width1/2); 
        y1 = y1-(height1/2);
        
        x2 = x2-(width2/2); 
        y2 = y2-(height2/2);

        return x1 < x2 + width2 && x1 + width1 > x2 && y1 < y2 + width2 && y1 + height1 > y2; 
    },
    
    mvMatrixStack:[],

    mvPushMatrix: function(m){
        if(m){
            this.mvMatrixStack.push(m.dup());
            this.mvMatrix = m.dup(); 
        }else{
            this.mvMatrixStack.push(this.mvMatrix.dup());
        }
    },

    mvPopMatrix: function(){
        if(!this.mvMatrixStack.length){
            throw("No se puede sacar de una pila de matriz vacia. "); 
        }
        this.mvMatrix = this.mvMatrixStack.pop();
        return this.mvMatrix;  
    },

    mvRotate: function(){
        var inRadians = angulo * Math.PI / 180.0;
        var m = Matrix.Rotation(inRadians, $V([v[0], v[1], v[2]])).ensure4x4(); 
        this.multMatrix(m);
    }
}

