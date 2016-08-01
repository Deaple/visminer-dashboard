homeApp = angular.module('homeApp');

homeApp.controller('CSgraphsCtrl', function($scope, $http, sidebarService,typeSmellsDetailsService){
	
	var removeRepeated = function(pack){
		return Array.from(new Set(pack));
	}
	
	thisCtrl = this;
	sidebarService.setCurrentPage("csgraphs");
	
	//JSON that filters html user's choice in section/option
	$scope.filtered = {
			repository: null,
			selTagId: null,
			selCSId: null,
			codeSmells: [
	             {id:'0',name:'God Class'}, 
	             {id:'1',name:'Long Method'}, 
	             {id:'2',name:'Brain Class'},
	             {id:'3',name:'Brain Method'},
	             {id:'4',name:'Complex Method'}
	             ],
			tags: [],
			affectedOnly:false
	};
	
	//JSON to format God Class in d3.js pattern
	$scope.godClass = {
			name: null,
			children: []};
	
	$scope.longMethod = {
			name: null,
			children: []};
	
	$scope.brainClass = {
			name: null,
			children: []};
	
	$scope.brainMethod = {
			name: null,
			children: []};
	
	$scope.complexMethod = {
			name: null,
			children: []};
	
	
	$scope.filtered.repository = sidebarService.getRepository();
	
	
	
	thisCtrl.tagsLoad = function(repositoryId) { 
		console.log('tagsLoad=', repositoryId);

		$http.get('TreeServlet', {params:{"action": "getAllTagsAndMaster", "repositoryId": repositoryId}})
		.success(function(data) {
			console.log('found', data.length, 'tags');
			$scope.filtered.tags = data;
		});
	}
	
	
	if($scope.filtered.repository!=null){
		thisCtrl.tagsLoad($scope.filtered.repository._id);
	}
	
	thisCtrl.getGodClass = function(tagId,codeSmell){
		console.log('Tag ID:',tagId,' Code Smell ID',codeSmell);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTagAndCodeSmell", "tagId": tagId, "codeSmell": codeSmell}})
		.success(function(data){
			
			console.log('data size: ',data.length);
			var packages = [];
			
			for(var i=0;i<data.length;i++){
				//TODO check if doesn't exist codesmell in server
				if(data[i].abstract_types.length > 0){
					packages.push(data[i].package);
				}
			}
		
			packages=removeRepeated(packages);
			
			$scope.godClass.name = tagId;
			for(var i = 0; i<packages.length;i++){
				$scope.godClass.children[i] = {};
				$scope.godClass.children[i]['name']={};
				$scope.godClass.children[i].name = packages[i];
				$scope.godClass.children[i]['children'] = [];
				var k = 0;
				for(var j=0;j<data.length;j++){
					if($scope.godClass.children[i].name == data[j].package &&
							data[j].abstract_types.length>0){
						/*console.log("class ",j,": ",data[j].abstract_types[0].name,"pac ",i,
								": ",$scope.godClass.packages[i].name);*/
						$scope.godClass.children[i].children[k] = {};
						$scope.godClass.children[i].children[k]['name'] = {};
						$scope.godClass.children[i].children[k]['hasCodeSmell'] = {};
						$scope.godClass.children[i].children[k]['children'] = [{"name":"ATFD", "size":null},
						                                                     {"name":"WMC", "size":null},
						                                                     {"name":"TCC", "size":null},
						                                                     {"name":"NOA", "size":null}];
						
						$scope.godClass.children[i].children[k].name = data[j].abstract_types[0].name;
						
						for(var n=0; n<data[j].abstract_types[0].metrics.length; n++){
							var metric = data[j].abstract_types[0].metrics[n];
							if(metric.name == "ATFD"){
								$scope.godClass.children[i].children[k].children[0].name = "ATFD : "+metric.accumulated;
								$scope.godClass.children[i].children[k].children[0].size = metric.accumulated;
							}else if(metric.name == "WMC"){
								$scope.godClass.children[i].children[k].children[1].name = "WMC : "+metric.accumulated;
								$scope.godClass.children[i].children[k].children[1].size = metric.accumulated; 
							}else if(metric.name == "TCC"){
								$scope.godClass.children[i].children[k].children[2].name = "TCC : "+metric.accumulated;
								$scope.godClass.children[i].children[k].children[2].size = metric.accumulated;
							}else if(metric.name == "NOA"){
								$scope.godClass.children[i].children[k].children[3].name = "NOA : "+metric.accumulated;
								$scope.godClass.children[i].children[k].children[3].size = metric.accumulated;
							}
						}
						
						for(var n=0; n<data[j].abstract_types[0].codesmells.length; n++){
							var codeSmell = data[j].abstract_types[0].codesmells[n];
							if(codeSmell.name == "God Class")
								$scope.godClass.children[i].children[k].hasCodeSmell = codeSmell.value;
						}
						
						k++;
					}
				}
				
				//removing empty packages
				$scope.godClass.children[i].children = $scope.godClass.children[i].children.filter(hasChildren);
				
			}
		
			console.log("PACOTE: ",JSON.stringify($scope.godClass));
			if($scope.godClass.children.length!=0)
				updateChart($scope.godClass);
			else
				alert("No God Classes detected.");
			
		});
	}
	
	thisCtrl.getLongMethod = function(tagId, affectedOnly){
		console.log('Tag ID:',tagId,' Code Smell ID', affectedOnly);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTagAndCodeSmell", "tagId": tagId, "codeSmell": null}})
		.success(function(data){
			
			console.log('data size: ',data.length);
			var packages = [];
			
			for(var i=0;i<data.length;i++){
				if(data[i].abstract_types.length > 0){
					packages.push(data[i].package);
				}
			}
		
			packages=removeRepeated(packages);
			
			$scope.longMethod.name = tagId;
			for(var i = 0; i<packages.length;i++){
				$scope.longMethod.children[i] = {};
				$scope.longMethod.children[i]['name']={};
				$scope.longMethod.children[i].name = packages[i];
				$scope.longMethod.children[i]['children'] = [];
				var k = 0;
				for(var j=0;j<data.length;j++){
					if($scope.longMethod.children[i].name == data[j].package &&
							data[j].abstract_types.length>0){
						/*console.log("class ",j,": ",data[j].abstract_types[0].name,"pac ",i,
								": ",$scope.godClass.packages[i].name);*/
						$scope.longMethod.children[i].children[k] = {};
						$scope.longMethod.children[i].children[k]['name'] = {};
						$scope.longMethod.children[i].children[k]['children'] = [];
						
						$scope.longMethod.children[i].children[k].name = data[j].abstract_types[0].name;
						
						var methodsNames = []
						
						for(var n=0; n<data[j].abstract_types[0].metrics.length; n++){
							var metric = data[j].abstract_types[0].metrics[n];
							if(metric.name == "CC"){
								for(var x=0; x< metric.methods.length; x++){
									methodsNames.push(metric.methods[x].method);
								}
							}
						}
						
						for(var n=0; n<methodsNames.length; n++){
							var methodName = methodsNames[n]
							$scope.longMethod.children[i].children[k].children[n] = {};
							$scope.longMethod.children[i].children[k].children[n]['name'] = methodName;
							$scope.longMethod.children[i].children[k].children[n]['hasCodeSmell'] = {};
							$scope.longMethod.children[i].children[k].children[n]['children'] = [];
							
							for(var x=0; x<data[j].abstract_types[0].metrics.length; x++){
								var metric = data[j].abstract_types[0].metrics[x];
								if(metric.name == "CC"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.longMethod.children[i].children[k].children[n].children.push({"name":"CC : "+method.value, "size":method.value});
									}
								}else if(metric.name == "MLOC"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.longMethod.children[i].children[k].children[n].children.push({"name":"MLOC : "+method.value, "size":method.value});
									}
								}else if(metric.name == "PAR"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.longMethod.children[i].children[k].children[n].children.push({"name":"PAR : "+method.value, "size":method.value});
									}
								}else if(metric.name == "LVAR"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.longMethod.children[i].children[k].children[n].children.push({"name":"LVAR : "+method.value, "size":method.value});
									}
								}
								
							}
							
							for(var x=0; x<data[j].abstract_types[0].codesmells.length; x++){
								var codeSmell = data[j].abstract_types[0].codesmells[x];
								if(codeSmell.name == "Long Method"){
									for(var y = 0; y<codeSmell.methods.length; y++){
										var method = codeSmell.methods[y];
										if(method.method == methodName)
											$scope.longMethod.children[i].children[k].children[n].hasCodeSmell = method.value;
									}	
									
								}
							}
							
						}
						
						
						if(affectedOnly){
							//removing methods not affected by code Smell
							$scope.longMethod.children[i].children[k].children = 
								$scope.longMethod.children[i].children[k].children.filter(hasMethodCodeSmell);
						}
						
						k++;
					}
				}
				
				//removing classes that have no method
				$scope.longMethod.children[i].children = $scope.longMethod.children[i].children.filter(hasChildren);
			}
			
			//removing packages that contain no classes
			$scope.longMethod.children = $scope.longMethod.children.filter(hasChildren);
		
			console.log("PACOTE: ",JSON.stringify($scope.longMethod));
			if($scope.longMethod.children.length!=0)
				updateChart($scope.longMethod);
			else
				alert("No Long Methods detected.");
		});
	}
	
	
	thisCtrl.getBrainClass = function(tagId,codeSmell){
		console.log('Tag ID:',tagId,' Code Smell ID',codeSmell);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTagAndCodeSmell", "tagId": tagId, "codeSmell": codeSmell}})
		.success(function(data){
			
			console.log('data size: ',data.length);
			var packages = [];
			
			for(var i=0;i<data.length;i++){
				if(data[i].abstract_types.length > 0){
					packages.push(data[i].package);
				}
			}
		
			packages=removeRepeated(packages);
			
			$scope.brainClass.name = tagId;
			for(var i = 0; i<packages.length;i++){
				$scope.brainClass.children[i] = {};
				$scope.brainClass.children[i]['name']={};
				$scope.brainClass.children[i].name = packages[i];
				$scope.brainClass.children[i]['children'] = [];
				var k = 0;
				for(var j=0;j<data.length;j++){
					if($scope.brainClass.children[i].name == data[j].package &&
							data[j].abstract_types.length>0){
						/*console.log("class ",j,": ",data[j].abstract_types[0].name,"pac ",i,
								": ",$scope.godClass.packages[i].name);*/
						$scope.brainClass.children[i].children[k] = {};
						$scope.brainClass.children[i].children[k]['name'] = {};
						$scope.brainClass.children[i].children[k]['hasCodeSmell'] = {};
						$scope.brainClass.children[i].children[k]['children'] = [{"name":"WMC", "size":null},
						                                                     {"name":"TCC", "size":null},
						                                                     {"name":"SLOC", "size":null}];
						
						$scope.brainClass.children[i].children[k].name = data[j].abstract_types[0].name;
						
						for(var n=0; n<data[j].abstract_types[0].metrics.length; n++){
							var metric = data[j].abstract_types[0].metrics[n];
							if(metric.name == "WMC"){
								$scope.brainClass.children[i].children[k].children[0].name = "WMC : "+metric.accumulated;
								$scope.brainClass.children[i].children[k].children[0].size = metric.accumulated;
							}else if(metric.name == "TCC"){
								$scope.brainClass.children[i].children[k].children[1].name = "TCC : "+metric.accumulated;
								$scope.brainClass.children[i].children[k].children[1].size = metric.accumulated; 
							}else if(metric.name == "SLOC"){
								$scope.brainClass.children[i].children[k].children[2].name = "SLOC : "+metric.accumulated;
								$scope.brainClass.children[i].children[k].children[2].size = metric.accumulated;
							}
						}
						
						for(var n=0; n<data[j].abstract_types[0].codesmells.length; n++){
							var codeSmell = data[j].abstract_types[0].codesmells[n];
							if(codeSmell.name == "Brain Class")
								$scope.brainClass.children[i].children[k].hasCodeSmell = codeSmell.value;
						}
						
						k++;
					}
				}
				
				//removing empty packages
				$scope.brainClass.children[i].children = $scope.brainClass.children[i].children.filter(hasChildren);
				
			}
		
			console.log("PACOTE: ",JSON.stringify($scope.brainClass));
			if($scope.brainClass.children.length!=0)
				updateChart($scope.brainClass);
			else
				alert("No Brain Classes detected.");
			
		});
	}
	
	thisCtrl.getBrainMethod = function(tagId, affectedOnly){
		console.log('Tag ID:',tagId,' Code Smell ID', affectedOnly);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTagAndCodeSmell", "tagId": tagId, "codeSmell": null}})
		.success(function(data){
			
			console.log('data size: ',data.length);
			var packages = [];
			
			for(var i=0;i<data.length;i++){
				if(data[i].abstract_types.length > 0){
					packages.push(data[i].package);
				}
			}
		
			packages=removeRepeated(packages);
			
			$scope.brainMethod.name = tagId;
			for(var i = 0; i<packages.length;i++){
				$scope.brainMethod.children[i] = {};
				$scope.brainMethod.children[i]['name']={};
				$scope.brainMethod.children[i].name = packages[i];
				$scope.brainMethod.children[i]['children'] = [];
				var k = 0;
				for(var j=0;j<data.length;j++){
					if($scope.brainMethod.children[i].name == data[j].package &&
							data[j].abstract_types.length>0){
						/*console.log("class ",j,": ",data[j].abstract_types[0].name,"pac ",i,
								": ",$scope.godClass.packages[i].name);*/
						$scope.brainMethod.children[i].children[k] = {};
						$scope.brainMethod.children[i].children[k]['name'] = {};
						$scope.brainMethod.children[i].children[k]['children'] = [];
						
						$scope.brainMethod.children[i].children[k].name = data[j].abstract_types[0].name;
						
						var methodsNames = []
						
						for(var n=0; n<data[j].abstract_types[0].metrics.length; n++){
							var metric = data[j].abstract_types[0].metrics[n];
							if(metric.name == "CC"){
								for(var x=0; x< metric.methods.length; x++){
									methodsNames.push(metric.methods[x].method);
								}
							}
						}
						
						for(var n=0; n<methodsNames.length; n++){
							var methodName = methodsNames[n]
							$scope.brainMethod.children[i].children[k].children[n] = {};
							$scope.brainMethod.children[i].children[k].children[n]['name'] = methodName;
							$scope.brainMethod.children[i].children[k].children[n]['hasCodeSmell'] = {};
							$scope.brainMethod.children[i].children[k].children[n]['children'] = [];
							
							for(var x=0; x<data[j].abstract_types[0].metrics.length; x++){
								var metric = data[j].abstract_types[0].metrics[x];
								if(metric.name == "CC"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.brainMethod.children[i].children[k].children[n].children.push({"name":"CC : "+method.value, "size":method.value});
									}
								}else if(metric.name == "MLOC"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.brainMethod.children[i].children[k].children[n].children.push({"name":"MLOC : "+method.value, "size":method.value});
									}
								}else if(metric.name == "MAXNESTING"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.brainMethod.children[i].children[k].children[n].children.push({"name":"MAXNESTING : "+method.value, "size":method.value});
									}
								}else if(metric.name == "NOAV"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.brainMethod.children[i].children[k].children[n].children.push({"name":"NOAV : "+method.value, "size":method.value < 0 ? 0 : method.value});
									}
								}
								
							}
							
							for(var x=0; x<data[j].abstract_types[0].codesmells.length; x++){
								var codeSmell = data[j].abstract_types[0].codesmells[x];
								if(codeSmell.name == "Brain Method"){
									for(var y = 0; y<codeSmell.methods.length; y++){
										var method = codeSmell.methods[y];
										if(method.method == methodName)
											$scope.brainMethod.children[i].children[k].children[n].hasCodeSmell = method.value;
									}	
									
								}
							}
							
						}
						
						
						if(affectedOnly){
							//removing methods not affected by code Smell
							$scope.brainMethod.children[i].children[k].children = 
								$scope.brainMethod.children[i].children[k].children.filter(hasMethodCodeSmell);
						}
						
						k++;
					}
				}
				
				//removing classes that have no method
				$scope.brainMethod.children[i].children = $scope.brainMethod.children[i].children.filter(hasChildren);
			}
			
			//removing packages that contain no classes
			$scope.brainMethod.children = $scope.brainMethod.children.filter(hasChildren);
		
			console.log("PACOTE: ",JSON.stringify($scope.brainMethod));
			if($scope.brainMethod.children.length!=0)
				updateChart($scope.brainMethod);
			else
				alert("No Brain Methods detected.");
		});
	}
	
	thisCtrl.getComplexMethod = function(tagId, affectedOnly){
		console.log('Tag ID:',tagId,' Code Smell ID', affectedOnly);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTagAndCodeSmell", "tagId": tagId, "codeSmell": null}})
		.success(function(data){
			
			console.log('data size: ',data.length);
			var packages = [];
			
			for(var i=0;i<data.length;i++){
				if(data[i].abstract_types.length > 0){
					packages.push(data[i].package);
				}
			}
		
			packages=removeRepeated(packages);
			
			$scope.complexMethod.name = tagId;
			for(var i = 0; i<packages.length;i++){
				$scope.complexMethod.children[i] = {};
				$scope.complexMethod.children[i]['name']={};
				$scope.complexMethod.children[i].name = packages[i];
				$scope.complexMethod.children[i]['children'] = [];
				var k = 0;
				for(var j=0;j<data.length;j++){
					if($scope.complexMethod.children[i].name == data[j].package &&
							data[j].abstract_types.length>0){
						/*console.log("class ",j,": ",data[j].abstract_types[0].name,"pac ",i,
								": ",$scope.godClass.packages[i].name);*/
						$scope.complexMethod.children[i].children[k] = {};
						$scope.complexMethod.children[i].children[k]['name'] = {};
						$scope.complexMethod.children[i].children[k]['children'] = [];
						
						$scope.complexMethod.children[i].children[k].name = data[j].abstract_types[0].name;
						
						var methodsNames = []
						
						for(var n=0; n<data[j].abstract_types[0].metrics.length; n++){
							var metric = data[j].abstract_types[0].metrics[n];
							if(metric.name == "CC"){
								for(var x=0; x< metric.methods.length; x++){
									methodsNames.push(metric.methods[x].method);
								}
							}
						}
						
						for(var n=0; n<methodsNames.length; n++){
							var methodName = methodsNames[n]
							$scope.complexMethod.children[i].children[k].children[n] = {};
							$scope.complexMethod.children[i].children[k].children[n]['name'] = methodName;
							$scope.complexMethod.children[i].children[k].children[n]['hasCodeSmell'] = {};
							$scope.complexMethod.children[i].children[k].children[n]['children'] = [];
							
							for(var x=0; x<data[j].abstract_types[0].metrics.length; x++){
								var metric = data[j].abstract_types[0].metrics[x];
								if(metric.name == "CC"){
									for(var y=0; y<metric.methods.length; y ++){
										var method = metric.methods[y];
										if(method.method == methodName)
											$scope.complexMethod.children[i].children[k].children[n].children.push({"name":"CC : "+method.value, "size":method.value, "hasCodeSmell": false});
									}
								}
							}
							
							for(var x=0; x<data[j].abstract_types[0].codesmells.length; x++){
								var codeSmell = data[j].abstract_types[0].codesmells[x];
								if(codeSmell.name == "Complex Method"){
									for(var y = 0; y<codeSmell.methods.length; y++){
										var method = codeSmell.methods[y];
										if(method.method == methodName){
											$scope.complexMethod.children[i].children[k].children[n].hasCodeSmell = method.value;
											$scope.complexMethod.children[i].children[k].children[n].children[0].hasCodeSmell = method.value;
										}
									}	
									
								}
							}
							
						}
						
						
						if(affectedOnly){
							//removing methods not affected by code Smell
							$scope.complexMethod.children[i].children[k].children = 
								$scope.complexMethod.children[i].children[k].children.filter(hasMethodCodeSmell);
						}
						
						k++;
					}
				}
				
				//removing classes that have no method
				$scope.complexMethod.children[i].children = $scope.complexMethod.children[i].children.filter(hasChildren);
			}
			
			//removing packages that contain no classes
			$scope.complexMethod.children = $scope.complexMethod.children.filter(hasChildren);
		
			console.log("PACOTE: ",JSON.stringify($scope.complexMethod));
			if($scope.complexMethod.children.length!=0)
				updateChart($scope.complexMethod);
			else
				alert("No Complex Methods detected.");
		});
	}
	
	$scope.getCodeSmell = function(){
		if($scope.filtered.selTagId!=null && $scope.filtered.selCSId!=null){
			$("#d3Chart").empty();
			if($scope.filtered.selCSId == 0)
				thisCtrl.getGodClass($scope.filtered.selTagId, $scope.filtered.affectedOnly ? 'God Class' : null);
			else if($scope.filtered.selCSId == 1)
				thisCtrl.getLongMethod($scope.filtered.selTagId, $scope.filtered.affectedOnly);
			else if($scope.filtered.selCSId == 2)
				thisCtrl.getBrainClass($scope.filtered.selTagId, $scope.filtered.affectedOnly ? 'Brain Class' : null);
			else if($scope.filtered.selCSId == 3)
				thisCtrl.getBrainMethod($scope.filtered.selTagId, $scope.filtered.affectedOnly);
			else if($scope.filtered.selCSId == 4)
				thisCtrl.getComplexMethod($scope.filtered.selTagId, $scope.filtered.affectedOnly);
		} else {
			alert("Select one tag and one code smell!");
		}
	}
	
	function hasMethodCodeSmell(method){
		return method.hasCodeSmell;
	}
	
	function hasChildren(obj){
		return obj.children.length>0;
	}
	
});