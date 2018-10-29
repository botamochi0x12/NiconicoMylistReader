class Mylist {
    id: string;
    url: string;
    atom: GoogleAppsScript.XML_Service.Namespace;
    root: any;

    constructor(id: string) {
        this.id = id;
        this.url = "https://www.nicovideo.jp/mylist/" + id + "?rss=atom";
        this.atom = XmlService.getNamespace("http://www.w3.org/2005/Atom");
        this.root = this.getMylist();
    }
    getMylist() {
        var url = this.url;
        try {
            var response = UrlFetchApp.fetch(url);
            var xml = XmlService.parse(response.getContentText());
            this.root = xml.getRootElement();
        } catch (error) {
            var e = error;
            Logger.log(e);
            throw e;
        }
        return this.root;
    }
    updated() {
        return this.root.getChildText('updated', this.atom);
    }
    title() {
        return this.root.getChildText('title', this.atom);
    }
    videos() {
        var atom = this.atom;
        var root = this.root;
        var entries = root.getChildren('entry', atom);
        var infos = [];
        entries.forEach(function (aEntry) {
            var info = {};
            aEntry.getChildren().forEach(function (elem) {
                info[elem.getName()] = elem.getText();
            });
            info.link = aEntry.getChild('link', atom).getAttribute('href').getValue();
            var posOfDelimiter = info.link.lastIndexOf('/');
            info.id = info.link.slice(posOfDelimiter + 1);
            infos.push(info);
        });
        return infos;
    }
}

class VideoDetail {
    id: string;
    url: string;
    root: any;
    constructor(id) {
        this.id = id;
        this.url = "https://ext.nicovideo.jp/api/getthumbinfo/" + id;
        this.root = this.getVideo();
    }
    getVideo() {
        var url = this.url;
        try {
            try {
                var response = UrlFetchApp.fetch(url);
            } catch (error) {
                response = UrlFetchApp.fetch(url);
            }
            var xml = XmlService.parse(response.getContentText());
            this.root = xml.getRootElement();
        } catch (error) {
            var e = error;
            Logger.log(e);
            throw e;
        }
        return this.root;
    }
    getDetail() {
        var root = this.root;
        var detail = {};
        detail.status = root.getAttribute('status').getValue();
        if (detail.status == 'ok') {
            var elements = root.getChild("thumb").getChildren();
            elements.forEach(function (elem) {
                detail[elem.getName()] = elem.getText();
            });
        }
        return detail;
    }
    getTags() {
        var root = this.root;
        var tags = root.getChild("thumb").getChild('tags').getChildren('tag').map(function (t) {
            return t.getText();
        });
        return tags;
    }
}