var newleft = 0;
var canvas;
var defaultWH = 200;
var ratio;
var prevRatio;

function addsquareU(layoutYPosition, layoutXPosition, layoutWidth, layoutHeight, layoutObjectId, primaryYn) {
	if(typeof layoutObjectId == "string"){
		var idWithDash = layoutObjectId.replace(/[^0-9-]/g,"");
		var id = idWithDash.split("-");
		var rnseq1 = id[0];
	    var rnseq2 = id[1];
	    var rnseq3 = id[2];
	    var layoutId = layoutObjectId;
	}
	else if(layoutObjectId == 0){
		var rnseq1 = Math.floor(Math.random() * 256);
	    var rnseq2 = Math.floor(Math.random() * 256);
	    var rnseq3 = Math.floor(Math.random() * 256);
	    var layoutId = "layer" + rnseq1 + "-" + rnseq2 + "-" + rnseq3;
	}
	else{
		var rnseq1 = Math.floor(Math.random() * 256);
	    var rnseq2 = Math.floor(Math.random() * 256);
	    var rnseq3 = Math.floor(Math.random() * 256);
	    var layoutId = "layer" + rnseq1 + "-" + rnseq2 + "-" + rnseq3;
	    layoutXPosition = newleft, layoutYPosition = newleft;
	}
	if(primaryYn == undefined) primaryYn = "N";

    var canvasColor = 'rgba(' + (rnseq1) + ',' + (rnseq2) + ',' + (rnseq3) + ', 0.1)';
    var domColor = 'rgba(' + (rnseq1) + ',' + (rnseq2) + ',' + (rnseq3) + ', 0.8)';
    var buttonColor = 'rgba(' + (rnseq1) + ',' + (rnseq2) + ',' + (rnseq3) + ', 1)';
    
    var fakeWidth = layoutWidth * ratio;
	var fakeHeight = layoutHeight * ratio;
	var fakeLeft = layoutXPosition * ratio;
	var fakeTop = layoutYPosition * ratio;

    var rect = new fabric.Rect({
    	layoutObjectId : layoutId,
        originX : "left",
        originY : "top",
        fill : canvasColor,
        opacity : 1,
        top : parseInt(fakeTop),
        left : parseInt(fakeLeft),//left,
        width : parseInt(200),
        height : parseInt(200),
        scaleX : parseFloat(fakeWidth)/parseInt(200),
        scaleY : parseFloat(fakeHeight)/parseInt(200),
        layoutHeight: layoutHeight,
        layoutWidth:layoutWidth,
        layoutXPosition:layoutXPosition,
        layoutYPosition:layoutYPosition,
        primaryYn:primaryYn,
        cornerSize : 15,
        stroke: canvasColor,
        strokeWidth:0,
//        padding: -5,
        borderColor : 'red',
        cornerColor : 'black',
        lockRotation : true,
        borderScaleFactor: 2
        //, perPixelTargetFind: true
    });

    var createDom = document.createElement('div');
    $(createDom).addClass(layoutId);
//    $(createDom).addClass("shake_primary");
    $(createDom).css({
        position: 'absolute',
        backgroundColor : domColor,
        overflow:'hidden',
        width: parseFloat(fakeWidth),
        height: parseFloat(fakeHeight),
        top: parseFloat(fakeTop),
        left: parseFloat(fakeLeft)
    });
    var tooltip = document.createElement('p');
    $(tooltip).css({top: '50%',left:'50%',marginRight: '-50%',
    transform: 'translate(-50%,-50%)',position: 'absolute', fontSize:'100px',opacity:'0.5',
    color:'#fff', textShadow:'#000 0px 0px 10px'});
    $(createDom).append($(tooltip));
    var contentsWrap = document.createElement('ul');
    contentsWrap.className='list';
    $(contentsWrap).css({marginTop:5, overflow:'hidden'});
    $(createDom).append($(contentsWrap));
    $('.dom_layout').append($(createDom));
    newleft += defaultWH/16;
    rect.setControlVisible('mtr', false);
    canvas.add(rect);
    canvas.renderAll();
    canvas.setActiveObject(rect);
    setIndexObj();
    
    if(primaryYn == "Y"){
    	$("#primaryLayer").val(layoutId);
    	$("#primaryColor").css("background-color",buttonColor);
    	$(".dom_layout>div").removeClass("primary");
		$("."+layoutId).addClass("primary");
//    	$("#primaryColor").prev().remove();
//    	$("#primaryColor").before('<span class="primary">'+$("."+layoutId).children("p").text()+'</span>');
    }
}

//레이어에 컨탠츠 형식 추가
function addContents(tg, type, contentsId)
{
	type = parseInt(type);
    var li = document.createElement('li');
    $(li).prop("id","icon-"+contentsId);
    $(li).css({margin:'0 3px 2px 13px', float:'left'});
    switch(type){
        case 2:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_image_ico.png">');
            break;
        case 1:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_video_ico.png">');
            break;
        case 3:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_ticker_ico.png">');
            break;
        case 5:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_web_ico.png">');
            break;
        case 4:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_text_ico.png">');
            break;
        case 6:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_tickerimage_ico.png">');
            break;
        case 7:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_tickerimage_ico.png">');
            break;
        case 8:
            $(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_video_ico.png">');
            break;
        default:
        	$(li).html('<img alt="" src="'+CONTEXTPATH+'/resources/imgs/common/layer_video_ico.png">');
            break;
    }
    tg.children('ul').append(li);
}
// 레이아웃 선택
function selectedObject(e) {
    $('#btn-select-forward, #btn-select-backward').css('display','inline-block');
    $('#layout_width').val(e.target.layoutWidth);
    $('#layout_height').val(e.target.layoutHeight);
    $('#layout_left').val(e.target.layoutXPosition);
    $('#layout_top').val(e.target.layoutYPosition);
    $(".dom_layout>."+e.target.layoutObjectId).toggleClass(function(){
    	if($(this).hasClass("shake_primary")){
    		$(this).removeClass("shake_primary");
    		return "shake";
    	}
    	else{
    		$(this).removeClass("shake");
    		return "shake_primary";
    	}
    });
//    $(".dom_layout>."+e.target.layoutObjectId).toggleClass('shake_primary');
}

// remove layout
function removeme() {
    // 레이아웃 하위 업로드 된 컨텐츠들도 삭제
    var activeobject = canvas.getActiveObject();
    if(activeobject){
    	if(activeobject.layoutObjectId == $("#primaryLayer").val()){
    		alert_top("Cannot delete Primary Layer");
    		return false;
    	}
        canvas.remove(activeobject);
        canvas.renderAll();
        if(typeof layoutDelArr != "undefined"){//레이아웃 지울 시 거기에 달려있는 컨텐츠까지 지워야 해서 지울 리스트를 array로 넘겨준다. 
        	layoutDelArr.push(activeobject.layoutObjectId);
        }
        $('.'+activeobject.layoutObjectId).remove();
        
        setIndexObj();
    	canvas.setActiveObject(canvas.item(canvas.getObjects().length-1));
    }    
}

function setIndexObj()
/* 레이어 위아래 순서에 따라 숫자 다시 쓰기  */
{
    for(var i = 0; i<$('.dom_layout').children().length;i++)
    {
    	$('.dom_layout').children().eq(i).children('p').html(i+1);
    }
}
//@Deprecated
function setLayoutValue(e)
{
	console.log(e.keyCode);
	if(e.keyCode == 37 || e.keyCode == 39 || e.keyCode == 16 || e.keyCode == 35 || e.keyCode == 36) return false; //방향키 좌우 + shift key
    if($('.layout_control input[type=text]:focus')[0])
    {
        setLayoutValueHandler();
    }
}

function setLayoutValueHandler(){
	var tg = canvas.getActiveObject();
	if(!tg){return false;}
    var canvasRealWidth = parseInt($('.rWidth').val());
    var canvasRealHeight = parseInt($('.rHeight').val());
    
    tg.layoutWidth = parseInt($('.layout_width').val()) || 1;
    tg.layoutHeight = parseInt($('.layout_height').val()) || 1;
    tg.layoutXPosition = parseInt($('.layout_left').val()) || 0;
    tg.layoutYPosition = parseInt($('.layout_top').val()) || 0;
    
    if(tg.layoutWidth > canvasRealWidth) tg.layoutWidth = canvasRealWidth;
    if(tg.layoutHeight > canvasRealHeight) tg.layoutHeight = canvasRealHeight;
    if(tg.layoutXPosition > canvasRealWidth - tg.layoutWidth) tg.layoutXPosition = canvasRealWidth - tg.layoutWidth;
    if(tg.layoutYPosition > canvasRealHeight - tg.layoutHeight) tg.layoutYPosition = canvasRealHeight - tg.layoutHeight;
    
    setLayer(tg);
}
function setLayer(tg){
	if(tg) {
		var fakeWidth = tg.layoutWidth * ratio;
		var fakeHeight = tg.layoutHeight * ratio;
		var fakeLeft = tg.layoutXPosition * ratio;
		var fakeTop = tg.layoutYPosition * ratio;
        tg.setScaleX(fakeWidth / defaultWH).setCoords();
        tg.setScaleY(fakeHeight / defaultWH).setCoords();
        tg.setLeft(fakeLeft).setCoords();
        tg.setTop(fakeTop).setCoords();

        canvas.renderAll();

        $('.layout_width').val(tg.layoutWidth);
        $('.layout_height').val(tg.layoutHeight);
        $('.layout_left').val(tg.layoutXPosition);
        $('.layout_top').val(tg.layoutYPosition);
        $('.'+tg.layoutObjectId).css({width: fakeWidth, height: fakeHeight, top: fakeTop, left: fakeLeft});
    }
}


function setLayout(tg, i)
{
    if(tg) {
        tg.setScaleX(2-i*0.1).setCoords();
        tg.setScaleY(2-i*0.1).setCoords();
        tg.setWidth(200).setCoords();
        tg.setHeight(200).setCoords();
    
        var e = new Object();
        e.target = tg;
        scalingObject(e);
    }
}

function setLayoutResize()
{
	sortFabricOrderAsDom();
	for(var i=0;i<canvas.getObjects().length;i++)
    {
        var tg = canvas.getObjects()[i];
        setLayout(tg,i);
    }
	canvas.renderAll();
}

// 레이아웃 클리어에 따른 ui 배치
function selectClear(e) {
    $('#btn-select-forward, #btn-select-backward').css('display','none');

    $('#layout_width').val('');
    $('#layout_height').val('');
    $('#layout_left').val('');
    $('#layout_top').val('');

    $('#layer-color').css('background-color', '#fff');

    $('.play_list_inner').hide();
    $('#sortable').html('');
}

function movingObject(e)
{
	var tg = e.target;
//	var wrapWH = [$('.canvas-container').width(), $('.canvas-container').height()];
	var wrapWH = [canvas.width, canvas.height];
	if(tg.top > wrapWH[1] - tg.getHeight()) tg.top = wrapWH[1] - tg.getHeight();
    if(tg.left > wrapWH[0] - tg.getWidth()) tg.left = wrapWH[0] - tg.getWidth();
	if(tg.top < 0) tg.top = 0;
	if(tg.left < 0) tg.left = 0;
	setRealPixelAndDomDrawing(tg);
}

function scalingObject(e)
{
	var tg = e.target;
//	var wrapWH = [$('.canvas-container').width(), $('.canvas-container').height()];
	var wrapWH = [canvas.width, canvas.height];
	var scale = [wrapWH[0]/defaultWH, wrapWH[1]/defaultWH];
	if(tg.top > wrapWH[1] - tg.getHeight()) tg.top = wrapWH[1] - tg.getHeight();
	if(tg.left > wrapWH[0] - tg.getWidth()) tg.left = wrapWH[0] - tg.getWidth();
	if(tg.top < 0) tg.top = 0;
	if(tg.left < 0) tg.left = 0;
	if(tg.scaleX > scale[0]) tg.scaleX = scale[0];
	if(tg.scaleY > scale[1]) tg.scaleY = scale[1];

    setRealPixelAndDomDrawing(tg);
}

function setRealPixelAndDomDrawing(tg){
	var w = tg.getWidth(), h = tg.getHeight(), t = tg.top, l = tg.left;
	var layoutWidth = Math.round(w * (1/ratio));
	var layoutHeight = Math.round(h * (1/ratio));
	var layoutXPosition = Math.round(l * (1/ratio));
	var layoutYPosition = Math.round(t * (1/ratio));
	$('#layout_width').val(layoutWidth);
	tg.layoutWidth = layoutWidth;
	$('#layout_height').val(layoutHeight);
	tg.layoutHeight = layoutHeight;
	$('#layout_left').val(layoutXPosition);
	tg.layoutXPosition = layoutXPosition;
	$('#layout_top').val(layoutYPosition);
	tg.layoutYPosition = layoutYPosition;
	
	/*DOM 그린다.*/
	$('.'+tg.layoutObjectId).css({width: w, height: h, top: t, left: l});
}

function sortDepth(tg, flag)
{
    switch(flag)
    {
        case 'bf':
            $('.'+tg.layoutObjectId).next().after($('.'+tg.layoutObjectId));
            break;
        case 'btf':
            $('.dom_layout').append($('.'+tg.layoutObjectId));
            tg.bringToFront();
            break;
        case 'sb':
            $('.'+tg.layoutObjectId).prev().before($('.'+tg.layoutObjectId));
            break;
        case 'stb':
            $('.dom_layout').prepend($('.'+tg.layoutObjectId));
            tg.sendToBack();
            break;
        default:
            break;
    }

    setIndexObj();
}

// 마우스무브 이벤트로 객체 확인
var _prevActive;
var _mouse, _active, _targets;

function selectUpperMove(e)
{
	if(canvas.upperCanvasEl.style.cursor != "move"){return false;}
		
    //현재 마우스 위치
    _mouse = canvas.getPointer(e);
    //활성 객체 (클릭시 선택됨)
    _active = canvas.getActiveObject();
    //가능한 dblclick 대상 (mousepointer를 공유하는 객체)
    _targets = canvas.getObjects().filter(function (_obj) {
        return _obj.containsPoint(_mouse) && !canvas.isTargetTransparent(_obj, _mouse.x, _mouse.y);
    });

    //현재 레이어에서 obj 가져 오기
    var _obj, val;
    var i = 0;

    if(_targets.length > 0)
    {
        val = _targets[i].getWidth() * _targets[i].getHeight();
        while(i < _targets.length)
        {
            if(_targets[i].getWidth() * _targets[i].getHeight() <= val)
            {
                val = _targets[i].getWidth() * _targets[i].getHeight();
                _obj = _targets[i];
            }
            i++;
        }
    }

    if (_obj) {
        if(_prevActive)
        {
            _prevActive.setShadow({ color:"rgba(255,255,255,0)",blur:0,offsetX:0,offsetY:0 });

        }
//        _obj.bringToFront();
        _obj.setShadow({ color:"rgba(255,255,255,1)", blur:1, offsetX:0, offsetY:0 });

        _prevActive = _obj;
    }else{
        if(_prevActive) {
            _prevActive.setShadow({ color:"rgba(255,255,255,0)",blur:1,offsetX:0,offsetY:0 });
            _prevActive = undefined;
        }
    }

    canvas.renderAll();
}

// 한단계 상위 레이어 선택
function selectForward()
{
	if(canvas.getActiveObject() == null){
		alert_top("select layer first");
	}else{
		var dom = $('.'+canvas.getActiveObject().layoutObjectId).next().attr('class');
		if(!dom){
			dom = $(".dom_layout").children().first().attr("class");
		}
		findDom(dom);
	}
}

// 한단계 하위 레이어 선택
function selectBackward()
{
	if(canvas.getActiveObject() == null){
		alert_top("select layer first");
	}else{
		var dom = $('.'+canvas.getActiveObject().layoutObjectId).prev().attr('class');
		if(!dom){
			dom = $(".dom_layout").children().last().attr("class");
		}
		findDom(dom);
	}
}

function findDom(id)
{
	id = id.split(" ")[0];
    var tg = canvas.getObjects();
    for(var i=0;i<tg.length;i++)
    {
        if(id == tg[i].layoutObjectId)
        {
            canvas.setActiveObject(tg[i]);
        }
    }
}

// 앞으로
function bringForward() {
    var activeObject=canvas.getActiveObject();
    if(activeObject) {
        sortDepth(activeObject, 'bf');
    }
}

// 뒤로
function sendBackward() {
    var activeObject=canvas.getActiveObject();
    if(activeObject) {
        sortDepth(activeObject, 'sb');
    }
}

// 맨앞으로
function bringToFront() {
    var activeObject=canvas.getActiveObject();
    //activeObject.bringToFront();
    if(activeObject) {
        sortDepth(activeObject, 'btf');
    }
}

// 맨뒤로
function sendToBack() {
    var activeObject=canvas.getActiveObject();
    //activeObject.sendToBack();
    if(activeObject) {
        sortDepth(activeObject, 'stb');
    }
}
