
// nutella install basic-node-bot fw-bot
// nutella dependencies
// nutella start

var d = new Date();
var n = d.getTime();


var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');


console.log("fw-bot launched");

var mfw = nutella.persist.getMongoObjectStore('mfw');
var fw = nutella.persist.getMongoObjectStore('fw');
var claims = nutella.persist.getMongoObjectStore('claims');

mfw.load(function(){
    if (!mfw.hasOwnProperty('data')){
        mfw.data = [{}]; mfw.save(); 
    };
    fw.load(function(){
      if (!fw.hasOwnProperty('data')){
        fw.data = []; fw.save(); 
      };
      claims.load(function(){
        if (!claims.hasOwnProperty('data')){
            claims.data = []; claims.save();
        };

        // master food web handlers (archived)

        nutella.net.handle_requests('get_mfw', function(message,from){
            return mfw.data[mfw.data.length-1];
        });

        nutella.net.subscribe('save_mfw', function(message,from){
            console.log('saving MFW');
            mfw.data.push(message); mfw.save();
        });

        // group and individual food web handlers (not archived)

        nutella.net.handle_requests('get_fw', function(message,from){
            var f = fw.data.filter(function(item){
                return (item.portal == message.portal && item.instance == message.instance)
            });
            if (f.length == 0) return {};
            else return f[0].drawing;
        });

        nutella.net.subscribe('save_fw', function(message,from){
            for (var i=0; i<fw.data.length; i++)
                if (fw.data[i].portal == message.portal && 
                    fw.data[i].instance == message.instance) {
                        fw.data[i].drawing = message.drawing;
                        fw.save(); return;
                };
            fw.data.push({portal: message.portal, instance: message.instance, drawing: message.drawing});
            fw.save();
        });

        // group and individual food web handlers (not archived)

        nutella.net.handle_requests('get_claims', function(message,from){
            var c = [];
            for (var i=0; i<claims.data.length; i++){
                if (!claims.data[i].hasOwnProperty('status')) claims.data[i].status = 'active';
                if (claims.data[i].status == 'active') c.push(claims.data[i]);
            };
            claims.save();
            return c;
        })


        // var claim = {instance: document.getElementById('instance').value,
        //             source: document.getElementById('source').value,
        //             destination: document.getElementById('destination').value,
        //             relationship: document.getElementById('relationship').value,
        //             reasoning: document.getElementById('reasoning').value,
        //             figure1: document.getElementById('figure1').value,
        //             figure2: document.getElementById('figure2').value,
        //             figure3: document.getElementById('figure3').value};

        //              status: active, withdrawn, replaced



        nutella.net.subscribe('save_claim',function(m,from){ 
            var message = m;
            var d = new Date();
            message.timestamp = d.getTime();
            message.status = 'active';

            claims.data.push(message);
//            claims.save();

            for (var i=0; i<claims.data.length-1; i++){
                if (claims.data[i].instance == message.instance &&
                    claims.data[i].source == message.source &&
                    claims.data[i].destination == message.destination &&
                    (!claims.data[i].hasOwnProperty('status') || claims.data[i].status == 'active')) {
//                        claims.data[i] = message;
                        claims.data[i].status = 'replaced';
                        claims.save();
                        nutella.net.publish('replace_claim',message);
                        return;
                };
            };

            claims.save();
            nutella.net.publish('new_claim',message);
        });

        nutella.net.subscribe('withdraw_claim',function(message,from){
            for (var i=0; i<claims.data.length; i++){
                if (claims.data[i].instance == message.instance &&
                    claims.data[i].source == message.source &&
                    claims.data[i].destination == message.destination &&
                    (!claims.data[i].hasOwnProperty('status') || claims.data[i].status == 'active')) {
                        claims.data[i].status = 'withdrawn';
                        var d = new Date();
                        claims.data[i].withdrawalTimestape = d.getTime();
                        claims.save();
                        return;
                };
            };
        });


        // save a claim

        nutella.net.subscribe('save_temp_claim',function (message,from) {
//          var portal = message.portal; 
            var d = new Date();
            var instance = message.instance;
            var first = message.first;
            var second = message.second;
            var thisClaim;
            for (var i=claims.data.length-1; i>=0; i--){
                thisClaim = claims.data[i];
                if (thisClaim.instance == instance && 
                    thisClaim.source == first && 
                    thisClaim.destination == second
                    && thisClaim.status == 'saved'){
                        claims.data.splice(i, 1);
                }
            }
            claims.data.push({
                instance: message.instance,
                source: message.source,
                relationship: message.relationship,
                destination: message.destination,
                reasoning: message.reasoning,
                figure1: message.figure1,
                figure2: message.figure2,
                figure3: message.figure3,
                timestamp: d.getTime(),
                status: 'saved'
            });
            claims.save();

        });



        nutella.net.handle_requests('fetch_one_claim',function (message,from) {
//          var portal = message.portal; 
            var instance = message.instance;
            var first = message.first;
            var second = message.second;
            var thisClaim;
            for (var i=claims.data.length-1; i>=0; i--){
                thisClaim = claims.data[i];
                if (thisClaim.instance == instance && thisClaim.source == first && thisClaim.destination == second){
                    console.log(thisClaim);
                    return (thisClaim);
                }
            }

            return ({});

        });




        nutella.net.handle_requests('get_mfw_and_claims',function (message,from) {
            var c = [];
            for (var i=0; i<claims.data.length; i++){
                if (!claims.data[i].hasOwnProperty('status')) claims.data[i].status = 'active';
                if (claims.data[i].status == 'active') c.push(claims.data[i]);
            };
            claims.save();
            return {mfw: mfw.data[mfw.data.length-1], claims: c};
        });


  // { instance:1, 
  // source: 7, destination:9, 
  // relationship: "eats", reasoning: "ABC", 
  // figure1: "none", figure2: "none", figure3: "none"}

    });
  });
});


