(function( window, undefined ) {
	// ... 
	
	data_priv = new Data();

	function Data() {
		// jQuery.expando是jq的静态属性，对于jq的每次加载运行时期时唯一的随机数
		// expando 打开数据仓库的钥匙 
		this.expando = jQuery.expando + Math.random();
		this.cache = {}
	},
	
	// activeElement 属性返回文档中获得焦点的元素
	function safeActiveElement() {
		try {
			return document.activeElement;
		} catch ( err ) { }
	}
	
	Data.uid = 1;
	
	Data.prototype = {
		key: function( owner ) {
			var descriptor = {},
				// Check if the owner object already has a cache key
				// 第一次执行时，当前找到的这个dom元素中 没有expando这个属性的存在 
				unlock = owner[ this.expando ];
		
			// If not, create one
			if ( !unlock ) {
				unlock = Data.uid++;
		
				// Secure it in a non-enumerable, non-writable property
				try {
					descriptor[ this.expando ] = { value: unlock };
					// 方法直接在对象上定义一个或多个新的属性或修改现有属性并返回该对象 
					// 给dom元素扩展 属性 dom : jQuery1328395847559 [随机数] = 1，
					// 这个属性就是打开数据仓库的一把钥匙，挂在dom元素参数的一个属性上，
					// 1是我们要找到对应的参数所存储的数据的一个凭证，一个标识
					// 这就是整个数据系统对add的设计
					Object.defineProperties( owner, descriptor );
		
				// Support: Android < 4
				// Fallback to a less secure definition
				} catch ( e ) {
					descriptor[ this.expando ] = unlock;
					jQuery.extend( owner, descriptor );
				}
			}
		
			// Ensure the cache object	确保缓存对象记录信息
			if ( !this.cache[ unlock ] ) {
				this.cache[ unlock ] = {};	// 数据 
			}
		
			return unlock;
		},
		get: function( owner, key ) {
			// Either a valid cache is found, or will be created. 找到或者创建缓存
			// New caches will be created and the unlock returned,
			// allowing direct access to the newly created
			// empty data object. A valid owner object must be provided.
			// cache data中定义的cache
			// {} 这个dom元素在整个数据仓库中数据存储的这个对象 
			// 1  {events: {}, handle:function(){}}
			var cache = this.cache[ this.key( owner ) ];	// this.key( owner )返回 1，会找到 {} 这个对象
			// key 有值直接在缓存中去读
			return key === undefined ?
				cache : cache[ key ];
		},
	},
	
	jQuery.event = {
		fix: function( event ) {
			if ( event[ jQuery.expando ] ) {
				return event;
			}
		
			// Create a writable copy of the event object and normalize some properties
			var i, prop, copy,
				type = event.type,
				originalEvent = event,
				fixHook = this.fixHooks[ type ];
		
			if ( !fixHook ) {
				this.fixHooks[ type ] = fixHook =
					rmouseEvent.test( type ) ? this.mouseHooks :
					rkeyEvent.test( type ) ? this.keyHooks :
					{};
			}
			copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props;
		
			event = new jQuery.Event( originalEvent );
		
			i = copy.length;
			while ( i-- ) {
				prop = copy[ i ];
				event[ prop ] = originalEvent[ prop ];
			}
		
			// Support: Cordova 2.5 (WebKit) (#13255)
			// All events should have a target; Cordova deviceready doesn't
			if ( !event.target ) {
				event.target = document;
			}
		
			// Support: Safari 6.0+, Chrome < 28
			// Target should not be a text node (#504, #13143)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}
		
			return fixHook.filter? fixHook.filter( event, originalEvent ) : event;
		},
		
		special: {
			load: {
				// Prevent triggered image.load events from bubbling to window.load
				noBubble: true
			},
			focus: {
				// Fire native event if possible so blur/focus sequence is correct
				trigger: function() {
					// $('input').trigger('focus') this指的是input,如果本身是没有获得焦点的，但本身又有focus这个属性，调用方法
					if ( this !== safeActiveElement() && this.focus ) {
						this.focus();
						return false;
					}
				},
				delegateType: "focusin"
			},
			blur: {
				trigger: function() {
					if ( this === safeActiveElement() && this.blur ) {
						this.blur();
						return false;
					}
				},
				delegateType: "focusout"
			},
			click: {
				// For checkbox, fire native event so checked state will be right
				trigger: function() {
					if ( this.type === "checkbox" && this.click && jQuery.nodeName( this, "input" ) ) {
						this.click();
						return false;
					}
				},
		
				// For cross-browser consistency, don't fire native .click() on links
				_default: function( event ) {
					return jQuery.nodeName( event.target, "a" );
				}
			},
		
			beforeunload: {
				postDispatch: function( event ) {
		
					// Support: Firefox 20+
					// Firefox doesn't alert if the returnValue field is not set.
					if ( event.result !== undefined ) {
						event.originalEvent.returnValue = event.result;
					}
				}
			}
		},
		
		// 修复事件对象event,从缓存体中的events对象取得对应的队列
		dispatch: function( event ) {
		
			// Make a writable jQuery.Event from the native event object,浏览器兼容性处理
			event = jQuery.event.fix( event );
			// arguments 是调用dispatch时所传过来的arguments, 将arguments变成数组
			var args = [].slice.call( arguments ),
				// 取出当前事件对象里的事件函数 click
				handlers = ( data_priv.get( this, "events" ) || {} )[ event.type ] || [],
				event.delegateTarget = this;
			
			// 执行事件处理函数
			jQuery.event.handlers.call( this, handlers, args );
		},
		handlers: function(handlers, args) {		// args [模拟的事件对象event，有自定义的参数]
			handlers[0].handler.apply(this, args)
		},
		
		/* 
			1、 利用data_priv 数据缓存,分离事件与数据
			2、元素与缓存中建立guid的映射关系用于查找 
		 */
		add: function( elem, types, handler, data, selector ) {
			
				var handleObjIn, eventHandle, tmp,
					events, t, handleObj,
					special, handlers, type, namespaces, origType,
					// 没有将数据直接绑定在dom元素上，而是通过jq事件系统的add方法，存储在hash缓存的对象当中
					// 事件缓存，将element传过去，拿到这个元素的数据仓库中的数据对象
					elemData = data_priv.get( elem );
			
				// Don't attach events to noData or text/comment nodes (but allow plain objects)
				if ( !elemData ) {
					return;
				}
			
				// Caller can pass in an object of custom data in lieu of the handler
				if ( handler.handler ) {
					handleObjIn = handler;
					handler = handleObjIn.handler;
					selector = handleObjIn.selector;
				}
			
				// 检测handler是否存在guid这个属性，如果没有传给他一个id
				// 添加id的目的是 用来寻找或删除相应的事件
				// Make sure that the handler has a unique ID, used to find/remove it later
				if ( !handler.guid ) {
					handler.guid = jQuery.guid++;
				}
			
				// 同一个元素，不同事件来执行add方法的时候 ，不能重复绑定（handle 与 events一样） 
				// Init the element's event structure and main handler, if this is the first
				if ( !(events = elemData.events) ) {
					events = elemData.events = {};
				}
				if ( !(eventHandle = elemData.handle) ) {
					// 下面这个函数 称之为 事件函数
					eventHandle = elemData.handle = function( e ) {
						// Discard the second event of a jQuery.event.trigger() and
						// when an event is called after a page has unloaded
						return typeof jQuery !== core_strundefined && (!e || jQuery.event.triggered !== e.type) ?
							jQuery.event.dispatch.apply( eventHandle.elem, arguments ) :
							undefined;
					};
					// Add elem as a property of the handle fn to prevent a memory leak with IE non-native events
					eventHandle.elem = elem;
				}
			
				// Handle multiple events separated by a space
				types = ( types || "" ).match( core_rnotwhite ) || [""];
				t = types.length;
				while ( t-- ) {
					tmp = rtypenamespace.exec( types[t] ) || [];
					type = origType = tmp[1];
					namespaces = ( tmp[2] || "" ).split( "." ).sort();
			
					// There *must* be a type, no attaching namespace-only handlers
					if ( !type ) {
						continue;
					}
			
					// If event changes its type, use the special event handlers for the changed type
					special = jQuery.event.special[ type ] || {};
			
					// If selector defined, determine special event api type, otherwise given type
					type = ( selector ? special.delegateType : special.bindType ) || type;
			
					// Update special based on newly reset type
					special = jQuery.event.special[ type ] || {};
			
					// handleObj is passed to all event handlers
					handleObj = jQuery.extend({
						type: type,
						origType: origType,
						data: data,
						handler: handler,
						guid: handler.guid,
						selector: selector,
						needsContext: selector && jQuery.expr.match.needsContext.test( selector ),
						namespace: namespaces.join(".")
					}, handleObjIn );
			
					// Init the event handler queue if we're the first
					// 通过events存储同一个元素上的多个事件 [{guid: 1, handle:{}, type:'click'}, delegateCount: 0]
					if ( !(handlers = events[ type ]) ) {
						handlers = events[ type ] = [];
						handlers.delegateCount = 0;		// 有多少个事件代理，默认为0
			
						// Only use addEventListener if the special events handler returns false
						if ( !special.setup || special.setup.call( elem, data, namespaces, eventHandle ) === false ) {
							if ( elem.addEventListener ) {
								elem.addEventListener( type, eventHandle, false );
							}
						} 
					}
			
					if ( special.add ) {
						special.add.call( elem, handleObj );
			
						if ( !handleObj.handler.guid ) {
							handleObj.handler.guid = handler.guid;
						}
					}
			
					// Add to the element's handler list, delegates in front
					if ( selector ) {
						handlers.splice( handlers.delegateCount++, 0, handleObj );
					} else {
						handlers.push( handleObj );
					}
			
					// Keep track of which events have ever been used, for event optimization
					jQuery.event.global[ type ] = true;
				}
			
				// Nullify elem to prevent memory leaks in IE
				elem = null;
		},
			
		/* 	event： 规定指定元素上要触发的事件，可以是自定义事件，可以是任何标准事件
			data:	传递到事件处理程序的额外参数
			elem:	element对象
		 */
		trigger: function( event, data, elem ) {
			var i, cur, tmp, bubbleType, ontype, handle, special,
				eventPath = [ elem || document ],	// 规定冒泡事件，不仅执行该元素上的自定义事件，还会检测父元素的父元素的～～（冒泡）上的自定义事件
				// type = core_hasOwn.call( event, "type" ) ? event.type : event,
				type = event.type || event
		
			cur = tmp = elem = elem || document;
			
			// 证明是ontype绑定事件，加上on前缀
			ontype = type.indexOf(":") < 0 && "on" + type;
			// 可用正则 ontype = /^\w+$/.test(type) && "on" + type
			
			// 模拟事件对象， 如果存在jQuery.expando，便是该元素已经是模拟的事件对象
			// Caller can pass in a jQuery.Event object, Object, or just an event type string
			event = event[ jQuery.expando ] ?
				event :
				new jQuery.Event( type, typeof event === "object" && event );
				
			// 定义event.target属性
			if ( !event.target ) {
				event.target = elem;
			}
		
			// Clone any incoming data and prepend the event, creating the handler arg list
			// 如果没有传入参数，就把event传入数组中，有参数则合并数组
			// data是可选的，注意：事件处理程序第一个参数默认是event（此为出处）
			data = data == null ?
				[ event ] :
				jQuery.makeArray( data, [ event ] );
		
			// Allow special events to draw outside the lines 事件类型是否需要特殊化处理
			// 事件类型是否需要特殊处理
			// 如果special中刚好有这个事件的话，要做特殊的处理
			special = jQuery.event.special[ type ] || {};
			if ( !onlyHandlers && special.trigger && special.trigger.apply( elem, data ) === false ) {
				return;
			}
		
			// Determine event propagation path in advance, per W3C events spec (#9951)
			// Bubble up to document, then to window; watch for a global ownerDocument var (#9724)
		// 	if ( !onlyHandlers && !special.noBubble && !jQuery.isWindow( elem ) ) {
		
		// 		bubbleType = special.delegateType || type;
		// 		if ( !rfocusMorph.test( bubbleType + type ) ) {
					cur = cur.parentNode;
				// }
				// 当cur为document的时候，整个循环就结束了，因为document.parentNode = null
				for ( ; cur; cur = cur.parentNode ) {
					eventPath.push( cur );
					tmp = cur;
				}
		
				// Only add window if we got to document (e.g., not plain obj or detached DOM)
				// 如果tmp是document，cur为空，就退出循环
				if ( tmp === (elem.ownerDocument || document) ) {
					eventPath.push( tmp.defaultView || tmp.parentWindow || window );	// 模拟冒泡到window对象
				}
			}
		
			// Fire handlers on the event path
			// 沿着上面规划好的冒泡路径，把经过的元素节点的指定类型事件的回调逐一触发执行
			i = 0;
			while ( (cur = eventPath[i++]) ) ) {				
				// 先判断缓存系统中是否有此元素绑定的此事件类型的回调方法，如果有，就取出来
				// jQuery handler
				handle = ( data_priv.get( cur, "events" ) || {} )[ event.type ] && data_priv.get( cur, "handle" );
				if ( handle ) {
					// 如果已经存在handle 说明该事件已经注册过了，只要取调用它对应的事件函数就可以了
					console.log(handle)		// 事件函数，在上方add中
					/* 即： handle = function( e ) {
						return jQuery.event.dispatch.apply( eventHandle.elem, arguments )
					}; */
					handle.apply( cur, data );		// cur 当前对象 data 有[event, 自定义参数]
				}
		
			}
			return event.result;
		}
	},
	
	// 模拟event对象
	jQuery.Event = function( src, props ) {
		// Allow instantiation without the 'new' keyword
		// 创建一个jquery.event实例对象
		if ( !(this instanceof jQuery.Event) ) {
			return new jQuery.Event( src, props );
		}
	
		// Event object 事件类型，该当前元素添加type 获取事件类型
		this.type = src;
		// 如果传入事件没有时间戳，则创建时间戳
		this.timeStamp = src && src.timeStamp || jQuery.now();
	
		// jQuery.Event实例对象标记
		this[ jQuery.expando ] = true;
	};

	jQuery.Event.prototype = {
		isDefaultPrevented: returnFalse,
		isPropagationStopped: returnFalse,
		isImmediatePropagationStopped: returnFalse,
	    //取消事件的默认动作
		preventDefault: function() {
			var e = this.originalEvent;
	
			this.isDefaultPrevented = returnTrue;
	
			if ( e && e.preventDefault ) {
				console.log(1)
				e.preventDefault();
			}
		},
		// 方法阻止事件冒泡到父元素,阻止任何父事件处理程序被执行。
		stopPropagation: function() {
			var e = this.originalEvent;
	         console.log(this.originalEvent)
			this.isPropagationStopped = returnTrue;
	
			if ( e && e.stopPropagation ) {
				console.log(1)
				e.stopPropagation();
			}
		},
		stopImmediatePropagation: function() {
			this.isImmediatePropagationStopped = returnTrue;
			this.stopPropagation();
		}
	};

	jQuery.fn = jQuery.prototype = {
		jquery: core_version,
		
		each: function(callbacks, args) {
			return jQuery.each(this, callbacks, args)
			// this 是jq的实例对象，$('#box')创建了实例对象
			// callback 即下方each 中return传过来的方法
			// 此处args没有传 undefinded
		},
	}

	jQuery.extend({
		// Unique for each copy of jQuery on the page
		expando: "jQuery" + ( core_version + Math.random() ).replace( /\D/g, "" ),
		guid : 1	,		// 计数器
		now: Data.now,		// 返回当前时间距离时间零点（1970-1-1 0:0:0 utc）的毫秒数	
		// args is for internal usage only
		/* 	obj 目标源，jq创建的实例对象 this
			callback 回调函数:   
			function() {
				jQuery.event.add( this, types, fn );	// types => click	fn => function(){console.log('loading')}
			}
			args 自定义回调函数参数 
		*/
		each: function( obj, callback, args ) { 
			var value,
				i = 0,
				length = obj.length,
				isArray = isArraylike( obj );
		
			if ( args ) { 
				if ( isArray ) {
					for ( ; i < length; i++ ) {
						value = callback.apply( obj[ i ], args );
		
						if ( value === false ) {
							break;
						}
					}
				} else {
					for ( i in obj ) {
						value = callback.apply( obj[ i ], args );
		
						if ( value === false ) {
							break;
						}
					}
				}
		
			// A special, fast, case for the most common use of each
			} else {
				if ( isArray ) {
					for ( ; i < length; i++ ) {
						value = callback.call( obj[ i ], i, obj[ i ] );
				
						if ( value === false ) {
							break;
						}
					}
				} else {
					for ( i in obj ) {
						value = callback.call( obj[ i ], i, obj[ i ] );
				
						if ( value === false ) {
							break;
						}
					}
				}
			}
		
			return obj;
		},
		
		// results is for internal usage only
		makeArray: function( arr, results ) {
			var ret = results || [];
		
			if ( arr != null ) {
				if ( isArraylike( Object(arr) ) ) {
					jQuery.merge( ret,
						typeof arr === "string" ?
						[ arr ] : arr
					);
				} else {
					core_push.call( ret, arr );
				}
			}
		
			return ret;
		},
		merge: function( first, second ) {
			var l = second.length,
				i = first.length,
				j = 0;
		
			if ( typeof l === "number" ) {
				for ( ; j < l; j++ ) {
					first[ i++ ] = second[ j ];
				}
			} else {
				while ( second[j] !== undefined ) {
					first[ i++ ] = second[ j++ ];
				}
			}
		
			first.length = i;
		
			return first;
		},
	}),
	jQuery.fn.extend({
		on: function( types, fn) {
			// 参数：绑定的事件，事件函数
			var type;

			// Types can be a map of types/handlers，绑定的是多个事件
			if ( typeof types === "object" ) {
				for ( type in types ) {
					this.on(type, types[ type ]);
				}
			}
					
			return this.each( function() {
				// 执行这个callback的时候，此处的this 指向的是element对象的元素
				jQuery.event.add( this, types, fn );	// types => click	fn => function(){console.log('loading')}
			});
		}
	
		// type: 事件的名称	data: 可选，可传递到事件处理程序的额外的参数，ps:事件处理程序的第一个参数默认是event
		trigger: function( type, data ) {
			return this.each(function() {
				jQuery.event.trigger( type, data, this );
			});
		},
		triggerHandler: function( type, data ) {
			var elem = this[0];
			if ( elem ) {
				return jQuery.event.trigger( type, data, elem, true );
			}
		}
	})
})