///
// Global state
//
// map     - the map object
// usermark- marks the user's position on the map
// markers - list of markers on the current map (not including the user position)
// 
//

//
// First time run: request current location, with callback to Start
//
if (navigator.geolocation)  {
    navigator.geolocation.getCurrentPosition(Start);
}

var row, myCycles="", cycleCount = 0;

function UpdateList()
{

  var newCycle = document.PrintCycles.chosen_cycles.value; 

  if(myCycles.indexOf(newCycle)== -1){

    if(myCycles!=""){myCycles+=',';}

    myCycles+=newCycle;   

    var table=document.getElementById("cycleTable"); 
   
   if (cycleCount % 2 == 0) {
    row=table.insertRow(-1);
    var cell1=row.insertCell(0);
    cell1.innerHTML=newCycle;
    }
   else {
   var cell2 = row.insertCell(1);
   cell2.innerHTML = newCycle;
   cell2.width = "50%";		
   }
    cycleCount++;
    ViewShift(); 
  }

}

function deleteCycles()
{
  cycleCount = 0;
  myCycles = "";
  
  var table=document.getElementById("cycleTable");
   
  while(table.rows.length!=1)
  {
    table.deleteRow(1);
  }

  ViewShift();
}

function UpdateMapById(id, tag) {

    var target = document.getElementById(id);
    var data = target.innerHTML;

    var rows  = data.split("\n");
   
    for (i in rows) {
	var cols = rows[i].split("\t");
	var lat = cols[0];
	var long = cols[1];

	markers.push(new google.maps.Marker({ map:map,
						    position: new google.maps.LatLng(lat,long),
						    title: tag+"\n"+cols.join("\n")}));
	
    }
}

function ClearMarkers()
{
    // clear the markers
    while (markers.length>0) { 
	markers.pop().setMap(null);
    }
}




function UpdateMap()
{
    var color = document.getElementById("color"),
        indDem = document.getElementById("indDem"),
        indRep = document.getElementById("indRep"),
	comDem = document.getElementById("comDem"),
	comRep = document.getElementById("comRep");	
    
    color.innerHTML="<b><blink>Updating Display...</blink></b>";
    color.style.backgroundColor='white';

    ClearMarkers();
    color.innerHTML = 'Ready';

    if (document.dataSelection.comm.checked) {
	UpdateMapById("committee_data","COMMITTEE");
	if (comDem.value > comRep.value)
	   color.style.backgroundColor = 'blue';
	else if (comDem.value < comRep.value)
	   color.style.backgroundColor = 'red';
	else
	   color.style.backgroundColor = 'white';
	
    };
    
    if (document.dataSelection.cand.checked)
    {UpdateMapById("candidate_data","CANDIDATE");};
    
    if (document.dataSelection.ind.checked)
    {UpdateMapById("individual_data", "INDIVIDUAL");};
   
    if (document.dataSelection.opin.checked) 
    {UpdateMapById("opinion_data","OPINION");};


	 


   
/*    if (Math.random()>0.5) { 
	color.style.backgroundColor='blue';
    } else {
	color.style.backgroundColor='red';
    }
*/
}

function NewData(data)
{
  var target = document.getElementById("data");
  
  target.innerHTML = data;

  UpdateMap();

}

function ViewShift()
{
    var bounds = map.getBounds();

    var ne = bounds.getNorthEast();
    var sw = bounds.getSouthWest();

    var color = document.getElementById("color");

    color.innerHTML="<b><blink>Querying...("+ne.lat()+","+ne.lng()+") to ("+sw.lat()+","+sw.lng()+")</blink></b>";
    color.style.backgroundColor='white';
   
    var groupString="";
    if (document.dataSelection.comm.checked)
    {groupString+="committees";};
    if (document.dataSelection.cand.checked)
    {
      if (groupString!=""){groupString+=",";};
      groupString+="candidates";
    };
    if (document.dataSelection.ind.checked)
    {
      if (groupString!=""){groupString+=",";};
      groupString+="individuals";
    };
    if (document.dataSelection.opin.checked)
    {
      if (groupString!=""){groupString+=",";};
      groupString+="opinions";
    };
    
    // debug status flows through by cookie
   
   
    $.get("rwb.pl?act=near&latne="+ne.lat()+"&longne="+ne.lng()+"&latsw="+sw.lat()+"&longsw="+sw.lng()+"&format=raw&what="+groupString+"&cycles="+myCycles, NewData);
 
}


function Reposition(pos)
{
    var lat=pos.coords.latitude;
    var long=pos.coords.longitude;

    map.setCenter(new google.maps.LatLng(lat,long));
    usermark.setPosition(new google.maps.LatLng(lat,long));
}

function getPosition()
{
  navigator.geolocation.getCurrentPosition(GiveMyOpinion);

}

function Start(location) 
{
  var lat = location.coords.latitude;
  var long = location.coords.longitude;
  var acc = location.coords.accuracy;
  
  var mapc = $( "#map");

  map = new google.maps.Map(mapc[0], 
			    { zoom:16, 
				center:new google.maps.LatLng(lat,long),
				mapTypeId: google.maps.MapTypeId.HYBRID
				} );

  usermark = new google.maps.Marker({ map:map,
					    position: new google.maps.LatLng(lat,long),
					    title: "You are here"});

  markers = new Array;

  var color = document.getElementById("color");
  color.style.backgroundColor='white';
  color.innerHTML="<b><blink>Waiting for first position</blink></b>";

  var options = document.getElementById("options");
  options.style.backgroundColor='white';
  options.innerHTML= options.innerHTML + 
                     '<form name="dataSelection">' +
                     '<input type="checkbox" name="comm" onClick=ViewShift()> Committee Data<br>' +
                     '<input type="checkbox" name="cand" onClick=ViewShift()> Candidate Data<br>' +
                     '<input type="checkbox" name="ind" onClick=ViewShift()> Individual Data<br>' +
                     '<input type="checkbox" name="opin" onClick=ViewShift()> Opinion Data<br>' +
                     '</form>';
  options.innerHTML+='<table border="1" id="cycleTable"><th colspan = "2">Added Cycles</th></table>';

  google.maps.event.addListener(map,"bounds_changed",ViewShift);
  google.maps.event.addListener(map,"center_changed",ViewShift);
  google.maps.event.addListener(map,"zoom_changed",ViewShift);

  navigator.geolocation.watchPosition(Reposition);
    
}
