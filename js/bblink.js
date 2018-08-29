  $(document).ready(function() {
    
    var bbUser;
    if (typeof $.cookie('bbUser') === 'undefined'){
      // similar behavior as an HTTP redirect
      window.location.replace("login.html");
    } else {
      bbUser = JSON.parse($.cookie('bbUser'));
    }

    $("#idMessageBox").val('');
    var msgExisting = [];
    var msgNew = [];
    
    var dtLastGet = new Date();
        dtLastGet.setDate(dtLastGet.getDate()-7);

    console.log('bblink started with LastGet: ' + dtLastGet);

                   // 2s    5s    10s    30s    1min   2min    5min    10min   15min   30min    1hr
    var pulseRates = [2000, 5000, 10000, 30000, 60000, 120000, 300000, 600000, 900000, 1800000, 3600000];
    var pulseSinceNew = 0;    
    var pulseActivity = 0;  
    var pulseTimeOut;

    function buildMsgList() {        
        pulseSinceNew++; 
        //1. main get async
        getNewMsg(bbUser, dtLastGet).done(function (result) {
          $.each( result, function( i, obj ){ 
            if (!containsMsgID(obj,msgExisting)) {
              msgExisting.push(obj);
              pushHTML(bbUser, obj);
              pulseSinceNew = 0;
              pulseActivity = 0;
              console.log('added to msgExisting: ' + obj._id);
            }                       
          });            
          console.log('Get complete (' + pulseRates[pulseActivity] + ')');
        });      

        //2. pulse algorithm in to determine activity spikes
        if (pulseSinceNew >= 10) {
          console.log('activity lvl change to: ' + pulseActivity);
          if (pulseActivity < pulseRates.length) { pulseActivity++; }
          pulseSinceNew = 0;
        }         
        
        //3. set LastGet date to now
        dtLastGet = new Date();
    }

    //set an outer pulse for the app to loop on.   
    (function pulse() {            
        buildMsgList();
        pulseTimeOut = setTimeout(pulse, pulseRates[pulseActivity]);
    })();

    //Send click main function
    $("#idSend").click(function() {
      var msgbody = $("#idMessageBox").val().trim();
      //clear textbox immediately
      $("#idMessageBox").val('');      
      if (msgbody != '') {
        postNewMsg(bbUser, msgbody).done(function (result) {          
          //reset pulse and activity level
          clearTimeout(pulseTimeOut);    
          pulseActivity = 0;

          //re-esetablish pulse
          (function pulse() {                
              buildMsgList();
              pulseTimeOut = setTimeout(pulse, pulseRates[pulseActivity]);
          })();           
        });
      }      
    });

    //press enter in textbox emulate idSend click
    $("#idMessageBox").keydown(function (e) {
      if (e.keyCode == 13) {
        $('#idSend').trigger("click");
      }
    });    

  });

//#### Begin External Functions #### //
function containsMsgID(obj, list) {
    var i;
    for (i = 0; i < list.length; i++) {
        if (list[i]._id === obj._id) {
            return true;
        }
    }
    return false;
}

function timeAgo(date) {

  var seconds = Math.floor((new Date() - date) / 1000);
  var interval = Math.floor(seconds / 31536000);

  if (interval > 1) {
    return interval + " years";
  }
  interval = Math.floor(seconds / 2592000);
  if (interval > 1) {
    return interval + " months";
  }
  interval = Math.floor(seconds / 86400);
  if (interval > 1) {
    return interval + " days";
  }
  interval = Math.floor(seconds / 3600);
  if (interval > 1) {
    return interval + " hours";
  }
  interval = Math.floor(seconds / 60);
  if (interval > 1) {
    return interval + " minutes";
  }
  return Math.floor(seconds) + " seconds";
}

function getNewMsg(bbUser, startDate) {
  startDate.setSeconds(startDate.getSeconds() - 20);
  return $.ajax
    ({
      url: "https://bblinkapi.azurewebsites.net/msg",      
      headers: {"startdate": startDate.toISOString(), "room": bbUser.room}
    });
}

function postNewMsg(bbUser, msgbody) {
  return $.ajax({
    type: "POST",
    contentType: "application/x-www-form-urlencoded",
    url: "https://bblinkapi.azurewebsites.net/msg",     
    data: { body: msgbody.trim(), username: bbUser.username, room: bbUser.room, avatar: bbUser.avatar },
    success: function(data) { console.log("success", data._id); },
     error: function(data) { console.log("error ", data.error); },
     dataType: "json" 
   });
}

function pushHTML(bbUser, obj) {
  var createDate = new Date(obj.Created_date);
  var showAvatarHtml = '';

  if (obj.avatar != '') {
    showAvatarHtml = "<img src=" + obj.avatar + ">";
  }

   if (obj.username != bbUser.username) 
   {
    msgBody = "<div id=" + obj._id + " class=incoming_msg>" +
    "<div class=incoming_msg_img>" + showAvatarHtml + "</div>" +
    "<div class=received_msg>" +
    "<div class=received_withd_msg>" +
    "<p>" + obj.body + "</p>" +
    "<span class=time_date>" + timeAgo(createDate) + " ago</span>" +
    "</div></div></div>";
  } 
  else 
  {
    msgBody = "<div id=" + obj._id + " class=outgoing_msg>" +                  
    "<div class=sent_msg_img>" + showAvatarHtml + "</div>" +                                  
    "<div class=sent_msg>" +
    "<p>" + obj.body + "</p>" +
    "<span class=time_date>" + timeAgo(createDate) + " ago</span>" +
    "</div></div>";
  }
  $(msgBody).hide().appendTo("#idReader").fadeIn('slow');
  $('#idReader').scrollTop($('#idReader')[0].scrollHeight);
}


//#### End External Functions #### //
