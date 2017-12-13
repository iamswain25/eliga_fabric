function eliga_fabric(options) {
    'use strict';
    return new eliga_fabric.Viewer(options);
}

(function ($e) {
    $e.Viewer = function (options) {
        $.extend(true, this, $e.DEFAULT_SETTINGS, options);
        if ($("#" + this.id).length < 1) {
            throw "no matching division id";
        }
        this.screenRatio = this.width / this.height;
        this.layerRemoveArr = new Array();
        this.canvasWidth = this.canvasWidth ? this.canvasWidth : $("#" + this.id).width() - 10; //좌우 보더 값 뺀다.
        this.canvasHeight = $("#" + this.id).height();
        this.canvasHeight = this.canvasHeight == 0 ? Math.floor(this.canvasWidth / this.screenRatio) : this.canvasHeight;
        this.lastDragoverTarget = null;
        if (this.noScrollSize) {
            var height = typeof visualViewport === "object" ? visualViewport.height : window.innerHeight;
            var noScrollHeight = height - 51 - 50 - 5; // 하단 바, 패딩, 보더.. (패딩,보더는 없어도 될 듯.)
            this.canvasHeight = this.canvasHeight > noScrollHeight ? noScrollHeight : this.canvasHeight;
            this.canvasWidth = Math.floor(this.canvasHeight * this.screenRatio);
        }
        this.canvasRatioW = this.canvasWidth / this.width;
        this.canvasRatioH = this.canvasHeight / this.height;
        $("#" + this.id).append($e.rectDomStructure(this));
    };
})(eliga_fabric);

(function ($e) {
    $.extend($e, {
        DEFAULT_SETTINGS: {
            width: 1920,
            height: 1080,
            noScrollSize: true,
            allowFileDrop: true,
            id: "eliga_fabric",
            edgeDetection: 40,
            rightClick: true,
            // syncCanvasMatrix: false
        },

        rectDomStructure: function (viewer) {
            var eligaScreenDiv = $("<div>", { "class": "eliga_fabric" });
            {
                var canvasWrap = $("<div>", { "class": "canvas-wrap" }).appendTo(eligaScreenDiv);
                if (viewer.allowFileDrop) {
                    $(document).on("dragleave", viewer, $e.fileHandler.dragleave);
                    $(document).on("dragover", viewer, $e.fileHandler.dragover);
                    $(document).on("drop", viewer, $e.fileHandler.drop);
                }
                {
                    viewer.fileDropVeil = $("<aside>", { class: "darken", css: { backgroundColor: "black", zIndex: 0, position: "fixed", height: "100%", width: "100%", top: 0, opacity: 0.6, left: 0, display: "none" } }).appendTo(canvasWrap);
                    viewer.domLayout = $("<div>", { "class": "dom_layout", css: { width: viewer.canvasWidth, height: viewer.canvasHeight } }).appendTo(canvasWrap);
                    var canvasDom = $("<canvas>", { width: viewer.canvasWidth, height: viewer.canvasHeight }).appendTo(canvasWrap);
                    viewer.canvas = new fabric.Canvas(canvasDom[0], {
                        preserveObjectStacking: true, selection: false, stopContextMenu: viewer.rightClick, fireRightClick: viewer.rightClick

                    });
                    viewer.canvas.viewer = viewer;
                    viewer.canvas.setWidth(viewer.canvasWidth);
                    viewer.canvas.setHeight(viewer.canvasHeight);
                    viewer.canvas.on({
                        'selection:created': $e.canvasHandler.selectionCreated,
                        'selection:updated': $e.canvasHandler.selectionUpdated,
                        'object:moving': $e.canvasHandler.objectMoving,
                        'object:scaling': $e.canvasHandler.objectScaling,
                        'before:selection:cleared': $e.canvasHandler.beforeSelectionCleared,
                    });
                    if (viewer.rightClick) { viewer.canvas.on('mouse:up', $e.canvasHandler.rightClick); }
                }
                var layout_btn_control = $("<ul>", { "class": "layout_btn_control", css: { "-webkit-user-select": "none" } }).appendTo(eligaScreenDiv);
                viewer.layout_btn_control = layout_btn_control;
                {
                    $("<li>", { title: "add", css: { backgroundImage: "url(imgs/common/btn_layout_add.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.add);
                    $("<li>", { title: "remove", css: { backgroundImage: "url(imgs/common/btn_layout_remove.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.remove);
                    $("<li>", { title: "bring to front", css: { backgroundImage: "url(imgs/common/ico_depth_top.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.top);
                    $("<li>", { title: "send to back", css: { backgroundImage: "url(imgs/common/ico_depth_bottom.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.bottom);
                    $("<li>", { title: "bring forwards", css: { backgroundImage: "url(imgs/common/ico_depth_up.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.up);
                    $("<li>", { title: "send backwards", css: { backgroundImage: "url(imgs/common/ico_depth_down.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.down);
                    $("<li>", { title: "select before", css: { backgroundImage: "url(imgs/common/megabox_mobile_bulR.png)", transform: "scaleX(-1)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.before);
                    $("<li>", { title: "select next", css: { backgroundImage: "url(imgs/common/megabox_mobile_bulR.png)" } }).appendTo(layout_btn_control).on("click", viewer, $e.iconHandler.next);
                    $("<li>", { title: "editable" }).toggle_switch({ title: null, callback: $e.iconHandler.editable, viewer: viewer }).appendTo(layout_btn_control);
                }
                viewer.popupRightClick = $("<div>", {
                    "class": "popupRightClick", css: {
                        width: 200, height: "auto", position: "absolute", backgroundColor: "yellow", display: "none", padding: 5
                    }
                }).appendTo(eligaScreenDiv);
                viewer.popupRightClick.off = function (e) { this.parentElement.parentElement.style.display = "none"; }
                {
                    var titleRightClick = $("<h1>", { text: "Attributes", css: { height: 29 } }).appendTo(viewer.popupRightClick);
                    var closeButton = $("<img>", { align: "right", src: "imgs/common/popup_btn_close_p.png", css: { userSelect: "none", "-webkit-user-drag": "none" } }).appendTo(titleRightClick).click(viewer.popupRightClick.off);
                    var dlRightClick = $("<div>", { class: "dlRightClick" }).appendTo(viewer.popupRightClick);
                    {
                        $("<label>", { css: { float: "left", width: "70%", fontWeight: "bold" }, title: "layerOrder", text: "layerOrder" }).appendTo(dlRightClick);
                        $("<input>", { css: { float: "left", width: "30%", border: 0, backgroundColor: "transparent" }, title: "layerOrder", class: "layerOrder", readonly: true }).appendTo(dlRightClick);
                        $("<label>", { css: { float: "left", width: "70%" }, title: "layerTop", text: "layerTop" }).appendTo(dlRightClick);
                        $("<input>", { css: { float: "left", width: "30%", border: 0, backgroundColor: "transparent" }, title: "layerTop", class: "layerTop", type: "number" }).appendTo(dlRightClick);
                        $("<label>", { css: { float: "left", width: "70%" }, title: "layerLeft", text: "layerLeft" }).appendTo(dlRightClick);
                        $("<input>", { css: { float: "left", width: "30%", border: 0, backgroundColor: "transparent" }, title: "layerLeft", class: "layerLeft", type: "number" }).appendTo(dlRightClick);
                        $("<label>", { css: { float: "left", width: "70%" }, title: "layerWidth", text: "layerWidth" }).appendTo(dlRightClick);
                        $("<input>", { css: { float: "left", width: "30%", border: 0, backgroundColor: "transparent" }, title: "layerWidth", class: "layerWidth", type: "number" }).appendTo(dlRightClick);
                        $("<label>", { css: { float: "left", width: "70%" }, title: "layerHeight", text: "layerHeight" }).appendTo(dlRightClick);
                        $("<input>", { css: { float: "left", width: "30%", border: 0, backgroundColor: "transparent" }, title: "layerHeight", class: "layerHeight", type: "number" }).appendTo(dlRightClick);
                    }
                    dlRightClick.on("keyup focusout", "input", viewer, $e.domEvents.onLayerResize);
                }
            }
            return eligaScreenDiv;
        },
        guid: function () {
            function s4() {
                return Math.floor((1 + Math.random()) * 0x10000)
                    .toString(16)
                    .substring(1);
            }
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
                s4() + '-' + s4() + s4() + s4();
        },

        randomColor: function (opacity) {
            if (typeof opacity !== "number") { opacity = 1; }
            var golden_ratio_conjugate = 0.618033988749895;
            var h = Math.random();
            // h += golden_ratio_conjugate;
            // h %= 1;
            var ar = hsv_to_rgb(h, 0.5, 0.95);
            return "rgba(" + ar[0] + "," + ar[1] + "," + ar[2] + "," + opacity + ")";
            function hsv_to_rgb(h, s, v) {
                var h_i = Math.floor(h * 6);
                var f = h * 6 - h_i;
                var p = v * (1 - s);
                var q = v * (1 - f * s);
                var t = v * (1 - (1 - f) * s);
                var r, g, b;
                switch (h_i) {
                    case 0: r = v, g = t, b = p; break;
                    case 1: r = q, g = v, b = p; break;
                    case 2: r = p, g = v, b = t; break;
                    case 3: r = p, g = q, b = v; break;
                    case 4: r = t, g = p, b = v; break;
                    case 5: r = v, g = p, b = q; break;
                }
                return [Math.floor(r * 256), Math.floor(g * 256), Math.floor(b * 256)];
            }
        }
    });
})(eliga_fabric);

(function ($e) {
    $.extend($e, {
        iconHandler: {
            add: function (event, rec) {
                var viewer = event.data;
                $e.addRect(viewer, {});
            },
            remove: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                if (activeobject.id == viewer.primaryId) {
                    throw ("Cannot delete Primary Layer");
                }
                canvas.remove(activeobject);
                canvas.renderAll();
                viewer.layerRemoveArr.push(activeobject);
                activeobject.dom.remove();
                $e.sortLayerDomIndex(canvas);
                canvas.getObjects().length > 0 ? canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1)) : null;
            },
            top: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                viewer.domLayout.append(activeobject.dom);
                activeobject.bringToFront();
                $e.sortLayerDomIndex(canvas);
            },
            bottom: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                viewer.domLayout.append(activeobject.dom);
                activeobject.sendToBack();
                $e.sortLayerDomIndex(canvas);
            },
            up: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                activeobject.dom.next().after(activeobject.dom);
                activeobject.bringForward(false);
                $e.sortLayerDomIndex(canvas);
            },
            down: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                activeobject.dom.prev().before(activeobject.dom);
                activeobject.sendBackwards(false);
                $e.sortLayerDomIndex(canvas);
            },
            before: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                var total = canvas.getObjects().length;
                var index = canvas.getObjects().indexOf(activeobject) - 1;
                var before = index < 0 ? canvas.item(total - 1) : canvas.item(index);
                canvas.setActiveObject(before);
                canvas.renderAll();
                $e.sortLayerDomIndex(canvas);
            },
            next: function (event) {
                var viewer = event.data, canvas = viewer.canvas;
                var activeobject = canvas.getActiveObject();
                if (!activeobject) {
                    throw "no activeobject selected";
                }
                var total = canvas.getObjects().length;
                var index = canvas.getObjects().indexOf(activeobject) + 1;
                var next = index >= total ? canvas.item(0) : canvas.item(index);
                canvas.setActiveObject(next);
                canvas.renderAll();
                $e.sortLayerDomIndex(canvas);
            },
            editable: function (bool, viewer) {
                var objects = viewer.canvas.getObjects();
                var oCoords = ['bl', 'br', 'mb', 'ml', 'mr', 'mt', 'tl', 'tr'];
                for (var i = 0; i < objects.length; i++) {
                    objects[i].lockMovementX = objects[i].lockMovementY = objects[i].lockScalingX = objects[i].lockScalingY = !bool;
                    viewer.popupRightClick.find("input").attr('disabled', !bool);
                    for (var j = 0; j < oCoords.length; j++) {
                        objects[i].setControlVisible(oCoords[j], bool);
                    }
                }
                bool ? viewer.layout_btn_control.children().slice(0,6).show() :  viewer.layout_btn_control.children().slice(0,6).hide();
                viewer.canvas.renderAll();
            }
        },
        fileHandler: {
            showVeil: function (viewer) {
                $(".info-drop").show();
                viewer.fileDropVeil.show();
                viewer.domLayout.css("zIndex", 1);
                viewer.isFileDragging = true;
            },
            hideVeil: function (viewer) {
                viewer.fileDropVeil.hide();
                viewer.isFileDragging = false;
                $(".info-drop").hide();
                viewer.domLayout.css("zIndex", 0);
            },
            dragleave: function (e) {
                var viewer = e.data;
                if (!e.originalEvent.clientX && !e.originalEvent.clientY) {
                    $e.fileHandler.hideVeil(viewer);
                }
            },
            dragover: function (e) {
                e.preventDefault();
                var viewer = e.data;
                var dt = e.originalEvent.dataTransfer;
                if ($.inArray('Files', dt.types) > -1) {
                    if (!viewer.isFileDragging) {
                        $e.fileHandler.showVeil(viewer);
                    }
                    viewer.lastDragoverTarget == null ? viewer.lastDragoverTarget = e.target : null;
                    dt.dropEffect = e.target.classList.contains("info-drop") ? "copy" : "none";
                    if (viewer.lastDragoverTarget == e.target) { return false; }
                    if (e.target.classList.contains("info-drop")) {
                        e.target.classList.add("shake");
                    }
                    viewer.lastDragoverTarget.classList.remove("shake");
                    viewer.lastDragoverTarget = e.target
                }
            },
            drop: function (e) {
                var viewer = e.data;
                $e.fileHandler.hideVeil(viewer);
                e.preventDefault();
                var dt = e.originalEvent.dataTransfer;
                if (dt.items) { // Use DataTransferItemList interface to access the file(s)
                    for (var i = 0; i < dt.items.length; i++) {
                        if (dt.items[i].kind == "file") {
                            var f = dt.items[i].getAsFile();
                            // console.log("... file[" + i + "].name = " + f.name);
                            // console.log([dt, f, e.target.parentElement.classList]);
                            $e.domEvents.addContent(f, viewer, $(e.target.parentElement));
                        }
                    }
                }
            }
        },
        canvasHandler: {
            selectionCreated: function (e) { $e.shake(e.target.dom); $e.setRealPixelAndDomDrawing(e.target); },
            selectionUpdated: function (e) { $e.shake(e.target.dom); $e.setRealPixelAndDomDrawing(e.target); },
            objectMoving: function (e) {
                var tg = e.target, canvas = e.target.canvas, viewer = canvas.viewer;
                if (viewer.edgeDetection) {
                    tg.setCoords(); //Sets corner position coordinates based on current angle, width and height
                    canvas.forEachObject(function (targ) {
                        if (targ === tg) return;
                        if (Math.abs(tg.oCoords.tr.x - targ.oCoords.tr.x) < viewer.edgeDetection) {
                            tg.left = targ.left + targ.getScaledWidth() - tg.getScaledWidth();
                        }
                        if (Math.abs(tg.oCoords.tl.x - targ.oCoords.tl.x) < viewer.edgeDetection) {
                            tg.left = targ.left;
                        }
                        if (Math.abs(tg.oCoords.tr.x - targ.oCoords.tl.x) < viewer.edgeDetection) {
                            tg.left = targ.left - tg.getScaledWidth();
                        }
                        if (Math.abs(tg.oCoords.tl.x - targ.oCoords.tr.x) < viewer.edgeDetection) {
                            tg.left = targ.left + targ.getScaledWidth();
                        }
                        if (Math.abs(tg.oCoords.tr.y - targ.oCoords.tr.y) < viewer.edgeDetection) {
                            tg.top = targ.top;
                        }
                        if (Math.abs(tg.oCoords.br.y - targ.oCoords.br.y) < viewer.edgeDetection) {
                            tg.top = targ.top + targ.getScaledHeight() - tg.getScaledHeight();
                        }
                        if (Math.abs(tg.oCoords.br.y - targ.oCoords.tr.y) < viewer.edgeDetection) {
                            tg.top = targ.top - tg.getScaledHeight();
                        }
                        if (Math.abs(targ.oCoords.br.y - tg.oCoords.tr.y) < viewer.edgeDetection) {
                            tg.top = targ.top + targ.getScaledHeight();
                        }
                    });
                }
                if (tg.top > canvas.height - tg.getScaledHeight()) tg.top = canvas.height - tg.getScaledHeight();
                if (tg.left > canvas.width - tg.getScaledWidth()) tg.left = canvas.width - tg.getScaledWidth();
                if (tg.top < 0) tg.top = 0;
                if (tg.left < 0) tg.left = 0;
                $e.setRealPixelAndDomDrawing(tg, true);
            },
            objectScaling: function (e) {
                var tg = e.target, canvas = e.target.canvas, viewer = canvas.viewer;
                // console.log(tg.__corner);
                tg.__corner ? viewer.__corner = tg.__corner : null; //화면 바깥으로 나갈 시 0으로 된다...수동 메모리...
                switch (tg.__corner) {
                    case "mt": tg.scaleY = tg.top < 0 ? (tg.top + tg.getScaledHeight()) / 100 : tg.scaleY; break;
                    case "ml": tg.scaleX = tg.left < 0 ? (tg.left + tg.getScaledWidth()) / 100 : tg.scaleX; break;
                    case "mr": tg.scaleX = tg.left > canvas.width - tg.getScaledWidth() ? (canvas.width - tg.left) / 100 : tg.scaleX; break;
                    case "mb": tg.scaleY = tg.top > canvas.height - tg.getScaledHeight() ? (canvas.height - tg.top) / 100 : tg.scaleY; break;
                    case "tl":
                        tg.scaleY = tg.top < 0 ? (tg.top + tg.getScaledHeight()) / 100 : tg.scaleY;
                        tg.scaleX = tg.left < 0 ? (tg.left + tg.getScaledWidth()) / 100 : tg.scaleX;
                        break;
                    case "tr":
                        tg.scaleY = tg.top < 0 ? (tg.top + tg.getScaledHeight()) / 100 : tg.scaleY;
                        tg.scaleX = tg.left > canvas.width - tg.getScaledWidth() ? (canvas.width - tg.left) / 100 : tg.scaleX;
                        break;
                    case "bl":
                        tg.scaleX = tg.left < 0 ? (tg.left + tg.getScaledWidth()) / 100 : tg.scaleX;
                        tg.scaleY = tg.top > canvas.height - tg.getScaledHeight() ? (canvas.height - tg.top) / 100 : tg.scaleY;
                        break;
                    case "br":
                        tg.scaleY = tg.top > canvas.height - tg.getScaledHeight() ? (canvas.height - tg.top) / 100 : tg.scaleY;
                        tg.scaleX = tg.left > canvas.width - tg.getScaledWidth() ? (canvas.width - tg.left) / 100 : tg.scaleX;
                        break;
                    case 0: tg.__corner = viewer.__corner;
                }
                if (tg.top > canvas.height - tg.getScaledHeight()) tg.top = canvas.height - tg.getScaledHeight();
                if (tg.left > canvas.width - tg.getScaledWidth()) tg.left = canvas.width - tg.getScaledWidth();
                if (tg.top < 0) { tg.top = 0; }
                if (tg.left < 0) { tg.left = 0; }
                if (tg.getScaledWidth() > canvas.width) { tg.scaleX = canvas.width / 100; }
                if (tg.scaleY > canvas.height / 100) tg.scaleY = canvas.height / 100;
                $e.setRealPixelAndDomDrawing(tg, true);
            },
            beforeSelectionCleared: function (e) {
                var tg = e.target, canvas = tg.canvas, viewer = canvas.viewer;
                viewer.popupRightClick.hide();
            },
            rightClick: function (e) {
                //e.button == 3 for right click;
                var tg = e.target;
                if (tg && e.button == 3) {
                    var canvas = tg.canvas, viewer = canvas.viewer;
                    $e.setRealPixelAndDomDrawing(tg);
                    viewer.popupRightClick.show();
                    $e.shake(viewer.popupRightClick);
                }
            }
        },
        shake: function (obj) {
            obj.toggleClass("shake");
            setTimeout(function () {
                obj.toggleClass("shake");
            }, 820);
        },
        setRealPixelAndDomDrawing: function (tg, syncCanvasMatrix) {
            if (!tg) { return false; }
            if (typeof syncCanvasMatrix === "undefined") { syncCanvasMatrix = false; }
            var viewer = tg.canvas.viewer;
            var w = tg.getScaledWidth(), h = tg.getScaledHeight(), t = tg.top, l = tg.left;
            if (syncCanvasMatrix) {
                tg.layerWidth = Math.round(w * (1 / viewer.canvasRatioW));
                tg.layerHeight = Math.round(h * (1 / viewer.canvasRatioH));
                tg.layerLeft = Math.round(l * (1 / viewer.canvasRatioW));
                tg.layerTop = Math.round(t * (1 / viewer.canvasRatioH));
            }
            tg.dom ? tg.dom.css({ width: w, height: h, top: t, left: l, display: "block" }) : $e.drawGroupDom(tg);
            if (viewer.popupRightClick) {
                viewer.popupRightClick.tg = tg;
                viewer.popupRightClick.css({ top: t + h + 15, left: l + 5, backgroundColor: tg.fill });
                viewer.popupRightClick.find(".layerTop").val(tg.layerTop);
                viewer.popupRightClick.find(".layerLeft").val(tg.layerLeft);
                viewer.popupRightClick.find(".layerHeight").val(tg.layerHeight);
                viewer.popupRightClick.find(".layerWidth").val(tg.layerWidth);
                viewer.popupRightClick.find(".layerOrder").val(tg.canvas.getObjects().indexOf(tg) + 1);
            }
        },
        drawGroupDom: function (tgs) {
            tgs.isMoving ? tgs.getObjects().forEach(function (tg) { tg.dom.hide(); }) : tgs.getObjects().forEach($e.setRealPixelAndDomDrawing);
        },
        sortLayerDomIndex: function (canvas) {
            for (var i = 0; i < canvas.getObjects().length; i++) {
                canvas.getObjects()[i].dom.find("p.index").html(i + 1);
            }
            $e.setRealPixelAndDomDrawing(canvas.getActiveObject());
        },
        onBeforeScaleRotate: function (e) {
            console.log(e);
        },
        addRect: function (viewer, rec) {
            if (typeof rec == "undefined") {
                rec = {};
            }
            if (typeof viewer == "undefined") {
                throw "no viewer";
            }
            var canvas = viewer.canvas;
            rec.id = rec.id || $e.guid();
            rec.top = rec.layerTop * viewer.canvasRatioW || canvas.height - 100 * viewer.canvasRatioW;
            rec.left = rec.layerLeft * viewer.canvasRatioH || 0;
            rec.opacity = 0.1;
            rec.scaleX = parseFloat(viewer.canvasRatioW * (rec.layerWidth || 100)) / 100;
            rec.scaleY = parseFloat(viewer.canvasRatioH * (rec.layerHeight || 100)) / 100;
            rec.width = 100;
            rec.height = 100;
            rec.cornerSize = rec.cornerSize || 15;
            // rec.stroke = rec.color || $e.randomColor(0.1);
            rec.strokeWidth = rec.strokeWidth || 0;
            rec.fill = rec.color || $e.randomColor(1);
            rec.borderColor = rec.borderColor || 'red';
            rec.cornerColor = rec.cornerColor || 'black';
            rec.lockRotation = true;
            rec.lockScalingFlip = true;
            rec.minScaleLimit = 0.5;
            rec.borderScaleFactor = rec.borderScaleFactor || 2;
            rec.originX = "left";
            rec.originY = "top";
            var rect = new fabric.Rect(rec);
            rect.setControlVisible('mtr', false);
            var rectDom = $("<div>", {
                class: rec.id,
                css: {
                    position: 'absolute',
                    backgroundColor: rec.fill, //"transparent",//
                    overflow: 'hidden',
                    width: parseFloat(viewer.canvasRatioW * (rec.layerWidth || 100)),
                    height: parseFloat(viewer.canvasRatioH * (rec.layerHeight || 100)),
                    top: parseFloat(rec.layerTop * viewer.canvasRatioW || canvas.height - 100 * viewer.canvasRatioW),
                    left: parseFloat((rec.layerLeft || 0) * viewer.canvasRatioH)
                }
            }).appendTo($(".dom_layout"));
            $("<p>", {
                class: "index",
                css: {
                    top: '50%', left: '50%', marginRight: '-50%', transform: 'translate(-50%,-50%)',
                    position: 'absolute', fontSize: '50px', opacity: '0.5', color: '#fff',
                    textShadow: '#000 0px 0px 10px', userSelect: "none"
                }
            }).appendTo(rectDom).append(canvas.getObjects().length + 1);
            var contentsList = $("<ul>", {
                class: "contents-list",
                css: {
                    // top: '50%', left: '50%', marginRight: '-50%', transform: 'translate(-50%,-50%)', fontSize: '50px', opacity: '0.5', color: '#fff',textShadow: '#000 0px 0px 10px'
                    position: 'absolute', userSelect: "none", marginTop: 5, overflow: 'hidden'

                }
            }).appendTo(rectDom);
            $("<div>", {
                class: "info-drop",
                css: {
                    position: "absolute",
                    height: "100%", width: "100%", backgroundColor: "transparent",
                    border: "10px dashed darkgrey", boxSizing: "border-box",
                    fontSize: "20px", textAlign: "center", paddingTop: "10%", display: "none"
                }
            }).append("Drop files here").appendTo(rectDom);
            var contentsWrap = $("<ul>", { class: "list", css: { marginTop: 5, overflow: 'hidden' } }).appendTo(rectDom);
            rect.dom = rectDom;
            // rect.contentsList = contentsList;
            canvas.add(rect);
            canvas.setActiveObject(rect);
            canvas.renderAll();
        },
    });
})(eliga_fabric);


(function ($e) {
    $.extend($e, {
        domEvents: {
            onLayerResize: function (e) {
                if (e.type == "keyup" && e.keyCode != 13) { return false; }
                $e.resizeLayer(viewer);
            },
            addContent: function (file, viewer, domTarget) {
                var contentsList = domTarget.find(".contents-list");
                var fileType = file.type;
                var icon, contentType, contentId = $e.guid();
                console.log(fileType);
                switch (fileType) {
                    case "application/x-shockwave-flash": icon = "imgs/common/report_nav_ico_hover.png"; contenttype = 8; break;
                    case "video/avi":
                    case "video/mpeg":
                    case "video/mp4":
                    case "video/flv":
                    case "video/x-matroska":
                    case "video/x-ms-wmv":
                    case "video/wmv": icon = "imgs/common/layer_video_ico.png"; contenttype = 0; break;
                    case "image/png":
                    case "image/jpg":
                    case "image/bmp":
                    case "image/gif": icon = "imgs/common/layer_image_ico.png"; contenttype = 2; break;
                    default: icon = "imgs/common/system_ico_cancel.png"; contenttype = -1; break;
                }
                var liContent = $("<li>", {
                    title: fileType, id: contentId,
                    css: {
                        width: 20, height: 16, margin: 5, float: 'left', backgroundImage: "url(" + icon + ")",
                        backgroundSize: "contain", backgroundRepeat: "no-repeat"
                    }
                });
                contentsList.append(liContent);
            }
        },
        resizeLayer: function (viewer) {
            var canvas = viewer.canvas, popupRightClick = viewer.popupRightClick, tg = popupRightClick.tg;

            tg.layerWidth = Number(popupRightClick.find('.layerWidth').val()) || 1;
            tg.layerHeight = Number(popupRightClick.find('.layerHeight').val()) || 1;
            tg.layerLeft = Number(popupRightClick.find('.layerLeft').val()) || 0;
            tg.layerTop = Number(popupRightClick.find('.layerTop').val()) || 0;

            if (tg.layerWidth > viewer.width) tg.layerWidth = viewer.width;
            if (tg.layerHeight > viewer.height) tg.layerHeight = viewer.height;
            if (tg.layerLeft > viewer.width - tg.layerWidth) tg.layerLeft = viewer.width - tg.layerWidth;
            if (tg.layerTop > viewer.height - tg.layerHeight) tg.layerTop = viewer.height - tg.layerHeight;

            var width = Math.floor(tg.layerWidth * viewer.canvasRatioW);
            var height = Math.floor(tg.layerHeight * viewer.canvasRatioH);
            var left = Math.floor(tg.layerLeft * viewer.canvasRatioW);
            var top = Math.floor(tg.layerTop * viewer.canvasRatioH);

            tg.scaleX = width / 100;
            tg.scaleY = height / 100;
            tg.left = left;
            tg.top = top;
            tg.setCoords();
            $e.setRealPixelAndDomDrawing(tg);
            canvas.renderAll();
        }
    });
})(eliga_fabric);

(function (jQuery) {
    jQuery.fn.toggle_switch = function () {
        var args = Array.prototype.slice.call(arguments);
        if (args.length == 1 && typeof (args[0]) == "object") { build.call(this, args[0]); } else { build.call(this); }
        return this;
    };
    function build(options) {
        var defaults = { title: "사용여부", y: "사용", n: "미사용", init: true };
        var style = '<style>'
            + '.toggle_switch .slider:before {'
            + 'border-radius: 45%; position: absolute; content: ""; height: 24px; width: 30px; left: 2px; bottom: 2px; background-color: white; -webkit-transition: .4s; border-radius: 45%; '
            + 'transition: .4s; -webkit-transform: translateX(26px); -ms-transform: translateX(26px); transform: translateX(26px); background-image: url(imgs/common/ico_space_nonecheck.png);'
            + 'background-repeat: no-repeat; background-position: center center }'
            + '.toggle_switch .switch { position: relative; display: inline-block; width: 80px; height: 28px; float:left; }'
            + '.toggle_switch .switch.checked .slider { background-color: #2196F3; }'
            + '.toggle_switch .switch.checked .slider:before { -webkit-transform: translateX(0); -ms-transform: translateX(0); transform: translateX(0); background-image: url(imgs/common/ico_space_check.png);}'
            + '.toggle_switch .switch .slider {width: 60px; border-radius: 28px; position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; -webkit-transition: .4s; transition: .4s;}'
            + '</style>';

        $('head').append(style);
        this.opt = jQuery.extend(defaults, options);
        var div = $("<div>", { css: { position: "absolute" } }).appendTo(this);
        {
            if (this.opt.title) { var span = $("<span>", { text: this.opt.title, css: { float: "left" } }).appendTo(div); }
            var div2 = $("<div>", { class: "toggle_switch", css: { float: "left", overflow: "hidden" } }).appendTo(div);
            {
                var label = $("<label>", { class: this.opt.init ? "switch checked" : "switch" }).appendTo(div2);
                {
                    var div3 = $("<div>", { class: "slider round" }).appendTo(label);
                }
            }
        }
        this.checked = this.opt.init;
        this.on("click", ".switch", this, function (e) {
            $(e.currentTarget).toggleClass("checked");
            var opt = e.data.opt
            e.data.checked = e.data.checked ? false : true;
            typeof opt.callback === "function" ? opt.callback(e.data.checked, opt.viewer) : null;
        });
    }
})(jQuery);