(function() {
    gd.core.init(800, 600, function() {
        Ctrl.init();
        Hud.init();
        gd.game.spawn('Player');
    });

    gd.game.size = {
        width: 43,
        height: 32
    };

    var Ctrl = {
        init: function() {
            window.addEventListener('keydown', this.keyDown, true);
            window.addEventListener('keyup', this.keyUp, true);
        },

        keyDown: function(event) {
            switch(event.keyCode) {
                case 38: // up
                    Ctrl.up = true;
                    break;
                case 40: // down
                    Ctrl.down = true;
                    break;
                case 37: // Left
                    Ctrl.left = true;
                    break;
                case 39: // Right
                    Ctrl.right = true;
                    break;
                case 88:
                    Ctrl.x = true;
                    break;
                default:
                    break;
            }
        },

        keyUp: function(event) {
            switch(event.keyCode) {
                case 38:
                    Ctrl.up = false;
                    break;
                case 40:
                    Ctrl.down = false;
                    break;
                case 37: // Left
                    Ctrl.left = false;
                    break;
                case 39: // Right
                    Ctrl.right = false;
                    break;
                case 88:
                    Ctrl.x = false;
                    break;
                default:
                    break;
            }
        }
    };

    gd.template.Player = gd.template.Entity.extend({
        type: 'a',
        x: -1.4,
        width: 1,
        height: 1,

        
        rotate: {
            angle: 0,
            axis: [0, 0, 1],
            speed: 3
        },
        speed: 0.5,
        shoot: true,
        shootDelay: 400,

        init: function() {
            this.shape([
                0.0,  2.0,  0.0, // top
               -1.0, -1.0,  0.0, // left
                1.0, -1.0,  0.0  // right
            ]);

            this.color([
                1.0, 1.0, 1.0, 1.0, // top
                1.0, 1.0, 1.0, 1.0, // left
                1.0, 1.0, 1.0, 1.0  // right
            ]);
        },

        boundaryTop: function() { this.y = gd.game.size.height; },
        boundaryRight: function() { this.x = gd.game.size.width; },
        boundaryBottom: function() { this.y = -gd.game.size.height; },
        boundaryLeft: function () { this.x = -gd.game.size.width; },

        update: function() {
            var self = this;

            // Move left or right to rotate the player
            if (Ctrl.left) {
                this.rotate.angle += this.rotate.speed;
            } else if (Ctrl.right) {
                this.rotate.angle -= this.rotate.speed;
            }

            if (Ctrl.up) {
                this.x -= Math.sin( this.rotate.angle * Math.PI / 180 ) * this.speed;
                this.y += Math.cos( this.rotate.angle * Math.PI / 180 ) * this.speed;
            } else if (Ctrl.down) {
                this.x += Math.sin( this.rotate.angle * Math.PI / 180 ) * this.speed;
                this.y -= Math.cos( this.rotate.angle * Math.PI / 180 ) * this.speed;
            }

            gd.game.boundaries(this, this.boundaryTop, this.boundaryRight, this.boundaryBottom, this.boundaryLeft);

            // Detect a player shooting
            if (Ctrl.x && this.shoot) {
                gd.game.spawn('Bullet', this.rotate.angle, this.x, this.y);
                this.shoot = false;
                window.setTimeout(function() {
                    self.shoot = true;
                }, this.shootDelay);
            }
        },

        kill: function() {
            this._super();
            PolygonGen.clear();
            Hud.end();
        }
    });


    var Hud = {
        init: function() {
            var self = this;
            var callback = function() {
                if (Ctrl.x) {
                    window.removeEventListener('keydown', callback, true);
                    PolygonGen.init();
                    self.el.start.style.display = 'none';
                    self.el.title.style.display = 'none';
                }
            };

            window.addEventListener('keydown', callback, true);
        },

        end: function() {
            var self = this;
            this.el.end.style.display = 'block';
        },

        score: {
            count: 0,
            update: function() {
                this.count++;
                Hud.el.score.innerHTML = this.count;
            }
        },

        
        el: {
            score: document.getElementById('count'),
            start: document.getElementById('start'),
            end: document.getElementById('end'),
            title: document.getElementById('title')
        }
    };


    gd.template.Bullet = gd.template.Entity.extend({
        type: 'a',
        width: 0.6,
        height: 0.6,
        speed: 0.8,
        angle: 0,

        init: function(angle, x, y) {
            this.shape([
                // Front face
                0.0,  0.3,  0.0,
               -0.3, -0.3,  0.3,
                0.3, -0.3,  0.3
            ]);

            var stack = [];
            for (var line = this.shapeRows; line--;)
                stack.push(1.0, 0.0, 0.0, 1.0);
            this.color(stack);
            this.angle = angle;
            this.x = x;
            this.y = y;
        },

        update: function() {
            gd.game.boundaries(this, this.kill, this.kill, this.kill, this.kill);
            this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed;
            this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed;
        },

        collide: function() {
            this._super();
            Hud.score.update();
        }
    });

    var PolygonGen = {
        delay: 7000,
        limit: 9,

        init: function() {
            var self = this;
            this.count = 1;
            gd.game.spawn('Polygon');
            this.create = window.setInterval(function() {
                if (gd.core.storage.b.length < self.limit) {
                    if (self.count < 3)
                        self.count++;

                    for (var c = self.count; c--;) {
                        gd.game.spawn('Polygon');
                    }
                }
            }, self.delay);
        },

        clear: function() {
            window.clearInterval(this.create);
            this.count = 0;
            this.delay = 7000;
        }
    };

    gd.template.Polygon = gd.template.Entity.extend({
        type: 'b',
        width: 7,
        height: 9,

        init: function() {
            this.shape([
                 0.0,  7.0,  0.0,
                -4.0,  2.0,  4.0,
                 4.0,  2.0,  4.0,
                // Right face
                 0.0,  7.0,  0.0,
                 4.0,  2.0,  4.0,
                 4.0,  2.0, -4.0,
                // Back face
                 0.0,  7.0,  0.0,
                 4.0,  2.0, -4.0,
                -4.0,  2.0, -4.0,
                // Left face
                 0.0,  7.0,  0.0,
                -4.0,  2.0, -4.0,
                -4.0,  2.0,  4.0,

                // Plate
                 -4.0, 2.0, 4.0,
                 -4.0, -5.0, 4.0,
                 -4.0, -5.0, -4.0,
                 -4.0, 2.0, 4.0,
                 -4.0, 2.0, -4.0,
                 -4.0, -5.0, -4.0,

                // Plate
                -4.0,  2.0, -4.0,
                -4.0, -5.0, -4.0,
                 4.0, -5.0, -4.0,
                -4.0,  2.0, -4.0,
                 4.0,  2.0, -4.0,
                 4.0, -5.0, -4.0,

                // Plate
                 4.0,  2.0,  4.0,
                 4.0,  2.0, -4.0,
                 4.0, -5.0, -4.0,
                 4.0,  2.0,  4.0,
                 4.0, -5.0,  4.0,
                 4.0, -5.0, -4.0,

                // Plate
                -4.0,  2.0,  4.0,
                 4.0,  2.0,  4.0,
                 4.0, -5.0,  4.0,
                -4.0,  2.0,  4.0,
                -4.0, -5.0,  4.0,
                 4.0, -5.0,  4.0,

                // Bottom triangle
                // Front face
                0.0, -10.0, 0.0,
                -4.0, -5.0,  4.0,
                 4.0, -5.0,  4.0,
                // Right face
                 0.0, -10.0, 0.0,
                 4.0, -5.0,  4.0,
                 4.0, -5.0, -4.0,
                // Back face
                 0.0, -10.0, 0.0,
                 4.0, -5.0, -4.0,
                -4.0, -5.0, -4.0,
                //Left face
                 0.0, -10.0, 0.0,
                -4.0, -5.0, -4.0,
                -4.0, -5.0,  4.0
            ]);

            this.randomSide();
            this.randomMeta();


            var stack = [];
            for (var v = 0; v < this.shapeRows * this.shapeColumns; v += 3) {
                if (v > 108 || v <= 36) {
                    stack.push(this.colorData.pyramid[0], this.colorData.pyramid[1], this.colorData.pyramid[2], 1);
                } else {
                    stack.push(this.colorData.cube[0], this.colorData.cube[1], this.colorData.cube[2], 1);
                }
            }
            this.color(stack);
        },

        randomMeta: function() {
            this.rotate = {
                speed: gd.game.random.number(400, 100),
                axis: [
                    gd.game.random.number(10, 1) / 10,
                    gd.game.random.number(10, 1) / 10,
                    gd.game.random.number(10, 1) / 10
                ],
                angle: gd.game.random.number(250, 1)
            };

            this.speed = {
                x: gd.game.random.number(10, 4) / 100,
                y: gd.game.random.number(10, 4) / 100
            };

            this.colorData = {
                pyramid: [
                    gd.game.random.number(10, 1) / 10,
                    gd.game.random.number(10, 1) / 10,
                    gd.game.random.number(10, 1) / 10
                ],
                cube: [
                    gd.game.random.number(10, 1) / 10,
                    gd.game.random.number(10, 1) / 10,
                    gd.game.random.number(10, 1) / 10
                ]
            };
        },

        randomSide: function() {
            var side = gd.game.random.number(4, 1);

            //top
            if (side === 1) {
                this.angle = gd.game.random.number(200, 160);
                var range = gd.game.size.width - this.width;
                this.x = gd.game.random.number(range, -range);
                this.y = gd.game.size.height + this.height;

            // right
            } else if (side === 2) {
                this.angle = gd.game.random.number(290, 250);
                var range = gd.game.size.height - this.height;
                this.x = (gd.game.size.width + this.width) * -1;
                this.y = gd.game.random.number(range, -range);

            // bottom
            } else if (side === 3) {
                this.angle = gd.game.random.number(380, 340);
                var range = gd.game.size.width - this.width;
                this.x = gd.game.random.number(range, -range);
                this.y = (this.height + gd.game.size.height) * -1;

            // left
            } else {
                this.angle = gd.game.random.number(110, 70);
                var range = gd.game.size.height - this.height;
                this.x = gd.game.size.width + this.width;
                this.y = gd.game.random.number(range, -range);
            }
        },

        update: function() {
            gd.game.boundaries(this, this.kill, this.kill, this.kill, this.kill, (this.width * 2));
            this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed.x;
            this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed.y;

            gd.game.rotate(this);
        },

        collide: function() {
            if (gd.core.storage.all.length < 50) {
                for (var p = 15; p--;) {
                    gd.game.spawn('Particle', this.x, this.y);
                }
            }

            
            var num = gd.game.random.number(2, 4);
            for (var c = num; c--;) {
                gd.game.spawn('Cube', this.x, this.y);
            }

            this.kill();
        }
    });

    gd.template.Cube = gd.template.Entity.extend({
        type: 'b',
        size: {
            max: 3,
            min: 2,
            divider: 1
        },
        pressure: 50,

        meta: function() {
            this.speed = {
                x: (gd.game.random.number(this.pressure, 1) / 100) * gd.game.random.polarity(),
                y: (gd.game.random.number(this.pressure, 1) / 100) * gd.game.random.polarity()
            };

            this.angle = gd.game.random.number(360, 1);

            this.s = gd.game.random.number(this.size.max, this.size.min) / this.size.divider;
            this.width = this.s * 2;
            this.height = this.s * 2;
        },

        init: function(x, y) {
            this.x = x;
            this.y = y;

            this.meta();

            this.shape([
                // Front
                -this.s, -this.s,  this.s,
                 this.s, -this.s,  this.s,
                 this.s,  this.s,  this.s,
                -this.s,  this.s,  this.s,
                // Back
                -this.s, -this.s, -this.s,
                -this.s,  this.s, -this.s,
                 this.s,  this.s, -this.s,
                 this.s, -this.s, -this.s,
                // Top
                -this.s,  this.s, -this.s,
                -this.s,  this.s,  this.s,
                 this.s,  this.s,  this.s,
                 this.s,  this.s, -this.s,
                // Bottom
                -this.s, -this.s, -this.s,
                 this.s, -this.s, -this.s,
                 this.s, -this.s,  this.s,
                -this.s, -this.s,  this.s,
                // Right
                 this.s, -this.s, -this.s,
                 this.s,  this.s, -this.s,
                 this.s,  this.s,  this.s,
                 this.s, -this.s,  this.s,
                // Left
                -this.s, -this.s, -this.s,
                -this.s, -this.s,  this.s,
                -this.s,  this.s,  this.s,
                -this.s,  this.s, -this.s
            ]);

            this.indices([
                 0,  1,  2,    0,  2,  3, // front
                 4,  5,  6,    4,  6,  7, // back
                 8,  9, 10,    8, 10, 11, // top
                12, 13, 14,   12, 14, 15, // bottom
                16, 17, 18,   16, 18, 19, // right
                20, 21, 22,   20, 22, 23  // left
            ]);

            this.color([
                [1, 0, 0, 1], // Front: red
                [0, 1, 0, 1], // Back: green
                [0, 0, 1, 1], // Top: blue
                [1, 1, 0, 1], // Bottom: blue
                [1, 0, 1, 1], // Right face: yellow
                [0, 1, 1, 1]  // Left face: purple
            ]);

            if (this.rotate) {
                this.rotate = {
                    axis: [
                        gd.game.random.number(10, 1) / 10,
                        gd.game.random.number(10, 1) / 10,
                        gd.game.random.number(10, 1) / 10],
                    angle: gd.game.random.number(350, 1),
                    speed: gd.game.random.number(400, 200)
                };
            }
        },

        update: function() {
            var self = this;
            gd.game.boundaries(self, this.kill, this.kill, this.kill, this.kill, this.width);
            this.x -= Math.sin( this.angle * Math.PI / 180 ) * this.speed.x;
            this.y += Math.cos( this.angle * Math.PI / 180 ) * this.speed.y;
            
            if (this.rotate)
                gd.game.rotate(this);
        }
    });

    gd.template.Particle = gd.template.Cube.extend({
        pressure: 20,
        type: 0,
        size: {
            min: 2,
            max: 6,
            divider: 10
        },

        init: function(x, y) {
            this.x = x;
            this.y = y;

            this.meta();

            
            this.shape([
                 this.s,  this.s,  0.0,
                -this.s,  this.s,  0.0,
                 this.s, -this.s,  0.0,
                -this.s, -this.s,  0.0
            ]);

            
            var r = gd.game.random.number(10, 0) / 10,
            g = gd.game.random.number(10, 0) / 10,
            b = gd.game.random.number(10, 0) / 10;
            this.color([
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1,
                r, g, b, 1
            ]);

            var self = this;
            this.create = window.setTimeout(function() {
                self.kill();
            }, 5000);
        }
    });
}());