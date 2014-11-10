var baseUrl = "http://admin.openpension.org.il/api/";

var quarter2String = {
    0: "ראשון",
    1: "שני",
    2: "שלישי",
    3: "רביעי"
};

var Model = function() {
    var self = this;

    self.status = ko.observable("");

    var userNameCookieVal = Cookies.get("user_name");
    self.name = ko.observable(userNameCookieVal !== undefined ? userNameCookieVal : "");

    self.quarterId = ko.observable(-1);
    self.managingBody = ko.observable("");
    self.fund = ko.observable("");
    self.fund_id = ko.observable(0);
    self.fundUrl = ko.observable("");
    self.quarter = ko.observable("");

    self.url = ko.observable("");

    self.name.subscribe(function(newValue) {
        Cookies.set('user_name', newValue);
    });

    self.getNext= function() {
        self.url("");
        $.getJSON(baseUrl + "funds_quarters/missing/random?managing_body_heb=" + self.managingBody() + "&fund_id=" + self.fund_id() + "&user=" + self.name(), function(data) {
            console.log(data);

            var status = "בנתיים אספת " + data.userCount + " קבצי קופות, נותרו עוד " + data.count + " קבצי קופות" + (self.managingBody() !== "" ? (" עבור " + self.managingBody()) : "") + ".";
            self.quarterId(data.id);
            self.managingBody(data.managing_body_heb);
            self.fund(data.fund_name);
            self.fund_id(data.fund_id);
            self.fundUrl(data.fund_url);
            self.quarter(quarter2String[data.quarter] + " " + data.year);

            self.status(status);
        });
    };

    self.sendQuarter = function() {
        $.ajax({ url: baseUrl + "funds_quarters/" + self.quarterId(),
                 type: "PUT",
                 dataType: "json",
                 data: { name: self.name(),
                         url: self.url() }})
            .done(function() {
                self.getNext();
            })
            .fail(function() {
                // TODO
            });
    };

};

var model = new Model();

// Load first
model.getNext();

ko.applyBindings(model);
