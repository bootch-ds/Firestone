//STORAGE FUNCTIONS
const sStorage_Key = "FS_Data";
function getData() {
	//return new DataBO();
	var sData = localStorage.getItem(sStorage_Key);

	if (IsValidJSONString(sData)) {
		oData = new DataBO(sData);
	}
	//no localStorage set => init with default values
	else {
		oData = new DataBO();
		saveData(oData);
	}
	return oData;
}

function saveData(oData) {
	var sData = angular.toJson(oData);
	localStorage.setItem(sStorage_Key, sData);
}
function uploadData(sData) {
	if (IsValidJSONString(sData)) {
		localStorage.setItem(sStorage_Key, sData);
		return true;
	}
	return false;
}
function clearData() {
	localStorage.removeItem(sStorage_Key);
}

function getStorageSize(o) {
	var sData = JSON.stringify(o);
	var size_KB = ((sData.length * 16) / (8 * 1024)).toFixed(2);
	
	return size_KB;
}	

//trigger file save - caled from angularjs
function downLoadData(name, sData, sType) {
	var a = document.getElementById("_hrefDownloadLink");
	sData = localStorage.getItem(sStorage_Key);
	sType = 'text/json';
	var file = new Blob([sData], { type: sType });
	a.href = URL.createObjectURL(file);
	a.download = name;
	a.click();
}

function IsValidJSONString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}

function ValidateMimeType(sMimeType, oValidMimeTypes) {	
	switch (sMimeType) {
		case "application/json":
			if (oValidMimeTypes.includes('json')) {
				return true;
			}
			break;
		case "text/plain":
			if (oValidMimeTypes.includes('text')) {
				return true;
			}
			break;
	}	
	return false;
}

