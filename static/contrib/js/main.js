var baseUrl = "http://localhost:4000/";

var quarter2String = {
    0: "ראשון",
    1: "שני",
    2: "שלישי",
    3: "רביעי"
};

var Model = function() {
    var self = this;

    self.name = ko.observable("");

    self.quarterId = ko.observable(-1);
    self.managingBody = ko.observable("");
    self.fund = ko.observable("");
    self.quarter = ko.observable("");

    self.url = ko.observable("");

    self.getNext= function() {
        self.url("");
        $.getJSON(baseUrl + "funds_quarters/missing/random", function(data) {
            console.log(data);
            self.quarterId(data.id);
            self.managingBody(data.managing_body_heb);
            self.fund(data.fund_name);
            self.quarter(quarter2String[data.quarter] + " " + data.year);
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
