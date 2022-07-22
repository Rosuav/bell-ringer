//Intercept the copy action on Twitch pages to tidy up chat copy/paste

//Fold newlines and multiple spaces to single spaces. Broadly imitates
//the behaviour of CSS whitespace collapsing, on the assumption that it
//will be active for the text being copied. Set trailing_space to true
//if there is a space immediately preceding this text.
//Standards violation: This unconditionally transforms line breaks into
//spaces, without considering the surrounding text.
function fold_whitespace(s, trailing_space) {
	console.log({Fold: trailing_space}, s);
	s = s.replace(/[\n\t]+/g, " ");
	s = s.replace(/  +/g, " ");
	if (trailing_space && s.startsWith(" ")) return s.slice(1);
	return s;
}

document.oncopy = e => {
	const range = window.getSelection().getRangeAt(0);
	if (range.commonAncestorContainer.nodeType === 3) return; //Keep default behaviour if nothing but text selected (including if nothing is).
	if (!range.commonAncestorContainer.closest(".chat-list,.chat-list--default")) return; //Keep default behaviour if not in chat list.
	let start = range.startContainer, stop = range.endContainer;
	let text = "";
	let tipdepth = 0;
	function scanchildren(el) {
		if (!stop) return; //Time to halt, up all the levels of recursion.
		//Ignore all tooltips (but scan them for start/stop markers)
		const istooltip =
			el.getAttribute && el.getAttribute("role") === "tooltip" || //Anything with the ARIA role
			el.classList && el.classList.contains("bttv-tooltip"); //but BTTV doesn't use the role.
		if (istooltip) ++tipdepth;
		let curtext = tipdepth > 0 ? "" :
				el.nodeType === 1 && el.alt ? el.alt :
				el.nodeType === 3 ? el.data :
				"";
		if (el.classList) {
			if (el.classList.contains("chat-badge")) curtext = ""; //Ignore chat badges
			else if (el.classList.contains("chat-line__message") && !start) text += "\n"; //Separate chat lines with newlines
		}
		if (el === stop) curtext = curtext.slice(0, range.endOffset);
		if (!start) text += fold_whitespace(curtext, text.endsWith(" "));
		else if (el === start) {
			start = null;
			text = fold_whitespace(curtext.slice(range.startOffset), text.endsWith(" "));
		}
		if (el === stop) {
			//Iterate over some subset of the child nodes, then halt
			if (range.endOffset) [...el.childNodes].slice(0, range.endOffset).forEach(scanchildren);
			stop = null;
		} else el.childNodes.forEach(scanchildren);
		if (istooltip) --tipdepth;
	}
	scanchildren(range.commonAncestorContainer);
	e.clipboardData.setData("text/plain", text);
	e.preventDefault();
}
