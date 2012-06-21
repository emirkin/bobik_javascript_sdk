## Bobik SDK for Javascript

This is a community-supported SDK for interacting with Bobik.

### Installing

Download and include `bobik-1.0.js` (located in `release` directory) in your HTML page like so

```html
<script src="bobik-1.0.js" type="text/javascript"></script>
```


### Using
Here's a quick example to get you started.

```javascript
  var bobik = new Bobik("YOUR_AUTH_TOKEN");

  bobik.scrape({
      urls: ['amazon.com', 'zynga.com', 'http://finance.google.com/', 'http://shopping.yahoo.com'],
      queries:  ["//th", "//img/@src", "return document.title", "return $('script').length", "#logo", ".logo"]
    }, function (scraped_data) {
      if (!scraped_data) {
        console.log("Data is unavailable");
        return;
      }
      var scraped_urls = Object.keys(scraped_data);
      for (var url in scraped_urls)
        console.log("Results from " + url + ": " + scraped_data[scraped_urls[url]]);
  });
```

Full API reference is available at http://usebobik.com/sdk/javascript

### Contributing

1. Write to support@usebobik.com to become a collaborator.
2. The source code is in the `src` directory
3. Release code goes to `release`. It's the same file (or minified) but with version tacked on to the end.
4. Docs are generated using YUIDoc (http://yui.github.com/yuidoc/). Generate new docs using this command:
```
  yuidoc --config yuidoc.json -o docs --norecurse src
```

### Bugs?
Submit them here on GitHub: https://github.com/emirkin/bobik_javascript_sdk/issues