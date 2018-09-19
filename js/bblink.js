  $(document).ready(function() {

    //Browser Push Notifications
    if ("Notification" in window) {
      Notification.requestPermission().then(function(result) {
        console.log("Notifications are: " + result);
      });
    }

    var bbUser;
    if (typeof $.cookie('bbUser') === 'undefined'){
      // similar behavior as an HTTP redirect
      window.location.replace("login.html");
    } else {      
      //console.log("Current login cookie is: " + $.cookie("bbUser"));
      bbUser = JSON.parse($.cookie('bbUser'));
      $("body").fadeIn(1000);
    }

    //clear the Send Message Box
    $("#idMessageBox").val('');
    
    //init empty first run vars
    var firstRun = true;  
    var dtLastGet;      
    var msgExisting = [];
    var msgNew = [];            

                   // 2s    5s    10s    30s    1min   2min    5min    10min   15min   30min    1hr
    var pulseRates = [2000, 5000, 10000, 30000, 60000, 120000, 300000, 600000, 900000, 1800000, 3600000];
    var pulseSinceNew = 0;     
    var pulseLastNotifyID = '';      
    var pulseActivity = 0;
    var pulseTimeOut;       

    function buildMsgList() {   
        pulseSinceNew++; 
        //1. main get async
        getNewMsg(bbUser, dtLastGet).done(function (result) {
          $.each( result, function( i, obj ){ 
            if (!containsMsgID(obj, msgExisting)) {
              msgExisting.push(obj);
              pushHTML(bbUser, obj);
              pulseSinceNew = 0;
              pulseActivity = 0;              
              //console.log('added to msgExisting: ' + obj._id);        
            }                                  
          });     

          if (pulseSinceNew == 0 && msgExisting.length > 0) {

            //scroll to bottom smoothly when new msg
            $('#idReader').animate({scrollTop: $('#idReader')[0].scrollHeight}, 'fast');

            //alert browser title if NEW MSG conditions met
            if (firstRun) {
              pulseLastNotifyID = msgExisting[msgExisting.length - 1]._id;
            }            
            if (bbUser.username != msgExisting[msgExisting.length - 1].username && pulseSinceNew == 0 && firstRun == false && msgExisting[msgExisting.length - 1]._id != pulseLastNotifyID) {
              
              document.title = 'bblink  (o_o) NewMsg!!';                                
              pulseLastNotifyID = msgExisting[msgExisting.length - 1]._id;

              //push a browswer notification if supported and is not running from file:.
              if ("Notification" in window) {
                if (Notification.permission === "granted") {
                  if (window.location.protocol != "file:") {
                    var img = 'favicon.ico';
                    var text = msgExisting[msgExisting.length - 1].body;
                    var notification = new Notification(msgExisting[msgExisting.length - 1].username, { body: text, icon: img, silent: true });
                    setTimeout(notification.close.bind(notification), 4000); 
                  } 
                  else {
                    console.log('Notification bypassed due to protocol ' + window.location.protocol);
                  }
                }                  
              }            
            }  
          }            
          console.log('Get complete (' + pulseRates[pulseActivity] + ')');
          firstRun = false;
        });      

        //2. pulse calculator to determine activity spikes
        if (pulseSinceNew >= 10) {
          if (pulseActivity < pulseRates.length) {
            pulseActivity++; 
            console.log('activity lvl change to: ' + pulseActivity);
          }
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
        $(".msg_send_btn").toggleClass("msg_send_btn_clicked");
        postNewMsg(bbUser, msgbody).done(function (result) {  

          $(".msg_send_btn").removeClass("msg_send_btn_clicked");
          //reset pulse and activity level
          clearTimeout(pulseTimeOut);    
          pulseActivity = 0;
          $(".msg_send_btn").fadeIn("slow");
          //re-esetablish pulse
          (function pulse() {                
              buildMsgList();
              pulseTimeOut = setTimeout(pulse, pulseRates[pulseActivity]);
          })();           
          pulseSinceNew = 0;
        });
      }      
    });

    //press enter in textbox emulate idSend click
    $("#idMessageBox").keydown(function (e) {
      if (e.keyCode == 13) {
        $('#idSend').trigger("click");
      }
    });   

    //Logout
    $("#idLogout").click(function() {      
      bbUser = null;
      $.removeCookie("bbUser", { path: '/' });
      window.location.replace("login.html");
    });     

    //setting a reset for timer and NewMsg title when user checks in on window
    window.onfocus = window.onblur = function(e) {
        document.title = 'bblink  (-_-)....zZZ';
        clearTimeout(pulseTimeOut);  
        pulseActivity = 0;
        (function pulse() {                
            buildMsgList();
            pulseTimeOut = setTimeout(pulse, pulseRates[pulseActivity]);
        })();             
        pulseSinceNew = 0; 
    }    

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

    if (startDate == null) {
      var history = 40;
      console.log('Getting history: ' + history);
      try {
        return $.ajax
          ({
            url: "https://bblinkapi.azurewebsites.net/msg/latest",      
            type: "GET",
            data: {"amount": history, "room": bbUser.room}
          });   
      }
      catch(err) {
        console.log(err);
      }    
    }
    else {
      startDate.setSeconds(startDate.getSeconds() - 20);
      try {
        return $.ajax
          ({
            url: "https://bblinkapi.azurewebsites.net/msg",      
            type: "GET",
            data: {"startdate": startDate.toISOString(), "room": bbUser.room}
          });  
      }
      catch(err) {
        console.log(err);
      }  
    }
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

  function niceDate(d) {

    return d.toLocaleString('en-US', {weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric'});
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
      "<div class=received_msg_img>" + showAvatarHtml + "</div>" +
      "<div class=received_msg>" +               
      "<span class=username>" + obj.username + "</span>&nbsp;" +       
      "<span class=time_date>" + niceDate(createDate) + "</span>" +           
      "<p>" + filterHTML(obj.body) + "</p>" +
      "</div></div>";
    } 
    else 
    {
      msgBody = "<div id=" + obj._id + " class=outgoing_msg>" +                  
      "<div class=sent_msg_img>" + showAvatarHtml + "</div>" +                                  
      "<div class=sent_msg>" +     
      "<span class=username>" + obj.username + "</span>&nbsp;" +       
      "<span class=time_date>" + niceDate(createDate) + "</span>" +         
      "<p>" + filterHTML(obj.body) + "</p>" +       
      "</div></div>";
    }
    $(msgBody).appendTo("#idReader");
    //$('#idReader').scrollTop($('#idReader')[0].scrollHeight, 5000, 'linear');    
  }

  function filterHTML(body) {
    var parsedBody = "";
    var res = body.split(" ");
    for (i = 0; i < res.length; i++) {
      if(res[i].substring(0,7).toLowerCase() == 'http://' || res[i].substring(0,8).toLowerCase() == 'https://')
      {
        if(/\.(jpg|gif|png|bmp|jpeg)$/.test(res[i]))
        {
          parsedBody += "<img src=" + res[i] + "> ";
        }
        else 
        {
          var domain = res[i].substring(res[i].indexOf('://') + 3);
          if (domain.indexOf('/') > 0)
          {
            domain = domain.substring(0, domain.indexOf('/'));
          }          
          if (domain.substring(0,3) == 'www')
          {
            domain = domain.substring(4);
          }
          if (domain != '') 
          {
            parsedBody += "<a href=" + res[i] + " target=_blank><i class='fa fa-external-link' aria-hidden=true></i> " + domain + "</a> ";
          }
          else
          {
            parsedBody += res[i] + " ";
          }                              
        }
      }
      else 
      {
        parsedBody += res[i] + " ";
      }          
    }
    return parsedBody;
  }



//#### End External Functions #### //
