"use strict"

var JSBtnPopup = {
	data: null,
	key:"",
	dataTmp: {
		n:[],
		c:[]
	},
	init: function(){
		var me = this;
		chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
			var url = tabs[0].url;
			chrome.storage.sync.get("jsbtn",function(jsbtn){
				var data = jsbtn.jsbtn || false,
					names = [],
					code = [],
					count = 0,
					i, len;
				if(!data || !data.def) return;
				me.data = data;
				if(data.pages && data.pages.length){
					for(i = 0, len = data.pages.length; i < len; i++){
						if(data.pages[i] && data.scripts[i] && url.indexOf(data.pages[i]) >= 0){
							code.push(data.scripts[i].replace(/"/g,'\"'));
							names.push(data.pages[i].replace(/"/g,'\"'));
							count++;
						}
					}
					me.key = names.join(" + ");
					if(count == 0){
						window.close();
					}else if(count == 1){
						me.runCodes(code);
						window.close();
					}else if(data.saved && data.saved[me.key] && data.saved[me.key] instanceof Array){
						me.runCodes(me.getSavedCodes(data.saved[me.key]));
						window.close();
					}else{
						me.display(code,names);
					}
				}else{
					window.close();
				}
				
			});
			
		});
	},
	display: function(codes,names){
		var codes = codes || false,
			names = names || false,
			html = "",
			me = this,
			i,len;
		if(!codes|| !names || !(codes instanceof Array) || !(names instanceof Array)){
			window.close();
			return;
		}
		this.dataTmp.c = codes;
		this.dataTmp.n = names;
		html += '<pre>There are several scripts that apply for this page, please select the ones that should be applied. Click on "Apply & Remember" to avoid this popup on the future.</pre>'
		for(i = 0, len = names.length; i < len; i++){
			html += '<label><input type="checkbox" id="codes_' + i + '"/><span>' + names[i] + '</span></label>'
		}
		html += '<div><button id="go">Apply This Time</button><button id="save">Apply & Remember</button></div>';
		document.body.innerHTML += html;
		document.querySelector("#go").addEventListener('click',function(){
			me.go();
		});
		document.querySelector("#save").addEventListener('click',function(){
			me.save();
		});
	},
	getFields: function(){
		var data = document.querySelectorAll("input"),
			res = [],
			i;
		for(i in data){
			if(data[i].checked){
				res.push(parseInt(data[i].id.replace("codes_","")));
			}
		}
		return res;
	},
	getSavedCodes: function(names){
		var codes = [],
			i,len,target,j,len2;
		if(!(names instanceof Array)) return [];
		for(i = 0, len = names.length; i < len; i++){
			target = false;
			for(j = 0, len2 = this.data.pages.length; j < len2 && target === false; j++){
				if(this.data.pages[j] == names[i]){
					target = j;
				}
			}
			if(target !== false){
				codes.push(this.data.scripts[target]);
			}
		}
		return codes;
	},
	runCodes: function(code){
		var c = (code instanceof Array) ? code : [code],
			code = c.join(";"),
			i,len;
		chrome.tabs.executeScript(null,{code:"location.href=\"javascript:" + code.replace(/"/g,'\\"') + ";void(0);\""});
	},
	go: function(ret){
		var fields = this.getFields(),
			codes = [],
			names = [],
			ret = ret || false,
			i,len;
		for(i = 0, len = fields.length; i < len; i++){
			codes.push(this.dataTmp.c[fields[i]]);
			names.push(this.dataTmp.n[fields[i]]);
		}
		if(ret){
			return {names:names,codes:codes};
		}else{
			this.runCodes(codes);
			window.close();
		}
	},
	save: function(){
		var codes = this.go(true);
		this.remember(codes);
	},
	remember: function(codes){
		var me = this;
		chrome.storage.sync.get("jsbtn",function(jsbtn){
			var current = jsbtn.jsbtn || {};
			current.saved = current.saved || {};
			current.saved[me.key] = codes.names;
			chrome.storage.sync.set({jsbtn:current},function(){
				me.runCodes(codes.codes);
				window.close();
			});
		});
	}
}

document.addEventListener('DOMContentLoaded', function () {
  JSBtnPopup.init();
});