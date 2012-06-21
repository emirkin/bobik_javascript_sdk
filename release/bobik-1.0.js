/**
Copyright (c) 2012 Bobik Inc
Version: 1.0
Licensed under the MIT license:
http://www.opensource.org/licenses/mit-license.php

Download this SDK from: <a href="http://usebobik.com/sdk">http://usebobik.com/sdk</a>

Javascript client library for interacting with Bobik REST API

    var bobik = new Bobik("YOUR_AUTH_TOKEN");
    bobik.scrape({
        urls: ['amazon.com', 'zynga.com', 'http://finance.google.com/', 'http://shopping.yahoo.com'],
        queries:  ["//th", "//img/@src", "return document.title", "return $('script').length", "#logo", ".logo"]
      }, function (scraped_data) {
        if (!scraped_data) {
          console.log("Data is unavailable");
          return;
        }
        for (var url in scraped_data)
          console.log("Results from " + url + ": " + scraped_data[url]);
    });

Bobik Javascript API is designed for asynchronous use, which provides better user experience and performance.
If you use Bobik on server side, you can either make use of the `callback` paramer in the JSON request 
or build a synchronous wrapper similar to this SDK, which is fairly straightforward.

@class Bobik
@constructor
@example
    var bobik_client = new Bobik("XXX", 60000, true);
Note that you don't need to pass 'auth_token' with every request if you use the Bobik object.
@param {String} auth_token Authorization token
@param {Integer} timeout_ms How long to wait for the scraping job to complete (default is 30000 ms)
@param {Boolean} disable_debug_mode If set, disables debug messages that SDK prints into the console
**/
var Bobik = function Bobik(auth_token, timeout_ms, disable_debug_mode) {
  /**
  Authorization token
  
  @property auth_token
  @type {String}
  */
  this.auth_token = auth_token;

  /**
  How long to wait for the scraping job to complete (default is 30000 ms)
  
  @property timeout_ms
  @type {String}
  @default 30000
  */
  this.timeout_ms = timeout_ms ? timeout_ms : 30000;

  /**
  Controls whether debug messages are printed to the console
  
  @property debug
  @type {Boolean}
  @default true
  */
  this.debug = !disable_debug_mode;
}


Bobik.prototype = {

  /**
  Scrapes a list of urls using the given queries and makes a callback upon success

  @method scrape
  @param {Object} request The JSON request object (see <a href="http://usebobik.com/api/docs">API Docs</a> for details)
  @param {Function} handler An asynchronous callback to receive the scraped data (`function(data)`)
  **/
  scrape: function (request, handler) {
    var obj_ref = this;
    this.call_api('post', request, function (job) {
      if (job.errors)
        obj_ref.log(job.errors);
      else
        if (handler)
          obj_ref.wait_and_check(job['job'], handler);
        else
          obj_ref.log(job);
    });
  },
  

  /**
  Called whenever progress information is available.
  Feel free to override this function (e.g. `bobik_client.progress = my_custom_func`)

  @method progress
  @param {String} job_id Job id
  @param {Function} current_progress A value between 0 and 1 that indicates the job's progress
  **/
  progress: function(job_id, current_progress) {
    if (this.debug)
      this.log("Current progress for job " + job_id + ": " + (current_progress*100) + "%");
  },


  /**
  Call this function to wait for a job to complete

  @method wait_and_check
  @protected
  @param {String} job_id Job id
  @param {Function} on_finished_callback Function to be called upon expiration of `timeout_ms` or when results are ready
  **/
  wait_and_check: function (job_id, on_finished_callback, current_wait_time) {
    var obj_ref = this;
    this.call_api('get', {
      job:        job_id
    }, function(status) {
      var current_progress = parseFloat(status['progress']);
      obj_ref.progress(job_id, current_progress);
      if (current_progress == 1.0 || current_wait_time >= obj_ref.timeout_ms) {
        on_finished_callback( status['results'] );
      }
      else {
        if (status['estimated_time_left_ms'] == null) {
          obj_ref.log("Error! " + status.error)
          return;
        }
        var ask_again_in_ms = parseFloat(status['estimated_time_left_ms'])
        setTimeout(function() {
          if (current_wait_time == null)
            current_wait_time = 0;
          obj_ref.wait_and_check(job_id, on_finished_callback, current_wait_time + ask_again_in_ms)
        }, ask_again_in_ms);
      }
    })
  },


  /**
  The base function for all Bobik-related AJAX requests

  @method call_api
  @param {String} http_method post/get
  @param {Object} data The JSON request object (see <a href="http://usebobik.com/api/docs">API Docs</a> for details)
  @param {Function} on_success A handler function for receiving data (`function(data)`). Default handler just prints data to the console.
  @param {Function} on_error A handler function for errors (`function(error)`).  Default handler just prints data to the console.
  **/
  call_api: function(http_method, data, on_success, on_error) {
    if (!data.auth_token)
      data.auth_token = this.auth_token;
    var obj_ref = this;
    var default_handler = function(data) {
      obj_ref.log(data);
    };
    var current_success_handler = on_success ? on_success : default_handler;
    var current_error_handler = on_error ? on_error : default_handler;
    $.ajax({
      url: "https://usebobik.com/api/v1/jobs",
      type: http_method,
      data: data,
      dataType: 'json',
      crossDomain: true, // Bobik servers support CORS (http://en.wikipedia.org/wiki/Cross-Origin_Resource_Sharing)

      beforeSend: function (xhr){
        xhr.setRequestHeader("Accept", "application/json")
      },

      success: function(data, textStatus, jqXHR) {
        current_success_handler(data)
      },

      error: function(jqXHR, textStatus, errorThrown) {
        current_error_handler(errorThrown.toString())
      }
    });
  },
  
  
  /**
  A simple function that logs all progress messages
  Feel free to override this function (e.g. `bobik_client.log = my_custom_logger_func`)

  @method log
  @param {Object} data Any data that you want to log
  **/
  log: function(data) {
    if (this.debug)
      console.log(data);
  }

};
