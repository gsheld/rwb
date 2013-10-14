  var lat;
  var long;

  if (navigator.geolocation)  {
        navigator.geolocation.getCurrentPosition(Start);
  }

  function Start(location)
  {
   var lat = location.coords.latitude;
   var long = location.coords.longitude;

    var opinion = document.getElementById("GiveOpinion");

    opinion.innerHTML += '<form name="input" action="rwb.pl?" method="get">'+
                         '<input type="hidden" name="long" value='+ long+'>'+
                         '<input type="hidden" name="lat" value='+ lat+ '>'+
                         '<input type="hidden" name="run" value="1" />'+
                         '<input type="hidden" name="act" value="give-opinion-data" />'+
                         '<input type="textfield" name="opinion">'+
                         '<input type="submit" value="Submit">'+
                         '</form>';


  }
