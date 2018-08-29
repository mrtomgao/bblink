$(document).ready(function() {

  $("#lg_submit").click(function() {        

      var username = $('#lg_username').val();
      var room = $('#lg_room').val();
      var avatar = $('#lg_avatar').val();

      if (username != '' && room != '' && avatar != '') 
      {        
        //check for valid avatar URL if not then change to blank
        $.get({
          url: avatar,
          async: false
        }).done(function() { 
          //positive condition     
        }).fail(function() { 
          //negative condition
          avatar = '';
        })        

        bbUser = {}
        bbUser ["username"] = username;
        bbUser ["room"] = room;
        bbUser ["avatar"] = avatar;
        $.cookie("bbUser", JSON.stringify(bbUser));

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

