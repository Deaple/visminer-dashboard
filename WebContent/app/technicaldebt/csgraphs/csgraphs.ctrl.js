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
	             {id:'2',name:'Brain Class'}
	             ],
			tags: [],
	};
	
	//JSON to format God Class in d3.js pattern
	$scope.godClass = {
			name: null,
			children: []};
	
	$scope.longMethod = {
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
	
	thisCtrl.getGodClass = function(tagId,codeSmellId){
		console.log('Tag ID:',tagId,' Code Smell ID',codeSmellId);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTree", "treeId": tagId}})
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
			}
		
			console.log("PACOTE: ",JSON.stringify($scope.godClass));
			updateChart($scope.godClass);
			
		});
	}
	
	thisCtrl.getLongMethod = function(tagId,codeSmellId){
		console.log('Tag ID:',tagId,' Code Smell ID',codeSmellId);
			
		$http.get('TypeServlet', {params:{"action": "getAllByTree", "treeId": tagId}})
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
						
						k++;
					}
				}
			}
		
			console.log("PACOTE: ",JSON.stringify($scope.longMethod));
			updateChart($scope.longMethod);
			
		});
	}
	
	$scope.getCodeSmell = function(){
		if($scope.filtered.selTagId!=null && $scope.filtered.selCSId!=null){
			//TODO check id from code smell and call its get method
			if($scope.filtered.selCSId == 0)
				thisCtrl.getGodClass($scope.filtered.selTagId,$scope.filtered.selCSId);
			else if($scope.filtered.selCSId == 1)
				thisCtrl.getLongMethod($scope.filtered.selTagId,$scope.filtered.selCSId);
		} else {
			alert("Select one tag and one code smell!");
		}
	}
	
});