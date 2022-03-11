var gd = gd || {};

gd.game = {

    spawn: function(name, params) {

        var entity = new gd.template[name];

        entity.id = gd.core.id.get();

        gd.core.storage.all.push(entity);

        switch (entity.type) {
            case 'a':
                gd.core.storage.a.push(entity);
                break;
            case 'b':
                gd.core.storage.b.push(entity);
                break;
            default:
                break;
        }


        if (arguments.length > 1 && entity.init) {
            var args = [].slice.call(arguments, 1);
            entity.init.apply(entity, args);
        } else if (entity.init) {
            entity.init();
        }
    },

    
    boundaries: function(obj, top, right, bottom, left, offset) {
        if (offset === undefined)
            offset = 0;

        if (obj.x < - this.size.width - offset) {
            return left.call(obj);
        } else if (obj.x > this.size.width + offset) {
            return right.call(obj);
        } else if (obj.y < -this.size.height - offset) {
            return bottom.call(obj);
        } else if (obj.y > this.size.height + offset) {
            return top.call(obj);
        }
    },

    
    
    rotate: function(obj) {
        var currentTime = Date.now();
        if (obj.lastUpdate < currentTime) {
            var delta = currentTime - obj.lastUpdate;

            obj.rotate.angle += (30 * delta) / obj.rotate.speed;
        }
        obj.lastUpdate = currentTime;
    },


    
    random: {
        polarity: function() {
            return Math.random() < 0.5 ? -1 : 1;
        },
        number: function(max, min) {
            return Math.floor(Math.random() * (max - min + 1) + min);
        }
    }
};