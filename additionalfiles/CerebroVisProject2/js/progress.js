
$(document).ready(function () {
    setTimeout(function(){
        $('.dashboard').show();
    }, 5000);
});


$(function() {
    $(".preload").fadeOut(2000, function() {
        $(".dashboard").fadeIn(1000);
    });
});