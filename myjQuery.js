/* jquery的入口及核心功能函数extend  */

(function (root) {
	/* 	1. 正则包含在//中
		2. ^< 表示以 < 开头
		3. \w 表示匹配包括下划线的任意单词字符,等价于 [A-Za-z0-9_]
		4. \s* 匹配任意空白字符,包括空格,制表符,换行符等
		5. \/?>  \转义, /?表示匹配 / 零次或一次,后面接>
		6. (?:<\/\1>|) 接 <\/\1> 或者不接任何内容,标签结束,
		7. <\/\1> 其中‘\/’表示匹配‘/’符号，‘\1’指前面的‘\w+’
		8. 结束
	 */
	var rejectExp = /^<(\w+)\s*\/?>(?:<\/\1>|)$/		// /^<$/
	// $('<a>') 会将a标签给到selector（给到jquery的构造函数），然后给init方法
	var jQuery = function(selector, context){
		return new jQuery.prototype.init(selector, context)
	}
	// selector 可以是对象，函数，字符串，context dom查询的时候 限定查询的范围
	// jQuery.fn相当于jQuery.prototype简写
	jQuery.fn = jQuery.prototype = {
		length: 0,
		selector: '',
		init: function(selector, context) {
			context = context || document
			var match
			// $() $(undefined) $(null) $)(false)
			if (!selector){
				return this
			}
			// 如果传入的是string，1. 查询dom, 2 创建dom
			if (typeof selector === 'string') {
				// 如果第一个字符是<, 最后一个字符是>,而且长度大雨3，则他就是html的字符串，则将它存到一个数组中
				if (selector.charAt(0) === '<' && selector.charAt(selector.length -1) === '>' && selector.length >= 3) {
					match = [selector]	// 创建dom，为什么包装成数组
				}
				if (match) {
					// 有值的，创建dom，
					// 应该都是arr1, arr2,but 这里第一个是对象,这个对象中（上方）有个length属性，而这个length属性在下方merge方法中用到
					// jQuery.parseHTML(selector, context) 解析创建dom节点，此处拿到的就是一个dom节点
					jQuery.merge(this, jQuery.parseHTML(selector, context))
				} else {
					// 查询dom
				}
			} else if (selector.nodeType) {
				
			}
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
					if (deep && (jQuery.isPlanObject(copy) || (copyIsArray = jQuery.isArray(copy)))) {
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
		},
		// 合并数组
		merge: function (first, second) {
			var l = second.length,	// second  dom节点
				i = first.length,
				j = 0;
				if (typeof l === 'number') {
					for (; j < l; j++) {
						first[i++] = second[j]	// first[i++] first中添加数据，指的是jquery的实例对象，即jquery对象中会存储我们查询出来的dom节点
					}
				} else {
					// ?可以是jquery对象？
					while (second[j] !== undefined) {
						first[i++] = second[j++]
					}
				}
				first.length = i
				return first
		},
		// 解析创建dom节点
		parseHTML: function (data, context) {
			if (!data || typeof data !== 'string') {
				return null
			}
			// 过滤器,data:<a> => a。用正则来提取selector 里面的标签名
			  /* 如果 exec() 找到了匹配的文本，则返回一个结果数组。否则，返回 null。此数组的第 0 个元素是与正则表达式相匹配的文本，
			  第 1 个元素是与 RegExpObject 的第 1 个子表达式相匹配的文本（如果有的话），
			  第 2 个元素是与 RegExpObject 的第 2 个子表达式相匹配的文本（如果有的话），
			  以此类推。除了数组元素和 length 属性之外，exec() 方法还返回两个属性。index 属性声明的是匹配文本的第一个字符的位置。
			  input 属性则存放的是被检索的字符串 string。我们可以看得出，在调用非全局的 RegExp 对象的 exec() 方法时，返回的数组与调用方法 String.match() 返回的数组是相同的 */
			var parse = rejectExp.exec(data);
			console.log(parse)	// ["<a>", "a", index: 0, input: '<a>']
			return [context.createElement(parse[1])]
		}
	})
	root.$ = root.jQuery = jQuery
})(this)