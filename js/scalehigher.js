/*!
 * Scale Higher Library v0.0.8
 * Copyright Scale Higher, Inc.
 *
 * Created: 2021-10-01
 * Last Updated: 2022-01-08 (12:25PT)
 * 
 * Dependencies
 * <script src='https://js.sentry-cdn.com/126d7a1b94294d22bbc88991e3fccf1d.min.js' crossorigin="anonymous" data-lazy="no"></script>
 * <script src="https://cdn.jsdelivr.net/npm/js-cookie@3.0.1/dist/js.cookie.min.js"></script>
 */

// Set Sentry context on load
if (window.Sentry) {
  Sentry.onLoad(function() {
    Sentry.setContext("character", {
      first_name: Cookies.get("user_first_name"),
      email: Cookies.get("user_email")
    });
  });
}

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

ConvertKit.prototype.subscribeSynchronously = function(form_id, email, first_name = "") {
  var post_url = "https://api.convertkit.com/v3/forms/" + form_id + "/subscribe";

  // Submitting the request syncrhonously is necessary so that the request
  // completes before the form action takes the user to a new 
  // page (and interrupts the request). But, this is bad since 
  // it blocks execution. We could implement a solution with callbacks
  // (where the callback changes the window location), but that feels 
  // like too much work right now. I'm likely going to move the ConvertKit API
  // call to the server anyway.
  $.ajax({
    type: "POST",
    url: post_url,
    data: {
      api_key: this.api_key,
      email: email,
      first_name: first_name
    },
    async: false
  });
}

ConvertKit.prototype.memberApplicationForm = function(email, first_name) {
  this.subscribeSynchronously(2642011, email, first_name);
}

ConvertKit.prototype.programsApplicationForm = function(email, first_name) {
  this.subscribeSynchronously(2756052, email, first_name);
}

ConvertKit.prototype.programsWaitlistForm = function(email, first_name) {
  this.subscribeSynchronously(2901164, email, first_name);
}

ConvertKit.prototype.communityForm = function(email, first_name) {
  this.subscribeSynchronously(2901171, email, first_name);
}

ConvertKit.prototype.listTags = function() {
  var get_url = "https://api.convertkit.com/v3/tags?api_key=" + this.api_key;

  $.get( get_url, (data) => {
    console.log(data);
  });
}

ConvertKit.prototype.subscribeToTag = function(tag_id, email, first_name = "") {
  var post_url = "https://api.convertkit.com/v3/tags/" + tag_id + "/subscribe";

  $.post( post_url, {
    api_key: this.api_key,
    email: email,
    first_name: first_name
  });  
}

ConvertKit.prototype.subscribeToCompletedMemberApplicationTag = function(email, first_name = "") {
  this.subscribeToTag(2663437, email);
}

// Process application form submission
function submitApplicationForm(applicationFormID) {
  const first_name = $("#first_name").val();
  const email = $("#email").val();
  
  // Validate email address
  if (convertkit.isEmail(email)) {
    // Submit email address to ConvertKit
    if (applicationFormID === "form#wf-form-Member-Application-Form") {
      convertkit.memberApplicationForm(email, first_name);
      window.Sentry && Sentry.captureMessage("Submitted " + first_name + "(" + email + ") to ConvertKit Member Application Form");
    } else if (applicationFormID === "form#wf-form-Programs-Application-Form") {
      convertkit.programsApplicationForm(email, first_name);
      window.Sentry && Sentry.captureMessage("Submitted " + first_name + "(" + email + ") to ConvertKit Programs Application Form");      
    } else if (applicationFormID === "form#wf-form-Programs-Waitlist-Form") {
      convertkit.programsWaitlistForm(email, first_name);
      window.Sentry && Sentry.captureMessage("Submitted " + first_name + "(" + email + ") to ConvertKit Programs Waitlist Form");      
    } else if (applicationFormID === "form#wf-form-Community-Form") {
      convertkit.communityForm(email, first_name);
      window.Sentry && Sentry.captureMessage("Submitted " + first_name + "(" + email + ") to ConvertKit Community Form");      
    }

    // Fire Facebook pixel tracking for Lead event
    window.fbq && fbq('track', 'Lead');

    // Record user info in cookies
    Cookies.set('user_first_name', first_name, { expires: 7 });
    Cookies.set('user_email', email, { expires: 7 });
  } else {
    window.Sentry && Sentry.captureMessage("Attempted to submit invalid email address: " + email);
  }
}

// Setup JS handlers
$(document).ready( () => {
  // Create ConvertKit class with API Key
  convertkit = new ConvertKit("JB7_qk7ItHuzucoVjbadgQ");

  // Register back-button click handler
  $('a.back-button').click(function() {
    history.back(1); return false;
  });

  // Pre-fill Member Application form fields from cookies
  $("form#wf-form-Member-Application-Form input[name=first_name]").val(Cookies.get("user_first_name"));
  $("form#wf-form-Member-Application-Form input[name=email]").val(Cookies.get("user_email"));

  // Pre-fill Programs Application form fields from cookies
  $("form#wf-form-Programs-Application-Form input[name=first_name]").val(Cookies.get("user_first_name"));
  $("form#wf-form-Programs-Application-Form input[name=email]").val(Cookies.get("user_email"));

  // Pre-fill Programs Waitlist form fields from cookies
  $("form#wf-form-Programs-Waitlist-Form input[name=first_name]").val(Cookies.get("user_first_name"));
  $("form#wf-form-Programs-Waitlist-Form input[name=email]").val(Cookies.get("user_email"));

  // Pre-fill Community form fields from cookies
  $("form#wf-form-Community-Form input[name=first_name]").val(Cookies.get("user_first_name"));
  $("form#wf-form-Community-Form input[name=email]").val(Cookies.get("user_email"));

  // Register Member Application Form submit handler
  $("form#wf-form-Member-Application-Form").on("submit", () => {
    submitApplicationForm("form#wf-form-Member-Application-Form");

    // const first_name = $("#first_name").val();
    // const email = $("#email").val();
    
    // // Validate email address
    // if (convertkit.isEmail(email)) {
    //   // Submit email address to ConvertKit
    //   convertkit.signUpForm(email, first_name);
    //   Sentry.captureMessage("Submitted " + first_name + "(" + email + ") to ConvertKit");

    //   // Fire Facebook pixel tracking for Lead event
    //   fbq('track', 'Lead');

    //   // Record user info in cookies
    //   Cookies.set('user_first_name', first_name, { expires: 7 });
    //   Cookies.set('user_email', email, { expires: 7 });
    // } else {
    //   Sentry.captureMessage("Attempted to submit invalid email address: " + email);
    // }
    // Execute the default submit action (GET request sent to Typeform)
    return true;
  });

  // Register Programs Application Form submit handler
  $("form#wf-form-Programs-Application-Form").on("submit", () => {
    submitApplicationForm("form#wf-form-Programs-Application-Form");

    // Execute the default submit action (GET request sent to Typeform)
    return true;
  });

  // Register Programs Waitlist Form submit handler
  $("form#wf-form-Programs-Waitlist-Form").on("submit", () => {
    submitApplicationForm("form#wf-form-Programs-Waitlist-Form");

    // Execute the default submit action (GET request sent to Typeform)
    return true;
  });


  // Register Community Form submit handler
  $("form#wf-form-Community-Form").on("submit", () => {
    submitApplicationForm("form#wf-form-Community-Form");

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

      // Add "Completed Member Application" tag in ConvertKit
      if (convertkit.isEmail(paramsEmail)) {
        convertkit.subscribeToCompletedMemberApplicationTag(paramsEmail, paramsFirstName);
      }

      // Fire Facebook pixel tracking for SubmitApplication event
      window.fbq && fbq('track', 'SubmitApplication');
    } else {
      // Redirect if params aren't set properly
      window.location = '/';
    }
  }
});