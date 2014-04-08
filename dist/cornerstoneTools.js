/*! cornerstoneTools - v0.0.1 - 2014-04-07 | (c) 2014 Chris Hafey | https://github.com/chafey/cornerstoneTools */
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheel(e)
    {
        // !!!HACK/NOTE/WARNING!!!
        // for some reason I am getting mousewheel and DOMMouseScroll events on my
        // mac os x mavericks system when middle mouse button dragging.
        // I couldn't find any info about this so this might break other systems
        // webkit hack
        if(e.originalEvent.type === "mousewheel" && e.originalEvent.wheelDeltaY === 0) {
            return;
        }
        // firefox hack
        if(e.originalEvent.type === "DOMMouseScroll" && e.originalEvent.axis ===1) {
            return;
        }

        var element = e.currentTarget;
        var startingCoords = cornerstone.pageToImage(element, e.pageX, e.pageY);

        e = window.event || e; // old IE support
        var wheelDelta = e.wheelDelta || -e.detail || -e.originalEvent.detail;
        var direction = Math.max(-1, Math.min(1, (wheelDelta)));

        var mouseWheelData = {
            element: element,
            viewport: cornerstone.getViewport(element),
            image: cornerstone.getEnabledElement(element).image,
            direction : direction,
            pageX : e.pageX,
            pageY: e.pageY,
            imageX : startingCoords.x,
            imageY : startingCoords.y
        };

        var event = new CustomEvent(
            "CornerstoneToolsMouseWheel",
            {
                detail: {
                    event: e,
                    direction: direction,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);
    }


    var mouseWheelEvents = "mousewheel DOMMouseScroll";

    function enable(element)
    {
        $(element).on(mouseWheelEvents, mouseWheel);
    }

    function disable(element) {
        $(element).unbind(mouseWheelEvents, mouseWheel);
    }

    // module exports
    cornerstoneTools.mouseWheelInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseDown(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToImage(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);
        var event = new CustomEvent(
            "CornerstoneToolsMouseDown",
            {
                detail: {
                    event: e,
                    which: e.which,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: startPoints,
                    deltaPoints: {x: 0, y:0}
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);

        var whichMouseButton = e.which;

        function onMouseMove(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseDrag",
                {
                    detail: {
                        event: e,
                        which: whichMouseButton,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );

            element.dispatchEvent(event);

            // update the last points
            lastPoints = cornerstoneTools.copyPoints(currentPoints);

            // prevent left click selection of DOM elements
            return cornerstoneTools.pauseEvent(e);
        }


        // hook mouseup so we can unbind our event listeners
        // when they stop dragging
        function onMouseUp(e) {

            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e),
                image: cornerstone.pageToImage(element, e.pageX, e.pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            var event = new CustomEvent(
                "CornerstoneToolsMouseUp",
                {
                    detail: {
                        event: e,
                        which: whichMouseButton,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            element.dispatchEvent(event);

            $(document).off('mousemove', onMouseMove);
            $(document).off('mouseup', onMouseUp);
        }

        $(document).on("mousemove", onMouseMove);
        $(document).on("mouseup", onMouseUp);


        return cornerstoneTools.pauseEvent(e);
    }

    function mouseMove(e) {
        var eventData = e.data;
        var element = e.currentTarget;

        var startPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToImage(element, e.pageX, e.pageY)
        };
        var lastPoints = cornerstoneTools.copyPoints(startPoints);

        var whichMouseButton = e.which;


        // calculate our current points in page and image coordinates
        var currentPoints = {
            page: cornerstoneTools.point.pageToPoint(e),
            image: cornerstone.pageToImage(element, e.pageX, e.pageY)
        };

        // Calculate delta values in page and image coordinates
        var deltaPoints = {
            page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
            image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
        };

        var event = new CustomEvent(
            "CornerstoneToolsMouseMove",
            {
                detail: {
                    event: e,
                    which: whichMouseButton,
                    viewport: cornerstone.getViewport(element),
                    image: cornerstone.getEnabledElement(element).image,
                    element: element,
                    startPoints: startPoints,
                    lastPoints: lastPoints,
                    currentPoints: currentPoints,
                    deltaPoints: deltaPoints
                },
                bubbles: false,
                cancelable: false
            }
        );
        element.dispatchEvent(event);

        // update the last points
        lastPoints = cornerstoneTools.copyPoints(currentPoints);

        // prevent left click selection of DOM elements
        //return cornerstoneTools.pauseEvent(e);
    }

    function enable(element)
    {
        $(element).on("mousedown", mouseDown);
        $(element).on("mousemove", mouseMove);
    }

    function disable(element) {
        $(element).off("mousedown", mouseDown);
        $(element).off("mousemove", mouseMove);
    }

    // module exports
    cornerstoneTools.mouseInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function isMouseButtonEnabled(which, mouseButtonMask)
    {
        /*jshint bitwise: false*/
        var mouseButton = (1 << (which - 1));
        return ((mouseButtonMask & mouseButton) !== 0);
    }

    function mouseButtonTool(mouseDownCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
                var eventData = {
                    mouseButtonMask: mouseButtonMask
                };
                $(element).on("CornerstoneToolsMouseDown", eventData, mouseDownCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseDown', mouseDownCallback);},
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseButtonTool = mouseButtonTool;
    cornerstoneTools.isMouseButtonEnabled = isMouseButtonEnabled;
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseWheelTool(mouseWheelCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsMouseWheel", eventData, mouseWheelCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsMouseWheel', mouseWheelCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.mouseWheelTool = mouseWheelTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchDragTool(touchDragCallback)
    {
        var toolInterface = {
            activate: function(element, mouseButtonMask) {
                $(element).off('CornerstoneToolsTouchDrag', touchDragCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchDrag", eventData, touchDragCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchDrag', touchDragCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchDragTool = touchDragTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }


    function touchPinchTool(touchPinchCallback)
    {
        var toolInterface = {
            activate: function(element) {
                $(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);
                var eventData = {
                };
                $(element).on("CornerstoneToolsTouchPinch", eventData, touchPinchCallback);
            },
            disable : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            enable : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);},
            deactivate : function(element) {$(element).off('CornerstoneToolsTouchPinch', touchPinchCallback);}
        };
        return toolInterface;
    }

    // module exports
    cornerstoneTools.touchPinchTool = touchPinchTool;

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
    }

    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseDragCallback(e) {
        var mouseMoveData = e.originalEvent.detail;
        mouseMoveData.viewport.centerX += (mouseMoveData.deltaPoints.page.x / mouseMoveData.viewport.scale);
        mouseMoveData.viewport.centerY += (mouseMoveData.deltaPoints.page.y / mouseMoveData.viewport.scale);
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }

    function drag(element, dragData)
    {
        dragData.viewport.centerX += (dragData.deltaPageX / dragData.viewport.scale);
        dragData.viewport.centerY += (dragData.deltaPageY / dragData.viewport.scale);
        cornerstone.setViewport(element, dragData.viewport);
    }

    function onDrag(e) {
        cornerstoneTools.onDrag(e, drag);
    }

    cornerstoneTools.pan = cornerstoneTools.mouseButtonTool(mouseDownCallback);
    cornerstoneTools.panTouchDrag = cornerstoneTools.touchDragTool(onDrag);

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var toolType = "probe";

    function createNewMeasurement(mouseEventData)
    {
        // create the measurement data for this tool with the end handle activated
        var measurementData = {
            visible : true,
            handles : {
                end: {
                    x : mouseEventData.currentPoints.image.x,
                    y : mouseEventData.currentPoints.image.y,
                    highlight: true,
                    active: true
                }
            }
        };

        // associate this data with this imageId so we can render it and manipulate it
        cornerstoneTools.addToolState(mouseEventData.element, toolType, measurementData);

        // since we are dragging to another place to drop the end point, we can just activate
        // the end point and let the moveHandle move it for us.
        $(mouseEventData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        cornerstoneTools.moveHandle(mouseEventData, measurementData.handles.end, function() {
            if(cornerstoneTools.anyHandlesOutsideImage(mouseEventData, measurementData.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseEventData.element, toolType, measurementData);
            }
            $(mouseEventData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        });
    }


    function mouseMoveCallback(e) {

        var eventData = e.data;
        var mouseMoveData = e.originalEvent.detail;

        // if a mouse button is down, do nothing
        if(e.originalEvent.detail.which !== 0) {
            return;
        }

        // if we have no tool data for this element, do nothing
        var toolData = cornerstoneTools.getToolState(mouseMoveData.element, toolType);
        if(toolData === undefined) {
            return;
        }

        // We have tool data, search through all data
        // and see if we can activate a handle
        var imageNeedsUpdate = false;
        for(var i=0; i < toolData.data.length; i++) {
            // get the cursor position in image coordinates
            var data = toolData.data[i];
            if(cornerstoneTools.handleActivator(data.handles, mouseMoveData.currentPoints.image, mouseMoveData.viewport.scale ) === true)
            {
                imageNeedsUpdate = true;
            }
        }

        // Handle activation status changed, redraw the image
        if(imageNeedsUpdate === true) {
            cornerstone.updateImage(mouseMoveData.element);
        }
    }

    function pointNearTool(data, coords)
    {
        var distanceSquared = cornerstoneTools.point.distanceSquared(data.handles.end, coords);
        return (distanceSquared < 25);
    }

    function mouseDownCallback(e) {
        console.log('probe - mouseDownCallback');
        var eventData = e.data;
        var mouseDownData = e.originalEvent.detail;
        var data;

        function handleDoneMove()
        {
            if(cornerstoneTools.anyHandlesOutsideImage(mouseDownData, data.handles))
            {
                // delete the measurement
                cornerstoneTools.removeToolState(mouseDownData.element, toolType, data);
            }
            $(mouseDownData.element).on('CornerstoneToolsMouseMove', mouseMoveCallback);
        }

        if(cornerstoneTools.isMouseButtonEnabled(mouseDownData.which, eventData.mouseButtonMask)) {
            var element = mouseDownData.element;
            var viewport = mouseDownData.viewport;
            var coords = mouseDownData.startPoints.image;
            var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);

            // now check to see if we have a tool that we can move
            if(toolData !== undefined) {
                for(var i=0; i < toolData.data.length; i++) {
                    data = toolData.data[i];
                    if(pointNearTool(data, coords)) {
                        $(mouseDownData.element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
                        cornerstoneTools.moveHandle(mouseDownData, data.handles.end, handleDoneMove);
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        return;
                    }
                }
            }

            // If we are "active" start drawing a new measurement
            if(eventData.active === true) {
                // no existing measurements care about this, draw a new measurement
                createNewMeasurement(mouseDownData);
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }

        }
    }

    function onImageRendered(e) {

        // if we have no toolData for this element, return immediately as there is nothing to do
        var toolData = cornerstoneTools.getToolState(e.currentTarget, toolType);
        if(toolData === undefined) {
            return;
        }

        // we have tool data for this element - iterate over each one and draw it
        var renderData = e.originalEvent.detail;
        var context = renderData.canvasContext.canvas.getContext("2d");
        csc.setToPixelCoordinateSystem(renderData.enabledElement, context);

        for(var i=0; i < toolData.data.length; i++) {
            context.save();
            var data = toolData.data[i];

            // draw the handles
            context.beginPath();
            cornerstoneTools.drawHandles(context, renderData, data.handles);
            context.stroke();

            // Draw text
            var fontParameters = csc.setToFontCoordinateSystem(renderData.enabledElement, renderData.canvasContext, 15);
            context.font = "" + fontParameters.fontSize + "px Arial";

            // translate the x/y away from the cursor
            var x = Math.round(data.handles.end.x);
            var y = Math.round(data.handles.end.y);
            textX = data.handles.end.x + 3;
            textY = data.handles.end.y - 3;

            var textX = textX / fontParameters.fontScale;
            var textY = textY / fontParameters.fontScale;

            context.fillStyle = "white";

            var storedPixels = cornerstone.getStoredPixels(renderData.element, x, y, 1, 1);
            var sp = storedPixels[0];
            var mo = sp * renderData.image.slope + renderData.image.intercept;

            context.fillText("" + x + "," + y, textX, textY);
            context.fillText("SP: " + sp + " MO: " + mo, textX, textY + fontParameters.lineHeight);

            context.restore();
        }
    }

    // not visible, not interactive
    function disable(element)
    {
        $(element).off("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // visible but not interactive
    function enable(element)
    {
        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).off('CornerstoneToolsMouseMove', mouseMoveCallback);
        $(element).off('CornerstoneToolsMouseDown', mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // visible, interactive and can create
    function activate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
            active: true
        };
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // visible, interactive
    function deactivate(element, mouseButtonMask) {
        var eventData = {
            mouseButtonMask: mouseButtonMask,
            active: false
        };
        $(element).off("CornerstoneToolsMouseMove", mouseMoveCallback);
        $(element).off("CornerstoneToolsMouseDown", mouseDownCallback);
        $(element).on("CornerstoneImageRendered", onImageRendered);
        $(element).on("CornerstoneToolsMouseMove", eventData, mouseMoveCallback);
        $(element).on('CornerstoneToolsMouseDown', eventData, mouseDownCallback);
        cornerstone.updateImage(element);
    }

    // module exports
    cornerstoneTools.probe = {
        enable: enable,
        disable : disable,
        activate: activate,
        deactivate: deactivate
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);
        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }
    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;
        // here we normalize the ww/wc adjustments so the same number of on screen pixels
        // adjusts the same percentage of the dynamic range of the image.  This is needed to
        // provide consistency for the ww/wc tool regardless of the dynamic range (e.g. an 8 bit
        // image will feel the same as a 16 bit image would)
        var imageDynamicRange = mouseMoveData.image.maxPixelValue - mouseMoveData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        mouseMoveData.viewport.windowWidth += (mouseMoveData.deltaPoints.page.x * multiplier);
        mouseMoveData.viewport.windowCenter += (mouseMoveData.deltaPoints.page.y * multiplier);
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }

    function touchDragCallback(e)
    {
        var dragData = e.originalEvent.detail;

        var imageDynamicRange = dragData.image.maxPixelValue - dragData.image.minPixelValue;
        var multiplier = imageDynamicRange / 1024;

        dragData.viewport.windowWidth += (dragData.deltaPoints.page.x * multiplier);
        dragData.viewport.windowCenter += (dragData.deltaPoints.page.y * multiplier);
        cornerstone.setViewport(dragData.element, dragData.viewport);
    }

    cornerstoneTools.wwwc = cornerstoneTools.mouseButtonTool(mouseDownCallback);
    cornerstoneTools.wwwcTouchDrag = cornerstoneTools.touchDragTool(touchDragCallback);


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function zoom(element, viewport, ticks)
    {
        // Calculate the new scale factor based on how far the mouse has changed
        var pow = 1.7;
        var oldFactor = Math.log(viewport.scale) / Math.log(pow);
        var factor = oldFactor + ticks;
        var scale = Math.pow(pow, factor);
        viewport.scale = scale;
        cornerstone.setViewport(element, viewport);
    }

    function mouseUpCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        $(mouseData.element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
        $(mouseData.element).off("CornerstoneToolsMouseUp", mouseUpCallback);

    }
    function mouseDownCallback(e)
    {
        var mouseData = e.originalEvent.detail;
        if(cornerstoneTools.isMouseButtonEnabled(mouseData.which, e.data.mouseButtonMask)) {
            $(mouseData.element).on("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(mouseData.element).on("CornerstoneToolsMouseUp", mouseUpCallback);
            e.preventDefault();
            e.stopImmediatePropagation();
            return false;
        }
    }

    function mouseDragCallback(e)
    {
        var mouseMoveData = e.originalEvent.detail;

        var ticks = mouseMoveData.deltaPoints.page.y/100;
        zoom(mouseMoveData.element, mouseMoveData.viewport, ticks);

        // Now that the scale has been updated, determine the offset we need to apply to the center so we can
        // keep the original start location in the same position
        var newCoords = cornerstone.pageToImage(mouseMoveData.element, mouseMoveData.startPoints.page.x, mouseMoveData.startPoints.page.y);
        mouseMoveData.viewport.centerX -= mouseMoveData.startPoints.image.x - newCoords.x;
        mouseMoveData.viewport.centerY -= mouseMoveData.startPoints.image.y - newCoords.y;
        cornerstone.setViewport(mouseMoveData.element, mouseMoveData.viewport);

        e.preventDefault();
        e.stopImmediatePropagation();
        return false;
    }

    function mouseWheelCallback(e)
    {
        var mouseWheelData = e.originalEvent.detail;
        var ticks = -mouseWheelData.direction / 4;
        zoom(mouseWheelData.element, mouseWheelData.viewport, ticks);
    }

    function touchPinchCallback(e)
    {
        var pinchData = e.originalEvent.detail;
        zoom(pinchData.element, pinchData.viewport, pinchData.direction / 4);
    }

    cornerstoneTools.zoom = cornerstoneTools.mouseButtonTool(mouseDownCallback);
    cornerstoneTools.zoomWheel = cornerstoneTools.mouseWheelTool(mouseWheelCallback);
    cornerstoneTools.zoomTouchPinch = cornerstoneTools.touchPinchTool(touchPinchCallback);
    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    /*jshint newcap: false */

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var lastScale = 1.0;
    var processingTouch = false;

    var startPoints;
    var lastPoints;

    function onTouch(e)
    {
        e.gesture.preventDefault();
        e.gesture.stopPropagation();


        // we use a global flag to keep track of whether or not we are pinching
        // to avoid queueing up tons of events
        if(processingTouch === true)
        {
            return;
        }

        var element = e.currentTarget;
        var event;

        if(e.type === 'transform')
        {
            var scale = lastScale - e.gesture.scale;
            lastScale = e.gesture.scale;
            event = new CustomEvent(
                "CornerstoneToolsTouchPinch",
                {
                    detail: {
                        event: e,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        direction: scale < 0 ? 1 : -1
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
        }
        else if(e.type === 'dragstart')
        {
            startPoints = {
                page: cornerstoneTools.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToImage(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };
            lastPoints = cornerstoneTools.copyPoints(startPoints);
            return;
        }
        else if(e.type === 'drag')
        {
            // calculate our current points in page and image coordinates
            var currentPoints = {
                page: cornerstoneTools.point.pageToPoint(e.gesture.touches[0]),
                image: cornerstone.pageToImage(element, e.gesture.touches[0].pageX, e.gesture.touches[0].pageY)
            };

            // Calculate delta values in page and image coordinates
            var deltaPoints = {
                page: cornerstoneTools.point.subtract(currentPoints.page, lastPoints.page),
                image: cornerstoneTools.point.subtract(currentPoints.image, lastPoints.image)
            };

            event = new CustomEvent(
                "CornerstoneToolsTouchDrag",
                {
                    detail: {
                        event: e,
                        viewport: cornerstone.getViewport(element),
                        image: cornerstone.getEnabledElement(element).image,
                        element: element,
                        startPoints: startPoints,
                        lastPoints: lastPoints,
                        currentPoints: currentPoints,
                        deltaPoints: deltaPoints
                    },
                    bubbles: false,
                    cancelable: false
                }
            );
            lastPoints = $.extend({}, currentPoints);

        }
        else
        {
            return;
        }

        processingTouch = true;

        // we dispatch the event using a timer to allow the DOM to redraw
        setTimeout(function() {
            element.dispatchEvent(event);
            processingTouch = false;
        }, 1);
    }

    function enable(element)
    {
        var hammerOptions = {
            transform_always_block: true,
            transform_min_scale   : 0.01,
            drag_block_horizontal : true,
            drag_block_vertical   : true,
            drag_min_distance     : 0

        };
        $(element).hammer(hammerOptions).on("touch drag transform dragstart", onTouch);
    }

    function disable(element) {
        $(element).hammer().off("touch drag transform dragstart", onTouch);
    }

    // module exports
    cornerstoneTools.touchInput = {
        enable : enable,
        disable : disable
    };

    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function anyHandlesOutsideImage(renderData, handles)
    {
        var image = renderData.image;
        var imageRect = {
            left: 0,
            top: 0,
            width: image.width,
            height: image.height
        };

        var handleOutsideImage = false;
        for(var property in handles) {
            var handle = handles[property];
            if(cornerstoneTools.point.insideRect(handle, imageRect) === false)
            {
                handleOutsideImage = true;
            }
        }
        return handleOutsideImage;
    }

    // module/private exports
    cornerstoneTools.anyHandlesOutsideImage = anyHandlesOutsideImage;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 6;

    function drawHandles(context, renderData, handles)
    {
        context.strokeStyle = 'white';
        var radius = handleRadius / renderData.viewport.scale;
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active || handle.highlight) {
                context.beginPath();
                if(handle.active)
                {
                    context.lineWidth = 2 / renderData.viewport.scale;
                }
                else
                {
                    context.lineWidth = 0.5 / renderData.viewport.scale;
                }
                context.arc(handle.x, handle.y, radius, 0, 2 * Math.PI);
                context.stroke();
            }
        }
    }


    // module/private exports
    cornerstoneTools.drawHandles = drawHandles;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    var handleRadius = 6;

    function findHandleNear(handles, imagePoint, scale)
    {
        var handleRadiusScaled = handleRadius / scale;

        for(var property in handles) {
            var handle = handles[property];
            var distance = csc.distance(imagePoint, handle);
            if(distance <= handleRadiusScaled)
            {
                return handle;
            }
        }
        return undefined;
    }

    function getActiveHandle(handles) {
        for(var property in handles) {
            var handle = handles[property];
            if(handle.active === true) {
                return handle;
            }
        }
        return undefined;
    }

    function handleActivator(handles, imagePoint, scale)
    {
        var activeHandle = getActiveHandle(handles);
        var nearbyHandle = findHandleNear(handles, imagePoint, scale);
        if(activeHandle !== nearbyHandle)
        {
            if(nearbyHandle !== undefined) {
                nearbyHandle.active = true;
            }
            if(activeHandle !== undefined) {
                activeHandle.active = false;
            }
            return true;
        }
        return false;
    }


    // module/private exports

    cornerstoneTools.handleActivator = handleActivator;
    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function moveHandle(mouseEventData, handle, doneMovingCallback)
    {
        var element = mouseEventData.element;

        function mouseDragCallback(e) {
            var mouseMoveData = e.originalEvent.detail;
            handle.x = mouseMoveData.currentPoints.image.x;
            handle.y = mouseMoveData.currentPoints.image.y;
            cornerstone.updateImage(element);
        }
        $(element).on("CornerstoneToolsMouseDrag", mouseDragCallback);

        function mouseUpCallback(mouseMoveData) {
            handle.eactive = false;
            $(element).off("CornerstoneToolsMouseDrag", mouseDragCallback);
            $(element).off("CornerstoneToolsMouseUp", mouseUpCallback);
            cornerstone.updateImage(element);

            doneMovingCallback();
        }
        $(element).on("CornerstoneToolsMouseUp", mouseUpCallback);
    }


    // module/private exports
    cornerstoneTools.moveHandle = moveHandle;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function pageToPoint(e)
    {
        return {
            x : e.pageX,
            y : e.pageY
        };
    }

    function subtract(lhs, rhs)
    {
        return {
            x : lhs.x - rhs.x,
            y : lhs.y - rhs.y
        };
    }

    function copy(point)
    {
        return {
            x : point.x,
            y : point.y
        };
    }

    function distance(from, to)
    {
        return Math.sqrt(distanceSquared(from, to));
    }

    function distanceSquared(from, to)
    {
        var delta = subtract(from, to);
        return delta.x * delta.x + delta.y * delta.y;
    }

    function insideRect(point, rect)
    {
        if( point.x < rect.left ||
            point.x > rect.left + rect.width ||
            point.y < rect.top ||
            point.y > rect.top + rect.height)
        {
            return false;
        }
        return true;
    }


    // module exports
    cornerstoneTools.point =
    {
        subtract : subtract,
        copy: copy,
        pageToPoint: pageToPoint,
        distance: distance,
        distanceSquared: distanceSquared,
        insideRect: insideRect
    };


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    // This implements an imageId specific tool state management strategy.  This means that
    // measurements data is tied to a specific imageId and only visible for enabled elements
    // that are displaying that imageId.

    function newImageIdSpecificToolStateManager() {
        var toolState = {};

        // here we add tool state, this is done by tools as well
        // as modules that restore saved state
        function addImageIdSpecificToolState(element, toolType, data)
        {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, add an empty object
            if(toolState.hasOwnProperty(enabledImage.ids.imageId) === false)
            {
                toolState[enabledImage.ids.imageId] = {};
            }
            var imageIdToolState = toolState[enabledImage.ids.imageId];

            // if we don't have tool state for this type of tool, add an empty object
            if(imageIdToolState.hasOwnProperty(toolType) === false)
            {
                imageIdToolState[toolType] = {
                    data: []
                };
            }
            var toolData = imageIdToolState[toolType];

            // finally, add this new tool to the state
            toolData.data.push(data);
        }

        // here you can get state - used by tools as well as modules
        // that save state persistently
        function getImageIdSpecificToolState(element, toolType)
        {
            var enabledImage = cornerstone.getEnabledElement(element);
            // if we don't have any tool state for this imageId, return undefined
            if(toolState.hasOwnProperty(enabledImage.ids.imageId) === false)
            {
                return undefined;
            }
            var imageIdToolState = toolState[enabledImage.ids.imageId];

            // if we don't have tool state for this type of tool, return undefined
            if(imageIdToolState.hasOwnProperty(toolType) === false)
            {
                return undefined;
            }
            var toolData = imageIdToolState[toolType];
            return toolData;
        }

        var imageIdToolStateManager = {
            get: getImageIdSpecificToolState,
            add: addImageIdSpecificToolState
        };
        return imageIdToolStateManager;
    }

    // a global imageIdSpecificToolStateManager - the most common case is to share state between all
    // visible enabled images
    var globalImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager();

    // module/private exports
    cornerstoneTools.newImageIdSpecificToolStateManager = newImageIdSpecificToolStateManager;
    cornerstoneTools.globalImageIdSpecificToolStateManager = globalImageIdSpecificToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, csc, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function getElementToolStateManager(element)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        // if the enabledImage has no toolStateManager, create a default one for it
        // NOTE: This makes state management element specific
        if(enabledImage.toolStateManager === undefined) {
            enabledImage.toolStateManager = cornerstoneTools.globalImageIdSpecificToolStateManager;
        }
        return enabledImage.toolStateManager;
    }

    // here we add tool state, this is done by tools as well
    // as modules that restore saved state
    function addToolState(element, toolType, data)
    {
        var toolStateManager = getElementToolStateManager(element);
        toolStateManager.add(element, toolType, data);
        // TODO: figure out how to broadcast this change to all enabled elements so they can update the image
        // if this change effects them
    }

    // here you can get state - used by tools as well as modules
    // that save state persistently
    function getToolState(element, toolType)
    {
        var toolStateManager = getElementToolStateManager(element);
        return toolStateManager.get(element, toolType);
    }

    function removeToolState(element, toolType, data)
    {
        var toolStateManager = getElementToolStateManager(element);
        var toolData = toolStateManager.get(element, toolType);
        // find this tool data
        var indexOfData = -1;
        for(var i = 0; i < toolData.data.length; i++) {
            if(toolData.data[i] === data)
            {
                indexOfData = i;
            }
        }
        if(indexOfData !== -1) {
            toolData.data.splice(indexOfData, 1);
        }
    }

    // sets the tool state manager for an element
    function setElementToolStateManager(element, toolStateManager)
    {
        var enabledImage = cornerstone.getEnabledElement(element);
        enabledImage.toolStateManager = toolStateManager;
    }

    /*
     function getElementToolStateManager(element)
     {
     var enabledImage = cornerstone.getEnabledElement(element);
     return enabledImage.toolStateManager;
     }
     */

    // module/private exports
    cornerstoneTools.addToolState = addToolState;
    cornerstoneTools.getToolState = getToolState;
    cornerstoneTools.removeToolState = removeToolState;
    cornerstoneTools.setElementToolStateManager = setElementToolStateManager;
    cornerstoneTools.getElementToolStateManager = getElementToolStateManager;

    return cornerstoneTools;
}($, cornerstone, cornerstoneCore, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    function copyPoints(points)
    {
        var page = cornerstoneTools.point.copy(points.page);
        var image = cornerstoneTools.point.copy(points.image);
        return {
            page : page,
            image: image
        };
    }


    // module exports
    cornerstoneTools.copyPoints = copyPoints;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));
var cornerstoneTools = (function ($, cornerstone, cornerstoneTools) {

    "use strict";

    if(cornerstoneTools === undefined) {
        cornerstoneTools = {};
    }

    /**
     * This function is used to prevent selection from occuring when left click dragging on the image
     * @param e the event that is provided to your event handler
     * Based on: http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
     * @returns {boolean}
     */
    function pauseEvent(e)
    {
        if(e.stopPropagation) {
            e.stopPropagation();
        }
        if(e.preventDefault) {
            e.preventDefault();
        }
        e.cancelBubble=true;
        e.returnValue=false;
        return false;
    }

    // module exports
    cornerstoneTools.pauseEvent = pauseEvent;


    return cornerstoneTools;
}($, cornerstone, cornerstoneTools));