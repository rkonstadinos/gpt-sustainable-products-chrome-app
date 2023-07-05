$(document).ready(function () {
    // Get the URL from user's browser
    var currentURL = window.location.href;

    var sustain_badge = chrome.runtime.getURL(`sustain.png`); //chrome.extension.getURL('sustain.png');
    var not_sustain_badge = chrome.runtime.getURL(`not-sustain.png`); // chrome.extension.getURL('not-sustain.png');
    var sustain_message = 'By analyzing the product description and its title, GPT model identified the sustainable attributes possessed by the product as follows: ';
    var not_sustain_message = 'Based on the estimates of the GPT model, it appears that the product does not possess any sustainable attributes.';
    var styling = '<style>.sustain-popup-image { border: 1px solid #ddd;   border-radius: 4px;   padding: 5px;   width: 80px; } .sustain-popup-message {   display: none;   position: absolute;   background-color: #f9f9f9;   width: 600px; padding: 10px;   border: 1px solid #ccc;   border-radius: 5px;   z-index: 1; } .sustain-image-container {   position: relative;   display: inline-block; } .sustain-popup-image:hover + .sustain-popup-message {   display: block; }</style>';

    // Check if the user browses the Amazon website
    if (currentURL.indexOf("amazon") !== -1) {
        var productTitle = $("#productTitle").text(); // get the productTitle
        var productDescription = $("#productDescription").text(); // get the productDescription
        var featureBullets = $("#feature-bullets").text(); // get the feature-bullets
        productDescription = productDescription + featureBullets; // merge productDescription and featureBullets
        var badgePlace = "#title"; // define the id where the response message will be shown
    } else if (currentURL.indexOf("ebay") !== -1) {
        // var productTitle = $(".x-item-title__mainTitle").text(); // get the productTitle
        // var productDescription = $("#desc_ifr span").text(); // get the productDescription
    } else if (currentURL.indexOf("aliexpress") !== -1) {
        var productTitle = $(".product-title-text").text(); // get the productTitle
        var productDescription = $(".detail-desc-decorate-richtext").text(); // get the productDescription
        var badgePlace = ".product-title"; // define the id where the response message will be shown
    }

    // check if productTitle and productDescription and badgePlace is not empty
    if (productTitle.length !== 0 && productDescription.length !== 0 && badgePlace.length !== 0) {

        console.log(productTitle);
        console.log(productDescription);

        // Send an Ajax request to a live web server
        $.ajax({
            url: 'https://kroumeliotis.pythonanywhere.com/sustain', // define the url
            type: 'POST', // define the request method as POST
            data: JSON.stringify({project: 'sustain', productTitle: productTitle, productDescription: productDescription}), // define the post data
            contentType: "application/json; charset=utf-8",
            success: function (message) { // on success
                console.log(message);
                sustain_message += '<ul>';
                for (const [key, value] of Object.entries(message.data)) {
                    sustain_message += '<li>'+key+': '+value+'</li>';
                  console.log(`${key}: ${value}`);
                }
                sustain_message += '</ul>';
                if (message.status === true) {
                    $(styling + '<div class="sustain-image-container">' +
                        '<img class="sustain-popup-image" src="' + sustain_badge + '" alt="' + sustain_message + '">' +
                        '<div class="sustain-popup-message">' + sustain_message + '</div>' +
                        '</div>').insertBefore(badgePlace);
                } else {
                    $(styling + '<div class="sustain-image-container">' +
                        '<img class="sustain-popup-image" src="' + not_sustain_badge + '" alt="' + not_sustain_message + '">' +
                        '<div class="sustain-popup-message">' + not_sustain_message + '</div>' +
                        '</div>').insertBefore(badgePlace);
                }
            }, error: function (jqXHR, textStatus, errorThrown) {
                console.log('Error:', textStatus, errorThrown);
            }
        });
    }
});