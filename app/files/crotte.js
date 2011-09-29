/*jslint devel: true, browser: true, unparam: false, forin: true, plusplus: true, maxerr: 50, indent: 4 */
(function () {
	"use strict";
	var F = false,
		domIsReady = F,
		base = '//cdn-jcayzac.appspot.com/files/',
		store = function (k, v) {
			try {
				localStorage[k] = JSON.stringify(
					{
						value: v,
						timestamp: (new Date()).getTime()
					}
				);
			} catch (e) { }
		},
		retrieve = function (k) {
			try {
				var r = JSON.parse(localStorage[k]);
				if ((new Date()).getTime() - r.timestamp < 3600000000) {
					return r.value;
				}
				localStorage[k] = null;
			} catch (e) { }
			return null;
		},
		load_script = function (s, cb) {
			var js = document.createElement('script');
			js.src = s;
			js.onload = js.onreadystatechange = function () {
				if (!js.readyState || (/loaded|complete/).test(js.readyState)) {
					js.onload = js.onreadystatechange = null;
					if (typeof cb === "function") {
						cb();
					}
				}
			};
			document.documentElement.firstChild.appendChild(js);
		},
		load_stylesheet = function (src, i) {
			if (document.getElementById(i)) {
				return undefined;
			}
			var css = null;
			if (document.createStyleSheet) {
				if (document.createStyleSheet(src)) {
					css = document.createElement('style');
				}
			} else {
				css = document.createElement("link");
				if (css) {
					css.rel  = "stylesheet";
					css.type = "text/css";
					css.href = src;
				}
			}
			if (css) {
				css.id = i;
				document.documentElement.firstChild.appendChild(css);
			}
		},
		load_local_stylesheet = function (src, i) {
			load_stylesheet(base + src, i);
		},
		iframe = function (src, classname) {
			var e = document.createElement("iframe");
			e.src = src;
			e.frameborder = 0;
			e.allowfullscreen = 1;
			e.className = classname;
			return e;
		},
		wrap_16x9 = function (e, classname) {
			var x = document.createElement('div'),
				i = document.createElement('img');
			x.className = 'keep-aspect-ratio ' + classname;
			i.src = base + '16x9.png';
			x.appendChild(i);
			x.appendChild(e);
			return x;
		},
		iframe_16x9 = function (s, c) {
			return wrap_16x9(iframe(s, c), c);
		};

	(function () {
		if (!(document.body.className || '').match(/\bjs\b/)) {
			var classes = (document.body.className || '').split(/\s+/);
			classes.push('js');
			document.body.className = classes.join(' ');
		}
		load_local_stylesheet('combined.min.css', 'crottecss');
	}());

	(function (fn) {
		var f = 'DOMContentLoaded',
			o = 'onreadystatechange',
			c = 'complete',
			x,
			toplevel = false,
			sc = function () {
				if (domIsReady) {
					return undefined;
				}
				try {
					document.documentElement.doScroll("left");
				} catch (e) {
					window.setTimeout(sc, 1);
					return undefined;
				}
				fn();
			};
		if (document.readyState === c) {
			window.setTimeout(fn, 1);
		} else if (document.addEventListener) {
			x = function () {
				document.removeEventListener(f, x, F);
				fn();
			};
			document.addEventListener(f, x, F);
			window.addEventListener("load", fn, F);
		} else if (document.attachEvent) {
			x = function () {
				if (document.readyState === c) {
					document.detachEvent(o, x);
					fn();
				}
			};
			document.attachEvent(o, x);
			window.attachEvent("onload", fn);
			try {
				toplevel = !window.frameElement;
			} catch (e) { }
			if (document.documentElement.doScroll && toplevel) {
				sc(fn);
			}
		}
	}(function () {
		if (domIsReady) {
			return undefined;
		}
		domIsReady = true;
		var crotty_divs = document.querySelectorAll('div[data-crotte]'),
			i,
			e,
			r,
			code,
			cb,
			cached,
			create_gist_handler = function (e, code, cb, cached) {
				return function (x) {
					var pre,
						div,
						i,
						filename,
						link;
					window[cb] = null;

					if (!x.div) {
						return undefined;
					}
					if (!cached) {
						store('gist-' + code, x);
					}

					div = document.createElement('div');
					div.innerHTML = x.div;
					pre = div.querySelectorAll('.gist-data');
					for (i = 0; i < pre.length; i++) {
						filename = x.files[i];
						if (filename.substr(0, 8) !== 'gistfile') {
							link = document.createElement('a');
							link.href = 'https://raw.github.com/gist/' + code + '/' + filename;
							link.innerHTML = filename;
							link.target = '_blank';
							link.setAttribute('data-repo', code);
							link.setAttribute('data-filename', filename);
							link.className = 'gist-raw-link font-sans';
							pre[i].appendChild(link);
						}
					}
					e.parentNode.insertBefore(div.firstChild, e);
					e.parentNode.removeChild(e);
				};
			};

		for (i = 0; i < crotty_divs.length; i++) {
			e = crotty_divs[i];
			r = null;
			switch (e.getAttribute('data-crotte')) {
			case 'youtube':
				r = iframe_16x9('//www.youtube.com/embed/' + e.getAttribute('data-ref') + '?hd=1&autohide=1&fs=1&iv_load_policy=3&loop=1&rel=0&showsearch=0& showinfo=0&modestbranding=1', 'youtube');
				break;
			case 'vimeo':
				r = iframe_16x9('//player.vimeo.com/video/' + e.getAttribute('data-ref') + '?title=0&byline=0&portrait=0&loop=1', 'vimeo');
				break;
			case 'gist':
				code = e.getAttribute('data-ref');
				cb = 'on_gist_' + code + '_' + Math.floor(Math.random() * 99999999 + 1);
				cached = retrieve('gist-' + code);
				window[cb] = create_gist_handler(e, code, cb, cached);

				if (cached) {
					window[cb](cached);
				} else {
					load_script('https://gist.github.com/' + code + '.json?callback=' + cb);
				}
				break;
			}
			if (r) {
				e.parentNode.insertBefore(r, e);
				e.parentNode.removeChild(e);
			}
		}
	}));

}());
