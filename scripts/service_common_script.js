function service_eventlistener() {
	/*  service_event_icon.js */
	$('#addFiles').click(service_event_icon.content.add);
	fabric.util.addListener(canvas.upperCanvasEl, 'dblclick', service_event_icon.content.add);
	$('#file-del').click(service_event_icon.content.del);
	$('#file-edit').click(service_event_icon.content.edit);
	$('#popRule').click(service_event_icon.rule.new_rule);
	$('#checkall').change(function() {
		$('.chk-file').prop('checked', $(this).prop('checked'));
		if($('.chk-file:checked').length == 1) {
			$('#file-edit').show();
		}
		else {
			$('#file-edit').hide();
		}
	});
}


function canvasEventListener(){
    canvas.selection = false;// 그룹선택을 막음
    $('body').click(function(e) {
    	var localName = e.target.localName;
//		console.log([e,localName]);
		if(e.target.className.indexOf("jqx-dropdownlist-content-disabled") > -1 && e.ctrlKey){
			//event resolution ctrl+click to enable the choice
			$(e.target).parent().parent().parent().jqxDropDownList({disabled: false});
		}
//		else if (e.target.localName == 'td') {
////			 || e.target.localName == 'div'
//			console.log(localName);
//			canvas.deactivateAll().renderAll();
//			$('#btn-select-forward, #btn-select-backward').css('display','none');
//			selectClear();
//		}
		else if(e.target.className == "banner"){
			console.log("nothing happens");
		}
		return true;
	});
    canvas.on({
        'object:selected' : selectedObject,        // 객체를 선택할때
        'object:moving' : movingObject,        // 선택된 객체가 이동할때
        'object:scaling' : scalingObject,        // 선택된 객체의 스케일을 조절할때
        'before:selection:cleared' : selectClear,        // 선택된 객체의 선택이 풀릴때
//        'object:mousedown': function(e){$(".dom_layout>."+e.target.layoutObjectId).toggleClass('shake_primary');},
//        'object:mouseup': function(e){$(".dom_layout>."+e.target.layoutObjectId).toggleClass('shake_primary');}
    });
//    fabric.util.addListener(canvas.upperCanvasEl, 'mousemove', selectUpperMove);

    $(document).keydown(function(e) {
        if($(":focus").length < 1 && e.keyCode == 46) {
            removeme(canvas);
            $('#layer-id').text("선택된 레이어");
        }
    });
    $('.resolution_custom').on("focusout","input",setResolutionValue);
    $(".layout_control").on("focusout","input",setLayoutValueHandler);

    $('#btn-addLayer').click(function() {
        addsquareU(0, 0, defaultWH, defaultWH, null);
        if(typeof service_event_save != "undefined"){
			service_event_save.saveEvent();//자동저장, template에는 없다.
		}
    });

    $('#btn-delLayer').click(function() {
        removeme();
    });
	$('#btn-select-forward').click(function() {
        selectForward();
    });

    $('#btn-tofront').click(function() {
        bringToFront();
    });

    $('#btn-select-backward').click(function() {
        selectBackward();
    });

    $('#btn-toback').click(function() {
        sendToBack();
    });
}


function canvasButtonEventListener(){
	canvas.on('before:selection:cleared', function(e) {
		selectCanvasInfo = null;
	});

	canvas.on('object:selected',function(e) {
		selectCanvasInfo = e.target;
		if(selectCanvasInfo.id == undefined) {
			selectCanvasInfo.id = e.target.layoutObjectId;
		}
		$('.layer-color').css('background-color', fabricIdToFillColor(e.target.layoutObjectId));
//		$('.layer-color').text(selectCanvasInfo.zIndex);
		//$('#layer-id').text(selectCanvasInfo.id);
		$('#layer-id').text("선택된 레이어 정보");
		var args = new Object();
		args.eventId = eventId;
		args.layoutId = selectCanvasInfo.id;
		console.log(selectCanvasInfo.id);
		refreshFileList(args);
	});

	$(document).on('change', '.chk-file', function() {
		$('#popRule').show();
		if($('.chk-file:checked').length == 1) {
			$('#file-edit').show();
		}
		else {
			$('#file-edit').hide();
		}
	});

	$(window).load(function(){
	    $('#view_toggle').on('click', function(){
	        if($(this).data('viewmode'))
	        {
	        	lockObjectToggle(false);
	            $(this).html('VIEW');
	            $(this).data('viewmode', false);
	        }else{
	        	lockObjectToggle(true);
	            $(this).html('EDIT');
	            $(this).data('viewmode', true);
	        }
	    });
	});

}


function playlistSortable(arr) {
	$('.play_list_inner').show();
	//drawFileList(arr, true);
	drawFileList(arr);
}
function drawFileList(data, flag) {
	var html = '';
	var totalTime = parseInt(0);
	$("."+data[0].layoutId).children("ul").html("");//해당 layout DOM 초기화
	$.each(data, function(k,v) {
		var element = '<div class="file_detail" id="'+ v.contentsId +'" data-type="'+v.contentsType+'">'+
            '<span class="checkbox">'+
            '<input type="checkbox" class="chk-file" id="chk_'+ v.contentsId +'" value="' + v.contentsId + '" data-rule ="'+v.contentsRuleId+'" data-trigger="'+v.triggerId+'">'+
            '<label for="chk_'+ v.contentsId +'">checkbox</label></span>'+
            '<input type="hidden" class="playtime" value="' + v.contentsRunningTime + '">' +
            '<em style="background-color:' + fabricIdToFillColor(selectCanvasInfo.layoutObjectId) + ';">레이아웃 색깔</em>'+
            '<strong class="link" onclick="service_event_icon.content.edit_with_id('+"'"+v.contentsId+"'"+','+v.contentsType+')">'+ v.contentsName +'</strong><div><ul>'+
            '<li><span class="contentsType">'+ v.contentsTypeLabel +'</span> / <span>'+ (v.contentsFileMime || "") +' </span></li>'+
            '<li>'+ getTimeFormat(v.contentsRunningTime) +'</li><li>'+ plupload.formatSize(v.contentsVolume || 0) +'</li>';
		if(v.contentsRuleId != null){
			element += 	'<li>'+
							'<a  onclick="service_event_icon.rule.rule_edit();">'+
								'<ul class="bg_rule_group">';

			if(v.triggerImg != null) {
				element += '<li class="bg_rule_left rules">' + v.triggerImg.substr(0, v.triggerImg.indexOf("</div>")) + '</li>';
			} else {
				element += '<li class="bg_rule_left"></li>';
			}
			if(v.actionImg != null) {
				element += '<li class="bg_rule_right">' + v.actionImg.substr(0, v.actionImg.indexOf("</div>")) + '</li>';
			} else {
				element += '<li class="bg_rule_left"></li>';
			}

			element += '</ul>';
			if(v.triggerId == "109"){
				element += '<li class="rule-time">'+v.contentsRuleLimitAmt.replace(","," ~ ")+'</li>';
			}
			element += '</a>'+
				'</li>';
		}
        element +=
            '</ul></div>'+
            '<img class="thumb" src="'+CONTEXTPATH+'/file/preview/thumb/'+v.storageId+'"/>';
        if(typeof scopeKind == "string" && parseInt(scopeKind) != 3) {
        	element += '<a class="handle"></a>';
        }
        element += '</div>';
        html += element;
        addContents($("."+v.layoutId),v.contentsType,v.contentsId);//DOM에 하나씩 아이콘 넣어 준다.
	});

	if(flag) {
		$('#sortable').append(html);
	}
	else {
		$('#sortable').html(html);
	}

	if(typeof scopeKind == "string" && parseInt(scopeKind) != 3) {
		$('#sortable').jqxSortable({handle:'.handle'});
		var sortOrinData;
		var sortCurrentData;
		$('#sortable').off("activate");
		$('#sortable').on('activate', function (e) {
	        sortOrinData = $("#sortable").jqxSortable("toArray");
	    });
		$('#sortable').off("stop");
		$('#sortable').on('stop', function (e) {
	        sortCurrentData = $("#sortable").jqxSortable("toArray");
	        if(sortOrinData.length == sortCurrentData.length){
	        	for(var i =0; i < sortOrinData.length; i++){
	        		if(sortOrinData[i] != sortCurrentData[i]){
	                	var contentsOrders = new Array();
	                	for(var ii=0; ii < sortCurrentData.length; ii++){
	                		sortCurrentData[ii] = sortCurrentData[ii] + "^" + eval(Number(ii)+1);//contentsOrders.push(ii+1);
	            		}
	                	var url = CONTEXTPATH + '/service/ediEventContentOrder';
	                	var contentsData = { 	eventId : eventId,
								layoutId : selectCanvasInfo.id,
								contentsIds: sortCurrentData //,
							};
	        			$.sqiAjaxPostJson(url, contentsData, function(result) {
	           				if(result.resultCode) {
	           					refreshContentsIconLayout(selectCanvasInfo.id);
	           				}
						});
	                	break;
	    			}
	    		}
	    	}
	    });
	}
	$('.playtime').each(function() {
		totalTime += parseInt($(this).val());
	});
	$('#total-count').text(getTimeFormat(totalTime));
	$('#file-count').text($('.file_detail').length);
	$('#rule-count').text($('.rules').length);
	function findCheckbox(target){
		var parent = target.parent().find(".chk-file");
		if(parent.length > 0){
			if(parent.is(":checked")){
				parent.prop("checked",false);
				parent.trigger("change");
			}else{
				$(":checked").prop("checked",false);
				parent.prop("checked",true);
				parent.trigger("change");
			}
		}else
			findCheckbox($(target.parent()[0]));
	}
	$('#sortable').off("click");
	$('#sortable').click(function(event){
		//console.log(event.target.id + event.target.className + event.target.tagName);
		if(event.target.id == "sortable" || event.target.className =="chk-file" || event.target.tagName == "LABEL"){
			console.log(event.target.id + event.target.className + event.target.tagName);
		}else{
			var target = $(event.target).find(".chk-file");
			if(target.length >0){
				if(target.is(":checked")){
					target.trigger("change");
					target.prop("checked",false);
				}else{
					$(":checked").prop("checked",false);
					target.prop("checked",true);
					target.trigger("change");
				}
			}else{
				findCheckbox($(event.target));
			}
		}
		event.stopPropagation();
	});


	//2016.12.22 추가
	//AJAX 호출이 많이 일어남 refactoring 해야함

}

function refreshFileList(param) {
	$('#file-edit').hide();//edit아이콘 숨김(사실 다른 아이콘도 숨겨야함)
	$(":checkbox").prop("checked",false);
	var url =  CONTEXTPATH + '/service/getContentsList';
	$.sqiAjaxPostJson(url, param, function(result) {
		if(result.resultCode) {
			$('.play_list_inner').show();
			drawFileList(result.contentsList, false);
		}
		else {
			$('.play_list_inner').hide();
			$('#sortable').html('');
		}
	});
}

function getTimeFormat(data) {
	var totalSeconds = parseFloat(data);
	var hour = totalSeconds / 3600;
	var min = (totalSeconds / 60) % 60;
	var sec = totalSeconds % 60;
	var time = getNumberFormat(hour) + ":" + getNumberFormat(min) + ":"
			+ getNumberFormat(sec);
	return time;
}

function getNumberFormat(data) {
	data = parseInt(data) || 0;
	var numberString = data.toString();
	if(numberString.length<2){
		numberString = '0' + data.toString();
	}
	return numberString;
	//return numberString.substring(numberString.length - 2);
}


function storageMappingToLayout(){
	var indexes = $('#servicegrid').jqxGrid('getselectedrowindexes');
	var files = [];
	if(indexes.length>0){
		$.each(indexes,function(idx,index){
			var content = $('#servicegrid').jqxGrid('getrowdata', index);
			if(content.encodeYn != 'Y' && (content.storageType == "1" || content.storageType == "7" || content.storageType == "8")){
				if(content.encodeYn == 'N'){
					alert_top("비디오가 인코딩 되지 않았습니다.",5000);
				}
				else if(content.encodeYn == 'E'){
					alert_top("비디오를 인코딩 하는데 실패했습니다.",5000);
				}
				else if(content.encodeYn == 'P'){
					alert_top("비디오를 인코딩 하고 있습니다. 재생시간만큼 기다려야 합니다.",5000);
				}
				else if(content.encodeYn == 'T'){
					alert_top("썸네일부터 만들어지지 않았습니다. 서버에 ffmpeg이 없을 수 있습니다. 관리자에게 문의하세요." ,5000);
				}
			}else{
				files.push($('#servicegrid').jqxGrid('getrowdata', index));
			}
		});
		var jsonObject = {eventId:eventId,layoutId:selectCanvasInfo.id,files:files};
		$.sqiAjaxPostJson(CONTEXTPATH+"/service/storageMappingToLayout",jsonObject,function(data){
			console.log(data);
			playlistSortable(data);
//			service_event_save.saveEvent();
			$("#servicegrid").jqxGrid("clearselection");
			closeStorage();
		});
	}else{
		alert_top("메뉴를 선택하세요.");
	}
}

function createFabricId(fill) {
	var regExp = /\(([^)]+)\)/;
	var matches = regExp.exec(fill);
	var rnSeq = matches[1].split(/,[ ]{0,}/);
	var layoutId = "layer" + rnSeq[0] + "-" + rnSeq[1] + "-" + rnSeq[2];
	return layoutId;
}

function fillColor(fill, opacity) {
	if(opacity == undefined){opacity = 1;}
	var regExp = /\(([^)]+)\)/;
	var matches = regExp.exec(fill);
	var rnSeq = matches[1].split(/,[ ]{0,}/);
	var normalFill = "rgba(" + rnSeq[0] + "," + rnSeq[1] + "," + rnSeq[2] + ","+opacity+")";
	return normalFill;
}

function fabricIdToFillColor(id){
	var idWithDash = id.replace(/[^0-9-]/g,"");
	var fill = idWithDash.split("-");
	var rnseq1 = fill[0];
    var rnseq2 = fill[1];
    var rnseq3 = fill[2];
    return 'rgba(' + (rnseq1) + ',' + (rnseq2) + ',' + (rnseq3) + ', 1)';
}

function refreshAllContentsIcon(eventId){//DOM 아이콘 모두 초기화
	var data = {eventId: eventId};
	var url = CONTEXTPATH + "/service/getAllContentsList";
	$.sqiAjaxPostJson(url,data,function(data){
		$("ul.list").html();
		$.each(data,function(i,v){
			addContents($("."+v.layoutId),v.contentsType,v.contentsId);
		});
		findDom($("#primaryLayer").val());
	});
}

function refreshContentsIconLayout(layoutId){
	console.log(arguments.callee.name);
	var list = $("#sortable").children();
	$("."+layoutId).children("ul").html("");//해당 layout DOM 초기화
	$.each(list,function(i,v){
		addContents($("."+layoutId),v.getAttribute("data-type"),v.id);
	});
}

function showPreview(){
	service_event_save.saveEvent();//자동저장
//	sortFabricOrderAsDom();
//	var layerObj = canvas.toJSON();
//	var item = $('.resolution').jqxDropDownList('getSelectedItem');
//	if(layerObj.objects.length != 0) {
//		var post_data = {
//				eventId: eventId,
//				deviceId: '1',
//				returnType: 'JSON',
//				displayType: item.value,
//				eventLayoutObject: JSON.stringify(layerObj)
//			}
//		$('.popup').html("");
//		$('.popup').bPopup({
//					modalClose : true,
//					content : 'ajax',
//					contentContainer : '.popup',
//					loadData : post_data,
//					loadUrl : CONTEXTPATH + '/service/previewevent',
//					follow : false,
//					onClose : function() {
//						$('.popup').html("");
//						clearInterval(window.ref);
//				},
//		});
//	}
//	else {
//		alert_top(GLOBAL.eliga.service.finishLayout);
//	}
	var post_data = {
			eventId: eventId,
			deviceId: 'main',
			returnType: 'JSON'
		}
	PostPopupOpen('previewevent', CONTEXTPATH + '/service/previewevent', 100, 100, '', post_data);
}

function selectPrimary(id, bool){//template에서 들어오는 애들의 bool은 true해준다.
	if(Array.prototype.find == null){
	    Array.prototype.find = function(callback, thisArg){
	        for(var i = 0; i < this.length; i++){
	            if(callback.call(thisArg || window, this[i], i, this))
	                return this[i];
	        }
	        return undefined;
	    };
	}
	if($('#view_toggle').data("viewmode") == false || bool){
		if(typeof menubaord_sync === "object"){
			if(!menubaord_sync.check_scope_kind()) {
				return false;
			}
		}
		var tg = canvas.getActiveObject();
		if(tg){
			if(typeof id !== "string"){
				id = tg.layoutObjectId
			}
			var oldPrimary = $("#primaryLayer").val();
			if(oldPrimary != ""){
				var oldTg = canvas.getObjects().find( function(e){ return e.layoutObjectId == oldPrimary; });
				oldTg.primaryYn = "N";
			}
			$("#primaryLayer").val(id);
			var newTg = canvas.getObjects().find( function(e){ return e.layoutObjectId == id; });
			newTg.primaryYn = "Y";

			$("#primaryColor").css("background-color",fabricIdToFillColor(id));
			$(".dom_layout>div").removeClass("primary");
			$("."+id).addClass("primary");
			findDom(id);
		}else{
			//Primary를 선택해준다.
			findDom($("#primaryLayer").val());
		}
//		if(typeof service_event_save != "undefined"){
//			service_event_save.saveEvent();//자동저장, template에는 없다.
//		}
	}else{//('#view_toggle').data("viewmode") == true
		findDom($("#primaryLayer").val());
//		$(".dom_layout>.primary").toggleClass('shake_primary');
	}
}

function sortFabricOrderAsDom(){
	$.each(canvas.getObjects(),function(fabricIndex,item){
		var zIndex = $("."+item.layoutObjectId).find("p").text();
//		console.log(domIndex);
		item.zIndex = parseInt(zIndex);
	});
	var sortByDomIndex = function(a, b){return a.zIndex-b.zIndex}
	canvas.getObjects().sort(sortByDomIndex);
}

function eventSaveAsPopup(){
	$.sqiBpopup(CONTEXTPATH+"/service/popup/eventSaveAs",{title:"다른 이름으로 저장",flag:"eventCopy",noDevice: canvas.size()});
}
function templateSaveAsPopup(){
	$.sqiBpopup(CONTEXTPATH+"/service/popup/eventSaveAs",{title:"템플릿 저장",flag:"templateSave"});
}

