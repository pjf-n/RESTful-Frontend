// Wait for the DOM to finish loading
$( document ).ready(function() {

    // Attach event handler to the submission of any form with attribute data-rest-form
    // Calls the makeRequest method on an attempt submission
    $(document).on('submit', '[data-rest-form]', makeRequest );

    // Attach event handler to the logout button
    $(document).on('click', 'a.logout', logoutUser );

    /**
     * Makes a request to the API
     *
     * Prevents the default event action, in this case the submission of the form, as we want to carry out a custom
     * actions instead.
     * Extracts the HTTP request method from the forms data attribute data-method
     * Serializes all the forms input values and sends them with the request
     *
     * The response arrives as JSON so we need to parse it so that it is usable.
     *
     * Displays the response appropriately
     *
     * @param e the current event
     */
    function makeRequest(e) {

        // Prevents the default action
        e.preventDefault();

        // Prepare the required variables
        var form = $(this);
        var method = form.data('method');
        var controller = form.data('controller');
        if( controller == undefined ) {
            var controller = 'sms';
        }

        // Prepare the remaining variables
        var apiUrl = 'http://www.patrickneary.co/api/?controller=' + controller;
        var formData = form.serialize();
        var submitButton = $(this).find('input[type=submit]');
        var originalButtonText = submitButton.val();

        // Get the login credentials
        var token = sessionStorage.getItem('token');
        var sessionId = sessionStorage.getItem('sessionId');

        // Add the login credentials if stored
        if( token != undefined && sessionId != undefined) {
            formData = formData + '&token=' + token + '&sessionId=' + sessionId;
        }

        // Disable the submit button and set it to loading
        submitButton.attr('disabled', true).val('Loading...');

        // Make the AJAX request
        $.ajax({
            url : apiUrl,
            type : method,
            data : formData
        })

        // This is run when the request returns a response
        .done(function( json ) {

            // Parse the JSON, get the alert element from the DOM
            var data = $.parseJSON( json );
            var alert = $('.alert');

            // Set login credentials if supplied
            if( data.token != undefined && data.sessionId != undefined ) {
                sessionStorage.setItem('token', data.token);
                sessionStorage.setItem('sessionId', data.sessionId);
            }

            // Multiple messages are returned
            if( data.messages != undefined ) {

                // Get the output container and add the contents of messages to it
                var outputContainer = $('.output');
                outputContainer.html(data.messages).removeClass('hidden');
            }

            // Add the contents of the message property to the alert element, assign it's classes appropriately
            alert.html(data.message).removeClass('alert-success').removeClass('alert-danger').addClass('alert-' + data.type).removeClass('hidden');

            // Re-enable the submit button
            submitButton.attr('disabled', false).val(originalButtonText);
        });
    }

    /**
     * logs the user out
     *
     * Prevents the default action from triggering
     * Removes any output in any of the output containers
     * Clears the local storage so the user can no longer gain access
     *
     * @param e the current event
     */
    function logoutUser(e) {

        // Prevents the default action
        e.preventDefault();

        // Get the output elements
        var alert = $('.alert');
        var outputContainer = $('.output');

        // Remove the message listing
        if( outputContainer != undefined ) {
            outputContainer.html('');
        }

        // Delete the locally stored access tokens
        sessionStorage.clear();

        // Inform the user they are now logged out
        alert.html('You are now logged out.').removeClass('alert-danger').addClass('alert-success').removeClass('hidden');
    }
})