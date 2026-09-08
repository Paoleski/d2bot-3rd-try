/**
*	@filename	ConsoleLog.js
*	@desc		Tee D2BS print() for every profile:
*	            logs/console.<profile>.log  +  logs/console.all.log
*/

var ConsoleLog = {
	installed: false,
	_origPrint: null,
	file: "",
	allFile: "logs/console.all.log",
	maxBytes: 3 * 1024 * 1024, // rotate when larger

	profileName: function () {
		try {
			if (typeof me !== "undefined" && me.profile) {
				return String(me.profile);
			}
		} catch (e0) {}

		return "unknown";
	},

	pathForProfile: function () {
		return "logs/console." + this.profileName().replace(/[^\w.\-]+/g, "_") + ".log";
	},

	appendOne: function (path, line, rotateBanner) {
		var existing;

		if (typeof FileTools === "undefined" || !path) {
			return;
		}

		if (typeof FileTools.appendText === "function") {
			if (FileTools.exists(path)) {
				try {
					existing = FileTools.readText(path);

					if (existing && existing.length > this.maxBytes) {
						FileTools.writeText(path, rotateBanner + line);
						return;
					}
				} catch (e1) {}
			}

			FileTools.appendText(path, line);
			return;
		}

		existing = FileTools.exists(path) ? FileTools.readText(path) : "";

		if (existing && existing.length > this.maxBytes) {
			existing = rotateBanner;
		}

		FileTools.writeText(path, existing + line);
	},

	append: function (msg) {
		var clean, line, banner, prof;

		try {
			if (!this.file) {
				this.file = this.pathForProfile();
			}

			prof = this.profileName();
			clean = String(msg).replace(/ÿc[0-9a-z!"+<:;.*]/gi, "");
			line = "[" + getTickCount() + "] <" + prof + "> " + clean + "\n";
			banner = "--- rotated " + getTickCount() + " ---\n";

			this.appendOne(this.file, line, banner);
			this.appendOne(this.allFile, line, banner);
		} catch (e2) {
			// never break the bot on log IO
		}
	},

	install: function () {
		var self = this;

		if (this.installed) {
			return true;
		}

		if (typeof print !== "function") {
			return false;
		}

		this._origPrint = print;
		this.file = this.pathForProfile();
		this.installed = true;

		print = function (msg) {
			self._origPrint(msg);
			self.append(msg);
		};

		print("ÿc2ConsoleLogÿc0 :: teeing prints → " + this.file + " + " + this.allFile);
		return true;
	}
};
