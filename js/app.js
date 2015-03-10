var isUndefined = function(x) {
  return (typeof x === "undefined");
};
var isDefined = function(x) {
  return !isUndefined(x);
};
  // set up SVG for D3
// var hitsViz = function(config) {  
  var width  = 1280,
      height = 700,
      maxPages = 26,
      genericRadius = 12,
      probabilityOfLink = 0.2,
      minRadius = 8,
      initialNumberPages = 10,
      currentNumberPages = 0,
      currentindex = 0,
      hubVectors = [],
      authorityVectors = [],
      threshold = 0.001,
      iteration,
      hubtransform,
      sqrtmap_g,
      sqrtmap_b,
      colors = d3.scale.category10();


document.getElementById('iterationNum').value=0;
$('#slider').slider({
          range: "min", 
          min: 0,
          max: iteration,
          value: 0,
          slide: function( event, ui ) {
            document.getElementById('iterationNum').value=ui.value;
            getHubAutByIterNum(ui.value);
            restart();
          }
        });

// minRadius,2*genericRadius*thePage.pageRankValue
  var getAuthority = function(nd) {
    var authority = 0;
    iblks = nd.inboundLinks;
    for (k in iblks) {
      authority = authority + iblks[k].source.hub;

    }
    return authority;

  }

  var getHub = function(nd) {
    var hub = 0;
    oblks = nd.outboundLinks;
    for (j in oblks) {
      hub = hub + oblks[j].target.authority;
    }
    return hub;
  }

  function fixed(s) {
    return s.toFixed(4); 
  }

  function runHITS() {
    console.log("Run All!!");
    // console.log("tt");
    var distance = 1;
    iteration = 0;

    initialHubAut();
    hubVectors = [];
    authorityVectors = [];

    hubVectors.push(Vector.One(currentNumberPages).elements);
    authorityVectors.push(Vector.One(currentNumberPages).elements);

    while (distance > threshold) {

      iteration++;
      var hubvec = [],
          authorityvec = [];
      var norm = 0;
      
      for (i in nodes) { 
        nodes[i].authority = getAuthority(nodes[i]);
        norm += norm + Math.pow(nodes[i].authority, 2);

      }
      for (i in nodes) {
        nodes[i].authority = nodes[i].authority/Math.sqrt(norm);
        authorityvec.push(nodes[i].authority);
      }


      norm = 0;
      for (i in nodes) {
        nodes[i].hub = getHub(nodes[i]);
        norm += norm + Math.pow(nodes[i].hub, 2);
      }
      for (i in nodes) {
        nodes[i].hub = nodes[i].hub/Math.sqrt(norm);
        hubvec.push(nodes[i].hub);
      }

      hubVectors.push(hubvec);
      authorityVectors.push(authorityvec);
      var vec_hub = Vector.create(hubVectors[iteration]);
      var vec_authority = Vector.create(authorityVectors[iteration]);

      distance_hub =  vec_hub.distanceFrom(hubVectors[iteration-1]);
      distance_authority = vec_authority.distanceFrom(authorityVectors[iteration-1]);
      if (distance_hub > distance_authority) {
        distance = distance_hub;
      }
      else {
        distance = distance_authority;
      }
      // console.log(hubVectors); 
    }
    $('#slider').slider( "option", "max", iteration);
    console.log(iteration);
  }



  var hubvector = function(iterationNum) {
    return hubVectors[iterationNum];
  }
  var authorityvector = function(iterationNum) {
    return authorityVectors[iterationNum];
  }


  // function printout() {
  //   for (i in nodes) {
  //     console.log(nodes[i]);
  //     console.log(nodes[i].authority);
  //     console.log(nodes[i].hub);
  //   }
  // }


  function initialHubAut() {
    for (i in nodes) {

      nodes[i].hub = Number(1);
      nodes[i].authority = Number(1);
    }
    // console.log(nodes);

  }

  function getHubAutByIterNum(iterationNum) {

    hubvector = hubVectors[iterationNum];
    authorityvector = authorityVectors[iterationNum];

    // console.log(hubvector);
    max_hub = Vector.create(hubvector).max(); 
    min_hub = Vector.create(hubvector).min(); 

    max_aut = Vector.create(authorityvector).max(); 
    min_aut = Vector.create(authorityvector).min(); 

    // console.log(min_hub);
    for (i in nodes) {
      nodes[i].hub = hubvector[i];
      nodes[i].authority = authorityvector[i];
    }

    
    hubtransform = d3.scale.linear()
                    .domain([min_hub, max_hub])
                    .range([0,30]);

   
      sqrtmap_g = d3.scale.linear()
                      .domain([max_aut,min_hub])
                      .range([0,255])
      sqrtmap_b = d3.scale.linear()
                      .domain([min_hub,max_aut])
                      .range([200,50]); 
   
}
   

  // input number, output node name
  getPageName = function(n) {
    
    var numberChars = 1 + Math.floor(n/26);
    // console.log(n);
    var theValue = (n % 26);
    
    var theChar = String.fromCharCode(65+theValue);
    
    // console.log(numberChars + ", " + theValue + ", " + theChar);
    
    var theName="";
    var j;
    for (j=0;j<numberChars;j++) {
      theName += theChar;
    }
    // console.log(theName);
    
    return theName; // A or B, or C...
  }
  // this.gg = 500;
  // console.log(gg);   
  getNPages = function(n) {
    var theReturn = [];
    var i;
    for ( i = 0; i < n; i++) {  
      
      theReturn.push(getPageName(currentNumberPages)); //   (i+1).toString());
      currentNumberPages++;
    }



    return theReturn; // [A,B,C,D,E...]
  }

  getNewPage = function (name, x,y) {
    
    if (isUndefined(x)) {
      x = Math.random()*width;
    }
    if (isUndefined(y)) {
      y = Math.random()*height;
    }
    
    currentindex++;
    return {
      name : name,
      id: name,
      idx : currentindex,
      reflexive: false,
      outboundLinks : [],
      inboundLinks : [],
      radius : genericRadius,
      x:x,
      y:y,
      hub: Number(1), 
      authority: Number(1)
    };


  };
  
  function initializePages(pageNames, thePages, links) {

    pageNames.forEach(function(pageName, index) {
      thePages[pageName] = getNewPage(pageName);
     
    });
    // console.log(probabilityOfLink);
    pageNames.forEach(function(pageName) {
      pageNames.forEach(function(otherPageName) {
        if (pageName !== otherPageName) {
          if (Math.random() <= probabilityOfLink) { // randomly create link between pages
            var link = {
              source : thePages[pageName],
              target : thePages[otherPageName],
              left: false, 
              right: true
            };
            links.push(link);
            thePages[pageName].outboundLinks.push(link);
            thePages[otherPageName].inboundLinks.push(link);

            //console.log(thePages[pageName].outboundLinks.length);
          }
        }
      });
    });

  };

  function generateNew() {
    
    // console.log(initialNumberPages);
    // alert(document.getElementById('numNodes'));
    currentNumberPages = 0;
    currentindex = 0;
    thePages = {}; //maps name to the page object
    pageNames = getNPages(initialNumberPages); //the pages; they store the in and out links, too

    links = []; //remove extra copy?
    initializePages(pageNames, thePages, links);

    theNodesData = d3.values(thePages);
    theLinksData = links;
    clearNodes();
    appendNodes(theNodesData);

    restart();
  }

  function clearNodes() {
    while(nodes.length >0) {
      nodes.pop();
    }
  }

  function appendNodes(nds) {
    for (i = 0; i < nds.length; i++) {
      nodes.push(nds[i]);
    }
  }

  var thePages = {}; //maps name to the page object
  var pageNames = getNPages(initialNumberPages); //the pages; they store the in and out links, too
  var links = []; //remove extra copy?
   //used for initialization
  initializePages(pageNames, thePages, links);


  var theNodesData = d3.values(thePages); // only take page objects
  var theLinksData = links;
  var nodes = [];

  appendNodes(theNodesData);

  



  var svg = d3.select('body')
    .append('svg')
    .attr('width', 1280)
    .attr('height', height);

  // set up initial nodes and links
  //  - nodes are known by 'id', not by index in array.
  //  - reflexive edges are indicated on the node (as a bold black circle).
  //  - links are always source < target; edge directions are set by 'left' and 'right'.
  
    lastNodeId = 2;


    
   
  // init D3 force layout
  var force = d3.layout.force()
      .nodes(nodes)
      .links(links)
      .size([width, height])
      .linkDistance(350)
      .charge(-500)
      .on('tick', tick)

  // define arrow markers for graph links
  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'end-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 6)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#000');

  svg.append('svg:defs').append('svg:marker')
      .attr('id', 'start-arrow')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 4)
      .attr('markerWidth', 3)
      .attr('markerHeight', 3)
      .attr('orient', 'auto')
    .append('svg:path')
      .attr('d', 'M10,-5L0,0L10,5')
      .attr('fill', '#000');

  // line displayed when dragging new nodes
  var drag_line = svg.append('svg:path')
    .attr('class', 'link dragline hidden')
    .attr('d', 'M0,0L0,0');

  // handles to link and node element groups
  var path = svg.append('svg:g').selectAll('path'),
      circle = svg.append('svg:g').selectAll('g');

  // mouse event vars
  var selected_node = null,
      selected_link = null,
      mousedown_link = null,
      mousedown_node = null,
      mouseup_node = null;


  var tooltip = d3.selectAll("body")
  .append("div")
  .style("position", "absolute")
  .style("visibility", "hidden")
  .style("border-style", "solid")
  .style("background","white")
  function resetMouseVars() {
    mousedown_node = null;
    mouseup_node = null;
    mousedown_link = null;
  }

  // update force layout (called automatically each iteration)
  function tick() {

    // console.log("yyyy1");
    // draw directed edges with proper padding from node centers
    path.attr('d', function(d) {
      source_rad = genericRadius + hubtransform(d.source.hub);
      target_rad = genericRadius + hubtransform(d.target.hub);
      var deltaX = d.target.x - d.source.x,
          deltaY = d.target.y - d.source.y,
          dist = Math.sqrt(deltaX * deltaX + deltaY * deltaY),
          normX = deltaX / dist,
          normY = deltaY / dist,
          sourcePadding = d.left ? source_rad+5 : source_rad,
          targetPadding = d.right ? target_rad+5 : target_rad,
          sourceX = d.source.x + (sourcePadding * normX),
          sourceY = d.source.y + (sourcePadding * normY),
          targetX = d.target.x - (targetPadding * normX),
          targetY = d.target.y - (targetPadding * normY);
          // console.log(sourceX);
      return 'M' + sourceX + ',' + sourceY + 'L' + targetX + ',' + targetY;
    });

    circle.attr('transform', function(d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });
  }







  // update graph (called when needed)
  function restart() {
    // runHITS();
    // console.log("yyyy");
    // path (link) group

    path = path.data(links);

    // update existing links
    path.classed('selected', function(d) { return d === selected_link; })
      .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; });


    // add new links
    path.enter().append('svg:path')
      .attr('class', 'link')
      .classed('selected', function(d) { return d === selected_link; })
      .style('marker-start', function(d) { return d.left ? 'url(#start-arrow)' : ''; })
      .style('marker-end', function(d) { return d.right ? 'url(#end-arrow)' : ''; })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey) return;

        // select link
        mousedown_link = d;
        if(mousedown_link === selected_link) selected_link = null;
        else selected_link = mousedown_link;
        selected_node = null;
        restart();
      });

    // remove old links
    path.exit().remove();

   
    // circle (node) group
    // NB: the function arg is crucial here! nodes are known by id, not by index!
    circle = circle.data(nodes, function(d) {return d.id; });

 // console.log(nodes);
    // update existing nodes (reflexive & selected visual states)
    circle.selectAll('circle')
    .transition().duration(500)
      .attr('r', function(d) {
        if (d.hub==1) return genericRadius;
        else return genericRadius + hubtransform(Number(d.hub));})
      .style('fill', function(d) {
        // console.log(d.authority);
        // console.log(sqrtmap_g(d.authority));
        // console.log("rgb(0," + Math.round(sqrtmap_g(d.authority)) + "," + Math.round(sqrtmap_b(d.authority)) + ")");
        if (d.authority==1) return 'white'
        else return "rgb("+ Math.round(sqrtmap_b(d.authority)) +", " + Math.round(sqrtmap_b(d.authority)) + "," + '255' + ")"})
      // .classed('reflexive', function(d) { return d.reflexive; });
    
    // console.log(nodes);
    // add new nodes
    var g = circle.enter().append('svg:g'); 

    g.append('svg:circle')
      .attr('class', 'node')
      .attr('r', genericRadius)
      // .attr("fill", function(d) {
        // console.log("rgb(0, " + Math.round(sqrtmap_g(d.authority)) + "," + Math.round(sqrtmap_b(d.authority)) + ")");
        // return "rgb(0, " + Math.round(sqrtmap_g(d.authority)) + "," + Math.round(sqrtmap_b(d.authority)) + ")" })
      .style('fill', 'white')
      .style('stroke', 'black')
      .classed('reflexive', function(d) { return d.reflexive; })
      .on('mouseover', function(d) {
        if(!mousedown_node || d === mousedown_node) return;
        // enlarge target node
        d3.select(this).attr('transform', 'scale(1.1)');
      })
      .on('mouseout', function(d) {
        if(!mousedown_node || d === mousedown_node) return;
        // unenlarge target node
        d3.select(this).attr('transform', '');
      })
      .on('mousedown', function(d) {
        if(d3.event.ctrlKey || isExploringConvergence) return;
        // console.log("test");
        // select node
        mousedown_node = d;
        if(mousedown_node === selected_node) selected_node = null;
        else selected_node = mousedown_node;
        selected_link = null;

        // reposition drag line
        drag_line
          .style('marker-end', 'url(#end-arrow)')
          .classed('hidden', false)
          .attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + mousedown_node.x + ',' + mousedown_node.y);

        restart();
      })
      .on('mouseup', function(d) {
        if(!mousedown_node || isExploringConvergence) return;

        // needed by FF
        drag_line
          .classed('hidden', true)
          .style('marker-end', '');

        // check for drag-to-self
        mouseup_node = d;
        if(mouseup_node === mousedown_node) { resetMouseVars(); return; }

        // unenlarge target node
        d3.select(this).attr('transform', '');

        // add link to graph (update if exists)
        // NB: links are strictly source < target; arrows separately specified by booleans
        var source, target, direction;
        source = mousedown_node;
        target = mouseup_node;
        direction = 'right';
        // if(mousedown_node.id < mouseup_node.id) {
        //   source = mousedown_node;
        //   target = mouseup_node;
        //   direction = 'right';
        // } else {
        //   source = mouseup_node;
        //   target = mousedown_node;
        //   direction = 'left';
        // }

        var link;
        link = links.filter(function(l) {
          return (l.source === source && l.target === target);
        })[0];
        // console.log(link);

        if(link) {
          link[direction] = true;
        } else {
          link = {source: source, target: target, left: false, right: false};
          link[direction] = true;
          links.push(link);
        }

        // console.log(selected_node);
        // console.log(link);
        // links.push(link);
        source.outboundLinks.push(link);
        target.inboundLinks.push(link);
            // thePages[otherPageName].inboundLinks.push(link);
        // select new link
        selected_link = link;
        selected_node = null;
        restart();
      })
      .on("mouseover", function(d){return tooltip.style("visibility", "visible").html("ID: <b>" + d.id + "</b><br>Hub: " + fixed(d.hub)  + "<br>Authority: " + fixed(d.authority));})
      .on("mousemove", function(){return tooltip.style("top", (event.pageY-10)+"px").style("left",(event.pageX+10)+"px");})
      .on("mouseout", function(){return tooltip.style("visibility", "hidden");});

    // show node IDs
    g.append('svg:text')
        .attr('x', 0)
        .attr('y', 4)
        .attr('class', 'id')
        .text(function(d) { return d.id; });

    // remove old nodes
    circle.exit().remove();

    // set the graph in motion
    force.start();
  }

  function mousedown() {
    // prevent I-bar on drag
    //d3.event.preventDefault();
    
    // because :active only works in WebKit?
    // svg.classed('active', true);
    // console.log("nousegodw");
    if(d3.event.ctrlKey || mousedown_node || mousedown_link || isExploringConvergence) return;

    // insert new node at point
    var point = d3.mouse(this),
        // node = {id: ++lastNodeId, reflexive: false};

        node = getNewPage(getPageName(currentNumberPages));
        currentNumberPages++;
        // console.log("nousegodw");
    node.x = point[0]+100;
    node.y = point[1];
    nodes.push(node);
    // console.log(currentindex);
    // console.log(nodes);
    restart();
  }

  function mousemove() {
    

     if(isExploringConvergence) return;
     if(!mousedown_node) return;
    // update drag line
    drag_line.attr('d', 'M' + mousedown_node.x + ',' + mousedown_node.y + 'L' + d3.mouse(this)[0] + ',' + d3.mouse(this)[1]);
    // console.log("drag");
    restart();
  }

  function mouseup() {
    if(isExploringConvergence) return;
    
    if(mousedown_node) {
      // hide drag line
      console.log("drag1");
      drag_line
        .classed('hidden', true)
        .style('marker-end', '');
    }

    // because :active only works in WebKit?
    svg.classed('active', false);

    // clear mouse event vars
    resetMouseVars();
  }

  function spliceLinksForNode(node) {
    var toSplice = links.filter(function(l) {
      return (l.source === node || l.target === node);
    });
    toSplice.map(function(l) {
      links.splice(links.indexOf(l), 1);
    });
  }

  // only respond once per keydown
  var lastKeyDown = -1;

  function keydown() {
    d3.event.preventDefault();

    if(lastKeyDown !== -1) return;
    lastKeyDown = d3.event.keyCode;

    // ctrl
    if(d3.event.keyCode === 17) {
      circle.call(force.drag);
      svg.classed('ctrl', true);
    }

    if(!selected_node && !selected_link) return;
    switch(d3.event.keyCode) {
      case 8: // backspace
      case 46: // delete
        if(selected_node) {
          nodes.splice(nodes.indexOf(selected_node), 1);
          spliceLinksForNode(selected_node);
        } else if(selected_link) {
          links.splice(links.indexOf(selected_link), 1);
        }
        selected_link = null;
        selected_node = null;
        restart();
        break;
      case 66: // B
        if(selected_link) {
          // set link direction to both left and right
          selected_link.left = true;
          selected_link.right = true;
        }
        restart();
        break;
      case 76: // L
        if(selected_link) {
          // set link direction to left only
          selected_link.left = true;
          selected_link.right = false;
        }
        restart();
        break;
      case 82: // R
        if(selected_node) {
          // toggle node reflexivity
          selected_node.reflexive = !selected_node.reflexive;
        } else if(selected_link) {
          // set link direction to right only
          selected_link.left = false;
          selected_link.right = true;
        }
        restart();
        break;
    }
  }

  isExploringConvergence = false;

  var showHideConvergenceDiv = function(bShow, recalculate) {
  
      // if (isUndefined(recalculate)) {
      //   recalculate = true; 
      // }
      var theDiv = $('#slider');
      var theButton = $('#exploreConvergenceButton');
      
      

      if (!bShow) {
        theDiv.fadeOut(); // bar disappear
        theButton.attr('value',"Explore Convergence");
     
      isExploringConvergence = false;
      getHubAutByIterNum(0);
      restart();
    }
    else {
    runHITS();
    // genericRadius + hubtransform(Number(d.hub))

     $('#slider').slider('option', 'value', 0);
      theDiv.fadeIn();

      theButton.attr('value','Hide Convergence'); // stop edit

      // theButton.width(theWidth);
      isExploringConvergence = true;

    }
  
  } 

  function keyup() {
    lastKeyDown = -1;

    // ctrl
    if(d3.event.keyCode === 17) {
      circle
        .on('mousedown.drag', null)
        .on('touchstart.drag', null);
      svg.classed('ctrl', false);
    }
  }

  // app starts here
  svg.on('mousedown', mousedown)
    .on('mousemove', mousemove)
    .on('mouseup', mouseup)
    .on('keydown', keydown)
    .on('keyup', keyup);

  $('body').on("click",'#exploreConvergenceButton',function() {showHideConvergenceDiv(!isExploringConvergence);}); // initial mode: edit and not showing bar
  // $('body').on("click",'#btnGenerateNew', generateNew()); // initial mode: edit and not showing bar
  // $('body').on("click",'#btnGenerateNew', console.log(document.getElementById('numNodes').value));

  runHITS();
  getHubAutByIterNum(0);
  restart();
