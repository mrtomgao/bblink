$(document).ready(function() {
    
	if (typeof $.cookie('bbUser') === 'undefined'){
    // similar behavior as an HTTP redirect
    window.location.replace("login.html");
	} else {
		alert('yesCookie');
	}
	
	
    loadMessages();

    $("#idSend").click(function() {
      if ($("#idMessageBox").val().trim() == '') {
        alert('blank');
      }
      else 
      {

          $.ajax({
             type: "POST",
             contentType: "application/x-www-form-urlencoded",
             url: "https://bblinkapi.azurewebsites.net/msg",     
             data: { body: $("#idMessageBox").val().trim(), user: "raekwon", channel: "lockedtite" },
             success: function(data) {
                loadMessages();
                  $("#idMessageBox").val('');
              },
              error: function(data) {
                  console.log("error ", data.error);
              },
              dataType: "json"               
          });

      }



    });

});

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

function loadMessages() {

    var me = 'raekwon';
    $("#idReader").empty();

    $.ajax({
        url: "https://bblinkapi.azurewebsites.net/msgafter"
    }).then(function(data) {
    var count = data.length;
    for (i = 0; i < count; i++) {
     var createDate = new Date(data[i].Created_date);
     var msgbody = "";
     if (data[i].user != me) 
     {
        msgBody = "<div id=" + data[i]._id + " class=incoming_msg>" +
                  "<div class=incoming_msg_img><img src=https://mrtomgao.github.io/hello/images/avatar.png></div>" +
                  "<div class=received_msg>" +
                  "<div class=received_withd_msg>" +
                  "<p>" + data[i].body + "</p>" +
                  "<span class=time_date>" + timeAgo(createDate) + " ago</span>" +
                  "</div></div></div>";
     } 
     else 
     {
        msgBody = "<div id=" + data[i]._id + " class=outgoing_msg>" +                  
                  "<div class=sent_msg_img><img src=https://mrtomgao.github.io/hello/images/avatar.png></div>" +                                  
                  "<div class=sent_msg>" +
                  "<p>" + data[i].body + "</p>" +
                  "<span class=time_date>" + timeAgo(createDate) + " ago</span>" +
                  "</div></div>";
     }
        $(msgBody).appendTo("#idReader");
        $('#idReader').scrollTop($('#idReader')[0].scrollHeight);
    }
    });

}