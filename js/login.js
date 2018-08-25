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
        alert($.cookie("bbUser"));
      }
      else 
      {
          alert('all fields are required bro.')
      }
  });  

});

