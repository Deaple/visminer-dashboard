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
			tagVersion: null,
			packages: []};
	
	
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
			
			$scope.godClass.tagVersion = tagId;
			for(var i = 0; i<packages.length;i++){
				$scope.godClass.packages[i] = {};
				$scope.godClass.packages[i]['name']={};
				$scope.godClass.packages[i].name = packages[i];
				$scope.godClass.packages[i]['classes'] = [];
				var k = 0;
				for(var j=0;j<data.length;j++){
					if($scope.godClass.packages[i].name == data[j].package &&
							data[j].abstract_types.length>0){
						/*console.log("class ",j,": ",data[j].abstract_types[0].name,"pac ",i,
								": ",$scope.godClass.packages[i].name);*/
						$scope.godClass.packages[i].classes[k] = {};
						$scope.godClass.packages[i].classes[k]['name'] = {};
						$scope.godClass.packages[i].classes[k]['hasCodeSmell'] = {};
						$scope.godClass.packages[i].classes[k]['metrics'] = [{"name":"ATFD", "value":null},
						                                                     {"name":"WMC", "value":null},
						                                                     {"name":"TCC", "value":null}];
						
						$scope.godClass.packages[i].classes[k].name = data[j].abstract_types[0].name;
						
						//ATFD
						$scope.godClass.packages[i].classes[k].metrics[0].value = data[j].abstract_types[0].metrics[2].accumulated;
						//WMC
						$scope.godClass.packages[i].classes[k].metrics[1].value = data[j].abstract_types[0].metrics[3].accumulated;;
						//TCC
						$scope.godClass.packages[i].classes[k].metrics[2].value = data[j].abstract_types[0].metrics[4].accumulated;;
						
						$scope.godClass.packages[i].classes[k].hasCodeSmell = data[j].abstract_types[0].codesmells[0].value;
						
						k++;
					}
				}
			}
		
			console.log("PACOTE: ",JSON.stringify($scope.godClass));
			
		});
	}
	
	$scope.getCodeSmell = function(){
		if($scope.filtered.selTagId!=null && $scope.filtered.selCSId!=null){
			//TODO check id from code smell and call its get method
			thisCtrl.getGodClass($scope.filtered.selTagId,$scope.filtered.selCSId);
		} else {
			alert("Select one tag and one code smell!");
		}
	}
	
});