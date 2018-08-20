$(document).ready(
function(){
tokenSeparators:["^"],
$("#sel_menu2").select2({
	multiple:true,
	placeholder:'Please enter some items or keywords',
 ajax: 
 {
 		url:"http://202.121.178.141/cgi-bin/MDPA/SearchDB.cgi",
 		dataType: 'json',
 		delay: 500,
 		data: function (params){
          return { 
              q: params.term, // search term  
              page: params.page
          };
},
processResults: function (data, page)
{ 
          return{  
              results: data.items  
          };
},
 cache:true
},
escapeMarkup: function (markup)
{   
	console.debug(markup)  
      return markup;   
  }, // let our custom formatter work 
 minimumInputLength: 2, 
 //maximumInputLength: 40,
 templateResult:formatRepo,
 templateSelection:formatRepoSelection
})
});
$("#sel_menu2").on("change",function(e){  
  can_analyse();  
})  
function formatRepo(repo)
{  
if (repo.loading) return repo.text;
repo.text = repo.name  
repo.id = repo.id
var markup = '<option value='+repo.id+'">'+ repo.id+'|'+repo.text+'</option>';
return markup;
}  

function formatRepoSelection(repo){  
  repo.selected = true;
  repo.id = repo.id
  repo.name = repo.text
  if(repo.id == null || repo.name == ""){  
      repo.id = 'Please type items'  
      repo.name = repo.text
  }
  return repo.id;  
} 
