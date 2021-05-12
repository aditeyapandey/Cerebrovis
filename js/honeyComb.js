$(window).on('resize', hexagonalPattern);

hexagonalPattern();

function hexagonalPattern() {
    var width = $('.container').width();
    var $item = $('.hexa');
    var itemWidth = $item.width()*2;
    var margin = 1;
    var rowLength = Math.floor(width / (itemWidth*3/4+1));

    var itemLength = $item.length;
    var patternLength = Math.floor(itemLength/rowLength);
    var currentRow = 1;

    $item.each(function(index) {
        $(this).removeClass('top');
        if(index+1 > currentRow*rowLength){
            currentRow++;
        }

        var indexRow = index+1 - (currentRow-1)*rowLength;

        if(indexRow%2 == 0) {
            $(this).addClass('top');
        }
    });
}