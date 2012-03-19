var net = require('net');

var util = require('./lib/util');
var knode = require('./lib/knode');

var self = process.argv[2].split(':');
var port = parseInt(self[1] || 10000);
var node = new knode.KNode({ address: self[0], port: port });

if (process.argv.length >= 4) {
    var arg = process.argv[3].split(':');
    if (arg[0])
        node.connect(arg[0], parseInt(arg[1]));
    setInterval(function() {
        /*node.get('foo', function(err, value) {
            if (err) {
                console.log("Not found");
                node.set('foo', 'bar', function(err) {
                    node.get('foo', function(err, value) {
                        if (err)
                            console.log("Still not inserted");
                        else
                            console.log("======> Inserted", value);
                    });
                });
            }
            else {
                console.log("=======> Already exists", value);
            }
        });*/
        if (port == 10000)
            node.set('foo', 'bar');
        console.log("This node storage", node._storage);
    }, 4000);

    // 'interactive' console
    net.createServer(function(socket) {
        socket.setEncoding('utf8');
        socket.on('data', function(data) {
            var parts = data.trim().split(' ');
            console.log(parts);
            switch (parts[0]) {
                case 'set':
                    if (parts.length < 3) {
                        socket.write("Not enough parameters\n");
                        break;
                    }
                    node.set(parts[1], parts[2], function(err) {
                        if (err)
                            socket.write("Error setting " + parts[1] + ": " + JSON.stringify(err) + "\n");
                        else
                            socket.write("Set " + parts[1] + " to " + parts[2] + "\n");
                    });
                    break;

                case 'get':
                    if (parts.length < 2) {
                        socket.write("Not enough parameters\n");
                        break;
                    }
                    node.get(parts[1], function(err, val) {
                        if (err)
                            socket.write("Error getting " + parts[1] + ": " + JSON.stringify(err) + "\n");
                        else
                            socket.write("Value of " + parts[1] + " is " + val + "\n");
                    });
                    break;

                default:
                    socket.write("Unknown command\n");
            }
        });
    }).listen(port);
}
