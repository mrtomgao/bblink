$(document).ready(function() {
  $('#lg_username').val('');
  $('#lg_room').val('');
  $('#lg_avatar').val('');  
  $.removeCookie("bbUser");
  console.log("Current login cookie is: " + $.cookie("bbUser"));

  $('#lg_avatar').on('input',function(e){
    $("#idAvatarImg").attr("src", $('#lg_avatar').val().trim());
  });

  $("#lg_submit").click(function() {        

      var username = $('#lg_username').val().trim();
      var room = $('#lg_room').val().trim();
      var avatar = $('#lg_avatar').val().trim();

      if (username != '' && room != '' && avatar != '') 
      {        
        var bbUser = {}
        bbUser ["username"] = username;
        bbUser ["room"] = room;
        bbUser ["avatar"] = avatar;
        $.cookie("bbUser", JSON.stringify(bbUser), {expires: 365, path: '/'});

        if (typeof $.cookie("bbUser") != 'undefined')
        {
          //good to go!!
          window.location.replace('index.html');
        }
        else
        {
          alert('error creating login object');                   
        }
      }
      else 
      {
          alert('all fields are required bro.')
      }
  });
});

function avatarOK() {
  console.log('avatar loaded ok');
  $("#lg_submit").fadeIn('slow');
  $(".login-button").css('background-image', "url('" + $('#lg_avatar').val().trim() + "')");

}

function avatarBad() {
  console.log('avatar bad');
  $("#lg_submit").hide();
}
