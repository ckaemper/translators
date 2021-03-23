{
	"translatorID": "6cb757b0-ba22-4350-b43d-bb4a2690e0ee",
	"label": "Heise+",
	"creator": "Christian Kämper",
	"target": "^https?://www\\.heise\\.de/select/(ct|ix)/archiv/\\d{4}/\\d{1,2}",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-03-23 09:22:02"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 Christian Kämper

	This file is part of Zotero.

	Zotero is free software: you can redistribute it and/or modify
	it under the terms of the GNU Affero General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	Zotero is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
	GNU Affero General Public License for more details.

	You should have received a copy of the GNU Affero General Public License
	along with Zotero. If not, see <http://www.gnu.org/licenses/>.

	***** END LICENSE BLOCK *****
*/


function detectWeb(doc, url) {
	// TODO: adjust the logic here
	if (url.includes('/seite-')) {
		return "journalArticle";
	}
	else if (getSearchResults(doc, true)) {
		return "multiple";
	}
	return false;
}

function getSearchResults(doc, checkOnly) {
	var items = {};
	var found = false;
	var index = 0;
	var rows = doc.querySelectorAll('.issue__files__bibtex');
	for (let row of rows) {
		let bibtex = ZU.trimInternal(row.textContent);
		if (!bibtex) continue;
		if (checkOnly) return true;
		found = true;
		items[index] = bibtex;
		index++;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (!items) return true;
			for (var i in items) {
				let page = items[i].match(/@article\{(\d+)/)[1];
				let pageUrl = url + (url.endsWith("/") ? "" : "/") + 'seite-' + page;
				scrape(items[i], pageUrl);
			}
		});
	}
	else {
		const bibtex = (ZU.trimInternal(doc.getElementsByClassName('issue__files__bibtex')[0].textContent));
		scrape(bibtex, url);
	}
}

function scrape(bibtex, url) {
	item = new Zotero.Item("journalArticle");
	let author = bibtex.match(/author = \{(.+?)\}/);
	let title = bibtex.match(/title = \{(.+?)\}/)[1];
	let subtitle = bibtex.match(/subtitle = \{(.+?)\}/);
	let journal = bibtex.match(/journal = \{(.+?)\}/)[1];
	let volume = bibtex.match(/volume = \{(.+?)\}/)[1];
	let year = bibtex.match(/year = \{(.+?)\}/)[1];
	let pages = bibtex.match(/pages = \{(.+?)\}/)[1].replace('--', '-');
	if (author) item.creators.push(ZU.cleanAuthor(author[1], 'author', false));
	if (journal === 'iX') {
		item.title = title;
		if (subtitle) item.shortTitle = subtitle[1];
	}
	else {
		item.title = subtitle !== null ? subtitle[1] : title;
		if (subtitle) item.shortTitle = title;
	}
	item.publicationTitle = journal
	item.volume = year;
	item.issue = volume;
	item.pages = pages;
	item.url = url;

	let pdfurl = url + "/pdf";
	Zotero.debug(pdfurl);
	item.attachments.push({
		title: title,
		mimeType: "application/pdf",
		url: pdfurl
	});
	item.complete();
}
