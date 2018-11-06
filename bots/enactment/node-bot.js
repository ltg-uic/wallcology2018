var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);
// Optionally you can set the resource Id
nutella.setResourceId('my_resource_id');

//All these need to be in a Mongo configuration file.

var N_ECOSYSTEMS = 5;
var TEMPERATURE_DELTA;
var HUMIDITY_DELTA;
var COLONIZER_EFFECT = 5.0;
var TRAP_EFFECT = 0.2;
var SEED_EFFECT = 5;
var HERBICIDE_EFFECT = .2;
var RESOURCE_EXTINCTION_THRESHHOLD = .1;
var ANIMAL_POPULATION_MAXIMUM = 10;
var ANIMAL_EXTINCTION_THRESHHOLD = .01;
var COLONIZE_MINIMUM = 2;
var RESOURCE_MINIMUM = 20;
var RESOURCE_MAXIMUM = 100;

// the "ot" table specifies the fraction of total habitat that is
// lost due to occlusion by drywall. so ot.brick[0].left = .25 means
// that if you slide in the left drywall, you'll lose 25% of the total
// brick in the ecosystem.
// this should be removed and made into a mongo table


var ot =    {   brick:  [
                        {left:.5,top:.75,right:.25,bottom:0},
                        {left:.25,top:0,right:.5,bottom:.25},
                        {left:.5,top:0,right:.5,bottom:.5},
                        {left:.5,top:.5,right:0,bottom:0},
                        {left:0,top:.5,right:.5,bottom:.5}
                        ],
                wood:   [
                        {left:.25,top:0,right:.25,bottom:.5},
                        {left:.5,top:.75,right:.25,bottom:.25},
                        {left:.25,top:.5,right:.25,bottom:.25},
                        {left:.0,top:.25,right:.75,bottom:.5},
                        {left:.5,top:.25,right:.25,bottom:.25}
                        ]
            };



var delayBetweenSteps;

var m = {}; // model (constant)
var a = []; // abiotic states (temperature, humidity, drywall, thermostat, humidistat, wood, brick)
var b = []; // biotic states (populations)

var RUNNING=false;


nutella.net.handle_requests('running', function(request) {
    return RUNNING;
});

console.log('got at least here'); setTimeout(all,30000);
function all() {
    nutella.net.request('read_population_model',{}, function(response, from){
    console.log('gets started');
    m = response;
    nutella.net.request('last_state',{}, function(reply, from){
        console.log('gets last state');

        // unpack the last state

        a = reply['abiotic'];
        b = reply['biotic'];
        RUNNING = true; crank();
        setInterval(crank, 10*60*1000); // else setInterval(crank, 40*60*1000);


        // subscribe to abiotic controls

        nutella.net.subscribe('thermostat', function(message, from) {
            a[message['ecosystem']]['thermostat']=message['value'];
            nutella.net.publish('state_update',{abiotic:a,biotic:b});
        });

        nutella.net.subscribe('humidistat', function(message, from) {
            a[message['ecosystem']]['humidistat']=message['value'];
        });
        nutella.net.subscribe('wall', function(message, from) { console.log(message);
            a[message['ecosystem']][message['side']]=message['direction'];
            if (message['direction'] == 'in') { console.log('point 2');
                a[message['ecosystem']]['wood']-=ot['wood'][message['ecosystem']][message['side']];
                a[message['ecosystem']]['brick']-=ot['brick'][message['ecosystem']][message['side']]; 
                nutella.net.publish('state_update',{abiotic:a,biotic:b});
            }
            else if (message['direction'] == 'out') {
                a[message['ecosystem']]['wood']+=ot['wood'][message['ecosystem']][message['side']];
                a[message['ecosystem']]['brick']+=ot['brick'][message['ecosystem']][message['side']];
                nutella.net.publish('state_update',{abiotic:a,biotic:b});
            }
            else console.log("set-wall direction neither 'in' nor 'out': " + message['direction']);
        });

        // subscribe to biotic controls

        nutella.net.subscribe('colonize', function(message, from) {
            b[message['ecosystem']][message['species']]*=COLONIZER_EFFECT;
            if  (b[message['ecosystem']][message['species']] < COLONIZE_MINIMUM) 
                b[message['ecosystem']][message['species']] = COLONIZE_MINIMUM; 
            if (b[message['ecosystem']][message['species']] > ANIMAL_POPULATION_MAXIMUM) b[message['ecosystem']][message['species']] = ANIMAL_POPULATION_MAXIMUM; 
            setTimeout(function () { nutella.net.publish('state_update',{abiotic:a,biotic:b}); }, 60*1000);
        });

        nutella.net.subscribe('trap', function(message, from) {
            b[message['ecosystem']][message['species']]*=TRAP_EFFECT; 
            if  (b[message['ecosystem']][message['species']] < ANIMAL_EXTINCTION_THRESHHOLD) b[message['ecosystem']][message['species']] = 0; 
            // nutella.net.publish('state_update',{abiotic:a,biotic:b});
            setTimeout(function () { nutella.net.publish('state_update',{abiotic:a,biotic:b}); }, 60*1000);
        });

        nutella.net.subscribe('seed', function(message, from) { console.log ('got seed');
            b[message['ecosystem']][message['species']]*=SEED_EFFECT;
            if  (b[message['ecosystem']][message['species']] < RESOURCE_MINIMUM) 
                b[message['ecosystem']][message['species']] = RESOURCE_MINIMUM; 
            if  (b[message['ecosystem']][message['species']] > 100) b[message['ecosystem']][message['species']] = 100; 
            setTimeout(function () { nutella.net.publish('state_update',{abiotic:a,biotic:b}); }, 60*1000);
       });

        nutella.net.subscribe('herbicide', function(message, from) {
            b[message['ecosystem']][message['species']]*=HERBICIDE_EFFECT; 
            if  (b[message['ecosystem']][message['species']] < RESOURCE_EXTINCTION_THRESHHOLD) b[message['ecosystem']][message['species']] = 0; 
            setTimeout(function () { nutella.net.publish('state_update',{abiotic:a,biotic:b}); }, 60*1000);
        });

        nutella.net.subscribe('stop_simulation', function(message, from) {
            RUNNING = false; console.log('stop simulation');
        });

        nutella.net.subscribe('start_simulation', function(interval, from) {
            console.log('start simulation'); 
            RUNNING = true;
            crank();
        });


    });

});
};




function crank () {
    if (RUNNING){
        for (var i=0; i<N_ECOSYSTEMS; i++) {

            // // adjust temperatures as needed

            // if (a[i]['temperature']+TEMPERATURE_DELTA < a[i]['thermostat']) a[i]['temperature'] += TEMPERATURE_DELTA;
            //     else if (a[i]['temperature']-TEMPERATURE_DELTA > a[i]['thermostat']) a[i]['temperature'] -= TEMPERATURE_DELTA;
            // if (a[i]['humidity']+HUMIDITY_DELTA < a[i]['humidistat']) a[i]['humidity'] += HUMIDITY_DELTA;
            //     else if (a[i]['humidity']-HUMIDITY_DELTA > a[i]['humidistat']) a[i]['humidity'] -= HUMIDITY_DELTA;

            // // run the simulation cycle for ecosystem i

            b[i] = cycleSimulation(m,a[i],b[i]);
        }
        nutella.net.publish('state_update',{abiotic:a,biotic:b});
        // var b2 = [];
        // for (var j=0; j<11; j++) b2[j] = b[j];
        // b2[4] = .35 + b[4] * .65;
        // b2[5] = .35 + b[5] * .65;
        // b2[9] = .20 + b[9] * .80;
        // nutella.net.publish('Astate_update',{abiotic:a,biotic:b});
    }
};


    function modelToTemp (t) {
        return (10+t*20);
    }

    function modelToHumidity (h) {
        return (h*100);
    }

    function humidityToModel (h) {
        return (h/100);
    }

    function tempToModel (t) {
        return ((t-10)/20);
    }



function cycleSimulation(Model,Environment,Populations) {

    var next_population = [];
    var sum1;
    var sum2;
    var exponent;


    function M(parameter,index1,index2,index3) {
        var t = tempToModel(Environment['temperature']);
        var b = Environment['brick']*100*4/9;
        var w = Environment['wood']*100*4/9;
        var h = humidityToModel(Environment['humidity']);
        if (M.arguments.length == 2) return (eval(Model[parameter][index1]));
        if (M.arguments.length == 3) return (eval(Model[parameter][index1][index2]));
        if (M.arguments.length == 4) return (eval(Model[parameter][index1][index2][index3]));
        return ({});
    }

    function P(trophicLevel,index){
        return Populations[M('community',trophicLevel,index)];
    }

    function nP(trophicLevel,index,value) {
        var ti = M('community',trophicLevel,index);
        next_population[ti] = value;
        if (value < M('minimumPopulation',ti)/1) next_population[ti] = 0;
//        if (value > M('maximumPopulation',ti)) next_population[ti] = M('maximumPopulation',ti);
    }

//  do the resources

    for (var i = 0; i < M('community','resources').length; i++) {
        sum1 = 0; sum2 = 0; 
        for (var j = 0; j < M('community','resources').length; j++) 
                sum1 += (M('alpha',i,j) * P('resources',j)); 
        for (var k = 0; k < M('community','herbivores').length; k++) 
                sum2 += ((M('a',i,k) * P('herbivores',k)) / (1 + M('q',k) * P('herbivores',k)));
        exponent = M('r',i) * (M('K',i) - sum1)/(1 + M('K',i)) - sum2;
        nP('resources',i,P('resources',i) * Math.exp(exponent/2));
    }

//  do the herbivores

    for (var i=0; i < M('community','herbivores').length; i++) {
        sum1 = 0; sum2 = 0; 
        for (var j=0; j < M('community','resources').length; j++) 
                sum1 += (M('a',j,i) * P('resources',j))/(1 + M('q',i) * P('herbivores',i)); 
        for (var k=0; k < M('community','predators').length; k++) 
                sum2 += (M('m',i,k) * P('predators',k)) / (1 + M('s',k) * P('predators',k));
        exponent = M('b',i) * sum1 - M('d',i) - sum2;
        var next_index = M('community', 'resources',i);
        nP('herbivores',i,P('herbivores',i) * Math.exp(exponent/5));
    }

//  do the predators

    for (var i=0; i < M('community','predators').length; i++) {
        sum1 = 0; 
        for (var j=0; j < M('community','herbivores').length; j++) 
            sum1 += (M('m',j,i) * P('herbivores',j))/(1 + M('s',i) * P('predators',i));
        exponent = M('beta',i) * sum1 - M('delta',i);
        nP('predators',i,P('predators',i) * Math.exp(exponent/.25));
    }

    return (next_population);
}
