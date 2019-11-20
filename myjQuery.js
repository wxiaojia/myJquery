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
			$.extend(true, {}, {name: 'max', age: '30'})
			1. 给任意对象扩展，两个及两个以上
			2. 给jq本身扩展，一个参数
			3. 给jq的实例对象扩展，一个参数 */
		var target = arguments[0] || {};
		var length = arguments.length;
		var i = 1;
		var option, name, copy, src, copyIsArray, clone;
		var deep = false;
		
		if (typeof target === 'boolean') {
			deep = target
			target = arguments[1]
			i = 2
		}
		// 渠道的target不一定是对象
		if (typeof target !== 'object') {
			target = {}
		}
		// 参数的个数
		if (length === i) {
			// 给jq本身扩展，一个参数  调用时this 指向jq
			// 给jq的实例对象扩展，一个参数 		调用时this指向jq实例对象
			target = this
			// 如果长度只有1，那么i--，下面使用argument[0]就可以获取到下方第一个对象
			i--
		}
		// 给任意对象扩展，两个及两个以上,ps:第一个对象不需要循环，等着被扩展就可以了
		// 浅拷贝:只会发生替换的关系，深拷贝，会进行合并
		for (;i < length; i++) {
			if ((option = arguments[i]) != null) {
				for (name in option) {
					copy = option[name] 
					src = target[name]
					console.log(copy)
					console.log(src)
					// 如果是1 深拷贝，且该数据类型必须是2 数组或者3 对象
					// var ret = {name: 'max', list:{age: '30'}}
					// var res = {list:{sex: '女'}}
					// copyIsArray 区分copy的数据类型，与下面的操作有很大的关系
					if (deep && (jQuery.isPlanObject(copy) || copyIsArray = jQuery.isArray(copy))) {
						if (copyIsArray) {
							copyIsArray = false 	// 重置下
							// 如果src是数组则 直接赋值，若不是则创建一个空数组！！！
							clone = src && jQuery.isArray(src) ? src : [] 
						} else {
							clone = src && jQuery.isPlanObject(src) ? src :{}
						}
						// 再做一次浅拷贝
						target[name] = jQuery.extend(deep, clone, copy)
					} else if (copy != undefined){
						// 浅拷贝
						target[name] = copy
					}
				}
			}
		}
		return target
	}
	
	// 共享原型对象
	jQuery.fn.init.prototype = jQuery.fn
	// 调用该方法去扩展jquery的属性和方法
	// 为什么不直接jquery.isPlanObhect
	jQuery.extend({
		isPlanObject: function(obj) {
			return toString.call(obj) === '[Object Object]'
		},
		isArray: function (obj) {
			return toString.call(obj) === '[Object Array]'
		}
	})
	root.$ = root.jQuery = jQuery
})(this)