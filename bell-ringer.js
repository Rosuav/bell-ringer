let default_image = null;

function fix() {
	//Fix the document title, which should fix the tab hover text
	//console.log("Checking title", document.title);
	const m = /^\([0-9]+\) (.*)$/.exec(document.title);
	if (m) document.title = m[1];

	//Fix the tab icon
	const icon = document.querySelector("link[rel=icon]");
	if (!icon) return; //No notification icon found. As of 20220722 this whole patch may be unnecessary.
	//console.log("Checking icon", icon.href);
	if (icon.href.includes("notification"))
		icon.href = default_image || "favicon.ico";
	else
		default_image = icon.href; //Presume that anything that doesn't say "notification" should be kept.
}

fix(); //Do the fixes immediately on startup

//Also call fix() any time it appears that a notification has been
//posted. To notice this, we look for a change to the <title> node.
new MutationObserver(fix).observe(document.querySelector("title"), {childList: true});
