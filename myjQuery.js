(function (root) {
	var jQuery = function(){
		return new jQuery.prototype.init()
	}
	// jQuery.fn相当于jQuery.prototype简写
	jQuery.fn = jQuery.prototype = {
		init: function() {
			
		},
		css: function() {
			
		}
	}
	
	// extend 核心功能函数
	// 外部使用：对对象进行扩展
	// 所以$.fn.extend与$.extend拿到的都是同一个匿名函数的引用
	jQuery.fn.extend = jQuery.extend = function () {
		/* 方法思路:
			传来的第一个参数必须是对象！！！
			1. 给任意对象扩展，两个及两个以上
			2. 给jq本身扩展，一个参数
			3. 给jq的实例对象扩展，一个参数 */
		var target = arguments[0] || {};
		var length = arguments.length;
		var i = 1;
		var option, name;
		
		if (typeof target !== 'object') {
			target = {}
		}
		// 参数的个数
		if (length === i) {
			// 给jq本身扩展，一个参数  调用时this 指向jq
			// 给jq的实例对象扩展，一个参数 		调用时this指向jq实例对象
			target = this
		}
		// 给任意对象扩展，两个及两个以上,ps:第一个对象不需要循环，等着被扩展就可以了
		// 浅拷贝:只会发生替换的关系，深拷贝，会进行合并
		for (;i < length; i++) {
			if ((option = arguments[i]) != null) {
				for (name in option) {
					target[name] = option[name]
				}
			}
		}
		return target
	}
	
	// 共享原型对象
	jQuery.fn.init.prototype = jQuery.fn
	
	root.$ = root.jQuery = jQuery
})(this)