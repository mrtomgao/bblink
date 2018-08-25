$(document).ready(function() {
  // Form Submission
  $("#lg_submit").click(function() {        
    
      var username = $('#lg_username').val();
      var room = $('#lg_room').val();
      var avatar = $('#lg_avatar').val();

      if (username != '' && room != '' && avatar != '') 
      {
        //clear the form
        $('#lg_username').val('');
        $('#lg_room').val('');
        $('#lg_avatar').val('');        

        bbUserJson = [];

        item = {}
        item ["username"] = $('#lg_username').val();
        item ["room"] = $('#lg_room').val();
        item ["avatar"] = $('#lg_avatar').val();
        bbUserJson.push(item);
        
        $.cookie("bbUser", JSON.stringify(bbJson));

        if (typeof $.cookie('bbUser') != 'undefined')
        {
          //good to go!!
          window.location.replace("index.html");
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

