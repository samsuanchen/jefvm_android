//////////////////////
// jefvm.v2_tst.js //
//////////////////////
var tests=0, passed=0;
function equal(tag,value,expected){ // asure value is exactly equal to expected
	tests++;
	if(value===expected){ passed++; console.log(tag,'ok'); }
	else{
		var tv=typeof value, te=typeof expected;
		console.log('???',tag,'value:'+value,'not equal to expected:'+expected);
		if(tv==='string')
		console.log('val len '+value.length+': '+value.split('').map(function(c){
				return c.charCodeAt(0).toString(16);
		}).join(' '));
		if(te==='string')
		console.log('exp len '+expected.length+': '+expected.split('').map(function(c){
				return c.charCodeAt(0).toString(16);
		}).join(' '));
	}
}
function trm(x){ // ignore all space, \t, or \n in string x
    var y='';
    for(var i=0;i<x.length;i++){
        var c=x.charAt(i);
        if(c!==' '&&c!=='\t'&&c!=='\n')y+=c;
    }
    return y;
}
///////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////////////////////// v0
equal('test 1',trm(vm.nameWord['r1'].xt.toString()),"function(){LED3.write(1);}");
//////////////////////////////////////////////////////////////////////////////////////////// v0
equal('test 2',trm(vm.nameWord['r0'].xt.toString()),"function(){LED3.write(0);}");
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('123 4.56 -10 $41');
equal('test 3',vm.dStack.join(' '),"123 4.56 -10 65"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('"abc" "def 123"');
equal('test 4',vm.dStack.join(' '),"abc def 123"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec("'ghi'");
equal('test 5',vm.dStack.join(' '),"ghi"),vm.clear();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('5 type 2 . 5 .');
equal('test 6',vm.tob,"52 5 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('"abc def" '+"'ghi' + . 2.23 0.23 - 3 * 2 / .");
equal('test 7',vm.tob,"abc defghi 3 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('128 hex . decimal');
equal('test 8',vm.tob,"80 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('hex 100 decimal .');
equal('test 9',vm.tob,"256 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('11 binary . decimal');
equal('test 10',vm.tob,"1011 "),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v1
vm.exec('5 3 .r 10 3 .r 15 3 .r');
equal('test 11',vm.tob,"  5 10 15"),vm.cr();
//////////////////////////////////////////////////////////////////////////////////////////// v2
vm.cArea=[ 0,vm.nameWord['doLit'],3,vm.nameWord['.r'],vm.nameWord['exit'] ],vm.addWord('t',1);
setTimeout(function(){
	vm.exec('5 t 10 t 15 t');
	equal('test 12',vm.tob,"  5 10 15"),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': x 3 .r ; 5 x 10 x 15 x');
	equal('test 13',vm.tob,"  5 10 15"),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': z 9 for r@ . next ; z');
	equal('test 14',vm.tob,'9 8 7 6 5 4 3 2 1 0 '),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': t1 8 for dup 9 r@ - * 3 .r next drop ; 3 t1');
	equal('test 15',vm.tob,'  3  6  9 12 15 18 21 24 27'),vm.cr();
	//////////////////////////////////////////////////////////////////////////////////////// v2
	vm.exec(': t2 8 for 9 r@ - t1 $d emit $a emit next ; t2 cr');
	//////////////////////////////////////////////////////////////////////////////////////// v2
		var compiled=[
			vm.nameWord['zBranch'],5,
			vm.nameWord['doLit'],1,
			vm.nameWord['branch'],3,
			vm.nameWord['doLit'],0,
			vm.nameWord['exit']
		];
		vm.cArea=vm.cArea.concat(compiled);
		vm.addWord('t16',addr);
		vm.exec('0 t16 . 5 t16 .');
		equal('test 16',vm.tob,'0 1 '),vm.cr();
		console.log('total tests', tests, 'passed', passed);
        //////////////////////////////////////////////////////////////////////////////////////// v2
        addr=vm.cArea.length;
        vm.exec(': t17 if 1 else 0 then ;');
        equal('test 17',JSON.stringify(vm.cArea.slice(addr)),JSON.stringify(compiled));
        //////////////////////////////////////////////////////////////////////////////////////// v2
        vm.exec('0 t17 . 5 t17 .');
        equal('test 18',vm.tob,'0 1 '),vm.cr();
        //////////////////////////////////////////////////////////////////////////////////////// v2
        vm.exec(': t19 begin dup . 1- ?dup 0= if exit then again ; 9 t19');
        equal('test 19',vm.tob,'9 8 7 6 5 4 3 2 1 '),vm.cr();
        //////////////////////////////////////////////////////////////////////////////////////// v2
        vm.exec(': t20 begin dup . 1- ?dup 0= until ; 9 t20');
        equal('test 20',vm.tob,'9 8 7 6 5 4 3 2 1 '),vm.cr();
        //////////////////////////////////////////////////////////////////////////////////////// v2
        vm.exec(': t21 begin ?dup while dup . 1- repeat ; 9 t21');
        equal('test 21',vm.tob,'9 8 7 6 5 4 3 2 1 '),vm.cr();
        vm.addWord('mod',function(){var s=vm.dStack, d=s.pop(); s[s.length-1]%=d;});
        vm.exec('10 3 mod .');
        equal('test 22',vm.tob,'1 '),vm.cr();
        vm.addWord('/mod',function(){
			var s=vm.dStack, t=s.length-1,n=t-1,sn=s[n],st=s[t],r=s[n]=sn%st;s[t]=(sn-r)/st;});
        vm.exec('10 3 /mod');
        equal('test 23',vm.dStack.join(' '),'1 3'),vm.clear();
        vm.addWord('.s',function(){console.log(JSON.stringify(vm.dStack));});
	//////////////////////////////////////////////////////////////////////////////////////// v2
        vm.LED=[LED3,LED1,LED2,LED4]; // D14 red D13 yellow D12 green D15 blue
        vm.led=function(k){ var j=k; // how come using i as k, i is always 0 even if undefined ????
            if(k===undefined) j=vm.dStack.pop(); vm.dStack.push(vm.LED[j%4]);
        };
        vm.addWord('led',vm.led);
        vm.toggle=function(led){
            var L= led===undefined ? vm.dStack.pop() : led; v=!digitalRead(L), digitalWrite(L,v);
        };
        vm.addWord('toggle',vm.toggle);
	    var dRead=vm.dRead=function(pin){ var p,v;
			p=pin||vm.dStack.pop(), v=digitalRead(p), vm.dStack.push(v);
			console.log('dRead('+p+')'=v);
		};
	    vm.addWord('digitalRead',digitalRead);
	    var dWrite=vm.dWrite=function(pin,v){digitalWrite(pin||vm.dStack.pop(),v||vm.dStack.pop());};
	    vm.addWord('dWrite',dWrite);
		vm.exec('4 for 3 for i led dup 1 for toggle 10 ms next drop next next'); // run led circle 5 times
		vm.exec('code 0= function(){var t=vm.dStack.length-1;vm.dStack[t]=!vm.dStack[t];}end-code');
		vm.exec('code 0= function(){var t=vm.dStack.length-1;vm.dStack[t]=!vm.dStack[t];}end-code');
		vm.exec('3 begin dup . 1 - ?dup 0= until cr');
		vm.exec('0 begin 1 - dup 2 /mod led dWrite 500 ms "BTN1" dRead until drop');
//  vm.exec('39 for i led toggle 100 ms next'); // run led circle 5 times
//  vm.exec('19 for i led dup toggle 10 ms toggle 10 ms next'); // run led circle 5 times
//  vm.exec('4 for 3 for i led dup 1 for toggle 10 ms next drop next next'); // run led circle 5 times
//  vm.exec('0 begin dup 2 /mod 1 - digitalWrite 1 + 100 ms "BTN1" digitalRead until');
	console.log('total tests', tests, 'passed', passed);
/////////////////////////////////////////////////////////////////////////////////////////////// 
},0);
function (data) {print('input:'+data),print('output:'+eval(data))}
},0);