
var NUTELLA = require('nutella_lib');

// Get configuration parameters and init nutella
var cliArgs = NUTELLA.parseArgs();
var componentId = NUTELLA.parseComponentId();
var nutella = NUTELLA.init(cliArgs.broker, cliArgs.app_id, cliArgs.run_id, componentId);

var PING_INTERVAL = 60; //number of seconds between pings to keep clients alive

//======================
// keep clients alive
var pingcount = 0;
setInterval(ping, PING_INTERVAL*1000); //ping every minute
function ping () {
 nutella.net.publish('ping',pingcount++);
}
//======================


var portals = nutella.persist.getJsonObjectStore('portals');
portals.load();
if (!portals.hasOwnProperty('topID')){
    portals = {topID: 10, portalList: 
        [

            {ID:1,name:"designer",type:"administrative"},
            {ID:2,name:"educator",type:"participant"}

        ]
    };
    portals.save();
};

var instances = nutella.persist.getJsonObjectStore('instances');
instances.load();
if (!instances.hasOwnProperty('data')){ 
    instances = {
        data:[
            {portalID:1,topID:1,instanceList:[{ID:1,name:'designer'}]},
            {portalID:2,topID:1,instanceList:[{ID:1,name:'educator'}]}
        ]
    };
    instances.save();

};

var activities = nutella.persist.getJsonObjectStore('activities');
activities.load();
if (!activities.hasOwnProperty('topID')){
    activities = {topID: 1, activityList: [{ID:1,name:"planning"}]};
    activities.save();
};

var resources = nutella.persist.getJsonObjectStore('resources');
resources.load();
if (!resources.hasOwnProperty('topID')){
    resources = {topID: 300, resourceList: [

        {ID:1,name:'portal',description:'portal',link:'portal',query:'',type:"administrative"}, 
        {ID:2,name:'activity',description:'activity',link:'activity',query:'',type:"administrative"},
        {ID:3,name:'portals',description:'portals',link:'portals',query:'',type:"administrative"},
        {ID:4,name:'activities',description:'activities',link:'activities',query:'',type:"administrative"},
        {ID:5,name:'resources',description:'resources',link:'resources',query:'',type:"administrative"},
        {ID:6,name:'design',description:'design',link:'design',query:'',type:"administrative"},
        {ID:7,name:'instances',description:'instances',link:'instances',query:'',type:"administrative"},
        {ID:8,name:'unitname',description:'unitname',link:'unitname',query:'',type:"administrative"},
        {ID:9,name:'URLs',description:'URLs',link:'URLs',query:'',type:"administrative"}



    ]};

    resources.save();
};


var design = nutella.persist.getJsonObjectStore('design');
design.load();
if (!design.hasOwnProperty('data')){
    design = {data:[

        // designer 

        // {portalID:1,activityID:0,resourceID:1},
        {portalID:1,activityID:0,resourceID:2},
        {portalID:1,activityID:0,resourceID:3},
        {portalID:1,activityID:0,resourceID:4},
        {portalID:1,activityID:0,resourceID:5},
        {portalID:1,activityID:0,resourceID:6},
        {portalID:1,activityID:0,resourceID:7},
        {portalID:1,activityID:0,resourceID:8},
        {portalID:1,activityID:0,resourceID:9},

        // educator

        // {portalID:2,activityID:1,resourceID:1},
        {portalID:2,activityID:1,resourceID:2},
        {portalID:2,activityID:1,resourceID:3},
        {portalID:2,activityID:1,resourceID:5},
        {portalID:2,activityID:1,resourceID:7},
        {portalID:2,activityID:1,resourceID:8},
        {portalID:2,activityID:1,resourceID:9}

    ]};
    design.save();
};

var activity = nutella.persist.getJsonObjectStore('activity');
activity.load();
if (!activity.hasOwnProperty('ID')){
    activity = {ID:1,name:"planning"};
    activity.save();
};


var unitname = nutella.persist.getJsonObjectStore('unitname');
unitname.load();
if (!unitname.hasOwnProperty('name')){
    unitname = {name:"unit"};
    unitname.save();
};



console.log ('Completed initialization. Read Portals, Activities, Resources, Design, Activity, and Unit name');
console.log ('Listening for requests');

// all files loaded

// open request handlers

// these are used primarily by the distribution editor



nutella.net.handle_requests('get_portals', function (message, from){ console.log(portals);
    return (portals);
});
nutella.net.handle_requests('get_instances', function (message, from){
    return (instances);
});
nutella.net.handle_requests('get_activities', function (message, from){
    return (activities);
});
nutella.net.handle_requests('get_resources', function (message, from){
    return (resources);
});
nutella.net.handle_requests('get_design', function (message, from){
    return (design);
});
nutella.net.handle_requests('get_activity', function (message, from){
    return (activity);
});
nutella.net.handle_requests('get_unitname', function (message, from){
    return (unitname);
});

//  nutella bug? workaround: must redefine and reload json objects prior to saving them
//  




nutella.net.subscribe('set_portals', function (message, from){
    portals = nutella.persist.getJsonObjectStore('portals');
    portals.load();
    portals = message.portals;
    portals.save();
    instances = nutella.persist.getJsonObjectStore('instances');
    instances.load();
    instances = message.instances;
    instances.save();
    // nutella.net.publish('portals_set',portals);
    // nutella.net.publish('portals_set',message);
});

nutella.net.subscribe('set_instances', function (message, from){
    instances = nutella.persist.getJsonObjectStore('instances');
    instances.load();
    instances = message;
    instances.save();
    // nutella.net.publish('instances_set',instances);
    // nutella.net.publish('portals_set',message);
});
nutella.net.subscribe('set_activities', function (message, from){
    activities = nutella.persist.getJsonObjectStore('activities');
    activities.load();
    activities = message;
    activities.save();
    nutella.net.publish('activities_set',message);
    // nutella.net.publish('activities_set',activities);

    // nutella.net.publish('activities_set',message);
});
nutella.net.subscribe('set_resources', function (message, from){
    resources = nutella.persist.getJsonObjectStore('resources');
    resources.load();
    resources = message;
    resources.save();
    nutella.net.publish('resources_set',message);
    // nutella.net.publish('resources_set',resources);
    // nutella.net.publish('resources_set',message);
});
nutella.net.subscribe('set_design', function (message, from){
    design = nutella.persist.getJsonObjectStore('design');
    design.load();
    design = message;
    design.save();
    nutella.net.publish('design_set',message);
    // nutella.net.publish('design_set',design);
    // nutella.net.publish('design_set',message);
});
nutella.net.subscribe('set_activity', function (message, from){
    activity = nutella.persist.getJsonObjectStore('activity');
    activity.load();
    activity = message;
    activity.save();
    nutella.net.publish('activity_set',message);
    // nutella.net.publish('activity_set',activity);
});
nutella.net.subscribe('set_unitname', function (message, from){
    unitname = nutella.persist.getJsonObjectStore('unitname');
    unitname.load();
    unitname = message;
    unitname.save();
    // nutella.net.publish('unitname_set',unitname);
    // nutella.net.publish('unitname_set',message);
});


// nutella.net.subscribe('pwd', function (message, from){

    // const { exec } = require('child_process');
    // exec('cd ../..; echo "tim" > runs; nutella start tim', (err, stdout, stderr) => {
    //   if (err) {
    //     return;
    //   }
    // var s = stdout.split('\n');
    // var runs = [];

    // for (var i=1; i<s.length-1; i++){
    //     runs.push(s[i].replace(/\s/g, ""));
    // }
    // console.log(runs);





    //   // the *entire* stdout and stderr (buffered)
    //   // console.log(`stdout: ${stdout}`);
    //   // console.log(`stderr: ${stderr}`);
    // });


// });







