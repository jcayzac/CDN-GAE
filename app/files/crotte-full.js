(function() {
	var W=window, D=document;
	var base = 'http://1.cdn-jcayzac.appspot.com/files/';

	var load_script = function(s, cb) {
		var js, fjs = D.querySelector('script');
		js = D.createElement('script');
		js.async=true;
		js.src = s;
		js.onload = js.onreadystatechange = function() {
			if (!js.readyState || ( /loaded|complete/ ).test(js.readyState)) {
				js.onload = js.onreadystatechange = null;
				if (typeof cb === "function") { cb(); }
			}
		};
		fjs.parentNode.insertBefore(js, fjs);
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

	body=D.querySelector('body')
	if (body) {
		if (!(body.className || '').match(/\bjs\b/)) {
			var classes = (body.className || '').split(/\s+/)
			classes.push('js')
			body.className = classes.join(' ')
		}
	}
	load_local_stylesheet('fonts.css?gz', 'fontscss');
	load_local_stylesheet('gist.css?gz', 'gistcss');
	load_local_stylesheet('keep-aspect-ratio.css.css?gz', 'karcss');

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

		// videos
		subst('youtube', function(e) {
			return iframe_16x9('//www.youtube.com/embed/' + e.getAttribute('video') + '?hd=1&autohide=1&fs=1&iv_load_policy=3&loop=1&rel=0&showsearch=0& showinfo=0&modestbranding=1&enablejsapi=1', 'youtube');
		});
		subst('vimeo', function(e) {
			return iframe_16x9('//player.vimeo.com/video/' + e.getAttribute('video') + '?title=0&byline=0&portrait=0&loop=1', 'vimeo');
		});
		subst('video', function(e) {
			return wrap_16x9(e);
		});
		// code
		var gists = D.querySelectorAll('gist');
		for (var gi=0; gi<gists.length; gi++) {
			var e = gists[gi];
			var code = e.getAttribute('code');
			var cb = 'on_gist_' + code + '_' + Math.floor(Math.random()*99999999+1);
			window[cb] = (function(e, code, cb){ return function(x) {
				delete window[cb];
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
				};
				e.parentNode.insertBefore(div.firstChild, e);
				e.parentNode.removeChild(e);
			}; })(e, code, cb);
			load_script('https://gist.github.com/' + code + '.json?callback='+cb);
		};
	})
})();
