function VisualGraph(id, paper, graph, graphDrawer, autoDraw, vertexVisualInfo, edgeVisualInfo) {
   this.id = id;
   this.paper = paper;
   this.graph = graph;
   this.graphDrawer = graphDrawer;
   this.hasDrawing = false;

   if(vertexVisualInfo) {
      this.vertexVisualInfo = vertexVisualInfo;
   }
   else {
      this.vertexVisualInfo = {};
   }
   if(edgeVisualInfo) {
      this.edgeVisualInfo = edgeVisualInfo;
   }
   else {
      this.edgeVisualInfo = {};
   }
   this.edgeRaphaels = {};
   this.vertexRaphaels = {};
   var self = this;

   this.listener = {
      addVertex: function(id, info) {
         self._drawVertex(id, info);
         return true;
      },
      addEdge: function(id, vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo) {
         self._drawEdge(id, vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo);
         return true;
      },
      removeVertex: function(id, info) {
         self._eraseVertex(id, info);
         delete self.vertexVisualInfo[id];
         return true;
      },
      removeEdge: function(id, vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo) {
         self._eraseEdge(id, vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo);
         delete self.edgeVisualInfo[id];
         return true;
      }
   };
   this.priority = 1000;

   this._attachRaphaelID = function(elements, id) {
      for(var iElement in elements) {
         elements[iElement].data("id", id);
      }
   };

   this._initDrawer = function() {
      if(!this.hasDrawing && this.graphDrawer.init) {
         this.graphDrawer.init(this.paper, this.graph, this);
      }
      this.hasDrawing = true;
   };

   this.setAutoDraw = function(autoDraw) {
      if(autoDraw == this.autoDraw) {
         return;
      }
      this.autoDraw = autoDraw;
      if(autoDraw) {
         this.graph.addPostListener(this.id, this.listener, this.priority);
      }
      else {
         this.graph.removePostListener(this.id);
      }
   };

   this.redraw = function() {
      this._removeGraphics();
      var vertices = this.graph.getAllVertices();
      for(var iVertex in vertices) {
         this._drawVertex(vertices[iVertex], this.graph.getVertexInfo(vertices[iVertex]));
      }
      var edges = this.graph.getAllEdges();
      for(var iEdge in edges) {
         var edgeVertices = this.graph.getEdgeVertices(edges[iEdge]);
         var vertex1 = edgeVertices[0];
         var vertex2 = edgeVertices[1];
         var vertex1Info = this.graph.getVertexInfo(vertex1);
         var vertex2Info = this.graph.getVertexInfo(vertex2);
         var edgeInfo = this.graph.getEdgeInfo(edges[iEdge]);
         this._drawEdge(edges[iEdge], vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo);
      }
      if(this.graphDrawer.drawingComplete) {
         this.graphDrawer.drawingComplete();
      }
   };

   this._removeGraphics = function() {
      if(!this.hasDrawing) {
         return;
      }
      for(var edgeID in this.edgeRaphaels) {
         this._eraseEdge(edgeID);
      }
      for(var vertexID in this.vertexRaphaels) {
         this._eraseVertex(vertexID);
      }
      if(this.graphDrawer.deinit) {
         this.graphDrawer.deinit();
      }
      this.hasDrawing = false;
   };

   this._drawVertex = function(id, info) {
      self._initDrawer();
      if(!self.vertexVisualInfo[id]) {
         self.vertexVisualInfo[id] = {};
      }
      if(self.graphDrawer.drawVertex) {
         self.vertexRaphaels[id] = self.graphDrawer.drawVertex(id, info, self.vertexVisualInfo[id]);
         self._attachRaphaelID(self.vertexRaphaels[id], id);
      }
      else {
         self.vertexRaphaels[id] = [];
      }
   };

   this._drawEdge = function(id, vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo) {
      self._initDrawer();
      if(!self.edgeVisualInfo[id]) {
         self.edgeVisualInfo[id] = {};
      }
      if(self.graphDrawer.drawEdge) {
         self.edgeRaphaels[id] = self.graphDrawer.drawEdge(id, vertex1, vertex2, vertex1Info, vertex2Info, self.vertexVisualInfo[vertex1], self.vertexVisualInfo[vertex2], edgeInfo, self.edgeVisualInfo[id]);
         self._attachRaphaelID(self.edgeRaphaels[id], id);
      }
      else {
         self.edgeRaphaels[id] = [];
      }
   };

   this._eraseVertex = function(id, info) {
      if(this.graphDrawer.eraseVertex) {
         this.graphDrawer.eraseVertex(id, info, self.vertexVisualInfo[id]);
      }
      for(var iElement in this.vertexRaphaels[id]) {
         var element = this.vertexRaphaels[id][iElement];
         if(element && element.remove) {
            element.remove();
         }
      }
      delete self.vertexRaphaels[id];
   };

   this._eraseEdge = function(id, vertex1, vertex2, vertex1Info, vertex2Info, edgeInfo) {
      if(this.graphDrawer.eraseEdge) {
         this.graphDrawer.eraseEdge(id, vertex1, vertex2, vertex1Info, vertex2Info, self.vertexVisualInfo[vertex1], self.vertexVisualInfo[vertex2], edgeInfo, self.edgeVisualInfo[id]);
      }
      for(var iElement in this.edgeRaphaels[id]) {
         var element = this.edgeRaphaels[id][iElement];
         if(element && element.remove) {
            element.remove();
         }
      }
      delete self.edgeRaphaels[id];
   };

   this.remove = function() {
      this._removeGraphics();
      this.setAutoDraw(false);
   };

   this.pushVertexRaphael = function(id, element) {
      if(!this.vertexRaphaels[id]) {
         return;
      }
      this.vertexRaphaels[id].push(element);
      element.data("id", id);
   };

   this.popVertexRaphael = function(id) {
      if(!this.vertexRaphaels[id] || !this.vertexRaphaels[id].length) {
         return;
      }
      return this.vertexRaphaels[id].pop();
   };

   this.pushEdgeRaphael = function(id, element) {
      if(!this.edgeRaphaels[id]) {
         return;
      }
      this.edgeRaphaels[id].push(element);
      element.data("id", id);
   };

   this.popEdgeRaphael = function(id) {
      if(!this.edgeRaphaels[id] || !this.edgeRaphaels[id].length) {
         return;
      }
      return this.edgeRaphaels[id].pop();
   };

   this.setVertexVisualInfo = function(id, info) {
      this.vertexVisualInfo[id] = info;
   };

   this.getVertexVisualInfo = function(id) {
      return this.vertexVisualInfo[id];
   };

   this.setEdgeVisualInfo = function(id, info) {
      this.edgeVisualInfo[id] = info;
   };

   this.getEdgeVisualInfo = function(id) {
      return this.edgeVisualInfo[id];
   };

   this.getRaphaelsFromID = function(id) {
      if(this.vertexRaphaels[id]) {
         return this.vertexRaphaels[id];
      }
      if(this.edgeRaphaels[id]) {
         return this.edgeRaphaels[id];
      }
      return [];
   };

   this.elementToFront = function(id) {
      var raphaels = this.getRaphaelsFromID(id);
      for(var iElement in raphaels) {
         raphaels[iElement].toFront();
      }
   };

   this.setPaper = function(paper) {
      this.paper = paper;
   };
   this.getPaper = function() {
      return this.paper;
   };

   this.setDrawer = function(graphDrawer) {
      this.graphDrawer = graphDrawer;
   };

   this.getGraph = function() {
      return this.graph;
   };

   this.toJSON = function() {
      return JSON.stringify({
         vertexVisualInfo: this.vertexVisualInfo,
         edgeVisualInfo: this.edgeVisualInfo,
         minGraph: this.graph.toMinimized()
      });
   };

   this.setAutoDraw(autoDraw);
   if(autoDraw) {
      this.redraw();
   }
}

VisualGraph.fromJSON = function(visualGraphStr, id, paper, graph, graphDrawer, autoDraw) {
   var visualInfo = JSON.parse(visualGraphStr);
   if(!graph) {
      graph = Graph.fromMinimized(visualInfo.minGraph);
   }
   return new VisualGraph(id, paper, graph, graphDrawer, autoDraw, visualInfo.vertexVisualInfo, visualInfo.edgeVisualInfo);
};

function SimpleGraphDrawer(circleAttr, lineAttr, vertexDrawer, autoMove, vertexMover, thickMode, innerLineAttr) {
   this.circleAttr = circleAttr;
   this.lineAttr = lineAttr;
   this.edgeLabelAttr;
   this.vertexLabelAttr = {
      "font-size": 15,
      "font-family": "sans-serif"
   };
   this.edgeLabelAttr = {
      "font-size": 15,
      "font-family": "sans-serif"
   };
   this.edgeClickAreaAttr = {
      "stroke-width": 20,
      "stroke": "red",
      "opacity": 0
   };
   this.init = function(paper, graph, visualGraph) {
      this.paper = paper;
      this.graph = graph;
      this.visualGraph = visualGraph;
      this.customElements = {};
      this.originalPositions = {};
   };
   this.setDrawVertex = function(fct) {
      this.drawVertex = fct;
   };
   this.setDrawEdge = function(fct) {
      this.drawEdge = fct;
   };
   this.setEdgeLabelAttr = function(attr) {
      this.edgeLabelAttr = attr;
   };
   this.setCircleAttr = function(circleAttr) {
      this.circleAttr = circleAttr;
   };
   this.setLineAttr = function(lineAttr) {
      this.lineAttr = lineAttr;
   };
   this.setVertexLabelAttr = function(attr) {
      this.vertexLabelAttr = attr;
   };
   this.setEdgeClickAreaAttr = function(attr) {
      this.edgeClickAreaAttr = attr;
   };
   this.drawVertex = function(id, info, visualInfo) {
      var pos = this._getVertexPosition(visualInfo);
      this.originalPositions[id] = pos;
      var label = (info.label) ? info.label : "";
      var node = this.paper.circle(pos.x, pos.y).attr(this.circleAttr);
      var labelRaph = this.paper.text(pos.x,pos.y,label).attr(this.vertexLabelAttr);
      if(info.terminal && !info.initial){
         var terminalCircle = this.paper.circle(pos.x, pos.y).attr("r",this.circleAttr.r + 5);
         var result = [node,labelRaph,terminalCircle];
         this._addCustomElements(id, [labelRaph,terminalCircle]);
      }else if(info.initial && !info.terminal){
         var initialArrow = this.paper.path("M" + (pos.x - 3*this.circleAttr.r) + "," + pos.y + "H" + (pos.x - this.circleAttr.r)).attr(this.lineAttr);
         initialArrow.attr("stroke-width",this.lineAttr["stroke-width"]+1);
         var result = [node,labelRaph,initialArrow];
         this._addCustomElements(id, [labelRaph,initialArrow]);
      }else if(info.initial && info.terminal){
         var terminalCircle = this.paper.circle(pos.x, pos.y).attr("r",this.circleAttr.r + 5);
         var initialArrow = this.paper.path("M" + (pos.x - 3*this.circleAttr.r) + "," + pos.y + "H" + (pos.x - this.circleAttr.r)).attr(this.lineAttr);
         initialArrow.attr("stroke-width",this.lineAttr["stroke-width"]+1);
         var result = [node,labelRaph,initialArrow,terminalCircle];
         this._addCustomElements(id, [labelRaph,initialArrow,terminalCircle]);
      }else{
         var result = [node,labelRaph];
         this._addCustomElements(id, [labelRaph]);
      }
      if(vertexDrawer) {
         var raphaels = vertexDrawer(id, info, pos.x, pos.y);
         this._addCustomElements(id, raphaels);
         result = result.concat(raphaels);
      }
      return result;
   };
   this.updateVertex = function(id) {
      var info = this.graph.getVertexInfo(id);
      var visualInfo = this.visualGraph.getVertexVisualInfo(id);
      this.visualGraph._eraseVertex(id);
      this.drawVertex(id,info,visualInfo);
   };
   
   this.drawEdge = function(id, vertex1, vertex2) {
      if(thickMode) {
         var path = this._getThickEdgePath(vertex1, vertex2);
         return [this.paper.path(path).attr(this.lineAttr).toBack(), this.paper.path(path).attr(innerLineAttr)];
      }
      else {
         var clickArea = this.paper.path(this._getEdgePath(id)).attr(this.edgeClickAreaAttr).toBack();
         var path = this.paper.path(this._getEdgePath(id)).attr(this.lineAttr).toBack();
         var info = this.graph.getEdgeInfo(id);
         var labelText = info.label || "";
         var labelPos = this.getLabelPos(id, vertex1, vertex2);
         var label = this.paper.text(labelPos.x,labelPos.y,labelText).attr(this.edgeLabelAttr);
         return [path,label,clickArea];   // !!!
      }
   };
   
   this._getVertexPosition = function(visualInfo) {
      if(visualInfo.x === undefined || visualInfo.x === null) {
         visualInfo.x = 0;
         visualInfo.y = 0;
      }
      return {
         x: visualInfo.x,
         y: visualInfo.y
      };
   };
   this.getVertexPosition = function(id) {
      return this._getVertexPosition(this.visualGraph.getVertexVisualInfo(id));
   };
   this._addCustomElements = function(id, raphaels) {
      // Save original attributes. This allows us to move the object later by transformation.
      this.customElements[id] = [];
      for(var iElement in raphaels) {
         var raphael = raphaels[iElement];
         this.customElements[id].push({
            raphael: raphael,
            originalAttrs: $.extend(true, {}, raphael.attrs)
         });
      }
   };
   this.moveVertex = function(id, x, y) {
      var info = this.visualGraph.getVertexVisualInfo(id);
      info.x = x;
      info.y = y;
      var raphaels = this.visualGraph.getRaphaelsFromID(id);
      raphaels[0].attr({
         cx: x,
         cy: y
      });
      // Move the custom Raphael objects.
      if(vertexMover) {
         vertexMover(id, raphaels, x, y);
      }
      if(autoMove) {
         this._moveCustomElements(id, x, y);
      }

      var childrenIDs = this.graph.getChildren(id);
      for(var iChild in childrenIDs) {
         this.refreshEdgePosition(id, childrenIDs[iChild]);
      }
      if(this.graph.directed) {
         var parentIDs = this.graph.getParents(id);
         for(var iParent in parentIDs) {
            this.refreshEdgePosition(parentIDs[iParent], id);
         }
      }
   };
   this._moveCustomElements = function(id, x, y) {
      var elements = this.customElements[id];
      var transformation = ["T", x - this.originalPositions[id].x, y - this.originalPositions[id].y];
      for(var iElement in elements) {
         var element = elements[iElement];
         // Paths get transformed using Raphael.transformPath,
         // for compatibility. Other objects get transformed normally.
         if(element.raphael.type === "path") {
            element.raphael.attr({path: Raphael.transformPath(element.originalAttrs.path, transformation)});
         }
         else {
            element.raphael.transform(transformation);
         }
      }
   };
   this.refreshEdgePosition = function(vertex1, vertex2) {
      var edges = this.graph.getEdgesFrom(vertex1, vertex2);

      var info1 = this.visualGraph.getVertexVisualInfo(vertex1);
      var info2 = this.visualGraph.getVertexVisualInfo(vertex2);
      var newPath;

      for(var iEdge in edges) {
         var edgeID = edges[iEdge];
         var raphaels = this.visualGraph.getRaphaelsFromID(edgeID);
         if(thickMode) {
            newPath = this._getThickEdgePath(vertex1, vertex2);
         }
         else {
            newPath = this._getEdgePath(edgeID);
         }

         raphaels[0].attr("path", newPath);
         raphaels[2].attr("path", newPath);
         var info = this.graph.getEdgeInfo(edgeID);
         var labelText = info.label || "";
         var labelPos = this.getLabelPos(edgeID, vertex1, vertex2);
         raphaels[1].attr({x:labelPos.x,y:labelPos.y,text:labelText});
         if(thickMode) {
            raphaels[1].attr("path", newPath);
         }
      }
   };
   this._getEdgePath = function(edgeID) {
      var edgeVisualInfo = this.visualGraph.getEdgeVisualInfo(edgeID);
      var vertices = this.graph.getEdgeVertices(edgeID);
      var vertex1 = vertices[0];
      var vertex2 = vertices[1];
      if(edgeVisualInfo["radius-ratio"] || vertex1 === vertex2){
         return  this._getCurvedEdgePath(vertex1,vertex2,edgeID);
      }
      var info1 = this.visualGraph.getVertexVisualInfo(vertex1);
      var info2 = this.visualGraph.getVertexVisualInfo(vertex2);
      var x1 = info1.x, y1 = info1.y, x2 = info2.x, y2 = info2.y;
      var r = this.circleAttr.r;
      /*
       * We want to draw an edge from the center of one circle toward the center
       * of another, but only up to its surface. Otherwise the arrow would be
       * inside the target circle.
       * The line between centers goes from x1,y1 to x2,y2, and we want to
       * chop length r from it. We call the denote by w,h the displacement
       * from x2,y2.
       */

      // Same X coordinate.
      if(x1 == x2) {
         if(y1 < y2) {
            return ["M", x1, y1, "L", x2, y2 - r];
         }
         else {
            return ["M", x1, y1, "L", x2, y2 + r];
         }
      }
      // Swap for convenience. x1,y1 is always to the left.
      var swap = false;
      if(x1 > x2) {
         swap = true;
         var temp = x1;
         x1 = x2;
         x2 = temp;
         temp = y1;
         y1 = y2;
         y2 = temp;
      }
      // We have h^2 + w^2 = r^2 and (y2-y1)/(x2-x1) = h/w.
      var slope = 1.0 * (y2 - y1) / (x2 - x1);
      var w = (r / Math.sqrt((1 + slope * slope)));
      var h = (slope * w);
      if(!swap) {
         return ["M", x1, y1, "L", x2 - w, y2 - h];
      }
      else {
         return ["M", x2, y2, "L", x1 + w, y1 + h];
      }
   };
   this._getThickEdgePath = function(vertex1, vertex2) {
      var info1 = this.visualGraph.getVertexVisualInfo(vertex1);
      var info2 = this.visualGraph.getVertexVisualInfo(vertex2);
      var x1 = info1.x, y1 = info1.y, x2 = info2.x, y2 = info2.y;
      return ["M", x1, y1, "L", x2, y2];
   };
   
   this._getCurvedEdgePath = function(vertex1,vertex2,edgeID) {
      var info1 = this.visualGraph.getVertexVisualInfo(vertex1);
      var info2 = this.visualGraph.getVertexVisualInfo(vertex2);
      var edgeVisualInfo = this.visualGraph.getEdgeVisualInfo(edgeID);
      var x1 = info1.x, y1 = info1.y, x2 = info2.x, y2 = info2.y;
      var r = this.circleAttr.r;
      var D = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));  // distance between vertex1 and vertex2
      var R = D*edgeVisualInfo["radius-ratio"];   // arc radius, between D/2 and +inf (almost straight line at D*50). 
      var s = edgeVisualInfo.sweep || 0;  // sweep flag
      var l = edgeVisualInfo["large-arc"] || 0;  // large arc flag  

      /* Calculation of the coordinates of the target point at the surface of the target vertex */
      var angle = (l) ? (Math.asin(D/(2*R)) + Math.PI) : Math.asin(D/(2*R));
      if(y1 !== y2 && x1 !== x2){
         var A = (x2 - x1)/(y1 - y2);
         var B = (x1*x1 + y1*y1 + r*r - x2*x2 - y2*y2 - Math.pow((r*Math.sin(angle)),2) - Math.pow((D - r*Math.cos(angle)),2))/(2*(y1 - y2));
         var a = 1 + A*A;
         var b = 2*(A*B - A*y2 - x2);
         var c = x2*x2 + y2*y2 + B*B - 2*y2*B - r*r;
         var delta = b*b - 4*a*c;
         if(y1 > y2){
            var x3 = (s) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
         }else{
            var x3 = (s) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a);
         }
         
         var y3 = A*x3 + B;
      }else if(vertex1 === vertex2){
         angle = edgeVisualInfo.angle || 0;
         R = (edgeVisualInfo["radius-ratio"]) ? edgeVisualInfo["radius-ratio"]*r : 1.5*r;
         x1 = x2 + r*Math.sin(Math.PI*angle/180);
         y1 = y2 + r*Math.cos(Math.PI*angle/180);
         var x3 = x2 - r*Math.sin(Math.PI*angle/180);
         var y3 = y2 - r*Math.cos(Math.PI*angle/180);
         l = 1;
         edgeVisualInfo.angle = angle;
         edgeVisualInfo["radius-ratio"] = R/r;
      }else if(y1 === y2){
         var x3 = (x1*x1 + r*r - x2*x2 - Math.pow((r*Math.sin(angle)),2) - Math.pow((D - r*Math.cos(angle)),2))/(2*(x1-x2));
         var a = 1;
         var b = -2*y2;
         var c = Math.pow((x3 - x2),2) + y2*y2 - r*r;
         var delta = b*b - 4*a*c;
         if(x1 < x2){
            var y3 = (s) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
         }else{
            var y3 = (s) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a)
         }

      }else if(x1 === x2){
         var y3 = (y1*y1 + r*r - y2*y2 - Math.pow((r*Math.sin(angle)),2) - Math.pow((D - r*Math.cos(angle)),2))/(2*(y1-y2));
         var a = 1;
         var b = -2*x2;
         var c = Math.pow((y3 - y2),2) + x2*x2 - r*r;
         var delta = b*b - 4*a*c;
         if(y1 > y2){
            var x3 = (s) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
         }else{
            var x3 = (s) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a);
         }
      }
      return [ "M", x1, y1, "A", R, R, 0, l, s, x3, y3 ]; 
   };

   
   this.reapplyAttr = function() {
      var vertices = this.graph.getAllVertices();
      for(var iVertex in vertices) {
         this.visualGraph.getRaphaelsFromID(vertices[iVertex])[0].attr(this.circleAttr);
      }
      var edges = this.graph.getAllEdges();
      for(var iEdge in edges) {
         var raphaels = this.visualGraph.getRaphaelsFromID(edges[iEdge]);
         raphaels[0].attr(this.lineAttr);
         if(thickMode) {
            raphaels[1].attr(innerLineAttr);
         }
      }
   };
   this.getDistanceFromVertex = function(id, xPos, yPos) {
      var vertexPos = this.getVertexPosition(id);
      var xDistance = xPos - vertexPos.x;
      var yDistance = yPos - vertexPos.y;
      var distanceFromCenter = Math.sqrt(xDistance * xDistance + yDistance * yDistance);
      if(distanceFromCenter <= this.circleAttr.r) {
         return 0;
      }
      return distanceFromCenter - this.circleAttr.r;
   };
   this.getDistanceFromEdge = function(id, xPos, yPos) {
      var vInfo = this.visualGraph.getEdgeVisualInfo(id);
      if(vInfo["radius-ratio"]){    // if curved edge
         var vertices = this.graph.getEdgeVertices(id);
         if(vertices[0] === vertices[1]){    // if loop
            var R = vInfo["radius-ratio"]*this.circleAttr.r;
            var angle = vInfo["angle"] || 0;
            var vertexVisualInfo = this.visualGraph.getVertexVisualInfo(vertices[0]);
            var xc = vertexVisualInfo.x + R*Math.cos(angle*Math.PI/180);
            var yc = vertexVisualInfo.y - R*Math.sin(angle*Math.PI/180);
         }else{
            var vertex1Pos = this.visualGraph.getVertexVisualInfo(vertices[0]);
            var vertex2Pos = this.visualGraph.getVertexVisualInfo(vertices[1]);
            var x1 = vertex1Pos.x;
            var y1 = vertex1Pos.y;
            var x2 = vertex2Pos.x;
            var y2 = vertex2Pos.y;
            var D = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
            var R = vInfo["radius-ratio"]*D;
            var s = vInfo.sweep || 0;
            var l = vInfo["large-arc"] || 0;
            var cPos = this.getCenterPosition(R,s,l,vertex1Pos,vertex2Pos);
            var xc = cPos.x;
            var yc = cPos.y;
         }
         var distFromCenter = Math.sqrt(Math.pow((xPos - xc),2) + Math.pow((yPos - yc),2));
         return Math.abs(distFromCenter - R);  
      }else{
         var edgePath = this.visualGraph.getRaphaelsFromID(id)[0].attrs.path;
         var x1, y1, x2, y2;
         // In modern browsers the path is an array and we can get the endpoints
         // directly. In old browsers it may be a comma separated string.
         if($.isArray(edgePath)) {
            if($.isArray(edgePath[0])) {
               // Path a 2D array: [["M", x1, y1], ["L", x2, y2]]
               x1 = parseInt(edgePath[0][1]);
               y1 = parseInt(edgePath[0][2]);
               x2 = parseInt(edgePath[1][1]);
               y2 = parseInt(edgePath[1][2]);
            }
            else {
               // Path is an array: ["M", x1, y1, "L", x2, y2]
               x1 = parseInt(edgePath[1]);
               y1 = parseInt(edgePath[2]);
               x2 = parseInt(edgePath[4]);
               y2 = parseInt(edgePath[5]);
            }
         }
         else {
            // Path is a string: "M,x1,y1,L,x2,y2"
            var parts = edgePath.split(",");
            x1 = parseInt(parts[1]);
            y1 = parseInt(parts[2]);
            x2 = parseInt(parts[4]);
            y2 = parseInt(parts[5]);
         }
         return Math.sqrt(distanceToSegmentSquared(xPos, yPos, x1, y1, x2, y2));
      }
   };

   this.getLabelPos = function(edgeID,vertex1,vertex2) {
      if(!vertex1 || !vertex2){
         var edgeVertices = this.graph.getEdgeVertices(edgeID);
         vertex1 = edgeVertices[0];
         vertex2 = edgeVertices[1];
      }
      var info = this.graph.getEdgeInfo(edgeID);
      var vInfo = this.visualGraph.getEdgeVisualInfo(edgeID);
      var vertex1Pos = this.visualGraph.getVertexVisualInfo(vertex1);
      var vertex2Pos = this.visualGraph.getVertexVisualInfo(vertex2);
      var x1 = vertex1Pos.x;
      var y1 = vertex1Pos.y;
      var x2 = vertex2Pos.x;
      var y2 = vertex2Pos.y;

      var label = info.label || "";
      var labelW = label.length * this.edgeLabelAttr["font-size"] || this.edgeLabelAttr["font-size"];
      var labelH = this.edgeLabelAttr["font-size"];
      var margin = 10;
      if(label.length < 2){
         labelW += margin;
      }
      var angle;
      if(x1 === x2){
         if(y1 > y2){
            angle = Math.PI/2;
         }else{
            angle = -Math.PI/2;
         }
      }else{
         angle = Math.atan((y2 - y1)/(x2 - x1));
      }
      if(vInfo["radius-ratio"] || vertex1 ===  vertex2){ // if curved edge
         if(vertex1 === vertex2){   // if loop
            angle = vInfo.angle*Math.PI/180 || 0;
            var R = this.circleAttr.r*vInfo["radius-ratio"];
            var xm = x1 + 2*R*Math.cos(angle);
            var ym = y1 - 2*R*Math.sin(angle);
            var x = xm - (labelW/2)*Math.sin(angle - Math.PI/2);
            var y = ym + (labelH/2)*Math.cos(angle + Math.PI/2);
         }else{
            var D = Math.sqrt(Math.pow((x2-x1),2) + Math.pow((y2-y1),2));
            var R = D*vInfo["radius-ratio"];
            var s = vInfo["sweep"] || 0;
            var l = vInfo["large-arc"] || 0;
            var cPos = this.getCenterPosition(R,s,l,vertex1Pos,vertex2Pos);
            if(vInfo["radius-ratio"] == 0.5){
               R += 10;
            }
            if(x2 > x1){
               var xm = (s) ? cPos.x + R*Math.sin(angle) : cPos.x - R*Math.sin(angle);
               var ym = (s) ? cPos.y - R*Math.cos(angle) : cPos.y + R*Math.cos(angle);
            }else{
               var xm = (s) ? cPos.x - R*Math.sin(angle) : cPos.x + R*Math.sin(angle);
               var ym = (s) ? cPos.y + R*Math.cos(angle) : cPos.y - R*Math.cos(angle);
            }
            
            if(x1 < x2){
               var x = (s) ? xm + (labelW/2)*Math.sin(angle) : xm - (labelW/2)*Math.sin(angle);
               var y = (s) ? ym - (labelH/2 + margin)*Math.cos(angle) : ym + (labelH/2 + margin)*Math.cos(angle);
            }else{
               var x = (s) ? xm - (labelW/2)*Math.sin(angle) : xm + (labelW/2)*Math.sin(angle);
               var y = (s) ? ym + (labelH/2 + margin)*Math.cos(angle) : ym - (labelH/2 + margin)*Math.cos(angle);
            }
         }
      }else{
         var xm = (x2 + x1)/2;
         var ym = (y2 + y1)/2;
         if(x1 < x2){
            var x = xm - (labelW/2)*Math.sin(angle);
            var y = ym + (labelH/2 + margin)*Math.cos(angle);
         }else{
            var x = xm + (labelW/2)*Math.sin(angle);
            var y = ym - (labelH/2 + margin)*Math.cos(angle);
         }
         
      }
      return {x:x,y:y};
   };

   this.isOnEdgeLabel = function(edgeID,x,y) {
      var edgeInfo = this.graph.getEdgeInfo(edgeID);
      if(!edgeInfo.label || edgeInfo.label.length === 0){
         return false;
      }
      var labelPos = this.getLabelPos(edgeID);
      var fontSize = this.edgeLabelAttr["font-size"] || 15;  
      var labelH = fontSize;
      var labelW = edgeInfo.label.length * fontSize || fontSize;
      // console.log(edgeID+" "+labelH+" "+labelW);
      if(x < (labelPos.x + labelW/2) && x > (labelPos.x - labelW/2) && y < (labelPos.y + labelH/2) && y > (labelPos.y - labelH/2)){
         return true;
      }
      return false;    
   };

   this.getCenterPosition = function(R,s,l,vInfo1,vInfo2) {
      var x1 = vInfo1.x, y1 = vInfo1.y;
      var x2 = vInfo2.x, y2 = vInfo2.y;
      
      if(y1 !== y2){
         // parameters of the bisection
         var A = (x1 - x2)/(y2 - y1);
         var B = (x2*x2 + y2*y2 - x1*x1 - y1*y1)/(2*(y2 - y1));

         var a = 1 + A*A;
         var b = 2*(A*B - A*y2 - x2);
         var c = x2*x2 + y2*y2 + B*B - 2*y2*B - R*R;
         var delta = b*b - 4*a*c;
         if(delta <= 0)
            delta = 0;
         if(y1 > y2){
            if(s){
               var xc = (l) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
            }else{
               var xc = (l) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a);
            }
         }else{
            if(s){
               var xc = (l) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a);
            }else{
               var xc = (l) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
            }
         }
         var yc = A*xc + B;
      }else{
         var xc = (x1 + x2)/2;

         var a = 1;
         var b = -2*y1;
         var c = y1*y1 + xc*xc + x1*x1 - 2*xc*x1 - R*R;
         var delta = b*b - 4*a*c;
         if(x1 < x2){
            if(s){
               var yc = (l) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
            }else{
               var yc = (l) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a);
            }
         }else{
            if(s){
               var yc = (l) ? (-b + Math.sqrt(delta))/(2*a) : (-b - Math.sqrt(delta))/(2*a);
            }else{
               var yc = (l) ? (-b - Math.sqrt(delta))/(2*a) : (-b + Math.sqrt(delta))/(2*a);
            }
         }
      }
      return {x:xc,y:yc};
   };

   function distanceSquared(x1, y1, x2, y2) {
      return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
   }

   function distanceToSegmentSquared(xPos, yPos, x1, y1, x2, y2) {
      // Use algorithm for distance between point and segment.
      // See: https://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment/1501725#1501725
      var lengthSquared = distanceSquared(x1, y1, x2, y2);
      if(lengthSquared === 0) {
         return distanceSquared(xPos, yPos, x1, y1);
      }
      var t = ((xPos - x1) * (x2 - x1) + (yPos - y1) * (y2 - y1)) / lengthSquared;
      t = Math.max(0, Math.min(1, t));
      return distanceSquared(xPos, yPos, x1 + t * (x2 - x1), y1 + t * (y2 - y1));
   }
}
