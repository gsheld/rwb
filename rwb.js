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

function ShowAnalysis()
{
 

  if (document.dataSelection.showData[0].checked && document.dataSelection.comm.checked){

      if (parseInt(document.getElementById("comDem").value) > parseInt(document.getElementById("comRep").value)) {
         color.style.backgroundColor='blue';
      } else if (parseInt(document.getElementById("comDem").value) < parseInt(document.getElementById("comRep").value)) {
         color.style.backgroundColor='red';
      }
      else {
         color.style.backgroundColor='white';
       
      }

      color.innerHTML="Ready<br>";
      color.innerHTML+="Democratic Money in View: $" + document.getElementById("comDem").value + "<br>";
      color.innerHTML+="Rebuplican Money in View: $" + document.getElementById("comRep").value;

   }

   if (document.dataSelection.showData[1].checked && document.dataSelection.ind.checked){

     if (parseInt(document.getElementById("indDem").value) > parseInt(document.getElementById("indRep").value)) {
         color.style.backgroundColor='blue';
     } else if (parseInt(document.getElementById("indDem").value) < parseInt(document.getElementById("comRep").value)) {
         color.style.backgroundColor='red';
     }

     color.innerHTML="Ready<br>";
     color.innerHTML+="Democratic Money in View: $" + document.getElementById("indDem").value + "<br>";
     color.innerHTML+="Rebuplican Money in View: $" + document.getElementById("indRep").value;

   }

   if (document.dataSelection.showData[2].checked && document.dataSelection.opin.checked){

     if (parseFloat(document.getElementById("opinionAvg").value)>0) {
         color.style.backgroundColor='blue';
     } else if (parseFloat(document.getElementById("opinionAvg").value)<0) {
         color.style.backgroundColor='red';
     }

     color.innerHTML="Ready<br>";
     color.innerHTML+="Average Opinion (-1 for Rep, 1 for Dem): " +
          parseFloat(document.getElementById("opinionAvg").value).toFixed(5) + "<br>";
     color.innerHTML+="Standard Deviation of Opinions in Area: " +
          parseFloat(document.getElementById("opinionStddev").value).toFixed(5);

   }
}
  

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
    
    document.dataSelection.comm.disabled=false;
    document.dataSelection.cand.disabled=false;
    document.dataSelection.ind.disabled=false;
    document.dataSelection.showData[0].disabled=false;
    document.dataSelection.showData[1].disabled=false;

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
  document.dataSelection.comm.disabled=true;
  document.dataSelection.cand.disabled=true;
  document.dataSelection.ind.disabled=true;
  document.dataSelection.showData[0].disabled=true;
  document.dataSelection.showData[1].disabled=true;
  document.dataSelection.comm.checked=false;
  document.dataSelection.cand.checked=false;
  document.dataSelection.ind.checked=false;
  document.dataSelection.showData[0].checked=false;
  document.dataSelection.showData[1].checked=false;
  
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
    var color = document.getElementById("color");
    
    color.innerHTML="<b><blink>Updating Display...</blink></b>";
    color.style.backgroundColor='white';

    ClearMarkers();

    if (document.dataSelection.comm.checked)
    {UpdateMapById("committee_data","COMMITTEE");};
    
    if (document.dataSelection.cand.checked)
    {UpdateMapById("candidate_data","CANDIDATE");};
    
    if (document.dataSelection.ind.checked)
    {UpdateMapById("individual_data", "INDIVIDUAL");};
   
    if (document.dataSelection.opin.checked) 
    {UpdateMapById("opinion_data","OPINION");};


    color.innerHTML="Ready<br>";
   
    ShowAnalysis();

   
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
                     '<input type="checkbox" name="comm" onClick=ViewShift() disabled=true> Committee Data' + 
                     '<input type="radio" name="showData" onClick=ShowAnalysis() value="c" disabled=true> Analyze Data<br>' +
                     '<input type="checkbox" name="cand" onClick=ViewShift() disabled=true> Candidate Data<br>' +
                     '<input type="checkbox" name="ind" onClick=ViewShift() disabled=true> Individual Data' + 
                     '<input type="radio" name="showData" onClick=ShowAnalysis() value="i" disabled=true> Analyze Data<br>' + 
                     '<input type="checkbox" name="opin" onClick=ViewShift()> Opinion Data' + 
                     '<input type="radio" name="showData" onClick=ShowAnalysis() value="o"> Analyze Data<br>' +
                     '</form>';
  options.innerHTML+='<table border="1" id="cycleTable"><th colspan = "2">Added Cycles</th></table>';

  google.maps.event.addListener(map,"bounds_changed",ViewShift);
  google.maps.event.addListener(map,"center_changed",ViewShift);
  google.maps.event.addListener(map,"zoom_changed",ViewShift);

  navigator.geolocation.watchPosition(Reposition);
    
}

