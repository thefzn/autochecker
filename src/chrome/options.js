"use strict"
var JSBtnOptions = {
	data:null,
	rel:[],
	saved:{},
	getScripts: function(){
		var me = this;
		// Load stored scripts
		chrome.storage.sync.get("jsbtn",function(jsbtn){
			var count = 0,
				container,i,len,tmp,removeBtns;
			me.data = jsbtn.jsbtn || {};
			// Display the active scripts
			container = document.querySelector("#jsBtnList tbody");
			if(me.data && me.data.pages && me.data.pages instanceof Array && me.data.pages.length){
				for(i = 0, len = me.data.pages.length; i < len; i++){
					tmp = document.createElement("tr");
					container.appendChild(tmp);
					tmp.id = 'item' + i;
					tmp.innerHTML = '<td>' +
									'	<button name="jsBtn_Btn' + i + '" id="jsBtn_Btn' + i + '" class="jsBtnRemove">X</button>' +
									'</td><td>' + 
									'	<input type="text" name="jsBtn_Sites[' + i + ']" id="jsBtn_Site' + i + '" value="' + me.data.pages[i].replace(/"/g, '\"') + '">'+
									'</td><td>' + 
									'	<textarea name="jsBtn_Scripts[' + i + ']" id="jsBtn_Script' + i + '" class="jsBtnScript" rows="5">' + me.data.scripts[i].replace(/"/g, '\"') + '</textarea>' +
									'</td>';
				}
			}else{
				document.querySelector(".jsBtnList").style.display = "none";
			}
			// Display saved settings
			container = document.querySelector("#jsBtnSavedList tbody");
			if(me.data && me.data.saved){
				for(i in me.data.saved){
					if(!me.validateSaved(i)) continue;
					tmp = document.createElement("tr");
					container.appendChild(tmp);
					tmp.id = 'savedItem' + count;
					tmp.innerHTML = '<td>' +
									'	<button name="jsBtn_BtnSave' + count + '" id="jsBtn_BtnSave' + count + '" class="jsBtnRemoveSaved">X</button>' +
									'</td><td>' + 
									'	<input type="text" name="jsBtn_Save[' + count + ']" id="jsBtn_Save' + count + '" value="' + i + '" >'+
									'</td>';
					me.rel.push(i);
					me.saved[i] = me.data.saved[i];
					count++;
				}
				if(!count){
					document.querySelector(".jsBtnSavedList").style.display = "none";
				}
			}else{
				document.querySelector(".jsBtnSavedList").style.display = "none";
			}
			// Add remove actions
			removeBtns = document.querySelectorAll(".jsBtnRemove");
			for(i = 0, len = removeBtns.length; i < len; i++){
				tmp = removeBtns[i];
				tmp.addEventListener('click',function(e){
					e.preventDefault();
					me.removeScript(this.id);
				});
			}
			removeBtns = document.querySelectorAll(".jsBtnRemoveSaved");
			for(i = 0, len = removeBtns.length; i < len; i++){
				tmp = removeBtns[i];
				tmp.addEventListener('click',function(e){
					e.preventDefault();
					me.removeSaved(this.id);
				});
			}
		});
	},
	addScript: function(){
		var site = document.querySelector("#jsBtnAddSite").value || false,
			script = document.querySelector("#jsBtnAddScript").value || false,
			next = document.querySelectorAll("#jsBtnList tbody td").length,
			container = document.querySelector("#jsBtnList tbody"),
			me = this,
			tmp,i,len,removeBtns;
		if(!site || !script){
			alert("Please fill the 'Site or Page' and 'Script' in order to add a new item.");
			return;
		}
		script = script.replace(/"/g, '\"');
		site = site.replace(/"/g, '\"');
		
		tmp = document.createElement("tr");
		container.appendChild(tmp);
		tmp.id = 'item' + next;
		
		this.data = this.data || {};
		this.data.pages = this.data.pages || [];
		this.data.scripts = this.data.scripts || [];
		
		this.data.pages.push(site);
		this.data.scripts.push(script);
		tmp.innerHTML = '<td>' +
						'	<button name="jsBtn_Btn' + next + '" id="jsBtn_Btn' + next + '" class="jsBtnRemove"></button>' +
						'</td><td>' + 
						'	<input type="text" name="jsBtn_Sites[' + next + ']" id="jsBtn_Site' + next + '" value="' + site + '">'+
						'</td><td>' + 
						'	<textarea name="jsBtn_Scripts[' + next + ']" id="jsBtn_Script' + next + '" class="jsBtnScript" rows="5">' + script + '</textarea>' +
						'</td>';
		
		document.querySelector(".jsBtnList").style.display = "block";
		document.querySelector("#jsBtnAddSite").value = "";
		document.querySelector("#jsBtnAddScript").value = "";
		document.querySelector("#jsBtn_Btn" + next).addEventListener('click',function(e){
			e.preventDefault();
			me.removeScript(this.id);
		});
	},
	removeScript: function(index){
		var ind = parseInt(index.replace("jsBtn_Btn","")),
			toDelete,i,len;
		document.querySelector("#item" + ind).style.display = "none";
		toDelete = document.querySelectorAll("#item" + ind + " input, #item" + ind + " textarea");
		for(i = 0, len = toDelete.length; i < len; i++){
			toDelete[i].remove();
		}
	},
	removeSaved: function(index){
		var ind = parseInt(index.replace("jsBtn_BtnSave","")),
			toDelete,i,len;
		document.querySelector("#savedItem" + ind).style.display = "none";
		toDelete = document.querySelectorAll("#savedItem" + ind + " input");
		for(i = 0, len = toDelete.length; i < len; i++){
			toDelete[i].remove();
		}
	},
	saveData: function(){
		var form = document.forms.jsBtnForm,
			me = this,
			data,tmp,i,len,disInputs;
		
		disInputs = document.querySelectorAll("input[disabled]");
		for(i = 0, len = disInputs.length; i < len; i++){
			disInputs[i].disabled = false;
		}
		this.data = {
			pages:[],
			scripts:[],
			def:{},
			saved:{}
		}
		var data = new FormData(form);
		data.forEach(function(val, name){
			if(name == "") return;
			if(name.indexOf("jsBtn_Sites") == 0){
				me.data.pages.push(val);
			}else if(name.indexOf("jsBtn_Scripts") == 0){
				me.data.scripts.push(val.replace(/[\n\r]/g,""));
			}else if(name.indexOf("jsBtn_Save") == 0){
				tmp = me.rel[parseInt(name.replace("jsBtn_Save[","").replace("]",""))];
				me.data.saved[tmp] = me.saved[tmp];
			}
		});
		chrome.storage.sync.set({jsbtn:this.data},function(){chrome.extension.getBackgroundPage().JSBtnUpdate();window.close();});
	},
	validateSaved: function(saved){
		var scripts = this.data.pages || false,
			saved = saved || false,
			val = "";
		if(!scripts || !saved) return false;
		val = "|" + scripts.join("|") + "|";
		return ~val.indexOf(saved);
		
	},
	init: function(){
		var me = this;
		this.getScripts();
		document.querySelector("#jsBtnSave").addEventListener('click',function(e){
			e.preventDefault();
			me.saveData();
		});
		document.querySelector("#jsBtnSaveAdd").addEventListener('click',function(e){
			e.preventDefault();
			me.addScript();
		});
	}
}
document.addEventListener('DOMContentLoaded', function () {
	JSBtnOptions.init();
});
