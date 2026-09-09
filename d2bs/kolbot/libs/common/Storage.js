/**
*	@filename	Storage.js
*	@author		McGod, kolton (small kolbot related edits)
*	@desc		manage inventory, belt, stash, cube
*/

if (typeof QuestItems === "undefined") {
	if (!isIncluded("common/QuestItems.js")) {
		include("common/QuestItems.js");
	}
}

var Container = function (name, width, height, location) {
	var h, w;

	this.name = name;
	this.width = width;
	this.height = height;
	this.location = location;
	this.buffer = [];
	this.itemList = [];
	this.openPositions = this.height * this.width;

	// Initalize the buffer array for use, set all as empty.
	for (h = 0; h < this.height; h += 1) {
		this.buffer.push([]);

		for (w = 0; w < this.width; w += 1) {
			this.buffer[h][w] = 0;
		}
	}

	/* Container.Mark(item)
	 *	Marks the item in the buffer, and adds it to the item list.
	 */
	this.Mark = function (item) {
		var x, y;

		//Make sure it is in this container.
		if (item.location !== this.location || item.mode !== 0) {
			return false;
		}

		if (item.x === undefined || item.y === undefined || !item.sizex || !item.sizey) {
			return false;
		}

		// Skip items outside container (wrong size vs PD2 / bad coords) — check bounds before buffer access
		if (item.x < 0 || item.y < 0 ||
				(item.x + item.sizex) > this.width ||
				(item.y + item.sizey) > this.height) {
			return false;
		}

		for (x = item.x; x < (item.x + item.sizex); x += 1) {
			for (y = item.y; y < (item.y + item.sizey); y += 1) {
				this.buffer[y][x] = this.itemList.length + 1;
				this.openPositions -= 1;
			}
		}

		//Add item to list.
		this.itemList.push(copyUnit(item));

		return true;
	};

	/* Container.isLocked(item)
	 *	Checks if the item is in a locked spot
	 */
	this.IsLocked = function (item, baseRef) {
		var h, w, reference;

		reference = baseRef.slice(0);

		//Make sure it is in this container.
		if (item.mode !== 0 || item.location !== this.location) {
			return false;
		}

		// Make sure the item is ours
		if (!item.getParent() || item.getParent().type !== me.type || item.getParent().gid !== me.gid) {
			return false;
		}

		//Insure valid reference.
		if (typeof (reference) !== "object" || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
			throw new Error("Storage.IsLocked: Invalid inventory reference");
		}

		try {
			// Check if the item lies in a locked spot.
			for (h = item.y; h < (item.y + item.sizey); h += 1) {
				for (w = item.x; w < (item.x + item.sizex); w += 1) {
					if (reference[h][w] === 0) {
						return true;
					}
				}
			}
		} catch (e2) {
			throw new Error("Storage.IsLocked error! Item info: " + item.name + " " + item.y + " " + item.sizey + " " + item.x + " " + item.sizex + " " + item.mode + " " + item.location);
		}

		return false;
	};

	this.Reset = function () {
		var h, w;

		for (h = 0; h < this.height; h += 1) {
			for (w = 0; w < this.width; w += 1) {
				this.buffer[h][w] = 0;
			}
		}

		this.itemList = [];
		return true;
	};

	/* Container.CanFit(item)
	 *	Checks to see if we can fit the item in the buffer.
	 */
	this.CanFit = function (item) {
		return (!!this.FindSpot(item));
	};

	/* Container.FindSpot(item)
	 *	Finds a spot available in the buffer to place the item.
	 */
	this.FindSpot = function (item) {
		var x, y, nx, ny, sx, sy;

		// Valid unit with size — stale cursor/copyUnits trip Strict Warning otherwise
		if (!item || typeof item.sizex !== "number" || typeof item.sizey !== "number") {
			return false;
		}

		sx = item.sizex;
		sy = item.sizey;

		if (sx < 1 || sy < 1) {
			return false;
		}

		Storage.ReloadIfDirty();

		//Loop buffer looking for spot to place item.
		for (y = 0; y < this.width - (sx - 1); y += 1) {
Loop:
			for (x = 0; x < this.height - (sy - 1); x += 1) {
				//Check if there is something in this spot.
				if (this.buffer[x][y] > 0) {
					continue;
				}

				//Loop the item size to make sure we can fit it.
				for (nx = 0; nx < sy; nx += 1) {
					for (ny = 0; ny < sx; ny += 1) {
						if (this.buffer[x + nx][y + ny]) {
							continue Loop;
						}
					}
				}

				return ({x: x, y: y});
			}
		}

		return false;
	};

	/* Container.FindSpotInRows(item, minRow, maxRow)
	 *	Find a free rectangle with top row in [minRow, maxRow - sizey + 1].
	 */
	this.FindSpotInRows = function (item, minRow, maxRow) {
		var x, y, nx, ny, sx, sy, rowStart, rowEnd;

		if (!item || typeof item.sizex !== "number" || typeof item.sizey !== "number") {
			return false;
		}

		sx = item.sizex;
		sy = item.sizey;

		if (sx < 1 || sy < 1) {
			return false;
		}

		if (minRow === undefined) {
			minRow = 0;
		}

		if (maxRow === undefined) {
			maxRow = this.height - 1;
		}

		rowStart = minRow;
		rowEnd = maxRow - (sy - 1);

		if (rowEnd < rowStart) {
			return false;
		}

		Storage.ReloadIfDirty();

		for (y = 0; y < this.width - (sx - 1); y += 1) {
Loop:
			for (x = rowStart; x <= rowEnd; x += 1) {
				if (this.buffer[x][y] > 0) {
					continue;
				}

				for (nx = 0; nx < sy; nx += 1) {
					for (ny = 0; ny < sx; ny += 1) {
						if (this.buffer[x + nx][y + ny]) {
							continue Loop;
						}
					}
				}

				return ({x: x, y: y});
			}
		}

		return false;
	};

	/* Container.FindSpotExcluding(item, exclude, placeBounds)
	 *	Like FindSpot, but:
	 *	- cells inside exclude {x:row, y:col, sizex, sizey} are blocked
	 *	- cells currently occupied by item (when relocating in-container) are free
	 *	- optional placeBounds {minRow, maxRow} limits where the item may land
	 */
	this.FindSpotExcluding = function (item, exclude, placeBounds) {
		var x, y, nx, ny, sx, sy, row, col, blocked, rowStart, rowEnd;

		if (!item || typeof item.sizex !== "number" || typeof item.sizey !== "number") {
			return false;
		}

		sx = item.sizex;
		sy = item.sizey;

		if (sx < 1 || sy < 1) {
			return false;
		}

		rowStart = 0;
		rowEnd = this.height - sy;

		if (placeBounds) {
			if (placeBounds.minRow !== undefined) {
				rowStart = placeBounds.minRow;
			}

			if (placeBounds.maxRow !== undefined) {
				rowEnd = placeBounds.maxRow - (sy - 1);
			}
		}

		if (rowEnd < rowStart) {
			return false;
		}

		Storage.ReloadIfDirty();

		for (y = 0; y < this.width - (sx - 1); y += 1) {
Loop:
			for (x = rowStart; x <= rowEnd; x += 1) {
				for (nx = 0; nx < sy; nx += 1) {
					for (ny = 0; ny < sx; ny += 1) {
						row = x + nx;
						col = y + ny;
						blocked = false;

						if (exclude &&
								row >= exclude.x && row < exclude.x + exclude.sizey &&
								col >= exclude.y && col < exclude.y + exclude.sizex) {
							blocked = true;
						} else if (this.buffer[row][col] > 0) {
							// Own footprint is free (item is being relocated)
							if (!(item.location === this.location && item.mode === 0 &&
									col >= item.x && col < item.x + item.sizex &&
									row >= item.y && row < item.y + item.sizey)) {
								blocked = true;
							}
						}

						if (blocked) {
							continue Loop;
						}
					}
				}

				return ({x: x, y: y});
			}
		}

		return false;
	};

	/* Container.MakeRoom(item, maxMoves, bounds)
	 *	Shuffle existing items within this container so item can fit.
	 *	Non-destructive — never sells/drops.
	 *	bounds (optional): {minRow, maxRow, relocateMinRow, relocateMaxRow}
	 *	  — only clear a spot in [minRow,maxRow]; relocate blockers into relocate* rows
	 *	  (defaults to same as min/max when set). Without bounds, uses full CanFit.
	 */
	this.MakeRoom = function (item, maxMoves, bounds) {
		var sx, sy, need, free, h, w, candidates, row, col, r, c, idx, blockers,
			seen, i, cand, live, spot, nDelay, moves, cursor,
			minRow, maxRow, relMin, relMax, placeBounds, self = this;

		if (maxMoves === undefined) {
			maxMoves = 6;
		}

		if (!item || typeof item.sizex !== "number" || typeof item.sizey !== "number") {
			return false;
		}

		sx = item.sizex;
		sy = item.sizey;

		if (sx < 1 || sy < 1) {
			return false;
		}

		minRow = 0;
		maxRow = this.height - 1;
		relMin = 0;
		relMax = this.height - 1;

		if (bounds) {
			if (bounds.minRow !== undefined) {
				minRow = bounds.minRow;
			}

			if (bounds.maxRow !== undefined) {
				maxRow = bounds.maxRow;
			}

			relMin = (bounds.relocateMinRow !== undefined) ? bounds.relocateMinRow : minRow;
			relMax = (bounds.relocateMaxRow !== undefined) ? bounds.relocateMaxRow : maxRow;
		}

		placeBounds = {minRow: relMin, maxRow: relMax};

		function fitsTarget() {
			if (bounds) {
				return !!self.FindSpotInRows(item, minRow, maxRow);
			}

			return self.CanFit(item);
		}

		Storage.ReloadIfDirty();

		if (fitsTarget()) {
			return true;
		}

		need = sx * sy;
		free = 0;

		for (h = minRow; h <= maxRow; h += 1) {
			for (w = 0; w < this.width; w += 1) {
				if (this.buffer[h][w] === 0) {
					free += 1;
				}
			}
		}

		if (free < need) {
			return false;
		}

		candidates = [];

		for (col = 0; col <= this.width - sx; col += 1) {
			for (row = minRow; row <= maxRow - (sy - 1); row += 1) {
				blockers = [];
				seen = {};

				for (r = 0; r < sy; r += 1) {
					for (c = 0; c < sx; c += 1) {
						idx = this.buffer[row + r][col + c];

						if (idx > 0 && !seen[idx]) {
							seen[idx] = true;
							blockers.push(this.itemList[idx - 1]);
						}
					}
				}

				if (blockers.length > 0 && blockers.length <= maxMoves) {
					candidates.push({x: row, y: col, sizex: sx, sizey: sy, count: blockers.length});
				}
			}
		}

		candidates.sort(function (a, b) {
			return a.count - b.count;
		});

		for (i = 0; i < candidates.length; i += 1) {
			cand = candidates[i];
			moves = 0;

			while (moves < maxMoves) {
				Storage.Reload();

				if (fitsTarget()) {
					if (moves > 0) {
						print("ÿc2Storageÿc0 :: MakeRoom cleared space for " + (item.name || ("#" + item.classid)) +
							" (" + moves + " move" + (moves === 1 ? "" : "s") + ")");
					}

					return true;
				}

				blockers = [];
				seen = {};

				for (r = 0; r < cand.sizey; r += 1) {
					for (c = 0; c < cand.sizex; c += 1) {
						idx = this.buffer[cand.x + r][cand.y + c];

						if (idx > 0 && !seen[idx]) {
							seen[idx] = true;
							blockers.push(this.itemList[idx - 1]);
						}
					}
				}

				if (!blockers.length) {
					return fitsTarget();
				}

				if (blockers.length > maxMoves - moves) {
					break;
				}

				live = me.getItem(-1, -1, blockers[0].gid);

				if (!live || live.location !== this.location || live.mode !== 0) {
					break;
				}

				spot = this.FindSpotExcluding(live, cand, placeBounds);

				if (!spot) {
					break;
				}

				if (me.itemoncursor || !live.toCursor()) {
					break;
				}

				clickItem(0, spot.y, spot.x, this.location);

				nDelay = getTickCount();

				while ((getTickCount() - nDelay) < Math.max(1000, me.ping * 3 + 500)) {
					if (!me.itemoncursor) {
						break;
					}

					delay(10);
				}

				if (me.itemoncursor) {
					cursor = getUnit(100);

					if (cursor) {
						this.MoveTo(cursor);
					}

					break;
				}

				Storage.markDirty();
				moves += 1;
			}

			Storage.Reload();

			if (fitsTarget()) {
				print("ÿc2Storageÿc0 :: MakeRoom cleared space for " + (item.name || ("#" + item.classid)) +
					" (" + moves + " move" + (moves === 1 ? "" : "s") + ")");

				return true;
			}
		}

		return false;
	};

	/* Container.MoveTo(item)
	 *	Takes any item and moves it into given buffer.
	 */
	this.MoveTo = function (item) {
		var nPos, n, nDelay, cItem, cube;

		try {
			//Can we even fit it in here?
			nPos = this.FindSpot(item);

			if (!nPos) {
				return false;
			}

			//Cube -> Stash, must place item in inventory first
			if (item.location === 6 && this.location === 7 && !Storage.Inventory.MoveTo(item)) {
				return false;
			}

			//Can't deal with items on ground!
			if (item.mode === 3) {
				return false;
			}

			//Item already on the cursor.
			if (me.itemoncursor && item.mode !== 4) {
				return false;
			}

			//Make sure stash is open
			if (this.location === 7 && !Town.openStash()) {
				return false;
			}

			//Pick to cursor if not already.
			if (!item.toCursor()) {
				return false;
			}

			//Loop three times to try and place it.
			for (n = 0; n < 5; n += 1) {
				if (this.location === 6) { // place item into cube
					cItem = getUnit(100);
					cube = (typeof QuestItems !== "undefined" && typeof QuestItems.getCube === "function") ?
						QuestItems.getCube() : (me.getItem("box") || me.getItem(566));

					if (!cube) {
						print("ÿc1Storage.MoveToÿc0 :: no Horadric Cube (box/566)");

						return false;
					}

					if (cItem !== null && cube !== null) {
						sendPacket(1, 0x2a, 4, cItem.gid, 4, cube.gid);
					}
				} else {
					clickItem(0, nPos.y, nPos.x, this.location);
				}

				nDelay = getTickCount();

				while ((getTickCount() - nDelay) < Math.max(1000, me.ping * 3 + 500)) {
					if (!me.itemoncursor) {
						print("Successfully placed " + item.name + " at X: " + nPos.x + " Y: " + nPos.y);
						delay(200);
						Storage.markDirty();

						return true;
					}

					delay(10);
				}
			}

			// Still on cursor = failed (old code returned true and broke the next MoveTo)
			if (!me.itemoncursor) {
				Storage.markDirty();
			}

			return !me.itemoncursor;
		} catch (e) {
			return false;
		}
	};

	/* Container.Dump()
	 *	Prints all known information about container.
	 */
	this.Dump = function () {
		var x, y, string;

		print(this.name + " has the width of " + this.width + " and the height of " + this.height);
		print(this.name + " has " + this.itemList.length + " items inside, and has " + this.openPositions + " spots left.");

		for (x = 0; x < this.height; x += 1) {
			string = "";

			for (y = 0; y < this.width; y += 1) {
				string += (this.buffer[x][y] > 0) ? "ÿc1x" : "ÿc0o";
			}

			print(string);
		}
	};

	/* Container.UsedSpacePercent()
	 *	Returns percentage of the container used.
	 */
	this.UsedSpacePercent = function () {
		var x, y,
			usedSpace = 0,
			totalSpace = this.height * this.width;

		Storage.ReloadIfDirty();

		for (x = 0; x < this.height; x += 1) {
			for (y = 0; y < this.width; y += 1) {
				if (this.buffer[x][y] > 0) {
					usedSpace += 1;
				}
			}
		}

		return usedSpace * 100 / totalSpace;
	};

	/* Container.compare(reference)
	 *	Compare given container versus the current one, return all new items in current buffer.
	 */
	this.Compare = function (baseRef) {
		var h, w, n, item, itemList, reference;

		Storage.ReloadIfDirty();

		try {
			itemList = [];
			reference = baseRef.slice(0, baseRef.length);

			//Insure valid reference.
			if (typeof (reference) !== "object" || reference.length !== this.buffer.length || reference[0].length !== this.buffer[0].length) {
				throw new Error("Unable to compare different containers.");
			}

			for (h = 0; h < this.height; h += 1) {
Loop:
				for (w = 0; w < this.width; w += 1) {
					item = this.itemList[this.buffer[h][w] - 1];

					if (!item) {
						continue;
					}

					for (n = 0; n < itemList.length; n += 1) {
						if (itemList[n].gid === item.gid) {
							continue Loop;
						}
					}

					//Check if the buffers changed and the current buffer has an item there.
					if (this.buffer[h][w] > 0 && reference[h][w] > 0) {
						itemList.push(copyUnit(item));
					}
				}
			}

			return itemList;
		} catch (e) {
			return false;
		}
	};

	this.toSource = function () {
		return this.buffer.toSource();
	};
};

var Storage = new function () {
	this.dirty = true;
	this.lastReload = 0;
	this.RELOAD_MAX_AGE = 500; // ms — force refresh even if not marked dirty

	this.Init = function () {
		// PD2 sizes (classic LoD is inventory 10x4, stash 6x8, cube 3x4)
		this.StashY = 15;
		this.Inventory = new Container("Inventory", 10, 8, 3);
		this.TradeScreen = new Container("Inventory", 10, 8, 5);
		this.Stash = new Container("Stash", 10, this.StashY, 7);
		this.Belt = new Container("Belt", 4 * this.BeltSize(), 1, 2);
		this.Cube = new Container("Horadric Cube", 4, 4, 6);
		this.InvRef = [];

		this.Reload();
	};

	// Call after pick / sell / equip / cube / any storage change outside MoveTo
	this.markDirty = function () {
		this.dirty = true;

		if (typeof Runewords !== "undefined" && typeof Runewords.invalidateCache === "function") {
			try {
				Runewords.invalidateCache();
			} catch (eInv) {}
		}
	};

	// Used by FindSpot / CanFit / Compare — avoid full me.getItem walk every call
	this.ReloadIfDirty = function () {
		var now = getTickCount();

		if (!this.dirty && this.lastReload && (now - this.lastReload) < this.RELOAD_MAX_AGE) {
			return true;
		}

		return this.Reload();
	};

	this.BeltSize = function () {
		var item = me.getItem(-1, 1); // get equipped item

		if (!item) { // nothing equipped
			return 1;
		}

		do {
			if (item.bodylocation === 8) { // belt slot
				switch (item.code) {
				case "lbl": // sash
				case "vbl": // light belt
					return 2;
				case "mbl": // belt
				case "tbl": // heavy belt
					return 3;
				default: // everything else
					return 4;
				}
			}
		} while (item.getNext());

		return 1; // no belt
	};

	this.Reload = function () {
		this.Inventory.Reset();
		this.Stash.Reset();
		this.Belt.Reset();
		this.Cube.Reset();
		this.TradeScreen.Reset();

		var item = me.getItem();

		if (!item) {
			this.dirty = false;
			this.lastReload = getTickCount();
			return false;
		}

		do {
			switch (item.location) {
			case 3:
				this.Inventory.Mark(item);

				break;
			case 5:
				this.TradeScreen.Mark(item);

				break;
			case 2:
				this.Belt.Mark(item);

				break;
			case 6:
				this.Cube.Mark(item);

				break;
			case 7:
				this.Stash.Mark(item);

				break;
			}
		} while (item.getNext());

		this.dirty = false;
		this.lastReload = getTickCount();

		return true;
	};
};