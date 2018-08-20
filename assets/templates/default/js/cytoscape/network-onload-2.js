layoutRunning = true;

function buildCY( ) {
	
	// Setup defaults for Alertify Plugin
	//alertify.defaults.maintainFocus = false;
	//alertify.defaults.theme.ok = "ui black button";
	
	// Fetch a set of configured graph layouts
	layouts = setupLayouts( );
	
	//console.log($('#network-data').html( ));
	$('#cy').cytoscape({
		container : document.getElementById('cy'),
		style: cytoscape.stylesheet( )
			.selector('node').css({
				'background-color' : '#16a',
				'text-valign': 'center',
				'color': '#FFF',
				'text-outline-width': 3,
				'text-outline-color': '#16a',
				'font-family' : 'helvetica',
                'content': 'data(tag)',
                'text-halign': 'right'
			})
			.selector("node[label='OMIM']").css({
				'background-color' : '#7b3b3b',
				'text-outline-color' : '#7b3b3b',
				'color' : '#FFF',
				'width' : '70',
				'height' : '70',
			})
			.selector("node[label='Normal']").css({
				'background-color' : '#fc3',
				'text-outline-color' : '#fc3',
				'color' : '#000',
				'width' : 'mapData(score, 0, 9, 10, 60)',
				'height' : 'mapData(score, 0, 9, 10, 60)',
			})
			.selector("node[label='Parents']").css({
				'background-color' : '#093',
				'text-outline-color' : '#093',
				'color' : '#FFF',
				'width' : 'mapData(score, 0, 9, 10, 60)',
				'height' : 'mapData(score, 0, 9, 10, 60)',
			})
			.selector("node[id='HP:0000001']").css({
				'background-color' : 'black',
				'text-outline-color' : '#fc3',
				'color' : '#000',
				'width' : '20',
				'height' : '20',
			})
			.selector("node[label='Hit']").css({
				'background-color' : '#093',
				'shape' : 'star',
				'text-outline-color' : '#093',
				'color' : '#FFF',
				'width' : 'mapData(score, 0, 9, 10, 60)',
				'height' : 'mapData(score, 0, 9, 10, 60)',
			})
			.selector('edge').css({
				"curve-style" : "bezier",
				'target-arrow-shape' : 'triangle',
				'haystack-radius' : '0.5',
				'width' : 'mapData(overall_score, 3, 30, 1, 7)',
				'opacity' : 0.75
			})
			.selector("edge[genetic_score > 0]").css({
				'line-color': '#093'
			})
			.selector("edge[physical_score > 0]").css({
				'line-color': '#FC0'
			})
			.selector("edge[physical_score > 0][genetic_score > 0]").css({
				'line-color': '#818'
			})
			.selector("edge[system_type = 'chemical']").css({
				'line-color': '#06F'
			})
			.selector("node:selected").css({
				'background-color' : '#2ca',
				'text-outline-color' : '#2ca',
				'color' : '#fff'
			})
			.selector('.faded').css({
				'opacity': 0,
				'text-opacity': 0
			}),

		elements: $.parseJSON($('#network-data').html( )),

		layout: layouts.cola,
		boxSelectionEnabled: true,
		panningEnabled: true,
		userZoomingEnabled: true,
		motionBlur: false,
		maxZoom: 2,

		// on graph initial layout done (could be async depending on layout...)
		ready: function( ){ window.cy = this;		
			
			$( '#zoomText' ).html( " " + (cy.zoom() * 100).toFixed(2) + "%" );
			//initializeEvidenceOptions( this );
			//updateEvidenceSelect( this );
			
			// Show Experimental Systems
			// When clicking an Edge
			cy.on('tap', 'edge', function( e ) {
				
				/*var edge = e.cyTarget;
				
				var edgeData = edge.data( );
				var title = "Association Details";
				
				if( edgeData.system_type == "chemical" ) {
					
					var gID = edgeData.source;
					var cID = edgeData.target;
					
					sourceInfo = edge.source( );
					
					$.ajax ({
						url: 'http://' + location.host + '/scripts/displayNetworkChemicalEdgeAnnotation.php',
						type: 'POST',
						data: { geneID: gID, chemicalID: cID, geneName: sourceInfo.data( ).name },
						dataType: 'text',
						success: function( msg ) {
							
							msgSplit = msg.split( "$$$" );
							
							alertify.alert( ).setting({
								transition: 'zoom',
								title: title + " (" + msgSplit[0] + ")",
								label: 'close',
								message: msgSplit[1]
							}).show( );
							
						}
					});
					
				} else {
					
					var connectedNodes = edge.connectedNodes( );
					
					var nodeSet = [];
					connectedNodes.forEach( function( node ) {
						nodeSet.push( node.data( ).name );
					});
					
					if( nodeSet.length > 0 ) {
						title = title + " (" + nodeSet.join( " - " ) + ")";
					}
					
					var intIDs = edgeData.int_ids;
					var pScore = edgeData.physical_score;
					var gScore = edgeData.genetic_score;
					
					$.ajax ({
						url: 'http://' + location.host + '/scripts/displayNetworkEdgeAnnotation.php',
						type: 'POST',
						data: { interactionIDs: intIDs.join("|"), physicalScore: pScore, geneticScore: gScore },
						dataType: 'text',
						success: function( msg ) {
							
							alertify.alert( ).setting({
								transition: 'zoom',
								title: title,
								label: 'close',
								message: msg
							}).show( );
							
						}
					});
				} 
				*/
				
			});

			// Remove any Faded Edges when you click on the main
			// Canvas
			cy.on('tap', function(e){
				if( e.cyTarget === cy ){
					cy.elements( ).removeClass( 'faded' );
				}
			});

			cy.nodes("[label='Normal']"|"[label='Hit']").forEach( function(n) {
				var g = n.data('id');
				var score = n.data('score');
				var name = n.data('name');
				n.qtip({
					show : {
						event : 'mouseover'
					},
					hide : {
						event : 'mouseout'
					},
					content : {
						text : name,
						title : '<a href="http://compbio.charite.de/hpoweb/showterm?id=' + g + '" target="_blank">' + g + '</a>'
					},
					position : {
						my : 'bottom left',
						at : 'center'
					},
					style : {
						classes : 'qtip-bootstrap',
						tip : {
							width : 16,
							height : 50
						}
					}
				});
			});

			cy.nodes("[label='OMIM']").forEach( function(n) {
				var g = n.data('id');

				var name = n.data('name');
				n.qtip({
					show : {
						event : 'mouseover',
					},
					hide : {
						event : 'mouseout'
					},
					content : {
						text : name,
						title : '<a href="http://www.omim.org/entry/' + g + '" target="_blank">OMIM:' + g + '</a>'
					},
					position : {
						my : 'bottom left',
						at : 'bottom left'
					},
					style : {
						classes : 'qtip-bootstrap',
						tip : {
							width : 16,
							height : 50
						},
						
					}
				});
			});
			
			cy.on('zoom', function(){
				$( '#zoomText' ).html( " " + (cy.zoom() * 100).toFixed(2) + "%" );
			});
			
		},
		
	});
	
	var cy = $('#cy').cytoscape( 'get' );
	
	//cy.activeFilters = { };
	//cy.minEvidence = $('#evidenceSelect').val( );
	
/*	cy.applyFilters = function( ) {
		
		var elements = cy.elements( );
		
		console.log( cy.activeFilters );
		
		var filterSet = [];
		for( var filterType in cy.activeFilters ) {
			filterSet.push( cy.activeFilters[filterType] );
		}
		
		if( filterSet.length > 0 ) {
			
			elementsToHide = elements.filter( filterSet.join( "," ));
			elementsToShow = elements.not( elementsToHide );
			
			elementsToHide.hide( );
			elementsToShow.show( );
		
		} else {
			elements.show( );
		}
		
		hideZeroScoreMixedEdges( cy );
		checkOrphanNodes( cy );
		cy.style( ).update( );
		
	}
	
	cy.addFilter = function( filter ) {
		
		cy.activeFilters[filter] = fetchFilterSelector( filter, cy, true );
		updateMixedEdges( cy );
		
		if( filter != "evidence" ) {
			updateEvidenceFilter( cy );
		}
		
		cy.applyFilters( );
		
		if( filter != "evidence" ) {
			updateEvidenceSelect( cy );
		} 
		
	}
	
	cy.removeFilter = function( filter ) {
		
		delete cy.activeFilters[filter];
		updateMixedEdges( cy );
		
		if( filter != "evidence" ) {
			updateEvidenceFilter( cy );
		}
		
		cy.applyFilters( );
		
		if( filter != "evidence" ) {
			updateEvidenceSelect( cy );
		} 
		
	}*/
	// Initialize menu items that launch
	// on events
	initializeNetworkExports( cy );
	//initializeNetworkFilters( cy );
	initializeNetworkZoom( cy );
	initializeNetworkDialogs( cy );
	//initializeEvidenceSelect( cy );

	initializeNetworkLayouts( cy, layouts );
	
	// Setup the right click context
	// menu for nodes
	setupContextMenu( cy );

	// Setup the Panzoom Tool
	setupPanzoom( cy );
}

function initializeNetworkLayouts( graph, layouts ) {
	
	$(".networkLayout").on( "click", function( ) {
		
		if( !layoutRunning ) { 
	
			var layoutType = $(this).attr("data-layout");
			
			if( layoutType in layouts ) {
				layoutRunning = true;
				graph.elements( ":visible" ).layout( layouts[layoutType] );
			}
		
		}
		
	});
	
}

function initializeEvidenceSelect( graph ) {
	
	$('#evidenceSelectWrap').on( "change", 'select', function( ) {
		graph.addFilter( "evidence" );
	});
}

function initializeNetworkExports( graph ) {
	
	$(".networkExport").on( "click", function( ) {
		
		var filterType = $(this).attr( "data-export" );
		
		if( filterType == "png" ) {
			var pngImage = graph.png( {full: true, scale: 2 } );
			$("#networkImage").val( pngImage );
			$("#networkImageForm").submit( );
		}
		
	});
	
}

function initializeNetworkFilters( graph ) {
	
	$(".networkFilter").on( "click", function( ) {
		var filterStatus = $(this).attr("data-status");
		var filterText = $(this).html( );
		var filterType = $(this).attr("data-filter");
		
		if( filterStatus == "off" ) {
			filterStatus = "on";
			filterText = filterText.replace( "Hide", "Show" );
			filterText = filterText.replace( "fa-minus", "fa-plus" );
			graph.addFilter( filterType );
		} else {
			filterStatus = "off";
			filterText = filterText.replace( "Show", "Hide" );
			filterText = filterText.replace( "fa-plus", "fa-minus" );
			graph.removeFilter( filterType );
		}
		
		$(this).attr("data-status", filterStatus);
		$(this).html(filterText);
		
	});
	
}

function initializeNetworkZoom( graph ) {
	
	$(".zoomFilter").on( "click", function( ) {
		
		var zoomLevel = $(this).attr( "zoom-level" );
		
		if( zoomLevel == "optimal" ) {
			graph.fit( 50 );
		} else {
		
			// need to adjust the maxZoom to prevent JUMBO nodes on the 
			// initial draw. The maxZoom is set to 1 when the graph is first drawn
			//graph.maxZoom( parseFloat(zoomLevel) );
			
			graph.zoom( parseFloat(zoomLevel) );
			graph.center( );
		
		}
		
	});
	
}

function initializeNetworkDialogs( graph ) {
	
	$(".showDialog").on( "click", function( ) {
		
		var dialogType = $(this).attr("data-dialog");
		
		if( dialogType == "legend" || dialogType == "usability" ) {
			
			var title = "Legend";
			if( dialogType == "usability" ) {
				title = "Usability Tips";
			}
			
			alertify.defaults.maintainFocus = false;
			alertify.defaults.theme.ok = "ui black button";
			
			$.ajax ({
				url: 'http://' + location.host + '/scripts/fetchDialogText.php',
				type: 'POST',
				data: { type: dialogType },
				dataType: 'text',
				success: function( msg ) {
					alertify.alert( ).setting({
						transition: 'zoom',
						title: title,
						label: 'close',
						message: msg
					}).show( );
				}
			});
			
		}
		
	});
	
}

function fetchFilterSelector( filter, graph, fetchEvidence ) {
	
	if( filter == "physical" ) {
		return "edge[system_type = 'physical']";
	} else if( filter == "genetic" ) {
		return "edge[system_type = 'genetic']";
	} else if( filter == "chemical" ) {
		return "edge[system_type = 'chemical']";
	} else if( filter == "evidence" ) {
		
		if( fetchEvidence === true ) {
			graph.minEvidence = $('#evidenceSelect').val( );
		} 
		
		if( graph.minEvidence === undefined ) {
			graph.minEvidence = 1;
		}
	
		if( "physical" in graph.activeFilters && "genetic" in graph.activeFilters && "chemical" in graph.activeFilters ) {
			return 'edge[overall_score < ' + graph.minEvidence + ']';
		} else if( "physical" in graph.activeFilters && "genetic" in graph.activeFilters ) {
			return "edge[chemical_score < " + graph.minEvidence + "]";
		} else if( "physical" in graph.activeFilters && "chemical" in graph.activeFilters ) {
			return "edge[genetic_score < " + graph.minEvidence + "]";
		} else if( "genetic" in graph.activeFilters && "chemical" in graph.activeFilters ) {
			return "edge[physical_score < " + graph.minEvidence + "]";
		} else if( "physical" in graph.activeFilters ) {
			return "edge[genetic_score < " + graph.minEvidence + "][chemical_score < " + graph.minEvidence + "]"
		} else if( "genetic" in graph.activeFilters ) {
			return "edge[physical_score < " + graph.minEvidence + "][chemical_score < " + graph.minEvidence + "]"
		} else if( "chemical" in graph.activeFilters ) {
			return "edge[overall_score < " + graph.minEvidence + "]";
		} else {
			return 'edge[overall_score < ' + graph.minEvidence + ']';
		}
		
	}
	
}

function checkOrphanNodes( graph ) {
	
	var nodes = graph.nodes( );
	
	nodes.forEach( function( node ) {
		connectedEdges = node.connectedEdges( "edge:visible" );
		node.data( ).edge_count = connectedEdges.length;
	});
	
	graph.elements( 'node[edge_count <= 0]:visible' ).hide( );
	graph.elements( 'node[edge_count > 0]:hidden' ).show( );
	
}

function initializeEvidenceOptions( graph ) {
	
	var edgeEvidence = {"physical" : [], "genetic" : [], "overall" : [], "chemical" : [], "physical_genetic" : [], "physical_chemical" : [], "genetic_chemical" : [] };
	
	edges = graph.edges( );
	edges.forEach( function( edge ) {
		edgeData = edge.data( );
		if( edgeData.system_type == "physical" ) {
			edgeEvidence.physical[edgeData.system_types.physical] = edgeData.system_types.physical;
			edgeEvidence.physical_genetic[edgeData.system_types.physical] = edgeData.system_types.physical;
			edgeEvidence.physical_chemical[edgeData.system_types.physical] = edgeData.system_types.physical;
		} else if( edgeData.system_type == "genetic" ) {
			edgeEvidence.genetic[edgeData.system_types.genetic] = edgeData.system_types.genetic;
			edgeEvidence.physical_genetic[edgeData.system_types.genetic] = edgeData.system_types.genetic;
			edgeEvidence.genetic_chemical[edgeData.system_types.genetic] = edgeData.system_types.genetic;
		} else if( edgeData.system_type == "mixed" ) {
			edgeEvidence.physical[edgeData.system_types.physical] = edgeData.system_types.physical;
			edgeEvidence.genetic[edgeData.system_types.genetic] = edgeData.system_types.genetic;
			edgeEvidence.physical_genetic[edgeData.system_types.genetic] = edgeData.system_types.genetic;
			edgeEvidence.physical_genetic[edgeData.system_types.physical] = edgeData.system_types.physical;
			edgeEvidence.genetic_chemical[edgeData.system_types.genetic] = edgeData.system_types.genetic;
			edgeEvidence.physical_chemical[edgeData.system_types.physical] = edgeData.system_types.physical;
		} else if( edgeData.system_type == "chemical" ) {
			edgeEvidence.chemical[edgeData.system_types.chemical] = edgeData.system_types.chemical;
			edgeEvidence.genetic_chemical[edgeData.system_types.chemical] = edgeData.system_types.chemical;
			edgeEvidence.physical_chemical[edgeData.system_types.chemical] = edgeData.system_types.chemical;
		}
		
		//edgeEvidence.overall[edgeData.system_types.physical + edgeData.system_types.genetic + edgeData.system_types.chemical] = edgeData.system_types.physical + edgeData.system_types.genetic + edgeData.system_types.chemical;	
		
	});
	
	graph.edgeEvidence = edgeEvidence;
	
}

function fetchActiveEvidenceSet( graph ) {
	
	if( "physical" in graph.activeFilters && "genetic" in graph.activeFilters && "chemical" in graph.activeFilters ) {
		return { };
	} else if( "physical" in graph.activeFilters && "genetic" in graph.activeFilters ) {
		return graph.edgeEvidence.chemical;
	} else if( "physical" in graph.activeFilters && "chemical" in graph.activeFilters ) {
		return graph.edgeEvidence.genetic;
	} else if( "chemical" in graph.activeFilters && "genetic" in graph.activeFilters ) {
		return graph.edgeEvidence.physical;
	} else if( "physical" in graph.activeFilters ) {
		return graph.edgeEvidence.genetic_chemical;
	} else if( "genetic" in graph.activeFilters ) {
		return graph.edgeEvidence.physical_chemical;
	} else if( "chemical" in graph.activeFilters ) {
		return graph.edgeEvidence.physical_genetic;
	}
	
	return graph.edgeEvidence.overall;
	
}

function updateEvidenceFilter( graph ) {
	
	evidence = fetchActiveEvidenceSet( graph );
	graph.minEvidence = closestEvidence( graph.minEvidence, Object.keys(evidence) );
	
	if( "evidence" in graph.activeFilters ) {
		graph.activeFilters["evidence"] = fetchFilterSelector( "evidence", graph, false );
	}
	
}

function updateEvidenceSelect( graph ) {
	
	$('#evidenceSelectWrap').html( '<i class="fa fa-spinner fa-lg fa-pulse"></i>' );
	
	evidence = fetchActiveEvidenceSet( graph );
	
	var options = Object.keys(evidence);
	var optionsFormatted = [];
	
	if( options.length > 0 ) {
		$('#evidenceSelectWrap').html( "<select id='evidenceSelect'></select>" );
		options.forEach( function( option ) {
			if( option == graph.minEvidence ) {
				$('#evidenceSelect').append( $('<option>').text( option ).attr( 'value', option ).attr( 'selected', 'selected' ) );
			} else {
				$('#evidenceSelect').append( $('<option>').text( option ).attr( 'value', option ) );
			}
		});
	} else {
		$('#evidenceSelectWrap').html( "<i class='fa fa-lg fa-ban'></i>" );
	}

}

function updateMixedEdges( graph ) {
	
	var edges = graph.edges( "edge[system_type = 'mixed']" );
	
	edges.forEach( function( edge ) {
		edgeData = edge.data( ); 
		
		if( "physical" in graph.activeFilters && "genetic" in graph.activeFilters ) {
			edgeData.physical_score = 0;
			edgeData.genetic_score = 0;
		} else if( "physical" in graph.activeFilters ) {
			edgeData.physical_score = 0;
			edgeData.genetic_score = edgeData.system_types.genetic;	
		} else if( "genetic" in graph.activeFilters ) {
			edgeData.physical_score = edgeData.system_types.physical;
			edgeData.genetic_score = 0;
		} else {
			edgeData.physical_score = edgeData.system_types.physical;
			edgeData.genetic_score = edgeData.system_types.genetic;
		}
		
		edgeData.overall_score = edgeData.physical_score + edgeData.genetic_score;
		
	});
	
}

function hideZeroScoreMixedEdges( graph ) {
	
	var edges = graph.edges( "edge[system_type='mixed'][overall_score=0]" )
	edges.hide( );

}

function setupContextMenu( graph ) {
	
	var ctxMenuDefaults = {
		menuRadius: 100, 
		fillColor: 'rgba(0, 0, 0, 0.50)', 
		activeFillColor: 'rgba(123, 59, 59, 1)', 
		activePadding: 1, 
		indicatorSize: 2, 
		separatorWidth: 3, 
		spotlightPadding: 4, 
		minSpotlightRadius: 24, 
		maxSpotlightRadius: 38, 
		itemColor: 'white', 
		itemTextShadowColor: 'black', 
		zIndex: 9999,
	};
	
	var showNeighbors = { 
		content: 'Show Neighbors', 
		select: function( ) { 
			var neighborhood = this.neighborhood( ).add( this );
			graph.elements( ).addClass( 'faded' );
			neighborhood.removeClass( 'faded' ); 
		}
	};
	
	/*var displayGeneNetwork = { 
		content: 'Display Network', 
		select: function( ) { 
			nodeData = this.data( );
			if( nodeData.link != null && nodeData.link != "" ) {
				if( nodeData.node_type != "spotlight" ) {
					destURL = 'http://' + location.host + '/' + nodeData.link;
					window.location.href = destURL;
				}
			}
		}
	};*/
	
/*	var displayChem = { 
		content: 'Display Chemical', 
		select: function( ) { 
			nodeData = this.data( );
			if( nodeData.link != null && nodeData.link != "" ) {
				if( nodeData.node_type != "spotlight" ) {
					destURL = 'http://' + nodeData.link;
					window.open( destURL, "_BLANK" );
				}
			}
		}
	};*/
	
/*	var nodeDetails = { 
		content: 'Node Details', 
		select: function( ) {

			var idInfo = this.data( ).id;
			var entityType = this.data( ).entity;
			
			var annotationURL = 'http://' + location.host + '/scripts/displayNetworkNodeAnnotation.php';
			if( entityType == "chemical" ) {
				var annotationURL = 'http://' + location.host + '/scripts/displayNetworkChemicalAnnotation.php';
			}
			
			$.ajax ({
				url: annotationURL,
				type: 'POST',
				data: { id: idInfo },
				dataType: 'text',
				success: function( msg ) {
					
					msgDetails = msg.split( "|" );
					
					alertify.alert( ).setting({
						transition: 'zoom',
						title: msgDetails[0],
						label: 'close',
						message: msgDetails[1]
					}).show( );
				}
			});
			
		}
	};*/
	
	var removeNode = { 
		content: 'Remove Node', 
		select: function(){ 
			cy.remove( this );
			checkOrphanNodes( cy );
		}
	};
	
	var geneMenu = ctxMenuDefaults;
	geneMenu.selector =  "node[label='OMIM']";
	geneMenu.commands = [showNeighbors, removeNode];
	graph.cxtmenu( geneMenu ); 
	
	var chemicalMenu = ctxMenuDefaults;
	chemicalMenu.selector = "node[label='Normal']";
	chemicalMenu.commands = [showNeighbors, removeNode];
	graph.cxtmenu( chemicalMenu );

	var hitMenu = ctxMenuDefaults;
	hitMenu.selector = "node[label='Hit']";
	hitMenu.commands = [showNeighbors, removeNode];
	graph.cxtmenu( hitMenu );
	
}

function setupPanzoom( graph ) {
	
	var panzoomDefaults = {
		minZoom: 0.25,
		maxZoom: 2,
		panSpeed: 5
	};
	
	graph.panzoom( panzoomDefaults );
}

function setupLayouts( ) {
	
	var minNodeSpacing = 10;
	var nodeCount = $("#network-nodes").html( );
	
	if( nodeCount <= 25 ) {
		minNodeSpacing = 40;
	} 
	
	var layouts = { 
	
		"arbor" : {
			 'name': 'arbor',
			 'liveUpdate': true,
			 'maxSimulationTime': 400,
			 'ungrabifyWhileSimulating': true,
			 'padding' : 50,
			 'directed': true,
			 'nodeMass' : function(data) {
				 if(data.node_type == 'spotlight') {
					 return data.weight + 30;
				 } else {
					 return data.weight;
				 }
			 },
			 'stop' : function( ) {
				 layoutRunning = false;
			 }
		 },
		 
		 "concentric" : {
			name: 'concentric',
			concentric: function( ) {
				return this.data( 'concentric_score' );
				if( this.data.node_type == 'spotlight' ) {
					return this.data( 'edge_count' ) + 50;
				} else {
					return this.data( 'edge_count' ); 
				}
			},
			levelWidth: function( nodes ){ return 1; },
			padding: 50,
			minNodeSpacing: minNodeSpacing,
			'stop' : function( ) {
				layoutRunning = false;
			}
		},
		
		"grid" : {
			name: 'grid',
			padding: 30,
			'stop' : function( ) {
				layoutRunning = false;
			}
		}, 
		
		"random" : {
			name: 'random',
			padding: 30,
			'stop' : function( ) {
				layoutRunning = false;
			}
		},
		
		"circle" : {
			name: 'circle',
			padding: 30,
			'stop' : function( ) {
				layoutRunning = false;
			}
		},

		"cola" : {
			name: 'cola',
			padding: 30,
			'stop' : function( ) {
				layoutRunning = false;
			}
		}
			
		
	}
	
	return layouts;
	
}

function closestEvidence( num, arr ) {
	
	var curr = arr[0];
	var diff = Math.abs( num - curr );
	
	for( var val = 0; val < arr.length; val++ ) {
		var newdiff = Math.abs( num - arr[val] );
		if( newdiff < diff ) {
			diff = newdiff;
			curr = arr[val];
		}
	}
	
	return curr;
	
}