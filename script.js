"use strict";
const search = RegExp("[?&]q=([^&]+)");

// 设置网站favicon
function setFavicon() {
    // 移除所有现有的favicon
    const existingIcons = document.querySelectorAll('link[rel*="icon"]');
    for (let i = 0; i < existingIcons.length; i++) {
        existingIcons[i].parentNode.removeChild(existingIcons[i]);
    }
    
    // 添加我们自己的favicon
    const link = document.createElement('link');
    link.rel = 'shortcut icon';
    link.href = '/favicon.png';
    link.type = 'image/png';
    document.head.appendChild(link);
}

function setPath(crumbs, files, q, path, query) {
	if (document.location.pathname != path || document.location.search != query) {
		history.pushState({}, document.title, path + query);
		path = document.location.pathname;
	}

	document.body.classList.add("loading");
	window.scrollTo(0, 0);

	function hasChineseCharacters(str) {
        return /[\u4E00-\u9FFF]/.test(str);
    }

	function a(sp, href, text, cls, rel) {
		let r = document.createElement("a");
		let textSpan = document.createElement("span");
		textSpan.appendChild(document.createTextNode(text === document.location.hostname ? "HOME" : text.replace(/_/g, " ")));
		r.appendChild(textSpan);
		r.setAttribute("href", href);
		if (rel) r.setAttribute("rel", rel);
		if (cls) r.classList.add(cls);
		if (hasChineseCharacters(text)) {
			r.setAttribute("lang", "zh-CN");
		}
		if (sp)	r.addEventListener("click", function(e){
			e.preventDefault();
			setPath(crumbs, files, q, href, "");
			});
		return r;
	}
	function el(e, c) {
		let r = document.createElement(e);
		r.appendChild(c);
		return r;
	}

	path = path.replace(/\/\/+/g, "/").replace(/(^\/+)|(\/+$)/g, "")
	const p = (path)?path.split("/"):[];
	let s = search.exec(query)
	let f = document.createDocumentFragment();
	f.appendChild(el("li", a(true, "/", document.location.hostname)));
	let h = "/"
	for (let i = 0; i < p.length - (!s); i++) {
		h += p[i];
		f.appendChild(el("li", a(true, h, decodeURIComponent(p[i]))));
		h += "/";
	}

	if (s) {
		s = decodeURIComponent(s[1]);
		q.value = s;
		f.appendChild(el("li", el("span", document.createTextNode(s))));
	} else {
		q.value = "";
		f.appendChild(el("li", document.createTextNode(decodeURIComponent(p[p.length-1]||""))));
	}
	crumbs.innerHTML = "";
	crumbs.appendChild(f);

	const req = new XMLHttpRequest();
	req.onreadystatechange = function() {
		if (this.readyState != 4) return;
		document.body.classList.remove("loading");

		if (this.status != 200) {
			files.innerHTML="<li class=error>"+((this.status == 404)?"Not found":"Load failed")+"</li>";
			return;
		}

		let f = document.createDocumentFragment();
		if (p[0] && !s) {
			const backLink = a(true, "/"+p.slice(0,-1).join("/"), "Back", "u");
			f.insertBefore(el("li", backLink), f.firstChild);
		}

		const json = JSON.parse(this.responseText || "[]");
		for (let i = 0; i < json.length; i++) {
			const n = json[i].name
			const p = path+encodeURIComponent(json[i].name);
			if ((json[i].type||"")[0] == "f")
				f.appendChild(el("li", a(false, "/dl/"+p, n, "f", "nofollow")));
			else
				f.appendChild(el("li", a(true, "/"+p.replace(/%2F/gi, "/"), n, "d", "")));
		}

		if (f.childNodes.length) {
			files.innerHTML = "";
			files.appendChild(f);
		} else {
			files.innerHTML="<li class=error>No files found</li>";
		}
	};

	if (path) path += "/"
	req.open("GET", "/idx/" + path + query, true);
	req.send();
}
function onLoad() {
	const path   = document.getElementById("path");
	const files  = document.getElementById("files");
	const search = document.getElementById("search");
	const q      = document.getElementById("q");
	
	// 初始设置favicon
	setFavicon();
	
	setPath(path, files, q, document.location.pathname, document.location.search);

	window.addEventListener("popstate", function(e) {
		setPath(path, files, q, document.location.pathname, document.location.search);
		// 页面历史变化时重新设置favicon
		setFavicon();
	});

	search.addEventListener("submit", function(e) {
		e.preventDefault();
		const s = q.value ? "?r=1&q=" + encodeURIComponent(q.value) : "";
		setPath(path, files, q, document.location.pathname, s);
	});
	
	// 监听所有链接点击，特别是PDF链接
	document.addEventListener('click', function(e) {
		// 找到最近的a标签
		const link = e.target.closest('a');
		if (link) {
			// 对于所有链接，特别是PDF链接，确保favicon保持不变
			setTimeout(setFavicon, 100);  // 短延迟确保在页面变化后执行
			
			// 对于PDF链接，设置定期检查以确保favicon不变
			if (link.href && link.href.toLowerCase().endsWith('.pdf')) {
				// 设置一个间隔，持续确保favicon正确
				const faviconInterval = setInterval(setFavicon, 500);
				
				// 30秒后停止检查
				setTimeout(function() {
					clearInterval(faviconInterval);
				}, 30000);
			}
		}
	});
	
	// 监听visibilitychange事件，当用户从其他标签页返回时重新设置favicon
	document.addEventListener('visibilitychange', function() {
		if (document.visibilityState === 'visible') {
			setFavicon();
		}
	});
	
	// 定期检查favicon（以防其他脚本或浏览器行为改变它）
	setInterval(setFavicon, 5000);
}
if (document.readyState === "loading")
	document.addEventListener("DOMContentLoaded", onLoad);
else
	onLoad();
