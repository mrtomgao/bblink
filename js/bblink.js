$(document).ready(function() {
    
    var me = 'raekwon';

    $.ajax({
        url: "https://bblink.azurewebsites.net/msg"
    }).then(function(data) {
    var count = data.length;
    for (i = 0; i < count; i++) {
	   var createDate = new Date(data[i].Created_date);
	   var offset = 0;
	   if (data[i].user == me) {
	   	offset = 10;
	   }
	   $("<div id=" + data[i]._id + ">").appendTo("#idReader");
       $("<kbd>" + data[i].user + "</kbd>").appendTo("#idReader");
       $("<sub>    " +timeAgo(createDate) + " ago</sub>").appendTo("#idReader");
       $("<br/><span class=text-primary>" + data[i].body + "</span>").appendTo("#idReader");              
       $("</div>").appendTo("#idReader");
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