(function() {
	var W=window, D=document;
	D.crotteElement = D.createElement;
	D.createElement = function(x) {
		if (window.console) {console.log('Creating '+x)}
		return this.crotteElement(x)
	}
	var base = '//cdn-jcayzac.appspot.com/files/';

	var load_script = function(s, cb) {
		var js = D.createElement('script');
		js.async=true;
		js.src = s;
		js.onload = js.onreadystatechange = function() {
			if (!js.readyState || ( /loaded|complete/ ).test(js.readyState)) {
				js.onload = js.onreadystatechange = null;
				if (typeof cb === "function") { cb(); }
			}
		};
		D.documentElement.firstChild.appendChild(js);
	};

	var load_stylesheet = function(src,i) {
		if (D.getElementById(i)) {return}
		var css=null;
		if (D.createStyleSheet) {
			if (D.createStyleSheet(src)) {
				css = D.createElement('style');
			}
			if (!css) {return}
		}
		else {
			css = D.createElement("link");
			if (!css) {return}
			css.rel  = "stylesheet"
			css.type = "text/css"
			css.href = src
		}
		css.id = i
		D.documentElement.firstChild.appendChild(css);
	};

	var load_local_stylesheet = function(src,i) {
		load_stylesheet(base+src,i);
	};

	var iframe = function(src, classname) {
		var e = D.createElement("iframe");
		var a = {
		  'src':  src,
		  'frameborder': '0',
		  'allowfullscreen': 'allowfullscreen'
		};
		for(var x in a) {
			e.setAttribute(x, a[x]);
		}
		e.className = classname;
		return e;
	};

	var wrap_16x9 = function(e) {
		var x = D.createElement('div');
		x.className = 'keep-aspect-ratio';
		var img = D.createElement('img');
		img.setAttribute('src', base+'16x9.png');
		x.appendChild(img);
		x.appendChild(e);
		return x;
	};

	var iframe_16x9 = function(s, c) {
		return wrap_16x9(iframe(s, c));
	};

	var subst=function(sel, fn) {
		var elems = D.querySelectorAll(sel);
		for (var i=0; i<elems.length; i++) {
			var e = elems[i], parent = e.parentNode;
			parent.insertBefore(fn(e), e);
			parent.removeChild(e);
		};
	};

	if (!(D.body.className || '').match(/\bjs\b/)) {
		var classes = (D.body.className || '').split(/\s+/)
		classes.push('js')
		D.body.className = classes.join(' ')
	}
	load_local_stylesheet('combined.min.css', 'crottecss');

	var domIsReady=false;
	(function(fn) {
		if (D.readyState === "complete") {
			setTimeout(fn, 1);
		}
		else if (D.addEventListener) {
			var x;
			x=function() {
				D.removeEventListener("DOMContentLoaded", x, false);
				fn();
			};
			D.addEventListener("DOMContentLoaded", x, false);
			W.addEventListener("load", fn, false);
		}
		else if (D.attachEvent) {
			var x;
			x=function() {
				if (D.readyState === "complete" ) {
					D.detachEvent("onreadystatechange", x);
					fn();
				}
			};
			D.attachEvent("onreadystatechange", x);
			W.attachEvent("onload", fn);
			var toplevel = false;
			try {
				toplevel = W.frameElement == null;
			} catch(e) {}
			if ( D.documentElement.doScroll && toplevel ) {
				var sc;
				sc=function() {
					if (domIsReady) {
						return;
					}
					try {
						D.documentElement.doScroll("left");
					} catch(e) {
						setTimeout( sc, 1 );
						return;
					}
					fn();
				}
				sc();
			}
		}
	})(function() {
		domIsReady=true;

		//<div data-crotte="gist" data-code="1241829" />
		var crotty_divs = D.querySelectorAll('div[data-crotte]');
		for (var i=0; i<crotty_divs.length; i++) {
			var e = crotty_divs[i];
			var r = null;
			switch(e.getAttribute('data-crotte')){
				case 'youtube':
					r = iframe_16x9('//www.youtube.com/embed/' + e.getAttribute('data-ref') + '?hd=1&autohide=1&fs=1&iv_load_policy=3&loop=1&rel=0&showsearch=0& showinfo=0&modestbranding=1&enablejsapi=1', 'youtube');
					break;
				case 'vimeo':
					r = iframe_16x9('//player.vimeo.com/video/' + e.getAttribute('data-ref') + '?title=0&byline=0&portrait=0&loop=1', 'vimeo');
					break;
				case 'gist':
					var code = e.getAttribute('data-ref');
					var cb = 'on_gist_' + code + '_' + Math.floor(Math.random()*99999999+1);
					window[cb] = (function(e, code, cb){ return function(x) {
						window[cb]=null;
						var div = D.createElement('div');
						div.innerHTML = x.div;
						var pre = div.querySelectorAll('.gist-data');
						for (var i=0; i<pre.length; i++) {
							var filename = x.files[i];
							if (filename.substr(0, 8) == 'gistfile') {continue};
							var link = D.createElement('a');
							link.href = 'https://raw.github.com/gist/'+code+'/'+filename;
							link.innerHTML = filename;
							link.target = '_blank';
							link.setAttribute('data-repo', code);
							link.setAttribute('data-filename', filename);
							link.className = 'gist-raw-link font-sans';
							pre[i].appendChild(link);
						}
						e.parentNode.insertBefore(div.firstChild, e);
						e.parentNode.removeChild(e);
					}})(e, code, cb);
					load_script('https://gist.github.com/' + code + '.json?callback='+cb);
					break;
			}
			if (r) {
				e.parentNode.insertBefore(r, e);
				e.parentNode.removeChild(e);
			}
		}
	})
})();
