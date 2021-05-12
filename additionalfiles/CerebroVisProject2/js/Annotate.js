/**
 * Created by aditeyapandey on 2/28/19.
 */

function annotate() {

    let canvasDiv = document.getElementById('dendrogram');

    canvas = document.createElement('canvas');
    canvas.setAttribute("class", "annotation");

    canvas.setAttribute('width', $("#dendrogram").width());
    canvas.setAttribute('height', 800);
    canvas.setAttribute('id', 'canvas');
    canvas.style.left = $("#brainmap").width();
    canvasDiv.appendChild(canvas);

    if (typeof G_vmlCanvasManager != 'undefined') {
        canvas = G_vmlCanvasManager.initElement(canvas);
    }

    context = canvas.getContext("2d");

    var paint

    $('#canvas').mousedown(function (e) {
        var mouseX = e.pageX - this.offsetLeft;
        var mouseY = e.pageY - this.offsetTop;

        paint = true;
        addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop);
        redraw();
    });

    $('#canvas').mousemove(function (e) {
        if (paint) {
            addClick(e.pageX - this.offsetLeft, e.pageY - this.offsetTop, true);
            redraw();
        }
    });

    $('#canvas').mouseup(function (e) {
        paint = false;

        var canvasDiv = document.getElementById('dendrogram');

        var span = document.createElement('span');
        span.setAttribute("class", "annotation");

        span.style.backgroundColor = "#313639"
        var para = document.createElement("p");
        var node = document.createTextNode("This is an editable paragraph.");
        para.appendChild(node);
        para.contentEditable = true;

        para.style.position = "absolute";
        para.style.left = clickX[clickX.length-1]+250+'px';
        para.style.top = clickY[clickY.length-1]-30+'px';
        para.style.fontWeight = "bold";
        para.style.background = "#313639";
        para.style.color = "white";
        para.style.fontSize = "larger";
        para.style.opacity = 0.8;
        para.style.fontFamily = "Arial"
        para.style.fontSize = "Small"
        para.style.padding = "5";
        para.style.borderRadius = "5px"
        span.appendChild(para);
        canvasDiv.appendChild(span);



    });

    $('#canvas').mouseleave(function (e) {
        paint = false;



        // var canvasDiv = document.getElementById('dendrogram');
        // d = document.createElement('div');
        // d.style.position = "absolute";
        // d.style.height = "20opx"
        // d.style.height = "30opx"
        // d.style.left = clickX[clickX.length-1]+'px';
        // d.style.top = clickX[clickX.length-1]+'px';





    });

    var clickX = new Array();
    var clickY = new Array();
    var clickDrag = new Array();
    var paint;

    function addClick(x, y, dragging) {
        clickX.push(x);
        clickY.push(y);
        clickDrag.push(dragging);
    }

    function redraw() {
        context.clearRect(0, 0, context.canvas.width, context.canvas.height); // Clears the canvas

        context.strokeStyle = "#df4b26";
        context.lineJoin = "round";
        context.lineWidth = 5;

        for (var i = 0; i < clickX.length; i++) {
            context.beginPath();
            if (clickDrag[i] && i) {
                context.moveTo(clickX[i - 1], clickY[i - 1]);
            } else {
                context.moveTo(clickX[i] - 1, clickY[i]);
            }
            context.lineTo(clickX[i], clickY[i]);
            context.closePath();
            context.stroke();
        }

        var canvasDiv = document.getElementById('dendrogram');


    }

}