$(document).ready(function() {

    $.ajax({
        url: "https://bblink.azurewebsites.net/msg"
    }).then(function(data) {
       $('#idReader').append(data.body);
    });
});