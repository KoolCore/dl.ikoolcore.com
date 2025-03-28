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

	function processTextWithMixedLanguages(text) {
		// Replace underscores with spaces first
		text = text === document.location.hostname ? "HOME" : text.replace(/_/g, " ");
		
		// If no Chinese characters, return as is with English language tag
		if (!hasChineseCharacters(text)) {
			let span = document.createElement("span");
			span.setAttribute("lang", "en");
			span.textContent = text;
			return span;
		}
		
		// If it has Chinese characters, process character by character
		const fragment = document.createDocumentFragment();
		let currentType = null;
		let currentSpan = null;
		
		for (let i = 0; i < text.length; i++) {
			const char = text[i];
			const isChinese = /[\u4E00-\u9FFF]/.test(char);
			const type = isChinese ? "zh" : "en";
			
			// If type changed or first character, create a new span
			if (type !== currentType) {
				currentType = type;
				currentSpan = document.createElement("span");
				currentSpan.setAttribute("lang", type);
				fragment.appendChild(currentSpan);
			}
			
			currentSpan.textContent += char;
		}
		
		return fragment;
	}

	function a(sp, href, text, cls, rel) {
		let r = document.createElement("a");
		
		// Process text with mixed languages
		const textContent = processTextWithMixedLanguages(text);
		r.appendChild(textContent);
		
		r.setAttribute("href", href);
		if (rel) r.setAttribute("rel", rel);
		if (cls) r.classList.add(cls);
		
		// We still keep this for backward compatibility
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
	const pullToRefresh = document.getElementById("pull-to-refresh");
	
	// 初始设置favicon
	setFavicon();
	
	// 初始化下拉刷新功能
	initPullToRefresh();
	
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
	
	// 初始化下拉刷新功能
	function initPullToRefresh() {
		// 检测是否为移动设备
		const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
		if (!isMobile) return;
		
		let touchStartY = 0;
		let touchEndY = 0;
		const threshold = 80; // 触发刷新的阈值
		let refreshing = false;
		
		// 处理触摸开始事件
		document.addEventListener('touchstart', function(e) {
			touchStartY = e.touches[0].clientY;
		}, { passive: true });
		
		// 处理触摸移动事件
		document.addEventListener('touchmove', function(e) {
			if (refreshing) return;
			
			// 只有当页面滚动到顶部时才处理下拉刷新
			if (window.scrollY <= 0) {
				touchEndY = e.touches[0].clientY;
				const distance = touchEndY - touchStartY;
				
				// 如果下拉距离足够，显示刷新指示器
				if (distance > 0 && distance < threshold) {
					pullToRefresh.style.transform = `translateY(${distance}px)`;
				}
			}
		}, { passive: true });
		
		// 处理触摸结束事件
		document.addEventListener('touchend', function(e) {
			if (refreshing) return;
			
			if (window.scrollY <= 0) {
				const distance = touchEndY - touchStartY;
				
				// 重置下拉指示器位置
				pullToRefresh.style.transform = '';
				
				// 如果下拉距离超过阈值，触发刷新
				if (distance > threshold) {
					refreshContent();
				}
			}
		}, { passive: true });
		
		// 特别处理iOS的Safari浏览器
		// Safari有自己的下拉刷新行为，我们需要覆盖它
		if (/iPhone|iPad|iPod/i.test(navigator.userAgent) && /Safari/i.test(navigator.userAgent)) {
			document.body.style.overscrollBehaviorY = 'none';
			
			// 添加额外的事件监听器来防止Safari的默认行为
			document.addEventListener('gesturestart', function(e) {
				e.preventDefault();
			}, { passive: false });
			
			// 处理iOS的滚动反弹效果
			document.addEventListener('scroll', function() {
				if (window.scrollY < 0) {
					document.body.style.transform = `translateY(${Math.abs(window.scrollY)}px)`;
				} else {
					document.body.style.transform = '';
				}
			}, { passive: true });
		}
		
		// 刷新内容的函数
		function refreshContent() {
			refreshing = true;
			pullToRefresh.classList.add('visible');
			
			// 重新加载当前页面内容
			setPath(path, files, q, document.location.pathname, document.location.search);
			
			// 模拟加载时间，然后隐藏刷新指示器
			setTimeout(function() {
				pullToRefresh.classList.remove('visible');
				refreshing = false;
			}, 1500);
		}
	}
}

if (document.readyState === "loading")
	document.addEventListener("DOMContentLoaded", onLoad);
else
	onLoad();
