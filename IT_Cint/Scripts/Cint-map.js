var map;
var markersArray = [];

function initializeMap() {

   //var myLatlng = new google.maps.LatLng(30, 0);
    var myLatlng = new google.maps.LatLng(50, 13); // 30, 0 for zoom 1;  50, 13 for zoom 5
    var myOptions = {
        minZoom: 1, 
        maxZoom: 14,
        zoom: 5,
        draggable: true,
        disableDefaultUI: true,
        center: myLatlng,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    }
    map = new google.maps.Map(document.getElementById("map"), myOptions);

    google.maps.event.addListener(map, 'zoom_changed', function () {
        if (map.minZoom === map.zoom) {
            map.setCenter(myLatlng);
        }
    });

    // triggers the ajax loader window, more or less ready
    $("#background").bind("document ready", function () {
        $(this).fadeIn(5E3); $(this).parent().animate({ opacity: 0.5 },
    "slow", function () { })
    })
    .bind("ajaxSuccess", function () {
        $(this).fadeOut("slow");
        $(this).parent()
    .animate({ opacity: 2 }, "slow", function () { })
    });



$("#accordion li").click(function () {
    var country = $(this).text();
    country = country.replace(/\d+/g, '');
    zoomToCountry(country);
});

$("#accordion h3").click(function () {
    var continent = $(this).children().text();
    continent = continent.replace(/\d+/g, '');
    zoomToContinent(continent);
});

$("#maxZoomMap").click(function () {
    myLatlng = new google.maps.LatLng(30, 0);
    map.setZoom(1);
    map.setCenter(myLatlng);
})

}


function zoomToContinent(country) {
    var newLatLng;
    var zoom;
    if (country == "Europe") {
        newLatLng = new google.maps.LatLng(56, 18);
        zoom = 3;
    } else if (country == "North America") {
        newLatLng = new google.maps.LatLng(54, -100);
        zoom = 2;
    } else if (country == "South America") {
        newLatLng = new google.maps.LatLng(-15, -60);
        zoom = 2;
    } else if (country == "Asia-Pacific") {
        newLatLng = new google.maps.LatLng(5, 110);
        zoom = 2;
    } else if (country == "Africa") {
        newLatLng = new google.maps.LatLng(-10, 20);
        zoom = 3;
    }
    map.setCenter(newLatLng);
    map.setZoom(zoom);
}

function zoomToCountry(country) {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'address': country }, function (results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
            var ne = results[0].geometry.viewport.getNorthEast();
            var sw = results[0].geometry.viewport.getSouthWest();
            var bounds = new google.maps.LatLngBounds(sw, ne);
            map.fitBounds(bounds);

        } else {
            alert("Geocode was not successful for the following reason: " + status);
        }
    });
}

function setGender(sex) {
    var gender;
    if (sex == 1) {
        gender = "male";
    } else if (sex == 2) {
        gender = "female";
    } else if (sex == null) {
        gender = "alien";
    }
    return gender;
}

function setAge(age) {
    var respAge;
    if (age == null || age == "") {
        respAge = "";
    } else {
        respAge = age;
    }
    return respAge;
}

function setFirstName(firstName) {
    var respFirstName;
    if (firstName == null || firstName == "") {
        respFirstName = "Respondent";
    } else {
        respFirstName = firstName;
    }
    return respFirstName;
}


function getCountryCount() {
    $.get("/LiveRespondents/getCountryCount", function (data) {
        if (data && data != "") {
            $("#feedback").fadeOut(1000).removeClass('active');
            $.each(data, function (i, info) {
                $("#accordion li").text(function (y, countryName) {
                    var $this = $(this);
                    if ($this.is(":contains(" + info.country + ")")) {
                        if ($this.is(":has(span)")) {
                            var $span = $('span', this);
                            $span.text(info.count);
                        } else {
                            $this.append('<span class = "countryCount">' + info.count + '</span>');
                        }
                    }

                    countContinent($this.parent().attr('id'));
                    countWorld();
                });
            });
        } else {
            $("#accordion span").not('.ui-icon').fadeOut(5000);
            $("#worldCount").fadeOut(5000);
            $("#feedback").addClass('active').text("No respondents came online in the past 10 minutes").fadeIn(1000);
        }
    });
}

function countContinent(ulId) {
    var count = 0;
    $.each($("ul#" + ulId + " li span"), function () {
        count += Number($(this).text());
        if (count != 0) {
            $("span#s-" + ulId).text(count).fadeIn(1000);
        }
    });
}

function countWorld() {
    var count = 0;
    $.each($("#accordion li span"), function () {
        count += Number($(this).text());
        if (count != 0 || count != "") {
            $("#worldCount").text(count).fadeIn(1000);
        }
    });
}


function getRespondents() {
    var currentTime = new Date().getTime();
    var geocoder = new google.maps.Geocoder();
    var incompleteAddress = 0;

    $.ajax({
        url: "/LiveRespondents/getLiveRespondents",
        type: "GET",
        dataType: "json",
        success: function (data, textStatus, jqXHR) {
            $.each(data, function (i, respondent) {
                var loc = determineLocation(respondent);
                geocoder.geocode({ 'address': loc }, function (results, status) {
                    if (status == google.maps.GeocoderStatus.OK) {
                        setTimeout(function () {
                            var marker = new google.maps.Marker({
                                position: results[0].geometry.location,
                                map: map,
                                visible: false,
                                title: i + "",
                                icon: "http://labs.google.com/ridefinder/images/mm_20_red.png"
                            });

                            markersArray.push(marker);
                            if (map.getBounds().contains(marker.position)) {
                                marker.setMap(map);
                                marker.setVisible(true);
                                moveToZone(marker);

                                if (map.zoom >= 5) {
                                    var gender = setGender(respondent.Gender);
                                    var firstName = setFirstName(respondent.FirstName);
                                    var age = setAge(respondent.Age);
                                    var c = firstName + "," + gender + "," + age;
                                    var myOptions = {
                                        content: c,
                                        disableAutoPan: true,
                                        maxWidth: 0,
                                        pixelOffset: new google.maps.Size(-50, 2),
                                        zIndex: null,
                                        boxStyle: {
                                            background: "#D20000",
                                            color: "#fff",
                                            fontSize: "16px",
                                            fontWeight: "bold",
                                            textShadow: "1px 1px 2px #000",
                                            opacity: 0.70,
                                            zIndex: 1000 + i,
                                            minWidth: "50px",
                                            paddingLeft: "5px",
                                            "-webkit-border-radius": "5px",
                                            "-moz-border-radius": "5px",
                                            borderRadius: "5px"
                                        },
                                        closeBoxMargin: "0",
                                        closeBoxURL: "",
                                        pane: "floatPane",
                                        enableEventPropagation: false
                                    };

                                    var ib = new InfoBox(myOptions);
                                    ib.open(map, marker);

                                }

                                clearMarkers(ib);
                            }

                        }, i * 100);
                    } else if (status == google.maps.GeocoderStatus.ZERO_RESULTS) {
                        incompleteAddress++;
                        showErrorCount(incompleteAddress);
                    } else {
                        console.log("Geocode was not successful. Reason: " + status);
                    }
                });
            });
        }
    });

}

$.fn.digits = function () {
    return this.each(function () {
        $(this).text($(this).text().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
    })
}


function worldCount() {
    $.get("/LiveRespondents/getLiveRespondents", function (b) {
        var a = $("#worldNumbers span");
        a.html(b.length).digits();
        setTimeout(function () {
            worldCount()
        }, 1E4)
    })
};

function showErrorCount(incompleteAddress) {
    var ec = $("#errorCount span");
    if (incompleteAddress && incompleteAddress != "") {
        ec.text(incompleteAddress).fadeIn(100);
    } else{
        ec.text("0");
    }
}

function clearMarkers(ib) {
    if (markersArray) {
        $.each(markersArray, function (i, marker) {
            setTimeout(function () {
                marker.setMap(null);
                if (ib) {
                    ib.close(map, marker);
                }
            }, 6000);
        });        
    }
}


function moveToZone(marker) {
    google.maps.event.addListener(marker, 'click', function () {
        map.setCenter(marker.getPosition());
        map.setZoom(6);
    });
}


function determineLocation(respondent) {
    var loc;

    if (respondent.Address == null || respondent.CountryName == null) {
        if (respondent.Address == null && respondent.CountryName != null) {
            loc = respondent.CountryName + " " + respondent.PostalCode;
        }
        else if (respondent.CountryName == null && respondent.Address != null) {
            loc = respondent.Address + " " + respondent.PostalCode;
        }
        else {
            //getting geoloc by zip code only is not always generating a correct position on map! to be avoided!
            loc = respondent.PostalCode + "";
        }
    } else {
        loc = respondent.Address + " " + respondent.CountryName + " " + respondent.PostalCode;
    }

    return loc;
}


function initAccordion() {
    var target = $("#accordion");
    target.accordion({
        fillSpace: true,
        collapsible: true,
        active: false
    });

    var userCountry = $("div#userCountry").html();
    var countries = $("#accordion ul li");
    $.each(countries, function () {
        if (userCountry == $(this).text()) {
            if ($(this).parent().attr("id") == "europe") {
                target.accordion({
                    active: 0
                });
            } else if ($(this).parent().attr("id") == "northAmerica") {
                target.accordion({
                    active: 1
                });
            } else if ($(this).parent().attr("id") == "southAmerica") {
                target.accordion({
                    active: 2
                });
            } else if ($(this).parent().attr("id") == "asiaPacific") {
                target.accordion({
                    active: 3
                });
            } else if ($(this).parent().attr("id") == "africa") {
                target.accordion({
                    active: 4
                });
            }
        }
    });
}
