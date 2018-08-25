$(document).ready(function() {
  // Form Submission
  $("#login-form").submit(function() {        
    $.cookie("bbUser", "hahaha what the fuck");
    alert($.cookie("bbUser"));
  });  

});

