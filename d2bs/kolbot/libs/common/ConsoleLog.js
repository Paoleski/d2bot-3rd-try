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

	// Bytes written per path this session — rotation is decided from this counter,
	// NOT by re-reading the whole log on every print (that was up to 3 MB of I/O per line).
	_bytes: {},

	// One-time size probe per path (first print of the session)
	_sizeOf: function (path) {
		var existing;

		if (this._bytes[path] === undefined) {
			this._bytes[path] = 0;

			try {
				if (FileTools.exists(path)) {
					existing = FileTools.readText(path);
					this._bytes[path] = existing ? existing.length : 0;
				}
			} catch (e0) {}
		}

		return this._bytes[path];
	},

	appendOne: function (path, line, rotateBanner) {
		if (typeof FileTools === "undefined" || !path) {
			return;
		}

		if (this._sizeOf(path) > this.maxBytes) {
			FileTools.writeText(path, rotateBanner + line);
			this._bytes[path] = rotateBanner.length + line.length;
			return;
		}

		if (typeof FileTools.appendText === "function") {
			FileTools.appendText(path, line);
		} else {
			// No append API: read+write is unavoidable here
			FileTools.writeText(path, (FileTools.exists(path) ? FileTools.readText(path) : "") + line);
		}

		this._bytes[path] += line.length;
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

			// console.all.log is optional (Config.ConsoleLogAll) — halves log I/O per print
			if (typeof Config !== "undefined" && Config.ConsoleLogAll) {
				this.appendOne(this.allFile, line, banner);
			}
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
