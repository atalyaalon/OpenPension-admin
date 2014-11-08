var baseUrl = "http://admin.openpension.org.il/api/";
//var baseUrl = "http://localhost:4000/api/";

var quarter2String = {
    0: "ראשון",
    1: "שני",
    2: "שלישי",
    3: "רביעי"
};

var customizeMapping = {
    create: function(options) {
        var self = ko.mapping.fromJS(options.data);
        self.fetch = function() {
            $.getJSON(baseUrl + "funds_quarters/await_vaildation", function(data) {
                var wrappedData = { quarters: data, validatedQuarters: self.validatedQuarters };
                ko.mapping.fromJS(wrappedData, customizeMapping, self);
                $.getJSON(baseUrl + "funds_quarters/validated", function(data) {
                    var wrappedData = { quarters: self.quarters, validatedQuarters: data };
                    ko.mapping.fromJS(wrappedData, customizeMapping, self);
                });
            });
        };

        self.removeQuarter = function(data, event) {
            $.ajax({ url: baseUrl + "admin/funds_quarters/" + data.id(),
                     type: "PUT",
                     dataType: "json",
                     xhrFields: { withCredentials: true },
                     data: { status: 'missing' } })
                .done(function() {
                    self.getNext();
                })
                .fail(function() {
                    // TODO
                });
            self.fetch();
        };

        self.approveQuarter = function(data, event) {
            $.ajax({ url: baseUrl + "admin/funds_quarters/" + data.id(),
                     type: "PUT",
                     dataType: "json",
                     xhrFields: { withCredentials: true },
                     data: { status: 'validated' }})
                .done(function() {
                    self.getNext();
                })
                .fail(function() {
                    // TODO
                });
            self.fetch();
        };
        return self;
    }
};


var model = ko.mapping.fromJS({quarters: [], validatedQuarters: []}, customizeMapping);

// Load data
model.fetch();

ko.applyBindings(model);
