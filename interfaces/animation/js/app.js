/*==============================================================================
 #    Program Name: App.js
 #          Author: Kyle Reese Almryde
 #            Date: 10/10/2015
 #         Revised: 10/04/2016
 #
 #     Description:
 #        Establishes and communicates between the Unity3D visualization and
 #        Nutella. Handles updates from the simulation and passes them along to
 #        the Unity visualization.
 #
 #    Deficiencies:
 #       None. This program meets specifications
 #
 #==============================================================================
 #                            GLOBAL VAR DECLARATIONS
 #=============================================================================*/

var nutella,
    unity3d,
    WallscopeID;


/*==============================================================================
 #                             START OF MAIN
 #=============================================================================*/

function Start() {     

    // instantiate the Nutella components
    initNutellaComponents();

    // initialize the unity WebPlayer
    initWebPlayer();

}

/*==============================================================================
 #                            FUNCTION DEFINITIONS
 #=============================================================================*/

// Instantiate the Nutella components
function initNutellaComponents() {
    console.log("wcV5! Connecting Nutella");
    // Parse the query parameters
    var query_parameters = NUTELLA.parseURLParameters();
    console.log(query_parameters);
    // WallscopeID = query_parameters.INSTANCE || 0;

    WallscopeID = top.instance.name; //this is a horrible hack 
    if (isNaN(WallscopeID)) WallscopeID = 0; else WallscopeID--;


    console.log('wallscope: ' + WallscopeID)

    // Get an instance of nutella.
    nutella = NUTELLA.init(
        query_parameters.broker,
        query_parameters.app_id,
        query_parameters.run_id,
        NUTELLA.parseComponentId()
    );

    // (Optional) Set the resourceId
    nutella.setResourceId('wallscope_vis');

    // return WallscopeID;
};


function initWebPlayer() {
    var config = {
        width: window.innerWidth, // 960,
        height: window.innerHeight, // 600,
        params: {
            enableDebugging: "1"
        }
    };

    unity3d = new UnityObject2(config);

    var url = "build/wallscope" + WallscopeID.toString() + "/wallscope" + WallscopeID.toString() + ".unity3d";
    // var url = "build/demo/demo.unity3d";

    console.log("Start WebPlayer");
    jQuery(function() {


        var $missingScreen = jQuery("#unityPlayer").find(".missing");
        var $brokenScreen = jQuery("#unityPlayer").find(".broken");
        $missingScreen.hide();
        $brokenScreen.hide();

        var installPlugin = function(e) {
            e.stopPropagation();
            e.preventDefault();
            unity3d.installPlugin();
            return false;
        };

        unity3d.observeProgress(function(progress) {
            switch (progress.pluginStatus) {
                case "broken":
                    $brokenScreen.find("a").click(installPlugin);
                    $brokenScreen.show();
                    break;
                case "missing":
                    $missingScreen.find("a").click(installPlugin);
                    $missingScreen.show();
                    break;
                case "installed":
                    $missingScreen.remove();
                    break;
                case "first":
                    break;
            }
        });
        console.log("url is", url);
        // recieve wallscope #, grab appropriate program.
        unity3d.initPlugin(jQuery("#unityPlayer")[0], url);
    });
};



/*==============================================================================
 #                       NUTELLA MESSAGE HANDLERS
 #=============================================================================*/

// Handles most recent state of simulation

function Last_State_Handler(response) {
    console.log("Last_State_Handler called!");
    Unity.SetEcosystemText( Number(WallscopeID) + 1); // Sets the Ecosystem ID


    var json = { "echo": "hello hello" };
    nutella.net.publish('scope_ping', json);

    State_Update_Handler(response); // at least until I can come up with a more thoughtful way of adding critters in place.


    var lastState = sanitizeResponse(response),
        Abiotic = lastState['abiotic'][WallscopeID];

    Unity.SetDryWall('left', Abiotic['left']);
    Unity.SetDryWall('right', Abiotic['right']);
    Unity.SetDryWall('top', Abiotic['top']);
    Unity.SetDryWall('bottom', Abiotic['bottom']);
}

// Handles the regular updates
function State_Update_Handler(response) {

    var updatedState = sanitizeResponse(response),
        Biotic = updatedState['biotic'][WallscopeID],
        Abiotic = updatedState['abiotic'][WallscopeID];

    console.log("\tState_Update!", Date(updatedState["timestamp"]), updatedState);
    // Send messages to Unity
    UpdatePopulations(Biotic);

    console.log("\tSpecies Record Updated! ");

    Unity.SetThermostatText(Abiotic['thermostat']);
    Unity.SetTemperatureText(Abiotic['temperature']);
}

// k4 = .35 + (t4/100) *.65

// [12:55]
// k10 = t10/100

// [12:56]
// k9 = .20 + (t9/100) * .80

// [12:58]
// k = kyle’s transformed value, t = the raw value tom sends you

function UpdatePopulations(Biotic) {
    // Send messages to Unity
    for (var species = 0; species < Biotic.length; species++) {
        var count = 0,
            rawPopulation = Biotic[species];

        // Vegetation
        if ( [ 4,5,9,10].includes(species) ) {

            var newLevel = rawPopulation;
            if(rawPopulation === 0)
                newLevel = 0;
            else {
                if (species === 10 )
                    newLevel = (rawPopulation / 100.0)
                else if (species === 9)
                    newLevel = 0.20 + (rawPopulation / 100.0) * 0.80
                else //if (species === 4 || species === 5)
                    newLevel = 0.35 + (rawPopulation / 100.0) * 0.65
            }
            // newLevel = (rawPopulation > 35.0)?
            // count = (rawPopulation / 100.0);  // As long as it is not Zero
            Unity.SetVegetationLevel(species, newLevel);
        }
        //Critters
        else {
            // Predators
            if ( [1,3,8].includes(species) )
                count = parseInt(Math.round(rawPopulation * 10));
            // Herbivores
            else if ( [0,2,6,7].includes(species) )
                count = parseInt(Math.round(rawPopulation * 100));

            Unity.SetSpeciesRecordCount(species, (count > 100 ? 100 : count));
        }

        console.log("state_update", species, count);
        // unity3d.getUnity().SendMessage("Habitat", "jsGetPopulationCount", i );
    }
}


/*==============================================================================
 #                        MESSAGE HANDLERS
 #                       UNITY->Javascript
 #             These functions are called from WITHIN Unity!
 #=============================================================================*/

var TellJs = {

    ActivateWallScope: function() { // Allows Unity to tell us its ready
        console.log("TellJs.ActivateWallScope:  Unity is READY!!");

        // Make an Immediate request for the last state. This will let us update
        // the wallscope to its previous state should we suffer a crash.
        nutella.net.request('last_state', {}, Last_State_Handler);

        // Subscribe to the channel and wait for updates.
        //                      last_animation_state
        nutella.net.subscribe('state_update', State_Update_Handler);
    },

    SubscribeToEventsChannel: function() {
        console.log("TellJs.SubscribeToEventsChannel was called from Unity!!");

        nutella.net.subscribe('thermostat', function(response) {
            var cleaned = sanitizeResponse(response);
            console.log('channel-thermostat', cleaned);
            Unity.SetThermostatText(cleaned['value']);
        })

        nutella.net.subscribe('wall', function(response) {
            console.log('channel-wall', response);

            var cleaned = sanitizeResponse(response);
            if (cleaned['ecosystem'] === WallscopeID)
                Unity.SetDryWall(cleaned['side'], cleaned['direction']);
        })

        nutella.net.subscribe('seed', function(response) {
            console.log('channel-seed', response);
            var cleaned = sanitizeResponse(response);
            if (cleaned['ecosystem'] === WallscopeID)
                Unity.CallCropSeeder(cleaned['species']);
        })

        nutella.net.subscribe('herbicide', function(response) {
            console.log('channel-herbicide', response);
            var cleaned = sanitizeResponse(response);
            if (cleaned['ecosystem'] === WallscopeID)
                Unity.CallCropDuster(cleaned['species']);
        })

        nutella.net.subscribe('colonize', function(response) {
            console.log('channel-colonize', response);
            var cleaned = sanitizeResponse(response);
            if (cleaned['ecosystem'] === WallscopeID)
                Unity.PlaceColony(cleaned['species']);
        })

        nutella.net.subscribe('trap', function(response) {
            console.log('channel-trap', response);
            var cleaned = sanitizeResponse(response);
            if (cleaned['ecosystem'] === WallscopeID)
                Unity.PlaceTrap(cleaned['species'])
        })
    }
}

/*==============================================================================
 #                         MESSAGE REQUESTS
 #                       Javascript -> UNITY
 #               These functions Send messages TO Unity
 #
 #     unity3d.getUnity().SendMessage("GameObject", "MethodName", param)
 #=============================================================================*/
var Unity = {

    Scope_Ping: function(message) {
        console.log("Javascript got the Scope_Ping:", message)
        unity3d.getUnity().SendMessage("Habitat_Events", "Scope_Ping", message)
    },


    // param packaged is a string containing the critter ID and count
    // this function is c: function(species multiple times for each entry in the species record
    SetSpeciesRecordCount: function(species, count) {
        var packaged = species.toString() + " " + count.toString();
        unity3d.getUnity().SendMessage("Habitat", "jsUpdateSpeciesRecord", packaged);
    },


    SetVegetationLevel: function(species, count) {
        var name = '';
        switch(species) {
            case 9: name = 'V1_amount'; break
            case 5: name = 'V2_amount'; break
            case 4: name = 'V3_amount'; break
            case 10: name = 'V4_amount'; break
        }
        var packaged = name + " " + count.toString();
        unity3d.getUnity().SendMessage("Ground_Resource", "jsSetVegetationLevel", packaged);
    },

    // Sets the Thermostat GUI Text display
    SetThermostatText: function(thermo) {
        thermo = thermo.toString();
        console.log("Thermostat is", thermo);
        // unity3d.getUnity().SendMessage("Thermostat", "SetText", thermo);
        unity3d.getUnity().SendMessage("Thermostat", "SetText", '');
    },

    // Sets the Temperature GUI Text display
    SetTemperatureText: function(temp) {
        // temp = Math.abs(Math.round(temp * 100) / 100);
        // temp = temp.toString() + "˚C";
        temp = temp.toString() + "";
        // temp = "";
        console.log("Temperature is", temp);
        // unity3d.getUnity().SendMessage("Temperature", "SetText", 'temp');
        unity3d.getUnity().SendMessage("Temperature", "SetText", '');
    },

    // Sets the Ecosystem GUI Text display
    SetEcosystemText: function(habitatID) {
        habitatID = habitatID.toString();
        // habitatID = "";
        // console.log("habitatIDity is", habitatID);
        unity3d.getUnity().SendMessage("Ecosystem", "SetText", "Ecosystem: " + habitatID);
    },

    // tells Unity to display the side and amount of drywall
    // requires unity to unpack arguments
    SetDryWall: function(side, direction) {
        // need to combine the inputs since we cant send more than one argument
        unity3d.getUnity().SendMessage("Habitat_Events", "SetDrywall", side + " " + direction);
    },

    // Accesses the Unity GameObject called 'Habitat_Events' and executes the
    // PositionCritterTrap method, supplying the Trap ID #
    PlaceTrap: function(uID) {
        var id = parseInt(uID)
        unity3d.getUnity().SendMessage("Habitat_Events", "PositionCritterTrap", id);
    },

    // Accesses the Unity GameObject called 'Habitat_Events' and executes the
    // PositionCritterColony method, supplying the Colony ID #
    PlaceColony: function(uID) {
        var id = Number(uID)
        console.log("PositionCritterColony", id);
        unity3d.getUnity().SendMessage("Habitat_Events", "PositionCritterColony", id);
    },

    // Accesses the Unity GameObject called 'Habitat_Events' and executes the
    // CallCropDuster method, supplying the CropDuster ID #
    CallCropDuster: function(uID) {
        var id = parseInt(uID)
        unity3d.getUnity().SendMessage("Habitat_Events", "CallCropDuster", id);
    },

    CallCropSeeder: function(uID) {
        var id = parseInt(uID)
        unity3d.getUnity().SendMessage("Habitat_Events", "CallCropSeeder", id);
    }


    /* Decprecated Function
        StartPopulationTracker: function() {
            var id = parseInt(uID)
            unity3d.getUnity().SendMessage("Habitat", "UpdatePopulationCounts", "");
        },

        RequestPopulationCount: function(uID) {
            // Calls UNITY requesting Population
            var id = parseInt(uID)
            unity3d.getUnity().SendMessage("Habitat", "GetPopulationCount", id);
        },

        SpawnCritter: function(id) {
            console.log("Lets make a " + id.toString() + "! ", typeof id);
            unity3d.getUnity().SendMessage("Habitat", "SpawnCritter", id);
        },

        KillCritter: function(id) {
            console.log("Killing " + id.toString() + " softly!");
            unity3d.getUnity().SendMessage("Habitat", "KillCritter", id);
        },

        RequestVegetationPresence: function(uID) {
            var scaleLevel = Last_State['populations'][0][+uID];
            console.log("RequestVegetationPresence!", uID, scaleLevel);
            var scaleString = scaleLevel = scaleLevel.toString();

            if (scaleString.includes('e')) {
                scaleLevel = 0.0001;
                console.log("Made an adjustment!", scaleString);
            };
            console.log("\tRequestVegetationPresence!", uID, scaleLevel);
            unity3d.getUnity().SendMessage("Habitat", "ScaleVegetation", scaleLevel.toString() + " " + uID.toString());
        }
    */
}



/*==============================================================================
 #                         HELPER FUNCTIONS
 #=============================================================================*/

// Convert the response to an Object in the event that its a string
function sanitizeResponse(response) {
    if (typeof response === 'string')
        return JSON.parse(response);
    else if (typeof response === 'object')
        return response;

}