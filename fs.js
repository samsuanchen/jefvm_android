if (typeof fs!="object") {
	window.fs={};
	if (typeof ios_readFileSync==="undefined") {
		window.ios_readFileSync=function(){};
		window.ios_writeFileSync=function(){};
		window.ios_existsSync=function(){};
	}
	fs.readFileSync=ios_readFileSync;
	fs.writeFileSync=ios_writeFileSync;
	fs.existsSync=ios_existsSync;
}