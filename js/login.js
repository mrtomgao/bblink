$(document).ready(function() {
  // Form Submission
  $("#login-form").submit(function() {        
    
      var username = $('#lg_username').val();
      var room = $('#lg_room').val();
      var avatar = $('#lg_avatar').val();
      
      if (username != '' && room != '' && avatar != '') 
      {
        jsonObj = [];

        item = {}
        item ["username"] = $('#lg_username').val();
        item ["room"] = $('#lg_room').val();
        item ["avatar"] = $('#lg_avatar').val();
        jsonObj.push(item);
        
        $.cookie("bbUser", JSON.stringify(jsonObj));

        if (typeof $.cookie('bbUser') != 'undefined')
        {
          alert('cookie exists lets go!!!')
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

