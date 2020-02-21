function fix() {
	//Fix the document title, which should fix the tab hover text
	console.log("Checking title", document.title);
	const m = /^\([0-9]+\) (.*)$/.exec(document.title);
	if (m) document.title = m[1];

	//TODO: Fix the tab icon
}

fix(); //Do the fixes immediately on startup

//Also call fix() any time it appears that a notification has been
//posted. To notice this, we look for a change to the <title> node.
new MutationObserver(fix).observe(document.querySelector("title"), {childList: true});
