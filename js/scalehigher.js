
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

// Create ConvertKit
convertkit = new ConvertKit("JB7_qk7ItHuzucoVjbadgQ");

// Setup submit action for Sign Up form
$("form#wf-form-Sign-Up-Form").submit( () => {
	var first_name = $("#first_name").val();
	var email = $("#email").val();
	
    // Validate email address
    if (convertkit.isEmail(email)) {
      // Submit email address to ConvertKit
      convertkit.signUpForm(email, first_name);

      // Fire Facebook pixel tracking for Lead event
      fbq('track', 'Lead');
      console.log("Submitted " + first_name + "(" + email + ") to ConvertKit")
    } else {
      console.log("Attempted to submit invalid email address")
    }
    // Execute the default submit action (GET request sent to Typeform)
    return true;
});