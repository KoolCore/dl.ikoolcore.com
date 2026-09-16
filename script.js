"use strict";

const SEARCH_PATTERN = /[?&]q=([^&]+)/;
const DIRECTORY_PRESENTATION = {
	bios: { description: "Firmware releases, update packages and release notes." },
	firmware: { description: "Firmware images and release packages for supported systems." },
	drivers: { description: "Network, storage, graphics and platform drivers." },
	driver: { description: "Hardware drivers and compatibility packages." },
	manuals: { description: "User guides, quick-start documents and technical references." },
	manual: { description: "User guides, quick-start documents and technical references." },
	documents: { description: "Technical documents, guides and reference material." }
};

const FILE_PRESENTATION = {
	pdf: { type: "PDF", description: "PDF documentation and technical reference." },
	zip: { type: "Archive", description: "Compressed driver or firmware package." },
	rar: { type: "Archive", description: "Compressed resource package." },
	"7z": { type: "Archive", description: "Compressed resource package." },
	bin: { type: "Firmware", description: "Firmware binary image for supported hardware." },
	exe: { type: "Installer", description: "Windows installation or update utility." },
	bat: { type: "Script", description: "Windows automation or deployment script." },
	iso: { type: "Image", description: "Disc image containing system software." },
	img: { type: "Image", description: "Disk or system image file." },
	txt: { type: "Text", description: "Plain text release or configuration information." },
	log: { type: "Log", description: "System log or diagnostic output." },
	ini: { type: "Config", description: "Configuration file for supported software." },
	doc: { type: "Document", description: "Editable technical document." },
	docx: { type: "Document", description: "Editable technical document." },
	xls: { type: "Spreadsheet", description: "Tabular compatibility or reference data." },
	xlsx: { type: "Spreadsheet", description: "Tabular compatibility or reference data." },
	md: { type: "Markdown", description: "Structured technical notes or documentation." }
};

function safeDecode(value) {
	try {
		return decodeURIComponent(value);
	} catch (error) {
		return value;
	}
}

function normalizePath(pathname) {
	return (pathname || "/")
		.split("/")
		.filter(Boolean)
		.map(safeDecode);
}

function hasChineseCharacters(value) {
	return /[\u4E00-\u9FFF]/.test(value);
}

function processTextWithMixedLanguages(value) {
	const text = value === document.location.hostname ? "HOME" : value.replace(/_/g, " ");
	const fragment = document.createDocumentFragment();

	if (!hasChineseCharacters(text)) {
		const span = document.createElement("span");
		span.lang = "en";
		span.textContent = text;
		fragment.appendChild(span);
		return fragment;
	}

	let currentLanguage = null;
	let currentSpan = null;

	for (const character of text) {
		const language = /[\u4E00-\u9FFF]/.test(character) ? "zh" : "en";
		if (language !== currentLanguage) {
			currentLanguage = language;
			currentSpan = document.createElement("span");
			currentSpan.lang = language;
			fragment.appendChild(currentSpan);
		}
		currentSpan.textContent += character;
	}

	return fragment;
}

function createArrowIcon(kind) {
	const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
	svg.setAttribute("viewBox", "0 0 24 24");
	svg.setAttribute("aria-hidden", "true");
	const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
	path.setAttribute("d", kind === "download" ? "M12 3v12m-5-5 5 5 5-5M5 21h14" : "M5 12h14m-5-5 5 5-5 5");
	svg.appendChild(path);
	return svg;
}

function createNavLink(href, text, className) {
	const link = document.createElement("a");
	link.href = href;
	if (className) link.className = className;
	link.appendChild(processTextWithMixedLanguages(text));
	if (href !== "/") {
		link.addEventListener("click", function (event) {
			event.preventDefault();
			setPath(document.getElementById("path"), document.getElementById("files"), document.getElementById("q"), href, "");
		});
	}
	return link;
}

function formatFileSize(bytes) {
	if (!Number.isFinite(bytes) || bytes < 0) return "";
	if (bytes === 0) return "0 B";
	const units = ["B", "KB", "MB", "GB", "TB"];
	const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
	const value = bytes / Math.pow(1024, index);
	const decimals = index === 0 || value >= 10 ? 0 : 1;
	return value.toFixed(decimals) + " " + units[index];
}

function formatDate(value, shortFormat) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("en", shortFormat ? {
		year: "numeric",
		month: "short",
		day: "numeric"
	} : {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit"
	}).format(date);
}

function getFileExtension(name) {
	const parts = name.split(".");
	return parts.length > 1 ? parts.pop().toLowerCase() : "";
}

function getDirectoryDescription(name) {
	const key = name.toLowerCase();
	for (const candidate in DIRECTORY_PRESENTATION) {
		if (key.includes(candidate)) return DIRECTORY_PRESENTATION[candidate].description;
	}
	return "Browse the files and subdirectories in this resource group.";
}

function getDirectoryClass(name) {
	const key = name.toLowerCase();
	if (key.includes("bios") || key.includes("firmware")) return "dir-bios";
	if (key.includes("driver")) return "dir-drivers";
	if (key.includes("manual") || key.includes("guide")) return "dir-manuals";
	return "";
}

function createResourceLink(item, href, rowIndex) {
	const isDirectory = item.type === "directory";
	const extension = isDirectory ? "" : getFileExtension(item.name);
	const presentation = FILE_PRESENTATION[extension] || {
		type: extension ? extension.toUpperCase() : "File",
		description: "Downloadable technical resource."
	};
	const dateLabel = formatDate(item.lastModified, true);
	const sizeLabel = formatFileSize(item.size);

	const link = document.createElement("a");
	link.href = href;
	link.style.setProperty("--row-index", String(rowIndex));
	link.className = isDirectory ? "d" : "f";
	if (isDirectory) {
		const directoryClass = getDirectoryClass(item.name);
		if (directoryClass) directoryClass.split(" ").forEach((value) => link.classList.add(value));
	} else {
		link.rel = "nofollow";
	}

	const copy = document.createElement("span");
	copy.className = "resource-copy";
	const title = document.createElement("strong");
	title.appendChild(processTextWithMixedLanguages(item.name));
	const description = document.createElement("span");
	description.textContent = isDirectory ? getDirectoryDescription(item.name) : presentation.description;
	copy.append(title, description);

	const type = document.createElement("span");
	type.className = "resource-type";
	type.textContent = isDirectory ? "Folder" : presentation.type;

	const meta = document.createElement("span");
	meta.className = "resource-meta";
	meta.textContent = isDirectory
		? (dateLabel ? "Updated " + dateLabel : "Resource folder")
		: [sizeLabel, dateLabel ? "Updated " + dateLabel : ""].filter(Boolean).join(" · ");

	const action = document.createElement("span");
	action.className = "resource-action";
	action.append(document.createTextNode(isDirectory ? "Open" : "Download"), createArrowIcon(isDirectory ? "open" : "download"));

	link.append(copy, type, meta, action);
	link.setAttribute("aria-label", item.name + ", " + (isDirectory ? "open folder" : "download file"));

	if (isDirectory) {
		link.addEventListener("click", function (event) {
			event.preventDefault();
			setPath(document.getElementById("path"), document.getElementById("files"), document.getElementById("q"), href, "");
		});
	}

	return link;
}

function updateOverview(items, segments, searchTerm) {
	const count = document.getElementById("metric-resource-count");
	const countLabel = document.getElementById("metric-resource-label");
	const updated = document.getElementById("metric-updated");
	const resultCount = document.getElementById("result-count");
	const searchContext = document.getElementById("search-context");

	if (count) count.textContent = String(items.length).padStart(2, "0");
	if (countLabel) {
		countLabel.textContent = searchTerm
			? "Matching resources"
			: segments.length
				? "Entries in this folder"
				: "Root resource groups";
	}
	if (resultCount) {
		resultCount.textContent = items.length + (items.length === 1 ? " resource" : " resources");
	}
	if (searchContext) {
		searchContext.textContent = "Scope: " + (segments.length ? segments.join(" / ") : "entire library");
	}

	if (updated) {
		const latestTimestamp = items.reduce((latest, item) => {
			const timestamp = new Date(item.lastModified).getTime();
			return Number.isFinite(timestamp) && timestamp > latest ? timestamp : latest;
		}, 0);
		updated.textContent = latestTimestamp ? formatDate(latestTimestamp, true) : "--";
	}
}

function renderMessage(files, message, className) {
	const item = document.createElement("li");
	item.className = className;
	item.textContent = message;
	files.replaceChildren(item);
}

function updateSearchClearButton(input, button) {
	if (button) button.hidden = !input.value.trim();
}

function setPath(crumbs, files, q, path, query) {
	const segments = normalizePath(path);
	const normalizedPath = segments.length ? "/" + segments.map(encodeURIComponent).join("/") : "/";
	const nextQuery = query || "";
	const nextUrl = normalizedPath + nextQuery;

	if (document.location.pathname + document.location.search !== nextUrl) {
		history.pushState({}, document.title, nextUrl);
	}

	document.body.classList.add("loading");
	files.setAttribute("aria-busy", "true");
	const resultCount = document.getElementById("result-count");
	if (resultCount) resultCount.textContent = "Indexing resources";
	window.scrollTo({ top: 0, behavior: "smooth" });

	const queryParams = new URLSearchParams(nextQuery);
	const searchTerm = queryParams.get("q") || "";

	crumbs.replaceChildren();
	const crumbFragment = document.createDocumentFragment();
	const homeItem = document.createElement("li");
	homeItem.appendChild(createNavLink("/", document.location.hostname, ""));
	crumbFragment.appendChild(homeItem);

	if (!segments.length) {
		const item = document.createElement("li");
		const current = document.createElement("span");
		current.textContent = searchTerm ? "Search: " + searchTerm : "All resources";
		item.appendChild(current);
		crumbFragment.appendChild(item);
	} else {
		segments.forEach((segment, index) => {
			const item = document.createElement("li");
			const isLast = index === segments.length - 1 && !searchTerm;
			if (isLast) {
				const current = document.createElement("span");
				current.appendChild(processTextWithMixedLanguages(segment));
				item.appendChild(current);
			} else {
				const href = "/" + segments.slice(0, index + 1).map(encodeURIComponent).join("/");
				item.appendChild(createNavLink(href, segment, ""));
			}
			crumbFragment.appendChild(item);
		});

		if (searchTerm) {
			const item = document.createElement("li");
			const current = document.createElement("span");
			current.textContent = "Search: " + searchTerm;
			item.appendChild(current);
			crumbFragment.appendChild(item);
		}
	}
	crumbs.appendChild(crumbFragment);
	q.value = searchTerm;
	updateSearchClearButton(q, document.getElementById("clear-search"));

	const request = new XMLHttpRequest();
	request.onreadystatechange = function () {
		if (this.readyState !== 4) return;

		document.body.classList.remove("loading");
		files.setAttribute("aria-busy", "false");

		if (this.status !== 200) {
			renderMessage(files, this.status === 404 ? "This resource location could not be found." : "The library could not be loaded. Please try again.", "error");
			if (resultCount) resultCount.textContent = "Unavailable";
			return;
		}

		let items;
		try {
			items = JSON.parse(this.responseText || "[]");
		} catch (error) {
			renderMessage(files, "The library returned an invalid response.", "error");
			if (resultCount) resultCount.textContent = "Unavailable";
			return;
		}

		const fragment = document.createDocumentFragment();
		let rowIndex = 0;

		if (segments.length && !searchTerm) {
			const parentSegments = segments.slice(0, -1);
			const parentHref = parentSegments.length ? "/" + parentSegments.map(encodeURIComponent).join("/") : "/";
			const backLink = document.createElement("a");
			backLink.href = parentHref;
			backLink.className = "u";
			const backCopy = document.createElement("span");
			backCopy.className = "resource-copy";
			const backTitle = document.createElement("strong");
			backTitle.textContent = "Back to parent directory";
			backCopy.appendChild(backTitle);
			const backAction = document.createElement("span");
			backAction.className = "resource-action";
			backAction.append(document.createTextNode("Back"), createArrowIcon("open"));
			backLink.append(backCopy, backAction);
			backLink.addEventListener("click", function (event) {
				event.preventDefault();
				setPath(crumbs, files, q, parentHref, "");
			});
			const backItem = document.createElement("li");
			backItem.style.setProperty("--row-index", String(rowIndex++));
			backItem.appendChild(backLink);
			fragment.appendChild(backItem);
		}

		items.forEach((item) => {
			const itemSegments = segments.concat(item.name);
			const encodedPath = itemSegments.map(encodeURIComponent).join("/");
			const href = item.type === "directory" ? "/" + encodedPath : "/dl/" + encodedPath;
			const listItem = document.createElement("li");
			listItem.style.setProperty("--row-index", String(rowIndex++));
			listItem.appendChild(createResourceLink(item, href, rowIndex));
			fragment.appendChild(listItem);
		});

		if (fragment.childNodes.length) {
			files.replaceChildren(fragment);
		} else {
			renderMessage(files, searchTerm ? "No resources match this search." : "No files are available in this location.", "no-results");
		}

		updateOverview(items, segments, searchTerm);
	};

	const apiPath = "/idx/" + segments.map(encodeURIComponent).join("/") + (segments.length ? "/" : "");
	request.open("GET", apiPath + nextQuery, true);
	request.send();
}

function setFavicon() {
	if (document.querySelector('link[rel="shortcut icon"][href="/favicon.png"]')) return;
	const existingIcons = document.querySelectorAll('link[rel*="icon"]');
	existingIcons.forEach((icon) => icon.remove());
	const link = document.createElement("link");
	link.rel = "shortcut icon";
	link.href = "/favicon.png";
	link.type = "image/png";
	document.head.appendChild(link);
}

function initThemeToggle() {
	const toggle = document.getElementById("theme-toggle");
	if (!toggle) return;

	const syncThemeState = () => {
		const isDark = document.documentElement.dataset.theme === "dark";
		toggle.setAttribute("aria-pressed", String(isDark));
		toggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
	};

	syncThemeState();
	toggle.addEventListener("click", function () {
		const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
		document.documentElement.dataset.theme = nextTheme;
		try {
			localStorage.setItem("ikoolcore-theme", nextTheme);
		} catch (error) {
			// Theme persistence is optional.
		}
		syncThemeState();
	});
}

function initPullToRefresh(refresh) {
	const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	if (!isMobile) return;

	let startY = 0;
	let pullDistance = 0;
	let refreshing = false;
	const threshold = 78;

	document.addEventListener("touchstart", function (event) {
		if (window.scrollY <= 0 && !refreshing) startY = event.touches[0].clientY;
	}, { passive: true });

	document.addEventListener("touchmove", function (event) {
		if (refreshing || window.scrollY > 0) return;
		pullDistance = Math.max(0, event.touches[0].clientY - startY);
		if (pullDistance > 18) refresh.classList.toggle("visible", pullDistance >= threshold);
	}, { passive: true });

	document.addEventListener("touchend", function () {
		if (refreshing) return;
		const shouldRefresh = pullDistance >= threshold;
		pullDistance = 0;
		if (!shouldRefresh) {
			refresh.classList.remove("visible");
			return;
		}

		refreshing = true;
		refresh.classList.add("visible");
		setPath(document.getElementById("path"), document.getElementById("files"), document.getElementById("q"), document.location.pathname, document.location.search);
		window.setTimeout(function () {
			refresh.classList.remove("visible");
			refreshing = false;
		}, 900);
	}, { passive: true });
}

function onLoad() {
	const path = document.getElementById("path");
	const files = document.getElementById("files");
	const search = document.getElementById("search");
	const q = document.getElementById("q");
	const clearSearch = document.getElementById("clear-search");
	const refresh = document.getElementById("pull-to-refresh");
	const currentYear = document.getElementById("current-year");

	setFavicon();
	initThemeToggle();
	initPullToRefresh(refresh);
	setPath(path, files, q, document.location.pathname, document.location.search);

	if (currentYear) currentYear.textContent = String(new Date().getFullYear());

	window.addEventListener("popstate", function () {
		setPath(path, files, q, document.location.pathname, document.location.search);
	});

	search.addEventListener("submit", function (event) {
		event.preventDefault();
		const value = q.value.trim();
		const query = value ? "?r=1&q=" + encodeURIComponent(value) : "";
		setPath(path, files, q, document.location.pathname, query);
	});

	q.addEventListener("input", function () {
		updateSearchClearButton(q, clearSearch);
	});

	clearSearch.addEventListener("click", function () {
		q.value = "";
		updateSearchClearButton(q, clearSearch);
		if (new URLSearchParams(document.location.search).has("q")) {
			setPath(path, files, q, document.location.pathname, "");
		}
		q.focus();
	});

	document.addEventListener("keydown", function (event) {
		const target = event.target;
		const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable;
		if (event.key === "/" && !isTyping) {
			event.preventDefault();
			q.focus();
		}
		if (event.key === "Escape" && target === q && q.value) {
			q.value = "";
			updateSearchClearButton(q, clearSearch);
		}
	});
}

if (document.readyState === "loading") {
	document.addEventListener("DOMContentLoaded", onLoad);
} else {
	onLoad();
}
