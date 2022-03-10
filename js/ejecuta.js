(function(){
    gd.principal.init(800, 600, function(){
        Ctrl.init();
        Hud.init();
        gd.juego.engendrar('Player');
    });


    // Informacion de las coordenadas x, y para el espacio 3D
    gd.juego.tamanio = {
        width: 43,
        height: 32
    }; 

    var Ctrl = {
        init: function(){
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true); 
        },

        keyDown: function(event){
            switch(event.keyCode){
                case 39: Ctrl.left = true; break;
                case 37: Ctrl.right = true; break;
                case 38: Ctrl.up = true; break;
                case 40: Ctrl.down = true; break;
                case 88: Ctrl.x = true; break;
                default:break
            }
        }, 
        keyUp: function(event){
            switch(event.keyCode){
                case 39: Ctrl.left = false; break;
                case 37: Ctrl.right = false; break;
                case 38: Ctrl.up = false; break;
                case 40: Ctrl.down = false; break;
                case 88: Ctrl.x = false; break;
                default:break;
            }
        }

    }

    var Hud = {
        int: function(){
            var self = this; 

            var callback = function(){
                if(Ctrl.x){
                    window.removeEventListener('keydown', callback, true); 
                    PolygonGen.init(); 
                    self.el.inicio.style.display = 'none';
                    self.el.titulo.style.display = 'none';
                }
            }; 
            window.addEventListener('keydown', callback, true); 
        },

        fin: function(){
            var self = this; 
            this.el.fin.style.display = 'block';
        },

        marcador: {
            contador: 0, 
            update: function(){
                this.contador++;
                Hud.el.marcador.innerHTML = this.contador;
            }
        },
        el: {
            marcador: document.getElementById('contado'),
            inicio: document.getElementById('inicio'),
            fin: document.getElementById('fin'),
            titulo: document.getElementById('titulo'),
        }
    };

    gd.plantilla.Jugador = gd.plantilla.Entidad.extend({
        type: 'a',
        x: -1.4,
        width: 1, 
        height: 1,
        speed: 0.5,
        dispara: true,
        retrasoDisparo: 400, 
        rotate: {
            angulo: 0,
            ejes: [0,0,1],
            speed: 3, 
        },
        init: function(){
            this.figura([
                0.0, 2.0, 0.0, 
                -1.0, -1.0, 0.0, 
                1.0, -1.0, 0.0
            ]); 

            this.color([
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
                1.0, 1.0, 1.0, 1.0,
            ]);
        },
        
        limiteSuperior: function(){
            this.y = gd.juego.tamanio.height; 
        },

        limiteDerecho: function(){
            this.x = gd.juego.tamanio.width;
        },
        
        limiteIzquierdo: function(){
            this.y = -gd.juego.tamanio.height; 
        },

        limiteDerecho: function(){
            this.x = -gd.juego.tamanio.width;
        },

        matar: function(){
            this._super(); 
            PolygonGen.clear(); 
            Hud.fin; 
        },
        actualizar: function(){
            var self = this; 
            if(Ctrl.left){
                this.rotate.angulo += this.rotate.speed; 
            }else if(Ctrl.right){
                this.rotate.angulo -= this.rotate.speed;
            }

            if(Ctrl.up){
                this.x -= Math.sin(this.rotate.angulo * Math.PI / 180) * this.speed;
                this.y += Math.cos(this.rotate.angulo * Math.PI / 180 * this.speed);  
            }else if(Ctrl.down){
                this.x += Math.sin(this.rotate.angulo * Math.PI / 180) * this.speed;
                this.y -= Math.cos(this.rotate.angulo * Math.PI / 180 * this.speed);  
            }

            gd.juego.fronteras(this, this.limiteSuperior, this.limiteDerecho, this.limiteInferior, this.limiteIzquierdo); 
            if(Ctrl.x && this.disparo){
                gd.juego.engendrar('Bala', this.rotate.angulo, this.x, this.y);
                this.dispara = false; 
                window.setTimeout(function(){
                    self.dispara = true;

                }, this.retrasoDisparo);  
            }
        }
    }); 

    gd.plantilla.Bala = gd.plantilla.Entidad.extends({
        type: 'a',
        width: 0.6,
        height: 0.6,
        speed: 0.8, 
        angulo: 0,
        init: function(angulo, x, y){
            this.figura([
                0.0, 0.3, 0.0, 
                -0.3, -0.3, 0.3,
                0.3, -0.3, 0.3
            ]); 
            var pila = []; 
            for(var linea = this.shapeRows; linea--;){
                pila.push(1.0, 0.0, 0.0, 1.0); 
            }
            this.color(pila);
            this.angulo = angulo; 
            this.x = x; 
            this.y = y; 
        },

        actualizar: function(){
            gd.juego.fronteras(this, this.matar, this.matar, this.matar, this.matar);
            this.x -= Math.sin(this.angulo * Math.PI / 180) * this.speed; 
            this.y += Math.cos(this.angulo * Math.PI / 180) * this.speed; 
        },

        colision: function(){
            this._super(); 
            Hud.marcador.actualizar(); 
        }
    }); 

    gd.plantilla.Poligono = gd.plantilla.Entidad.extends({
        type: 'b',
        width: 7, 
        height: 9, 

        init: function(){
            this.figura([
                // Triangulo superior
                // Cara Frontal
                0.0, 7.0, 0.0,
                -4.0, 2.0, 4.0,
                4.0, 2.0, 4.0,
                // Cara derecha
                0.0, 7.0, 0.0,
                4.0, 2.0, 4.0,
                4.0, 2.0, -4.0,
                // Cara trasera
                0.0, 7.0, 0.0,
                4.0, 2.0, -4.0,
                -4.0, 2.0, -4.0,
                // Cara izquierda
                0.0, 7.0, 0.0,
                -4.0, 2.0, -4.0,
                -4.0, 2.0, 4.0,
                // Placas medias
                // Placa
                -4.0, 2.0, 4.0,
                -4.0, -5.0, 4.0,
                -4.0, -5.0, -4.0,
                -4.0, 2.0, 4.0,
                -4.0, 2.0, -4.0,
                -4.0, -5.0, -4.0,
                // Placa
                -4.0, 2.0, -4.0,
                -4.0, -5.0, -4.0,
                4.0, -5.0, -4.0,
                -4.0, 2.0, -4.0,
                4.0, 2.0, -4.0,
                4.0, -5.0, -4.0,
                // Placa
                4.0, 2.0, 4.0,
                4.0, 2.0, -4.0,
                4.0, -5.0, -4.0,
                4.0, 2.0, 4.0,
                4.0, -5.0, 4.0,
                4.0, -5.0, -4.0,
                // Placa
                
                -4.0, 2.0, 4.0,
                4.0, 2.0, 4.0,
                4.0, -5.0, 4.0,
                -4.0, 2.0, 4.0,
                -4.0, -5.0, 4.0,
                4.0, -5.0, 4.0,
                // Triangulo inferior
                // Cara frontal
                0.0, -10.0, 0.0,
                -4.0, -5.0, 4.0,
                4.0, -5.0, 4.0,
                // Cara derecha
                0.0, -10.0, 0.0,
                4.0, -5.0, 4.0,
                4.0, -5.0, -4.0,
                // Cara trasera
                0.0, -10.0, 0.0,
                4.0, -5.0, -4.0,
                -4.0, -5.0, -4.0,
                // Cara izquierda
                0.0, -10.0, 0.0,
                -4.0, -5.0, -4.0,
                -4.0, -5.0, 4.0
            ]);
            this.ladoAleatorio(); 
            this.metaAleatorio(); 
            var pila = []; 

            for(var v = 0; v < this.shapeRows*this.shapeColumns; v+=3){
                if(v > 108 || v <= 36){
                    pila.push(this.colorData.piramide[0], this.colorData.piramide[1], this.colorData.piramide[2], 1); 
                }else{
                    pila.push(this.colorData.cubo[0], this.colorData.cubo[1], this.colorData[2], 1); 
                }
            }
            this.color(pila);
        }, // Aleatoriamente genera meta información como velocidad, rotación y otros detalles aleatorios.
        metaAleatorio: function() {
            this.rotate = {
                speed: gd.juego.aleatorio.numero(400, 100),
            ejes: [
                gd.juego.aleatorio.numero(10, 1) / 10,
                gd.juego.aleatorio.numero(10, 1) / 10,
                gd.juego.aleatorio.numero(10, 1) / 10
            ],
            angulo: gd.juego.aleatorio.numero(250, 1)
            };
            // Generar velocidad aleatoriamente
            this.speed = {
                x: gd.juego.aleatorio.numero(10, 4) / 100,
                y: gd.juego.aleatorio.numero(10, 4) / 100
            };
                // Elige 3 colores aleatorios
            this.colorData = {
                piramide: [
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10
                ],
                cubo: [
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10,
                    gd.juego.aleatorio.numero(10, 1) / 10
                ]
            };
        },
        ladoAleatorio: function() {
            // Aleatoriamente generar de uno de los cuatro lados
            var lado = gd.juego.aleatorio.numero(4, 1);
            // superior
            if (lado === 1) {
                this.angulo = gd.juego.aleatorio.numero(200, 160);
                var range = gd.juego.tamanio.width - this.width;
                this.x = gd.juego.aleatorio.numero(range, -range);
                this.y = gd.juego.tamanio.height + this.height;
            // derecho
            } else if (lado === 2) {
                this.angulo = gd.juego.aleatorio.numero(290, 250);
                var range = gd.juego.tamanio.height - this.height;
                this.x = (gd.juego.tamanio.width + this.width) * -1;
                this.y = gd.juego.aleatorio.numero(range, -range);
            // inferior
            } else if (lado === 3) {
                this.angulo = gd.juego.aleatorio.numero(380, 340);
                var range = gd.juego.tamanio.width - this.width;
                this.x = gd.juego.aleatorio.numero(range, -range);
                this.y = (this.height + gd.juego.tamanio.height) * -1;
            // izquierda
            } else {
                this.angulo = gd.juego.aleatorio.numero(110, 70);
                var range = gd.juego.tamanio.height - this.height;
                this.x = gd.juego.tamanio.width + this.width;
                this.y = gd.juego.aleatorio.numero(range, -range);
            }
        },
        actualizar: function() {
            gd.juego.fronteras(this, this.matar, this.matar, this.matar, this.matar,(this.width * 2));
            // Logica para aceleracion
            this.x -= Math.sin( this.angulo * Math.PI / 180 ) * this.speed.x;
            this.y += Math.cos( this.angulo * Math.PI / 180 ) * this.speed.y;
            gd.juego.rotate(this);
        },
        chocar: function() {
            // Generar un numero de partículas generadas en el centro de un polígono
            // en destrucción, pero solamente si el juego tiene suficiente memoria para soportar
            if (gd.core.storage.all.length < 50) {
                for (var p = 15; p--;) {
                    gd.juego.spawn('Particle', this.x, this.y);
                }
            }
            // Generar un numero aleatorio de cubos generados en el centro de un polígono
            // en destrucción
            var num = gd.juego.aleatorio.numero(2, 4);
                for (var c = num; c--;) {
                    gd.juego.spawn('Cube', this.x, this.y);
                }
            this.matar();
            }
    }); 

    var PolygonGen = {
        retraso: 7000,
        limite: 9,
        init: function(){
            var self = this;
            this.contador = 1;
            gd.juego.engendrar('Polygon');
            this.create = window.setInterval(function(){
                if(gd.principal.almacen.b.length < self.limite){
                    if(self.contador < 3)
                    self.contador++;
                    for(var c = self.contador; c--;){
                        gd.juego.engendrar('Polygon');
                    }
                }
            }, self.retraso);
        },
        clear: function(){
            window.clearInterval(this.create);
            this.contador = 0;
            this.retraso = 7000;
        }
    };

    gd.plantilla.Cubo = gd.plantilla.Entidad.extend({

        type: 'b',
            tamanio: {
            max: 3,
            min: 2,
            divider: 1
        },
        pressure: 50,
        meta: function() {
        // Aceleracion aleatoria x e y
            this.speed = {
                x: (gd.juego.aleatorio.numero(this.pressure, 1) / 100) * gd.juego.aleatorio.polaridad(),
                y: (gd.juego.aleatorio.numero(this.pressure, 1) / 100) * gd.juego.aleatorio.polaridad()
            };
            // Direccion aleatoria
            this.angulo = gd.juego.aleatorio.numero(360, 1);
            // Tamaño aleatorio
            this.s = gd.juego.aleatorio.numero(this.tamanio.max, this.tamanio.min) /
            this.tamanio.divider;
            this.width = this.s * 2;
            this.height = this.s * 2;
        },
        // Ocurre en cada actulizacion de frame
        actualizar: function() {
            var self = this;
            gd.juego.limites(self, this.matar, this.matar, this.matar, this.matar,this.width);
            // logica para aceleracion
            this.x -= Math.sin( this.angulo * Math.PI / 180 ) * this.speed.x;
            this.y += Math.cos( this.angulo * Math.PI / 180 ) * this.speed.y;
            // Utiliza una metrica de tiempo para actualizar y configura su rotacion
            // Orginnalmente del tutorial WebGL de Mozilla
            https://developer.mozilla.org/en/WebGL/Animating_objects_with_WebGL
            if (this.rotar)
            gd.juego.rotar(this);
        },
        // establece posición para x, y con parámetros pasados al generar
        init: function(x,y) {
            this.x = x;
            this.y = y;
            this.meta();
            
            this.figura([
            // placa frontal
                
                -this.s, -this.s, this.s,
                this.s, -this.s, this.s,
                this.s, this.s, this.s,
                -this.s, this.s, this.s,
                // placa trasera
                -this.s, -this.s, -this.s,
                -this.s, this.s, -this.s,
                this.s, this.s, -this.s,
                this.s, -this.s, -this.s,
                // placa superior
                -this.s, this.s, -this.s,
                -this.s, this.s, this.s,
                this.s, this.s, this.s,
                this.s, this.s, -this.s,
                // placa inferior
                -this.s, -this.s, -this.s,
                this.s, -this.s, -this.s,
                this.s, -this.s, this.s,
                -this.s, -this.s, this.s,
                // placa derecha
                this.s, -this.s, -this.s,
                this.s, this.s, -this.s,
                this.s, this.s, this.s,
                this.s, -this.s, this.s,
                // placa izquierda
                -this.s, -this.s, -this.s,
                -this.s, -this.s, this.s,
                -this.s, this.s, this.s,
                
                -this.s, this.s, -this.s,
            ]);

            this.indices([
                0, 1, 2, 0, 2, 3, // frontal
                4, 5, 6, 4, 6, 7, // trasera
                8, 9, 10, 8, 10, 11, // superior
                12, 13, 14, 12, 14, 15, // inferior
                16, 17, 18, 16, 18, 19, // derecha
                20, 21, 22, 20, 22, 23 // izquierda
            ]);
        
            this.color([
                [1, 0, 0, 1], // frontal: rojo
                [0, 1, 0, 1], // trasera: verde
                [0, 0, 1, 1], // superior: azul
                [1, 1, 0, 1], // inferior: azul
                [1, 0, 1, 1], // Cara derehca face: amarillo
                [0, 1, 1, 1] // Cara izquierda: purpura
            ]);
            if (this.rotar) {
                this.rotar = {
                    eje: [
                        gd.juego.aleatorio.numero(10, 1) / 10,
                        gd.juego.aleatorio.numero(10, 1) / 10,
                        gd.juego.aleatorio.numero(10, 1) / 10],
                    angulo: gd.juego.aleatorio.numero(350, 1),
                    speed: gd.juego.aleatorio.numero(400, 200)
                };
            }
        }
    });

    gd.template.Particle = gd.template.Cube.extend({
        pressure: 20,
        type: 0,
        tamanio: {
            min: 2,
            max: 6,
            divider: 10
        },
        iniciar: function(x, y) {
            this.x = x;
            this.y = y;
            this.meta();
            // Configurar una figura de rectangulo plana
            this.figura([
                this.s, this.s, 0.0,
                -this.s, this.s, 0.0,
                this.s, -this.s, 0.0,
                -this.s, -this.s, 0.0
            ]);
            // Configurar color aleatorio
            var r = gd.juego.aleatorio.numero(10, 0) / 10,
            g = gd.juego.aleatorio.numero(10, 0) / 10,
            b = gd.juego.aleatorio.numero(10, 0) / 10;
            this.color([
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1
            ]);
            var self = this;
        
            this.create = window.setTimeout(function() {
                self.matar();
            }, 5000);
        }
    });

});