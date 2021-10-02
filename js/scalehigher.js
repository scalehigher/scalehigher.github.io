/*!
 * Scale Higher Library v0.0.2
 * Copyright Scale Higher, Inc.
 *
 * Created: 2021-10-01
 * Last Updated: 2021-10-02 (15:07PT)
 * 
 * Dependencies
 * <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>
 */

// ConvertKit API wrapper
function ConvertKit(api_key) {
  this.api_key = api_key;
}

ConvertKit.prototype.isEmail = function(str) {
  var regex = /^([a-zA-Z0-9_.+-])+\@(([a-zA-Z0-9-])+\.)+([a-zA-Z0-9]{2,4})+$/;

  return regex.test(str);
}

ConvertKit.prototype.subscribe = function(form_id, email, first_name = "") {
  var post_url = "https://api.convertkit.com/v3/forms/" + form_id + "/subscribe";

  $.post( post_url, {
    api_key: this.api_key,
    email: email,
    first_name: first_name
  });
}

ConvertKit.prototype.signUpForm = function(email, first_name) {
  this.subscribe("2642011", email, first_name);
}

// Setup JS handlers
$(document).ready( () => {
  // Create ConvertKit class with API Key
  convertkit = new ConvertKit("JB7_qk7ItHuzucoVjbadgQ");

  // Register back-button click handler
  $('a.back-button').click(function() {
    history.back(1); return false;
  });

  // Pre-fill Sign Up form fields from cookies
  $("form#wf-form-Sign-Up-Form input[name=first_name]").val(Cookies.get("member_first_name"));
  $("form#wf-form-Sign-Up-Form input[name=email]").val(Cookies.get("member_email"));

  // Register Sign Up form submit handler
  $("form#wf-form-Sign-Up-Form").on( "submit", () => {
    const first_name = $("#first_name").val();
    const email = $("#email").val();
    
      // Validate email address
      if (convertkit.isEmail(email)) {
        // Submit email address to ConvertKit
        convertkit.signUpForm(email, first_name);
        console.log("Submitted " + first_name + "(" + email + ") to ConvertKit");

        // Fire Facebook pixel tracking for Lead event
        fbq('track', 'Lead');

        // Record member info in cookies
        Cookies.set('member_first_name', first_name, { expires: 7 });
        Cookies.set('member_email', email, { expires: 7 });
      } else {
        console.log("Attempted to submit invalid email address");
      }
      // Execute the default submit action (GET request sent to Typeform)
      return true;
  });

  // Handle loading of Apply Done page
  if ($("body").hasClass("apply-done")) {
    const params = new URLSearchParams(window.location.search);
    const paramsFirstName = params.get('first_name');
    const paramsEmail = params.get('email');

    // Make sure page is being loaded with the right parameters
    if (!!paramsFirstName && !!paramsEmail) {
      // Personalize the headline
      $('h1.apply-done-message').text(paramsFirstName + ', thank you for applying!');

      // Fire Facebook pixel tracking for Lead event
      fbq('track', 'SubmitApplication');
    } else {
      window.location = '/';
    }
  }
});