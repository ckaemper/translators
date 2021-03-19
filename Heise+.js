{
	"translatorID": "6cb757b0-ba22-4350-b43d-bb4a2690e0ee",
	"label": "Heise+",
	"creator": "Christian Kämper",
	"target": "^https?://www\\.heise\\.de/select/(ct|ix)/archiv/\\d{4}/\\d{1,2}/",
	"minVersion": "3.0",
	"maxVersion": "",
	"priority": 100,
	"inRepository": true,
	"translatorType": 4,
	"browserSupport": "gcsibv",
	"lastUpdated": "2021-03-19 09:52:52"
}

/*
	***** BEGIN LICENSE BLOCK *****

	Copyright © 2020 YOUR_NAME <- TODO
	
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
	// TODO: adjust the CSS selector
	var rows = doc.querySelectorAll('h2>a.title[href*="/article/"]');
	for (let row of rows) {
		// TODO: check and maybe adjust
		let href = row.href;
		// TODO: check and maybe adjust
		let title = ZU.trimInternal(row.textContent);
		if (!href || !title) continue;
		if (checkOnly) return true;
		found = true;
		items[href] = title;
	}
	return found ? items : false;
}

function doWeb(doc, url) {
	if (detectWeb(doc, url) == "multiple") {
		Zotero.selectItems(getSearchResults(doc, false), function (items) {
			if (items) ZU.processDocuments(Object.keys(items), scrape);
		});
	}
	else {
		scrape(doc, url);
	}
}

function scrape(doc, url) {
	item = new Zotero.Item("journalArticle");
	const bibtex = (ZU.trimInternal(doc.getElementsByClassName('issue__files__bibtex')[0].value));
	var author = bibtex.match(/author = \{(.+?)\}/)[1];
	var title = bibtex.match(/title = \{(.+?)\}/)[1];
	var subtitle = bibtex.match(/subtitle = \{(.+?)\}/)[1];
	var journal = bibtex.match(/journal = \{(.+?)\}/)[1];
	var volume = bibtex.match(/volume = \{(.+?)\}/)[1];
	var year = bibtex.match(/year = \{(.+?)\}/)[1];
	var pages = bibtex.match(/pages = \{(.+?)\}/)[1];
	item.creators.push(ZU.cleanAuthor(author, 'Author', false));
	item.title = subtitle;
	item.shortTitle = title;
	item.publicationTitle = journal
	item.volume = year;
	item.issue = volume;
	item.pages = pages;
	item.url = url;

	var pdfurl = url + "/pdf";
	item.attachments.push({
	title:title,
	filename:title + " - " + subtitle + " - " + author,
	mimeType:"application/pdf",
	url:pdfurl
	});
	item.complete();
}
