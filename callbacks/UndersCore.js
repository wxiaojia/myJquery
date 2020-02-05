(function (root) {
	var optionsCache = {}
	var _ = {
		callbacks: function (options) {
			options = typeof options === 'string' ? (optionsCache[options] || createOptions(options)) : {};
			var list = [];	// 该数组即为所谓的队列，当会赋予它一些功能
			var index, length, testings, memory, start, starts;		// index 执行位置
			// 真正处理的
			var fire = function (data) {
				// 执行
				memory = options.memory && data
				index = starts || 0
				start = 0
				testings = true
				length = list.length
				for (; index < length; index++) {
					if (list[index].apply(data[0], data[1]) === false && options.stopOnfalse) {
						break;
					}
				}
			}
			var self = {
				add: function () {
					// 类数组转化为数组，并且内部要判断是否为函数
					var args = Array.prototype.slice.call(arguments)
					// 记录添加前的长度
					start = list.length
					args.forEach(function (fn) {
						if (toString.call(fn) === '[object Function]') {
							list.push(fn)
						}
					})
					// 设置了memory需要starts，否则add 2次的时候会，start其实会少一次
					if (memory) {
						starts = start
						fire(memory)
					}
				},
				// 上下问绑定，执行处理函数，除了要传参，还要控制执行过程中上下问的绑定
				fireWith: function (context, arguments) {
					var args = [context, arguments]
					// 如果没有配置once，则会继续执行 && 第一次调用的时候也要执行
					if (!options.once || !testings) {
						fire(args)
					}
				},
				// fire不是api中解读的fire，是处理参数的
				fire: function () {
					self.fireWith(this, arguments)
				}
			}
			// 因为每次调用callbacks都会返回一个队列
			return self
		},
		deferred: function (func) {}
		
	}
	function createOptions (options) {
		var object = optionsCache[options] = {}
		// 传两个参数-综合的使用_.callbacks('once memory')
		options.split(/\s+/).forEach(function (value) {
			// console.log(value)
			object[value] = true
		})
		return object
	}
	root._ = _
})(this)