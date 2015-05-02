(function(mw, $){
  $(function(){
    // Check if we should try to load Wiki Labels
    if($('#wikilabels-home').length){
      mw.loader.using(
        ['oojs', 'oojs-ui', 'json', 'mediawiki.action.history.diff'],
        function(){
          mw.loader.load( '//localhost:8080/labels/gadget/WikiLabels.css', 'text/css' );
          $.getScript(
            "//localhost:8080/labels/gadget/WikiLabels.js",
            function(){
              wikiLabels.config.update( {
                serverRoot: "//localhost:8080/labels"
              } );
              wikiLabels.home = new wikiLabels.Home($('#wikilabels-home'));
            }
          );
        }
      );
    }
  });
}(mediaWiki, jQuery));
